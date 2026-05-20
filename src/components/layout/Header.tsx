import { Search, Bell } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../../context/DataContext';
import './Header.css';

interface HeaderProps {
  title: string;
  subtitle?: string;
  date?: string;
  actions?: React.ReactNode;
}

export default function Header({ title, subtitle, date, actions }: HeaderProps) {
  const navigate = useNavigate();
  const { notifications } = useData();
  const unreadCount = notifications.filter(n => !n.read).length;

  const displayDate = date || new Date().toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });

  return (
    <header className="header">
      <div className="header-left">
        {subtitle && <span className="header-breadcrumb">{subtitle}</span>}
        <h1 className="header-title">{title}</h1>
      </div>
      <div className="header-right">
        <span className="header-date">{displayDate}</span>
        <div className="header-search-container">
          <Search size={16} className="header-search-icon" />
          <input
            type="text"
            placeholder="Search invoice, client..."
            className="header-search-input"
            id="header-search"
          />
        </div>
        <button className="header-notification-btn" id="header-notifications" title="Notifications" onClick={() => navigate('/notifications')}>
          <Bell size={20} />
          {unreadCount > 0 && <span className="notification-dot" />}
        </button>
        {actions}
      </div>
    </header>
  );
}
