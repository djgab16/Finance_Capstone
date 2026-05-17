import { useAuth } from '../../context/AuthContext';
import { LogOut, User } from 'lucide-react';
import './DriverSettings.css';

export default function DriverSettings() {
  const { user, logout } = useAuth();

  return (
    <div className="driver-settings">
      <h2>Settings</h2>
      
      <div className="driver-profile-card">
        <div className="driver-profile-avatar">
          <User size={40} color="var(--primary)" />
        </div>
        <div className="driver-profile-info">
          <h3>{user?.name}</h3>
          <p>{user?.role}</p>
        </div>
      </div>

      <div className="settings-options">
        <button className="btn btn-danger btn-block" onClick={logout}>
          <LogOut size={20} />
          Logout
        </button>
      </div>
    </div>
  );
}
