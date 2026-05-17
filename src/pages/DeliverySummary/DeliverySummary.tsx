import Header from '../../components/layout/Header';
import { driverPerformance } from '../../data/mockData';
import '../../pages/Report/Reports.css';

export default function DeliverySummary() {
  const computedDriverPerformance = driverPerformance;

  return (
    <>
      <Header
        title="Delivery Summary"
        subtitle="Data & Reports"
        actions={
          <button className="btn btn-primary btn-sm">
            EXPORT CSV
          </button>
        }
      />
      <div className="page-content">
        <div className="card">
          <div className="card-header">
            <h4>Generated Summary</h4>
          </div>
          <table className="data-table driver-perf-table">
            <thead>
              <tr>
                <th>DRIVER</th>
                <th>TOTAL ORDERS</th>
                <th>DELIVERED</th>
                <th>FAILED</th>
                <th>SUCCESS RATE</th>
                <th>RATING</th>
              </tr>
            </thead>
            <tbody>
              {computedDriverPerformance.length > 0 ? computedDriverPerformance.map(d => (
                <tr key={d.name}>
                  <td>
                    <div className="driver-cell">
                      <div className="driver-avatar" style={{ background: d.color }}>{d.initials}</div>
                      <div><strong>{d.name}</strong></div>
                    </div>
                  </td>
                  <td>{d.totalOrders}</td>
                  <td style={{ color: 'var(--status-active)' }}>{d.delivered}</td>
                  <td style={{ color: 'var(--status-failed)' }}>{d.failed}</td>
                  <td>{d.successRate}</td>
                  <td><span className="rating-badge">● {d.rating}</span></td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
                    No driver data found from current delivery orders.
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
