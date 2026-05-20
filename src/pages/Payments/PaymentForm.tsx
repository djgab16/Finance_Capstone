import { useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Save, Undo2, AlertTriangle } from 'lucide-react';
import Header from '../../components/layout/Header';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import type { Payment, PaymentMethod } from '../../types';
import { formatCurrency, generateId } from '../../utils/finance';
import '../Invoices/InvoiceForm.css';

interface LocationState {
  invoiceId?: string;
}

function generateORNumber(payments: Payment[]) {
  const year = new Date().getFullYear();
  const prefix = `OR-${year}-`;
  const nums = payments
    .map((p) => p.orNumber)
    .filter((or) => or.startsWith(prefix))
    .map((or) => Number(or.replace(prefix, '')))
    .filter((n) => !Number.isNaN(n));
  const next = (nums.length ? Math.max(...nums) : 0) + 1;
  return `${prefix}${String(next).padStart(4, '0')}`;
}

export default function PaymentForm() {
  const navigate = useNavigate();
  const location = useLocation();
  const presetInvoiceId = (location.state as LocationState | null)?.invoiceId;
  const { invoices, payments, recordPayment, addActivityLog } = useData();
  const { user } = useAuth();

  const openInvoices = useMemo(
    () =>
      invoices
        .filter((inv) => inv.balance > 0 && !inv.archived)
        .sort((a, b) => b.daysOverdue - a.daysOverdue),
    [invoices],
  );

  const [invoiceId, setInvoiceId] = useState<string>(presetInvoiceId || openInvoices[0]?.id || '');
  const [amount, setAmount] = useState<string>('');
  const [method, setMethod] = useState<PaymentMethod>('Bank Transfer');
  const [referenceNumber, setReferenceNumber] = useState('');
  const [remarks, setRemarks] = useState('');
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().slice(0, 10));

  const selectedInvoice = invoices.find((inv) => inv.id === invoiceId);
  const orNumber = useMemo(() => generateORNumber(payments), [payments]);

  const handleSubmit = () => {
    if (!selectedInvoice) return alert('Please select an invoice.');
    const amt = Number(amount);
    if (!amt || amt <= 0) return alert('Amount must be greater than zero.');
    if (amt > selectedInvoice.balance + 0.01) {
      if (!window.confirm('Amount exceeds outstanding balance. Continue?')) return;
    }

    const initials = (user?.name || 'SY').split(' ').map((n) => n[0]).join('').substring(0, 2);

    const payment: Payment = {
      id: orNumber,
      orNumber,
      invoiceId: selectedInvoice.id,
      invoiceNo: selectedInvoice.invoiceNo,
      clientId: selectedInvoice.clientId,
      clientName: selectedInvoice.clientName,
      paymentDate,
      amount: amt,
      paymentMethod: method,
      referenceNumber: referenceNumber || undefined,
      remarks: remarks || undefined,
      recordedBy: user?.name || 'System',
      dateRecorded: new Date().toISOString(),
    };

    recordPayment(payment);
    addActivityLog({
      id: generateId('log'),
      timestamp: new Date().toLocaleString(),
      userName: user?.name || 'System',
      userRole: user?.role || 'OP. TEAM',
      userInitials: initials,
      userColor: '#01B574',
      action: 'Record Payment',
      description: `Recorded payment ${orNumber} from ${selectedInvoice.clientName} — ${formatCurrency(amt)} via ${method}`,
      reference: selectedInvoice.invoiceNo,
    });

    navigate(`/invoices/${selectedInvoice.id}`);
  };

  return (
    <>
      <Header
        title="Record Payment"
        subtitle="Payments"
        date={new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        actions={<span className="edit-mode-badge">● New Payment</span>}
      />
      <div className="page-content">
        <div className="edit-warning">
          <AlertTriangle size={18} />
          <p>
            <strong>Notice:</strong> Recording a payment will automatically update the linked invoice's balance and
            payment status.
          </p>
        </div>

        <div className="edit-grid">
          <div className="edit-left">
            <div className="card">
              <h4>Payment Details</h4>
              <div className="form-row two-col" style={{ marginTop: '16px' }}>
                <div className="form-group">
                  <label className="form-label">INVOICE <span style={{ color: 'var(--status-failed)' }}>*</span></label>
                  <select className="form-input" value={invoiceId} onChange={(e) => setInvoiceId(e.target.value)}>
                    {openInvoices.length === 0 && <option value="">No open invoices</option>}
                    {openInvoices.map((inv) => (
                      <option key={inv.id} value={inv.id}>
                        {inv.invoiceNo} — {inv.clientName} (Bal: {formatCurrency(inv.balance)})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">OR NUMBER</label>
                  <input className="form-input" value={orNumber} readOnly style={{ background: 'var(--bg-main)' }} />
                </div>
              </div>

              <div className="form-row three-col">
                <div className="form-group">
                  <label className="form-label">PAYMENT DATE</label>
                  <input
                    type="date"
                    className="form-input"
                    value={paymentDate}
                    onChange={(e) => setPaymentDate(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">AMOUNT (PHP) <span style={{ color: 'var(--status-failed)' }}>*</span></label>
                  <input
                    type="number"
                    min={0}
                    step="0.01"
                    className="form-input"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">PAYMENT METHOD</label>
                  <select className="form-input" value={method} onChange={(e) => setMethod(e.target.value as PaymentMethod)}>
                    <option>Cash</option>
                    <option>Check</option>
                    <option>Bank Transfer</option>
                    <option>GCash</option>
                  </select>
                </div>
              </div>

              <div className="form-row two-col">
                <div className="form-group">
                  <label className="form-label">REFERENCE NUMBER</label>
                  <input
                    className="form-input"
                    value={referenceNumber}
                    onChange={(e) => setReferenceNumber(e.target.value)}
                    placeholder="e.g. BPI-887211"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">REMARKS</label>
                  <input
                    className="form-input"
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                    placeholder="Optional notes"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="edit-right">
            <div className="card">
              <h4>Invoice Summary</h4>
              {selectedInvoice ? (
                <div className="summary-fields" style={{ marginTop: '12px' }}>
                  <div className="summary-field">
                    <span>Invoice</span>
                    <span className="summary-val teal">{selectedInvoice.invoiceNo}</span>
                  </div>
                  <div className="summary-field">
                    <span>Client</span>
                    <span>{selectedInvoice.clientName}</span>
                  </div>
                  <div className="summary-field">
                    <span>Total</span>
                    <span>{formatCurrency(selectedInvoice.totalAmount)}</span>
                  </div>
                  <div className="summary-field">
                    <span>Amount Paid</span>
                    <span className="summary-val green">{formatCurrency(selectedInvoice.amountPaid)}</span>
                  </div>
                  <div className="summary-field">
                    <span>Balance</span>
                    <span className="summary-val red">{formatCurrency(selectedInvoice.balance)}</span>
                  </div>
                  <div className="summary-field">
                    <span>Days Overdue</span>
                    <span>{selectedInvoice.daysOverdue}</span>
                  </div>
                </div>
              ) : (
                <p style={{ color: 'var(--text-secondary)', marginTop: '12px' }}>Select an invoice to view summary.</p>
              )}
            </div>

            <button className="btn btn-primary btn-lg" onClick={handleSubmit}>
              <Save size={16} /> RECORD PAYMENT
            </button>
            <button className="btn btn-outline" onClick={() => navigate(-1)}>
              <Undo2 size={16} /> Cancel
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
