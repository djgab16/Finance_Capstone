import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Users, ClipboardList, FileText, BarChart3,
  Settings, Activity, Bell, LogOut
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import logo from '../../assets/logo.png';
import './Sidebar.css';

const mainLinks = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/employees', icon: Users, label: 'Employees' },
  { to: '/tasks', icon: ClipboardList, label: 'Tasks' },
  { to: '/role-access', icon: FileText, label: 'Role Access' },
];

const integrationLinks = [
  { to: '/delivery-summary', icon: FileText, label: 'Delivery Summary' },
  { to: '/analytics', icon: BarChart3, label: 'Analytics View' },
];

const systemLinks = [
  { to: '/settings', icon: Settings, label: 'Settings' },
  { to: '/activity-logs', icon: Activity, label: 'Activity Logs' },
];

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="login-logo" style={{ padding: '0', background: 'transparent' }}>
          <img src={logo} alt="30 Speedex Logo" style={{ height: '36px', objectFit: 'contain' }} />
        </div>
      </div>

      <div className="sidebar-role-section">
        <div className={`sidebar-role-badge ${user?.role ? user.role.toLowerCase().replace('.', '').replace(' ', '-') : 'employee'}`}>
          <div className="role-dot-inner" />
          {user?.role || 'EMPLOYEE'}
        </div>
      </div>

      <nav className="sidebar-nav">
        <div className="nav-section">
          <span className="nav-section-title">MAIN MENU</span>
          {mainLinks.map(link => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `nav-item ${isActive || (link.to === '/dashboard' && location.pathname === '/') ? 'nav-item-active' : ''}`
              }
            >
              <link.icon size={18} />
              <span className="nav-item-label">{link.label}</span>
            </NavLink>
          ))}
        </div>

        <div className="nav-section">
          <span className="nav-section-title">INTEGRATION</span>
          {integrationLinks.map(link => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `nav-item ${isActive ? 'nav-item-active' : ''}`
              }
            >
              <link.icon size={18} />
              <span className="nav-item-label">{link.label}</span>
            </NavLink>
          ))}
        </div>

        <div className="nav-section">
          <span className="nav-section-title">SYSTEM</span>
          {systemLinks.map(link => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `nav-item ${isActive ? 'nav-item-active' : ''}`
              }
            >
              <link.icon size={18} />
              <span className="nav-item-label">{link.label}</span>
            </NavLink>
          ))}
        </div>
      </nav>

      <div className="sidebar-footer-profile">
        <div className="profile-card">
          <div className="profile-avatar">{user ? getInitials(user.name) : '??'}</div>
          <div className="profile-info">
            <span className="profile-name">{user?.name || 'Guest User'}</span>
            <span className="profile-role">{user?.role || 'Staff'}</span>
          </div>
          <button className="profile-logout" title="Logout" onClick={handleLogout}>
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </aside>
  );
}
