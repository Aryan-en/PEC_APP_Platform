import { auth } from "@/config/firebase";
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { SuperAdminDashboard } from './dashboards/SuperAdminDashboard';
import { AdminDashboard } from './dashboards/AdminDashboard';
import { PlacementOfficerDashboard } from './dashboards/PlacementOfficerDashboard';
import { FacultyDashboard } from './dashboards/FacultyDashboard';
import { RecruiterDashboard } from './dashboards/RecruiterDashboard';
import { StudentDashboard } from './dashboards/StudentDashboard';
import { useAuth } from '@/hooks/useAuth';
import { Loader2 } from 'lucide-react';
import type { UserRole } from '@/types';

export function Dashboard() {
  const navigate = useNavigate();
  const { orgSlug } = useParams<{ orgSlug: string }>();
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [viewingOrgId, setViewingOrgId] = useState<string | null>(null);

  const { user: mockUser, loading: authLoading } = useAuth();

  useEffect(() => {
    if (authLoading) return;

    if (!mockUser) {
      navigate('/auth');
      return;
    }

    // Use the role from the mock user
    setUserRole(mockUser.role as UserRole);
    setLoading(false);
  }, [authLoading, mockUser, navigate, orgSlug]);

  if (loading || !userRole) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // Render role-based dashboard
  switch (userRole) {
    case 'super_admin':
      // Super admin always sees the super admin dashboard
      return <SuperAdminDashboard />;
    case 'college_admin':
      // College admin sees the admin dashboard for their institution
      return <AdminDashboard viewingOrgId={viewingOrgId} />;
    case 'placement_officer':
      return <PlacementOfficerDashboard />;
    case 'faculty':
      return <FacultyDashboard />;
    case 'recruiter':
      return <RecruiterDashboard />;
    case 'student':
    default:
      return <StudentDashboard />;
  }
}

export default Dashboard;
