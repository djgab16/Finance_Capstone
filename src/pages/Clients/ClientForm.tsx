import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Save, Undo2, AlertTriangle } from 'lucide-react';
import Header from '../../components/layout/Header';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import type { Client, ClientStatus } from '../../types';
import '../Invoices/InvoiceForm.css';

function generateClientCode(existing: Client[]) {
  const prefix = 'CL-';
  const nums = existing
    .map((c) => c.clientCode.replace(/[^0-9]/g, ''))
    .map(Number)
    .filter((n) => !Number.isNaN(n));
  const next = (nums.length ? Math.max(...nums) : 0) + 1;
  return `${prefix}${String(next).padStart(3, '0')}`;
}

function generateClientId(existing: Client[]) {
  const ids = existing.map((c) => Number(c.id.replace(/\D/g, ''))).filter((n) => !Number.isNaN(n));
  const next = (ids.length ? Math.max(...ids) : 0) + 1;
  return `CL-${String(next).padStart(3, '0')}`;
}

export default function ClientForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { clients, addClient, updateClient, addActivityLog } = useData();
  const { user } = useAuth();

  const isEdit = Boolean(id);
  const existing = isEdit ? clients.find((c) => c.id === id) : undefined;

  const [form, setForm] = useState<Partial<Client>>(
    existing || {
      clientCode: generateClientCode(clients),
      name: '',
      businessName: '',
      contactPerson: '',
      contactNumber: '',
      email: '',
      address: '',
      tin: '',
      creditLimit: 100000,
      currentBalance: 0,
      totalBilled: 0,
      totalPaid: 0,
      status: 'Active',
      dateRegistered: new Date().toISOString().slice(0, 10),
      lastTransaction: new Date().toISOString().slice(0, 10),
    },
  );

  const handleSave = () => {
    if (!form.name || !form.contactPerson || !form.contactNumber) {
      alert('Please fill in client name, contact person, and contact number.');
      return;
    }

    const initials = (user?.name || 'SY').split(' ').map((n) => n[0]).join('').substring(0, 2);

    if (isEdit && existing) {
      updateClient(existing.id, form);
      addActivityLog({
        id: Date.now().toString(),
        timestamp: new Date().toLocaleString(),
        userName: user?.name || 'System',
        userRole: user?.role || 'ADMIN',
        userInitials: initials,
        userColor: '#FFB547',
        action: 'Update Client',
        description: `Updated client ${form.name}`,
        reference: existing.id,
      });
      navigate(`/clients/${existing.id}`);
    } else {
      const newId = generateClientId(clients);
      const newClient: Client = {
        id: newId,
        clientCode: form.clientCode || generateClientCode(clients),
        name: form.name!,
        businessName: form.businessName || form.name!,
        contactPerson: form.contactPerson!,
        contactNumber: form.contactNumber!,
        email: form.email || '',
        address: form.address || '',
        tin: form.tin,
        creditLimit: Number(form.creditLimit) || 0,
        currentBalance: 0,
        totalBilled: 0,
        totalPaid: 0,
        status: (form.status as ClientStatus) || 'Active',
        dateRegistered: form.dateRegistered || new Date().toISOString().slice(0, 10),
        lastTransaction: new Date().toISOString().slice(0, 10),
      };
      addClient(newClient);
      addActivityLog({
        id: Date.now().toString(),
        timestamp: new Date().toLocaleString(),
        userName: user?.name || 'System',
        userRole: user?.role || 'ADMIN',
        userInitials: initials,
        userColor: '#01B574',
        action: 'Add Client',
        description: `Added new client ${newClient.name} (${newClient.clientCode})`,
        reference: newClient.id,
      });
      navigate(`/clients/${newClient.id}`);
    }
  };

  return (
    <>
      <Header
        title={isEdit ? 'Edit Client' : 'Create New Client'}
        subtitle={isEdit && existing ? `Clients · ${existing.clientCode}` : 'Clients'}
        date={new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        actions={<span className="edit-mode-badge">● {isEdit ? 'Edit Mode' : 'Create Mode'}</span>}
      />
      <div className="page-content">
        <div className="edit-warning">
          <AlertTriangle size={18} />
          <p>
            <strong>Notice:</strong> Client management actions are admin-only. Verify the client information carefully
            before saving.
          </p>
        </div>

        <div className="edit-grid">
          <div className="edit-left">
            <div className="card">
              <h4>Account Information</h4>
              <div className="form-row three-col" style={{ marginTop: '16px' }}>
                <div className="form-group">
                  <label className="form-label">CLIENT CODE</label>
                  <input
                    className="form-input"
                    value={form.clientCode || ''}
                    onChange={(e) => setForm({ ...form, clientCode: e.target.value })}
                    readOnly={isEdit}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">STATUS</label>
                  <select
                    className="form-input"
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value as ClientStatus })}
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">CREDIT LIMIT (PHP)</label>
                  <input
                    type="number"
                    min={0}
                    className="form-input"
                    value={form.creditLimit ?? 0}
                    onChange={(e) => setForm({ ...form, creditLimit: Number(e.target.value) })}
                  />
                </div>
              </div>
            </div>

            <div className="card">
              <h4>Business Details</h4>
              <div className="form-row two-col" style={{ marginTop: '16px' }}>
                <div className="form-group">
                  <label className="form-label">CLIENT NAME <span style={{ color: 'var(--status-failed)' }}>*</span></label>
                  <input
                    className="form-input"
                    value={form.name || ''}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">BUSINESS NAME</label>
                  <input
                    className="form-input"
                    value={form.businessName || ''}
                    onChange={(e) => setForm({ ...form, businessName: e.target.value })}
                  />
                </div>
              </div>
              <div className="form-row two-col">
                <div className="form-group">
                  <label className="form-label">TIN</label>
                  <input
                    className="form-input"
                    value={form.tin || ''}
                    onChange={(e) => setForm({ ...form, tin: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">DATE REGISTERED</label>
                  <input
                    type="date"
                    className="form-input"
                    value={form.dateRegistered || ''}
                    onChange={(e) => setForm({ ...form, dateRegistered: e.target.value })}
                  />
                </div>
              </div>
            </div>

            <div className="card">
              <h4>Contact</h4>
              <div className="form-row two-col" style={{ marginTop: '16px' }}>
                <div className="form-group">
                  <label className="form-label">CONTACT PERSON <span style={{ color: 'var(--status-failed)' }}>*</span></label>
                  <input
                    className="form-input"
                    value={form.contactPerson || ''}
                    onChange={(e) => setForm({ ...form, contactPerson: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">CONTACT NUMBER <span style={{ color: 'var(--status-failed)' }}>*</span></label>
                  <input
                    className="form-input"
                    value={form.contactNumber || ''}
                    onChange={(e) => setForm({ ...form, contactNumber: e.target.value })}
                  />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">EMAIL</label>
                <input
                  type="email"
                  className="form-input"
                  value={form.email || ''}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label className="form-label">ADDRESS</label>
                <textarea
                  className="form-input form-textarea"
                  value={form.address || ''}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                />
              </div>
            </div>
          </div>

          <div className="edit-right">
            <button className="btn btn-primary btn-lg" onClick={handleSave}>
              <Save size={16} /> {isEdit ? 'SAVE CHANGES' : 'CREATE CLIENT'}
            </button>
            <button className="btn btn-outline" onClick={() => navigate(-1)}>
              <Undo2 size={16} /> Discard
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
