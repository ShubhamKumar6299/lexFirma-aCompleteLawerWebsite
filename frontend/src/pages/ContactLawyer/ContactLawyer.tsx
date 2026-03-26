import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { lawyerAPI, messageAPI } from '../../services/api';
import type { Lawyer } from '../../types';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import { FaEnvelope, FaArrowLeft, FaPaperPlane } from 'react-icons/fa';
import './ContactLawyer.css';

const ContactLawyer: React.FC = () => {
  const { lawyerId } = useParams<{ lawyerId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [lawyer, setLawyer] = useState<Lawyer | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const [form, setForm] = useState({
    senderName: user?.name || '',
    senderEmail: user?.email || '',
    subject: '',
    body: '',
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
      await messageAPI.send({ lawyerId, ...form });
      toast.success('Message sent! The lawyer will respond via email.');
      setSent(true);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to send message');
    } finally { setSubmitting(false); }
  };

  if (loading) return <div className="loading-center" style={{ paddingTop: 130 }}><div className="spinner" /></div>;
  if (!lawyer) return null;

  const initials = lawyer.userId?.name?.split(' ').map(n => n[0]).join('').slice(0,2).toUpperCase() || 'LA';

  return (
    <div className="contact-page page">
      <div className="container" style={{ maxWidth: 640 }}>
        <button className="btn btn-ghost btn-sm" style={{ marginBottom: 20 }} onClick={() => navigate(-1)}><FaArrowLeft /> Back</button>

        {sent ? (
          <div className="sent-success card">
            <div className="sent-icon">✅</div>
            <h2>Message Sent!</h2>
            <p>Your message has been delivered to <strong>{lawyer.userId?.name}</strong>. They will reply directly to your email address.</p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
              <button className="btn btn-primary" onClick={() => setSent(false)}>Send Another</button>
              <button className="btn btn-ghost" onClick={() => navigate(`/lawyers/${lawyerId}`)}>Back to Profile</button>
            </div>
          </div>
        ) : (
          <div className="contact-card card">
            <div className="contact-lawyer-info">
              <div className="contact-avatar">{initials}</div>
              <div>
                <h2>Contact {lawyer.userId?.name}</h2>
                <p className="contact-subtitle">{lawyer.specializations.slice(0,2).join(', ')} • {lawyer.city}</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="contact-form">
              <div className="grid-2-col">
                <div className="form-group">
                  <label className="form-label">Your Name *</label>
                  <input className="form-input" required value={form.senderName} onChange={e => setForm(p => ({ ...p, senderName: e.target.value }))} placeholder="Full name" />
                </div>
                <div className="form-group">
                  <label className="form-label">Your Email *</label>
                  <input type="email" className="form-input" required value={form.senderEmail} onChange={e => setForm(p => ({ ...p, senderEmail: e.target.value }))} placeholder="email@example.com" />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Subject *</label>
                <input className="form-input" required value={form.subject} onChange={e => setForm(p => ({ ...p, subject: e.target.value }))} placeholder="Legal inquiry regarding..." />
              </div>
              <div className="form-group">
                <label className="form-label">Message *</label>
                <textarea className="form-textarea" required value={form.body} onChange={e => setForm(p => ({ ...p, body: e.target.value }))} placeholder="Describe your legal situation in detail..." rows={6} />
              </div>
              <div className="contact-privacy">
                <FaEnvelope /> The lawyer will receive your message via email and can respond directly.
              </div>
              <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%', justifyContent: 'center' }} disabled={submitting}>
                <FaPaperPlane /> {submitting ? 'Sending...' : 'Send Message'}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default ContactLawyer;
