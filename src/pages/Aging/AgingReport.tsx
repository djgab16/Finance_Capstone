import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Clock, Download, AlertTriangle, TrendingUp } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import Header from '../../components/layout/Header';
import StatCard from '../../components/ui/StatCard';
import StatusBadge from '../../components/ui/StatusBadge';
import { useData } from '../../context/DataContext';
import { currencyTooltipFormatter, downloadCSV, formatCurrency, formatDate } from '../../utils/finance';
import type { AgingBucket } from '../../types';
import '../Invoices/Invoices.css';
import '../Report/Reports.css';

const BUCKETS: AgingBucket[] = ['Current', '1-30', '31-60', '61-90', '90+'];
const BUCKET_COLORS: Record<AgingBucket, string> = {
  Current: '#01B574',
  '1-30': '#FFB547',
  '31-60': '#00A99D',
  '61-90': '#FF7B42',
  '90+': '#E31A1A',
};

export default function AgingReport() {
  const { invoices } = useData();

  const openInvoices = useMemo(() => invoices.filter((inv) => !inv.archived && inv.balance > 0), [invoices]);

  const bucketData = useMemo(() => {
    return BUCKETS.map((b) => {
      const list = openInvoices.filter((inv) => inv.agingBucket === b);
      const total = list.reduce((sum, inv) => sum + inv.balance, 0);
      return { bucket: b, count: list.length, total, color: BUCKET_COLORS[b], invoices: list };
    });
  }, [openInvoices]);

  const totalAR = openInvoices.reduce((s, inv) => s + inv.balance, 0);
  const currentTotal = bucketData[0].total;
  const overdueTotal = bucketData.slice(1).reduce((s, b) => s + b.total, 0);

  const handleExport = () => {
    const rows: (string | number)[][] = [
      ['Aging Summary'],
      ['Bucket', 'Invoice Count', 'Outstanding Balance'],
      ...bucketData.map((b) => [b.bucket, b.count, b.total]),
      [],
      ['Detailed Invoices'],
      ['Bucket', 'Invoice No', 'Client', 'Billing Date', 'Due Date', 'Total', 'Balance', 'Days Overdue'],
      ...openInvoices.map((inv) => [
        inv.agingBucket,
        inv.invoiceNo,
        inv.clientName,
        inv.billingDate,
        inv.dueDate,
        inv.totalAmount,
        inv.balance,
        inv.daysOverdue,
      ]),
    ];
    downloadCSV('aging-report', rows);
  };

  return (
    <>
      <Header
        title="Receivables Aging"
        subtitle="ARCMS · AR Management"
        date={new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        actions={
          <div className="flex gap-sm">
            <button className="btn btn-outline btn-sm" onClick={() => window.print()}>
              Print
            </button>
            <button className="btn btn-primary btn-sm" onClick={handleExport}>
              <Download size={14} /> Export CSV
            </button>
          </div>
        }
      />
      <div className="page-content">
        <div className="stats-row" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--gap)' }}>
          <StatCard
            icon={<Clock size={18} />}
            iconColor="var(--primary)"
            iconBg="var(--status-transit-bg)"
            label="TOTAL RECEIVABLES"
            value={formatCurrency(totalAR)}
            subtitle={`${openInvoices.length} open invoices`}
          />
          <StatCard
            icon={<TrendingUp size={18} />}
            iconColor="var(--status-active)"
            iconBg="var(--status-active-bg)"
            label="CURRENT (NOT YET DUE)"
            value={formatCurrency(currentTotal)}
            subtitle="On-time receivables"
            subtitleColor="var(--status-active)"
          />
          <StatCard
            icon={<AlertTriangle size={18} />}
            iconColor="var(--status-failed)"
            iconBg="var(--status-failed-bg)"
            label="OVERDUE TOTAL"
            value={formatCurrency(overdueTotal)}
            subtitle="Past due receivables"
            subtitleColor="var(--status-failed)"
          />
        </div>

        <div className="stats-row" style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 'var(--gap)' }}>
          {bucketData.map((b) => (
            <div key={b.bucket} className="card" style={{ textAlign: 'center', borderTop: `4px solid ${b.color}` }}>
              <span className="label" style={{ color: b.color }}>
                {b.bucket}
              </span>
              <h3 style={{ marginTop: '8px', fontSize: '1.4rem' }}>{formatCurrency(b.total)}</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.78rem' }}>
                {b.count} {b.count === 1 ? 'invoice' : 'invoices'}
              </p>
            </div>
          ))}
        </div>

        <div className="card chart-card">
          <div className="card-header">
            <h4>Aging Distribution</h4>
            <span className="text-sm text-muted">By outstanding balance</span>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={bucketData} margin={{ top: 16, right: 16, left: 16, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E9EDF7" vertical={false} />
              <XAxis dataKey="bucket" tick={{ fontSize: 12, fill: '#A3AED0' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#A3AED0' }} axisLine={false} tickLine={false} />
              <Tooltip formatter={currencyTooltipFormatter} cursor={{ fill: 'rgba(0,0,0,0.02)' }} />
              <Bar dataKey="total" radius={[6, 6, 0, 0]} maxBarSize={70}>
                {bucketData.map((entry) => (
                  <Cell key={entry.bucket} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <div className="card-header">
            <h4>Detailed Aging Report</h4>
            <span className="archive-count-badge">{openInvoices.length} open invoices</span>
          </div>
          <table className="data-table">
            <thead>
              <tr>
                <th>BUCKET</th>
                <th>INVOICE NO.</th>
                <th>CLIENT</th>
                <th>DUE DATE</th>
                <th>DAYS OVERDUE</th>
                <th>TOTAL</th>
                <th>BALANCE</th>
                <th>STATUS</th>
              </tr>
            </thead>
            <tbody>
              {bucketData.map((b) =>
                b.invoices.map((inv) => (
                  <tr key={inv.id}>
                    <td>
                      <StatusBadge status={inv.agingBucket} size="sm" />
                    </td>
                    <td>
                      <Link to={`/invoices/${inv.id}`} className="waybill-link">
                        {inv.invoiceNo}
                      </Link>
                    </td>
                    <td>
                      <span className="cell-name">{inv.clientName}</span>
                    </td>
                    <td>{formatDate(inv.dueDate)}</td>
                    <td style={{ color: inv.daysOverdue > 0 ? 'var(--status-failed)' : 'var(--text-primary)' }}>
                      {inv.daysOverdue}
                    </td>
                    <td className="amount-cell">{formatCurrency(inv.totalAmount)}</td>
                    <td className={`amount-cell ${inv.balance > 0 ? 'balance-positive' : 'balance-zero'}`}>
                      {formatCurrency(inv.balance)}
                    </td>
                    <td>
                      <StatusBadge status={inv.paymentStatus} size="sm" />
                    </td>
                  </tr>
                )),
              )}
              {openInvoices.length === 0 && (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '32px', color: 'var(--text-secondary)' }}>
                    No open receivables. All caught up!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
