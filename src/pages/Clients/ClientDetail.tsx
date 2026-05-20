import { Link, useNavigate, useParams } from 'react-router-dom';
import { Pencil, Receipt, FileText, Wallet, AlertTriangle, User } from 'lucide-react';
import Header from '../../components/layout/Header';
import StatCard from '../../components/ui/StatCard';
import StatusBadge from '../../components/ui/StatusBadge';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { formatCurrency, formatDate } from '../../utils/finance';
import '../Invoices/InvoiceDetail.css';
import '../Invoices/Invoices.css';

export default function ClientDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { clients, invoices, payments } = useData();
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';

  const client = clients.find((c) => c.id === id);

  if (!client) {
    return (
      <div className="page-content" style={{ padding: '40px', textAlign: 'center' }}>
        <h3>Client not found</h3>
        <Link to="/clients" className="btn btn-primary" style={{ marginTop: '20px' }}>
          Back to Clients
        </Link>
      </div>
    );
  }

  const clientInvoices = invoices.filter((inv) => inv.clientId === client.id);
  const clientPayments = payments.filter((p) => p.clientId === client.id);
  const overdueTotal = clientInvoices.filter((inv) => inv.paymentStatus === 'Overdue').reduce((s, inv) => s + inv.balance, 0);

  return (
    <>
      <Header
        title={`${client.name} — Client Detail`}
        subtitle="Clients"
        date={new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        actions={
          <div className="flex gap-sm">
            {isAdmin && (
              <Link to={`/clients/${client.id}/edit`} className="btn btn-outline btn-sm">
                <Pencil size={14} /> Edit Client
              </Link>
            )}
            <button className="btn btn-primary btn-sm" onClick={() => navigate('/invoices/new')}>
              <FileText size={14} /> New Invoice
            </button>
          </div>
        }
      />
      <div className="page-content">
        <div className="detail-banner">
          <div className="banner-left">
            <span className="banner-label">CLIENT CODE</span>
            <h2 className="banner-waybill">{client.clientCode}</h2>
            <span className="banner-date">
              {client.name} · {client.businessName}
            </span>
          </div>
          <StatusBadge status={client.status} />
        </div>

        <div className="stats-row" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 'var(--gap)' }}>
          <StatCard
            icon={<FileText size={18} />}
            iconColor="var(--primary)"
            iconBg="var(--status-transit-bg)"
            label="TOTAL BILLED"
            value={formatCurrency(client.totalBilled)}
            subtitle="All-time"
          />
          <StatCard
            icon={<Wallet size={18} />}
            iconColor="var(--status-active)"
            iconBg="var(--status-active-bg)"
            label="TOTAL PAID"
            value={formatCurrency(client.totalPaid)}
            subtitle="Collected"
            subtitleColor="var(--status-active)"
          />
          <StatCard
            icon={<Receipt size={18} />}
            iconColor="var(--status-pending)"
            iconBg="var(--status-pending-bg)"
            label="CURRENT BALANCE"
            value={formatCurrency(client.currentBalance)}
            subtitle="Outstanding"
            subtitleColor={client.currentBalance > 0 ? 'var(--status-failed)' : 'var(--status-active)'}
          />
          <StatCard
            icon={<AlertTriangle size={18} />}
            iconColor="var(--status-failed)"
            iconBg="var(--status-failed-bg)"
            label="OVERDUE"
            value={formatCurrency(overdueTotal)}
            subtitle="Past due"
            subtitleColor="var(--status-failed)"
          />
        </div>

        <div className="detail-grid">
          <div className="detail-left">
            <div className="card info-card">
              <div className="info-card-header">
                <User size={18} className="info-icon teal" />
                <h4>Client Profile</h4>
              </div>
              <div className="info-grid">
                <div>
                  <span className="label">CONTACT PERSON</span>
                  <strong>{client.contactPerson}</strong>
                </div>
                <div>
                  <span className="label">CONTACT NUMBER</span>
                  <strong>{client.contactNumber}</strong>
                </div>
                <div>
                  <span className="label">EMAIL</span>
                  <strong>{client.email}</strong>
                </div>
                <div>
                  <span className="label">TIN</span>
                  <strong>{client.tin || '—'}</strong>
                </div>
                <div>
                  <span className="label">CREDIT LIMIT</span>
                  <strong>{formatCurrency(client.creditLimit)}</strong>
                </div>
                <div>
                  <span className="label">REGISTERED</span>
                  <strong>{formatDate(client.dateRegistered)}</strong>
                </div>
                <div className="info-full">
                  <span className="label">ADDRESS</span>
                  <strong>{client.address}</strong>
                </div>
              </div>
            </div>

            <div className="card info-card">
              <div className="info-card-header">
                <FileText size={18} className="info-icon orange" />
                <h4>Billing History</h4>
              </div>
              {clientInvoices.length === 0 ? (
                <p style={{ color: 'var(--text-secondary)' }}>No invoices yet.</p>
              ) : (
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>INVOICE NO.</th>
                      <th>BILLING DATE</th>
                      <th>DUE DATE</th>
                      <th>TOTAL</th>
                      <th>BALANCE</th>
                      <th>STATUS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {clientInvoices.map((inv) => (
                      <tr key={inv.id}>
                        <td>
                          <Link to={`/invoices/${inv.id}`} className="waybill-link">
                            {inv.invoiceNo}
                          </Link>
                        </td>
                        <td>{formatDate(inv.billingDate)}</td>
                        <td>{formatDate(inv.dueDate)}</td>
                        <td className="amount-cell">{formatCurrency(inv.totalAmount)}</td>
                        <td className={`amount-cell ${inv.balance > 0 ? 'balance-positive' : 'balance-zero'}`}>
                          {formatCurrency(inv.balance)}
                        </td>
                        <td>
                          <StatusBadge status={inv.paymentStatus} size="sm" />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            <div className="card info-card">
              <div className="info-card-header">
                <Receipt size={18} className="info-icon green" />
                <h4>Payment History</h4>
              </div>
              {clientPayments.length === 0 ? (
                <p style={{ color: 'var(--text-secondary)' }}>No payments recorded.</p>
              ) : (
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>OR NUMBER</th>
                      <th>INVOICE</th>
                      <th>DATE</th>
                      <th>AMOUNT</th>
                      <th>METHOD</th>
                    </tr>
                  </thead>
                  <tbody>
                    {clientPayments.map((p) => (
                      <tr key={p.id}>
                        <td className="waybill-link">{p.orNumber}</td>
                        <td>{p.invoiceNo}</td>
                        <td>{formatDate(p.paymentDate)}</td>
                        <td className="amount-cell">{formatCurrency(p.amount)}</td>
                        <td>{p.paymentMethod}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          <div className="detail-right">
            <div className="card">
              <h4>Summary</h4>
              <div className="summary-fields">
                <div className="summary-field">
                  <span>Client Code</span>
                  <span className="summary-val teal">{client.clientCode}</span>
                </div>
                <div className="summary-field">
                  <span>Status</span>
                  <StatusBadge status={client.status} size="sm" />
                </div>
                <div className="summary-field">
                  <span>Credit Limit</span>
                  <span>{formatCurrency(client.creditLimit)}</span>
                </div>
                <div className="summary-field">
                  <span>Outstanding</span>
                  <span className={`summary-val ${client.currentBalance > 0 ? 'red' : 'green'}`}>
                    {formatCurrency(client.currentBalance)}
                  </span>
                </div>
                <div className="summary-field">
                  <span>Last Transaction</span>
                  <span>{formatDate(client.lastTransaction)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
