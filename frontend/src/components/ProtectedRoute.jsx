import { Navigate, Outlet } from 'react-router-dom';
import { api } from '../utils/api';

export default function ProtectedRoute() {
  const isAdmin = api.isAdmin();

  if (!isAdmin) {
    // If not admin, redirect to admin login
    return <Navigate to="/admin/login" replace />;
  }

  // If admin, render the child routes (nested dashboard components/pages)
  return <Outlet />;
}
