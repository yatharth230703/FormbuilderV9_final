import React from 'react';
import { AuthLayout } from '@/components/auth/AuthLayout';
import { useAuth } from '@/contexts/AuthContext';
import { useLocation } from 'wouter';
import { Loader2 } from 'lucide-react';

export function AuthPage() {
  const { user, isLoading } = useAuth();
  const [_, setLocation] = useLocation();

  // If already authenticated, redirect to dashboard
  React.useEffect(() => {
    if (user && !isLoading) {
      setLocation('/');
    }
  }, [user, isLoading, setLocation]);

  // If loading, show a loading spinner
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // If not authenticated, show auth forms
  return <AuthLayout redirectTo="/" />;
}