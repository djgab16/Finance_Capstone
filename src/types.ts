export type UserRole = 'ADMIN' | 'OP. TEAM';
export type AccountStatus = 'Active' | 'Pending' | 'Locked';
export type NotificationType = 'alert' | 'success' | 'system' | 'info';
export type ActionType =
  | 'Create Invoice'
  | 'Update Invoice'
  | 'Record Payment'
  | 'Add Client'
  | 'Update Client'
  | 'Archive'
  | 'Login'
  | 'Logout'
  | 'Export Report';

export type PaymentStatus = 'Paid' | 'Unpaid' | 'Partially Paid' | 'Overdue';
export type AgingBucket = 'Current' | '1-30' | '31-60' | '61-90' | '90+';
export type PaymentMethod = 'Cash' | 'Check' | 'Bank Transfer' | 'GCash';
export type ClientStatus = 'Active' | 'Inactive';

export interface Employee {
  id: string;
  name: string;
  role: UserRole;
  systemAccess: string;
  status: AccountStatus;
}

export interface Client {
  id: string;
  clientCode: string;
  name: string;
  businessName: string;
  contactPerson: string;
  contactNumber: string;
  email: string;
  address: string;
  tin?: string;
  creditLimit: number;
  currentBalance: number;
  totalBilled: number;
  totalPaid: number;
  status: ClientStatus;
  dateRegistered: string;
  lastTransaction: string;
}

export interface Invoice {
  id: string;
  invoiceNo: string;
  clientId: string;
  clientName: string;
  billingDate: string;
  dueDate: string;
  freightCharges: number;
  otherCharges: number;
  subtotal: number;
  vatRate: number;
  vatAmount: number;
  surcharge: number;
  totalAmount: number;
  amountPaid: number;
  balance: number;
  paymentStatus: PaymentStatus;
  agingBucket: AgingBucket;
  daysOverdue: number;
  description: string;
  encodedBy: string;
  dateEncoded: string;
  lastUpdated: string;
  updatedBy: string;
  archived?: boolean;
}

export interface Payment {
  id: string;
  orNumber: string;
  invoiceId: string;
  invoiceNo: string;
  clientId: string;
  clientName: string;
  paymentDate: string;
  amount: number;
  paymentMethod: PaymentMethod;
  referenceNumber?: string;
  remarks?: string;
  recordedBy: string;
  dateRecorded: string;
}

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  invoiceNo?: string;
  description: string;
  timestamp: string;
  date: string;
  source: string;
  read: boolean;
  statusBadge?: string;
}

export interface ActivityLog {
  id: string;
  timestamp: string;
  userName: string;
  userRole: string;
  userInitials: string;
  userColor: string;
  action: ActionType;
  description: string;
  reference?: string;
}
