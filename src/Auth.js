import React, { useState, useEffect, useRef } from 'react';
import { auth, googleProvider } from './firebase';
import { signInWithPopup, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { saveUserToFirestore, updateUserLogin, logAuthEvent, findUserByEmail, checkPhoneExists } from './firebase';

// Simulated user database stored in localStorage
const DB_KEY = 'smartcrop_users';
export const SESSION_KEY = 'smartcrop_session';

function getUsers() {
  try { return JSON.parse(localStorage.getItem(DB_KEY)) || []; } catch { return []; }
}
function saveUsers(users) {
  localStorage.setItem(DB_KEY, JSON.stringify(users));
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

  function go(s) { setScreen(s); setError(''); setSuccess(''); }

  // ── Google Sign In ───────────────────────────────────────────────────────
  async function handleGoogleSignIn() {
    setError(''); setLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      
      let dbUser = await findUserByEmail(user.email);
      if (!dbUser) {
        // Create new user record
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

  // ── Email Sign In ────────────────────────────────────────────────────────
  async function handleSignIn(e) {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const result = await signInWithEmailAndPassword(auth, siId, siPwd);
      const user = result.user;
      
      let dbUser = await findUserByEmail(user.email);
      if (!dbUser) {
        // Fallback to local storage if not in Firestore
        const users = getUsers();
        dbUser = users.find(u => u.email === user.email);
      }
      
      if (!dbUser) {
        dbUser = {
           id: user.uid,
           name: user.displayName || user.email.split('@')[0],
           email: user.email,
           avatar: (user.displayName || user.email).charAt(0).toUpperCase()
        };
      }

      await logAuthEvent('signin_email', user.email, dbUser.name);
      await updateUserLogin(user.email);
      
      localStorage.setItem(SESSION_KEY, JSON.stringify(dbUser));
      setSuccess('Signed in successfully!');
      setTimeout(() => onLogin(dbUser), 1000);
    } catch (err) {
      console.error(err);
      setError('Invalid email or password.');
      setLoading(false);
    }
  }

  // ── Email Sign Up ────────────────────────────────────────────────────────
  async function handleSignUp(e) {
    e.preventDefault();
    setError('');
    if (!suName.trim()) return setError('Full name is required.');
    if (!suEmail) return setError('Email is required.');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(suEmail)) return setError('Invalid email address.');
    if (suPwd.length < 6) return setError('Password must be at least 6 characters.');
    if (suPwd !== suConf) return setError('Passwords do not match.');
    
    setLoading(true);
    
    try {
      const result = await createUserWithEmailAndPassword(auth, suEmail, suPwd);
      const user = result.user;
      
      const newUser = {
        id: user.uid,
        name: suName,
        email: suEmail,
        phone: suPhone,
        password: suPwd, // Note: Storing passwords in plain text is bad practice. In production, rely on Firebase Auth.
        state: suState,
        joinedAt: new Date().toISOString(),
        avatar: suName.charAt(0).toUpperCase(),
        authProvider: 'email'
      };
      
      const firestoreId = await saveUserToFirestore(newUser);
      await logAuthEvent('signup_email', suEmail, suName);
      if (firestoreId) newUser.firestoreId = firestoreId;
      
      const users = getUsers();
      users.push(newUser);
      saveUsers(users);
      
      localStorage.setItem(SESSION_KEY, JSON.stringify(newUser));
      setSuccess('Account created! Welcome to Smart Crop Advisor AI 🌾');
      setTimeout(() => onLogin(newUser), 1200);
      
    } catch (err) {
      console.error(err);
      if (err.code === 'auth/email-already-in-use') {
        setError('Email already registered.');
      } else {
        setError('Sign up failed: ' + err.message);
      }
      setLoading(false);
    }
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

            <form onSubmit={handleSignIn} className="auth-form">
              <div className="af">
                <label>Email Address</label>
                <div className="ai">
                  <span>📧</span>
                  <input type="email" placeholder="farmer@example.com"
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
                  <label>Email Address *</label>
                  <div className="ai">
                    <span>📧</span>
                    <input type="email" placeholder="farmer@example.com" value={suEmail} onChange={e => setSuEmail(e.target.value)} required />
                  </div>
                </div>
                <div className="af">
                  <label>Phone Number (Optional)</label>
                  <div className="ai">
                    <span>📱</span>
                    <b className="prefix">+91</b>
                    <input type="tel" placeholder="9876543210" maxLength="10"
                      value={suPhone} onChange={e => setSuPhone(e.target.value.replace(/\D/g,'').slice(0,10))} />
                  </div>
                </div>
              </div>

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

              <button type="submit" className="auth-primary" disabled={loading}>
                 {loading ? <span className="spin" /> : '🚀 Sign Up'}
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
              Sign up with Google
            </button>

            <p className="auth-switch-p">Already registered? <button className="auth-link" onClick={() => go('signin')}>Sign In</button></p>
          </div>
        )}

        <p className="auth-footer">© 2026 Smart Crop Advisor AI · Made with ❤️ for Indian Farmers</p>
      </div>
    </div>
  );
}
