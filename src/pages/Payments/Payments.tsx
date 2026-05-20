import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Trash2, Download } from 'lucide-react';
import Header from '../../components/layout/Header';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { downloadCSV, formatCurrency, formatDate, generateId } from '../../utils/finance';
import '../Invoices/Invoices.css';

export default function Payments() {
  const { payments, deletePayment, addActivityLog } = useData();
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';

  const [searchTerm, setSearchTerm] = useState('');
  const [methodFilter, setMethodFilter] = useState('All Methods');

  const filtered = useMemo(() => {
    return payments.filter((p) => {
      const term = searchTerm.toLowerCase();
      const matchSearch =
        !term ||
        p.orNumber.toLowerCase().includes(term) ||
        p.invoiceNo.toLowerCase().includes(term) ||
        p.clientName.toLowerCase().includes(term);
      const matchMethod = methodFilter === 'All Methods' || p.paymentMethod === methodFilter;
      return matchSearch && matchMethod;
    });
  }, [payments, searchTerm, methodFilter]);

  const totalCollected = filtered.reduce((s, p) => s + p.amount, 0);

  const handleExport = () => {
    const rows: (string | number)[][] = [
      ['OR Number', 'Invoice No', 'Client', 'Payment Date', 'Amount', 'Method', 'Reference', 'Recorded By'],
      ...filtered.map((p) => [
        p.orNumber,
        p.invoiceNo,
        p.clientName,
        p.paymentDate,
        p.amount,
        p.paymentMethod,
        p.referenceNumber || '',
        p.recordedBy,
      ]),
    ];
    downloadCSV('payments-export', rows);
  };

  const handleDelete = (id: string, orNumber: string) => {
    if (window.confirm(`Reverse payment ${orNumber}? This will restore the invoice balance.`)) {
      deletePayment(id);
      addActivityLog({
        id: generateId('log'),
        timestamp: new Date().toLocaleString(),
        userName: user?.name || 'System',
        userRole: user?.role || 'ADMIN',
        userInitials: (user?.name || 'SY').split(' ').map((n) => n[0]).join('').substring(0, 2),
        userColor: '#E31A1A',
        action: 'Record Payment',
        description: `Reversed payment ${orNumber}`,
        reference: orNumber,
      });
    }
  };

  return (
    <>
      <Header
        title="Payments"
        subtitle="Collection Monitoring"
        date={new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        actions={
          <div className="flex gap-sm">
            <button className="btn btn-outline btn-sm" onClick={handleExport}>
              <Download size={14} /> Export CSV
            </button>
            <Link to="/payments/new" className="btn btn-primary">
              <Plus size={16} /> RECORD PAYMENT
            </Link>
          </div>
        }
      />
      <div className="page-content">
        <div className="order-stats-bar">
          <div className="order-stat">
            <span className="order-stat-value">{filtered.length}</span>
            <span className="order-stat-label">PAYMENTS RECORDED</span>
          </div>
          <div className="order-stat-divider" />
          <div className="order-stat">
            <span className="order-stat-value highlight-green">{formatCurrency(totalCollected)}</span>
            <span className="order-stat-label">TOTAL COLLECTED</span>
          </div>
          <div className="order-stat-divider" />
          <div className="order-stat">
            <span className="order-stat-value">{filtered.filter((p) => p.paymentMethod === 'Bank Transfer').length}</span>
            <span className="order-stat-label">BANK TRANSFERS</span>
          </div>
          <div className="order-stat-divider" />
          <div className="order-stat">
            <span className="order-stat-value">{filtered.filter((p) => p.paymentMethod === 'GCash').length}</span>
            <span className="order-stat-label">GCASH PAYMENTS</span>
          </div>
        </div>

        <div className="orders-filter-bar">
          <div className="filter-search">
            <Search size={16} className="filter-search-icon" />
            <input
              type="text"
              placeholder="Search by OR, invoice, client..."
              className="filter-search-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select className="filter-select" value={methodFilter} onChange={(e) => setMethodFilter(e.target.value)}>
            <option>All Methods</option>
            <option>Cash</option>
            <option>Check</option>
            <option>Bank Transfer</option>
            <option>GCash</option>
          </select>
        </div>

        <div className="card">
          <table className="data-table">
            <thead>
              <tr>
                <th>OR NUMBER</th>
                <th>INVOICE NO.</th>
                <th>CLIENT</th>
                <th>AMOUNT</th>
                <th>METHOD</th>
                <th>DATE</th>
                <th>RECORDED BY</th>
                <th>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
                    No payments recorded yet.
                  </td>
                </tr>
              ) : (
                filtered.map((p) => (
                  <tr key={p.id}>
                    <td>
                      <span className="waybill-link">{p.orNumber}</span>
                      {p.referenceNumber && <div className="cell-sub">Ref: {p.referenceNumber}</div>}
                    </td>
                    <td>
                      <Link to={`/invoices/${p.invoiceId}`} className="waybill-link">
                        {p.invoiceNo}
                      </Link>
                    </td>
                    <td>
                      <span className="cell-name">{p.clientName}</span>
                    </td>
                    <td className="amount-cell">{formatCurrency(p.amount)}</td>
                    <td>{p.paymentMethod}</td>
                    <td>{formatDate(p.paymentDate)}</td>
                    <td className="cell-sub">{p.recordedBy}</td>
                    <td className="cell-actions">
                      {isAdmin && (
                        <button className="action-icon-btn danger" title="Reverse" onClick={() => handleDelete(p.id, p.orNumber)}>
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
            <span className="pagination-info">Showing {filtered.length} payments</span>
          </div>
        </div>
      </div>
    </>
  );
}
