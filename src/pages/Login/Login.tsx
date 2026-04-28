import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Eye, EyeOff, User } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import logo from '../../assets/logo.png';
import './Login.css';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { employees } = useData();

  const [showPassword, setShowPassword] = useState(false);
  const [employeeId, setEmployeeId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const employee = employees.find(emp => emp.id === employeeId);

    if (employee && password === 'password123') {
      if (employee.status === 'Locked') {
        navigate('/account-locked');
        return;
      }

      login(employee);
      navigate('/dashboard');
    } else {
      setError('Invalid Employee ID or password. Please try again.');
    }
  };

  return (
    <div className="login-page">
      <div className="login-left">
        <div className="login-left-content">
          <div className="login-logo" style={{ background: 'transparent', padding: '0' }}>
            <img src={logo} alt="30 Speedex Logo" style={{ height: '48px', objectFit: 'contain' }} />
          </div>
          <p className="login-tagline">COURIER & FORWARDER, INC.</p>
          <div className="login-steps">
            <div className="login-step">
              <div className="login-step-number">1</div>
              <div>
                <strong>Enter Credentials</strong>
                <p>Use your assigned Employee ID and password to access the system.</p>
              </div>
            </div>
            <div className="login-step">
              <div className="login-step-number">2</div>
              <div>
                <strong>Manage Deliveries</strong>
                <p>Track, assign, and update delivery orders in real-time.</p>
              </div>
            </div>
            <div className="login-step">
              <div className="login-step-number">3</div>
              <div>
                <strong>Monitor Performance</strong>
                <p>View analytics and reports to optimize logistics operations.</p>
              </div>
            </div>
          </div>
          <div className="login-decorative-circles">
            <div className="circle circle-1" />
            <div className="circle circle-2" />
          </div>
        </div>
      </div>

      <div className="login-right">
        <form className="login-form" onSubmit={handleSubmit}>
          <span className="login-form-label label" style={{ color: 'var(--primary)' }}>SECURE ACCESS</span>
          <h2 className="login-form-title">Login to System</h2>
          <p className="login-form-subtitle">Enter your credentials below to continue.</p>

          <hr className="login-divider" />

          {error && (
            <div className="login-alert error" style={{ background: '#FFF1F1', border: '1px solid #FFCDCD', padding: '12px', borderRadius: '8px', marginBottom: '20px', color: '#E31A1A', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <AlertTriangleIcon />
              <p>{error}</p>
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Employee ID</label>
            <div className="form-input-icon">
              <User size={16} className="icon-left" />
              <input
                type="text"
                className="form-input"
                placeholder="EMP-001"
                value={employeeId}
                onChange={e => setEmployeeId(e.target.value)}
                required
                style={{ paddingLeft: '42px' }}
              />
            </div>
            <small style={{ color: 'var(--text-secondary)', fontSize: '11px', marginTop: '4px', display: 'block' }}>
              Try: EMP-001 (Super Admin) or EMP-003 (Op. Team).
            </small>
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <div className="form-input-icon">
              <Lock size={16} className="icon-left" />
              <input
                type={showPassword ? 'text' : 'password'}
                className="form-input"
                placeholder="Enter password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                style={{ paddingLeft: '42px' }}
              />
              <button type="button" className="icon-right" onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '14px' }}>
              <input type="checkbox" /> Remember me
            </label>
            <a href="#" style={{ color: 'var(--primary)', fontSize: '14px', textDecoration: 'none', fontWeight: '500' }}>Forgot password?</a>
          </div>

          <button type="submit" className="btn btn-dark btn-lg login-submit-btn" id="login-btn">
            LOGIN TO DASHBOARD
          </button>
        </form>

        <p className="login-footer">© 2026 <a href="#">Speedex Courier & Forwarder, Inc.</a> · All rights reserved.</p>
      </div>
    </div>
  );
}

function AlertTriangleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#E31A1A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
      <path d="M12 9v4" />
      <path d="M12 17h.01" />
    </svg>
  );
}
