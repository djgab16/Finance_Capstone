import type { UserRole } from '../../types';
import './RoleBadge.css';

interface RoleBadgeProps {
  role: UserRole;
}

const roleConfig: Record<UserRole, { className: string }> = {
  ADMIN: { className: 'role-admin' },
  'OP. TEAM': { className: 'role-ops' },
};

export default function RoleBadge({ role }: RoleBadgeProps) {
  const config = roleConfig[role] || { className: 'role-default' };
  return <span className={`role-badge ${config.className}`}>{role}</span>;
}
