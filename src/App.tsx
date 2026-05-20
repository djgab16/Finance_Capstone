import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import DashboardLayout from './components/layout/DashboardLayout';
import ProtectedRoute from './components/layout/ProtectedRoute';

import Login from './pages/Login/Login';
import AccountLocked from './pages/AccountLocked/AccountLocked';

import Dashboard from './pages/Dashboard/Dashboard';

import Invoices from './pages/Invoices/Invoices';
import InvoiceDetail from './pages/Invoices/InvoiceDetail';
import InvoiceForm from './pages/Invoices/InvoiceForm';
import InvoiceHistoryLog from './pages/Invoices/InvoiceHistoryLog';

import Clients from './pages/Clients/Clients';
import ClientDetail from './pages/Clients/ClientDetail';
import ClientForm from './pages/Clients/ClientForm';

import Payments from './pages/Payments/Payments';
import PaymentForm from './pages/Payments/PaymentForm';

import AgingReport from './pages/Aging/AgingReport';
import OverdueAccounts from './pages/Overdue/OverdueAccounts';

import SearchInvoice from './pages/Search/SearchInvoice';
import Tasks from './pages/Tasks/Tasks';

import Notifications from './pages/Notification/Notifications';
import ActivityLogs from './pages/ActivityLogs/ActivityLogs';
import Archive from './pages/Archive/Archive';

import Reports from './pages/Report/Reports';
import CollectionSummary from './pages/CollectionSummary/CollectionSummary';
import AnalyticsView from './pages/Analytics/AnalyticsView';
import Settings from './pages/Settings/Settings';

const RootRedirect = () => <Navigate to="/dashboard" replace />;

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/account-locked" element={<AccountLocked />} />

        <Route element={<ProtectedRoute allowedRoles={['ADMIN', 'OP. TEAM']} />}>
          <Route element={<DashboardLayout />}>
            <Route path="/" element={<RootRedirect />} />
            <Route path="/dashboard" element={<Dashboard />} />

            <Route path="/clients" element={<Clients />} />
            <Route path="/clients/new" element={<ClientForm />} />
            <Route path="/clients/:id" element={<ClientDetail />} />
            <Route path="/clients/:id/edit" element={<ClientForm />} />

            <Route path="/invoices" element={<Invoices />} />
            <Route path="/invoices/new" element={<InvoiceForm />} />
            <Route path="/invoices/:id" element={<InvoiceDetail />} />
            <Route path="/invoices/:id/edit" element={<InvoiceForm />} />
            <Route path="/invoices/:id/history" element={<InvoiceHistoryLog />} />

            <Route path="/payments" element={<Payments />} />
            <Route path="/payments/new" element={<PaymentForm />} />

            <Route path="/aging" element={<AgingReport />} />
            <Route path="/overdue" element={<OverdueAccounts />} />

            <Route path="/search" element={<SearchInvoice />} />
            <Route path="/tasks" element={<Tasks />} />

            <Route path="/notifications" element={<Notifications />} />
            <Route path="/activity-logs" element={<ActivityLogs />} />
            <Route path="/archive" element={<Archive />} />

            <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
              <Route path="/reports" element={<Reports />} />
              <Route path="/collection-summary" element={<CollectionSummary />} />
              <Route path="/analytics" element={<AnalyticsView />} />
              <Route path="/settings" element={<Settings />} />
            </Route>
          </Route>
        </Route>

        <Route path="*" element={<RootRedirect />} />
      </Routes>
    </BrowserRouter>
  );
}
