// PermissionRouter.jsx
import { useState, useEffect } from 'react';
import Dashboardanalysis from '../dashboard/leadsanalysis';
import AnalyticsDashboard from '../emails/analyticsDashboard';

const PermissionRouter = () => {
  const [permissions, setPermissions] = useState<any>([]);

  useEffect(() => {
    // Load permissions from localStorage or your auth system
    const userPermissions = JSON.parse(localStorage.getItem('userPermissions') || '[]');
    setPermissions(userPermissions);
  }, []);

  return permissions.includes('manage marketing') ? <AnalyticsDashboard /> : <Dashboardanalysis />;
};

export default PermissionRouter;