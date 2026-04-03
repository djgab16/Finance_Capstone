import { AlertTriangle, Search, Eye, UserPlus, Clock } from 'lucide-react';
import Header from '../../components/layout/Header';
import StatCard from '../../components/ui/StatCard';
import StatusBadge from '../../components/ui/StatusBadge';
import { deliveryOrders } from '../../data/mockData';
import './FailedPickups.css';

const failedOrders = deliveryOrders.filter(o => o.status === 'Pending');

export default function FailedPickups() {
  return (
    <>
      <Header title="Failed Pickup Monitoring" subtitle="Management" date="Sunday, March 29, 2026" />
      <div className="page-content">
        <div className="stats-row" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
          <StatCard icon={<AlertTriangle size={18} />} iconColor="var(--status-failed)" iconBg="var(--status-failed-bg)" label="TOTAL FAILED PICKUPS" value="3" subtitle="Needs immediate action" subtitleColor="var(--status-failed)" />
          <StatCard icon={<Clock size={18} />} iconColor="var(--status-pending)" iconBg="var(--status-pending-bg)" label="OVERDUE > 2 DAYS" value="2" subtitle="Critical" subtitleColor="var(--status-failed)" />
          <StatCard icon={<UserPlus size={18} />} iconColor="var(--primary)" iconBg="var(--status-transit-bg)" label="UNASSIGNED" value="1" subtitle="Needs driver assignment" />
          <StatCard icon={<AlertTriangle size={18} />} iconColor="var(--status-pending)" iconBg="var(--status-pending-bg)" label="AVG. DAYS OVERDUE" value="2.3" subtitle="Target: < 1 day" />
        </div>

        <div className="orders-filter-bar">
          <div className="filter-search">
            <Search size={16} className="filter-search-icon" />
            <input type="text" placeholder="Search failed pickups..." className="filter-search-input" id="failed-search" />
          </div>
          <select className="filter-select"><option>All Areas</option></select>
          <select className="filter-select"><option>All Drivers</option></select>
        </div>

        <div className="card">
          <table className="data-table">
            <thead>
              <tr>
                <th>WAYBILL NO.</th>
                <th>CLIENT / SENDER</th>
                <th>RECIPIENT</th>
                <th>AREA</th>
                <th>DRIVER</th>
                <th>DAYS OVERDUE</th>
                <th>STATUS</th>
                <th>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {failedOrders.map((order, i) => (
                <tr key={order.id}>
                  <td><span className="waybill-link">{order.waybillNo}</span></td>
                  <td className="cell-name">{order.clientName}</td>
                  <td>{order.recipientName}</td>
                  <td>{order.area}</td>
                  <td>
                    {order.driverName ? (
                      <div className="driver-cell">
                        <div className="driver-avatar" style={{ background: order.driverColor }}>{order.driverInitials}</div>
                        <span>{order.driverName.split(',')[0]}</span>
                      </div>
                    ) : <span style={{ color: 'var(--status-failed)', fontWeight: 600 }}>Unassigned</span>}
                  </td>
                  <td><span className="overdue-badge">{i === 0 ? '3 days' : '2 days'}</span></td>
                  <td><StatusBadge status="Pending" size="sm" /></td>
                  <td className="cell-actions">
                    <button className="action-icon-btn" title="View"><Eye size={14} /></button>
                    <button className="action-icon-btn" title="Assign Driver"><UserPlus size={14} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
