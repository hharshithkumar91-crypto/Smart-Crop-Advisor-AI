import React, { useState, useEffect, useRef } from 'react';
import { auth, googleProvider } from './firebase';
import { RecaptchaVerifier, signInWithPhoneNumber, signInWithPopup } from "firebase/auth";
import { saveUserToFirestore, updateUserLogin, logAuthEvent, findUserByPhone, findUserByEmail } from './firebase';

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

  // Permissions Modal state
  const [showPermissionsModal, setShowPermissionsModal] = useState(true);
  const [locPermission, setLocPermission] = useState('prompt');
  const [smsPermission, setSmsPermission] = useState('prompt');

  useEffect(() => {
    // Check if permission already granted
    if (navigator.permissions && navigator.permissions.query) {
      navigator.permissions.query({ name: 'geolocation' }).then(res => {
        setLocPermission(res.state);
      });
      navigator.permissions.query({ name: 'notifications' }).then(res => {
        setSmsPermission(res.state);
      });
    }
  }, []);

  useEffect(() => () => clearInterval(timerRef.current), []);

  function go(s) { setScreen(s); setError(''); setSuccess(''); }

  // Requests browser location and auto-detects the closest state/district
  const requestLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }
    setLocPermission('requesting');
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setLocPermission('granted');
        
        // Find nearest district from coordinates map
        let nearestState = 'Telangana';
        let nearestDistrict = 'Hyderabad';
        let minDist = Infinity;
        
        const COORDS = {
          'Telangana': { Hyderabad: { lat: 17.385, lng: 78.4867 }, Warangal: { lat: 17.978, lng: 79.5941 } },
          'Andhra Pradesh': { Visakhapatnam: { lat: 17.6868, lng: 83.2185 }, Vijayawada: { lat: 16.5062, lng: 80.6480 } },
          'Maharashtra': { Mumbai: { lat: 19.076, lng: 72.8777 }, Pune: { lat: 18.5204, lng: 73.8567 } },
          'Karnataka': { 'Bengaluru Urban': { lat: 12.9716, lng: 77.5946 } },
          'Tamil Nadu': { Chennai: { lat: 13.0827, lng: 80.2707 }, Coimbatore: { lat: 11.0168, lng: 76.9558 } },
          'Uttar Pradesh': { Lucknow: { lat: 26.8467, lng: 80.9462 } },
          'Punjab': { Ludhiana: { lat: 30.9010, lng: 75.8573 } },
          'Gujarat': { Ahmedabad: { lat: 23.0225, lng: 72.5714 } },
          'Rajasthan': { Jaipur: { lat: 26.9124, lng: 75.7873 } },
          'Madhya Pradesh': { Bhopal: { lat: 23.2599, lng: 77.4126 } },
          'West Bengal': { Kolkata: { lat: 22.5726, lng: 88.3639 } },
          'Bihar': { Patna: { lat: 25.6093, lng: 85.1376 } },
          'Odisha': { Bhubaneswar: { lat: 20.2961, lng: 85.8245 } },
          'Kerala': { Thiruvananthapuram: { lat: 8.5241, lng: 76.9366 } },
          'Haryana': { Gurugram: { lat: 28.4595, lng: 77.0266 } },
        };

        Object.entries(COORDS).forEach(([st, dists]) => {
          Object.entries(dists).forEach(([dist, coord]) => {
            const d = Math.pow(coord.lat - latitude, 2) + Math.pow(coord.lng - longitude, 2);
            if (d < minDist) {
              minDist = d;
              nearestState = st;
              nearestDistrict = dist;
            }
          });
        });

        setSuState(nearestState);
        // Save detected location in session storage to pass to App
        sessionStorage.setItem('detected_state', nearestState);
        sessionStorage.setItem('detected_district', nearestDistrict);
      },
      () => {
        setLocPermission('denied');
      }
    );
  };

  // Request SMS alerts and Notification access
  const requestSMSNotification = async () => {
    setSmsPermission('requesting');
    try {
      // Notification permission request
      if ('Notification' in window) {
        const permission = await Notification.requestPermission();
        setSmsPermission(permission);
      } else {
        setSmsPermission('granted'); // WebOTP fallback
      }
    } catch {
      setSmsPermission('denied');
    }
  };

  function startTimer() {
    setTimer(60);
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setTimer(t => { if (t <= 1) { clearInterval(timerRef.current); return 0; } return t - 1; });
    }, 1000);
  }

    async function handleGoogleSignIn() {
    setError(''); setLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      
      let dbUser = await findUserByEmail(user.email);
      if (!dbUser) {
        const newUser = {
          id: user.uid,
          name: user.displayName || 'Farmer',
          email: user.email,
          phone: user.phoneNumber || '',
          state: 'Unknown',
          joinedAt: new Date().toISOString(),
          avatar: (user.displayName || 'F').charAt(0).toUpperCase(),
          authProvider: 'google'
        };
        const firestoreId = await saveUserToFirestore(newUser);
        await logAuthEvent('signup_google', user.email, newUser.name);
        if (firestoreId) newUser.firestoreId = firestoreId;
        dbUser = newUser;
        
        const users = getUsers();
        users.push(dbUser);
        saveUsers(users);
      } else {
        await logAuthEvent('signin_google', user.email, dbUser.name);
        await updateUserLogin(user.email);
      }
      
      localStorage.setItem(SESSION_KEY, JSON.stringify(dbUser));
      setSuccess('Signed in with Google successfully!');
      setTimeout(() => onLogin(dbUser), 1000);
    } catch (err) {
      console.error(err);
      setError('Google Sign-In failed: ' + err.message);
      setLoading(false);
    }
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
  async function handleSignIn(e) {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      // Try Firestore first
      let user = null;
      if (siId.includes('@')) {
        user = await findUserByEmail(siId);
      } else {
        user = await findUserByPhone(siId);
      }
      // Fallback to localStorage
      if (!user) {
        const users = getUsers();
        user = users.find(u =>
          (u.email === siId || u.phone === siId) && u.password === siPwd
        );
      } else if (user.password !== siPwd) {
        user = null;
      }
      setLoading(false);
      if (!user) { setError('Invalid email/phone or password. Try again.'); return; }
      // Log signin event to Firestore
      await logAuthEvent('signin', user.phone || siId, user.name);
      await updateUserLogin(user.phone || siId);
      localStorage.setItem(SESSION_KEY, JSON.stringify(user));
      onLogin(user);
    } catch (err) {
      setLoading(false);
      // Fallback to localStorage if Firestore fails
      const users = getUsers();
      const user = users.find(u =>
        (u.email === siId || u.phone === siId) && u.password === siPwd
      );
      if (!user) { setError('Invalid email/phone or password. Try again.'); return; }
      localStorage.setItem(SESSION_KEY, JSON.stringify(user));
      onLogin(user);
    }
  }

  // ── Sign Up ──────────────────────────────────────────────────────────────
  function handleSignUp(e) {
    e.preventDefault();
    setError('');
    if (!suName.trim()) return setError('Full name is required.');
    if (!suPhone) return setError('Phone number is required for real OTP verification.');
    if (!/^\d{10}$/.test(suPhone)) return setError('Phone must be 10 digits (without +91).');
    if (suEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(suEmail)) return setError('Invalid email address.');
    if (suPwd.length < 6) return setError('Password must be at least 6 characters.');
    if (suPwd !== suConf) return setError('Passwords do not match.');
    const users = getUsers();
    if (suEmail && users.find(u => u.email === suEmail)) return setError('Email already registered.');
    if (users.find(u => u.phone === suPhone)) return setError('Phone already registered.');
    // Always use phone for Firebase SMS OTP
    sendOTP(`+91${suPhone}`, 'signup');
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
      // Save to localStorage
      users.push(newUser);
      saveUsers(users);
      localStorage.setItem(SESSION_KEY, JSON.stringify(newUser));
      // Save to Firestore cloud database
      try {
        const firestoreId = await saveUserToFirestore(newUser);
        await logAuthEvent('signup', suPhone, suName);
        if (firestoreId) newUser.firestoreId = firestoreId;
      } catch (e) { console.error('Firestore save failed:', e); }
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
            <div style={{ marginTop: '1.5rem' }}>
                <button type="button" className="auth-google-btn" onClick={handleGoogleSignIn} disabled={loading} style={{
                    width: '100%', padding: '0.8rem', background: '#fff', color: '#333', border: '1px solid #ccc', borderRadius: '8px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', fontWeight: 'bold', cursor: 'pointer'
                }}>
                  <svg viewBox="0 0 24 24" width="20" height="20" xmlns="http://www.w3.org/2000/svg" style={{ marginRight: '4px' }}>
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
                  </svg>
                  Continue with Google
                </button>
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
            <div style={{ margin: '1.5rem 0', textAlign: 'center', color: '#8855bb', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ flex: 1, height: '1px', background: 'rgba(255,0,255,0.2)' }} />
                <span>OR</span>
                <div style={{ flex: 1, height: '1px', background: 'rgba(255,0,255,0.2)' }} />
            </div>
            <button type="button" className="auth-google-btn" onClick={handleGoogleSignIn} disabled={loading} style={{
                width: '100%', padding: '0.8rem', background: '#fff', color: '#333', border: '1px solid #ccc', borderRadius: '8px',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', fontWeight: 'bold', cursor: 'pointer'
            }}>
              <svg viewBox="0 0 24 24" width="20" height="20" xmlns="http://www.w3.org/2000/svg" style={{ marginRight: '4px' }}>
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
              </svg>
              Sign in with Google
            </button>
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
            <div style={{ margin: '1.5rem 0', textAlign: 'center', color: '#8855bb', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ flex: 1, height: '1px', background: 'rgba(255,0,255,0.2)' }} />
                <span>OR</span>
                <div style={{ flex: 1, height: '1px', background: 'rgba(255,0,255,0.2)' }} />
            </div>
            <button type="button" className="auth-google-btn" onClick={handleGoogleSignIn} disabled={loading} style={{
                width: '100%', padding: '0.8rem', background: '#fff', color: '#333', border: '1px solid #ccc', borderRadius: '8px',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', fontWeight: 'bold', cursor: 'pointer'
            }}>
              <svg viewBox="0 0 24 24" width="20" height="20" xmlns="http://www.w3.org/2000/svg" style={{ marginRight: '4px' }}>
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
              </svg>
              Sign up with Google
            </button>
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

            {/* Only show demo OTP hint for email-based (non-phone) fallback */}
            {genOtp && !otpTarget.startsWith('+91') && (
              <div className="otp-demo-box">
                🧪 <strong>Email Demo OTP:</strong> <code className="otp-code">{genOtp}</code>
              </div>
            )}

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

      {/* Permissions Request Modal Overlay */}
      {showPermissionsModal && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 10000, padding: '1rem', backdropFilter: 'blur(8px)'
        }}>
          <div style={{
            background: '#1a1a1a', border: '1px solid #333',
            borderRadius: 16, padding: '2rem', maxWidth: 460, width: '100%',
            boxShadow: '0 20px 50px rgba(0,0,0,0.5)', display: 'flex',
            flexDirection: 'column', gap: '1.25rem'
          }}>
            <div style={{ textAlign: 'center' }}>
              <span style={{ fontSize: '2.5rem' }}>⚙️</span>
              <h3 style={{ fontSize: '1.25rem', color: '#fff', marginTop: '0.5rem', fontWeight: 800 }}>Permissions Access Required</h3>
              <p style={{ fontSize: '0.82rem', color: '#888', marginTop: '0.25rem' }}>
                We need these permissions to configure your workspace for agricultural monitoring.
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {/* Geolocation permission */}
              <div style={{
                background: '#222', border: '1px solid #333', borderRadius: 10,
                padding: '0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <span style={{ fontSize: '1.5rem' }}>📍</span>
                  <div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#f1f1f1' }}>Location Geolocation</div>
                    <div style={{ fontSize: '0.7rem', color: '#888' }}>Detects your district/mandal for weather</div>
                  </div>
                </div>
                {locPermission === 'granted' ? (
                  <span style={{ color: '#22c55e', fontSize: '0.85rem', fontWeight: 700 }}>✅ Allowed</span>
                ) : locPermission === 'requesting' ? (
                  <span style={{ color: '#fbbf24', fontSize: '0.85rem' }}>Requesting...</span>
                ) : (
                  <button type="button" onClick={requestLocation} className="btn btn-outline" style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem' }}>
                    Allow
                  </button>
                )}
              </div>

              {/* Notification / SMS permission */}
              <div style={{
                background: '#222', border: '1px solid #333', borderRadius: 10,
                padding: '0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <span style={{ fontSize: '1.5rem' }}>💬</span>
                  <div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#f1f1f1' }}>SMS Alerts & Notify</div>
                    <div style={{ fontSize: '0.7rem', color: '#888' }}>Receive daily rate warnings & OTP autofill</div>
                  </div>
                </div>
                {smsPermission === 'granted' ? (
                  <span style={{ color: '#22c55e', fontSize: '0.85rem', fontWeight: 700 }}>✅ Allowed</span>
                ) : smsPermission === 'requesting' ? (
                  <span style={{ color: '#fbbf24', fontSize: '0.85rem' }}>Requesting...</span>
                ) : (
                  <button type="button" onClick={requestSMSNotification} className="btn btn-outline" style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem' }}>
                    Allow
                  </button>
                )}
              </div>
            </div>

            <button type="button" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}
              onClick={() => setShowPermissionsModal(false)}>
              Continue to Login / Sign In
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
