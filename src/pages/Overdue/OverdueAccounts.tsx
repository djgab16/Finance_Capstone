import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AlertTriangle, Search, Eye, Receipt, Phone, Clock } from 'lucide-react';
import Header from '../../components/layout/Header';
import StatCard from '../../components/ui/StatCard';
import StatusBadge from '../../components/ui/StatusBadge';
import { useData } from '../../context/DataContext';
import { formatCurrency, formatDate } from '../../utils/finance';
import '../Invoices/Invoices.css';

export default function OverdueAccounts() {
  const navigate = useNavigate();
  const { invoices, clients } = useData();

  const [searchTerm, setSearchTerm] = useState('');
  const [bucketFilter, setBucketFilter] = useState('All Buckets');

  const overdueAll = useMemo(
    () => invoices.filter((inv) => inv.paymentStatus === 'Overdue' && !inv.archived),
    [invoices],
  );

  const filtered = useMemo(() => {
    return overdueAll.filter((inv) => {
      const term = searchTerm.toLowerCase();
      const matchSearch =
        !term ||
        inv.invoiceNo.toLowerCase().includes(term) ||
        inv.clientName.toLowerCase().includes(term);
      const matchBucket = bucketFilter === 'All Buckets' || inv.agingBucket === bucketFilter;
      return matchSearch && matchBucket;
    });
  }, [overdueAll, searchTerm, bucketFilter]);

  const totalOverdue = overdueAll.reduce((s, inv) => s + inv.balance, 0);
  const totalSurcharge = overdueAll.reduce((s, inv) => s + inv.surcharge, 0);
  const avgDaysOverdue = overdueAll.length
    ? Math.round(overdueAll.reduce((s, inv) => s + inv.daysOverdue, 0) / overdueAll.length)
    : 0;

  return (
    <>
      <Header
        title="Overdue Accounts"
        subtitle="Collection Monitoring"
        date={new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
      />
      <div className="page-content">
        <div className="stats-row" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 'var(--gap)' }}>
          <StatCard
            icon={<AlertTriangle size={18} />}
            iconColor="var(--status-failed)"
            iconBg="var(--status-failed-bg)"
            label="TOTAL OVERDUE INVOICES"
            value={overdueAll.length}
            subtitle="Past due collection"
            subtitleColor="var(--status-failed)"
          />
          <StatCard
            icon={<Clock size={18} />}
            iconColor="var(--status-pending)"
            iconBg="var(--status-pending-bg)"
            label="AVG. DAYS OVERDUE"
            value={`${avgDaysOverdue} days`}
            subtitle="Average delay"
          />
          <StatCard
            icon={<Receipt size={18} />}
            iconColor="var(--primary)"
            iconBg="var(--status-transit-bg)"
            label="TOTAL OUTSTANDING"
            value={formatCurrency(totalOverdue)}
            subtitle="Past-due balances"
          />
          <StatCard
            icon={<AlertTriangle size={18} />}
            iconColor="var(--status-pending)"
            iconBg="var(--status-pending-bg)"
            label="TOTAL SURCHARGE"
            value={formatCurrency(totalSurcharge)}
            subtitle="Penalty fees"
            subtitleColor="var(--status-failed)"
          />
        </div>

        <div className="orders-filter-bar">
          <div className="filter-search">
            <Search size={16} className="filter-search-icon" />
            <input
              type="text"
              placeholder="Search overdue invoices..."
              className="filter-search-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select className="filter-select" value={bucketFilter} onChange={(e) => setBucketFilter(e.target.value)}>
            <option>All Buckets</option>
            <option>1-30</option>
            <option>31-60</option>
            <option>61-90</option>
            <option>90+</option>
          </select>
        </div>

        <div className="card">
          <table className="data-table">
            <thead>
              <tr>
                <th>INVOICE NO.</th>
                <th>CLIENT</th>
                <th>CONTACT</th>
                <th>DUE DATE</th>
                <th>DAYS OVERDUE</th>
                <th>BALANCE</th>
                <th>SURCHARGE</th>
                <th>BUCKET</th>
                <th>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={9} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
                    No overdue accounts. Collections are up to date.
                  </td>
                </tr>
              ) : (
                filtered.map((inv) => {
                  const client = clients.find((c) => c.id === inv.clientId);
                  return (
                    <tr key={inv.id}>
                      <td>
                        <Link to={`/invoices/${inv.id}`} className="waybill-link">
                          {inv.invoiceNo}
                        </Link>
                      </td>
                      <td>
                        <span className="cell-name">{inv.clientName}</span>
                        <div className="cell-sub">{client?.clientCode || inv.clientId}</div>
                      </td>
                      <td>
                        <span>{client?.contactPerson || '—'}</span>
                        <div className="cell-sub" style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                          <Phone size={11} /> {client?.contactNumber || '—'}
                        </div>
                      </td>
                      <td>{formatDate(inv.dueDate)}</td>
                      <td>
                        <span
                          className="status-badge status-failed status-sm"
                          style={{ background: 'var(--status-failed-bg)', color: 'var(--status-failed)' }}
                        >
                          <span className="status-dot" /> {inv.daysOverdue} days
                        </span>
                      </td>
                      <td className="amount-cell balance-positive">{formatCurrency(inv.balance)}</td>
                      <td className="amount-cell">{formatCurrency(inv.surcharge)}</td>
                      <td>
                        <StatusBadge status={inv.agingBucket} size="sm" />
                      </td>
                      <td className="cell-actions">
                        <button className="action-icon-btn" title="View" onClick={() => navigate(`/invoices/${inv.id}`)}>
                          <Eye size={14} />
                        </button>
                        <button
                          className="action-icon-btn"
                          title="Record Payment"
                          onClick={() => navigate('/payments/new', { state: { invoiceId: inv.id } })}
                        >
                          <Receipt size={14} />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
