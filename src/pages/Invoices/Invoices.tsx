import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Search, Filter, Eye, Pencil, Trash2, Archive as ArchiveIcon } from 'lucide-react';
import Header from '../../components/layout/Header';
import StatusBadge from '../../components/ui/StatusBadge';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { formatCurrency, formatDate } from '../../utils/finance';
import './Invoices.css';

export default function Invoices() {
  const navigate = useNavigate();
  const { invoices, clients, deleteInvoice, archiveInvoice, addActivityLog } = useData();
  const { user } = useAuth();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [clientFilter, setClientFilter] = useState('All Clients');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const activeInvoices = useMemo(() => invoices.filter((inv) => !inv.archived), [invoices]);

  const filtered = useMemo(() => {
    return activeInvoices.filter((inv) => {
      const term = searchTerm.toLowerCase();
      const matchSearch =
        !term ||
        inv.invoiceNo.toLowerCase().includes(term) ||
        inv.clientName.toLowerCase().includes(term) ||
        inv.description.toLowerCase().includes(term);
      const matchStatus = statusFilter === 'All Status' || inv.paymentStatus === statusFilter;
      const matchClient = clientFilter === 'All Clients' || inv.clientId === clientFilter;
      const matchDateFrom = !dateFrom || inv.billingDate >= dateFrom;
      const matchDateTo = !dateTo || inv.billingDate <= dateTo;
      return matchSearch && matchStatus && matchClient && matchDateFrom && matchDateTo;
    });
  }, [activeInvoices, searchTerm, statusFilter, clientFilter, dateFrom, dateTo]);

  const totalAR = filtered.reduce((sum, inv) => sum + inv.balance, 0);
  const overdueCount = filtered.filter((inv) => inv.paymentStatus === 'Overdue').length;
  const paidCount = filtered.filter((inv) => inv.paymentStatus === 'Paid').length;
  const unpaidCount = filtered.filter((inv) => inv.paymentStatus === 'Unpaid').length;

  const handleDelete = (id: string, invoiceNo: string) => {
    if (window.confirm(`Delete invoice ${invoiceNo}? This cannot be undone.`)) {
      deleteInvoice(id);
      addActivityLog({
        id: Date.now().toString(),
        timestamp: new Date().toLocaleString(),
        userName: user?.name || 'System',
        userRole: user?.role || 'OP. TEAM',
        userInitials: (user?.name || 'SY')
          .split(' ')
          .map((n) => n[0])
          .join('')
          .substring(0, 2),
        userColor: '#E31A1A',
        action: 'Update Invoice',
        description: `Deleted invoice ${invoiceNo}`,
        reference: invoiceNo,
      });
    }
  };

  const handleArchive = (id: string, invoiceNo: string) => {
    archiveInvoice(id, true);
    addActivityLog({
      id: Date.now().toString(),
      timestamp: new Date().toLocaleString(),
      userName: user?.name || 'System',
      userRole: user?.role || 'OP. TEAM',
      userInitials: (user?.name || 'SY')
        .split(' ')
        .map((n) => n[0])
        .join('')
        .substring(0, 2),
      userColor: '#A3AED0',
      action: 'Archive',
      description: `Archived invoice ${invoiceNo}`,
      reference: invoiceNo,
    });
  };

  return (
    <>
      <Header
        title="Billing & Invoices"
        subtitle="ARCMS · Accounts Receivable"
        date={new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        actions={
          <Link to="/invoices/new" className="btn btn-primary" id="new-invoice-btn">
            <Plus size={16} /> NEW INVOICE
          </Link>
        }
      />
      <div className="page-content">
        <div className="order-stats-bar">
          <div className="order-stat">
            <span className="order-stat-value">{filtered.length}</span>
            <span className="order-stat-label">TOTAL INVOICES</span>
          </div>
          <div className="order-stat-divider" />
          <div className="order-stat">
            <span className="order-stat-value highlight-orange">{unpaidCount}</span>
            <span className="order-stat-label">UNPAID</span>
          </div>
          <div className="order-stat-divider" />
          <div className="order-stat">
            <span className="order-stat-value highlight-green">{paidCount}</span>
            <span className="order-stat-label">PAID</span>
          </div>
          <div className="order-stat-divider" />
          <div className="order-stat">
            <span className="order-stat-value highlight-red">{overdueCount}</span>
            <span className="order-stat-label">OVERDUE</span>
          </div>
          <div className="order-stat-divider" />
          <div className="order-stat">
            <span className="order-stat-value">{formatCurrency(totalAR)}</span>
            <span className="order-stat-label">OUTSTANDING AR</span>
          </div>
        </div>

        <div className="orders-filter-bar">
          <div className="filter-search">
            <Search size={16} className="filter-search-icon" />
            <input
              type="text"
              placeholder="Search by invoice no., client, description..."
              className="filter-search-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select className="filter-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option>All Status</option>
            <option>Paid</option>
            <option>Partially Paid</option>
            <option>Unpaid</option>
            <option>Overdue</option>
          </select>
          <select className="filter-select" value={clientFilter} onChange={(e) => setClientFilter(e.target.value)}>
            <option value="All Clients">All Clients</option>
            {clients.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          <button
            className={`btn btn-sm ${showFilters ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter size={14} /> More Filters
          </button>
        </div>

        {showFilters && (
          <div
            style={{
              background: 'white',
              padding: '16px',
              borderRadius: '8px',
              border: '1px solid #eee',
              display: 'flex',
              gap: '16px',
            }}
          >
            <div className="form-group" style={{ margin: 0, flex: 1 }}>
              <label className="form-label" style={{ fontSize: '12px' }}>BILLING DATE FROM</label>
              <input
                type="date"
                className="filter-select"
                style={{ width: '100%', height: '40px' }}
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
              />
            </div>
            <div className="form-group" style={{ margin: 0, flex: 1 }}>
              <label className="form-label" style={{ fontSize: '12px' }}>BILLING DATE TO</label>
              <input
                type="date"
                className="filter-select"
                style={{ width: '100%', height: '40px' }}
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
              />
            </div>
            <div className="form-group" style={{ margin: 0, flex: 1 }}>
              <label className="form-label" style={{ fontSize: '12px' }}>RESET</label>
              <button
                className="btn btn-outline"
                style={{ height: '40px' }}
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('All Status');
                  setClientFilter('All Clients');
                  setDateFrom('');
                  setDateTo('');
                }}
              >
                Clear Filters
              </button>
            </div>
          </div>
        )}

        <div className="card">
          <table className="data-table">
            <thead>
              <tr>
                <th>INVOICE NO.</th>
                <th>CLIENT</th>
                <th>BILLING DATE</th>
                <th>DUE DATE</th>
                <th>TOTAL</th>
                <th>BALANCE</th>
                <th>STATUS</th>
                <th>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
                    No invoices found matching your filters.
                  </td>
                </tr>
              ) : (
                filtered.map((inv) => (
                  <tr key={inv.id}>
                    <td>
                      <Link to={`/invoices/${inv.id}`} className="waybill-link">
                        {inv.invoiceNo}
                      </Link>
                      <div className="cell-sub">{inv.description.substring(0, 28)}{inv.description.length > 28 ? '…' : ''}</div>
                    </td>
                    <td>
                      <span className="cell-name">{inv.clientName}</span>
                      <div className="cell-sub">{inv.clientId}</div>
                    </td>
                    <td>{formatDate(inv.billingDate)}</td>
                    <td>
                      {formatDate(inv.dueDate)}
                      {inv.daysOverdue > 0 && (
                        <div className="cell-sub" style={{ color: 'var(--status-failed)' }}>
                          +{inv.daysOverdue} days overdue
                        </div>
                      )}
                    </td>
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
                      <button className="action-icon-btn" title="Edit" onClick={() => navigate(`/invoices/${inv.id}/edit`)}>
                        <Pencil size={14} />
                      </button>
                      <button
                        className="action-icon-btn"
                        title="Archive"
                        onClick={() => handleArchive(inv.id, inv.invoiceNo)}
                      >
                        <ArchiveIcon size={14} />
                      </button>
                      {user?.role === 'ADMIN' && (
                        <button
                          className="action-icon-btn danger"
                          title="Delete"
                          onClick={() => handleDelete(inv.id, inv.invoiceNo)}
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          <div className="table-pagination">
            <span className="pagination-info">Showing {filtered.length} records</span>
          </div>
        </div>
      </div>
    </>
  );
}
