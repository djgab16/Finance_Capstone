import type { AccountStatus, PaymentStatus, AgingBucket, ClientStatus } from '../../types';
import './StatusBadge.css';

interface StatusBadgeProps {
  status: AccountStatus | PaymentStatus | AgingBucket | ClientStatus | string;
  size?: 'sm' | 'md';
}

const statusConfig: Record<string, { className: string; label?: string }> = {
  Active: { className: 'status-active' },
  Inactive: { className: 'status-system', label: 'Inactive' },
  Pending: { className: 'status-pending' },
  Locked: { className: 'status-locked' },

  Paid: { className: 'status-active' },
  Unpaid: { className: 'status-system', label: 'Unpaid' },
  'Partially Paid': { className: 'status-transit', label: 'Partially Paid' },
  Overdue: { className: 'status-failed', label: 'Overdue' },

  Current: { className: 'status-active', label: 'Current' },
  '1-30': { className: 'status-pending', label: '1-30 days' },
  '31-60': { className: 'status-transit', label: '31-60 days' },
  '61-90': { className: 'status-failed', label: '61-90 days' },
  '90+': { className: 'status-locked', label: '90+ days' },

  Urgent: { className: 'status-failed' },
  Success: { className: 'status-active' },
  New: { className: 'status-new' },
  Alert: { className: 'status-failed' },
  System: { className: 'status-system' },
  Excellent: { className: 'status-active' },
};

export default function StatusBadge({ status, size = 'md' }: StatusBadgeProps) {
  const config = statusConfig[status] || { className: 'status-default' };
  return (
    <span className={`status-badge ${config.className} status-${size}`}>
      <span className="status-dot" />
      {config.label || status}
    </span>
  );
}
