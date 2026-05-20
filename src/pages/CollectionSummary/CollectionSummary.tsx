import { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Download, Wallet, TrendingUp, Receipt, Users } from 'lucide-react';
import Header from '../../components/layout/Header';
import StatCard from '../../components/ui/StatCard';
import { useData } from '../../context/DataContext';
import { currencyTooltipFormatter, downloadCSV, formatCurrency } from '../../utils/finance';
import { monthlyCollections } from '../../data/mockData';
import '../Invoices/Invoices.css';
import '../Report/Reports.css';

export default function CollectionSummary() {
  const { payments, invoices, clients } = useData();

  const topClients = useMemo(() => {
    const totals = new Map<string, { name: string; amount: number }>();
    payments.forEach((p) => {
      const t = totals.get(p.clientId) || { name: p.clientName, amount: 0 };
      t.amount += p.amount;
      totals.set(p.clientId, t);
    });
    return Array.from(totals.entries())
      .map(([id, v]) => ({ clientId: id, name: v.name, amount: v.amount }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5);
  }, [payments]);

  const totalCollected = payments.reduce((s, p) => s + p.amount, 0);
  const collectionsThisMonth = payments
    .filter((p) => p.paymentDate.startsWith(new Date().toISOString().slice(0, 7)))
    .reduce((s, p) => s + p.amount, 0);
  const totalBilled = invoices.reduce((s, inv) => s + inv.totalAmount, 0);
  const rate = totalBilled ? ((totalCollected / totalBilled) * 100).toFixed(1) : '0.0';

  const handleExport = () => {
    const rows: (string | number)[][] = [
      ['Collection Summary'],
      ['Month', 'Billed', 'Collected'],
      ...monthlyCollections.map((m) => [m.month, m.billed, m.collected]),
      [],
      ['Top Clients by Collection'],
      ['Client', 'Total Collected'],
      ...topClients.map((c) => [c.name, c.amount]),
    ];
    downloadCSV('collection-summary', rows);
  };

  return (
    <>
      <Header
        title="Collection Summary"
        subtitle="ARCMS · Reports"
        actions={
          <button className="btn btn-primary btn-sm" onClick={handleExport}>
            <Download size={14} /> EXPORT CSV
          </button>
        }
      />
      <div className="page-content">
        <div className="stats-row" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 'var(--gap)' }}>
          <StatCard
            icon={<Wallet size={18} />}
            iconColor="var(--status-active)"
            iconBg="var(--status-active-bg)"
            label="TOTAL COLLECTED"
            value={formatCurrency(totalCollected)}
            subtitle="All time"
            subtitleColor="var(--status-active)"
          />
          <StatCard
            icon={<TrendingUp size={18} />}
            iconColor="var(--primary)"
            iconBg="var(--status-transit-bg)"
            label="THIS MONTH"
            value={formatCurrency(collectionsThisMonth)}
            subtitle="Collected this month"
          />
          <StatCard
            icon={<Receipt size={18} />}
            iconColor="var(--status-new)"
            iconBg="var(--status-new-bg)"
            label="COLLECTION RATE"
            value={`${rate}%`}
            subtitle="of total billings"
          />
          <StatCard
            icon={<Users size={18} />}
            iconColor="var(--status-pending)"
            iconBg="var(--status-pending-bg)"
            label="ACTIVE CLIENTS"
            value={clients.filter((c) => c.status === 'Active').length}
            subtitle="With balances"
          />
        </div>

        <div className="card chart-card">
          <div className="card-header">
            <h4>Monthly Collections vs Billings</h4>
            <div className="chart-legend">
              <span className="legend-item">
                <span className="legend-dot" style={{ background: '#A3AED0' }} /> Billed
              </span>
              <span className="legend-item">
                <span className="legend-dot" style={{ background: 'var(--primary)' }} /> Collected
              </span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={monthlyCollections} barCategoryGap="20%" barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E9EDF7" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#A3AED0' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#A3AED0' }} axisLine={false} tickLine={false} />
              <Tooltip formatter={currencyTooltipFormatter} />
              <Legend />
              <Bar dataKey="billed" fill="#A3AED0" radius={[4, 4, 0, 0]} />
              <Bar dataKey="collected" fill="#00A99D" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <div className="card-header">
            <h4>Top Clients by Collection</h4>
          </div>
          <table className="data-table">
            <thead>
              <tr>
                <th>RANK</th>
                <th>CLIENT</th>
                <th>TOTAL COLLECTED</th>
              </tr>
            </thead>
            <tbody>
              {topClients.length === 0 ? (
                <tr>
                  <td colSpan={3} style={{ textAlign: 'center', padding: '32px', color: 'var(--text-secondary)' }}>
                    No collections recorded yet.
                  </td>
                </tr>
              ) : (
                topClients.map((c, i) => (
                  <tr key={c.clientId}>
                    <td>#{i + 1}</td>
                    <td className="cell-name">{c.name}</td>
                    <td className="amount-cell">{formatCurrency(c.amount)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
