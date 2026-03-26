import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { lawyerAPI, meetingAPI } from '../../services/api';
import type { Lawyer } from '../../types';
import toast from 'react-hot-toast';
import { FaVideo, FaPhone, FaArrowLeft, FaClock } from 'react-icons/fa';
import './ScheduleMeeting.css';

const ScheduleMeeting: React.FC = () => {
  const { lawyerId } = useParams<{ lawyerId: string }>();
  const navigate = useNavigate();
  const [lawyer, setLawyer] = useState<Lawyer | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    meetingType: 'video' as 'video' | 'audio',
    scheduledAt: '',
    duration: 30,
    agenda: '',
  });

  useEffect(() => {
    if (!lawyerId) return;
    lawyerAPI.getById(lawyerId).then(res => { setLawyer(res.data.lawyer); setLoading(false); }).catch(() => navigate('/lawyers'));
  }, [lawyerId, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lawyerId) return;
    setSubmitting(true);
    try {
      const res = await meetingAPI.schedule({ lawyerId, ...form });
      toast.success('Meeting scheduled! Link: ' + res.data.meeting.meetingLink);
      navigate('/lawyers');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to schedule meeting');
    } finally { setSubmitting(false); }
  };

  if (loading) return <div className="loading-center" style={{ paddingTop: 130 }}><div className="spinner" /></div>;
  if (!lawyer) return null;

  const minDate = new Date();
  minDate.setDate(minDate.getDate() + 1);
  const minDateStr = minDate.toISOString().slice(0, 16);

  return (
    <div className="schedule-page page">
      <div className="container" style={{ maxWidth: 640 }}>
        <button className="btn btn-ghost btn-sm" style={{ marginBottom: 20 }} onClick={() => navigate(-1)}><FaArrowLeft /> Back</button>
        <div className="schedule-card card">
          <div className="schedule-lawyer-info">
            <div className="sched-avatar">{lawyer.userId?.name?.[0] || 'L'}</div>
            <div>
              <h2>Schedule with {lawyer.userId?.name}</h2>
              <p className="sched-subtitle">{lawyer.specializations.slice(0,2).join(', ')} • {lawyer.city}</p>
              <p className="sched-fee">Consultation: ₹{lawyer.consultationFee.toLocaleString()}</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="schedule-form">
            {/* Meeting Type */}
            <div className="form-group">
              <label className="form-label">Meeting Type *</label>
              <div className="meeting-type-options">
                {(['video', 'audio'] as const).map(type => (
                  <button
                    key={type}
                    type="button"
                    className={`type-option ${form.meetingType === type ? 'selected' : ''}`}
                    onClick={() => setForm(p => ({ ...p, meetingType: type }))}
                  >
                    {type === 'video' ? <FaVideo /> : <FaPhone />}
                    {type === 'video' ? 'Video Call' : 'Audio Call'}
                  </button>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Date & Time *</label>
              <input
                type="datetime-local"
                className="form-input"
                required
                min={minDateStr}
                value={form.scheduledAt}
                onChange={e => setForm(p => ({ ...p, scheduledAt: e.target.value }))}
              />
            </div>

            <div className="form-group">
              <label className="form-label"><FaClock /> Duration</label>
              <select className="form-select" value={form.duration} onChange={e => setForm(p => ({ ...p, duration: Number(e.target.value) }))}>
                <option value={15}>15 minutes</option>
                <option value={30}>30 minutes</option>
                <option value={45}>45 minutes</option>
                <option value={60}>1 hour</option>
                <option value={90}>1.5 hours</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Agenda / Purpose (optional)</label>
              <textarea
                className="form-textarea"
                value={form.agenda}
                onChange={e => setForm(p => ({ ...p, agenda: e.target.value }))}
                placeholder="Brief description of why you need legal consultation..."
                rows={3}
              />
            </div>

            <div className="schedule-info-box">
              <p>🔒 A secure meeting link will be generated instantly after booking.</p>
              <p>📧 Confirmation will be sent to both parties.</p>
            </div>

            <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%', justifyContent: 'center' }} disabled={submitting}>
              {submitting ? 'Scheduling...' : '✓ Confirm Meeting'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ScheduleMeeting;
