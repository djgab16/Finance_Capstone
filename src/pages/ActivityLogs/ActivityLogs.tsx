import { useState } from 'react';
import { Download, FileText, Plus, Pencil, Receipt, Users, LogIn, Archive } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/layout/Header';
import StatCard from '../../components/ui/StatCard';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { downloadCSV } from '../../utils/finance';
import type { ActionType } from '../../types';
import './ActivityLogs.css';
import '../Invoices/Invoices.css';

const actionColors: Record<ActionType, string> = {
  'Create Invoice': '#01B574',
  'Update Invoice': '#FFB547',
  'Record Payment': '#00A99D',
  'Add Client': '#4318FF',
  'Update Client': '#FF7B42',
  Archive: '#A3AED0',
  Login: '#00A99D',
  Logout: '#A3AED0',
  'Export Report': '#1B254B',
};

export default function ActivityLogs() {
  const { activityLogs, invoices } = useData();
  const { user } = useAuth();
  const navigate = useNavigate();
  const isAdmin = user?.role === 'ADMIN';

  const [actionFilter, setActionFilter] = useState<ActionType | 'All'>('All');
  const [search, setSearch] = useState('');

  const displayed = activityLogs
    .filter((log) => (isAdmin ? true : log.userName === user?.name))
    .filter((log) => actionFilter === 'All' || log.action === actionFilter)
    .filter((log) => {
      if (!search) return true;
      const term = search.toLowerCase();
      return (
        log.userName.toLowerCase().includes(term) ||
        log.description.toLowerCase().includes(term) ||
        (log.reference || '').toLowerCase().includes(term)
      );
    });

  const handleExport = () => {
    const rows: (string | number)[][] = [
      ['Timestamp', 'User', 'Role', 'Action', 'Description', 'Reference'],
      ...displayed.map((log) => [log.timestamp, log.userName, log.userRole, log.action, log.description, log.reference || '']),
    ];
    downloadCSV('activity-logs', rows);
  };

  return (
    <>
      <Header
        title={isAdmin ? 'System Activity Logs' : 'Your Activity Logs'}
        subtitle="ARCMS · System"
        date={new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        actions={
          <button className="btn btn-outline btn-sm" onClick={handleExport}>
            <Download size={14} /> Export Logs
          </button>
        }
      />
      <div className="page-content">
        <div className="stats-row" style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 'var(--gap)' }}>
          <StatCard
            icon={<FileText size={18} />}
            iconColor="var(--primary)"
            iconBg="var(--status-transit-bg)"
            label={isAdmin ? 'TOTAL LOGS' : 'YOUR LOGS'}
            value={displayed.length}
          />
          <StatCard
            icon={<Plus size={18} />}
            iconColor="var(--status-active)"
            iconBg="var(--status-active-bg)"
            label="INVOICES CREATED"
            value={displayed.filter((l) => l.action === 'Create Invoice').length}
          />
          <StatCard
            icon={<Pencil size={18} />}
            iconColor="var(--status-pending)"
            iconBg="var(--status-pending-bg)"
            label="UPDATES"
            value={displayed.filter((l) => l.action === 'Update Invoice' || l.action === 'Update Client').length}
          />
          <StatCard
            icon={<Receipt size={18} />}
            iconColor="var(--primary)"
            iconBg="var(--status-transit-bg)"
            label="PAYMENTS RECORDED"
            value={displayed.filter((l) => l.action === 'Record Payment').length}
          />
          <StatCard
            icon={<Users size={18} />}
            iconColor="var(--status-new)"
            iconBg="var(--status-new-bg)"
            label="CLIENT EVENTS"
            value={displayed.filter((l) => l.action === 'Add Client' || l.action === 'Update Client').length}
          />
          <StatCard
            icon={<Archive size={18} />}
            iconColor="var(--text-secondary)"
            iconBg="var(--bg-main)"
            label="ARCHIVES"
            value={displayed.filter((l) => l.action === 'Archive').length}
          />
        </div>

        <div className="logs-layout">
          <div className="card logs-filter">
            <div className="card-header">
              <h4>Filters</h4>
              <button
                className="text-link"
                onClick={() => {
                  setActionFilter('All');
                  setSearch('');
                }}
              >
                Clear
              </button>
            </div>
            <div className="form-group">
              <label className="form-label">SEARCH</label>
              <input className="form-input" placeholder="user, description, reference..." value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">ACTION TYPE</label>
              {(['All', 'Create Invoice', 'Update Invoice', 'Record Payment', 'Add Client', 'Update Client', 'Archive', 'Login', 'Logout', 'Export Report'] as const).map((a) => (
                <label key={a} className="check-option">
                  <input
                    type="radio"
                    name="action"
                    checked={actionFilter === a}
                    onChange={() => setActionFilter(a as ActionType | 'All')}
                  />{' '}
                  {a}
                  <span className="check-count">{a === 'All' ? displayed.length : displayed.filter((l) => l.action === a).length}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="card" style={{ flex: 1 }}>
            <div className="card-header">
              <div className="flex items-center gap-sm">
                <h4>{isAdmin ? 'System Activity Log' : 'Your Activity Log'}</h4>
                <span className="archive-count-badge">{displayed.length} entries</span>
              </div>
              <button className="view-all-link" onClick={handleExport}>Export →</button>
            </div>
            <table className="data-table logs-table">
              <thead>
                <tr>
                  <th>TIMESTAMP</th>
                  <th>USER</th>
                  <th>ACTION</th>
                  <th>DESCRIPTION</th>
                  <th>REFERENCE</th>
                  <th>VIEW</th>
                </tr>
              </thead>
              <tbody>
                {displayed.map((log) => (
                  <tr key={log.id}>
                    <td className="text-sm text-muted">{log.timestamp}</td>
                    <td>
                      <div className="driver-cell">
                        <div className="driver-avatar" style={{ background: log.userColor }}>
                          {log.userInitials}
                        </div>
                        <div>
                          <strong className="text-sm">{log.userName}</strong>
                          <div className="cell-sub">{log.userRole}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="action-badge" style={{ background: actionColors[log.action] + '18', color: actionColors[log.action] }}>
                        {log.action === 'Login' ? <LogIn size={10} style={{ marginRight: 4 }} /> : null}
                        {log.action}
                      </span>
                    </td>
                    <td className="text-sm desc-cell">{log.description}</td>
                    <td className="text-sm text-muted">{log.reference || '—'}</td>
                    <td>
                      <button
                        className="action-icon-btn"
                        onClick={() => {
                          if (log.reference?.startsWith('INV-')) {
                            const inv = invoices.find((i) => i.invoiceNo === log.reference);
                            if (inv) navigate(`/invoices/${inv.id}/history`);
                          } else if (log.reference?.startsWith('CL-')) {
                            navigate(`/clients/${log.reference}`);
                          }
                        }}
                        title="View reference"
                      >
                        →
                      </button>
                    </td>
                  </tr>
                ))}
                {displayed.length === 0 && (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center', padding: '32px', color: 'var(--text-secondary)' }}>
                      No activity matching your filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}
