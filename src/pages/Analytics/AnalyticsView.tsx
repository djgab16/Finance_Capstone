import { useMemo } from 'react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { TrendingUp, AlertTriangle, Wallet, Users } from 'lucide-react';
import Header from '../../components/layout/Header';
import StatCard from '../../components/ui/StatCard';
import { useData } from '../../context/DataContext';
import { currencyTooltipFormatter, formatCurrency } from '../../utils/finance';
import { monthlyCollections } from '../../data/mockData';
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

export default function AnalyticsView() {
  const { invoices, payments, clients } = useData();

  const totalAR = invoices.reduce((s, inv) => s + inv.balance, 0);
  const totalCollected = payments.reduce((s, p) => s + p.amount, 0);
  const totalOverdue = invoices.filter((inv) => inv.paymentStatus === 'Overdue').reduce((s, inv) => s + inv.balance, 0);

  const agingData = useMemo(
    () =>
      BUCKETS.map((b) => ({
        bucket: b,
        total: invoices.filter((inv) => inv.agingBucket === b && inv.balance > 0).reduce((s, inv) => s + inv.balance, 0),
        color: BUCKET_COLORS[b],
      })),
    [invoices],
  );

  const topDebtors = useMemo(() => {
    return [...clients]
      .filter((c) => c.currentBalance > 0)
      .sort((a, b) => b.currentBalance - a.currentBalance)
      .slice(0, 5)
      .map((c) => ({ name: c.name, balance: c.currentBalance }));
  }, [clients]);

  const methodMix = useMemo(() => {
    const map: Record<string, number> = {};
    payments.forEach((p) => {
      map[p.paymentMethod] = (map[p.paymentMethod] || 0) + p.amount;
    });
    const colors = ['#00A99D', '#4318FF', '#FFB547', '#FF7B42'];
    return Object.entries(map).map(([name, value], i) => ({ name, value, color: colors[i % colors.length] }));
  }, [payments]);

  return (
    <>
      <Header title="Analytics" subtitle="ARCMS · Performance Tracking" />
      <div className="page-content">
        <div className="stats-row" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 'var(--gap)' }}>
          <StatCard
            icon={<Wallet size={18} />}
            iconColor="var(--primary)"
            iconBg="var(--status-transit-bg)"
            label="TOTAL RECEIVABLES"
            value={formatCurrency(totalAR)}
          />
          <StatCard
            icon={<TrendingUp size={18} />}
            iconColor="var(--status-active)"
            iconBg="var(--status-active-bg)"
            label="COLLECTED (ALL TIME)"
            value={formatCurrency(totalCollected)}
            subtitleColor="var(--status-active)"
          />
          <StatCard
            icon={<AlertTriangle size={18} />}
            iconColor="var(--status-failed)"
            iconBg="var(--status-failed-bg)"
            label="OVERDUE TOTAL"
            value={formatCurrency(totalOverdue)}
            subtitleColor="var(--status-failed)"
          />
          <StatCard
            icon={<Users size={18} />}
            iconColor="var(--status-new)"
            iconBg="var(--status-new-bg)"
            label="CLIENTS WITH BALANCE"
            value={clients.filter((c) => c.currentBalance > 0).length}
          />
        </div>

        <div className="card chart-card">
          <div className="card-header">
            <h4>Monthly Collection Trend</h4>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={monthlyCollections}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E9EDF7" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#A3AED0' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#A3AED0' }} axisLine={false} tickLine={false} />
              <Tooltip formatter={currencyTooltipFormatter} />
              <Legend />
              <Line type="monotone" dataKey="billed" stroke="#A3AED0" strokeWidth={2} dot />
              <Line type="monotone" dataKey="collected" stroke="#00A99D" strokeWidth={3} dot />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="charts-row">
          <div className="card chart-card" style={{ flex: 2 }}>
            <div className="card-header">
              <h4>Aging Distribution</h4>
            </div>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={agingData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E9EDF7" vertical={false} />
                <XAxis dataKey="bucket" tick={{ fontSize: 12, fill: '#A3AED0' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#A3AED0' }} axisLine={false} tickLine={false} />
                <Tooltip formatter={currencyTooltipFormatter} />
                <Bar dataKey="total" radius={[6, 6, 0, 0]} maxBarSize={60}>
                  {agingData.map((entry) => (
                    <Cell key={entry.bucket} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="card chart-card" style={{ flex: 1 }}>
            <h4>Payment Method Mix</h4>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={methodMix} cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={2} dataKey="value">
                  {methodMix.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={currencyTooltipFormatter} />
              </PieChart>
            </ResponsiveContainer>
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

        <div className="card chart-card">
          <div className="card-header">
            <h4>Top Debtors (Highest Outstanding Balance)</h4>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={topDebtors} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#E9EDF7" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 11, fill: '#A3AED0' }} axisLine={false} tickLine={false} />
              <YAxis dataKey="name" type="category" width={140} tick={{ fontSize: 12, fill: '#1B254B' }} axisLine={false} tickLine={false} />
              <Tooltip formatter={currencyTooltipFormatter} />
              <Bar dataKey="balance" fill="#4318FF" radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </>
  );
}
