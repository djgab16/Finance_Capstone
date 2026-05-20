import { Link, useParams, useNavigate } from 'react-router-dom';
import { Pencil, Receipt, Printer, Trash2, FileText, User, Wallet, Archive as ArchiveIcon, Clock } from 'lucide-react';
import Header from '../../components/layout/Header';
import StatusBadge from '../../components/ui/StatusBadge';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { formatCurrency, formatDate } from '../../utils/finance';
import './InvoiceDetail.css';

export default function InvoiceDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { invoices, payments, clients, deleteInvoice, archiveInvoice, addActivityLog } = useData();
  const { user } = useAuth();

  const invoice = invoices.find((inv) => inv.id === id);

  if (!invoice) {
    return (
      <div className="page-content" style={{ padding: '40px', textAlign: 'center' }}>
        <h3>Invoice not found</h3>
        <p>The invoice you are looking for does not exist or has been deleted.</p>
        <Link to="/invoices" className="btn btn-primary" style={{ marginTop: '20px' }}>
          Back to Invoices
        </Link>
      </div>
    );
  }

  const client = clients.find((c) => c.id === invoice.clientId);
  const invoicePayments = payments.filter((p) => p.invoiceId === invoice.id || p.invoiceNo === invoice.invoiceNo);

  const initials = (user?.name || 'SY')
    .split(' ')
    .map((n) => n[0])
    .join('')
    .substring(0, 2);

  const handleDelete = () => {
    if (window.confirm(`Delete invoice ${invoice.invoiceNo}?`)) {
      deleteInvoice(invoice.id);
      addActivityLog({
        id: Date.now().toString(),
        timestamp: new Date().toLocaleString(),
        userName: user?.name || 'System',
        userRole: user?.role || 'OP. TEAM',
        userInitials: initials,
        userColor: '#E31A1A',
        action: 'Update Invoice',
        description: `Deleted invoice ${invoice.invoiceNo}`,
        reference: invoice.invoiceNo,
      });
      navigate('/invoices');
    }
  };

  const handleArchive = () => {
    archiveInvoice(invoice.id, !invoice.archived);
    addActivityLog({
      id: Date.now().toString(),
      timestamp: new Date().toLocaleString(),
      userName: user?.name || 'System',
      userRole: user?.role || 'OP. TEAM',
      userInitials: initials,
      userColor: '#A3AED0',
      action: 'Archive',
      description: `${invoice.archived ? 'Restored' : 'Archived'} invoice ${invoice.invoiceNo}`,
      reference: invoice.invoiceNo,
    });
  };

  return (
    <>
      <Header
        title={`${invoice.invoiceNo} — Invoice Detail`}
        subtitle="Billing & Invoices"
        date={new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        actions={
          <div className="flex gap-sm">
            <Link to={`/invoices/${invoice.id}/edit`} className="btn btn-outline btn-sm">
              <Pencil size={14} /> Edit Invoice
            </Link>
            <button className="btn btn-primary btn-sm" onClick={() => navigate('/payments/new', { state: { invoiceId: invoice.id } })}>
              <Receipt size={14} /> Record Payment
            </button>
          </div>
        }
      />
      <div className="page-content">
        <div className="detail-banner">
          <div className="banner-left">
            <span className="banner-label">INVOICE NUMBER</span>
            <h2 className="banner-waybill">{invoice.invoiceNo}</h2>
            <span className="banner-date">
              Billed {formatDate(invoice.billingDate)} · Due {formatDate(invoice.dueDate)}
            </span>
          </div>
          <StatusBadge status={invoice.paymentStatus} />
        </div>

        <div className="detail-grid">
          <div className="detail-left">
            <div className="card info-card">
              <div className="info-card-header">
                <User size={18} className="info-icon teal" />
                <h4>Client Information</h4>
              </div>
              <div className="info-grid">
                <div>
                  <span className="label">CLIENT NAME</span>
                  <strong>{invoice.clientName}</strong>
                </div>
                <div>
                  <span className="label">CLIENT CODE</span>
                  <strong>{client?.clientCode || invoice.clientId}</strong>
                </div>
                <div>
                  <span className="label">CONTACT PERSON</span>
                  <strong>{client?.contactPerson || '—'}</strong>
                </div>
                <div>
                  <span className="label">CONTACT NUMBER</span>
                  <strong>{client?.contactNumber || '—'}</strong>
                </div>
                <div>
                  <span className="label">EMAIL</span>
                  <strong>{client?.email || '—'}</strong>
                </div>
                <div>
                  <span className="label">TIN</span>
                  <strong>{client?.tin || '—'}</strong>
                </div>
                <div className="info-full">
                  <span className="label">BILLING ADDRESS</span>
                  <strong>{client?.address || '—'}</strong>
                </div>
              </div>
            </div>

            <div className="card info-card">
              <div className="info-card-header">
                <FileText size={18} className="info-icon orange" />
                <h4>Billing Breakdown</h4>
              </div>
              <div className="billing-breakdown">
                <div className="billing-row">
                  <span className="billing-label">Freight Charges</span>
                  <span className="billing-value">{formatCurrency(invoice.freightCharges)}</span>
                </div>
                <div className="billing-row">
                  <span className="billing-label">Other Charges</span>
                  <span className="billing-value">{formatCurrency(invoice.otherCharges)}</span>
                </div>
                <div className="billing-row">
                  <span className="billing-label">Subtotal</span>
                  <span className="billing-value">{formatCurrency(invoice.subtotal)}</span>
                </div>
                <div className="billing-row">
                  <span className="billing-label">VAT ({(invoice.vatRate * 100).toFixed(0)}%)</span>
                  <span className="billing-value">{formatCurrency(invoice.vatAmount)}</span>
                </div>
                <div className="billing-row">
                  <span className="billing-label">Surcharge</span>
                  <span className="billing-value">{formatCurrency(invoice.surcharge)}</span>
                </div>
                <div className="billing-row total">
                  <span className="billing-label">Total Amount</span>
                  <span className="billing-value">{formatCurrency(invoice.totalAmount)}</span>
                </div>
              </div>
            </div>

            <div className="card info-card">
              <div className="info-card-header">
                <Wallet size={18} className="info-icon green" />
                <h4>Payment Summary</h4>
              </div>
              <div className="info-grid">
                <div>
                  <span className="label">AMOUNT PAID</span>
                  <strong style={{ color: 'var(--status-active)' }}>{formatCurrency(invoice.amountPaid)}</strong>
                </div>
                <div>
                  <span className="label">BALANCE</span>
                  <strong style={{ color: invoice.balance > 0 ? 'var(--status-failed)' : 'var(--status-active)' }}>
                    {formatCurrency(invoice.balance)}
                  </strong>
                </div>
                <div>
                  <span className="label">DUE DATE</span>
                  <strong>{formatDate(invoice.dueDate)}</strong>
                </div>
                <div>
                  <span className="label">DAYS OVERDUE</span>
                  <strong style={{ color: invoice.daysOverdue > 0 ? 'var(--status-failed)' : 'var(--text-primary)' }}>
                    {invoice.daysOverdue} {invoice.daysOverdue === 1 ? 'day' : 'days'}
                  </strong>
                </div>
                <div>
                  <span className="label">AGING BUCKET</span>
                  <strong>
                    <StatusBadge status={invoice.agingBucket} size="sm" />
                  </strong>
                </div>
                <div>
                  <span className="label">STATUS</span>
                  <strong>
                    <StatusBadge status={invoice.paymentStatus} size="sm" />
                  </strong>
                </div>
                <div className="info-full">
                  <span className="label">DESCRIPTION</span>
                  <strong>{invoice.description}</strong>
                </div>
              </div>
            </div>

            <div className="card info-card">
              <div className="info-card-header">
                <Receipt size={18} className="info-icon purple" />
                <h4>Payment History</h4>
              </div>
              {invoicePayments.length === 0 ? (
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem' }}>No payments recorded yet.</p>
              ) : (
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>OR NUMBER</th>
                      <th>DATE</th>
                      <th>AMOUNT</th>
                      <th>METHOD</th>
                      <th>REFERENCE</th>
                      <th>RECORDED BY</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoicePayments.map((p) => (
                      <tr key={p.id}>
                        <td className="waybill-link">{p.orNumber}</td>
                        <td>{formatDate(p.paymentDate)}</td>
                        <td className="amount-cell">{formatCurrency(p.amount)}</td>
                        <td>{p.paymentMethod}</td>
                        <td>{p.referenceNumber || '—'}</td>
                        <td className="cell-sub">{p.recordedBy}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          <div className="detail-right">
            <div className="card">
              <span className="label">QUICK ACTIONS</span>
              <div className="detail-actions">
                <button
                  className="btn btn-primary"
                  onClick={() => navigate('/payments/new', { state: { invoiceId: invoice.id } })}
                >
                  <Receipt size={16} /> RECORD PAYMENT
                </button>
                <Link to={`/invoices/${invoice.id}/edit`} className="btn btn-outline">
                  <Pencil size={16} /> EDIT INVOICE
                </Link>
                <Link to={`/invoices/${invoice.id}/history`} className="btn btn-outline">
                  <Clock size={16} /> VIEW HISTORY
                </Link>
                <button className="btn btn-outline" onClick={() => window.print()}>
                  <Printer size={16} /> PRINT INVOICE
                </button>
                <button className="btn btn-outline" onClick={handleArchive}>
                  <ArchiveIcon size={16} /> {invoice.archived ? 'RESTORE' : 'ARCHIVE'}
                </button>
                {user?.role === 'ADMIN' && (
                  <button className="btn btn-danger" onClick={handleDelete}>
                    <Trash2 size={16} /> DELETE INVOICE
                  </button>
                )}
              </div>
            </div>

            <div className="card">
              <h4>Invoice Summary</h4>
              <div className="summary-fields">
                <div className="summary-field">
                  <span>Invoice No.</span>
                  <span className="summary-val teal">{invoice.invoiceNo}</span>
                </div>
                <div className="summary-field">
                  <span>Total Amount</span>
                  <span className="summary-val">{formatCurrency(invoice.totalAmount)}</span>
                </div>
                <div className="summary-field">
                  <span>Amount Paid</span>
                  <span className="summary-val green">{formatCurrency(invoice.amountPaid)}</span>
                </div>
                <div className="summary-field">
                  <span>Balance</span>
                  <span className={`summary-val ${invoice.balance > 0 ? 'red' : 'green'}`}>
                    {formatCurrency(invoice.balance)}
                  </span>
                </div>
                <div className="summary-field">
                  <span>Status</span>
                  <StatusBadge status={invoice.paymentStatus} size="sm" />
                </div>
                <div className="summary-field">
                  <span>Encoded By</span>
                  <span>{invoice.encodedBy}</span>
                </div>
                <div className="summary-field">
                  <span>Encoded On</span>
                  <span>{formatDate(invoice.dateEncoded)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
