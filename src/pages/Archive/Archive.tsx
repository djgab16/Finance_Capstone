import { useState } from 'react';
import { Search, Download, Eye, Lock, ArchiveRestore } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/layout/Header';
import StatusBadge from '../../components/ui/StatusBadge';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { downloadCSV, formatCurrency, formatDate } from '../../utils/finance';
import './Archive.css';
import '../Invoices/Invoices.css';

export default function Archive() {
  const { invoices, archiveInvoice, addActivityLog } = useData();
  const { user } = useAuth();
  const navigate = useNavigate();
  const isAdmin = user?.role === 'ADMIN';

  const archived = invoices.filter((inv) => inv.archived);

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All Status');

  const filtered = archived.filter((inv) => {
    if (searchQuery && !inv.invoiceNo.toLowerCase().includes(searchQuery.toLowerCase()) && !inv.clientName.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    if (statusFilter !== 'All Status' && inv.paymentStatus !== statusFilter) return false;
    return true;
  });

  const totalArchived = archived.length;
  const totalAmount = archived.reduce((s, inv) => s + inv.totalAmount, 0);
  const totalCollected = archived.reduce((s, inv) => s + inv.amountPaid, 0);

  const handleExport = () => {
    const rows: (string | number)[][] = [
      ['Invoice No', 'Client', 'Billing Date', 'Due Date', 'Total', 'Amount Paid', 'Balance', 'Status'],
      ...filtered.map((inv) => [inv.invoiceNo, inv.clientName, inv.billingDate, inv.dueDate, inv.totalAmount, inv.amountPaid, inv.balance, inv.paymentStatus]),
    ];
    downloadCSV('archived-invoices', rows);
  };

  const handleRestore = (id: string, invoiceNo: string) => {
    archiveInvoice(id, false);
    addActivityLog({
      id: Date.now().toString(),
      timestamp: new Date().toLocaleString(),
      userName: user?.name || 'System',
      userRole: user?.role || 'OP. TEAM',
      userInitials: (user?.name || 'SY').split(' ').map((n) => n[0]).join('').substring(0, 2),
      userColor: '#A3AED0',
      action: 'Archive',
      description: `Restored archived invoice ${invoiceNo}`,
      reference: invoiceNo,
    });
  };

  return (
    <>
      <Header
        title="Archive"
        subtitle="ARCMS · Records"
        actions={
          <button className="btn btn-outline btn-sm" onClick={handleExport}>
            <Download size={14} /> Export Archive
          </button>
        }
      />
      <div className="page-content">
        <div className="archive-banner">
          <div className="archive-banner-left">
            <span className="label" style={{ color: 'rgba(255,255,255,0.6)' }}>ARCMS</span>
            <h2 style={{ color: 'white' }}>Archived Invoices</h2>
            <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.82rem' }}>
              Read-only records. Admin override required for any edits.
            </p>
          </div>
          <div className="archive-stats">
            <div className="archive-stat">
              <strong>{totalArchived}</strong>
              <span>TOTAL ARCHIVED</span>
            </div>
            <div className="archive-stat">
              <strong>{formatCurrency(totalAmount)}</strong>
              <span>TOTAL VALUE</span>
            </div>
            <div className="archive-stat">
              <strong>{formatCurrency(totalCollected)}</strong>
              <span>COLLECTED</span>
            </div>
          </div>
          <div className="archive-readonly">
            <Lock size={14} /> <strong>Read-only.</strong> Archived records.
          </div>
        </div>

        <div className="orders-filter-bar">
          <div className="filter-search">
            <Search size={16} className="filter-search-icon" />
            <input
              type="text"
              placeholder="Search archived invoices..."
              className="filter-search-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <select className="filter-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option>All Status</option>
            <option>Paid</option>
            <option>Partially Paid</option>
            <option>Unpaid</option>
            <option>Overdue</option>
          </select>
        </div>

        <div className="card">
          <div className="card-header">
            <div className="flex items-center gap-sm">
              <h4>Archived Records</h4>
              <span className="archive-count-badge">{filtered.length} records</span>
              <span className="archive-readonly-tag">
                <Lock size={12} /> READ-ONLY
              </span>
            </div>
          </div>
          <table className="data-table">
            <thead>
              <tr>
                <th>INVOICE NO.</th>
                <th>CLIENT</th>
                <th>BILLING DATE</th>
                <th>TOTAL</th>
                <th>BALANCE</th>
                <th>STATUS</th>
                <th>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '24px', color: 'var(--text-secondary)' }}>
                    No archived invoices found.
                  </td>
                </tr>
              ) : (
                filtered.map((inv) => (
                  <tr key={inv.id}>
                    <td>
                      <span className="waybill-link" onClick={() => navigate(`/invoices/${inv.id}`)}>
                        {inv.invoiceNo}
                      </span>
                    </td>
                    <td className="cell-name">{inv.clientName}</td>
                    <td>{formatDate(inv.billingDate)}</td>
                    <td className="amount-cell">{formatCurrency(inv.totalAmount)}</td>
                    <td className={`amount-cell ${inv.balance > 0 ? 'balance-positive' : 'balance-zero'}`}>
                      {formatCurrency(inv.balance)}
                    </td>
                    <td>
                      <StatusBadge status={inv.paymentStatus} size="sm" />
                    </td>
                    <td className="cell-actions">
                      <button className="action-icon-btn" title="View" onClick={() => navigate(`/invoices/${inv.id}`)}>
                        <Eye size={14} />
                      </button>
                      {isAdmin && (
                        <button className="action-icon-btn" title="Restore" onClick={() => handleRestore(inv.id, inv.invoiceNo)}>
                          <ArchiveRestore size={14} />
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
