import Header from '../../components/layout/Header';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useData } from '../../context/DataContext';
import '../../pages/Report/Reports.css';

export default function AnalyticsView() {
  const { deliveryOrders } = useData();

  const computedDailyDeliveries = Array.from({ length: 30 }, (_, i) => {
    const day = i + 1;
    const ordersOnDay = deliveryOrders.filter(o => {
      const d = new Date(o.orderDate);
      return !isNaN(d.getTime()) && d.getDate() === day;
    });

    const currentDate = new Date();
    const dateOfThisDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    const isWeekend = dateOfThisDay.getDay() === 0 || dateOfThisDay.getDay() === 6;
    
    const count = ordersOnDay.length;
    const isPeak = count >= 3;

    return {
      day: day.toString(),
      weekday: (!isWeekend && !isPeak) ? count : 0,
      weekend: (isWeekend && !isPeak) ? count : 0,
      peak: isPeak ? count : 0
    };
  });

  return (
    <>
      <Header title="Analytics View" subtitle="Performance Tracking" />
      <div className="page-content">
        <div className="card chart-card">
          <div className="card-header">
            <h4>Daily Deliveries Trend</h4>
            <div className="chart-legend">
              <span className="legend-item"><span className="legend-dot" style={{ background: 'var(--primary)' }} /> Weekday</span>
              <span className="legend-item"><span className="legend-dot" style={{ background: '#A3AED0' }} /> Weekend</span>
              <span className="legend-item"><span className="legend-dot" style={{ background: 'var(--status-pending)' }} /> Peak</span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={computedDailyDeliveries} barCategoryGap="20%" barGap={0}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E9EDF7" vertical={false} />
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#A3AED0' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#A3AED0' }} axisLine={false} tickLine={false} />
              <Tooltip />
              <Bar dataKey="weekday" fill="#00A99D" radius={[3, 3, 0, 0]} />
              <Bar dataKey="weekend" fill="#A3AED0" radius={[3, 3, 0, 0]} />
              <Bar dataKey="peak" fill="#FFB547" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </>
  );
}
