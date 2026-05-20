import { useNavigate } from 'react-router-dom';
import { Phone, Receipt } from 'lucide-react';
import Header from '../../components/layout/Header';
import StatusBadge from '../../components/ui/StatusBadge';
import { useData } from '../../context/DataContext';
import { formatCurrency, formatDate } from '../../utils/finance';
import type { Invoice } from '../../types';
import './Tasks.css';

interface ColumnProps {
  title: string;
  invoices: Invoice[];
  onView: (id: string) => void;
  onRecord: (id: string) => void;
  emptyMessage: string;
}

function Column({ title, invoices, onView, onRecord, emptyMessage }: ColumnProps) {
  return (
    <div className="task-column">
      <h4 style={{ marginBottom: '16px', borderBottom: '1px solid #E9EDF7', paddingBottom: '8px' }}>
        {title} <span style={{ color: 'var(--text-secondary)' }}>({invoices.length})</span>
      </h4>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {invoices.length === 0 && (
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.82rem' }}>{emptyMessage}</p>
        )}
        {invoices.map((inv) => (
          <div key={inv.id} className="task-card" onClick={() => onView(inv.id)}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <strong style={{ color: 'var(--primary)', fontSize: '0.9rem' }}>{inv.invoiceNo}</strong>
              <StatusBadge status={inv.paymentStatus} size="sm" />
            </div>
            <div style={{ fontSize: '0.85rem', marginBottom: '6px', color: 'var(--text-primary)', fontWeight: 600 }}>
              {inv.clientName}
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>
              Due {formatDate(inv.dueDate)} · {inv.daysOverdue} days overdue
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px' }}>
              <strong style={{ color: 'var(--status-failed)', fontSize: '0.9rem' }}>
                {formatCurrency(inv.balance)}
              </strong>
              <button
                className="btn btn-sm btn-primary"
                onClick={(e) => {
                  e.stopPropagation();
                  onRecord(inv.id);
                }}
              >
                <Receipt size={12} /> Record
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Tasks() {
  const { invoices } = useData();
  const navigate = useNavigate();

  const overdue = invoices.filter((inv) => inv.paymentStatus === 'Overdue' && !inv.archived);
  const partial = invoices.filter((inv) => inv.paymentStatus === 'Partially Paid' && !inv.archived);
  const upcoming = invoices.filter((inv) => inv.paymentStatus === 'Unpaid' && !inv.archived);

  return (
    <>
      <Header
        title="Collection Tasks"
        subtitle="Follow-up Board"
        date={new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        actions={
          <button className="btn btn-primary btn-sm" onClick={() => navigate('/overdue')}>
            <Phone size={14} /> View All Overdue
          </button>
        }
      />
      <div className="page-content">
        <p style={{ color: 'var(--text-secondary)', marginBottom: '16px' }}>
          Monitor outstanding receivables across follow-up stages. Click an invoice to view details or record payment.
        </p>
        <div className="tasks-board-container">
          <Column
            title="Overdue — Call Now"
            invoices={overdue}
            onView={(id) => navigate(`/invoices/${id}`)}
            onRecord={(id) => navigate('/payments/new', { state: { invoiceId: id } })}
            emptyMessage="No overdue accounts. Great job!"
          />
          <Column
            title="Partially Paid — Follow Up"
            invoices={partial}
            onView={(id) => navigate(`/invoices/${id}`)}
            onRecord={(id) => navigate('/payments/new', { state: { invoiceId: id } })}
            emptyMessage="No partial balances at the moment."
          />
          <Column
            title="Unpaid — Awaiting"
            invoices={upcoming}
            onView={(id) => navigate(`/invoices/${id}`)}
            onRecord={(id) => navigate('/payments/new', { state: { invoiceId: id } })}
            emptyMessage="All current invoices are accounted for."
          />
        </div>
      </div>
    </>
  );
}
