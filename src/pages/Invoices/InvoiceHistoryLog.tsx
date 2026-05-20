import { Link, useParams, useNavigate } from 'react-router-dom';
import { Download, FileText, Receipt, Clock, Pencil, CheckCircle2 } from 'lucide-react';
import Header from '../../components/layout/Header';
import { useData } from '../../context/DataContext';
import { downloadCSV, formatCurrency, formatDate } from '../../utils/finance';
import './InvoiceHistoryLog.css';

export default function InvoiceHistoryLog() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { invoices, activityLogs, payments } = useData();

  const invoice = invoices.find((inv) => inv.id === id);

  if (!invoice) {
    return (
      <div className="page-content" style={{ padding: '40px', textAlign: 'center' }}>
        <h3>Invoice not found</h3>
        <p>The invoice you are looking for does not exist or has been deleted.</p>
        <button onClick={() => navigate(-1)} className="btn btn-primary" style={{ marginTop: '20px' }}>
          Go Back
        </button>
      </div>
    );
  }

  const logs = activityLogs.filter((log) => log.reference === invoice.invoiceNo);
  const invoicePayments = payments.filter((p) => p.invoiceId === invoice.id || p.invoiceNo === invoice.invoiceNo);

  const handleExport = () => {
    const rows: (string | number)[][] = [
      ['Invoice History Log'],
      ['Invoice No.', invoice.invoiceNo],
      ['Client', invoice.clientName],
      ['Total', invoice.totalAmount],
      ['Balance', invoice.balance],
      [],
      ['Timestamp', 'User', 'Action', 'Description'],
      ...logs.map((log) => [log.timestamp, log.userName, log.action, log.description]),
    ];
    downloadCSV(`${invoice.invoiceNo}-history`, rows);
  };

  return (
    <>
      <Header
        title={`${invoice.invoiceNo} — Invoice History`}
        subtitle={`Billing & Invoices · ${invoice.invoiceNo}`}
        date={new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        actions={
          <div className="flex gap-sm">
            <button className="btn btn-outline btn-sm" onClick={() => navigate(-1)}>{'< Back'}</button>
            <button className="btn btn-outline btn-sm" onClick={handleExport}>
              <Download size={14} /> Export Log
            </button>
          </div>
        }
      />
      <div className="page-content">
        <div className="history-banner">
          <div className="history-banner-left">
            <div className="history-icon-box">
              <FileText size={28} color="var(--primary)" />
            </div>
            <div className="history-title-area">
              <h2>INVOICE HISTORY LOG</h2>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ fontSize: '1.25rem', fontWeight: 600, color: 'white' }}>{invoice.invoiceNo}</span>
                <p>Encoded {formatDate(invoice.dateEncoded)} · Encoded by {invoice.encodedBy}</p>
              </div>
            </div>
          </div>
          <div className="history-banner-details">
            <div className="detail-item">
              <span className="label">CLIENT</span>
              <span className="value">{invoice.clientName}</span>
            </div>
            <div className="detail-item">
              <span className="label">TOTAL</span>
              <span className="value">{formatCurrency(invoice.totalAmount)}</span>
            </div>
            <div className="detail-item">
              <span className="label">BALANCE</span>
              <span className="value">{formatCurrency(invoice.balance)}</span>
            </div>
            <div className="detail-item">
              <span className="label">STATUS</span>
              <span className="action-badge" style={{ background: 'rgba(255,255,255,0.2)', color: 'white' }}>
                ● {invoice.paymentStatus}
              </span>
            </div>
          </div>
        </div>

        <div className="history-grid">
          <div className="history-left">
            <div className="card">
              <div className="card-header">
                <h4>Audit Trail</h4>
                <span className="archive-count-badge">{logs.length} events recorded</span>
              </div>
              {logs.length === 0 ? (
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem' }}>No audit events for this invoice yet.</p>
              ) : (
                <div className="timeline-box">
                  {logs.map((log, index) => (
                    <div key={log.id} className="timeline-entry">
                      <div className={`timeline-icon ${index === 0 ? 'completed' : 'pending'}`}>
                        {log.action === 'Create Invoice' ? (
                          <FileText size={14} />
                        ) : log.action === 'Record Payment' ? (
                          <Receipt size={14} />
                        ) : log.action === 'Update Invoice' ? (
                          <Pencil size={14} />
                        ) : index === 0 ? (
                          <CheckCircle2 size={16} />
                        ) : (
                          <Clock size={14} />
                        )}
                      </div>
                      <div className={`timeline-content ${index === 0 ? 'border-left-green' : ''}`}>
                        <div className="timeline-header">
                          <h4>{log.action}</h4>
                          <span className="timeline-time">{log.timestamp}</span>
                        </div>
                        <div className="timeline-body">
                          <p>{log.description}</p>
                        </div>
                        <div className="timeline-meta">
                          <span>👤 {log.userName} ({log.userRole})</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="history-right">
            <div className="card">
              <h4>Invoice Summary</h4>
              <div className="summary-stats-grid">
                <div className="summary-stat-card">
                  <div className="summary-stat-val green">{logs.length}</div>
                  <div className="summary-stat-label">Total Events</div>
                </div>
                <div className="summary-stat-card">
                  <div className="summary-stat-val">{invoicePayments.length}</div>
                  <div className="summary-stat-label">Payments Recorded</div>
                </div>
                <div className="summary-stat-card">
                  <div className="summary-stat-val">{invoice.daysOverdue}</div>
                  <div className="summary-stat-label">Days Overdue</div>
                </div>
                <div className="summary-stat-card">
                  <div className="summary-stat-val">{invoice.agingBucket}</div>
                  <div className="summary-stat-label">Aging Bucket</div>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="card-header">
                <h4>Invoice Info</h4>
                <Link to={`/invoices/${invoice.id}`} className="card-header-view-all">
                  View Full →
                </Link>
              </div>
              <div className="info-list">
                <div className="info-list-item">
                  <span>INVOICE</span>
                  <span className="teal">{invoice.invoiceNo}</span>
                </div>
                <div className="info-list-item">
                  <span>CLIENT</span>
                  <span>{invoice.clientName}</span>
                </div>
                <div className="info-list-item">
                  <span>BILLING DATE</span>
                  <span>{formatDate(invoice.billingDate)}</span>
                </div>
                <div className="info-list-item">
                  <span>DUE DATE</span>
                  <span>{formatDate(invoice.dueDate)}</span>
                </div>
                <div className="info-list-item">
                  <span>TOTAL</span>
                  <span>{formatCurrency(invoice.totalAmount)}</span>
                </div>
                <div className="info-list-item">
                  <span>BALANCE</span>
                  <span>{formatCurrency(invoice.balance)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
