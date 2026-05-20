import React, { createContext, useContext, useState, useEffect } from 'react';
import type { Employee, Client, Invoice, Payment, Notification, ActivityLog } from '../types';
import {
  employees as initialEmployees,
  clients as initialClients,
  invoices as initialInvoices,
  payments as initialPayments,
  notifications as initialNotifications,
  activityLogs as initialLogs,
} from '../data/mockData';
import { derivePaymentStatus, getAgingBucket, getDaysOverdue } from '../utils/finance';

interface DataContextType {
  employees: Employee[];
  clients: Client[];
  invoices: Invoice[];
  payments: Payment[];
  notifications: Notification[];
  activityLogs: ActivityLog[];

  addEmployee: (employee: Employee) => void;
  updateEmployee: (id: string, employee: Partial<Employee>) => void;
  deleteEmployee: (id: string) => void;

  addClient: (client: Client) => void;
  updateClient: (id: string, client: Partial<Client>) => void;
  deleteClient: (id: string) => void;

  addInvoice: (invoice: Invoice) => void;
  updateInvoice: (id: string, invoice: Partial<Invoice>) => void;
  deleteInvoice: (id: string) => void;
  archiveInvoice: (id: string, archived?: boolean) => void;

  recordPayment: (payment: Payment) => void;
  deletePayment: (id: string) => void;

  addNotification: (notification: Notification) => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  deleteNotification: (id: string) => void;
  clearAllNotifications: () => void;
  addActivityLog: (log: ActivityLog) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

const STORAGE_KEYS = {
  employees: 'arcms_employees',
  clients: 'arcms_clients',
  invoices: 'arcms_invoices',
  payments: 'arcms_payments',
  notifications: 'arcms_notifications',
  logs: 'arcms_logs',
};

const LEGACY_KEYS = [
  'speedex_orders',
  'speedex_logs',
  'speedex_employees',
  'speedex_notifications',
  'speedex_user',
];

const MIGRATION_FLAG = 'arcms_migrated_v1';

if (typeof window !== 'undefined' && !localStorage.getItem(MIGRATION_FLAG)) {
  LEGACY_KEYS.forEach((key) => localStorage.removeItem(key));
  localStorage.setItem(MIGRATION_FLAG, '1');
}

function loadOrInit<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const saved = localStorage.getItem(key);
    return saved ? (JSON.parse(saved) as T) : fallback;
  } catch {
    return fallback;
  }
}

function recalcInvoice(invoice: Invoice): Invoice {
  const daysOverdue = getDaysOverdue(invoice.dueDate);
  const balance = +(invoice.totalAmount - invoice.amountPaid).toFixed(2);
  const paymentStatus = derivePaymentStatus(invoice.totalAmount, invoice.amountPaid, daysOverdue);
  return {
    ...invoice,
    balance,
    daysOverdue,
    agingBucket: getAgingBucket(daysOverdue),
    paymentStatus,
  };
}

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [employees, setEmployees] = useState<Employee[]>(() => loadOrInit(STORAGE_KEYS.employees, initialEmployees));
  const [clients, setClients] = useState<Client[]>(() => loadOrInit(STORAGE_KEYS.clients, initialClients));
  const [invoices, setInvoices] = useState<Invoice[]>(() => loadOrInit(STORAGE_KEYS.invoices, initialInvoices));
  const [payments, setPayments] = useState<Payment[]>(() => loadOrInit(STORAGE_KEYS.payments, initialPayments));
  const [notifications, setNotifications] = useState<Notification[]>(() => initialNotifications);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>(() => loadOrInit(STORAGE_KEYS.logs, initialLogs));

  useEffect(() => { localStorage.setItem(STORAGE_KEYS.employees, JSON.stringify(employees)); }, [employees]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.clients, JSON.stringify(clients)); }, [clients]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.invoices, JSON.stringify(invoices)); }, [invoices]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.payments, JSON.stringify(payments)); }, [payments]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.notifications, JSON.stringify(notifications)); }, [notifications]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.logs, JSON.stringify(activityLogs)); }, [activityLogs]);

  const addEmployee = (employee: Employee) => setEmployees((prev) => [...prev, employee]);
  const updateEmployee = (id: string, updated: Partial<Employee>) =>
    setEmployees((prev) => prev.map((emp) => (emp.id === id ? { ...emp, ...updated } : emp)));
  const deleteEmployee = (id: string) => setEmployees((prev) => prev.filter((emp) => emp.id !== id));

  const recalcClientBalances = (clientId: string, allInvoices: Invoice[]) => {
    const clientInvoices = allInvoices.filter((inv) => inv.clientId === clientId);
    const totalBilled = clientInvoices.reduce((sum, inv) => sum + inv.totalAmount, 0);
    const totalPaid = clientInvoices.reduce((sum, inv) => sum + inv.amountPaid, 0);
    const currentBalance = +(totalBilled - totalPaid).toFixed(2);
    setClients((prev) =>
      prev.map((c) =>
        c.id === clientId
          ? {
              ...c,
              totalBilled: +totalBilled.toFixed(2),
              totalPaid: +totalPaid.toFixed(2),
              currentBalance,
              lastTransaction: new Date().toISOString().slice(0, 10),
            }
          : c,
      ),
    );
  };

  const addClient = (client: Client) => setClients((prev) => [...prev, client]);
  const updateClient = (id: string, updated: Partial<Client>) =>
    setClients((prev) => prev.map((c) => (c.id === id ? { ...c, ...updated } : c)));
  const deleteClient = (id: string) => setClients((prev) => prev.filter((c) => c.id !== id));

  const addInvoice = (invoice: Invoice) => {
    const final = recalcInvoice(invoice);
    setInvoices((prev) => {
      const next = [final, ...prev];
      recalcClientBalances(final.clientId, next);
      return next;
    });
  };

  const updateInvoice = (id: string, updated: Partial<Invoice>) => {
    setInvoices((prev) => {
      const next = prev.map((inv) => (inv.id === id ? recalcInvoice({ ...inv, ...updated }) : inv));
      const target = next.find((inv) => inv.id === id);
      if (target) recalcClientBalances(target.clientId, next);
      return next;
    });
  };

  const deleteInvoice = (id: string) => {
    setInvoices((prev) => {
      const target = prev.find((inv) => inv.id === id);
      const next = prev.filter((inv) => inv.id !== id);
      if (target) recalcClientBalances(target.clientId, next);
      return next;
    });
  };

  const archiveInvoice = (id: string, archived: boolean = true) => {
    setInvoices((prev) => prev.map((inv) => (inv.id === id ? { ...inv, archived } : inv)));
  };

  const recordPayment = (payment: Payment) => {
    setPayments((prev) => [payment, ...prev]);
    setInvoices((prev) => {
      const next = prev.map((inv) => {
        if (inv.id !== payment.invoiceId && inv.invoiceNo !== payment.invoiceNo) return inv;
        const newAmountPaid = +(inv.amountPaid + payment.amount).toFixed(2);
        return recalcInvoice({
          ...inv,
          amountPaid: Math.min(newAmountPaid, inv.totalAmount),
          lastUpdated: new Date().toISOString(),
          updatedBy: payment.recordedBy,
        });
      });
      const target = next.find((inv) => inv.id === payment.invoiceId || inv.invoiceNo === payment.invoiceNo);
      if (target) recalcClientBalances(target.clientId, next);
      return next;
    });
  };

  const deletePayment = (id: string) => {
    const target = payments.find((p) => p.id === id);
    setPayments((prev) => prev.filter((p) => p.id !== id));
    if (target) {
      setInvoices((prev) => {
        const next = prev.map((inv) => {
          if (inv.id !== target.invoiceId && inv.invoiceNo !== target.invoiceNo) return inv;
          const newAmountPaid = Math.max(0, +(inv.amountPaid - target.amount).toFixed(2));
          return recalcInvoice({ ...inv, amountPaid: newAmountPaid });
        });
        const inv = next.find((i) => i.id === target.invoiceId || i.invoiceNo === target.invoiceNo);
        if (inv) recalcClientBalances(inv.clientId, next);
        return next;
      });
    }
  };

  const addNotification = (notification: Notification) =>
    setNotifications((prev) => [notification, ...prev]);
  const markNotificationRead = (id: string) =>
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  const markAllNotificationsRead = () => setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  const deleteNotification = (id: string) => setNotifications((prev) => prev.filter((n) => n.id !== id));
  const clearAllNotifications = () => setNotifications([]);
  const addActivityLog = (log: ActivityLog) => setActivityLogs((prev) => [log, ...prev]);

  return (
    <DataContext.Provider
      value={{
        employees,
        clients,
        invoices,
        payments,
        notifications,
        activityLogs,
        addEmployee,
        updateEmployee,
        deleteEmployee,
        addClient,
        updateClient,
        deleteClient,
        addInvoice,
        updateInvoice,
        deleteInvoice,
        archiveInvoice,
        recordPayment,
        deletePayment,
        addNotification,
        markNotificationRead,
        markAllNotificationsRead,
        deleteNotification,
        clearAllNotifications,
        addActivityLog,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
