import React from 'react';
import { Link } from 'react-router-dom';
import { FaStar, FaStarHalfAlt, FaRegStar, FaMapMarkerAlt, FaGavel, FaCheckCircle, FaBriefcase } from 'react-icons/fa';
import type { Lawyer } from '../../types';
import './LawyerCard.css';

interface Props { lawyer: Lawyer; }

const renderStars = (rating: number) => {
  const stars = [];
  for (let i = 1; i <= 5; i++) {
    if (rating >= i) stars.push(<FaStar key={i} className="star" />);
    else if (rating >= i - 0.5) stars.push(<FaStarHalfAlt key={i} className="star" />);
    else stars.push(<FaRegStar key={i} className="star-empty" />);
  }
  return stars;
};

const LawyerCard: React.FC<Props> = ({ lawyer }) => {
  const initials = lawyer.userId?.name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'LA';

  return (
    <div className="lawyer-card">
      <div className="lawyer-card-header">
        <div className="lawyer-avatar">
          {lawyer.userId?.avatar ? (
            <img src={lawyer.userId.avatar} alt={lawyer.userId.name} />
          ) : (
            <span className="avatar-initials">{initials}</span>
          )}
          {lawyer.isAvailable && <span className="available-dot" title="Available" />}
        </div>
        <div className="lawyer-info">
          <h3 className="lawyer-name">{lawyer.userId?.name || 'Advocate'}</h3>
          {lawyer.isVerified && (
            <span className="verified-badge"><FaCheckCircle /> Verified</span>
          )}
          <div className="stars-row">
            {renderStars(lawyer.rating)}
            <span className="rating-text">{lawyer.rating.toFixed(1)} ({lawyer.totalRatings})</span>
          </div>
        </div>
      </div>

      <div className="lawyer-specs">
        {lawyer.specializations.slice(0, 3).map(spec => (
          <span key={spec} className="badge badge-blue">{spec}</span>
        ))}
        {lawyer.specializations.length > 3 && (
          <span className="badge badge-gray">+{lawyer.specializations.length - 3}</span>
        )}
      </div>

      <div className="lawyer-meta">
        <span className="meta-item">
          <FaMapMarkerAlt className="meta-icon" />
          {lawyer.city}, {lawyer.state}
        </span>
        <span className="meta-item">
          <FaGavel className="meta-icon" />
          {lawyer.courtLevels[0] || 'District Court'}
        </span>
        <span className="meta-item">
          <FaBriefcase className="meta-icon" />
          {lawyer.experience} yrs exp
        </span>
      </div>

      <div className="lawyer-stats">
        <div className="stat-item">
          <span className="stat-value">{lawyer.solvedCases}</span>
          <span className="stat-label">Cases Won</span>
        </div>
        <div className="stat-divider" />
        <div className="stat-item">
          <span className="stat-value">₹{lawyer.consultationFee.toLocaleString()}</span>
          <span className="stat-label">Consult Fee</span>
        </div>
        <div className="stat-divider" />
        <div className="stat-item">
          <span className="stat-value">{lawyer.languages.slice(0, 2).join(', ') || 'Hindi, English'}</span>
          <span className="stat-label">Languages</span>
        </div>
      </div>

      <Link to={`/lawyers/${lawyer._id}`} className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
        View Profile
      </Link>
    </div>
  );
};

export default LawyerCard;
