import { Users, ClipboardList, CheckCircle2, AlertCircle, Pencil, X, Package } from 'lucide-react';
import Header from '../../components/layout/Header';
import StatCard from '../../components/ui/StatCard';
import RoleBadge from '../../components/ui/RoleBadge';
import StatusBadge from '../../components/ui/StatusBadge';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import './Dashboard.css';

export default function Dashboard() {
  const { employees, deliveryOrders, activityLogs } = useData();
  const { user } = useAuth();

  const totalEmployees = employees.length;
  const activeTasks = deliveryOrders.filter(o => o.status === 'Pending' || o.status === 'In Transit').length;
  const completedTasks = deliveryOrders.filter(o => o.status === 'Completed' || o.status === 'Delivered').length;
  const lockedAccounts = employees.filter(e => e.status === 'Locked').length;

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
            icon={<Users size={18} />}
            iconColor="var(--primary)"
            iconBg="var(--status-transit-bg)"
            label="TOTAL EMPLOYEES"
            value={totalEmployees}
            subtitle="Current active staff"
            accentColor="#01B574"
          />
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
          <StatCard
            icon={<AlertCircle size={18} />}
            iconColor="var(--status-failed)"
            iconBg="var(--status-failed-bg)"
            label="LOCKED ACCOUNTS"
            value={lockedAccounts}
            subtitle="Needs admin action"
            subtitleColor="var(--status-failed)"
            accentColor="#E31A1A"
          />
        </div>

        {/* Main Content Grid */}
        <div className="dashboard-grid">
          {/* Employees Table */}
          <div className="card dashboard-employees">
            <div className="card-header">
              <h3>Recent Employees</h3>
              <a href="/employees" className="view-all-link">View all →</a>
            </div>
            <table className="data-table">
              <thead>
                <tr>
                  <th>NAME</th>
                  <th>ID</th>
                  <th>ROLE</th>
                  <th>SYSTEM ACCESS</th>
                  <th>STATUS</th>
                  <th>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {employees.slice(0, 5).map(emp => (
                  <tr key={emp.id}>
                    <td className="cell-name">{emp.name}</td>
                    <td className="cell-id">{emp.id}</td>
                    <td><RoleBadge role={emp.role} /></td>
                    <td className="cell-muted">{emp.systemAccess}</td>
                    <td><StatusBadge status={emp.status} size="sm" /></td>
                    <td className="cell-actions">
                      <button className="action-icon-btn" title="Edit"><Pencil size={14} /></button>
                      {emp.role !== 'SUPER ADMIN' && (
                        <button className="action-icon-btn danger" title="Remove"><X size={14} /></button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Activity Feed */}
          <div className="card dashboard-activity">
            <div className="card-header">
              <h3>Recent Activity</h3>
              <button className="text-link">View All</button>
            </div>
            <div className="activity-feed-list">
              {activityLogs.slice(0, 8).map((log) => (
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
        </div>

        {/* Bottom Row */}
        <div className="dashboard-bottom-row">
          {/* Quick Actions */}
          <div className="card dashboard-quick-actions">
            <h3>Quick Actions</h3>
            <div className="quick-actions-grid">
              <button className="quick-action-btn">
                <div className="quick-action-icon" style={{ background: 'var(--primary)' }}>
                  <Users size={20} color="white" />
                </div>
                <span>Add Employee</span>
              </button>
              <button className="quick-action-btn">
                <div className="quick-action-icon" style={{ background: 'var(--status-pending)' }}>
                  <ClipboardList size={20} color="white" />
                </div>
                <span>Create Task</span>
              </button>
            </div>
          </div>

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

          {/* Role Distribution */}
          <div className="card dashboard-role-dist">
            <h3>Role Distribution</h3>
            <div className="role-bars">
              <div className="role-bar-item">
                <span className="role-bar-label">Op. Team</span>
                <div className="role-bar-track">
                  <div className="role-bar-fill" style={{ width: `${(employees.filter(e => e.role === 'OP. TEAM').length / employees.length) * 100}%`, background: 'var(--primary)' }} />
                </div>
                <span className="role-bar-value">{employees.filter(e => e.role === 'OP. TEAM').length}</span>
              </div>
              <div className="role-bar-item">
                <span className="role-bar-label">Admin</span>
                <div className="role-bar-track">
                  <div className="role-bar-fill" style={{ width: `${(employees.filter(e => e.role === 'ADMIN').length / employees.length) * 100}%`, background: 'var(--role-ops-team)' }} />
                </div>
                <span className="role-bar-value">{employees.filter(e => e.role === 'ADMIN').length}</span>
              </div>
              <div className="role-bar-item">
                <span className="role-bar-label">Super Admin</span>
                <div className="role-bar-track">
                  <div className="role-bar-fill" style={{ width: `${(employees.filter(e => e.role === 'SUPER ADMIN').length / employees.length) * 100}%`, background: 'var(--status-active)' }} />
                </div>
                <span className="role-bar-value">{employees.filter(e => e.role === 'SUPER ADMIN').length}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
