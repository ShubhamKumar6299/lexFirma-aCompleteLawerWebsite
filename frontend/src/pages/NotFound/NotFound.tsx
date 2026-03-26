import React from 'react';
import { Link } from 'react-router-dom';
import { FaBalanceScale } from 'react-icons/fa';
import './NotFound.css';

const NotFound: React.FC = () => (
  <div className="notfound-page page">
    <div className="container notfound-container">
      <div className="notfound-animated-icon">
        <FaBalanceScale />
      </div>
      <h1 className="notfound-code">404</h1>
      <h2 className="notfound-title">Page Not Found</h2>
      <p className="notfound-desc">The page you're looking for doesn't exist or has been moved. Justice may be blind, but this URL is completely lost.</p>
      <div className="notfound-actions">
        <Link to="/" className="btn btn-primary btn-lg">Go Home</Link>
        <Link to="/lawyers" className="btn btn-ghost btn-lg">Find Lawyers</Link>
      </div>
    </div>
  </div>
);

export default NotFound;
