// PermissionRouter.jsx
import { useState, useEffect } from 'react';
import Dashboardanalysis from '../dashboard/leadsanalysis';
import AnalyticsDashboard from '../emails/analyticsDashboard';

const PermissionRouter = () => {
  const [permissions, setPermissions] = useState<any>([]);
  
  useEffect(() => {
    const storedPermissions = JSON.parse(localStorage.getItem('permissions') || '[]');
    setPermissions(storedPermissions);
  }, []);

  return permissions.includes('manage marketing') ? <AnalyticsDashboard /> : <Dashboardanalysis />;
};

export default PermissionRouter;