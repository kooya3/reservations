"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { verifyStaffSession, staffLogout } from "@/lib/actions/staff.actions";

interface StaffMember {
  $id: string;
  employeeId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: string;
  department: string;
  status: string;
  permissions: string[];
  profileImage?: string;
}

interface StaffSession {
  token: string;
  expiresAt: string;
}

interface StaffAuthContextType {
  staff: StaffMember | null;
  session: StaffSession | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (staff: StaffMember, session: StaffSession) => void;
  logout: () => Promise<void>;
  hasPermission: (permission: string) => boolean;
  refreshSession: () => Promise<void>;
}

const StaffAuthContext = createContext<StaffAuthContextType | undefined>(undefined);

export const useStaffAuth = () => {
  const context = useContext(StaffAuthContext);
  if (context === undefined) {
    throw new Error("useStaffAuth must be used within a StaffAuthProvider");
  }
  return context;
};

interface StaffAuthProviderProps {
  children: ReactNode;
}

export const StaffAuthProvider: React.FC<StaffAuthProviderProps> = ({ children }) => {
  const [staff, setStaff] = useState<StaffMember | null>(null);
  const [session, setSession] = useState<StaffSession | null>(null);
  const [loading, setLoading] = useState(true);

  // Initialize auth state from localStorage and verify session
  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    try {
      // Get stored session data
      const storedSession = localStorage.getItem("staff_session");
      const storedStaff = localStorage.getItem("staff_data");

      if (!storedSession || !storedStaff) {
        setLoading(false);
        return;
      }

      const sessionData = JSON.parse(storedSession);
      const staffData = JSON.parse(storedStaff);

      // Check if session is expired
      const now = new Date();
      const expiresAt = new Date(sessionData.expiresAt);

      if (now >= expiresAt) {
        console.log("🔐 Session expired, logging out");
        await logout();
        return;
      }

      // Verify session with server
      const verification = await verifyStaffSession(sessionData.token);

      if (verification.valid) {
        console.log("✅ Session verified, user authenticated");
        setStaff(verification.staff);
        setSession(sessionData);
      } else {
        console.log("❌ Session verification failed, logging out");
        await logout();
      }

    } catch (error) {
      console.error("❌ Auth initialization failed:", error);
      await logout();
    } finally {
      setLoading(false);
    }
  };

  const login = (staffMember: StaffMember, sessionData: StaffSession) => {
    console.log("🔑 Staff logged in:", staffMember.firstName);
    setStaff(staffMember);
    setSession(sessionData);
    
    // Store in localStorage
    localStorage.setItem("staff_session", JSON.stringify(sessionData));
    localStorage.setItem("staff_data", JSON.stringify(staffMember));
  };

  const logout = async () => {
    try {
      if (session) {
        await staffLogout(session.token);
      }
    } catch (error) {
      console.error("❌ Logout error:", error);
    } finally {
      console.log("👋 Staff logged out");
      
      // Clear state
      setStaff(null);
      setSession(null);
      
      // Clear localStorage
      localStorage.removeItem("staff_session");
      localStorage.removeItem("staff_data");
    }
  };

  const hasPermission = (permission: string): boolean => {
    if (!staff) return false;
    return staff.permissions?.includes(permission) || false;
  };

  const refreshSession = async () => {
    if (!session) return;

    try {
      const verification = await verifyStaffSession(session.token);
      
      if (verification.valid) {
        setStaff(verification.staff);
        localStorage.setItem("staff_data", JSON.stringify(verification.staff));
      } else {
        await logout();
      }
    } catch (error) {
      console.error("❌ Session refresh failed:", error);
      await logout();
    }
  };

  // Auto-refresh session every 30 minutes
  useEffect(() => {
    if (!session) return;

    const interval = setInterval(refreshSession, 30 * 60 * 1000);
    return () => clearInterval(interval);
  }, [session]);

  // Auto-logout when session expires
  useEffect(() => {
    if (!session) return;

    const checkExpiration = () => {
      const now = new Date();
      const expiresAt = new Date(session.expiresAt);
      
      if (now >= expiresAt) {
        console.log("🔐 Session expired, auto-logout");
        logout();
      }
    };

    // Check every minute
    const interval = setInterval(checkExpiration, 60 * 1000);
    return () => clearInterval(interval);
  }, [session]);

  const value: StaffAuthContextType = {
    staff,
    session,
    loading,
    isAuthenticated: !!staff && !!session,
    login,
    logout,
    hasPermission,
    refreshSession,
  };

  return (
    <StaffAuthContext.Provider value={value}>
      {children}
    </StaffAuthContext.Provider>
  );
};