import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import toast from 'react-hot-toast';
import {
  FaUsers, FaGavel, FaBriefcase, FaStar, FaCalendar,
  FaChartBar, FaTrash, FaCheckCircle, FaTimesCircle,
  FaToggleOn, FaToggleOff, FaShieldAlt, FaSearch, FaSync
} from 'react-icons/fa';
import AvatarUpload from '../../components/AvatarUpload/AvatarUpload';
import './AdminDashboard.css';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

type Tab = 'stats' | 'users' | 'lawyers' | 'cases' | 'reviews' | 'meetings' | 'messages';

const AdminDashboard: React.FC = () => {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>('stats');
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');

  // Data
  const [stats, setStats] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [lawyers, setLawyers] = useState<any[]>([]);
  const [cases, setCases] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [meetings, setMeetings] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);

  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    if (!user || user.role !== 'admin') { navigate('/'); }
  }, [user, navigate]);

  const fetch = useCallback(async (t: Tab) => {
    setLoading(true);
    try {
      if (t === 'stats') {
        const r = await axios.get(`${API}/admin/stats`, { headers });
        setStats(r.data);
      } else if (t === 'users') {
        const r = await axios.get(`${API}/admin/users?search=${search}`, { headers });
        setUsers(r.data.users);
      } else if (t === 'lawyers') {
        const r = await axios.get(`${API}/admin/lawyers`, { headers });
        setLawyers(r.data.lawyers);
      } else if (t === 'cases') {
        const r = await axios.get(`${API}/admin/cases`, { headers });
        setCases(r.data.cases);
      } else if (t === 'reviews') {
        const r = await axios.get(`${API}/admin/reviews`, { headers });
        setReviews(r.data.reviews);
      } else if (t === 'meetings') {
        const r = await axios.get(`${API}/admin/meetings`, { headers });
        setMeetings(r.data.meetings);
      } else if (t === 'messages') {
        const r = await axios.get(`${API}/admin/messages`, { headers });
        setMessages(r.data.messages);
      }
    } catch { toast.error('Failed to load data'); }
    finally { setLoading(false); }
  }, [token, search]); // eslint-disable-line

  useEffect(() => { fetch(tab); }, [tab]); // eslint-disable-line

  const action = async (method: string, url: string, data?: any) => {
    try {
      await axios({ method, url: `${API}${url}`, data, headers });
      toast.success('Done!');
      fetch(tab);
    } catch { toast.error('Action failed'); }
  };

  const roleColor = (r: string) =>
    r === 'admin' ? '#f87171' : r === 'lawyer' ? '#93c5fd' : '#86efac';

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: 'stats', label: 'Stats', icon: <FaChartBar /> },
    { id: 'users', label: 'Users', icon: <FaUsers /> },
    { id: 'lawyers', label: 'Lawyers', icon: <FaGavel /> },
    { id: 'cases', label: 'Cases', icon: <FaBriefcase /> },
    { id: 'reviews', label: 'Reviews', icon: <FaStar /> },
    { id: 'meetings', label: 'Meetings', icon: <FaCalendar /> },
    { id: 'messages', label: 'Messages', icon: <FaUsers /> },
  ];

  return (
    <div className="admin-page page">
      <div className="admin-sidebar">
        <div className="admin-brand">
          <FaShieldAlt />
          <span>Admin Panel</span>
        </div>
        <div style={{ padding: '16px 0', display: 'flex', justifyContent: 'center' }}>
          <AvatarUpload size={72} />
        </div>
        {tabs.map(t => (
          <button
            key={t.id}
            className={`admin-nav-btn ${tab === t.id ? 'active' : ''}`}
            onClick={() => setTab(t.id)}
          >
            {t.icon} {t.label}
          </button>
        ))}
        <button className="admin-nav-btn" onClick={() => navigate('/')}>
          ← Back to Site
        </button>
      </div>

      <div className="admin-main">
        {/* Header */}
        <div className="admin-header">
          <div>
            <h1>{tabs.find(t => t.id === tab)?.label}</h1>
            <p>Logged in as <strong>{user?.name}</strong> · <span style={{ color: '#f87171' }}>Admin</span></p>
          </div>
          <button className="btn btn-ghost btn-sm" onClick={() => fetch(tab)}>
            <FaSync /> Refresh
          </button>
        </div>

        {loading && <div className="admin-loading"><div className="spinner" /></div>}

        {/* STATS */}
        {!loading && tab === 'stats' && stats && (
          <div>
            <div className="admin-stat-grid">
              {[
                { label: 'Total Users', val: stats.stats.users, icon: <FaUsers />, color: '#93c5fd' },
                { label: 'Lawyers', val: stats.stats.lawyers, icon: <FaGavel />, color: '#86efac' },
                { label: 'Cases', val: stats.stats.cases, icon: <FaBriefcase />, color: '#fbbf24' },
                { label: 'Meetings', val: stats.stats.meetings, icon: <FaCalendar />, color: '#c4b5fd' },
                { label: 'Reviews', val: stats.stats.reviews, icon: <FaStar />, color: '#fda4af' },
                { label: 'Messages', val: stats.stats.messages, icon: <FaUsers />, color: '#67e8f9' },
              ].map(s => (
                <div key={s.label} className="admin-stat-card card">
                  <div className="admin-stat-icon" style={{ color: s.color }}>{s.icon}</div>
                  <div className="admin-stat-val" style={{ color: s.color }}>{s.val}</div>
                  <div className="admin-stat-label">{s.label}</div>
                </div>
              ))}
            </div>
            <div className="card" style={{ marginTop: 24, padding: '20px 24px' }}>
              <h3 style={{ marginBottom: 16, fontSize: 16 }}>Recent Registrations</h3>
              <table className="admin-table">
                <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Joined</th></tr></thead>
                <tbody>
                  {stats.recentUsers?.map((u: any) => (
                    <tr key={u._id}>
                      <td>{u.name}</td>
                      <td>{u.email}</td>
                      <td><span className="admin-role-badge" style={{ color: roleColor(u.role) }}>{u.role}</span></td>
                      <td>{new Date(u.createdAt).toLocaleDateString('en-IN')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* USERS */}
        {!loading && tab === 'users' && (
          <div>
            <div className="admin-search-row">
              <FaSearch className="search-icon" />
              <input
                className="form-input"
                placeholder="Search by name or email..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && fetch('users')}
              />
              <button className="btn btn-primary btn-sm" onClick={() => fetch('users')}>Search</button>
            </div>
            <div className="card" style={{ overflow: 'auto' }}>
              <table className="admin-table">
                <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Joined</th><th>Actions</th></tr></thead>
                <tbody>
                  {users.map(u => (
                    <tr key={u._id}>
                      <td>{u.name}</td>
                      <td style={{ color: 'var(--text-muted)', fontSize: 13 }}>{u.email}</td>
                      <td>
                        <select
                          className="admin-role-select"
                          value={u.role}
                          onChange={e => action('put', `/admin/users/${u._id}/role`, { role: e.target.value })}
                        >
                          <option value="user">user</option>
                          <option value="lawyer">lawyer</option>
                          <option value="admin">admin</option>
                        </select>
                      </td>
                      <td style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                        {new Date(u.createdAt).toLocaleDateString('en-IN')}
                      </td>
                      <td>
                        <button className="admin-del-btn" onClick={() => action('delete', `/admin/users/${u._id}`)}>
                          <FaTrash />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* LAWYERS */}
        {!loading && tab === 'lawyers' && (
          <div className="card" style={{ overflow: 'auto' }}>
            <table className="admin-table">
              <thead><tr><th>Name</th><th>City</th><th>Rating</th><th>Verified</th><th>Available</th><th>Actions</th></tr></thead>
              <tbody>
                {lawyers.map(l => (
                  <tr key={l._id}>
                    <td>{(l.userId as any)?.name}</td>
                    <td style={{ fontSize: 13, color: 'var(--text-muted)' }}>{l.city}, {l.state}</td>
                    <td>⭐ {l.rating?.toFixed(1)}</td>
                    <td>
                      <button
                        className={`admin-toggle-btn ${l.isVerified ? 'on' : 'off'}`}
                        onClick={() => action('put', `/admin/lawyers/${l._id}/verify`)}
                      >
                        {l.isVerified ? <><FaCheckCircle /> Yes</> : <><FaTimesCircle /> No</>}
                      </button>
                    </td>
                    <td>
                      <button
                        className={`admin-toggle-btn ${l.isAvailable ? 'on' : 'off'}`}
                        onClick={() => action('put', `/admin/lawyers/${l._id}/availability`)}
                      >
                        {l.isAvailable ? <><FaToggleOn /> On</> : <><FaToggleOff /> Off</>}
                      </button>
                    </td>
                    <td>
                      <button className="admin-del-btn" onClick={() => action('delete', `/admin/lawyers/${l._id}`)}>
                        <FaTrash />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* CASES */}
        {!loading && tab === 'cases' && (
          <div className="card" style={{ overflow: 'auto' }}>
            <table className="admin-table">
              <thead><tr><th>Title</th><th>Type</th><th>Status</th><th>Visibility</th><th>Filed</th><th>Del</th></tr></thead>
              <tbody>
                {cases.map(c => (
                  <tr key={c._id}>
                    <td>{c.title}</td>
                    <td><span className="badge badge-blue" style={{ fontSize: 11 }}>{c.caseType}</span></td>
                    <td><span className="badge badge-gray" style={{ fontSize: 11 }}>{c.status}</span></td>
                    <td style={{ fontSize: 13 }}>{c.isPublic ? '🟢 Public' : '🔴 Private'}</td>
                    <td style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                      {new Date(c.filedDate).toLocaleDateString('en-IN')}
                    </td>
                    <td>
                      <button className="admin-del-btn" onClick={() => action('delete', `/admin/cases/${c._id}`)}>
                        <FaTrash />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* REVIEWS */}
        {!loading && tab === 'reviews' && (
          <div className="card" style={{ overflow: 'auto' }}>
            <table className="admin-table">
              <thead><tr><th>Reviewer</th><th>Rating</th><th>Comment</th><th>Date</th><th>Del</th></tr></thead>
              <tbody>
                {reviews.map(r => (
                  <tr key={r._id}>
                    <td>{r.isAnonymous ? 'Anonymous' : (r.userId as any)?.name}</td>
                    <td>{'⭐'.repeat(r.rating)}</td>
                    <td style={{ maxWidth: 240, fontSize: 13, color: 'var(--text-secondary)' }}>
                      {r.comment?.slice(0, 80)}{r.comment?.length > 80 ? '...' : ''}
                    </td>
                    <td style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                      {new Date(r.createdAt).toLocaleDateString('en-IN')}
                    </td>
                    <td>
                      <button className="admin-del-btn" onClick={() => action('delete', `/admin/reviews/${r._id}`)}>
                        <FaTrash />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* MEETINGS */}
        {!loading && tab === 'meetings' && (
          <div className="card" style={{ overflow: 'auto' }}>
            <table className="admin-table">
              <thead><tr><th>Client</th><th>Type</th><th>Scheduled</th><th>Status</th><th>Link</th><th>Del</th></tr></thead>
              <tbody>
                {meetings.map(m => (
                  <tr key={m._id}>
                    <td>{(m.userId as any)?.name}</td>
                    <td style={{ textTransform: 'capitalize' }}>{m.meetingType}</td>
                    <td style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                      {new Date(m.scheduledAt).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td>
                      <select
                        className="admin-role-select"
                        value={m.status}
                        onChange={e => action('put', `/admin/meetings/${m._id}/status`, { status: e.target.value })}
                      >
                        {['pending', 'confirmed', 'cancelled', 'completed'].map(s =>
                          <option key={s} value={s}>{s}</option>
                        )}
                      </select>
                    </td>
                    <td>
                      <a href={m.meetingLink} target="_blank" rel="noopener noreferrer"
                        style={{ color: 'var(--accent)', fontSize: 13 }}>Join ↗</a>
                    </td>
                    <td>
                      <button className="admin-del-btn" onClick={() => action('delete', `/admin/meetings/${m._id}`)}>
                        <FaTrash />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* MESSAGES */}
        {!loading && tab === 'messages' && (
          <div>
            <h3 style={{ marginBottom: 16, fontSize: 16 }}>
              All Messages — {messages.length} total
              {messages.filter(m => !m.isRead).length > 0 && (
                <span className="admin-role-badge" style={{ color: '#fbbf24', marginLeft: 10 }}>
                  {messages.filter(m => !m.isRead).length} unread
                </span>
              )}
            </h3>
            {messages.length === 0 ? (
              <div className="card" style={{ padding: 32, textAlign: 'center', color: 'var(--text-muted)' }}>
                📩 No messages yet.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {messages.map(m => (
                  <div key={m._id} className="card" style={{
                    padding: '16px 20px',
                    borderLeft: m.isRead ? '3px solid var(--border)' : '3px solid #fbbf24',
                    opacity: m.isRead ? 0.8 : 1,
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                          <div style={{
                            width: 32, height: 32, borderRadius: '50%',
                            background: 'linear-gradient(135deg, var(--primary), var(--primary-light))',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: 13, fontWeight: 700, color: 'white', flexShrink: 0,
                          }}>
                            {m.senderName?.[0] || '?'}
                          </div>
                          <div>
                            <strong style={{ fontSize: 14 }}>{m.senderName}</strong>
                            <span style={{ fontSize: 12, color: 'var(--text-muted)', marginLeft: 8 }}>{m.senderEmail}</span>
                          </div>
                          {!m.isRead && (
                            <span className="admin-role-badge" style={{ color: '#fbbf24', fontSize: 10 }}>NEW</span>
                          )}
                        </div>
                        <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 4 }}>
                          📌 {m.subject}
                        </div>
                        <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>
                          {m.body}
                        </p>
                        <div style={{ marginTop: 8, fontSize: 11, color: 'var(--text-muted)' }}>
                          To: <strong>{(m.lawyerId as any)?.userId?.name || 'Unknown Lawyer'}</strong>
                          {' · '}
                          {new Date(m.createdAt).toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                      <button
                        className="admin-del-btn"
                        onClick={() => action('delete', `/admin/messages/${m._id}`)}
                        title="Delete message"
                      >
                        <FaTrash />
                      </button>
                    </div>
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

export default AdminDashboard;
