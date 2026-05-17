import { Users, ClipboardList, CheckCircle2, AlertCircle, Pencil, X, Package } from 'lucide-react';
import Header from '../../components/layout/Header';
import StatCard from '../../components/ui/StatCard';
import RoleBadge from '../../components/ui/RoleBadge';
import StatusBadge from '../../components/ui/StatusBadge';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { BarChart, Bar, XAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { dailyDeliveries } from '../../data/mockData';
import './Dashboard.css';

export default function Dashboard() {
  const { employees, deleteEmployee, deliveryOrders, activityLogs } = useData();
  const { user } = useAuth();
  const navigate = useNavigate();

  const totalEmployees = employees.length;
  const activeTasks = deliveryOrders.filter(o => o.status === 'Pending' || o.status === 'In Transit').length;
  const completedTasks = deliveryOrders.filter(o => o.status === 'Completed' || o.status === 'Delivered').length;
  const lockedAccounts = employees.filter(e => e.status === 'Locked').length;

  const isAdmin = user?.role === 'ADMIN';

  return (
    <>
      <Header
        title="Board Overview"
        subtitle={`${user?.role} Dashboard`}
        date={new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
      />
      <div className="dashboard-content">
        {/* Stats Row */}
        <div className="stats-row">

          <StatCard
            icon={<ClipboardList size={18} />}
            iconColor="var(--status-pending)"
            iconBg="var(--status-pending-bg)"
            label="ACTIVE TASKS"
            value={activeTasks}
            subtitle="Pending & In Transit"
            subtitleColor="var(--status-active)"
            accentColor="#FFB547"
          />
          <StatCard
            icon={<CheckCircle2 size={18} />}
            iconColor="var(--status-active)"
            iconBg="var(--status-active-bg)"
            label="TASKS COMPLETED"
            value={completedTasks}
            subtitle="Total successful deliveries"
            subtitleColor="var(--status-active)"
            accentColor="#00A99D"
          />

        </div>

        {/* Main Content Grid */}
        <div className="dashboard-grid">


          {/* Activity Feed */}
          <div className="card dashboard-activity">
            <div className="card-header">
              <h3>{isAdmin ? 'Recent Activity' : 'Your Activity'}</h3>
              <button className="text-link" onClick={() => navigate('/activity-logs')}>View All</button>
            </div>
            <div className="activity-feed-list">
              {(isAdmin ? activityLogs : activityLogs.filter(log => log.userName === user?.name))
                .slice(0, 8).map((log) => (
                <div key={log.id} className="activity-feed-item">
                  <div className="activity-feed-dot" style={{ background: log.userColor }} />
                  <div className="activity-feed-content">
                    <p className="activity-feed-text">
                      <strong>{isAdmin ? log.userName : 'You'}</strong> {log.description}
                    </p>
                    <span className="activity-feed-time">{log.timestamp}</span>
                  </div>
                </div>
              ))}
              {(!isAdmin && activityLogs.filter(log => log.userName === user?.name).length === 0) && (
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No recent activity found.</p>
              )}
            </div>
          </div>
        </div>

        {/* Bottom Row */}
        <div className="dashboard-bottom-row">


          {/* System Status */}
          <div className="card dashboard-system-status">
            <div className="card-header">
              <h3>System Status</h3>
              <span className="system-all-operational">All Operational</span>
            </div>
            <div className="system-status-list">
              <div className="system-status-item">
                <div className="system-icon" style={{ background: 'var(--status-transit-bg)', color: 'var(--primary)' }}>
                  <Users size={16} />
                </div>
                <div className="system-info">
                  <span className="system-name">Operation System</span>
                  <span className="system-detail">{employees.length} employees active</span>
                </div>
                <span className="system-uptime">99.9%</span>
              </div>
              <div className="system-status-item">
                <div className="system-icon" style={{ background: 'var(--status-failed-bg)', color: 'var(--status-failed)' }}>
                  <ClipboardList size={16} />
                </div>
                <div className="system-info">
                  <span className="system-name">Delivery Management</span>
                  <span className="system-detail">{deliveryOrders.length} total orders</span>
                </div>
                <span className="system-uptime">99.7%</span>
              </div>
              <div className="system-status-item">
                <div className="system-icon" style={{ background: 'var(--status-active-bg)', color: 'var(--status-active)' }}>
                  <Package size={16} />
                </div>
                <div className="system-info">
                  <span className="system-name">Delivery Tracker</span>
                  <span className="system-detail">{activeTasks} active shipments</span>
                </div>
                <span className="system-uptime">98.2%</span>
              </div>
            </div>
          </div>

          {/* Performance Graph (Visible to Everyone) */}
          <div className="card dashboard-performance-graph">
            <div className="card-header">
              <h3>Delivery Performance</h3>
              <span className="system-all-operational text-sm" style={{ background: 'var(--status-transit-bg)', color: 'var(--primary)' }}>This Week</span>
            </div>
            <div style={{ width: '100%', height: '220px', marginTop: '16px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dailyDeliveries}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E9EDF7" />
                  <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#A3AED0' }} />
                  <Tooltip cursor={{ fill: 'rgba(0,0,0,0.02)' }} />
                  <Bar dataKey="weekday" fill="var(--primary)" radius={[4, 4, 0, 0]} maxBarSize={40} name="Standard Deliveries" />
                  <Bar dataKey="peak" fill="var(--status-pending)" radius={[4, 4, 0, 0]} maxBarSize={40} name="Peak Deliveries" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>
      </div>
    </>
  );
}
