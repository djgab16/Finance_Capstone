import type {
  Employee,
  Client,
  Invoice,
  Payment,
  Notification,
  ActivityLog,
} from '../types';
import { computeInvoiceTotals, getAgingBucket, derivePaymentStatus } from '../utils/finance';

export const employees: Employee[] = [
  { id: 'EMP-001', name: 'Taromaru Rex Gabriel', role: 'ADMIN', systemAccess: 'All Systems', status: 'Active' },
];

const ADMIN_USER_NAME = 'Taromaru Rex Gabriel';

const dayMs = 1000 * 60 * 60 * 24;
const todayMs = new Date('2026-05-20T00:00:00').getTime();

function dateAt(daysAgo: number): string {
  return new Date(todayMs - daysAgo * dayMs).toISOString().slice(0, 10);
}

export const clients: Client[] = [
  {
    id: 'CL-001',
    clientCode: 'LZD-001',
    name: 'Lazada Philippines',
    businessName: 'Lazada E-Services Philippines, Inc.',
    contactPerson: 'Maria Dela Cruz',
    contactNumber: '0917-123-4567',
    email: 'finance@lazada.com.ph',
    address: 'Rockwell Dr., Brgy. Poblacion, Makati City',
    tin: '123-456-789-000',
    creditLimit: 500000,
    currentBalance: 0,
    totalBilled: 0,
    totalPaid: 0,
    status: 'Active',
    dateRegistered: dateAt(540),
    lastTransaction: dateAt(2),
  },
  {
    id: 'CL-002',
    clientCode: 'SHP-002',
    name: 'Shopee Express',
    businessName: 'Shopee Xpress PH, Inc.',
    contactPerson: 'Jose Santos',
    contactNumber: '0917-555-9876',
    email: 'ap@shopee.ph',
    address: 'Ayala Ave., Makati City',
    tin: '987-654-321-000',
    creditLimit: 450000,
    currentBalance: 0,
    totalBilled: 0,
    totalPaid: 0,
    status: 'Active',
    dateRegistered: dateAt(480),
    lastTransaction: dateAt(5),
  },
  {
    id: 'CL-003',
    clientCode: 'TTS-003',
    name: 'TikTok Shop',
    businessName: 'TikTok Shop Philippines, Inc.',
    contactPerson: 'Robert Lim',
    contactNumber: '0917-333-4444',
    email: 'billing@tiktok.ph',
    address: 'BGC High St., Taguig City',
    tin: '321-654-987-000',
    creditLimit: 300000,
    currentBalance: 0,
    totalBilled: 0,
    totalPaid: 0,
    status: 'Active',
    dateRegistered: dateAt(420),
    lastTransaction: dateAt(8),
  },
  {
    id: 'CL-004',
    clientCode: 'SM-004',
    name: 'SM Supermalls',
    businessName: 'SM Prime Holdings, Inc.',
    contactPerson: 'Ella Garcia',
    contactNumber: '0922-777-8888',
    email: 'payables@sm.com.ph',
    address: 'Mall of Asia Complex, Pasay City',
    tin: '111-222-333-000',
    creditLimit: 800000,
    currentBalance: 0,
    totalBilled: 0,
    totalPaid: 0,
    status: 'Active',
    dateRegistered: dateAt(720),
    lastTransaction: dateAt(15),
  },
  {
    id: 'CL-005',
    clientCode: 'JNT-005',
    name: 'J&T Express',
    businessName: 'J&T Express Philippines, Corp.',
    contactPerson: 'Benjamin Cruz',
    contactNumber: '0923-444-5555',
    email: 'finance@jtexpress.ph',
    address: 'Batangas St., Pasig City',
    tin: '222-333-444-000',
    creditLimit: 250000,
    currentBalance: 0,
    totalBilled: 0,
    totalPaid: 0,
    status: 'Active',
    dateRegistered: dateAt(360),
    lastTransaction: dateAt(20),
  },
  {
    id: 'CL-006',
    clientCode: 'JOL-006',
    name: 'Jollibee Foods Corp.',
    businessName: 'Jollibee Foods Corporation',
    contactPerson: 'Cecilia Ocampo',
    contactNumber: '0918-555-1234',
    email: 'ap@jollibee.com.ph',
    address: 'Ortigas Center, Pasig City',
    tin: '333-444-555-000',
    creditLimit: 600000,
    currentBalance: 0,
    totalBilled: 0,
    totalPaid: 0,
    status: 'Active',
    dateRegistered: dateAt(600),
    lastTransaction: dateAt(30),
  },
  {
    id: 'CL-007',
    clientCode: 'PLD-007',
    name: 'PLDT Inc.',
    businessName: 'Philippine Long Distance Telephone Co.',
    contactPerson: 'Anna Reyes',
    contactNumber: '0925-888-9999',
    email: 'vendor@pldt.com.ph',
    address: 'Ramon Cojuangco Bldg., Makati City',
    tin: '444-555-666-000',
    creditLimit: 750000,
    currentBalance: 0,
    totalBilled: 0,
    totalPaid: 0,
    status: 'Active',
    dateRegistered: dateAt(820),
    lastTransaction: dateAt(45),
  },
  {
    id: 'CL-008',
    clientCode: 'GLB-008',
    name: 'Globe Telecom',
    businessName: 'Globe Telecom, Inc.',
    contactPerson: 'Miguel Torres',
    contactNumber: '0924-666-7777',
    email: 'accounts@globe.com.ph',
    address: 'Pioneer St., Mandaluyong City',
    tin: '555-666-777-000',
    creditLimit: 700000,
    currentBalance: 0,
    totalBilled: 0,
    totalPaid: 0,
    status: 'Active',
    dateRegistered: dateAt(780),
    lastTransaction: dateAt(60),
  },
  {
    id: 'CL-009',
    clientCode: 'MET-009',
    name: 'Metro Retail Stores Group',
    businessName: 'Metro Retail Stores Group, Inc.',
    contactPerson: 'Carla Mendoza',
    contactNumber: '0926-111-2222',
    email: 'ap@metroretail.com.ph',
    address: 'Banawe St., Quezon City',
    tin: '666-777-888-000',
    creditLimit: 200000,
    currentBalance: 0,
    totalBilled: 0,
    totalPaid: 0,
    status: 'Active',
    dateRegistered: dateAt(300),
    lastTransaction: dateAt(75),
  },
  {
    id: 'CL-010',
    clientCode: 'PNB-010',
    name: 'PNB Logistics',
    businessName: 'PNB Logistics Solutions, Inc.',
    contactPerson: 'Henry Yulip',
    contactNumber: '0927-222-3333',
    email: 'billing@pnblogistics.com',
    address: 'Roxas Blvd., Manila',
    tin: '777-888-999-000',
    creditLimit: 150000,
    currentBalance: 0,
    totalBilled: 0,
    totalPaid: 0,
    status: 'Inactive',
    dateRegistered: dateAt(900),
    lastTransaction: dateAt(180),
  },
];

interface InvoiceSeed {
  invoiceNo: string;
  clientId: string;
  billingDaysAgo: number;
  dueOffsetDays: number; // due = billing + offset
  freight: number;
  otherCharges: number;
  amountPaid?: number;
  description: string;
  encodedBy: string;
}

const invoiceSeeds: InvoiceSeed[] = [
  { invoiceNo: 'INV-2026-0001', clientId: 'CL-001', billingDaysAgo: 5, dueOffsetDays: 30, freight: 45000, otherCharges: 2500, amountPaid: 0, description: 'March freight services — Metro Manila routes', encodedBy: ADMIN_USER_NAME },
  { invoiceNo: 'INV-2026-0002', clientId: 'CL-002', billingDaysAgo: 8, dueOffsetDays: 30, freight: 32500, otherCharges: 1200, amountPaid: 33700, description: 'Last-mile delivery service charges', encodedBy: ADMIN_USER_NAME },
  { invoiceNo: 'INV-2026-0003', clientId: 'CL-003', billingDaysAgo: 12, dueOffsetDays: 30, freight: 28750, otherCharges: 800, amountPaid: 0, description: 'BGC route freight charges', encodedBy: ADMIN_USER_NAME },
  { invoiceNo: 'INV-2026-0004', clientId: 'CL-004', billingDaysAgo: 15, dueOffsetDays: 30, freight: 62000, otherCharges: 3500, amountPaid: 73248.4, description: 'Mall distribution freight — multiple branches', encodedBy: ADMIN_USER_NAME },
  { invoiceNo: 'INV-2026-0005', clientId: 'CL-005', billingDaysAgo: 18, dueOffsetDays: 30, freight: 19800, otherCharges: 600, amountPaid: 10000, description: 'Hub-to-hub freight services', encodedBy: ADMIN_USER_NAME },
  { invoiceNo: 'INV-2026-0006', clientId: 'CL-006', billingDaysAgo: 22, dueOffsetDays: 30, freight: 54300, otherCharges: 2100, amountPaid: 63168, description: 'Commissary route deliveries', encodedBy: ADMIN_USER_NAME },
  { invoiceNo: 'INV-2026-0007', clientId: 'CL-001', billingDaysAgo: 25, dueOffsetDays: 30, freight: 38900, otherCharges: 1500, amountPaid: 0, description: 'Bulk shipment freight charges', encodedBy: ADMIN_USER_NAME },
  { invoiceNo: 'INV-2026-0008', clientId: 'CL-002', billingDaysAgo: 28, dueOffsetDays: 30, freight: 22400, otherCharges: 900, amountPaid: 0, description: 'Express delivery freight — Cubao route', encodedBy: ADMIN_USER_NAME },
  { invoiceNo: 'INV-2026-0009', clientId: 'CL-007', billingDaysAgo: 32, dueOffsetDays: 30, freight: 48500, otherCharges: 2000, amountPaid: 0, description: 'Telco equipment freight charges', encodedBy: ADMIN_USER_NAME },
  { invoiceNo: 'INV-2026-0010', clientId: 'CL-008', billingDaysAgo: 38, dueOffsetDays: 30, freight: 41200, otherCharges: 1800, amountPaid: 0, description: 'Network equipment distribution', encodedBy: ADMIN_USER_NAME },
  { invoiceNo: 'INV-2026-0011', clientId: 'CL-003', billingDaysAgo: 42, dueOffsetDays: 30, freight: 26700, otherCharges: 1100, amountPaid: 20000, description: 'Affiliate shop deliveries — March', encodedBy: ADMIN_USER_NAME },
  { invoiceNo: 'INV-2026-0012', clientId: 'CL-009', billingDaysAgo: 48, dueOffsetDays: 30, freight: 17800, otherCharges: 500, amountPaid: 0, description: 'Retail branch distribution freight', encodedBy: ADMIN_USER_NAME },
  { invoiceNo: 'INV-2026-0013', clientId: 'CL-004', billingDaysAgo: 55, dueOffsetDays: 30, freight: 71500, otherCharges: 3200, amountPaid: 84459.2, description: 'Provincial mall freight — Visayas', encodedBy: ADMIN_USER_NAME },
  { invoiceNo: 'INV-2026-0014', clientId: 'CL-001', billingDaysAgo: 62, dueOffsetDays: 30, freight: 34900, otherCharges: 1300, amountPaid: 0, description: 'NCR route freight charges', encodedBy: ADMIN_USER_NAME },
  { invoiceNo: 'INV-2026-0015', clientId: 'CL-006', billingDaysAgo: 68, dueOffsetDays: 30, freight: 58400, otherCharges: 2400, amountPaid: 30000, description: 'Store distribution — February batch', encodedBy: ADMIN_USER_NAME },
  { invoiceNo: 'INV-2026-0016', clientId: 'CL-007', billingDaysAgo: 72, dueOffsetDays: 30, freight: 39800, otherCharges: 1600, amountPaid: 0, description: 'Backbone equipment freight', encodedBy: ADMIN_USER_NAME },
  { invoiceNo: 'INV-2026-0017', clientId: 'CL-002', billingDaysAgo: 78, dueOffsetDays: 30, freight: 28900, otherCharges: 1000, amountPaid: 0, description: 'February freight services', encodedBy: ADMIN_USER_NAME },
  { invoiceNo: 'INV-2026-0018', clientId: 'CL-005', billingDaysAgo: 85, dueOffsetDays: 30, freight: 21500, otherCharges: 700, amountPaid: 26107.2, description: 'Hub freight — late January', encodedBy: ADMIN_USER_NAME },
  { invoiceNo: 'INV-2026-0019', clientId: 'CL-008', billingDaysAgo: 92, dueOffsetDays: 30, freight: 44600, otherCharges: 1900, amountPaid: 0, description: 'Telecom hardware freight', encodedBy: ADMIN_USER_NAME },
  { invoiceNo: 'INV-2026-0020', clientId: 'CL-003', billingDaysAgo: 98, dueOffsetDays: 30, freight: 23800, otherCharges: 900, amountPaid: 0, description: 'Seller hub deliveries', encodedBy: ADMIN_USER_NAME },
  { invoiceNo: 'INV-2026-0021', clientId: 'CL-009', billingDaysAgo: 105, dueOffsetDays: 30, freight: 16700, otherCharges: 450, amountPaid: 0, description: 'Branch distribution — January', encodedBy: ADMIN_USER_NAME },
  { invoiceNo: 'INV-2026-0022', clientId: 'CL-001', billingDaysAgo: 110, dueOffsetDays: 30, freight: 37800, otherCharges: 1400, amountPaid: 0, description: 'Seller fulfillment freight', encodedBy: ADMIN_USER_NAME },
  { invoiceNo: 'INV-2026-0023', clientId: 'CL-010', billingDaysAgo: 115, dueOffsetDays: 30, freight: 14200, otherCharges: 400, amountPaid: 0, description: 'Logistics partner freight', encodedBy: ADMIN_USER_NAME },
  { invoiceNo: 'INV-2026-0024', clientId: 'CL-002', billingDaysAgo: 1, dueOffsetDays: 30, freight: 30100, otherCharges: 1000, amountPaid: 0, description: 'May freight services — early batch', encodedBy: ADMIN_USER_NAME },
  { invoiceNo: 'INV-2026-0025', clientId: 'CL-004', billingDaysAgo: 3, dueOffsetDays: 30, freight: 52600, otherCharges: 2200, amountPaid: 0, description: 'Mall restocking freight services', encodedBy: ADMIN_USER_NAME },
];

function buildInvoice(seed: InvoiceSeed): Invoice {
  const billingDate = dateAt(seed.billingDaysAgo);
  const dueDateMs = todayMs - seed.billingDaysAgo * dayMs + seed.dueOffsetDays * dayMs;
  const dueDate = new Date(dueDateMs).toISOString().slice(0, 10);
  const daysOverdue = Math.max(0, Math.floor((todayMs - dueDateMs) / dayMs));
  const isOverdue = daysOverdue > 0;
  const totals = computeInvoiceTotals(seed.freight, seed.otherCharges, isOverdue);
  const amountPaid = +(seed.amountPaid ?? 0).toFixed(2);
  const cappedPaid = Math.min(amountPaid, totals.totalAmount);
  const balance = +(totals.totalAmount - cappedPaid).toFixed(2);
  const paymentStatus = derivePaymentStatus(totals.totalAmount, cappedPaid, daysOverdue);
  const client = clients.find((c) => c.id === seed.clientId);
  return {
    id: seed.invoiceNo,
    invoiceNo: seed.invoiceNo,
    clientId: seed.clientId,
    clientName: client?.name ?? 'Unknown Client',
    billingDate,
    dueDate,
    freightCharges: seed.freight,
    otherCharges: seed.otherCharges,
    subtotal: totals.subtotal,
    vatRate: 0.12,
    vatAmount: totals.vatAmount,
    surcharge: totals.surcharge,
    totalAmount: totals.totalAmount,
    amountPaid: cappedPaid,
    balance,
    paymentStatus,
    agingBucket: getAgingBucket(daysOverdue),
    daysOverdue,
    description: seed.description,
    encodedBy: seed.encodedBy,
    dateEncoded: billingDate,
    lastUpdated: billingDate,
    updatedBy: seed.encodedBy,
    archived: false,
  };
}

export const invoices: Invoice[] = invoiceSeeds.map(buildInvoice);

interface PaymentSeed {
  orNumber: string;
  invoiceNo: string;
  daysAgo: number;
  amount: number;
  method: Payment['paymentMethod'];
  referenceNumber?: string;
  remarks?: string;
  recordedBy: string;
}

const paymentSeeds: PaymentSeed[] = [
  { orNumber: 'OR-2026-0001', invoiceNo: 'INV-2026-0002', daysAgo: 1, amount: 33700, method: 'Bank Transfer', referenceNumber: 'BPI-887211', recordedBy: ADMIN_USER_NAME },
  { orNumber: 'OR-2026-0002', invoiceNo: 'INV-2026-0004', daysAgo: 2, amount: 73248.4, method: 'Check', referenceNumber: 'CHK-449012', recordedBy: ADMIN_USER_NAME },
  { orNumber: 'OR-2026-0003', invoiceNo: 'INV-2026-0005', daysAgo: 3, amount: 10000, method: 'GCash', referenceNumber: 'GC-2026-3451', remarks: 'Partial payment', recordedBy: ADMIN_USER_NAME },
  { orNumber: 'OR-2026-0004', invoiceNo: 'INV-2026-0006', daysAgo: 4, amount: 63168, method: 'Bank Transfer', referenceNumber: 'BDO-559002', recordedBy: ADMIN_USER_NAME },
  { orNumber: 'OR-2026-0005', invoiceNo: 'INV-2026-0011', daysAgo: 7, amount: 20000, method: 'Check', referenceNumber: 'CHK-449213', remarks: 'Partial payment', recordedBy: ADMIN_USER_NAME },
  { orNumber: 'OR-2026-0006', invoiceNo: 'INV-2026-0013', daysAgo: 12, amount: 84459.2, method: 'Bank Transfer', referenceNumber: 'BPI-887445', recordedBy: ADMIN_USER_NAME },
  { orNumber: 'OR-2026-0007', invoiceNo: 'INV-2026-0015', daysAgo: 18, amount: 30000, method: 'Cash', remarks: 'Partial payment received in branch', recordedBy: ADMIN_USER_NAME },
  { orNumber: 'OR-2026-0008', invoiceNo: 'INV-2026-0018', daysAgo: 22, amount: 26107.2, method: 'GCash', referenceNumber: 'GC-2026-4012', recordedBy: ADMIN_USER_NAME },
  { orNumber: 'OR-2026-0009', invoiceNo: 'INV-2026-0002', daysAgo: 25, amount: 0, method: 'Bank Transfer', remarks: 'Pre-payment reservation', recordedBy: ADMIN_USER_NAME },
  { orNumber: 'OR-2026-0010', invoiceNo: 'INV-2026-0011', daysAgo: 30, amount: 0, method: 'Check', remarks: 'Pending bank clearing', recordedBy: ADMIN_USER_NAME },
  { orNumber: 'OR-2026-0011', invoiceNo: 'INV-2026-0004', daysAgo: 35, amount: 0, method: 'Bank Transfer', remarks: 'Reconciliation note', recordedBy: ADMIN_USER_NAME },
  { orNumber: 'OR-2026-0012', invoiceNo: 'INV-2026-0015', daysAgo: 40, amount: 0, method: 'Cash', remarks: 'Partial reminder', recordedBy: ADMIN_USER_NAME },
  { orNumber: 'OR-2026-0013', invoiceNo: 'INV-2026-0005', daysAgo: 45, amount: 0, method: 'GCash', remarks: 'Advance application', recordedBy: ADMIN_USER_NAME },
  { orNumber: 'OR-2026-0014', invoiceNo: 'INV-2026-0006', daysAgo: 55, amount: 0, method: 'Bank Transfer', remarks: 'OR re-issued', recordedBy: ADMIN_USER_NAME },
  { orNumber: 'OR-2026-0015', invoiceNo: 'INV-2026-0013', daysAgo: 60, amount: 0, method: 'Check', remarks: 'OR archived copy', recordedBy: ADMIN_USER_NAME },
];

export const payments: Payment[] = paymentSeeds
  .filter((seed) => seed.amount > 0)
  .map((seed) => {
    const invoice = invoices.find((inv) => inv.invoiceNo === seed.invoiceNo);
    const client = clients.find((c) => c.id === invoice?.clientId);
    return {
      id: seed.orNumber,
      orNumber: seed.orNumber,
      invoiceId: invoice?.id ?? seed.invoiceNo,
      invoiceNo: seed.invoiceNo,
      clientId: client?.id ?? '',
      clientName: client?.name ?? 'Unknown',
      paymentDate: dateAt(seed.daysAgo),
      amount: seed.amount,
      paymentMethod: seed.method,
      referenceNumber: seed.referenceNumber,
      remarks: seed.remarks,
      recordedBy: seed.recordedBy,
      dateRecorded: dateAt(seed.daysAgo),
    };
  });

clients.forEach((client) => {
  const clientInvoices = invoices.filter((inv) => inv.clientId === client.id);
  const totalBilled = clientInvoices.reduce((sum, inv) => sum + inv.totalAmount, 0);
  const totalPaid = clientInvoices.reduce((sum, inv) => sum + inv.amountPaid, 0);
  const currentBalance = +(totalBilled - totalPaid).toFixed(2);
  client.totalBilled = +totalBilled.toFixed(2);
  client.totalPaid = +totalPaid.toFixed(2);
  client.currentBalance = currentBalance;
  const lastInvoice = clientInvoices[clientInvoices.length - 1];
  if (lastInvoice) client.lastTransaction = lastInvoice.billingDate;
});

export const notifications: Notification[] = [
  {
    id: '1',
    type: 'alert',
    title: 'Invoice Overdue',
    invoiceNo: 'INV-2026-0009',
    description: 'PLDT Inc. invoice is 2 days past due. Total balance: PHP 56,840.00. Coordinate collection.',
    timestamp: '09:15 AM',
    date: 'May 20, 2026',
    source: 'Automated Alert',
    read: false,
    statusBadge: 'Overdue',
  },
  {
    id: '2',
    type: 'success',
    title: 'Payment Received',
    invoiceNo: 'INV-2026-0002',
    description: 'Shopee Express paid PHP 33,700.00 via Bank Transfer. OR-2026-0001 generated.',
    timestamp: '08:42 AM',
    date: 'May 20, 2026',
    source: ADMIN_USER_NAME,
    read: false,
    statusBadge: 'Paid',
  },
  {
    id: '3',
    type: 'info',
    title: 'Official Receipt Generated',
    invoiceNo: 'INV-2026-0004',
    description: 'OR-2026-0002 created for SM Supermalls. Amount: PHP 73,248.40.',
    timestamp: '10:11 AM',
    date: 'May 19, 2026',
    source: ADMIN_USER_NAME,
    read: false,
    statusBadge: 'New',
  },
  {
    id: '4',
    type: 'alert',
    title: 'Large Outstanding Balance',
    invoiceNo: 'INV-2026-0023',
    description: 'PNB Logistics current balance exceeds 90 days aging. Escalate to collections.',
    timestamp: '08:00 AM',
    date: 'May 20, 2026',
    source: 'Automated Alert',
    read: false,
    statusBadge: 'Urgent',
  },
  {
    id: '5',
    type: 'info',
    title: 'New Invoice Created',
    invoiceNo: 'INV-2026-0025',
    description: 'New invoice issued for SM Supermalls. Total: PHP 61,308.80. Due in 30 days.',
    timestamp: '11:00 AM',
    date: 'May 17, 2026',
    source: ADMIN_USER_NAME,
    read: true,
    statusBadge: 'New',
  },
  {
    id: '6',
    type: 'alert',
    title: 'Partial Payment Received',
    invoiceNo: 'INV-2026-0005',
    description: 'J&T Express partial payment PHP 10,000.00 via GCash. Outstanding: PHP 14,985.60.',
    timestamp: '02:12 PM',
    date: 'May 17, 2026',
    source: ADMIN_USER_NAME,
    read: false,
    statusBadge: 'Partially Paid',
  },
  {
    id: '7',
    type: 'system',
    title: 'Daily AR Summary',
    description: 'AR summary generated. Total outstanding: PHP 612,400.00. 9 invoices overdue. Open Reports for full breakdown.',
    timestamp: '06:59 PM',
    date: 'May 19, 2026',
    source: 'System',
    read: false,
    statusBadge: 'System',
  },
];

const ADMIN_LOG_DEFAULTS = {
  userName: ADMIN_USER_NAME,
  userRole: 'ADMIN' as const,
  userInitials: 'TG',
  userColor: '#01B574',
};

export const activityLogs: ActivityLog[] = [
  { id: '1', timestamp: 'May 20, 09:22 AM', ...ADMIN_LOG_DEFAULTS, action: 'Create Invoice', description: 'Created new invoice INV-2026-0025 for SM Supermalls', reference: 'INV-2026-0025' },
  { id: '2', timestamp: 'May 20, 08:42 AM', ...ADMIN_LOG_DEFAULTS, action: 'Record Payment', description: 'Recorded payment OR-2026-0001 from Shopee Express — PHP 33,700.00', reference: 'INV-2026-0002' },
  { id: '3', timestamp: 'May 19, 04:18 PM', ...ADMIN_LOG_DEFAULTS, action: 'Record Payment', description: 'Recorded OR-2026-0002 from SM Supermalls — PHP 73,248.40', reference: 'INV-2026-0004' },
  { id: '4', timestamp: 'May 19, 11:05 AM', ...ADMIN_LOG_DEFAULTS, action: 'Add Client', description: 'Added new client PNB Logistics (CL-010)', reference: 'CL-010' },
  { id: '5', timestamp: 'May 18, 02:45 PM', ...ADMIN_LOG_DEFAULTS, action: 'Update Invoice', description: 'Updated invoice INV-2026-0011 — adjusted other charges', reference: 'INV-2026-0011' },
  { id: '6', timestamp: 'May 18, 10:30 AM', ...ADMIN_LOG_DEFAULTS, action: 'Update Client', description: 'Updated contact info for Lazada Philippines', reference: 'CL-001' },
  { id: '7', timestamp: 'May 17, 09:14 AM', ...ADMIN_LOG_DEFAULTS, action: 'Archive', description: 'Archived paid invoice INV-2026-0099 — Globe Telecom', reference: 'INV-2026-0099' },
  { id: '8', timestamp: 'May 17, 08:50 AM', ...ADMIN_LOG_DEFAULTS, action: 'Login', description: `User ${ADMIN_USER_NAME} logged in to ARCMS` },
  { id: '9', timestamp: 'May 16, 06:00 PM', ...ADMIN_LOG_DEFAULTS, action: 'Export Report', description: 'Exported monthly Accounts Receivable report as PDF', reference: 'Report' },
  { id: '10', timestamp: 'May 15, 05:32 PM', ...ADMIN_LOG_DEFAULTS, action: 'Create Invoice', description: 'Created invoice INV-2026-0024 for Shopee Express', reference: 'INV-2026-0024' },
];

export const monthlyCollections = [
  { month: 'Dec', billed: 524000, collected: 498000 },
  { month: 'Jan', billed: 612000, collected: 540000 },
  { month: 'Feb', billed: 588000, collected: 562000 },
  { month: 'Mar', billed: 645000, collected: 590000 },
  { month: 'Apr', billed: 702000, collected: 612000 },
  { month: 'May', billed: 488000, collected: 350000 },
];
