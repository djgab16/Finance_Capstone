import { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AlertTriangle, Save, Undo2 } from 'lucide-react';
import Header from '../../components/layout/Header';
import StatusBadge from '../../components/ui/StatusBadge';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import type { Invoice } from '../../types';
import {
  VAT_RATE,
  computeInvoiceTotals,
  derivePaymentStatus,
  formatCurrency,
  generateId,
  getAgingBucket,
  getDaysOverdue,
} from '../../utils/finance';
import './InvoiceForm.css';

interface FormState {
  clientId: string;
  billingDate: string;
  dueDate: string;
  description: string;
  freightCharges: string;
  otherCharges: string;
}

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

function dueDateIso() {
  return new Date(new Date().getTime() + 30 * 86400000).toISOString().slice(0, 10);
}

function generateInvoiceNo(existing: Invoice[]) {
  const year = new Date().getFullYear();
  const prefix = `INV-${year}-`;
  const nums = existing
    .map((inv) => inv.invoiceNo)
    .filter((n) => n.startsWith(prefix))
    .map((n) => Number(n.replace(prefix, '')))
    .filter((n) => !Number.isNaN(n));
  const next = (nums.length ? Math.max(...nums) : 0) + 1;
  return `${prefix}${String(next).padStart(4, '0')}`;
}

export default function InvoiceForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { invoices, clients, addInvoice, updateInvoice, addActivityLog } = useData();
  const { user } = useAuth();

  const isEdit = Boolean(id);
  const existing = isEdit ? invoices.find((inv) => inv.id === id) : undefined;

  const [form, setForm] = useState<FormState>({
    clientId: existing?.clientId || clients[0]?.id || '',
    billingDate: existing?.billingDate || todayIso(),
    dueDate: existing?.dueDate || dueDateIso(),
    description: existing?.description || '',
    freightCharges: existing ? String(existing.freightCharges) : '',
    otherCharges: existing ? String(existing.otherCharges) : '',
  });

  const freight = Number(form.freightCharges) || 0;
  const other = Number(form.otherCharges) || 0;
  const daysOverdue = getDaysOverdue(form.dueDate);
  const isOverdue = daysOverdue > 0;
  const totals = useMemo(
    () => computeInvoiceTotals(freight, other, isOverdue),
    [freight, other, isOverdue],
  );

  const selectedClient = clients.find((c) => c.id === form.clientId);

  const handleSave = () => {
    if (!form.clientId) return alert('Please select a client.');
    if (!form.billingDate || !form.dueDate) return alert('Please provide billing and due dates.');
    if (freight < 0 || other < 0) return alert('Charges must be non-negative.');

    const initials = (user?.name || 'SY')
      .split(' ')
      .map((n) => n[0])
      .join('')
      .substring(0, 2);

    if (isEdit && existing) {
      const updated: Partial<Invoice> = {
        clientId: form.clientId,
        clientName: selectedClient?.name || existing.clientName,
        billingDate: form.billingDate,
        dueDate: form.dueDate,
        description: form.description,
        freightCharges: freight,
        otherCharges: other,
        subtotal: totals.subtotal,
        vatRate: VAT_RATE,
        vatAmount: totals.vatAmount,
        surcharge: totals.surcharge,
        totalAmount: totals.totalAmount,
        balance: +(totals.totalAmount - existing.amountPaid).toFixed(2),
        agingBucket: getAgingBucket(daysOverdue),
        daysOverdue,
        paymentStatus: derivePaymentStatus(totals.totalAmount, existing.amountPaid, daysOverdue),
        lastUpdated: new Date().toISOString(),
        updatedBy: user?.name || 'System',
      };
      updateInvoice(existing.id, updated);
      addActivityLog({
        id: generateId('log'),
        timestamp: new Date().toLocaleString(),
        userName: user?.name || 'System',
        userRole: user?.role || 'OP. TEAM',
        userInitials: initials,
        userColor: '#FFB547',
        action: 'Update Invoice',
        description: `Updated invoice ${existing.invoiceNo} (${selectedClient?.name || ''})`,
        reference: existing.invoiceNo,
      });
      navigate(`/invoices/${existing.id}`);
    } else {
      const invoiceNo = generateInvoiceNo(invoices);
      const newInvoice: Invoice = {
        id: invoiceNo,
        invoiceNo,
        clientId: form.clientId,
        clientName: selectedClient?.name || 'Unknown Client',
        billingDate: form.billingDate,
        dueDate: form.dueDate,
        freightCharges: freight,
        otherCharges: other,
        subtotal: totals.subtotal,
        vatRate: VAT_RATE,
        vatAmount: totals.vatAmount,
        surcharge: totals.surcharge,
        totalAmount: totals.totalAmount,
        amountPaid: 0,
        balance: totals.totalAmount,
        paymentStatus: derivePaymentStatus(totals.totalAmount, 0, daysOverdue),
        agingBucket: getAgingBucket(daysOverdue),
        daysOverdue,
        description: form.description,
        encodedBy: user?.name || 'System',
        dateEncoded: new Date().toISOString(),
        lastUpdated: new Date().toISOString(),
        updatedBy: user?.name || 'System',
        archived: false,
      };
      addInvoice(newInvoice);
      addActivityLog({
        id: generateId('log'),
        timestamp: new Date().toLocaleString(),
        userName: user?.name || 'System',
        userRole: user?.role || 'OP. TEAM',
        userInitials: initials,
        userColor: '#01B574',
        action: 'Create Invoice',
        description: `Created invoice ${invoiceNo} for ${selectedClient?.name || 'client'} — ${formatCurrency(totals.totalAmount)}`,
        reference: invoiceNo,
      });
      navigate(`/invoices/${invoiceNo}`);
    }
  };

  return (
    <>
      <Header
        title={isEdit ? 'Edit Invoice' : 'Create New Invoice'}
        subtitle={isEdit && existing ? `Billing & Invoices · ${existing.invoiceNo}` : 'Billing & Invoices'}
        date={new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        actions={<span className="edit-mode-badge">● {isEdit ? 'Edit Mode' : 'Create Mode'}</span>}
      />
      <div className="page-content">
        <div className="edit-warning">
          <AlertTriangle size={18} />
          <p>
            <strong>Notice:</strong> VAT is auto-computed at 12%. Surcharge of 5% is automatically applied when the due
            date has passed. Verify all amounts before saving.
          </p>
        </div>

        <div className="edit-grid">
          <div className="edit-left">
            <div className="card">
              <h4>Invoice Information</h4>
              <div className="form-row two-col" style={{ marginTop: '16px' }}>
                <div className="form-group">
                  <label className="form-label">CLIENT <span style={{ color: 'var(--status-failed)' }}>*</span></label>
                  <select
                    className="form-input"
                    value={form.clientId}
                    onChange={(e) => setForm({ ...form, clientId: e.target.value })}
                  >
                    {clients.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.clientCode} — {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">DESCRIPTION</label>
                  <input
                    className="form-input"
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    placeholder="e.g. Freight services — Metro Manila routes"
                  />
                </div>
              </div>

              <div className="form-row two-col">
                <div className="form-group">
                  <label className="form-label">BILLING DATE <span style={{ color: 'var(--status-failed)' }}>*</span></label>
                  <input
                    type="date"
                    className="form-input"
                    value={form.billingDate}
                    onChange={(e) => setForm({ ...form, billingDate: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">DUE DATE <span style={{ color: 'var(--status-failed)' }}>*</span></label>
                  <input
                    type="date"
                    className="form-input"
                    value={form.dueDate}
                    onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
                  />
                </div>
              </div>
            </div>

            <div className="card">
              <h4>Charges</h4>
              <div className="form-row two-col" style={{ marginTop: '16px' }}>
                <div className="form-group">
                  <label className="form-label">FREIGHT CHARGES (PHP) <span style={{ color: 'var(--status-failed)' }}>*</span></label>
                  <input
                    type="number"
                    min={0}
                    step="0.01"
                    className="form-input"
                    value={form.freightCharges}
                    onChange={(e) => setForm({ ...form, freightCharges: e.target.value })}
                    placeholder="0.00"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">OTHER CHARGES (PHP)</label>
                  <input
                    type="number"
                    min={0}
                    step="0.01"
                    className="form-input"
                    value={form.otherCharges}
                    onChange={(e) => setForm({ ...form, otherCharges: e.target.value })}
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div className="computed-block">
                <div className="computed-row">
                  <span>Subtotal</span>
                  <span>{formatCurrency(totals.subtotal)}</span>
                </div>
                <div className="computed-row">
                  <span>VAT (12%)</span>
                  <span>{formatCurrency(totals.vatAmount)}</span>
                </div>
                <div className="computed-row">
                  <span>Surcharge (5% if overdue)</span>
                  <span>{formatCurrency(totals.surcharge)}</span>
                </div>
                <div className="computed-row total">
                  <span>Total Amount</span>
                  <span>{formatCurrency(totals.totalAmount)}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="edit-right">
            <div className="card">
              <h4>Live Summary</h4>
              <div className="summary-fields" style={{ marginTop: '12px' }}>
                <div className="summary-field">
                  <span>Invoice No.</span>
                  <span className="summary-val teal">
                    {existing ? existing.invoiceNo : 'auto-generated'}
                  </span>
                </div>
                <div className="summary-field">
                  <span>Client</span>
                  <span>{selectedClient?.name || '—'}</span>
                </div>
                <div className="summary-field">
                  <span>Status</span>
                  <StatusBadge
                    status={derivePaymentStatus(totals.totalAmount, existing?.amountPaid || 0, daysOverdue)}
                    size="sm"
                  />
                </div>
                <div className="summary-field">
                  <span>Days Overdue</span>
                  <span style={{ color: daysOverdue > 0 ? 'var(--status-failed)' : 'var(--text-primary)' }}>
                    {daysOverdue}
                  </span>
                </div>
                <div className="summary-field">
                  <span>Total</span>
                  <span className="summary-val">{formatCurrency(totals.totalAmount)}</span>
                </div>
              </div>
            </div>

            <button className="btn btn-primary btn-lg" onClick={handleSave}>
              <Save size={16} /> {isEdit ? 'SAVE CHANGES' : 'CREATE INVOICE'}
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
