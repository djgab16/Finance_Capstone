import type { AgingBucket, PaymentStatus } from '../types';

export const VAT_RATE = 0.12;
export const SURCHARGE_RATE = 0.05;

export interface InvoiceTotals {
  subtotal: number;
  vatAmount: number;
  surcharge: number;
  totalAmount: number;
}

export function computeInvoiceTotals(
  freight: number,
  otherCharges: number,
  isOverdue: boolean,
  vatRate: number = VAT_RATE,
): InvoiceTotals {
  const safeFreight = Number.isFinite(freight) ? freight : 0;
  const safeOther = Number.isFinite(otherCharges) ? otherCharges : 0;
  const subtotal = safeFreight + safeOther;
  const vatAmount = +(subtotal * vatRate).toFixed(2);
  const surcharge = isOverdue ? +((subtotal + vatAmount) * SURCHARGE_RATE).toFixed(2) : 0;
  const totalAmount = +(subtotal + vatAmount + surcharge).toFixed(2);
  return { subtotal: +subtotal.toFixed(2), vatAmount, surcharge, totalAmount };
}

export function getAgingBucket(daysOverdue: number): AgingBucket {
  if (daysOverdue <= 0) return 'Current';
  if (daysOverdue <= 30) return '1-30';
  if (daysOverdue <= 60) return '31-60';
  if (daysOverdue <= 90) return '61-90';
  return '90+';
}

export function getDaysOverdue(dueDate: string, asOf: Date = new Date()): number {
  const due = new Date(dueDate);
  if (Number.isNaN(due.getTime())) return 0;
  const msPerDay = 1000 * 60 * 60 * 24;
  const diff = Math.floor((asOf.getTime() - due.getTime()) / msPerDay);
  return diff > 0 ? diff : 0;
}

export function derivePaymentStatus(
  totalAmount: number,
  amountPaid: number,
  daysOverdue: number,
): PaymentStatus {
  const balance = +(totalAmount - amountPaid).toFixed(2);
  if (balance <= 0) return 'Paid';
  if (amountPaid > 0) return 'Partially Paid';
  if (daysOverdue > 0) return 'Overdue';
  return 'Unpaid';
}

const phpFormatter = new Intl.NumberFormat('en-PH', {
  style: 'currency',
  currency: 'PHP',
});

export function formatCurrency(value: number): string {
  const safe = Number.isFinite(value) ? value : 0;
  return phpFormatter.format(safe);
}

export function currencyTooltipFormatter(value: unknown): string {
  const num = typeof value === 'number' ? value : Number(value);
  return formatCurrency(Number.isFinite(num) ? num : 0);
}

export function formatDate(value: string | Date): string {
  const d = typeof value === 'string' ? new Date(value) : value;
  if (Number.isNaN(d.getTime())) return String(value);
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

export function downloadCSV(filename: string, rows: (string | number)[][]): void {
  const escape = (val: string | number) => {
    const str = String(val ?? '');
    if (/[",\n]/.test(str)) return '"' + str.replace(/"/g, '""') + '"';
    return str;
  };
  const csv = rows.map((row) => row.map(escape).join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename.endsWith('.csv') ? filename : `${filename}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

let __idCounter = 0;
export function generateId(prefix: string = 'id'): string {
  __idCounter += 1;
  const time = new Date().getTime();
  return `${prefix}-${time}-${__idCounter}`;
}

export function printElement(elementId?: string): void {
  if (!elementId) {
    window.print();
    return;
  }
  const node = document.getElementById(elementId);
  if (!node) {
    window.print();
    return;
  }
  const printWindow = window.open('', '_blank', 'width=1024,height=768');
  if (!printWindow) {
    window.print();
    return;
  }
  printWindow.document.write(`<!doctype html><html><head><title>Print</title>`);
  document.querySelectorAll('link[rel="stylesheet"], style').forEach((tag) => {
    printWindow.document.write(tag.outerHTML);
  });
  printWindow.document.write(`</head><body>${node.outerHTML}</body></html>`);
  printWindow.document.close();
  printWindow.focus();
  setTimeout(() => {
    printWindow.print();
    printWindow.close();
  }, 300);
}
