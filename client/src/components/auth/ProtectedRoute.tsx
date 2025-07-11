import React, { ReactNode } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLocation } from 'wouter';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: ReactNode;
  requireAdmin?: boolean;
}

export function ProtectedRoute({ children, requireAdmin = false }: ProtectedRouteProps) {
  const { user, isLoading } = useAuth();
  const [_, setLocation] = useLocation();

  React.useEffect(() => {
    if (!isLoading && !user) {
      // Redirect to login if not authenticated
      setLocation('/auth');
    } else if (!isLoading && requireAdmin && !user?.isAdmin) {
      // Redirect to dashboard if authenticated but not admin
      setLocation('/dashboard');
    }
  }, [user, isLoading, requireAdmin, setLocation]);

  // If loading, show a loading spinner
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // If not authenticated, don't render children yet
  if (!user) {
    return null;
  }

  // If admin is required and user is not admin, don't render children
  if (requireAdmin && !user.isAdmin) {
    return null;
  }

  // Otherwise, render children
  return <>{children}</>;
}