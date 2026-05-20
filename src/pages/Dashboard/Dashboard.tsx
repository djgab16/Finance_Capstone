import { useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Wallet, AlertTriangle, Users, TrendingUp, FileText, Receipt, Plus } from 'lucide-react';
import Header from '../../components/layout/Header';
import StatCard from '../../components/ui/StatCard';
import StatusBadge from '../../components/ui/StatusBadge';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { currencyTooltipFormatter, formatCurrency, formatDate } from '../../utils/finance';
import type { AgingBucket } from '../../types';
import './Dashboard.css';

const BUCKETS: AgingBucket[] = ['Current', '1-30', '31-60', '61-90', '90+'];
const BUCKET_COLORS: Record<AgingBucket, string> = {
  Current: '#01B574',
  '1-30': '#FFB547',
  '31-60': '#00A99D',
  '61-90': '#FF7B42',
  '90+': '#E31A1A',
};

export default function Dashboard() {
  const { invoices, payments, clients, activityLogs } = useData();
  const { user } = useAuth();
  const navigate = useNavigate();

  const totalAR = invoices.reduce((s, inv) => s + inv.balance, 0);
  const collectedThisMonth = useMemo(() => {
    const month = new Date().toISOString().slice(0, 7);
    return payments.filter((p) => p.paymentDate.startsWith(month)).reduce((s, p) => s + p.amount, 0);
  }, [payments]);
  const overdueTotal = invoices
    .filter((inv) => inv.paymentStatus === 'Overdue')
    .reduce((s, inv) => s + inv.balance, 0);
  const activeClients = clients.filter((c) => c.status === 'Active').length;

  const agingData = useMemo(
    () =>
      BUCKETS.map((b) => ({
        bucket: b,
        total: invoices.filter((inv) => inv.agingBucket === b && inv.balance > 0).reduce((s, inv) => s + inv.balance, 0),
        color: BUCKET_COLORS[b],
      })),
    [invoices],
  );

  const recentInvoices = useMemo(
    () => [...invoices].sort((a, b) => (a.billingDate < b.billingDate ? 1 : -1)).slice(0, 5),
    [invoices],
  );
  const recentPayments = useMemo(
    () => [...payments].sort((a, b) => (a.paymentDate < b.paymentDate ? 1 : -1)).slice(0, 5),
    [payments],
  );

  return (
    <>
      <Header
        title="Finance Dashboard"
        subtitle={`${user?.role} · ARCMS`}
        date={new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
      />
      <div className="dashboard-content">
        <div className="stats-row" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
          <StatCard
            icon={<Wallet size={18} />}
            iconColor="var(--primary)"
            iconBg="var(--status-transit-bg)"
            label="TOTAL AR"
            value={formatCurrency(totalAR)}
            subtitle="Outstanding receivables"
            accentColor="#00A99D"
          />
          <StatCard
            icon={<TrendingUp size={18} />}
            iconColor="var(--status-active)"
            iconBg="var(--status-active-bg)"
            label="COLLECTED THIS MONTH"
            value={formatCurrency(collectedThisMonth)}
            subtitle="Monthly inflow"
            subtitleColor="var(--status-active)"
            accentColor="#01B574"
          />
          <StatCard
            icon={<AlertTriangle size={18} />}
            iconColor="var(--status-failed)"
            iconBg="var(--status-failed-bg)"
            label="OVERDUE TOTAL"
            value={formatCurrency(overdueTotal)}
            subtitle="Needs collection"
            subtitleColor="var(--status-failed)"
            accentColor="#E31A1A"
          />
          <StatCard
            icon={<Users size={18} />}
            iconColor="var(--status-new)"
            iconBg="var(--status-new-bg)"
            label="ACTIVE CLIENTS"
            value={activeClients}
            subtitle={`${clients.length} total clients`}
            accentColor="#4318FF"
          />
        </div>

        <div className="dashboard-grid" style={{ gridTemplateColumns: '2fr 1fr' }}>
          <div className="card dashboard-performance-graph">
            <div className="card-header">
              <h3>Aging Snapshot</h3>
              <span className="system-all-operational text-sm" style={{ background: 'var(--status-transit-bg)', color: 'var(--primary)' }}>
                Outstanding by bucket
              </span>
            </div>
            <div style={{ width: '100%', height: '240px', marginTop: '16px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={agingData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E9EDF7" />
                  <XAxis dataKey="bucket" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#A3AED0' }} />
                  <YAxis tick={{ fontSize: 11, fill: '#A3AED0' }} axisLine={false} tickLine={false} />
                  <Tooltip formatter={currencyTooltipFormatter} cursor={{ fill: 'rgba(0,0,0,0.02)' }} />
                  <Bar dataKey="total" radius={[4, 4, 0, 0]} maxBarSize={50}>
                    {agingData.map((entry) => (
                      <Cell key={entry.bucket} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <h3>Quick Actions</h3>
            </div>
            <div className="quick-actions-grid">
              <button className="quick-action-btn" onClick={() => navigate('/invoices/new')}>
                <div className="quick-action-icon" style={{ background: 'var(--status-transit-bg)' }}>
                  <FileText size={22} color="var(--primary)" />
                </div>
                <span>New Invoice</span>
              </button>
              <button className="quick-action-btn" onClick={() => navigate('/payments/new')}>
                <div className="quick-action-icon" style={{ background: 'var(--status-active-bg)' }}>
                  <Receipt size={22} color="var(--status-active)" />
                </div>
                <span>Record Payment</span>
              </button>
              <button className="quick-action-btn" onClick={() => navigate('/clients/new')}>
                <div className="quick-action-icon" style={{ background: 'var(--status-new-bg)' }}>
                  <Users size={22} color="var(--status-new)" />
                </div>
                <span>Add Client</span>
              </button>
              <button className="quick-action-btn" onClick={() => navigate('/overdue')}>
                <div className="quick-action-icon" style={{ background: 'var(--status-failed-bg)' }}>
                  <AlertTriangle size={22} color="var(--status-failed)" />
                </div>
                <span>Overdue</span>
              </button>
            </div>
          </div>
        </div>

        <div className="dashboard-bottom-row">
          <div className="card">
            <div className="card-header">
              <h3>Recent Invoices</h3>
              <Link to="/invoices" className="view-all-link">
                View All →
              </Link>
            </div>
            <table className="data-table">
              <thead>
                <tr>
                  <th>INVOICE NO.</th>
                  <th>CLIENT</th>
                  <th>TOTAL</th>
                  <th>STATUS</th>
                </tr>
              </thead>
              <tbody>
                {recentInvoices.map((inv) => (
                  <tr key={inv.id} className="clickable-row" onClick={() => navigate(`/invoices/${inv.id}`)}>
                    <td>
                      <span className="cell-name" style={{ color: 'var(--primary)' }}>{inv.invoiceNo}</span>
                      <div className="cell-sub">{formatDate(inv.billingDate)}</div>
                    </td>
                    <td>{inv.clientName}</td>
                    <td>{formatCurrency(inv.totalAmount)}</td>
                    <td>
                      <StatusBadge status={inv.paymentStatus} size="sm" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="card">
            <div className="card-header">
              <h3>Recent Payments</h3>
              <Link to="/payments" className="view-all-link">
                View All →
              </Link>
            </div>
            <table className="data-table">
              <thead>
                <tr>
                  <th>OR NUMBER</th>
                  <th>CLIENT</th>
                  <th>AMOUNT</th>
                  <th>METHOD</th>
                </tr>
              </thead>
              <tbody>
                {recentPayments.length === 0 ? (
                  <tr>
                    <td colSpan={4} style={{ textAlign: 'center', padding: '24px', color: 'var(--text-secondary)' }}>
                      No payments recorded yet.
                    </td>
                  </tr>
                ) : (
                  recentPayments.map((p) => (
                    <tr key={p.id}>
                      <td>
                        <span className="cell-name" style={{ color: 'var(--primary)' }}>{p.orNumber}</span>
                        <div className="cell-sub">{formatDate(p.paymentDate)}</div>
                      </td>
                      <td>{p.clientName}</td>
                      <td>{formatCurrency(p.amount)}</td>
                      <td>{p.paymentMethod}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card dashboard-activity">
          <div className="card-header">
            <h3>Recent Activity</h3>
            <Link to="/activity-logs" className="view-all-link">
              View All →
            </Link>
          </div>
          <div className="activity-feed-list">
            {activityLogs.slice(0, 6).map((log) => (
              <div key={log.id} className="activity-feed-item">
                <div className="activity-feed-dot" style={{ background: log.userColor }} />
                <div className="activity-feed-content">
                  <p className="activity-feed-text">
                    <strong>{log.userName}</strong> {log.description}
                  </p>
                  <span className="activity-feed-time">{log.timestamp}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <button
          className="btn btn-primary"
          onClick={() => navigate('/invoices/new')}
          style={{ position: 'fixed', bottom: '24px', right: '24px', borderRadius: 'var(--radius-full)', padding: '12px 20px', display: 'none' }}
          aria-hidden
        >
          <Plus size={16} /> New Invoice
        </button>
      </div>
    </>
  );
}
