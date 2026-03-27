import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { caseAPI, meetingAPI, messageAPI, chatAPI } from '../../services/api';
import type { Case, Meeting } from '../../types';
import toast from 'react-hot-toast';
import { FaEye, FaEyeSlash, FaPlus, FaTrash, FaEnvelope, FaVideo, FaPhone, FaBriefcase, FaEdit, FaComments } from 'react-icons/fa';
import AvatarUpload from '../../components/AvatarUpload/AvatarUpload';
import './LawyerDashboard.css';

const STATUS_OPTIONS = ['Pending', 'Active', 'Resolved', 'Dismissed', 'On Hold'];
const CASE_TYPES = ['Criminal Law','Family Law','Civil Law','Corporate Law','Property & Real Estate','Cyber Law','Labour Law','Taxation','Intellectual Property','Immigration','Child Custody','Divorce','Consumer Law','Constitutional Law','Other'];

const LawyerDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [cases, setCases] = useState<Case[]>([]);
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [chatRooms, setChatRooms] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'cases' | 'meetings' | 'messages' | 'chats'>('cases');
  const [loading, setLoading] = useState(true);
  const [showAddCase, setShowAddCase] = useState(false);
  const [newCase, setNewCase] = useState({ title: '', clientName: '', caseType: '', court: '', description: '', filedDate: '', status: 'Pending', isPublic: false });

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [caseRes, meetRes, msgRes, chatRes] = await Promise.all([
          caseAPI.getMyCases(),
          meetingAPI.getLawyerMeetings(),
          messageAPI.getInbox(),
          chatAPI.getRooms().catch(() => ({ data: { rooms: [] } })),
        ]);
        setCases(caseRes.data.cases);
        setMeetings(meetRes.data.meetings);
        setMessages(msgRes.data.messages);
        setChatRooms(chatRes.data.rooms || []);
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    loadData();
  }, []);

  const toggleVisibility = async (id: string) => {
    try {
      const res = await caseAPI.toggleVisibility(id);
      setCases(prev => prev.map(c => c._id === id ? { ...c, isPublic: res.data.isPublic } : c));
      toast.success(res.data.message);
    } catch { toast.error('Failed to toggle visibility'); }
  };

  const deleteCase = async (id: string) => {
    if (!window.confirm('Delete this case?')) return;
    try {
      await caseAPI.delete(id);
      setCases(prev => prev.filter(c => c._id !== id));
      toast.success('Case deleted');
    } catch { toast.error('Failed to delete case'); }
  };

  const addCase = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await caseAPI.create(newCase);
      setCases(prev => [res.data.case, ...prev]);
      setShowAddCase(false);
      setNewCase({ title: '', clientName: '', caseType: '', court: '', description: '', filedDate: '', status: 'Pending', isPublic: false });
      toast.success('Case added successfully');
    } catch { toast.error('Failed to add case'); }
  };

  const markMsgRead = async (id: string) => {
    try {
      await messageAPI.markRead(id);
      setMessages(prev => prev.map(m => m._id === id ? { ...m, isRead: true } : m));
    } catch { }
  };

  const stats = {
    total: cases.length,
    active: cases.filter(c => c.status === 'Active').length,
    resolved: cases.filter(c => c.status === 'Resolved').length,
    publicCases: cases.filter(c => c.isPublic).length,
    upcomingMeetings: meetings.filter(m => m.status === 'pending' || m.status === 'confirmed').length,
    unread: messages.filter(m => !m.isRead).length,
    chats: chatRooms.length,
  };

  if (loading) return <div className="loading-center" style={{ paddingTop: 130 }}><div className="spinner" /></div>;

  return (
    <div className="dashboard-page page">
      <div className="container">
        <div style={{ display: 'flex', alignItems: 'center', gap: 24, marginBottom: 8 }}>
          <AvatarUpload size={80} />
          <div>
            <h1 className="section-title" style={{ marginBottom: 4 }}>Lawyer Dashboard</h1>
            <p className="section-subtitle">Manage your cases, meetings, and client messages.</p>
          </div>
        </div>

        {/* Stats */}
        <div className="dash-stats">
          <StatCard icon={<FaBriefcase />} label="Total Cases" value={stats.total} />
          <StatCard icon={<FaEdit />} label="Active" value={stats.active} />
          <StatCard icon={<FaEye />} label="Public Cases" value={stats.publicCases} />
          <StatCard icon={<FaVideo />} label="Upcoming Meetings" value={stats.upcomingMeetings} />
          <StatCard icon={<FaComments />} label="Active Chats" value={stats.chats} accent />
          <StatCard icon={<FaEnvelope />} label="Unread Messages" value={stats.unread} />
        </div>

        {/* Tabs */}
        <div className="profile-tabs">
          {(['cases','meetings','chats','messages'] as const).map(t => (
            <button key={t} className={`tab-btn ${activeTab === t ? 'active' : ''}`} onClick={() => setActiveTab(t)}>
              {t.charAt(0).toUpperCase() + t.slice(1)}
              {t === 'chats' && stats.chats > 0 && <span className="unread-dot">{stats.chats}</span>}
              {t === 'messages' && stats.unread > 0 && <span className="unread-dot">{stats.unread}</span>}
            </button>
          ))}
        </div>

        {/* Cases */}
        {activeTab === 'cases' && (
          <div className="animate-fadeIn">
            <div className="dash-section-header">
              <h3>My Cases</h3>
              <button className="btn btn-primary btn-sm" onClick={() => setShowAddCase(!showAddCase)}>
                <FaPlus /> Add Case
              </button>
            </div>

            {showAddCase && (
              <form onSubmit={addCase} className="card add-case-form">
                <h4 style={{ marginBottom: 16 }}>New Case</h4>
                <div className="grid-2-col">
                  <div className="form-group">
                    <label className="form-label">Title *</label>
                    <input className="form-input" required value={newCase.title} onChange={e => setNewCase(p => ({ ...p, title: e.target.value }))} placeholder="Case title" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Client Name *</label>
                    <input className="form-input" required value={newCase.clientName} onChange={e => setNewCase(p => ({ ...p, clientName: e.target.value }))} placeholder="Client name" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Case Type *</label>
                    <select className="form-select" required value={newCase.caseType} onChange={e => setNewCase(p => ({ ...p, caseType: e.target.value }))}>
                      <option value="">Select type</option>
                      {CASE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Court *</label>
                    <input className="form-input" required value={newCase.court} onChange={e => setNewCase(p => ({ ...p, court: e.target.value }))} placeholder="Court name" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Filed Date *</label>
                    <input type="date" className="form-input" required value={newCase.filedDate} onChange={e => setNewCase(p => ({ ...p, filedDate: e.target.value }))} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Status</label>
                    <select className="form-select" value={newCase.status} onChange={e => setNewCase(p => ({ ...p, status: e.target.value }))}>
                      {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Description</label>
                  <textarea className="form-textarea" value={newCase.description} onChange={e => setNewCase(p => ({ ...p, description: e.target.value }))} placeholder="Case description..." />
                </div>
                <label className="toggle-label">
                  <input type="checkbox" checked={newCase.isPublic} onChange={e => setNewCase(p => ({ ...p, isPublic: e.target.checked }))} />
                  Make this case public on my profile
                </label>
                <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
                  <button type="submit" className="btn btn-primary">Save Case</button>
                  <button type="button" className="btn btn-ghost" onClick={() => setShowAddCase(false)}>Cancel</button>
                </div>
              </form>
            )}

            {cases.length === 0 ? (
              <div className="empty-state"><div className="empty-state-icon">📁</div><p className="empty-state-text">No cases yet. Add your first case!</p></div>
            ) : (
              <div className="cases-table">
                {cases.map(c => (
                  <div key={c._id} className="case-row card">
                    <div className="case-row-main">
                      <h4>{c.title}</h4>
                      <p className="case-client">Client: {c.clientName}</p>
                      <div className="case-row-meta">
                        <span className="badge badge-blue">{c.caseType}</span>
                        <span className={`badge ${c.status === 'Resolved' ? 'badge-green' : c.status === 'Active' ? 'badge-blue' : 'badge-gray'}`}>{c.status}</span>
                        <span className="text-muted">{c.court}</span>
                      </div>
                    </div>
                    <div className="case-row-actions">
                      <button className={`visibility-btn ${c.isPublic ? 'public' : 'private'}`} onClick={() => toggleVisibility(c._id)} title={c.isPublic ? 'Make Private' : 'Make Public'}>
                        {c.isPublic ? <><FaEye /> Public</> : <><FaEyeSlash /> Private</>}
                      </button>
                      <button className="btn btn-ghost btn-sm delete-btn" onClick={() => deleteCase(c._id)}><FaTrash /></button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Meetings */}
        {activeTab === 'meetings' && (
          <div className="animate-fadeIn">
            <h3 className="dash-section-title">Upcoming Meetings</h3>
            {meetings.length === 0 ? (
              <div className="empty-state"><div className="empty-state-icon">📅</div><p className="empty-state-text">No meetings scheduled.</p></div>
            ) : (
              <div className="meetings-list">
                {meetings.map(m => (
                  <div key={m._id} className="meeting-item card">
                    <div className="meeting-type-icon">
                      {m.meetingType === 'video' ? <FaVideo /> : <FaPhone />}
                    </div>
                    <div className="meeting-info">
                      <h4>{(m.userId as any)?.name || 'Client'}</h4>
                      <p className="meeting-time">{new Date(m.scheduledAt).toLocaleString('en-IN')}</p>
                      {m.agenda && <p className="meeting-agenda">{m.agenda}</p>}
                      <span className={`badge ${m.status === 'confirmed' ? 'badge-green' : m.status === 'pending' ? 'badge-gold' : 'badge-gray'}`}>{m.status}</span>
                    </div>
                    {m.meetingLink && (
                      <a href={m.meetingLink} target="_blank" rel="noopener noreferrer" className="btn btn-primary btn-sm">Join</a>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Chats */}
        {activeTab === 'chats' && (
          <div className="animate-fadeIn">
            <h3 className="dash-section-title">Client Conversations</h3>
            {chatRooms.length === 0 ? (
              <div className="empty-state"><div className="empty-state-icon">💬</div><p className="empty-state-text">No chat conversations yet. Clients can start a chat from your profile.</p></div>
            ) : (
              <div className="meetings-list">
                {chatRooms.map((room: any) => (
                  <div key={room._id} className="meeting-item card" style={{ cursor: 'pointer' }} onClick={() => {
                    navigate(`/chat/room/${encodeURIComponent(room._id)}`);
                  }}>
                    <div className="meeting-type-icon"><FaComments /></div>
                    <div className="meeting-info" style={{ flex: 1 }}>
                      <h4>{room.otherUser?.name || 'Unknown User'}</h4>
                      <p className="meeting-agenda" style={{ color: 'var(--text-muted)', fontSize: 13 }}>{room.otherUser?.email}</p>
                      <p className="meeting-agenda">{room.lastSender}: {room.lastMessage?.slice(0, 80)}{(room.lastMessage?.length || 0) > 80 ? '...' : ''}</p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span className="badge badge-blue">{room.count} msgs</span>
                      <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>{new Date(room.lastTime).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Messages */}
        {activeTab === 'messages' && (
          <div className="animate-fadeIn">
            <h3 className="dash-section-title">Client Messages</h3>
            {messages.length === 0 ? (
              <div className="empty-state"><div className="empty-state-icon">📩</div><p className="empty-state-text">No messages yet.</p></div>
            ) : (
              <div className="messages-list">
                {messages.map(m => (
                  <div key={m._id} className={`message-row card ${!m.isRead ? 'unread' : ''}`} onClick={() => markMsgRead(m._id)}>
                    <div className="msg-sender-avatar">{m.senderName?.[0] || '?'}</div>
                    <div className="msg-content">
                      <div className="msg-header">
                        <strong>{m.senderName}</strong>
                        <span className="msg-email">{m.senderEmail}</span>
                        <span className="msg-date">{new Date(m.createdAt).toLocaleDateString('en-IN')}</span>
                      </div>
                      <p className="msg-subject">{m.subject}</p>
                      <p className="msg-body">{m.body}</p>
                    </div>
                    {!m.isRead && <span className="unread-indicator" />}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

const StatCard: React.FC<{ icon: React.ReactNode; label: string; value: number; accent?: boolean }> = ({ icon, label, value, accent }) => (
  <div className="dash-stat-card card">
    <div className={`dash-stat-icon ${accent ? 'accent' : ''}`}>{icon}</div>
    <div>
      <div className="dash-stat-value">{value}</div>
      <div className="dash-stat-label">{label}</div>
    </div>
  </div>
);

export default LawyerDashboard;
