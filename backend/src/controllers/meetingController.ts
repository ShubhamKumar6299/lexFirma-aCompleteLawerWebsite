import { Request, Response, NextFunction } from 'express';
import Meeting from '../models/Meeting';
import Lawyer from '../models/Lawyer';
import User from '../models/User';
import nodemailer from 'nodemailer';
import { v4 as uuidv4 } from 'uuid';

const createTransporter = () =>
  nodemailer.createTransport({
    host: process.env.MAIL_HOST || 'smtp.gmail.com',
    port: Number(process.env.MAIL_PORT) || 587,
    secure: false,
    auth: { user: process.env.MAIL_USER, pass: process.env.MAIL_PASS },
  });

/** Generate a real Jitsi Meet room URL — no API key required */
const generateMeetingLink = (): string => {
  const roomId = `lexfirma-${uuidv4().slice(0, 12)}`;
  return `https://meet.jit.si/${roomId}`;
};

const sendMeetingConfirmationEmail = async (
  toEmail: string,
  toName: string,
  otherPartyName: string,
  meetingType: string,
  scheduledAt: Date,
  meetingLink: string
) => {
  if (!process.env.MAIL_USER || !process.env.MAIL_PASS) return;

  const formattedTime = scheduledAt.toLocaleString('en-IN', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
    hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Kolkata',
  });

  const transporter = createTransporter();
  await transporter.sendMail({
    from: `"LexFirma Platform" <${process.env.MAIL_USER}>`,
    to: toEmail,
    subject: `✅ Meeting Confirmed — ${formattedTime}`,
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto;background:#0f172a;color:#e2e8f0;border-radius:12px;overflow:hidden">
        <div style="background:linear-gradient(135deg,#1e3a8a,#1e40af);padding:28px 32px">
          <h2 style="margin:0;color:#fff;font-size:22px">⚖️ LexFirma — Meeting Confirmed</h2>
        </div>
        <div style="padding:28px 32px">
          <p>Hi <strong>${toName}</strong>,</p>
          <p>Your ${meetingType} consultation with <strong>${otherPartyName}</strong> has been scheduled.</p>
          <table style="width:100%;border-collapse:collapse;margin:20px 0">
            <tr><td style="padding:8px;color:#94a3b8">📅 Date &amp; Time</td><td style="padding:8px;font-weight:600">${formattedTime} IST</td></tr>
            <tr><td style="padding:8px;color:#94a3b8">📹 Type</td><td style="padding:8px;font-weight:600;text-transform:capitalize">${meetingType} Call</td></tr>
          </table>
          <div style="text-align:center;margin:28px 0">
            <a href="${meetingLink}" style="background:#d4a017;color:#111;font-weight:700;padding:14px 32px;border-radius:8px;text-decoration:none;font-size:16px">
              🔗 Join Meeting
            </a>
          </div>
          <p style="color:#64748b;font-size:13px">The meeting room will be active 5 minutes before the scheduled time. No download required.</p>
          <hr style="border-color:#1e293b;margin:20px 0"/>
          <p style="color:#64748b;font-size:12px">Powered by LexFirma · India's Premier Legal Platform</p>
        </div>
      </div>
    `,
  });
};

// POST /api/meetings
export const scheduleMeeting = async (
  req: Request & { user?: any },
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { lawyerId, meetingType, scheduledAt, duration, agenda } = req.body;

    const lawyer = await Lawyer.findById(lawyerId).populate<{ userId: { email: string; name: string } }>('userId', 'email name');
    if (!lawyer) {
      res.status(404).json({ success: false, message: 'Lawyer not found' });
      return;
    }

    if (!lawyer.isAvailable) {
      res.status(400).json({ success: false, message: 'Lawyer is currently unavailable' });
      return;
    }

    // Generate a real Jitsi Meet link
    const meetingLink = generateMeetingLink();

    const meeting = await Meeting.create({
      lawyerId,
      userId: req.user._id,
      meetingType,
      scheduledAt: new Date(scheduledAt),
      duration: duration || 30,
      agenda,
      meetingLink,
      status: 'confirmed',
    });

    // Fetch the requesting user's details for the email
    const user = await User.findById(req.user._id).select('name email');
    const scheduledDate = new Date(scheduledAt);
    const lawyerUser = lawyer.userId as { email: string; name: string };

    // Send confirmation emails to both parties (non-blocking)
    Promise.all([
      sendMeetingConfirmationEmail(
        user?.email || '',
        user?.name || 'Client',
        `Adv. ${lawyerUser.name}`,
        meetingType,
        scheduledDate,
        meetingLink
      ),
      sendMeetingConfirmationEmail(
        lawyerUser.email,
        `Adv. ${lawyerUser.name}`,
        user?.name || 'Client',
        meetingType,
        scheduledDate,
        meetingLink
      ),
    ]).catch(err => console.error('Email send failed (non-fatal):', err));

    res.status(201).json({ success: true, meeting });
  } catch (err) {
    next(err);
  }
};

// GET /api/meetings — get user's meetings
export const getMyMeetings = async (
  req: Request & { user?: any },
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const meetings = await Meeting.find({ userId: req.user._id })
      .populate({ path: 'lawyerId', populate: { path: 'userId', select: 'name avatar' } })
      .sort({ scheduledAt: 1 });
    res.json({ success: true, meetings });
  } catch (err) {
    next(err);
  }
};

// GET /api/meetings/lawyer — get lawyer's meetings
export const getLawyerMeetings = async (
  req: Request & { user?: any },
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const lawyer = await Lawyer.findOne({ userId: req.user._id });
    if (!lawyer) {
      res.status(404).json({ success: false, message: 'Lawyer profile not found' });
      return;
    }

    const meetings = await Meeting.find({ lawyerId: lawyer._id })
      .populate('userId', 'name email avatar phone')
      .sort({ scheduledAt: 1 });
    res.json({ success: true, meetings });
  } catch (err) {
    next(err);
  }
};

// PUT /api/meetings/:id/status
export const updateMeetingStatus = async (
  req: Request & { user?: any },
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { status } = req.body;
    const meeting = await Meeting.findById(req.params.id);
    if (!meeting) {
      res.status(404).json({ success: false, message: 'Meeting not found' });
      return;
    }

    meeting.status = status;
    if (req.body.notes) meeting.notes = req.body.notes;
    await meeting.save();

    res.json({ success: true, meeting });
  } catch (err) {
    next(err);
  }
};
