import { useState } from 'react';
import { CheckCheck, Trash2, Eye, Check, Bell, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/layout/Header';
import StatusBadge from '../../components/ui/StatusBadge';
import { useData } from '../../context/DataContext';
import './Notifications.css';

export default function Notifications() {
  const {
    notifications,
    markNotificationRead,
    markAllNotificationsRead,
    deleteNotification,
    clearAllNotifications,
    invoices,
  } = useData();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('all');
  const [selectedId, setSelectedId] = useState(notifications.length > 0 ? notifications[0].id : '');
  const [checkedIds, setCheckedIds] = useState<string[]>([]);

  const selected = notifications.find((n) => n.id === selectedId) || notifications[0];
  const filtered =
    activeTab === 'all'
      ? notifications
      : activeTab === 'read'
      ? notifications.filter((n) => n.read)
      : notifications.filter((n) => n.type === activeTab && !n.read);

  const handleToggleCheck = (e: React.ChangeEvent<HTMLInputElement>, id: string) => {
    e.stopPropagation();
    if (e.target.checked) setCheckedIds((prev) => [...prev, id]);
    else setCheckedIds((prev) => prev.filter((cid) => cid !== id));
  };

  const handleMarkCheckedAsRead = () => {
    if (checkedIds.length > 0) {
      checkedIds.forEach((id) => markNotificationRead(id));
      setCheckedIds([]);
    } else if (selectedId) {
      markNotificationRead(selectedId);
    }
  };

  const handleDeleteChecked = () => {
    if (checkedIds.length > 0) {
      checkedIds.forEach((id) => deleteNotification(id));
      setCheckedIds([]);
      if (checkedIds.includes(selectedId)) setSelectedId('');
    } else if (selectedId) {
      deleteNotification(selectedId);
      setSelectedId('');
    }
  };

  const tabs = [
    { key: 'all', label: 'All' },
    { key: 'alert', label: 'Alerts', count: notifications.filter((n) => n.type === 'alert' && !n.read).length },
    { key: 'success', label: 'Payments', count: notifications.filter((n) => n.type === 'success' && !n.read).length },
    { key: 'system', label: 'System', count: notifications.filter((n) => n.type === 'system' && !n.read).length },
    { key: 'read', label: 'Read' },
  ];

  const grouped = filtered.reduce((acc, n) => {
    if (!acc[n.date]) acc[n.date] = [];
    acc[n.date].push(n);
    return acc;
  }, {} as Record<string, typeof notifications>);

  const handleViewInvoice = () => {
    if (!selected?.invoiceNo) return;
    const inv = invoices.find((i) => i.invoiceNo === selected.invoiceNo);
    if (inv) navigate(`/invoices/${inv.id}`);
  };

  return (
    <>
      <Header
        title="Notifications Center"
        actions={
          <div className="flex gap-sm">
            <button className="btn btn-outline btn-sm" onClick={markAllNotificationsRead}>
              <CheckCheck size={14} /> Mark all as read
            </button>
            <button className="btn btn-outline btn-sm" onClick={clearAllNotifications}>
              <Trash2 size={14} /> Clear all
            </button>
          </div>
        }
      />
      <div className="page-content">
        <div className="notif-layout">
          <div className="notif-list-panel">
            <div className="notif-tabs">
              {tabs.map((tab) => (
                <button key={tab.key} className={`notif-tab ${activeTab === tab.key ? 'active' : ''}`} onClick={() => setActiveTab(tab.key)}>
                  {tab.label} {tab.count !== undefined && tab.count > 0 && <span className="notif-tab-count">{tab.count}</span>}
                </button>
              ))}
            </div>
            <div className="notif-actions-row">
              <span className="text-muted text-sm" style={{ marginLeft: 'auto' }}>
                {notifications.filter((n) => !n.read).length} unread notifications
              </span>
            </div>
            <div className="notif-list">
              {Object.entries(grouped).map(([date, items]) => (
                <div key={date}>
                  <div className="notif-date-header">{date.toUpperCase()}</div>
                  {items.map((n) => (
                    <div
                      key={n.id}
                      className={`notif-item ${selectedId === n.id ? 'selected' : ''} ${!n.read ? 'unread' : ''}`}
                      onClick={() => setSelectedId(n.id)}
                    >
                      <input
                        type="checkbox"
                        className="notif-checkbox"
                        checked={checkedIds.includes(n.id)}
                        onChange={(e) => handleToggleCheck(e, n.id)}
                        onClick={(e) => e.stopPropagation()}
                      />
                      <div className="notif-item-content">
                        <div className="notif-item-header">
                          <strong>{n.title}</strong>
                          {n.invoiceNo && <span className="notif-waybill">{n.invoiceNo}</span>}
                          {n.statusBadge && <StatusBadge status={n.statusBadge} size="sm" />}
                        </div>
                        <p className="notif-item-desc">{n.description}</p>
                        <span className="notif-item-meta">
                          {n.timestamp} · {n.source}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>

          {selected && (
            <div className="notif-detail-panel card">
              <div className="notif-detail-header">
                <h4>Notification Detail</h4>
                <button className="action-icon-btn" title="Close" onClick={() => setSelectedId('')}>
                  <X size={14} />
                </button>
              </div>
              <div className="notif-detail-alert">
                <div className="notif-alert-icon">
                  <Bell size={18} />
                </div>
                <div>
                  <strong
                    className="notif-alert-type"
                    style={{
                      color:
                        selected.type === 'alert'
                          ? 'var(--status-failed)'
                          : selected.type === 'success'
                          ? 'var(--status-active)'
                          : 'var(--text-primary)',
                    }}
                  >
                    ▲ {selected.title.toUpperCase()}
                  </strong>
                  <span className="text-muted text-sm">
                    Today, {selected.timestamp} · {selected.source}
                  </span>
                </div>
              </div>

              <div className="notif-detail-body card" style={{ background: 'var(--bg-main)', boxShadow: 'none' }}>
                <strong>{selected.title}</strong>
                <p>{selected.description}</p>
              </div>

              <div className="summary-fields">
                <div className="summary-field">
                  <span>Invoice No.</span>
                  <span className="summary-val teal">{selected.invoiceNo || '—'}</span>
                </div>
                <div className="summary-field">
                  <span>Type</span>
                  <span className="summary-val">{selected.type}</span>
                </div>
                <div className="summary-field">
                  <span>Source</span>
                  <span>{selected.source}</span>
                </div>
                <div className="summary-field">
                  <span>Date</span>
                  <span>{selected.date}</span>
                </div>
              </div>

              <span className="label" style={{ marginTop: '16px' }}>
                ACTIONS
              </span>
              <div className="detail-actions">
                {selected.invoiceNo && (
                  <button className="btn btn-primary" onClick={handleViewInvoice}>
                    <Eye size={16} /> View Invoice
                  </button>
                )}
                <button
                  className="btn btn-outline"
                  onClick={() => {
                    markNotificationRead(selected.id);
                    setSelectedId('');
                  }}
                >
                  <Check size={16} /> Mark as Read
                </button>
                <button
                  className="btn btn-danger"
                  onClick={() => {
                    deleteNotification(selected.id);
                    setSelectedId('');
                  }}
                >
                  <Trash2 size={16} /> Delete Notification
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className={`floating-selection-bar ${checkedIds.length > 0 ? 'visible' : ''}`}>
        <span className="floating-selection-count">{checkedIds.length} selected</span>
        <button className="btn btn-sm" onClick={handleMarkCheckedAsRead}>
          <Check size={14} /> Mark as read
        </button>
        <button className="btn btn-sm btn-danger" onClick={handleDeleteChecked}>
          <Trash2 size={14} /> Delete
        </button>
      </div>
    </>
  );
}
