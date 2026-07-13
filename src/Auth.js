import React, { useState, useEffect, useRef } from 'react';
import { auth } from './firebase';
import { RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";

// Simulated user database stored in localStorage
const DB_KEY = 'smartcrop_users';
export const SESSION_KEY = 'smartcrop_session';

function getUsers() {
  try { return JSON.parse(localStorage.getItem(DB_KEY)) || []; } catch { return []; }
}
function saveUsers(users) {
  localStorage.setItem(DB_KEY, JSON.stringify(users));
}
function generateOTP() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

// ── OTP Box Input ─────────────────────────────────────────────────────────────
function OTPInput({ value, onChange }) {
  const inputs = useRef([]);
  const digits = (value + '      ').slice(0, 6).split('');

  const handleKey = (e, idx) => {
    const key = e.key;
    if (key === 'Backspace') {
      const next = [...digits];
      if (next[idx].trim()) {
        next[idx] = ' ';
        onChange(next.join('').trimEnd());
      } else if (idx > 0) {
        next[idx - 1] = ' ';
        onChange(next.join('').trimEnd());
        inputs.current[idx - 1]?.focus();
      }
      return;
    }
    if (/^\d$/.test(key)) {
      const next = [...digits];
      next[idx] = key;
      onChange(next.join('').trimEnd());
      if (idx < 5) inputs.current[idx + 1]?.focus();
    }
  };

  return (
    <div className="otp-grid">
      {digits.map((d, i) => (
        <input
          key={i}
          ref={el => (inputs.current[i] = el)}
          className={`otp-box${d.trim() ? ' filled' : ''}`}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={d.trim()}
          onChange={() => {}}
          onKeyDown={e => handleKey(e, i)}
          onFocus={e => e.target.select()}
          autoComplete="one-time-code"
        />
      ))}
    </div>
  );
}

// ── Password Strength ─────────────────────────────────────────────────────────
function pwdStrength(pwd) {
  let s = 0;
  if (pwd.length >= 8) s++;
  if (/[A-Z]/.test(pwd)) s++;
  if (/[0-9]/.test(pwd)) s++;
  if (/[^A-Za-z0-9]/.test(pwd)) s++;
  return s;
}
const STRENGTH_LABEL = ['', 'Weak', 'Fair', 'Good', 'Strong'];
const STRENGTH_CLASS = ['', 'str-weak', 'str-fair', 'str-good', 'str-strong'];

// ── Main Auth Component ───────────────────────────────────────────────────────
export default function Auth({ onLogin }) {
  const [screen, setScreen] = useState('landing');
  const [mode, setMode] = useState('email');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  // Sign In
  const [siId, setSiId] = useState('');
  const [siPwd, setSiPwd] = useState('');
  const [siShow, setSiShow] = useState(false);

  // Sign Up
  const [suName, setSuName] = useState('');
  const [suEmail, setSuEmail] = useState('');
  const [suPhone, setSuPhone] = useState('');
  const [suPwd, setSuPwd] = useState('');
  const [suConf, setSuConf] = useState('');
  const [suShow, setSuShow] = useState(false);
  const [suState, setSuState] = useState('Telangana');

  // OTP
  const [otp, setOtp] = useState('');
  const [genOtp, setGenOtp] = useState('');
  const [otpPurpose, setOtpPurpose] = useState('signup');
  const [otpTarget, setOtpTarget] = useState('');
  const [timer, setTimer] = useState(60);
  const timerRef = useRef(null);

  // Forgot / Reset
  const [forgotId, setForgotId] = useState('');
  const [newPwd, setNewPwd] = useState('');
  const [newConf, setNewConf] = useState('');

  useEffect(() => () => clearInterval(timerRef.current), []);

  function go(s) { setScreen(s); setError(''); setSuccess(''); }

  function startTimer() {
    setTimer(60);
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setTimer(t => { if (t <= 1) { clearInterval(timerRef.current); return 0; } return t - 1; });
    }, 1000);
  }

  async function sendOTP(target, purpose) {
    setOtpPurpose(purpose);
    setOtpTarget(target);
    setOtp('');
    setLoading(true);

    if (target.startsWith('+91')) {
      try {
        if (!window.recaptchaVerifier) {
          window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
            'size': 'invisible'
          });
        }
        const appVerifier = window.recaptchaVerifier;
        window.confirmationResult = await signInWithPhoneNumber(auth, target, appVerifier);
        setLoading(false);
        setSuccess(`Real SMS OTP sent successfully to ${target}!`);
      } catch (err) {
        setLoading(false);
        setError(`Failed to send SMS: ${err.message}`);
        return; // do not go to otp screen
      }
    } else {
      // Email demo fallback
      const code = generateOTP();
      setGenOtp(code);
      setLoading(false);
      setSuccess(`Demo Email OTP sent: ${code}`);
    }
    
    startTimer();
    setScreen('otp');
  }

  // ── Sign In ──────────────────────────────────────────────────────────────
  function handleSignIn(e) {
    e.preventDefault();
    setError(''); setLoading(true);
    setTimeout(() => {
      const users = getUsers();
      const user = users.find(u =>
        (u.email === siId || u.phone === siId) && u.password === siPwd
      );
      setLoading(false);
      if (!user) { setError('Invalid email/phone or password. Try again.'); return; }
      localStorage.setItem(SESSION_KEY, JSON.stringify(user));
      onLogin(user);
    }, 900);
  }

  // ── Sign Up ──────────────────────────────────────────────────────────────
  function handleSignUp(e) {
    e.preventDefault();
    setError('');
    if (!suName.trim()) return setError('Full name is required.');
    if (!suEmail && !suPhone) return setError('Provide at least an email or phone number.');
    if (suEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(suEmail)) return setError('Invalid email address.');
    if (suPhone && !/^\d{10}$/.test(suPhone)) return setError('Phone must be 10 digits.');
    if (suPwd.length < 6) return setError('Password must be at least 6 characters.');
    if (suPwd !== suConf) return setError('Passwords do not match.');
    const users = getUsers();
    if (suEmail && users.find(u => u.email === suEmail)) return setError('Email already registered.');
    if (suPhone && users.find(u => u.phone === suPhone)) return setError('Phone already registered.');
    sendOTP(suEmail || `+91 ${suPhone}`, 'signup');
  }

  // ── OTP Verify ───────────────────────────────────────────────────────────
  async function handleOTPVerify(e) {
    e.preventDefault();
    setError('');
    const entered = otp.replace(/\s/g, '');
    if (entered.length < 6) return setError('Enter all 6 digits.');
    
    if (otpTarget.startsWith('+91') && window.confirmationResult) {
      try {
        await window.confirmationResult.confirm(entered);
      } catch (err) {
        return setError('Incorrect OTP. Please try again.');
      }
    } else {
      if (entered !== genOtp) return setError('Incorrect OTP. Please try again.');
    }
    
    clearInterval(timerRef.current);

    if (otpPurpose === 'signup') {
      const users = getUsers();
      const newUser = {
        id: Date.now(),
        name: suName,
        email: suEmail,
        phone: suPhone,
        password: suPwd,
        state: suState,
        joinedAt: new Date().toISOString(),
        avatar: suName.charAt(0).toUpperCase()
      };
      users.push(newUser);
      saveUsers(users);
      localStorage.setItem(SESSION_KEY, JSON.stringify(newUser));
      setSuccess('Account created! Welcome to Smart Crop Advisor AI 🌾');
      setTimeout(() => onLogin(newUser), 1200);
    } else {
      go('reset');
    }
  }

  // ── Forgot Password ───────────────────────────────────────────────────────
  function handleForgot(e) {
    e.preventDefault();
    setError('');
    const users = getUsers();
    const user = users.find(u => u.email === forgotId || u.phone === forgotId);
    if (!user) return setError('No account found with that email or phone.');
    sendOTP(forgotId, 'forgot');
  }

  // ── Reset Password ────────────────────────────────────────────────────────
  function handleReset(e) {
    e.preventDefault();
    setError('');
    if (newPwd.length < 6) return setError('Password must be at least 6 characters.');
    if (newPwd !== newConf) return setError('Passwords do not match.');
    const users = getUsers();
    const idx = users.findIndex(u => u.email === forgotId || u.phone === forgotId);
    if (idx === -1) return setError('User not found.');
    users[idx].password = newPwd;
    saveUsers(users);
    setSuccess('Password reset successfully! Redirecting to sign in...');
    setTimeout(() => go('signin'), 1800);
  }

  const STATES = ['Telangana','Andhra Pradesh','Maharashtra','Karnataka','Madhya Pradesh','Gujarat','Rajasthan','Punjab','Haryana','Uttar Pradesh','Bihar','Odisha','Tamil Nadu','Kerala','West Bengal'];

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="auth-bg">
      <div className="auth-glow g1" />
      <div className="auth-glow g2" />
      <div className="auth-glow g3" />

      {/* Floating agri particles */}
      <div className="auth-particles">
        {['🌾','🌿','🌱','🍃','🌽','🌻','🌾','🌿','🌱','🍃','🌽','🌻'].map((e, i) => (
          <span key={i} className={`aparticle ap-${i+1}`}>{e}</span>
        ))}
      </div>

      <div className="auth-wrap">
        {/* Brand Header */}
        <div className="auth-brand">
          <span className="auth-brand-icon">🌾</span>
          <div>
            <div className="auth-brand-name">Smart Crop Advisor AI</div>
            <div className="auth-brand-tag">Powered by AgriVision · India's #1 Farm AI 🇮🇳</div>
          </div>
        </div>

        {/* ── LANDING ──────────────────────────────────────────────────────── */}
        {screen === 'landing' && (
          <div className="auth-card">
            <h1 className="auth-h1">Namaste, Farmer! 🙏</h1>
            <p className="auth-sub">Your AI-powered farm companion for smarter crop decisions, market prices, and more.</p>
            <div className="auth-pills">
              {['🌤 Weather','📈 Mandi Prices','🔬 Disease Scan','🤖 AI Chat','🏛 Schemes','💰 Ledger'].map(p => (
                <span key={p} className="auth-pill">{p}</span>
              ))}
            </div>
            <div className="auth-btns">
              <button className="auth-primary" onClick={() => go('signup')}>🚀 Create Free Account</button>
              <button className="auth-secondary" onClick={() => go('signin')}>🔑 Sign In</button>
            </div>
            <p className="auth-note">✅ Free forever for farmers · No hidden charges</p>
          </div>
        )}

        {/* ── SIGN IN ───────────────────────────────────────────────────────── */}
        {screen === 'signin' && (
          <div className="auth-card">
            <button className="auth-back-btn" onClick={() => go('landing')}>← Back</button>
            <h2 className="auth-h2">Sign In 🔑</h2>
            <p className="auth-sub">Welcome back! Enter your credentials below.</p>
            {error && <div className="auth-err">⚠️ {error}</div>}
            {success && <div className="auth-ok">✅ {success}</div>}

            <div className="auth-toggle">
              <button className={mode==='email'?'active':''} onClick={() => setMode('email')}>📧 Email</button>
              <button className={mode==='phone'?'active':''} onClick={() => setMode('phone')}>📱 Phone</button>
            </div>

            <form onSubmit={handleSignIn} className="auth-form">
              <div className="af">
                <label>{mode==='email' ? 'Email Address' : 'Phone Number'}</label>
                <div className="ai">
                  <span>{mode==='email' ? '📧' : '📱'}</span>
                  {mode==='phone' && <b className="prefix">+91</b>}
                  <input type={mode==='email'?'email':'tel'} placeholder={mode==='email'?'farmer@example.com':'9876543210'}
                    value={siId} onChange={e => setSiId(e.target.value)} required />
                </div>
              </div>
              <div className="af">
                <label>Password</label>
                <div className="ai">
                  <span>🔒</span>
                  <input type={siShow?'text':'password'} placeholder="Your password"
                    value={siPwd} onChange={e => setSiPwd(e.target.value)} required />
                  <button type="button" className="eye-btn" onClick={() => setSiShow(!siShow)}>{siShow?'🙈':'👁️'}</button>
                </div>
              </div>
              <button type="button" className="auth-link" onClick={() => go('forgot')}>Forgot Password?</button>
              <button type="submit" className="auth-primary" disabled={loading}>
                {loading ? <span className="spin" /> : '🔑 Sign In'}
              </button>
            </form>
            <p className="auth-switch-p">No account? <button className="auth-link" onClick={() => go('signup')}>Sign Up</button></p>
          </div>
        )}

        {/* ── SIGN UP ───────────────────────────────────────────────────────── */}
        {screen === 'signup' && (
          <div className="auth-card auth-card-lg">
            <button className="auth-back-btn" onClick={() => go('landing')}>← Back</button>
            <h2 className="auth-h2">Create Account 🌱</h2>
            <p className="auth-sub">Join thousands of farmers using AI to grow smarter.</p>
            {error && <div className="auth-err">⚠️ {error}</div>}

            <form onSubmit={handleSignUp} className="auth-form">
              <div className="af">
                <label>Full Name *</label>
                <div className="ai">
                  <span>👤</span>
                  <input type="text" placeholder="e.g. Ramesh Kumar" value={suName} onChange={e => setSuName(e.target.value)} required />
                </div>
              </div>

              <div className="auth-row">
                <div className="af">
                  <label>Email Address</label>
                  <div className="ai">
                    <span>📧</span>
                    <input type="email" placeholder="farmer@example.com" value={suEmail} onChange={e => setSuEmail(e.target.value)} />
                  </div>
                </div>
                <div className="af">
                  <label>Phone Number</label>
                  <div className="ai">
                    <span>📱</span>
                    <b className="prefix">+91</b>
                    <input type="tel" placeholder="9876543210" maxLength="10"
                      value={suPhone} onChange={e => setSuPhone(e.target.value.replace(/\D/g,'').slice(0,10))} />
                  </div>
                </div>
              </div>
              <small className="auth-hint-sm">Provide at least one contact for OTP verification.</small>

              <div className="af">
                <label>State / Region</label>
                <div className="ai">
                  <span>📍</span>
                  <select value={suState} onChange={e => setSuState(e.target.value)} className="auth-sel">
                    {STATES.map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>
              </div>

              <div className="auth-row">
                <div className="af">
                  <label>Password *</label>
                  <div className="ai">
                    <span>🔒</span>
                    <input type={suShow?'text':'password'} placeholder="Min. 6 characters"
                      value={suPwd} onChange={e => setSuPwd(e.target.value)} required />
                    <button type="button" className="eye-btn" onClick={() => setSuShow(!suShow)}>{suShow?'🙈':'👁️'}</button>
                  </div>
                  {suPwd && (
                    <div className="str-wrap">
                      <div className={`str-track ${STRENGTH_CLASS[pwdStrength(suPwd)]}`}>
                        <div className="str-fill" style={{width:`${pwdStrength(suPwd)*25}%`}} />
                      </div>
                      <span className={STRENGTH_CLASS[pwdStrength(suPwd)]}>{STRENGTH_LABEL[pwdStrength(suPwd)]}</span>
                    </div>
                  )}
                </div>
                <div className="af">
                  <label>Confirm Password *</label>
                  <div className="ai">
                    <span>🔐</span>
                    <input type="password" placeholder="Repeat password"
                      value={suConf} onChange={e => setSuConf(e.target.value)} required />
                    {suConf && <span className="match-ic">{suPwd===suConf?'✅':'❌'}</span>}
                  </div>
                </div>
              </div>

              <button type="submit" className="auth-primary">📲 Send OTP & Verify</button>
            </form>
            <p className="auth-switch-p">Already registered? <button className="auth-link" onClick={() => go('signin')}>Sign In</button></p>
          </div>
        )}

        {/* ── OTP VERIFY ───────────────────────────────────────────────────── */}
        {screen === 'otp' && (
          <div className="auth-card">
            <button className="auth-back-btn" onClick={() => go(otpPurpose==='signup'?'signup':'forgot')}>← Back</button>
            <div className="otp-hero">🔐</div>
            <h2 className="auth-h2">Enter OTP</h2>
            <p className="auth-sub">6-digit code sent to <strong>{otpTarget}</strong></p>
            {error && <div className="auth-err">⚠️ {error}</div>}

            <div className="otp-demo-box">
              🧪 <strong>Demo OTP:</strong> <code className="otp-code">{genOtp}</code>
            </div>

            {success && <div className="auth-ok">✅ {success}</div>}

            <form onSubmit={handleOTPVerify} className="auth-form">
              <OTPInput value={otp} onChange={setOtp} />
              <div className="otp-timer-row">
                {timer > 0
                  ? <span className="otp-countdown">Resend in <strong>{timer}s</strong></span>
                  : <button type="button" className="auth-link" onClick={() => sendOTP(otpTarget, otpPurpose)}>🔄 Resend OTP</button>}
              </div>
              <button type="submit" className="auth-primary" disabled={otp.replace(/\s/g,'').length < 6}>✅ Verify OTP</button>
            </form>
          </div>
        )}

        {/* ── FORGOT PASSWORD ───────────────────────────────────────────────── */}
        {screen === 'forgot' && (
          <div className="auth-card">
            <button className="auth-back-btn" onClick={() => go('signin')}>← Back</button>
            <div className="otp-hero">🔑</div>
            <h2 className="auth-h2">Forgot Password?</h2>
            <p className="auth-sub">Enter your registered email or phone to receive a reset OTP.</p>
            {error && <div className="auth-err">⚠️ {error}</div>}
            {success && <div className="auth-ok">✅ {success}</div>}
            <form onSubmit={handleForgot} className="auth-form">
              <div className="af">
                <label>Email or Phone</label>
                <div className="ai">
                  <span>🔍</span>
                  <input type="text" placeholder="Email or 10-digit phone" value={forgotId} onChange={e => setForgotId(e.target.value)} required />
                </div>
              </div>
              <button type="submit" className="auth-primary">📲 Send Reset OTP</button>
            </form>
            <p className="auth-switch-p">Remembered it? <button className="auth-link" onClick={() => go('signin')}>Sign In</button></p>
          </div>
        )}

        {/* ── RESET PASSWORD ────────────────────────────────────────────────── */}
        {screen === 'reset' && (
          <div className="auth-card">
            <div className="otp-hero">🔓</div>
            <h2 className="auth-h2">Create New Password</h2>
            <p className="auth-sub">Your OTP was verified. Set a strong new password.</p>
            {error && <div className="auth-err">⚠️ {error}</div>}
            {success && <div className="auth-ok">✅ {success}</div>}
            <form onSubmit={handleReset} className="auth-form">
              <div className="af">
                <label>New Password</label>
                <div className="ai">
                  <span>🔒</span>
                  <input type="password" placeholder="Min. 6 characters" value={newPwd} onChange={e => setNewPwd(e.target.value)} required />
                </div>
                {newPwd && (
                  <div className="str-wrap">
                    <div className={`str-track ${STRENGTH_CLASS[pwdStrength(newPwd)]}`}>
                      <div className="str-fill" style={{width:`${pwdStrength(newPwd)*25}%`}} />
                    </div>
                    <span className={STRENGTH_CLASS[pwdStrength(newPwd)]}>{STRENGTH_LABEL[pwdStrength(newPwd)]}</span>
                  </div>
                )}
              </div>
              <div className="af">
                <label>Confirm New Password</label>
                <div className="ai">
                  <span>🔐</span>
                  <input type="password" placeholder="Repeat new password" value={newConf} onChange={e => setNewConf(e.target.value)} required />
                  {newConf && <span className="match-ic">{newPwd===newConf?'✅':'❌'}</span>}
                </div>
              </div>
              <button type="submit" className="auth-primary">🔓 Reset Password</button>
            </form>
          </div>
        )}

        <div id="recaptcha-container"></div>
        <p className="auth-footer">© 2026 Smart Crop Advisor AI · Made with ❤️ for Indian Farmers</p>
      </div>
    </div>
  );
}
