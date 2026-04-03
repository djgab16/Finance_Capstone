import { Search, RefreshCw, Bell } from 'lucide-react';
import './Header.css';

interface HeaderProps {
  title: string;
  subtitle?: string;
  date?: string;
  actions?: React.ReactNode;
}

export default function Header({ title, subtitle, date, actions }: HeaderProps) {
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
            placeholder="Search employee, task..."
            className="header-search-input"
            id="header-search"
          />
        </div>
        <button className="header-notification-btn" id="header-notifications" title="Notifications">
          <Bell size={20} />
          <span className="notification-dot" />
        </button>
        <button className="header-refresh-btn" id="header-refresh" title="Refresh">
          <RefreshCw size={18} />
        </button>
        {actions}
      </div>
    </header>
  );
}
