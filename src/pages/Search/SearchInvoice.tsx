import { useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import { Link } from 'react-router-dom';
import Header from '../../components/layout/Header';
import StatusBadge from '../../components/ui/StatusBadge';
import { useData } from '../../context/DataContext';
import { formatCurrency, formatDate } from '../../utils/finance';
import '../Invoices/Invoices.css';
import './SearchInvoice.css';

export default function SearchInvoice() {
  const { invoices, payments, clients } = useData();
  const [query, setQuery] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const term = query.trim().toLowerCase();

  const matched = useMemo(() => {
    if (!term) return [] as typeof invoices;
    const orMatches = payments.filter((p) => p.orNumber.toLowerCase().includes(term)).map((p) => p.invoiceId);
    return invoices.filter(
      (inv) =>
        inv.invoiceNo.toLowerCase().includes(term) ||
        inv.clientName.toLowerCase().includes(term) ||
        orMatches.includes(inv.id),
    );
  }, [invoices, payments, term]);

  const matchedClients = useMemo(() => {
    if (!term) return [] as typeof clients;
    return clients.filter(
      (c) =>
        c.name.toLowerCase().includes(term) ||
        c.clientCode.toLowerCase().includes(term) ||
        c.contactPerson.toLowerCase().includes(term),
    );
  }, [clients, term]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <>
      <Header
        title="Search Invoice"
        subtitle="ARCMS · Search"
        date={new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
      />
      <div className="page-content">
        <form className="track-search-section" onSubmit={handleSubmit}>
          <div className="track-search-bar-wrapper">
            <span className="label" style={{ color: 'white' }}>SEARCH</span>
            <h3 style={{ color: 'white', marginBottom: '12px' }}>Find by invoice no., OR no., or client</h3>
            <div className="track-search-row">
              <div className="track-search-input-wrapper">
                <Search size={18} className="track-search-icon" />
                <input
                  className="track-search-input"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="e.g. INV-2026-0001, OR-2026-0002, Lazada..."
                />
              </div>
              <button type="submit" className="btn btn-primary btn-lg track-btn">
                <Search size={16} /> SEARCH
              </button>
            </div>
            <div className="results-summary">
              <span>{matched.length} invoice match{matched.length === 1 ? '' : 'es'}</span>
              <span>•</span>
              <span>{matchedClients.length} client match{matchedClients.length === 1 ? '' : 'es'}</span>
            </div>
          </div>
        </form>

        {submitted && term && (
          <>
            {matchedClients.length > 0 && (
              <div className="card">
                <div className="card-header">
                  <h4>Matching Clients</h4>
                </div>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>CODE</th>
                      <th>NAME</th>
                      <th>CONTACT</th>
                      <th>BALANCE</th>
                      <th>STATUS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {matchedClients.map((c) => (
                      <tr key={c.id}>
                        <td className="cell-id">{c.clientCode}</td>
                        <td>
                          <Link to={`/clients/${c.id}`} className="cell-name" style={{ color: 'var(--primary)' }}>
                            {c.name}
                          </Link>
                        </td>
                        <td>{c.contactPerson}</td>
                        <td className="amount-cell">{formatCurrency(c.currentBalance)}</td>
                        <td>
                          <StatusBadge status={c.status} size="sm" />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <div className="card">
              <div className="card-header">
                <h4>Matching Invoices</h4>
                <span className="archive-count-badge">{matched.length} found</span>
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
                  </tr>
                </thead>
                <tbody>
                  {matched.length === 0 ? (
                    <tr>
                      <td colSpan={6} style={{ textAlign: 'center', padding: '32px', color: 'var(--text-secondary)' }}>
                        No invoices found. Try a different search term.
                      </td>
                    </tr>
                  ) : (
                    matched.map((inv) => (
                      <tr key={inv.id}>
                        <td>
                          <Link to={`/invoices/${inv.id}`} className="waybill-link">
                            {inv.invoiceNo}
                          </Link>
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
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </>
  );
}
