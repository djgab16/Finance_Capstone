import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  FileText,
  Receipt,
  CircleDollarSign,
  AlertTriangle,
  Clock,
  BarChart3,
  FileBarChart,
  Settings,
  Activity,
  Archive,
  Bell,
  Search,
  ClipboardList,
  LogOut,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import logo from '../../assets/logo.png';
import './Sidebar.css';

import type { UserRole } from '../../types';

interface NavLinkConfig {
  to: string;
  icon: React.ElementType;
  label: string;
  allowedRoles?: UserRole[];
}

const mainLinks: NavLinkConfig[] = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/clients', icon: Users, label: 'Clients' },
  { to: '/invoices', icon: FileText, label: 'Billing & Invoices' },
  { to: '/payments', icon: Receipt, label: 'Payments' },
  { to: '/aging', icon: Clock, label: 'Receivables Aging' },
  { to: '/overdue', icon: AlertTriangle, label: 'Overdue Accounts' },
  { to: '/search', icon: Search, label: 'Search' },
  { to: '/tasks', icon: ClipboardList, label: 'Tasks' },
];

const reportLinks: NavLinkConfig[] = [
  { to: '/reports', icon: FileBarChart, label: 'Reports', allowedRoles: ['ADMIN'] },
  { to: '/collection-summary', icon: CircleDollarSign, label: 'Collection Summary', allowedRoles: ['ADMIN'] },
  { to: '/analytics', icon: BarChart3, label: 'Analytics', allowedRoles: ['ADMIN'] },
];

const systemLinks: NavLinkConfig[] = [
  { to: '/notifications', icon: Bell, label: 'Notifications' },
  { to: '/activity-logs', icon: Activity, label: 'Activity Logs' },
  { to: '/archive', icon: Archive, label: 'Archive' },
  { to: '/settings', icon: Settings, label: 'Settings', allowedRoles: ['ADMIN'] },
];

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getInitials = (name: string) =>
    name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);

  const hasAccess = (link: NavLinkConfig) => {
    if (!link.allowedRoles) return true;
    if (!user) return false;
    return link.allowedRoles.includes(user.role);
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="login-logo" style={{ padding: '0', background: 'transparent' }}>
          <img src={logo} alt="ARCMS Logo" style={{ height: '36px', objectFit: 'contain' }} />
        </div>
      </div>

      <div className="sidebar-role-section">
        <div
          className={`sidebar-role-badge ${
            user?.role ? user.role.toLowerCase().replaceAll('.', '').replaceAll(' ', '-') : 'employee'
          }`}
        >
          <div className="role-dot-inner" />
          {user?.role || 'EMPLOYEE'}
        </div>
      </div>

      <nav className="sidebar-nav">
        <div className="nav-section">
          <span className="nav-section-title">MAIN MENU</span>
          {mainLinks.filter(hasAccess).map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `nav-item ${
                  isActive || (link.to === '/dashboard' && location.pathname === '/') ? 'nav-item-active' : ''
                }`
              }
            >
              <link.icon size={18} />
              <span className="nav-item-label">{link.label}</span>
            </NavLink>
          ))}
        </div>

        {reportLinks.filter(hasAccess).length > 0 && (
          <div className="nav-section">
            <span className="nav-section-title">REPORTS</span>
            {reportLinks.filter(hasAccess).map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) => `nav-item ${isActive ? 'nav-item-active' : ''}`}
              >
                <link.icon size={18} />
                <span className="nav-item-label">{link.label}</span>
              </NavLink>
            ))}
          </div>
        )}

        {systemLinks.filter(hasAccess).length > 0 && (
          <div className="nav-section">
            <span className="nav-section-title">SYSTEM</span>
            {systemLinks.filter(hasAccess).map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) => `nav-item ${isActive ? 'nav-item-active' : ''}`}
              >
                <link.icon size={18} />
                <span className="nav-item-label">{link.label}</span>
              </NavLink>
            ))}
          </div>
        )}
      </nav>

      <div className="sidebar-footer-profile">
        <div className="sidebar-profile-card">
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
