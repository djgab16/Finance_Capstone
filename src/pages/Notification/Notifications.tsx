import { useState } from 'react';
import { CheckCheck, Trash2, Eye, UserPlus, Check, Bell, X } from 'lucide-react';
import Header from '../../components/layout/Header';
import StatusBadge from '../../components/ui/StatusBadge';
import { useData } from '../../context/DataContext';
import './Notifications.css';

const tabs = [
  { key: 'all', label: 'All' },
  { key: 'alert', label: 'Alerts', count: 3 },
  { key: 'success', label: 'Success', count: 2 },
  { key: 'system', label: 'System', count: 2 },
  { key: 'read', label: 'Read' },
];

export default function Notifications() {
  const { notifications, markNotificationRead, markAllNotificationsRead, deleteNotification, clearAllNotifications } = useData();
  const [activeTab, setActiveTab] = useState('all');
  const [selectedId, setSelectedId] = useState(notifications.length > 0 ? notifications[0].id : '');
  
  const selected = notifications.find(n => n.id === selectedId) || notifications[0];
  const filtered = activeTab === 'all' ? notifications : activeTab === 'read' ? notifications.filter(n => n.read) : notifications.filter(n => n.type === activeTab && !n.read);

  const grouped = filtered.reduce((acc, n) => {
    if (!acc[n.date]) acc[n.date] = [];
    acc[n.date].push(n);
    return acc;
  }, {} as Record<string, typeof notifications>);

  return (
    <>
      <Header
        title="Notifications Center"
        date="Sunday, March 29, 2026"
        actions={
          <div className="flex gap-sm">
            <button className="btn btn-outline btn-sm" onClick={markAllNotificationsRead}><CheckCheck size={14} /> Mark all as read</button>
            <button className="btn btn-outline btn-sm" onClick={clearAllNotifications}><Trash2 size={14} /> Clear all</button>
          </div>
        }
      />
      <div className="page-content">
        <div className="notif-layout">
          {/* List */}
          <div className="notif-list-panel">
            <div className="notif-tabs">
              {tabs.map(tab => (
                <button
                  key={tab.key}
                  className={`notif-tab ${activeTab === tab.key ? 'active' : ''}`}
                  onClick={() => setActiveTab(tab.key)}
                >
                  {tab.label} {tab.count && <span className="notif-tab-count">{tab.count}</span>}
                </button>
              ))}
            </div>
            <div className="notif-actions-row">
              <button className="btn btn-sm btn-outline" onClick={() => { if (selectedId) markNotificationRead(selectedId); }}><Check size={12} /> Mark as read</button>
              <button className="btn btn-sm btn-outline" onClick={() => { if (selectedId) deleteNotification(selectedId); }}><Trash2 size={12} /> Delete selected</button>
              <span className="text-muted text-sm" style={{ marginLeft: 'auto' }}>{notifications.filter(n => !n.read).length} unread notifications</span>
            </div>
            <div className="notif-list">
              {Object.entries(grouped).map(([date, items]) => (
                <div key={date}>
                  <div className="notif-date-header">{date.replace('March', 'MARCH').toUpperCase()}</div>
                  {items.map(n => (
                    <div
                      key={n.id}
                      className={`notif-item ${selectedId === n.id ? 'selected' : ''} ${!n.read ? 'unread' : ''}`}
                      onClick={() => setSelectedId(n.id)}
                    >
                      <input type="checkbox" className="notif-checkbox" />
                      <div className="notif-item-content">
                        <div className="notif-item-header">
                          <strong>{n.title}</strong>
                          {n.waybillNo && <span className="notif-waybill">{n.waybillNo}</span>}
                          {n.statusBadge && <StatusBadge status={n.statusBadge} size="sm" />}
                        </div>
                        <p className="notif-item-desc">{n.description}</p>
                        <span className="notif-item-meta">{n.timestamp} · {n.source}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>

          {/* Detail Panel */}
          {selected && (
            <div className="notif-detail-panel card">
              <div className="notif-detail-header">
                <h4>Notification Detail</h4>
                <button className="action-icon-btn" title="Close" onClick={() => setSelectedId('')}><X size={14} /></button>
              </div>
              <div className="notif-detail-alert">
                <div className="notif-alert-icon">
                  <Bell size={18} />
                </div>
                <div>
                  <strong className="notif-alert-type" style={{ color: selected.type === 'alert' ? 'var(--status-failed)' : selected.type === 'success' ? 'var(--status-active)' : 'var(--text-primary)' }}>
                    ▲ {selected.title.toUpperCase()}
                  </strong>
                  <span className="text-muted text-sm">Today, {selected.timestamp} · {selected.source}</span>
                </div>
              </div>

            <div className="notif-detail-body card" style={{ background: 'var(--bg-main)', boxShadow: 'none' }}>
              <strong>{selected.title} — Urgent Action Required</strong>
              <p>{selected.description}</p>
            </div>

            <div className="summary-fields">
              <div className="summary-field"><span>Waybill No.</span><span className="summary-val teal">{selected.waybillNo || '—'}</span></div>
              <div className="summary-field"><span>Alert Type</span><span className="summary-val" style={{ color: 'var(--status-failed)' }}>{selected.type === 'alert' ? 'Failed Pickup' : selected.type}</span></div>
              <div className="summary-field"><span>Days Overdue</span><span className="summary-val" style={{ color: 'var(--status-failed)' }}>3 days</span></div>
              <div className="summary-field"><span>Area</span><span>Marikina City</span></div>
              <div className="summary-field"><span>Assigned Driver</span><span className="summary-val" style={{ color: 'var(--status-failed)' }}>Unassigned</span></div>
              <div className="summary-field"><span>Client / Sender</span><span>Shopee Express</span></div>
              <div className="summary-field"><span>Recipient</span><span>Torres, Miguel</span></div>
              <div className="summary-field"><span>Notification Sent</span><span>Mar 29 · 10:15 AM</span></div>
            </div>

            <span className="label" style={{ marginTop: '16px' }}>ACTIONS</span>
            <div className="detail-actions">
              <button className="btn btn-primary"><Eye size={16} /> View Order Details</button>
              <button className="btn btn-primary"><UserPlus size={16} /> Assign Driver Now</button>
              <button className="btn btn-outline" onClick={() => markNotificationRead(selected.id)}><Check size={16} /> Mark as Read</button>
              <button className="btn btn-danger" onClick={() => { deleteNotification(selected.id); setSelectedId(''); }}><Trash2 size={16} /> Delete Notification</button>
            </div>
          </div>
          )}
        </div>
      </div>
    </>
  );
}
