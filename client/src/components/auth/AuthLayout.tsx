import React, { useState } from 'react';
import { LoginForm } from './LoginForm';
import { RegisterForm } from './RegisterForm';
import { Button } from '@/components/ui/button';
import { useLocation } from 'wouter';

interface AuthLayoutProps {
  defaultView?: 'login' | 'register';
  redirectTo?: string;
}

export function AuthLayout({ defaultView = 'login', redirectTo = '/' }: AuthLayoutProps) {
  const [view, setView] = useState<'login' | 'register'>(defaultView);
  const [_, setLocation] = useLocation();

  const handleSuccess = () => {
    if (redirectTo) {
      setLocation(redirectTo);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-50">
      <div className="w-full max-w-md">
        <div className="mb-6 text-center">
          <h1 className="text-3xl font-bold">Form Builder</h1>
          <p className="text-gray-600">AI-powered form creation platform</p>
        </div>

        {/* Tab switching */}
        <div className="flex space-x-2 mb-6">
          <Button
            variant={view === 'login' ? 'default' : 'outline'}
            className="flex-1"
            onClick={() => setView('login')}
          >
            Login
          </Button>
          <Button
            variant={view === 'register' ? 'default' : 'outline'}
            className="flex-1"
            onClick={() => setView('register')}
          >
            Register
          </Button>
        </div>

        {/* Auth form */}
        <div className="transition-all">
          {view === 'login' ? (
            <LoginForm onSuccess={handleSuccess} onSwitchToRegister={() => setView('register')} />
          ) : (
            <RegisterForm onSuccess={handleSuccess} onSwitchToLogin={() => setView('login')} />
          )}
        </div>
      </div>
    </div>
  );
}