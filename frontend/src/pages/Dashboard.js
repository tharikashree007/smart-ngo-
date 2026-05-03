import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import AdminDashboard from './AdminDashboard';
import NgoDashboard from './NgoDashboard';
import DonorDashboard from './DonorDashboard';

export default function Dashboard() {
  const { user } = useContext(AuthContext);
  if (!user) return null;
  if (user.role === 'admin') return <AdminDashboard />;
  if (user.role === 'ngo') return <NgoDashboard />;
  return <DonorDashboard />;
}
