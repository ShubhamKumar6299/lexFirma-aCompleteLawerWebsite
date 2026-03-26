import { Request, Response, NextFunction } from 'express';
import Message from '../models/Message';
import Lawyer from '../models/Lawyer';
import User from '../models/User';
import nodemailer from 'nodemailer';

const createTransporter = () => nodemailer.createTransport({
  host: process.env.MAIL_HOST || 'smtp.gmail.com',
  port: Number(process.env.MAIL_PORT) || 587,
  secure: false,
  auth: { user: process.env.MAIL_USER, pass: process.env.MAIL_PASS },
});

// POST /api/messages — send message to lawyer
export const sendMessage = async (req: Request & { user?: any }, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { lawyerId, subject, body, senderName, senderEmail } = req.body;

    const lawyer = await Lawyer.findById(lawyerId).populate<{ userId: { email: string; name: string } }>('userId', 'email name');
    if (!lawyer) {
      res.status(404).json({ success: false, message: 'Lawyer not found' });
      return;
    }

    const message = await Message.create({
      lawyerId,
      userId: req.user?._id,
      senderName,
      senderEmail,
      subject,
      body,
    });

    // Send email to lawyer
    if (process.env.MAIL_USER && process.env.MAIL_PASS) {
      const transporter = createTransporter();
      await transporter.sendMail({
        from: `"LawFirm Portal" <${process.env.MAIL_USER}>`,
        to: (lawyer.userId as any).email,
        subject: `New Message: ${subject}`,
        html: `
          <div style="font-family:sans-serif;max-width:600px;margin:0 auto">
            <h2 style="color:#1e40af">New Message from ${senderName}</h2>
            <p><strong>From:</strong> ${senderName} (${senderEmail})</p>
            <p><strong>Subject:</strong> ${subject}</p>
            <hr/>
            <div style="background:#f3f4f6;padding:16px;border-radius:8px">
              <p>${body}</p>
            </div>
            <p style="color:#6b7280;font-size:12px;margin-top:16px">Reply directly to ${senderEmail}</p>
          </div>
        `,
        replyTo: senderEmail,
      });
    }

    res.status(201).json({ success: true, message: 'Message sent successfully', data: message });
  } catch (err) {
    next(err);
  }
};

// GET /api/messages — get lawyer's inbox
export const getMyMessages = async (req: Request & { user?: any }, res: Response, next: NextFunction): Promise<void> => {
  try {
    const lawyer = await Lawyer.findOne({ userId: req.user._id });
    if (!lawyer) {
      res.status(404).json({ success: false, message: 'Lawyer profile not found' });
      return;
    }

    const messages = await Message.find({ lawyerId: lawyer._id })
      .sort({ createdAt: -1 })
      .populate('userId', 'name email avatar');

    res.json({ success: true, messages });
  } catch (err) {
    next(err);
  }
};

// PUT /api/messages/:id/read
export const markAsRead = async (req: Request & { user?: any }, res: Response, next: NextFunction): Promise<void> => {
  try {
    const lawyer = await Lawyer.findOne({ userId: req.user._id });
    if (!lawyer) {
      res.status(404).json({ success: false, message: 'Lawyer profile not found' });
      return;
    }

    await Message.findOneAndUpdate({ _id: req.params.id, lawyerId: lawyer._id }, { isRead: true });
    res.json({ success: true, message: 'Marked as read' });
  } catch (err) {
    next(err);
  }
};
