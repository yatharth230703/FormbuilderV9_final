import React, { createContext, useState, useContext, useEffect, ReactNode } from "react";
import { checkAdminStatus, loginAsAdmin, logoutAdmin } from "@/services/admin-api";
import { useToast } from "@/hooks/use-toast";

interface AdminContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  admin: { email: string } | null;
  login: (email: string) => Promise<boolean>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<boolean>;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export function AdminProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [admin, setAdmin] = useState<{ email: string } | null>(null);
  const { toast } = useToast();

  // Check authentication status on mount
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async (): Promise<boolean> => {
    try {
      setIsLoading(true);
      const response = await checkAdminStatus();
      
      if (response.success && response.isAuthenticated && response.user) {
        setIsAuthenticated(true);
        setAdmin({ email: response.user.email });
        return true;
      } else {
        setIsAuthenticated(false);
        setAdmin(null);
        return false;
      }
    } catch (error) {
      console.error("Failed to check authentication status:", error);
      setIsAuthenticated(false);
      setAdmin(null);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      const response = await loginAsAdmin(email);
      
      if (response.success) {
        setIsAuthenticated(true);
        setAdmin({ email });
        toast({
          title: "Login Successful",
          description: "You are now logged in as an admin",
        });
        return true;
      } else {
        toast({
          title: "Login Failed",
          description: response.message || "Invalid credentials",
          variant: "destructive",
        });
        return false;
      }
    } catch (error) {
      console.error("Login error:", error);
      toast({
        title: "Login Error",
        description: "An error occurred during login",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      setIsLoading(true);
      await logoutAdmin();
      setIsAuthenticated(false);
      setAdmin(null);
      toast({
        title: "Logged Out",
        description: "You have been logged out successfully",
      });
    } catch (error) {
      console.error("Logout error:", error);
      toast({
        title: "Logout Error",
        description: "An error occurred during logout",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AdminContext.Provider
      value={{
        isAuthenticated,
        isLoading,
        admin,
        login,
        logout,
        checkAuth,
      }}
    >
      {children}
    </AdminContext.Provider>
  );
}

export function useAdmin() {
  const context = useContext(AdminContext);
  if (context === undefined) {
    throw new Error("useAdmin must be used within an AdminProvider");
  }
  return context;
}