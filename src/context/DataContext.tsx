import React, { createContext, useContext, useState, useEffect } from 'react';
import type { Employee, DeliveryOrder, Notification, ActivityLog } from '../types';
import { employees as initialEmployees, deliveryOrders as initialOrders, notifications as initialNotifications, activityLogs as initialLogs } from '../data/mockData';

interface DataContextType {
  employees: Employee[];
  deliveryOrders: DeliveryOrder[];
  notifications: Notification[];
  activityLogs: ActivityLog[];
  addEmployee: (employee: Employee) => void;
  updateEmployee: (id: string, employee: Partial<Employee>) => void;
  deleteEmployee: (id: string) => void;
  addDeliveryOrder: (order: DeliveryOrder) => void;
  updateDeliveryOrder: (id: string, order: Partial<DeliveryOrder>) => void;
  deleteDeliveryOrder: (id: string) => void;
  addNotification: (notification: Notification) => void;
  markNotificationRead: (id: string) => void;
  addActivityLog: (log: ActivityLog) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [employees, setEmployees] = useState<Employee[]>(() => {
    const saved = localStorage.getItem('speedex_employees');
    return saved ? JSON.parse(saved) : initialEmployees;
  });

  const [deliveryOrders, setDeliveryOrders] = useState<DeliveryOrder[]>(() => {
    const saved = localStorage.getItem('speedex_orders');
    return saved ? JSON.parse(saved) : initialOrders;
  });

  const [notifications, setNotifications] = useState<Notification[]>(() => {
    const saved = localStorage.getItem('speedex_notifications');
    return saved ? JSON.parse(saved) : initialNotifications;
  });

  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>(() => {
    const saved = localStorage.getItem('speedex_logs');
    return saved ? JSON.parse(saved) : initialLogs;
  });

  useEffect(() => {
    localStorage.setItem('speedex_employees', JSON.stringify(employees));
  }, [employees]);

  useEffect(() => {
    localStorage.setItem('speedex_orders', JSON.stringify(deliveryOrders));
  }, [deliveryOrders]);

  useEffect(() => {
    localStorage.setItem('speedex_notifications', JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem('speedex_logs', JSON.stringify(activityLogs));
  }, [activityLogs]);

  const addEmployee = (employee: Employee) => {
    setEmployees(prev => [...prev, employee]);
  };

  const updateEmployee = (id: string, updated: Partial<Employee>) => {
    setEmployees(prev => prev.map(emp => emp.id === id ? { ...emp, ...updated } : emp));
  };

  const deleteEmployee = (id: string) => {
    setEmployees(prev => prev.filter(emp => emp.id !== id));
  };

  const addDeliveryOrder = (order: DeliveryOrder) => {
    setDeliveryOrders(prev => [...prev, order]);
  };

  const updateDeliveryOrder = (id: string, updated: Partial<DeliveryOrder>) => {
    setDeliveryOrders(prev => prev.map(order => order.id === id ? { ...order, ...updated } : order));
  };

  const deleteDeliveryOrder = (id: string) => {
    setDeliveryOrders(prev => prev.filter(order => order.id !== id));
  };

  const addNotification = (notification: Notification) => {
    setNotifications(prev => [notification, ...prev]);
  };

  const markNotificationRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const addActivityLog = (log: ActivityLog) => {
    setActivityLogs(prev => [log, ...prev]);
  };

  return (
    <DataContext.Provider value={{
      employees,
      deliveryOrders,
      notifications,
      activityLogs,
      addEmployee,
      updateEmployee,
      deleteEmployee,
      addDeliveryOrder,
      updateDeliveryOrder,
      deleteDeliveryOrder,
      addNotification,
      markNotificationRead,
      addActivityLog
    }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
