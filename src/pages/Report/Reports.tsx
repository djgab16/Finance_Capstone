import { useMemo, useState } from 'react';
import { Printer, Download, FileBarChart, TrendingUp, AlertTriangle, Clock } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import Header from '../../components/layout/Header';
import StatCard from '../../components/ui/StatCard';
import StatusBadge from '../../components/ui/StatusBadge';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { currencyTooltipFormatter, downloadCSV, formatCurrency, formatDate } from '../../utils/finance';
import { monthlyCollections } from '../../data/mockData';
import type { AgingBucket } from '../../types';
import '../Invoices/Invoices.css';
import './Reports.css';

type ReportTab = 'ar' | 'collection' | 'aging';

const BUCKETS: AgingBucket[] = ['Current', '1-30', '31-60', '61-90', '90+'];
const BUCKET_COLORS: Record<AgingBucket, string> = {
  Current: '#01B574',
  '1-30': '#FFB547',
  '31-60': '#00A99D',
  '61-90': '#FF7B42',
  '90+': '#E31A1A',
};

export default function Reports() {
  const { invoices, payments } = useData();
  const { user } = useAuth();
  const [tab, setTab] = useState<ReportTab>('ar');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const filteredInvoices = useMemo(() => {
    return invoices.filter((inv) => {
      if (inv.archived) return false;
      if (dateFrom && inv.billingDate < dateFrom) return false;
      if (dateTo && inv.billingDate > dateTo) return false;
      return true;
    });
  }, [invoices, dateFrom, dateTo]);

  const filteredPayments = useMemo(() => {
    return payments.filter((p) => {
      if (dateFrom && p.paymentDate < dateFrom) return false;
      if (dateTo && p.paymentDate > dateTo) return false;
      return true;
    });
  }, [payments, dateFrom, dateTo]);

  const totalBilled = filteredInvoices.reduce((s, inv) => s + inv.totalAmount, 0);
  const totalCollected = filteredPayments.reduce((s, p) => s + p.amount, 0);
  const totalOutstanding = filteredInvoices.reduce((s, inv) => s + inv.balance, 0);
  const overdueAmount = filteredInvoices
    .filter((inv) => inv.paymentStatus === 'Overdue')
    .reduce((s, inv) => s + inv.balance, 0);

  const collectionRate = totalBilled ? ((totalCollected / totalBilled) * 100).toFixed(1) : '0.0';

  const agingData = useMemo(() => {
    return BUCKETS.map((b) => {
      const list = filteredInvoices.filter((inv) => inv.agingBucket === b && inv.balance > 0);
      const total = list.reduce((sum, inv) => sum + inv.balance, 0);
      return { bucket: b, count: list.length, total, color: BUCKET_COLORS[b] };
    });
  }, [filteredInvoices]);

  const methodMix = useMemo(() => {
    const map: Record<string, number> = {};
    filteredPayments.forEach((p) => {
      map[p.paymentMethod] = (map[p.paymentMethod] || 0) + p.amount;
    });
    const colors = ['#00A99D', '#4318FF', '#FFB547', '#FF7B42'];
    return Object.entries(map).map(([name, value], i) => ({ name, value, color: colors[i % colors.length] }));
  }, [filteredPayments]);

  const handleExportAR = () => {
    const rows: (string | number)[][] = [
      ['Accounts Receivable Report'],
      ['Generated', new Date().toISOString()],
      ['Date From', dateFrom || 'All time'],
      ['Date To', dateTo || 'Present'],
      [],
      ['Invoice No', 'Client', 'Billing Date', 'Due Date', 'Total', 'Amount Paid', 'Balance', 'Status', 'Aging'],
      ...filteredInvoices.map((inv) => [
        inv.invoiceNo,
        inv.clientName,
        inv.billingDate,
        inv.dueDate,
        inv.totalAmount,
        inv.amountPaid,
        inv.balance,
        inv.paymentStatus,
        inv.agingBucket,
      ]),
    ];
    downloadCSV('ar-report', rows);
  };

  const handleExportCollection = () => {
    const rows: (string | number)[][] = [
      ['Collection Summary Report'],
      ['Date From', dateFrom || 'All time'],
      ['Date To', dateTo || 'Present'],
      [],
      ['OR Number', 'Invoice No', 'Client', 'Payment Date', 'Amount', 'Method', 'Reference', 'Recorded By'],
      ...filteredPayments.map((p) => [
        p.orNumber,
        p.invoiceNo,
        p.clientName,
        p.paymentDate,
        p.amount,
        p.paymentMethod,
        p.referenceNumber || '',
        p.recordedBy,
      ]),
    ];
    downloadCSV('collection-summary', rows);
  };

  const handleExportAging = () => {
    const rows: (string | number)[][] = [
      ['Aging Report'],
      ['Bucket', 'Invoice Count', 'Outstanding Balance'],
      ...agingData.map((b) => [b.bucket, b.count, b.total]),
    ];
    downloadCSV('aging-report', rows);
  };

  const exportHandlers = { ar: handleExportAR, collection: handleExportCollection, aging: handleExportAging };

  return (
    <>
      <Header
        title="Reports"
        subtitle={`${user?.role} · ARCMS`}
        date={new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        actions={
          <div className="flex gap-sm">
            <button className="btn btn-outline btn-sm" onClick={() => window.print()}>
              <Printer size={14} /> Print
            </button>
            <button className="btn btn-primary btn-sm" onClick={exportHandlers[tab]}>
              <Download size={14} /> Export CSV
            </button>
          </div>
        }
      />
      <div className="page-content">
        <div className="reports-layout">
          <div className="reports-config card">
            <h4>Report Configuration</h4>
            <p className="card-subtitle">Select report and date range</p>
            <div className="config-section">
              <span className="label">REPORT TYPE</span>
              <label className={`radio-option ${tab === 'ar' ? 'active' : ''}`}>
                <input type="radio" name="type" checked={tab === 'ar'} onChange={() => setTab('ar')} />
                AR Report
                <span className="radio-desc">Outstanding receivables & invoices</span>
              </label>
              <label className={`radio-option ${tab === 'collection' ? 'active' : ''}`}>
                <input type="radio" name="type" checked={tab === 'collection'} onChange={() => setTab('collection')} />
                Collection Summary
                <span className="radio-desc">Recorded payments breakdown</span>
              </label>
              <label className={`radio-option ${tab === 'aging' ? 'active' : ''}`}>
                <input type="radio" name="type" checked={tab === 'aging'} onChange={() => setTab('aging')} />
                Aging Report
                <span className="radio-desc">Receivables aging buckets</span>
              </label>
            </div>
            <div className="config-section">
              <span className="label">DATE RANGE</span>
              <div className="form-row two-col">
                <div className="form-group">
                  <label className="form-label">FROM</label>
                  <input className="form-input" type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">TO</label>
                  <input className="form-input" type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
                </div>
              </div>
            </div>
            <button className="btn btn-primary" style={{ width: '100%', marginTop: '12px' }} onClick={exportHandlers[tab]}>
              <FileBarChart size={16} /> EXPORT REPORT
            </button>
            <button className="btn btn-outline" style={{ width: '100%', marginTop: '8px' }} onClick={() => window.print()}>
              <Printer size={16} /> Print as PDF
            </button>
          </div>

          <div className="reports-main">
            <div className="card">
              <div className="report-header">
                <div>
                  <span className="label" style={{ color: 'var(--primary)' }}>
                    {tab === 'ar' && 'ACCOUNTS RECEIVABLE REPORT'}
                    {tab === 'collection' && 'COLLECTION SUMMARY REPORT'}
                    {tab === 'aging' && 'AGING REPORT'}
                  </span>
                  <h2>
                    {tab === 'ar' && 'Outstanding Receivables Overview'}
                    {tab === 'collection' && 'Payment Collection Summary'}
                    {tab === 'aging' && 'Receivables Aging Analysis'}
                  </h2>
                  <p className="text-sm text-muted">
                    Generated {new Date().toLocaleString()} · {filteredInvoices.length} invoices ·{' '}
                    {filteredPayments.length} payments
                  </p>
                </div>
              </div>
            </div>

            <div className="stats-row" style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 'var(--gap)' }}>
              <StatCard
                icon={<FileBarChart size={18} />}
                iconColor="var(--primary)"
                iconBg="var(--status-transit-bg)"
                label="TOTAL BILLED"
                value={formatCurrency(totalBilled)}
                subtitle="In selected period"
              />
              <StatCard
                icon={<TrendingUp size={18} />}
                iconColor="var(--status-active)"
                iconBg="var(--status-active-bg)"
                label="COLLECTED"
                value={formatCurrency(totalCollected)}
                subtitle={`${collectionRate}% collection rate`}
                subtitleColor="var(--status-active)"
              />
              <StatCard
                icon={<Clock size={18} />}
                iconColor="var(--status-pending)"
                iconBg="var(--status-pending-bg)"
                label="OUTSTANDING"
                value={formatCurrency(totalOutstanding)}
                subtitle="Open balance"
              />
              <StatCard
                icon={<AlertTriangle size={18} />}
                iconColor="var(--status-failed)"
                iconBg="var(--status-failed-bg)"
                label="OVERDUE"
                value={formatCurrency(overdueAmount)}
                subtitle="Past due amount"
                subtitleColor="var(--status-failed)"
              />
              <StatCard
                icon={<FileBarChart size={18} />}
                iconColor="var(--status-new)"
                iconBg="var(--status-new-bg)"
                label="ACTIVE CLIENTS"
                value={new Set(filteredInvoices.map((inv) => inv.clientId)).size}
                subtitle="With invoices"
              />
            </div>

            {tab === 'ar' && (
              <div className="card">
                <div className="card-header">
                  <h4>Outstanding Invoices</h4>
                  <span className="archive-count-badge">{filteredInvoices.length} records</span>
                </div>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>INVOICE NO.</th>
                      <th>CLIENT</th>
                      <th>BILLING DATE</th>
                      <th>DUE DATE</th>
                      <th>TOTAL</th>
                      <th>BALANCE</th>
                      <th>STATUS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredInvoices.map((inv) => (
                      <tr key={inv.id}>
                        <td className="waybill-link">{inv.invoiceNo}</td>
                        <td className="cell-name">{inv.clientName}</td>
                        <td>{formatDate(inv.billingDate)}</td>
                        <td>{formatDate(inv.dueDate)}</td>
                        <td className="amount-cell">{formatCurrency(inv.totalAmount)}</td>
                        <td className={`amount-cell ${inv.balance > 0 ? 'balance-positive' : 'balance-zero'}`}>
                          {formatCurrency(inv.balance)}
                        </td>
                        <td>
                          <StatusBadge status={inv.paymentStatus} size="sm" />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {tab === 'collection' && (
              <>
                <div className="charts-row">
                  <div className="card chart-card" style={{ flex: 2 }}>
                    <div className="card-header">
                      <h4>Monthly Collections</h4>
                    </div>
                    <ResponsiveContainer width="100%" height={220}>
                      <LineChart data={monthlyCollections}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#E9EDF7" vertical={false} />
                        <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#A3AED0' }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fontSize: 11, fill: '#A3AED0' }} axisLine={false} tickLine={false} />
                        <Tooltip formatter={currencyTooltipFormatter} />
                        <Line type="monotone" dataKey="billed" stroke="#A3AED0" strokeWidth={2} />
                        <Line type="monotone" dataKey="collected" stroke="#00A99D" strokeWidth={2} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="card chart-card" style={{ flex: 1 }}>
                    <h4>Payment Method Mix</h4>
                    <div className="pie-chart-wrapper">
                      <ResponsiveContainer width="100%" height={180}>
                        <PieChart>
                          <Pie data={methodMix} cx="50%" cy="50%" innerRadius={55} outerRadius={75} paddingAngle={2} dataKey="value">
                            {methodMix.map((entry, i) => (
                              <Cell key={i} fill={entry.color} />
                            ))}
                          </Pie>
                        </PieChart>
                      </ResponsiveContainer>
                      <div className="pie-center-text">
                        <strong>{filteredPayments.length}</strong>
                        <span>total</span>
                      </div>
                    </div>
                    <div className="pie-legend">
                      {methodMix.map((m) => (
                        <span key={m.name}>
                          <span className="legend-dot" style={{ background: m.color }} /> {m.name}
                          <strong>{formatCurrency(m.value)}</strong>
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="card">
                  <div className="card-header">
                    <h4>Recorded Payments</h4>
                    <span className="archive-count-badge">{filteredPayments.length} payments</span>
                  </div>
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>OR NUMBER</th>
                        <th>INVOICE</th>
                        <th>CLIENT</th>
                        <th>DATE</th>
                        <th>AMOUNT</th>
                        <th>METHOD</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredPayments.map((p) => (
                        <tr key={p.id}>
                          <td className="waybill-link">{p.orNumber}</td>
                          <td>{p.invoiceNo}</td>
                          <td className="cell-name">{p.clientName}</td>
                          <td>{formatDate(p.paymentDate)}</td>
                          <td className="amount-cell">{formatCurrency(p.amount)}</td>
                          <td>{p.paymentMethod}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}

            {tab === 'aging' && (
              <>
                <div className="card chart-card">
                  <div className="card-header">
                    <h4>Aging Distribution</h4>
                  </div>
                  <ResponsiveContainer width="100%" height={260}>
                    <BarChart data={agingData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E9EDF7" vertical={false} />
                      <XAxis dataKey="bucket" tick={{ fontSize: 12, fill: '#A3AED0' }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 11, fill: '#A3AED0' }} axisLine={false} tickLine={false} />
                      <Tooltip formatter={currencyTooltipFormatter} />
                      <Bar dataKey="total" radius={[6, 6, 0, 0]} maxBarSize={70}>
                        {agingData.map((entry) => (
                          <Cell key={entry.bucket} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <div className="card">
                  <div className="card-header">
                    <h4>Aging Summary</h4>
                  </div>
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>BUCKET</th>
                        <th>INVOICE COUNT</th>
                        <th>OUTSTANDING BALANCE</th>
                      </tr>
                    </thead>
                    <tbody>
                      {agingData.map((b) => (
                        <tr key={b.bucket}>
                          <td>
                            <StatusBadge status={b.bucket} size="sm" />
                          </td>
                          <td>{b.count}</td>
                          <td className="amount-cell">{formatCurrency(b.total)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
