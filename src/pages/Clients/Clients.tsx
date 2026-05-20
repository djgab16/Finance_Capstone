import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Search, Eye, Pencil, Trash2 } from 'lucide-react';
import Header from '../../components/layout/Header';
import StatusBadge from '../../components/ui/StatusBadge';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { formatCurrency, formatDate } from '../../utils/finance';
import '../Invoices/Invoices.css';

export default function Clients() {
  const navigate = useNavigate();
  const { clients, deleteClient, addActivityLog } = useData();
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  const filtered = useMemo(() => {
    return clients.filter((c) => {
      const term = searchTerm.toLowerCase();
      const matchSearch =
        !term ||
        c.name.toLowerCase().includes(term) ||
        c.clientCode.toLowerCase().includes(term) ||
        c.contactPerson.toLowerCase().includes(term);
      const matchStatus = statusFilter === 'All' || c.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [clients, searchTerm, statusFilter]);

  const totalReceivable = filtered.reduce((sum, c) => sum + c.currentBalance, 0);
  const activeCount = filtered.filter((c) => c.status === 'Active').length;
  const inactiveCount = filtered.filter((c) => c.status === 'Inactive').length;

  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`Delete client ${name}? This cannot be undone.`)) {
      deleteClient(id);
      addActivityLog({
        id: Date.now().toString(),
        timestamp: new Date().toLocaleString(),
        userName: user?.name || 'System',
        userRole: user?.role || 'OP. TEAM',
        userInitials: (user?.name || 'SY').split(' ').map((n) => n[0]).join('').substring(0, 2),
        userColor: '#E31A1A',
        action: 'Update Client',
        description: `Deleted client ${name}`,
        reference: id,
      });
    }
  };

  return (
    <>
      <Header
        title="Clients"
        subtitle="ARCMS · Accounts Receivable"
        date={new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        actions={
          isAdmin && (
            <Link to="/clients/new" className="btn btn-primary">
              <Plus size={16} /> NEW CLIENT
            </Link>
          )
        }
      />
      <div className="page-content">
        <div className="order-stats-bar">
          <div className="order-stat">
            <span className="order-stat-value">{filtered.length}</span>
            <span className="order-stat-label">TOTAL CLIENTS</span>
          </div>
          <div className="order-stat-divider" />
          <div className="order-stat">
            <span className="order-stat-value highlight-green">{activeCount}</span>
            <span className="order-stat-label">ACTIVE</span>
          </div>
          <div className="order-stat-divider" />
          <div className="order-stat">
            <span className="order-stat-value">{inactiveCount}</span>
            <span className="order-stat-label">INACTIVE</span>
          </div>
          <div className="order-stat-divider" />
          <div className="order-stat">
            <span className="order-stat-value">{formatCurrency(totalReceivable)}</span>
            <span className="order-stat-label">TOTAL RECEIVABLE</span>
          </div>
        </div>

        <div className="orders-filter-bar">
          <div className="filter-search">
            <Search size={16} className="filter-search-icon" />
            <input
              type="text"
              placeholder="Search clients by name, code, contact person..."
              className="filter-search-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select className="filter-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option>All</option>
            <option>Active</option>
            <option>Inactive</option>
          </select>
        </div>

        <div className="card">
          <table className="data-table">
            <thead>
              <tr>
                <th>CODE</th>
                <th>NAME</th>
                <th>CONTACT</th>
                <th>BALANCE</th>
                <th>STATUS</th>
                <th>LAST TRANSACTION</th>
                <th>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
                    No clients found matching your filters.
                  </td>
                </tr>
              ) : (
                filtered.map((c) => (
                  <tr key={c.id}>
                    <td>
                      <span className="cell-id">{c.clientCode}</span>
                    </td>
                    <td>
                      <Link to={`/clients/${c.id}`} className="cell-name" style={{ color: 'var(--primary)' }}>
                        {c.name}
                      </Link>
                      <div className="cell-sub">{c.businessName}</div>
                    </td>
                    <td>
                      <span>{c.contactPerson}</span>
                      <div className="cell-sub">{c.contactNumber}</div>
                    </td>
                    <td
                      className={`amount-cell ${c.currentBalance > 0 ? 'balance-positive' : 'balance-zero'}`}
                    >
                      {formatCurrency(c.currentBalance)}
                    </td>
                    <td>
                      <StatusBadge status={c.status} size="sm" />
                    </td>
                    <td>{formatDate(c.lastTransaction)}</td>
                    <td className="cell-actions">
                      <button className="action-icon-btn" title="View" onClick={() => navigate(`/clients/${c.id}`)}>
                        <Eye size={14} />
                      </button>
                      {isAdmin && (
                        <button className="action-icon-btn" title="Edit" onClick={() => navigate(`/clients/${c.id}/edit`)}>
                          <Pencil size={14} />
                        </button>
                      )}
                      {isAdmin && (
                        <button className="action-icon-btn danger" title="Delete" onClick={() => handleDelete(c.id, c.name)}>
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
