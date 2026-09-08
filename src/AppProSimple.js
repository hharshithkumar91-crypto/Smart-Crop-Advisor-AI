import React, { useState, useEffect } from 'react';
import Auth, { SESSION_KEY } from './Auth';

const API_URL = 'http://127.0.0.1:8000';

function App() {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');

  useEffect(() => {
    const saved = localStorage.getItem(SESSION_KEY);
    if (saved) setUser(JSON.parse(saved));
  }, []);

  const handleLogin = (u) => setUser(u);
  const handleLogout = () => {
    localStorage.removeItem(SESSION_KEY);
    setUser(null);
  };

  if (!user) return <Auth onLogin={handleLogin} />;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: '#0f1419', color: 'white' }}>
      <div style={{ padding: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ margin: 0 }}>🌾 Smart Crop Advisor AI</h1>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <span>Welcome, {user.name}!</span>
          <button onClick={handleLogout} style={{ padding: '0.5rem 1rem', background: '#ff4444', border: 'none', borderRadius: '4px', cursor: 'pointer', color: 'white' }}>
            Logout
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        <div style={{ width: '200px', borderRight: '1px solid rgba(255,255,255,0.1)', padding: '1rem' }}>
          <button 
            onClick={() => setActiveTab('dashboard')}
            style={{ width: '100%', padding: '0.75rem', marginBottom: '0.5rem', background: activeTab === 'dashboard' ? '#2d7c3a' : 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '4px', cursor: 'pointer', color: 'white', textAlign: 'left' }}
          >
            📊 Dashboard
          </button>
          <button 
            onClick={() => setActiveTab('prices')}
            style={{ width: '100%', padding: '0.75rem', marginBottom: '0.5rem', background: activeTab === 'prices' ? '#2d7c3a' : 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '4px', cursor: 'pointer', color: 'white', textAlign: 'left' }}
          >
            💰 Market Prices
          </button>
          <button 
            onClick={() => setActiveTab('eligibility')}
            style={{ width: '100%', padding: '0.75rem', marginBottom: '0.5rem', background: activeTab === 'eligibility' ? '#2d7c3a' : 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '4px', cursor: 'pointer', color: 'white', textAlign: 'left' }}
          >
            ✅ Eligibility
          </button>
          <button 
            onClick={() => setActiveTab('schemes')}
            style={{ width: '100%', padding: '0.75rem', background: activeTab === 'schemes' ? '#2d7c3a' : 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '4px', cursor: 'pointer', color: 'white', textAlign: 'left' }}
          >
            🎁 Schemes
          </button>
        </div>

        <div style={{ flex: 1, padding: '2rem', overflowY: 'auto' }}>
          {activeTab === 'dashboard' && (
            <div>
              <h2>📊 Dashboard</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem', marginTop: '2rem' }}>
                <div style={{ background: 'rgba(45, 124, 58, 0.15)', border: '1px solid rgba(45, 124, 58, 0.3)', padding: '1.5rem', borderRadius: '12px' }}>
                  <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#2d7c3a' }}>10</div>
                  <div style={{ color: '#aaa', fontSize: '0.9rem', marginTop: '0.5rem' }}>Government Schemes</div>
                </div>
                <div style={{ background: 'rgba(45, 124, 58, 0.15)', border: '1px solid rgba(45, 124, 58, 0.3)', padding: '1.5rem', borderRadius: '12px' }}>
                  <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#2d7c3a' }}>7</div>
                  <div style={{ color: '#aaa', fontSize: '0.9rem', marginTop: '0.5rem' }}>Eligible for You</div>
                </div>
                <div style={{ background: 'rgba(45, 124, 58, 0.15)', border: '1px solid rgba(45, 124, 58, 0.3)', padding: '1.5rem', borderRadius: '12px' }}>
                  <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#2d7c3a' }}>₹45K</div>
                  <div style={{ color: '#aaa', fontSize: '0.9rem', marginTop: '0.5rem' }}>Market Value</div>
                </div>
                <div style={{ background: 'rgba(45, 124, 58, 0.15)', border: '1px solid rgba(45, 124, 58, 0.3)', padding: '1.5rem', borderRadius: '12px' }}>
                  <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#2d7c3a' }}>✓</div>
                  <div style={{ color: '#aaa', fontSize: '0.9rem', marginTop: '0.5rem' }}>Farm Status: Excellent</div>
                </div>
              </div>
              <div style={{ marginTop: '2rem', background: 'rgba(255,255,255,0.05)', padding: '1.5rem', borderRadius: '12px' }}>
                <h3>🌤️ Weather Alert</h3>
                <p>Current: 32°C | Humidity: 72% | Rain Chance: 65%</p>
                <p style={{ fontSize: '0.9rem', color: '#aaa' }}>Heavy rain expected in next 24 hours. Avoid pesticide spraying.</p>
              </div>
            </div>
          )}

          {activeTab === 'prices' && (
            <div>
              <h2>💰 Market Prices</h2>
              <p style={{ color: '#aaa', marginTop: '1rem' }}>Select a location and commodity to view live market prices.</p>
              <div style={{ marginTop: '1.5rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
                {['Tomato', 'Onion', 'Potato', 'Wheat', 'Rice', 'Cotton'].map(commodity => (
                  <div key={commodity} style={{ background: 'rgba(255,255,255,0.05)', padding: '1rem', borderRadius: '8px', textAlign: 'center' }}>
                    <div style={{ fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>{commodity}</div>
                    <div style={{ fontSize: '1.5rem', color: '#2d7c3a', fontWeight: 'bold' }}>₹{Math.floor(Math.random() * 40) + 20}/unit</div>
                    <div style={{ fontSize: '0.8rem', color: '#aaa', marginTop: '0.5rem' }}>Hyderabad Market</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'eligibility' && (
            <div>
              <h2>✅ Eligibility Checker</h2>
              <div style={{ marginTop: '2rem', background: 'rgba(255,255,255,0.05)', padding: '1.5rem', borderRadius: '12px' }}>
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem' }}>Land Size (Acres)</label>
                  <input type="number" placeholder="e.g. 5.5" defaultValue="5.5" style={{ width: '100%', padding: '0.75rem', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '4px', color: 'white' }} />
                </div>
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem' }}>State</label>
                  <select defaultValue="Telangana" style={{ width: '100%', padding: '0.75rem', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '4px', color: 'white' }}>
                    <option value="Telangana">Telangana</option>
                    <option value="Andhra Pradesh">Andhra Pradesh</option>
                    <option value="Maharashtra">Maharashtra</option>
                    <option value="Karnataka">Karnataka</option>
                  </select>
                </div>
                <button style={{ width: '100%', padding: '0.75rem', background: '#2d7c3a', border: 'none', borderRadius: '4px', color: 'white', cursor: 'pointer', fontWeight: 'bold' }}>
                  Check Eligibility
                </button>
              </div>
            </div>
          )}

          {activeTab === 'schemes' && (
            <div>
              <h2>🎁 Government Schemes</h2>
              <div style={{ marginTop: '2rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem' }}>
                {[
                  { name: 'PM-KISAN', benefit: '₹6000/year direct cash transfer' },
                  { name: 'Soil Health Card Scheme', benefit: 'Free soil testing & cards' },
                  { name: 'Pradhan Mantri Fasal Bima Yojana', benefit: 'Crop insurance coverage' },
                  { name: 'e-NAM Portal', benefit: 'Direct mandi access online' }
                ].map(scheme => (
                  <div key={scheme.name} style={{ background: 'rgba(255,255,255,0.05)', padding: '1.5rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }}>
                    <h3 style={{ margin: '0 0 0.5rem 0' }}>{scheme.name}</h3>
                    <p style={{ margin: '0.5rem 0', color: '#aaa' }}>{scheme.benefit}</p>
                    <button style={{ marginTop: '1rem', padding: '0.5rem 1rem', background: '#2d7c3a', border: 'none', borderRadius: '4px', color: 'white', cursor: 'pointer' }}>
                      Learn More →
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
