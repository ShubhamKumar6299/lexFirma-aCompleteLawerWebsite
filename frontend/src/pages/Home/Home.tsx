import React from 'react';
import { Link } from 'react-router-dom';
import { FaBalanceScale, FaUsers, FaStar, FaNewspaper, FaGavel, FaShieldAlt, FaVideo, FaEnvelope, FaArrowRight, FaCheckCircle } from 'react-icons/fa';
import './Home.css';

const CASE_TYPES = [
  { icon: '⚖️', label: 'Criminal Law', desc: 'FIR, bail, trial & appeal' },
  { icon: '👨‍👩‍👧', label: 'Family Law', desc: 'Divorce, custody & matrimonial' },
  { icon: '🏠', label: 'Property Law', desc: 'Disputes, title & real estate' },
  { icon: '💼', label: 'Corporate Law', desc: 'Contracts, IPO & compliance' },
  { icon: '💻', label: 'Cyber Law', desc: 'Online fraud & IT Act cases' },
  { icon: '🏛️', label: 'Civil Law', desc: 'Disputes & injunctions' },
  { icon: '👶', label: 'Child Custody', desc: 'Guardianship & visitation' },
  { icon: '📊', label: 'Taxation', desc: 'GST, income tax & appeals' },
];

const FEATURES = [
  { icon: <FaUsers />, title: 'Expert Lawyers', desc: 'Find verified advocates across all practice areas and court levels.' },
  { icon: <FaVideo />, title: 'Virtual Meetings', desc: 'Schedule audio & video consultations directly from any lawyer\'s profile.' },
  { icon: <FaNewspaper />, title: 'Live Legal News', desc: 'Stay informed with the latest Indian court rulings and legal developments.' },
  { icon: <FaEnvelope />, title: 'Direct Contact', desc: 'Message lawyers instantly. Get notified via email with secure communication.' },
  { icon: <FaStar />, title: 'Verified Reviews', desc: 'Read authentic ratings and reviews from real clients of each advocate.' },
  { icon: <FaShieldAlt />, title: 'Secure Platform', desc: 'JWT-secured accounts, encrypted messaging, and private case management.' },
];

const STATS = [
  { value: '500+', label: 'Verified Lawyers' },
  { value: '10K+', label: 'Cases Handled' },
  { value: '28', label: 'Practice Areas' },
  { value: '4.8⭐', label: 'Average Rating' },
];

const Home: React.FC = () => (
  <div className="home-page">
    {/* Hero */}
    <section className="hero">
      <div className="hero-bg">
        <div className="hero-glow" />
        <div className="hero-grid" />
      </div>
      <div className="container hero-content">
        <div className="hero-badge"><FaBalanceScale /> India's Premier Legal Platform</div>
        <h1 className="hero-title">
          Find the Right<br />
          <span className="hero-highlight">Legal Expert</span><br />
          For Your Case
        </h1>
        <p className="hero-subtitle">
          Connect with verified advocates across Criminal, Family, Corporate, Cyber, and 25+ practice areas.
          Schedule consultations, follow live legal news, and get the justice you deserve.
        </p>
        <div className="hero-actions">
          <Link to="/lawyers" className="btn btn-accent btn-lg">
            Find a Lawyer <FaArrowRight />
          </Link>
          <Link to="/news" className="btn btn-ghost btn-lg">
            Legal News
          </Link>
        </div>
        <div className="hero-checks">
          {['Free to search', 'Verified advocates', 'Schedule instantly'].map(t => (
            <span key={t} className="hero-check"><FaCheckCircle /> {t}</span>
          ))}
        </div>
      </div>

      {/* Stats Bar */}
      <div className="container">
        <div className="stats-bar">
          {STATS.map(s => (
            <div key={s.label} className="stat-box">
              <span className="stat-box-value">{s.value}</span>
              <span className="stat-box-label">{s.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* Case Types */}
    <section className="section">
      <div className="container">
        <div className="section-header">
          <h2 className="section-title">Browse by Practice Area</h2>
          <p className="section-subtitle">Our platform covers every major area of Indian law with expert lawyers at every court level.</p>
        </div>
        <div className="case-types-grid">
          {CASE_TYPES.map(ct => (
            <Link
              key={ct.label}
              to={`/lawyers?specialization=${encodeURIComponent(ct.label)}`}
              className="case-type-card"
            >
              <span className="ct-icon">{ct.icon}</span>
              <h3 className="ct-label">{ct.label}</h3>
              <p className="ct-desc">{ct.desc}</p>
              <span className="ct-arrow"><FaArrowRight /></span>
            </Link>
          ))}
        </div>
      </div>
    </section>

    {/* Features */}
    <section className="section features-section">
      <div className="container">
        <div className="section-header">
          <h2 className="section-title">Why Choose LexFirma</h2>
          <p className="section-subtitle">A complete legal ecosystem built for citizens and advocates.</p>
        </div>
        <div className="features-grid">
          {FEATURES.map(f => (
            <div key={f.title} className="feature-card">
              <div className="feature-icon">{f.icon}</div>
              <h3 className="feature-title">{f.title}</h3>
              <p className="feature-desc">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* CTA */}
    <section className="section">
      <div className="container">
        <div className="cta-card">
          <div className="cta-content">
            <FaGavel className="cta-icon" />
            <h2 className="cta-title">Are You a Lawyer?</h2>
            <p className="cta-desc">Join 500+ verified advocates on LexFirma. Manage your cases, showcase your profile, and receive clients from across India.</p>
            <div className="cta-actions">
              <Link to="/auth/register" className="btn btn-accent btn-lg">Join as Lawyer</Link>
              <Link to="/lawyers" className="btn btn-ghost btn-lg">Browse Lawyers</Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
);

export default Home;
