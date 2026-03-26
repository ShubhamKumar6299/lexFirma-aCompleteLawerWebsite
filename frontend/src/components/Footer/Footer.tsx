import React from 'react';
import { Link } from 'react-router-dom';
import { FaBalanceScale, FaFacebook, FaTwitter, FaLinkedin, FaPhone, FaEnvelope, FaMapMarkerAlt } from 'react-icons/fa';
import './Footer.css';

const Footer: React.FC = () => (
  <footer className="footer">
    <div className="container">
      <div className="footer-grid">
        <div className="footer-brand">
          <Link to="/" className="footer-logo">
            <FaBalanceScale className="footer-logo-icon" />
            <span>LexFirma</span>
          </Link>
          <p className="footer-tagline">
            Connecting citizens with the right legal expertise. Justice made accessible.
          </p>
          <div className="footer-social">
            <a href="#" aria-label="Facebook"><FaFacebook /></a>
            <a href="#" aria-label="Twitter"><FaTwitter /></a>
            <a href="#" aria-label="LinkedIn"><FaLinkedin /></a>
          </div>
        </div>

        <div>
          <h4 className="footer-heading">Services</h4>
          <ul className="footer-links">
            <li><Link to="/lawyers?specialization=Criminal Law">Criminal Law</Link></li>
            <li><Link to="/lawyers?specialization=Family Law">Family Law</Link></li>
            <li><Link to="/lawyers?specialization=Corporate Law">Corporate Law</Link></li>
            <li><Link to="/lawyers?specialization=Cyber Law">Cyber Law</Link></li>
            <li><Link to="/lawyers?specialization=Property & Real Estate">Property Law</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="footer-heading">Platform</h4>
          <ul className="footer-links">
            <li><Link to="/lawyers">Find Lawyers</Link></li>
            <li><Link to="/news">Legal News</Link></li>
            <li><Link to="/auth/register">Register</Link></li>
            <li><Link to="/auth/login">Login</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="footer-heading">Contact</h4>
          <ul className="footer-contact">
            <li><FaPhone /> <span>+91 98765 43210</span></li>
            <li><FaEnvelope /> <span>support@lexfirma.in</span></li>
            <li><FaMapMarkerAlt /> <span>New Delhi, India 110001</span></li>
          </ul>
        </div>
      </div>

      <div className="footer-bottom">
        <p>© {new Date().getFullYear()} LexFirma. All rights reserved.</p>
        <p className="footer-disclaimer">
          LexFirma is a legal information platform. Legal advice should be obtained directly from a licensed attorney.
        </p>
      </div>
    </div>
  </footer>
);

export default Footer;
