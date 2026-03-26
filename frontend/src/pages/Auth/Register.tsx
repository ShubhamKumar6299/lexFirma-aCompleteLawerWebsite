import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import { FaBalanceScale, FaEye, FaEyeSlash } from 'react-icons/fa';
import './Auth.css';

const Register: React.FC = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'user', phone: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password.length < 6) { toast.error('Password must be at least 6 characters'); return; }
    setLoading(true);
    try {
      await register(form);
      toast.success('Account created successfully!');
      navigate(form.role === 'lawyer' ? '/dashboard' : '/lawyers');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally { setLoading(false); }
  };

  return (
    <div className="auth-page page">
      <div className="auth-card card">
        <div className="auth-header">
          <FaBalanceScale className="auth-logo-icon" />
          <h1>Join LexFirma</h1>
          <p>Create your account to access India's legal platform</p>
        </div>
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input className="form-input" required value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="Advocate Ramesh Kumar / Priya Sharma" />
          </div>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input type="email" className="form-input" required value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} placeholder="email@example.com" />
          </div>
          <div className="form-group">
            <label className="form-label">Phone Number</label>
            <input className="form-input" value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} placeholder="+91 98765 43210" />
          </div>
          <div className="form-group">
            <label className="form-label">I am a...</label>
            <div className="role-options">
              {([{ value: 'user', label: '👤 User / Client' }, { value: 'lawyer', label: '⚖️ Lawyer / Advocate' }]).map(r => (
                <button key={r.value} type="button" className={`role-option ${form.role === r.value ? 'selected' : ''}`} onClick={() => setForm(p => ({ ...p, role: r.value }))}>
                  {r.label}
                </button>
              ))}
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <div className="pass-wrap">
              <input type={showPass ? 'text' : 'password'} className="form-input" required value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))} placeholder="Min 6 characters" />
              <button type="button" className="pass-toggle" onClick={() => setShowPass(!showPass)}>
                {showPass ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>
          <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%', justifyContent: 'center', marginTop: 8 }} disabled={loading}>
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>
        <p className="auth-footer">
          Already have an account? <Link to="/auth/login" className="auth-link">Sign In</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
