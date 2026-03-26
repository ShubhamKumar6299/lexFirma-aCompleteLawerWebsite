import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import { FaArrowLeft, FaVideo, FaPhone, FaExternalLinkAlt, FaClock } from 'react-icons/fa';
import './JoinMeeting.css';

const BACKEND_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';

interface Meeting {
  _id: string;
  meetingType: 'video' | 'audio';
  scheduledAt: string;
  duration: number;
  agenda?: string;
  meetingLink: string;
  status: string;
  lawyerId: {
    userId: { name: string; avatar?: string };
    specializations: string[];
  };
}

const JoinMeeting: React.FC = () => {
  const { meetingId } = useParams<{ meetingId: string }>();
  const navigate = useNavigate();
  const { token, user } = useAuth();
  const [meeting, setMeeting] = useState<Meeting | null>(null);
  const [loading, setLoading] = useState(true);
  const [joined, setJoined] = useState(false);

  useEffect(() => {
    if (!meetingId || !token) return;
    const endpoint = user?.role === 'lawyer'
      ? `${BACKEND_URL}/api/meetings/lawyer`
      : `${BACKEND_URL}/api/meetings`;

    axios.get(endpoint, { headers: { Authorization: `Bearer ${token}` } })
      .then(res => {
        const all: Meeting[] = res.data.meetings;
        const found = all.find(m => m._id === meetingId);
        if (found) setMeeting(found);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [meetingId, token, user]);

  const formatDate = (d: string) =>
    new Date(d).toLocaleString('en-IN', {
      weekday: 'long', day: 'numeric', month: 'long',
      hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Kolkata',
    });

  if (loading) return <div className="page join-loading"><div className="spinner" /></div>;
  if (!meeting) return (
    <div className="page join-notfound">
      <h2>Meeting not found</h2>
      <button className="btn btn-primary" onClick={() => navigate(-1)}>Go Back</button>
    </div>
  );

  const lawyerName = meeting.lawyerId?.userId?.name || 'Your Lawyer';

  return (
    <div className="joinmeeting-page page">
      <div className="container">
        <button className="btn btn-ghost btn-sm mb-6" onClick={() => navigate(-1)}>
          <FaArrowLeft /> Back
        </button>

        {!joined ? (
          <div className="joinmeeting-lobby">
            <div className="joinmeeting-icon">
              {meeting.meetingType === 'video' ? <FaVideo /> : <FaPhone />}
            </div>
            <h1>{meeting.meetingType === 'video' ? 'Video' : 'Audio'} Consultation</h1>
            <p className="joinmeeting-with">with <strong>Adv. {lawyerName}</strong></p>

            <div className="joinmeeting-details card">
              <div className="joinmeeting-detail-row">
                <FaClock className="text-accent" />
                <span>{formatDate(meeting.scheduledAt)} IST</span>
              </div>
              <div className="joinmeeting-detail-row">
                <span className="label">Duration</span>
                <span>{meeting.duration} minutes</span>
              </div>
              {meeting.agenda && (
                <div className="joinmeeting-detail-row">
                  <span className="label">Agenda</span>
                  <span>{meeting.agenda}</span>
                </div>
              )}
              <div className="joinmeeting-detail-row">
                <span className="label">Status</span>
                <span className={`badge badge-${meeting.status}`}>{meeting.status}</span>
              </div>
            </div>

            <div className="joinmeeting-tip">
              <p>💡 This meeting uses <strong>Jitsi Meet</strong> — no download or account required. Your browser will handle everything.</p>
            </div>

            <div className="joinmeeting-actions">
              <button
                className="btn btn-primary btn-xl"
                onClick={() => setJoined(true)}
              >
                {meeting.meetingType === 'video' ? <FaVideo /> : <FaPhone />}
                Join Meeting Now
              </button>
              <a
                href={meeting.meetingLink}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-ghost"
              >
                <FaExternalLinkAlt />
                Open in New Tab
              </a>
            </div>
          </div>
        ) : (
          <div className="joinmeeting-frame-wrap">
            <div className="joinmeeting-frame-header">
              <span>🎥 Live: Adv. {lawyerName}</span>
              <button className="btn btn-ghost btn-sm" onClick={() => setJoined(false)}>
                Leave Meeting
              </button>
            </div>
            <iframe
              src={meeting.meetingLink}
              className="jitsi-frame"
              allow="camera; microphone; fullscreen; display-capture; autoplay"
              title="Jitsi Meeting"
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default JoinMeeting;
