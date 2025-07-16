import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Loader2 } from "lucide-react";

type UserRole = 'admin' | 'commissioner' | 'gm' | 'user';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
  requireRole?: boolean;
}

const ProtectedRoute = ({ 
  children, 
  allowedRoles, 
  requireRole = true 
}: ProtectedRouteProps) => {
  const { user, userRole, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    } else if (!loading && user && requireRole && !userRole) {
      // User is authenticated but no role found
      console.error("User has no role assigned");
      navigate("/");
    } else if (!loading && user && userRole && allowedRoles && !allowedRoles.includes(userRole)) {
      // User doesn't have required role
      console.error(`User role ${userRole} not in allowed roles:`, allowedRoles);
      navigate("/");
    }
  }, [user, userRole, loading, navigate, allowedRoles, requireRole]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect to auth
  }

  if (requireRole && !userRole) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">No role assigned. Please contact an administrator.</p>
        </div>
      </div>
    );
  }

  if (allowedRoles && userRole && !allowedRoles.includes(userRole)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">Access denied. Insufficient permissions.</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;