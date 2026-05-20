import { useState } from 'react';
import { Save, User as UserIcon, Users as UsersIcon, Shield, SlidersHorizontal, Pencil, Trash2, Plus, X } from 'lucide-react';
import Header from '../../components/layout/Header';
import RoleBadge from '../../components/ui/RoleBadge';
import StatusBadge from '../../components/ui/StatusBadge';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import type { Employee } from '../../types';
import '../Invoices/Invoices.css';

type Tab = 'profile' | 'users' | 'roles' | 'preferences';

const initialPermissions = [
  { module: 'View Dashboard', op: true, admin: true },
  { module: 'Create Invoices', op: true, admin: true },
  { module: 'Record Payments', op: true, admin: true },
  { module: 'Manage Clients', op: false, admin: true },
  { module: 'View Reports', op: false, admin: true },
  { module: 'Export Reports', op: false, admin: true },
  { module: 'Archive Records', op: true, admin: true },
  { module: 'Delete Records', op: false, admin: true },
  { module: 'Manage Users', op: false, admin: true },
  { module: 'Modify Role Access', op: false, admin: true },
];

export default function Settings() {
  const { employees, addEmployee, updateEmployee, deleteEmployee, addActivityLog } = useData();
  const { user } = useAuth();
  const [tab, setTab] = useState<Tab>('profile');
  const [isSaved, setIsSaved] = useState(false);
  const [preferences, setPreferences] = useState({ theme: 'light', emailNotifs: true, smsNotifs: false, timezone: 'Asia/Manila' });
  const [permissions, setPermissions] = useState(initialPermissions);

  // User management state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formData, setFormData] = useState<Partial<Employee>>({ status: 'Active', role: 'OP. TEAM', systemAccess: 'AR & Billing' });
  const [editingId, setEditingId] = useState<string | null>(null);

  const handleSave = () => {
    setIsSaved(true);
    addActivityLog({
      id: Date.now().toString(),
      timestamp: new Date().toLocaleString(),
      userName: user?.name || 'System',
      userRole: user?.role || 'ADMIN',
      userInitials: (user?.name || 'SY').split(' ').map((n) => n[0]).join('').substring(0, 2),
      userColor: '#FFB547',
      action: 'Update Client',
      description: `Updated system settings (${tab})`,
    });
    setTimeout(() => setIsSaved(false), 3000);
  };

  const handleOpenForm = (emp?: Employee) => {
    if (emp) {
      setFormData(emp);
      setEditingId(emp.id);
    } else {
      setFormData({ status: 'Active', role: 'OP. TEAM', systemAccess: 'AR & Billing' });
      setEditingId(null);
    }
    setIsFormOpen(true);
  };

  const handleSaveEmployee = () => {
    if (!formData.name || !formData.id) {
      alert('Please fill in Name and Employee ID.');
      return;
    }
    if (editingId) {
      updateEmployee(editingId, formData);
    } else {
      addEmployee(formData as Employee);
    }
    setIsFormOpen(false);
  };

  const handleDeleteEmployee = (id: string, name: string) => {
    if (window.confirm(`Remove ${name}?`)) {
      deleteEmployee(id);
    }
  };

  const handleTogglePermission = (index: number, role: 'op' | 'admin') => {
    const updated = [...permissions];
    updated[index][role] = !updated[index][role];
    setPermissions(updated);
  };

  return (
    <>
      <Header
        title="Settings"
        subtitle="System Configuration"
        actions={
          <button className="btn btn-primary btn-sm" onClick={handleSave}>
            <Save size={14} /> {isSaved ? 'Saved!' : 'Save Changes'}
          </button>
        }
      />
      <div className="page-content">
        <div className="orders-filter-bar" style={{ borderBottom: '2px solid var(--border)', paddingBottom: '8px' }}>
          <button className={`btn btn-sm ${tab === 'profile' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setTab('profile')}>
            <UserIcon size={14} /> Profile
          </button>
          <button className={`btn btn-sm ${tab === 'users' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setTab('users')}>
            <UsersIcon size={14} /> User Management
          </button>
          <button className={`btn btn-sm ${tab === 'roles' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setTab('roles')}>
            <Shield size={14} /> Role Access
          </button>
          <button className={`btn btn-sm ${tab === 'preferences' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setTab('preferences')}>
            <SlidersHorizontal size={14} /> Preferences
          </button>
        </div>

        {tab === 'profile' && (
          <div className="card">
            <h4>Profile Information</h4>
            <div className="form-row two-col" style={{ marginTop: '16px' }}>
              <div className="form-group">
                <label className="form-label">FULL NAME</label>
                <input className="form-input" defaultValue={user?.name} readOnly />
              </div>
              <div className="form-group">
                <label className="form-label">EMPLOYEE ID</label>
                <input className="form-input" defaultValue={user?.id} readOnly />
              </div>
            </div>
            <div className="form-row two-col">
              <div className="form-group">
                <label className="form-label">ROLE</label>
                <input className="form-input" defaultValue={user?.role} readOnly />
              </div>
              <div className="form-group">
                <label className="form-label">SYSTEM ACCESS</label>
                <input className="form-input" defaultValue={user?.systemAccess} readOnly />
              </div>
            </div>
          </div>
        )}

        {tab === 'users' && (
          <>
            {isFormOpen && (
              <div className="card" style={{ marginBottom: '20px', border: '2px solid var(--primary)' }}>
                <div className="card-header">
                  <h4>{editingId ? 'Edit Employee' : 'Add New Employee'}</h4>
                  <button className="action-icon-btn" onClick={() => setIsFormOpen(false)}>
                    <X size={16} />
                  </button>
                </div>
                <div className="form-row three-col">
                  <div className="form-group">
                    <label className="form-label">FULL NAME</label>
                    <input className="form-input" value={formData.name || ''} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">EMPLOYEE ID</label>
                    <input
                      className="form-input"
                      value={formData.id || ''}
                      onChange={(e) => setFormData({ ...formData, id: e.target.value })}
                      disabled={!!editingId}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">ROLE</label>
                    <select
                      className="form-input"
                      value={formData.role}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value as Employee['role'] })}
                    >
                      <option>ADMIN</option>
                      <option>OP. TEAM</option>
                    </select>
                  </div>
                </div>
                <div className="form-row two-col" style={{ marginTop: '16px' }}>
                  <div className="form-group">
                    <label className="form-label">SYSTEM ACCESS</label>
                    <select
                      className="form-input"
                      value={formData.systemAccess}
                      onChange={(e) => setFormData({ ...formData, systemAccess: e.target.value })}
                    >
                      <option>AR & Billing</option>
                      <option>All Systems</option>
                      <option>Reports Only</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">STATUS</label>
                    <select
                      className="form-input"
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value as Employee['status'] })}
                    >
                      <option>Active</option>
                      <option>Pending</option>
                      <option>Locked</option>
                    </select>
                  </div>
                </div>
                <div style={{ marginTop: '16px' }}>
                  <button className="btn btn-primary" onClick={handleSaveEmployee}>
                    Save Employee
                  </button>
                </div>
              </div>
            )}

            <div className="card">
              <div className="card-header">
                <h4>Employee Directory</h4>
                <button className="btn btn-primary btn-sm" onClick={() => handleOpenForm()}>
                  <Plus size={14} /> Add Employee
                </button>
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
                  {employees.map((emp) => (
                    <tr key={emp.id}>
                      <td className="cell-name">{emp.name}</td>
                      <td className="cell-id">{emp.id}</td>
                      <td>
                        <RoleBadge role={emp.role} />
                      </td>
                      <td className="cell-muted">{emp.systemAccess}</td>
                      <td>
                        <StatusBadge status={emp.status} size="sm" />
                      </td>
                      <td className="cell-actions">
                        <button className="action-icon-btn" title="Edit" onClick={() => handleOpenForm(emp)}>
                          <Pencil size={14} />
                        </button>
                        {emp.role !== 'ADMIN' && (
                          <button className="action-icon-btn danger" title="Remove" onClick={() => handleDeleteEmployee(emp.id, emp.name)}>
                            <Trash2 size={14} />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {tab === 'roles' && (
          <div className="card">
            <div className="card-header">
              <h4>Role Access Matrix</h4>
              <span className="text-muted text-sm">Strict configuration mode</span>
            </div>
            <table className="data-table" style={{ marginTop: '16px' }}>
              <thead>
                <tr>
                  <th>MODULE FEATURE</th>
                  <th style={{ textAlign: 'center' }}>OP. TEAM</th>
                  <th style={{ textAlign: 'center' }}>ADMIN</th>
                </tr>
              </thead>
              <tbody>
                {permissions.map((p, idx) => (
                  <tr key={p.module}>
                    <td>
                      <strong>{p.module}</strong>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <input type="checkbox" checked={p.op} onChange={() => handleTogglePermission(idx, 'op')} style={{ transform: 'scale(1.2)' }} />
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <input type="checkbox" checked={p.admin} onChange={() => handleTogglePermission(idx, 'admin')} style={{ transform: 'scale(1.2)' }} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {tab === 'preferences' && (
          <div className="edit-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--gap)' }}>
            <div className="card">
              <h4>Appearance</h4>
              <div className="form-group" style={{ marginTop: '16px' }}>
                <label className="form-label">THEME</label>
                <select className="form-input" value={preferences.theme} onChange={(e) => setPreferences({ ...preferences, theme: e.target.value })}>
                  <option value="light">Light Mode</option>
                  <option value="dark">Dark Mode</option>
                  <option value="system">System Default</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">TIMEZONE</label>
                <select className="form-input" value={preferences.timezone} onChange={(e) => setPreferences({ ...preferences, timezone: e.target.value })}>
                  <option value="Asia/Manila">Asia/Manila (PHT)</option>
                  <option value="UTC">UTC (Universal)</option>
                </select>
              </div>
            </div>
            <div className="card">
              <h4>Notifications</h4>
              <div className="form-group" style={{ marginTop: '16px' }}>
                <label className="check-option" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <input
                    type="checkbox"
                    checked={preferences.emailNotifs}
                    onChange={(e) => setPreferences({ ...preferences, emailNotifs: e.target.checked })}
                    style={{ transform: 'scale(1.2)' }}
                  />
                  Enable Email Alerts
                </label>
                <p className="text-muted text-sm" style={{ paddingLeft: '24px', marginTop: '4px' }}>
                  Receive daily summaries and urgent overdue alerts.
                </p>
              </div>
              <div className="form-group" style={{ marginTop: '16px' }}>
                <label className="check-option" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <input
                    type="checkbox"
                    checked={preferences.smsNotifs}
                    onChange={(e) => setPreferences({ ...preferences, smsNotifs: e.target.checked })}
                    style={{ transform: 'scale(1.2)' }}
                  />
                  Enable SMS Push
                </label>
                <p className="text-muted text-sm" style={{ paddingLeft: '24px', marginTop: '4px' }}>
                  Receive push notifications for critical events.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
