import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import DashboardLayout from './components/layout/DashboardLayout';
import ProtectedRoute from './components/layout/ProtectedRoute';
import Login from './pages/Login/Login';
import AccountLocked from './pages/AccountLocked/AccountLocked';
import Dashboard from './pages/Dashboard/Dashboard';
import DeliveryOrders from './pages/DeliveryOrders/DeliveryOrders';
import DeliveryOrderDetail from './pages/DeliveryOrders/DeliveryOrderDetail';
import EditDeliveryOrder from './pages/EditDelivery/EditDeliveryOrder';
import TrackDelivery from './pages/TrackDelivery/TrackDelivery';
import Notifications from './pages/Notification/Notifications';
import Reports from './pages/Report/Reports';
import Archive from './pages/Archive/Archive';
import ActivityLogs from './pages/ActivityLogs/ActivityLogs';
import FailedPickups from './pages/FailedPickups/FailedPickups';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Auth Pages (no sidebar) */}
        <Route path="/login" element={<Login />} />
        <Route path="/account-locked" element={<AccountLocked />} />

        {/* Protected Dashboard Pages (with sidebar) */}
        <Route element={<ProtectedRoute />}>
          <Route element={<DashboardLayout />}>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/delivery-orders" element={<DeliveryOrders />} />
            <Route path="/delivery-orders/:id" element={<DeliveryOrderDetail />} />
            <Route path="/delivery-orders/:id/edit" element={<EditDeliveryOrder />} />
            <Route path="/track" element={<TrackDelivery />} />
            <Route path="/pod-records" element={<DeliveryOrders />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/search-waybill" element={<TrackDelivery />} />
            <Route path="/archive" element={<Archive />} />
            <Route path="/employees" element={<DeliveryOrders />} />
            <Route path="/tasks" element={<DeliveryOrders />} />
            <Route path="/role-access" element={<Reports />} />
            <Route path="/delivery-summary" element={<Reports />} />
            <Route path="/analytics" element={<Reports />} />
            <Route path="/settings" element={<ActivityLogs />} />
            <Route path="/activity-logs" element={<ActivityLogs />} />
            <Route path="/failed-pickups" element={<FailedPickups />} />
            <Route path="/notifications" element={<Notifications />} />
          </Route>
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
