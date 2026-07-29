import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { authAPI, toErrorMessage } from '../../services/api';
import toast from 'react-hot-toast';
import { FaBalanceScale, FaKey, FaEye, FaEyeSlash } from 'react-icons/fa';
import './Auth.css';
import './Verify.css';

type Step = 'request' | 'reset' | 'done';

const RESEND_COOLDOWN = 60; // seconds
const MIN_PASSWORD_LENGTH = 6;
const OTP_LENGTH = 6;

const maskEmail = (email: string): string => {
  const [local, domain] = email.split('@');
  if (!domain) return email;
  if (local.length <= 2) return `${local[0]}***@${domain}`;
  return `${local[0]}${local[1]}${'*'.repeat(Math.min(local.length - 2, 6))}@${domain}`;
};

const ForgotPassword: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [step, setStep] = useState<Step>('request');
  const [email, setEmail] = useState(searchParams.get('email') ?? '');
  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(''));
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [otpStatus, setOtpStatus] = useState<'' | 'error' | 'success'>('');
  const [resendTimer, setResendTimer] = useState(0);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Resend countdown
  useEffect(() => {
    if (resendTimer <= 0) return;
    const timer = setInterval(() => {
      setResendTimer(prev => (prev <= 1 ? 0 : prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [resendTimer]);

  // Focus the first OTP box when the reset step opens
  useEffect(() => {
    if (step !== 'reset') return;
    const t = setTimeout(() => inputRefs.current[0]?.focus(), 100);
    return () => clearTimeout(t);
  }, [step]);

  const otpString = otp.join('');

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const next = [...otp];
    next[index] = value.slice(-1);
    setOtp(next);
    setError('');
    setOtpStatus('');
    if (value && index < OTP_LENGTH - 1) inputRefs.current[index + 1]?.focus();
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, OTP_LENGTH);
    if (!pasted) return;
    const next = Array(OTP_LENGTH).fill('');
    for (let i = 0; i < pasted.length; i++) next[i] = pasted[i];
    setOtp(next);
    inputRefs.current[Math.min(pasted.length, OTP_LENGTH - 1)]?.focus();
  };

  const requestCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) { setError('Please enter your email address'); return; }
    setLoading(true);
    setError('');
    try {
      const res = await authAPI.forgotPassword(email.trim());
      // The API deliberately answers the same way for unknown addresses, so
      // there is nothing here to branch on — just move the user forward.
      toast.success(res.data.message);
      setStep('reset');
      setResendTimer(RESEND_COOLDOWN);
    } catch (err: unknown) {
      setError(toErrorMessage(err, 'Could not send reset code'));
    } finally {
      setLoading(false);
    }
  };

  const submitReset = useCallback(async () => {
    if (otpString.length !== OTP_LENGTH) { setError('Please enter the complete 6-digit code'); return; }
    if (password.length < MIN_PASSWORD_LENGTH) {
      setError(`Password must be at least ${MIN_PASSWORD_LENGTH} characters`);
      return;
    }
    if (password !== confirm) { setError('Passwords do not match'); return; }

    setLoading(true);
    setError('');
    try {
      await authAPI.resetPassword(email.trim(), otpString, password);
      setOtpStatus('success');
      toast.success('Password reset! 🔐');
      setStep('done');
      setTimeout(() => navigate('/auth/login'), 2500);
    } catch (err: unknown) {
      setOtpStatus('error');
      setError(toErrorMessage(err, 'Password reset failed'));
    } finally {
      setLoading(false);
    }
  }, [email, otpString, password, confirm, navigate]);

  const handleResend = async () => {
    setResendTimer(RESEND_COOLDOWN);
    try {
      const res = await authAPI.forgotPassword(email.trim());
      toast.success(res.data.message);
      setOtp(Array(OTP_LENGTH).fill(''));
      setError('');
      setOtpStatus('');
      inputRefs.current[0]?.focus();
    } catch (err: unknown) {
      toast.error(toErrorMessage(err, 'Failed to resend code'));
      setResendTimer(0);
    }
  };

  return (
    <div className="verify-page page">
      <div className="verify-card">
        {/* Step indicators */}
        <div className="verify-steps">
          <div className={`step-dot ${step === 'request' ? 'active' : ''} ${step !== 'request' ? 'done' : ''}`} />
          <div className={`step-line ${step !== 'request' ? 'done' : 'active'}`} />
          <div className={`step-dot ${step === 'reset' ? 'active' : ''} ${step === 'done' ? 'done' : ''}`} />
        </div>

        {step === 'done' ? (
          <div className="verify-success">
            <div className="success-checkmark">✓</div>
            <h2>Password Updated</h2>
            <p>You can now sign in with your new password. Redirecting…</p>
          </div>
        ) : step === 'request' ? (
          <div className="verify-step-content">
            <div className="verify-header">
              <div className="verify-icon"><FaBalanceScale /></div>
              <h1>Forgot Password?</h1>
              <p>Enter your account email and we'll send you a 6-digit reset code.</p>
            </div>

            <form onSubmit={requestCode} className="auth-form">
              <div className="form-group">
                <label className="form-label" htmlFor="forgot-email">Email Address</label>
                <input
                  id="forgot-email"
                  type="email"
                  className="form-input"
                  required
                  value={email}
                  onChange={e => { setEmail(e.target.value); setError(''); }}
                  placeholder="you@example.com"
                  autoComplete="email"
                />
              </div>

              <div className="verify-error">{error}</div>

              <button
                type="submit"
                className="verify-btn verify-btn-primary"
                disabled={loading || !email.trim()}
                id="forgot-submit-btn"
              >
                {loading ? 'Sending…' : 'Send Reset Code'}
              </button>
            </form>

            <p className="auth-footer">
              Remembered it? <Link to="/auth/login" className="auth-link">Back to Sign In</Link>
            </p>
          </div>
        ) : (
          <div className="verify-step-content">
            <div className="verify-header">
              <div className="verify-icon"><FaKey /></div>
              <h1>Set a New Password</h1>
              <p>
                Enter the code sent to <span className="verify-email-highlight">{maskEmail(email)}</span>
                {' '}and choose a new password.
              </p>
            </div>

            {/* OTP inputs */}
            <div className="otp-input-group" onPaste={handlePaste}>
              {otp.map((digit, i) => (
                <input
                  key={i}
                  ref={el => { inputRefs.current[i] = el; }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={e => handleOtpChange(i, e.target.value)}
                  onKeyDown={e => handleKeyDown(i, e)}
                  className={`otp-input ${otpStatus}`}
                  autoComplete="one-time-code"
                  aria-label={`Reset code digit ${i + 1}`}
                  id={`reset-otp-${i}`}
                />
              ))}
            </div>

            <div className="form-group" style={{ marginTop: 20 }}>
              <label className="form-label" htmlFor="new-password">New Password</label>
              <div className="pass-wrap">
                <input
                  id="new-password"
                  type={showPass ? 'text' : 'password'}
                  className="form-input"
                  value={password}
                  onChange={e => { setPassword(e.target.value); setError(''); }}
                  placeholder={`Min ${MIN_PASSWORD_LENGTH} characters`}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  className="pass-toggle"
                  onClick={() => setShowPass(!showPass)}
                  aria-label={showPass ? 'Hide password' : 'Show password'}
                >
                  {showPass ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="confirm-password">Confirm Password</label>
              <input
                id="confirm-password"
                type={showPass ? 'text' : 'password'}
                className="form-input"
                value={confirm}
                onChange={e => { setConfirm(e.target.value); setError(''); }}
                placeholder="Re-enter your new password"
                autoComplete="new-password"
              />
            </div>

            <div className="verify-timer">
              {resendTimer > 0
                ? <>You can request a new code in <strong>{resendTimer}s</strong></>
                : <>Didn't receive a code?</>}
            </div>

            <div className="verify-error">{error}</div>

            <div className="verify-actions">
              <button
                className="verify-btn verify-btn-primary"
                onClick={submitReset}
                disabled={loading || otpString.length !== OTP_LENGTH || !password || !confirm}
                id="reset-submit-btn"
              >
                {loading ? 'Resetting…' : 'Reset Password'}
              </button>
              <button
                className="verify-btn verify-btn-ghost"
                onClick={handleResend}
                disabled={resendTimer > 0}
                id="reset-resend-btn"
              >
                {resendTimer > 0 ? `Resend in ${resendTimer}s` : 'Resend Code'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;
