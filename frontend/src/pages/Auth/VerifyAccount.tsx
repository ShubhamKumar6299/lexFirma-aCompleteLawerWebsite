import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { authAPI } from '../../services/api';
import toast from 'react-hot-toast';
import { FaEnvelopeOpenText, FaMobileAlt } from 'react-icons/fa';
import './Verify.css';

type Step = 'email' | 'phone' | 'done';

const RESEND_COOLDOWN = 60; // seconds

const maskEmail = (email: string): string => {
  const [local, domain] = email.split('@');
  if (local.length <= 2) return `${local[0]}***@${domain}`;
  return `${local[0]}${local[1]}${'*'.repeat(Math.min(local.length - 2, 6))}@${domain}`;
};

const maskPhone = (phone: string): string => {
  const digits = phone.replace(/\D/g, '');
  if (digits.length <= 4) return phone;
  return `${'*'.repeat(digits.length - 4)}${digits.slice(-4)}`;
};

const VerifyAccount: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const email = searchParams.get('email') || '';

  const [step, setStep] = useState<Step>('email');
  const [otp, setOtp] = useState<string[]>(Array(6).fill(''));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [otpStatus, setOtpStatus] = useState<'' | 'error' | 'success'>('');
  const [resendTimer, setResendTimer] = useState(RESEND_COOLDOWN);
  const [phone, setPhone] = useState('');

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Redirect if no email
  useEffect(() => {
    if (!email) {
      navigate('/auth/register');
    }
  }, [email, navigate]);

  // Resend countdown timer
  useEffect(() => {
    if (resendTimer <= 0) return;
    const timer = setInterval(() => {
      setResendTimer(prev => {
        if (prev <= 1) { clearInterval(timer); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [resendTimer]);

  // Auto-focus first input when step changes
  useEffect(() => {
    setOtp(Array(6).fill(''));
    setError('');
    setOtpStatus('');
    setTimeout(() => inputRefs.current[0]?.focus(), 100);
  }, [step]);

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    setError('');
    setOtpStatus('');

    // Auto-advance
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasted.length === 0) return;
    const newOtp = Array(6).fill('');
    for (let i = 0; i < pasted.length; i++) newOtp[i] = pasted[i];
    setOtp(newOtp);
    inputRefs.current[Math.min(pasted.length, 5)]?.focus();
  };

  const otpString = otp.join('');

  const verifyEmail = useCallback(async () => {
    if (otpString.length !== 6) { setError('Please enter the complete 6-digit code'); return; }
    setLoading(true);
    setError('');
    try {
      const res = await authAPI.verifyEmail(email, otpString);
      setOtpStatus('success');
      toast.success('Email verified! ✉️');

      if (res.data.needsPhoneVerification) {
        setPhone(res.data.phone || '');
        // Send phone OTP
        setTimeout(async () => {
          try {
            await authAPI.sendPhoneOtp(email, res.data.phone);
            setStep('phone');
            setResendTimer(RESEND_COOLDOWN);
          } catch (err: any) {
            // If Twilio isn't configured, skip phone verification
            const msg = err.response?.data?.message || '';
            if (msg.includes('not configured') || msg.includes('credentials')) {
              toast.success('Phone verification skipped (SMS service not configured)');
              setStep('done');
              setTimeout(() => navigate('/auth/login'), 2000);
            } else {
              toast.error(msg || 'Failed to send phone OTP');
              setStep('phone');
              setResendTimer(0);
            }
          }
        }, 1000);
      } else {
        setTimeout(() => {
          setStep('done');
          setTimeout(() => navigate('/auth/login'), 2500);
        }, 1000);
      }
    } catch (err: any) {
      setOtpStatus('error');
      setError(err.response?.data?.message || 'Verification failed');
    } finally {
      setLoading(false);
    }
  }, [email, otpString, navigate]);

  const verifyPhone = useCallback(async () => {
    if (otpString.length !== 6) { setError('Please enter the complete 6-digit code'); return; }
    setLoading(true);
    setError('');
    try {
      await authAPI.verifyPhone(email, otpString);
      setOtpStatus('success');
      toast.success('Phone verified! 📱');
      setTimeout(() => {
        setStep('done');
        setTimeout(() => navigate('/auth/login'), 2500);
      }, 1000);
    } catch (err: any) {
      setOtpStatus('error');
      setError(err.response?.data?.message || 'Verification failed');
    } finally {
      setLoading(false);
    }
  }, [email, otpString, navigate]);

  const handleResend = async () => {
    setResendTimer(RESEND_COOLDOWN);
    try {
      await authAPI.resendOtp(email, step === 'email' ? 'email' : 'phone');
      toast.success(`New code sent to your ${step === 'email' ? 'email' : 'phone'}!`);
      setOtp(Array(6).fill(''));
      setError('');
      setOtpStatus('');
      inputRefs.current[0]?.focus();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to resend OTP');
      setResendTimer(0);
    }
  };

  const handleVerify = () => {
    if (step === 'email') verifyEmail();
    else if (step === 'phone') verifyPhone();
  };

  // Step indicators
  const emailDone = step === 'phone' || step === 'done';
  const phoneDone = step === 'done';

  if (!email) return null;

  return (
    <div className="verify-page page">
      <div className="verify-card">
        {/* Step indicators */}
        <div className="verify-steps">
          <div className={`step-dot ${step === 'email' ? 'active' : ''} ${emailDone ? 'done' : ''}`} />
          <div className={`step-line ${emailDone ? 'done' : step === 'email' ? 'active' : ''}`} />
          <div className={`step-dot ${step === 'phone' ? 'active' : ''} ${phoneDone ? 'done' : ''}`} />
        </div>

        {step === 'done' ? (
          <div className="verify-success">
            <div className="success-checkmark">✓</div>
            <h2>All Verified!</h2>
            <p>Your account is ready. Redirecting to login...</p>
          </div>
        ) : (
          <div className="verify-step-content" key={step}>
            {/* Header */}
            <div className="verify-header">
              <div className="verify-icon">
                {step === 'email' ? <FaEnvelopeOpenText /> : <FaMobileAlt />}
              </div>
              <h1>{step === 'email' ? 'Verify Your Email' : 'Verify Your Phone'}</h1>
              <p>
                {step === 'email' ? (
                  <>We've sent a 6-digit code to <span className="verify-email-highlight">{maskEmail(email)}</span></>
                ) : (
                  <>Enter the code sent to <span className="verify-email-highlight">{maskPhone(phone)}</span></>
                )}
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
                  id={`otp-input-${i}`}
                />
              ))}
            </div>

            {/* Timer */}
            <div className="verify-timer">
              {resendTimer > 0 ? (
                <>Code expires in <strong>{Math.floor(resendTimer / 60)}:{(resendTimer % 60).toString().padStart(2, '0')}</strong></>
              ) : (
                <>Didn't receive a code?</>
              )}
            </div>

            {/* Error */}
            <div className="verify-error">{error}</div>

            {/* Actions */}
            <div className="verify-actions">
              <button
                className="verify-btn verify-btn-primary"
                onClick={handleVerify}
                disabled={loading || otpString.length !== 6}
                id="verify-submit-btn"
              >
                {loading ? 'Verifying...' : 'Verify'}
              </button>
              <button
                className="verify-btn verify-btn-ghost"
                onClick={handleResend}
                disabled={resendTimer > 0}
                id="verify-resend-btn"
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

export default VerifyAccount;
