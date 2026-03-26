import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { lawyerAPI } from '../../services/api';
import type { Lawyer, Case, Review } from '../../types';
import { FaStar, FaStarHalfAlt, FaRegStar, FaMapMarkerAlt, FaGavel, FaCheckCircle, FaVideo, FaEnvelope, FaBriefcase, FaGraduationCap, FaLanguage, FaArrowLeft, FaComments } from 'react-icons/fa';
import './LawyerProfile.css';

const renderStars = (rating: number) => {
  return [1,2,3,4,5].map(i => {
    if (rating >= i) return <FaStar key={i} className="star" />;
    if (rating >= i - 0.5) return <FaStarHalfAlt key={i} className="star" />;
    return <FaRegStar key={i} className="star-empty" />;
  });
};

const STATUS_COLORS: Record<string, string> = {
  Active: 'badge-blue', Resolved: 'badge-green', Pending: 'badge-gold', Dismissed: 'badge-red', 'On Hold': 'badge-gray',
};

const LawyerProfile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [lawyer, setLawyer] = useState<Lawyer | null>(null);
  const [cases, setCases] = useState<Case[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'cases' | 'reviews'>('overview');

  useEffect(() => {
    const fetch = async () => {
      if (!id) return;
      try {
        const res = await lawyerAPI.getById(id);
        setLawyer(res.data.lawyer);
        setCases(res.data.publicCases);
        setReviews(res.data.reviews);
      } catch { navigate('/lawyers'); }
      finally { setLoading(false); }
    };
    fetch();
  }, [id, navigate]);

  if (loading) return <div className="loading-center" style={{ paddingTop: 120 }}><div className="spinner" /></div>;
  if (!lawyer) return null;

  const initials = lawyer.userId?.name?.split(' ').map(n => n[0]).join('').slice(0,2).toUpperCase() || 'LA';

  return (
    <div className="profile-page page">
      <div className="container">
        <button className="btn btn-ghost btn-sm back-btn" onClick={() => navigate(-1)}><FaArrowLeft /> Back</button>

        {/* Profile Hero */}
        <div className="profile-hero card">
          <div className="profile-hero-left">
            <div className="profile-avatar-lg">
              {lawyer.userId?.avatar ? <img src={lawyer.userId.avatar} alt="avatar" /> : <span>{initials}</span>}
              {lawyer.isAvailable && <div className="avail-badge-lg">Available</div>}
            </div>
            <div className="profile-main-info">
              <div className="profile-name-row">
                <h1 className="profile-name">{lawyer.userId?.name}</h1>
                {lawyer.isVerified && <span className="badge badge-green"><FaCheckCircle /> Verified</span>}
              </div>
              <p className="profile-bar-id">Bar Council ID: {lawyer.barCouncilId}</p>
              <div className="stars-row" style={{ marginBottom: 12 }}>
                {renderStars(lawyer.rating)}
                <span className="rating-text">{lawyer.rating.toFixed(1)} ({lawyer.totalRatings} reviews)</span>
              </div>
              <div className="profile-meta-row">
                <span><FaMapMarkerAlt /> {lawyer.city}, {lawyer.state}</span>
                <span><FaBriefcase /> {lawyer.experience} years experience</span>
                <span><FaGavel /> {lawyer.courtLevels.join(', ')}</span>
              </div>
              <div className="profile-specs">
                {lawyer.specializations.map(s => <span key={s} className="badge badge-blue">{s}</span>)}
              </div>
            </div>
          </div>
          <div className="profile-hero-actions">
            <div className="profile-stat-mini">
              <span>{lawyer.solvedCases}</span>
              <small>Cases Won</small>
            </div>
            <div className="profile-stat-mini">
              <span>₹{lawyer.consultationFee.toLocaleString()}</span>
              <small>Consult Fee</small>
            </div>
            <Link to={`/meetings/schedule/${lawyer._id}`} className="btn btn-primary">
              <FaVideo /> Schedule Meeting
            </Link>
            <Link to={`/chat/${lawyer._id}`} className="btn btn-accent" style={{ background: 'linear-gradient(135deg,#d97706,#f59e0b)', color: '#111' }}>
              <FaComments /> Chat Now
            </Link>
            <Link to={`/contact/${lawyer._id}`} className="btn btn-ghost">
              <FaEnvelope /> Send Email
            </Link>
          </div>
        </div>

        {/* Tabs */}
        <div className="profile-tabs">
          {(['overview','cases','reviews'] as const).map(tab => (
            <button key={tab} className={`tab-btn ${activeTab === tab ? 'active' : ''}`} onClick={() => setActiveTab(tab)}>
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
              {tab === 'cases' && ` (${cases.length})`}
              {tab === 'reviews' && ` (${reviews.length})`}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="tab-content animate-fadeIn">
            {lawyer.bio && (
              <div className="card section-card">
                <h3 className="card-section-title">About</h3>
                <p className="bio-text">{lawyer.bio}</p>
              </div>
            )}
            <div className="profile-grid-2">
              {lawyer.education.length > 0 && (
                <div className="card section-card">
                  <h3 className="card-section-title"><FaGraduationCap /> Education</h3>
                  {lawyer.education.map((e, i) => (
                    <div key={i} className="edu-item">
                      <strong>{e.degree}</strong>
                      <span>{e.institution}</span>
                      <span className="edu-year">{e.year}</span>
                    </div>
                  ))}
                </div>
              )}
              {lawyer.languages.length > 0 && (
                <div className="card section-card">
                  <h3 className="card-section-title"><FaLanguage /> Languages</h3>
                  <div className="lang-list">
                    {lawyer.languages.map(l => <span key={l} className="badge badge-gray">{l}</span>)}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Cases Tab */}
        {activeTab === 'cases' && (
          <div className="tab-content animate-fadeIn">
            {cases.length === 0 ? (
              <div className="empty-state"><div className="empty-state-icon">📁</div><p className="empty-state-text">No public cases available.</p></div>
            ) : (
              <div className="cases-list">
                {cases.map(c => (
                  <div key={c._id} className="case-item card">
                    <div className="case-item-header">
                      <h4>{c.title}</h4>
                      <span className={`badge ${STATUS_COLORS[c.status]}`}>{c.status}</span>
                    </div>
                    <p className="case-desc">{c.description}</p>
                    <div className="case-meta">
                      <span className="badge badge-blue">{c.caseType}</span>
                      <span>{c.court}</span>
                      <span>{new Date(c.filedDate).toLocaleDateString('en-IN')}</span>
                    </div>
                    {c.outcome && <p className="case-outcome">Outcome: {c.outcome}</p>}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Reviews Tab */}
        {activeTab === 'reviews' && (
          <div className="tab-content animate-fadeIn">
            {reviews.length === 0 ? (
              <div className="empty-state"><div className="empty-state-icon">⭐</div><p className="empty-state-text">No reviews yet.</p></div>
            ) : (
              <div className="reviews-list">
                {reviews.map(r => (
                  <div key={r._id} className="review-item card">
                    <div className="review-header">
                      <div className="review-user">
                        <div className="review-avatar">{r.isAnonymous ? '?' : r.userId?.name?.[0]}</div>
                        <strong>{r.isAnonymous ? 'Anonymous' : r.userId?.name}</strong>
                      </div>
                      <div className="review-rating">
                        {renderStars(r.rating)}
                        <span>{r.rating}/5</span>
                      </div>
                    </div>
                    <p className="review-comment">{r.comment}</p>
                    <span className="review-date">{new Date(r.createdAt).toLocaleDateString('en-IN')}</span>
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

export default LawyerProfile;
