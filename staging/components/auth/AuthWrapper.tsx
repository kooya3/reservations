"use client";

import { useEffect, useState } from "react";
import { StaffLogin } from "./StaffLogin";
import { useStaffAuth, StaffAuthProvider } from "@/hooks/useStaffAuth";

interface AuthWrapperProps {
  children: React.ReactNode;
  requiredPermission?: string;
  requiredRole?: string;
  fallbackComponent?: React.ReactNode;
}

const AuthWrapperContent: React.FC<AuthWrapperProps> = ({ 
  children, 
  requiredPermission, 
  requiredRole,
  fallbackComponent 
}) => {
  const { staff, isAuthenticated, loading, hasPermission, login } = useStaffAuth();
  
  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-400">Verifying authentication...</p>
        </div>
      </div>
    );
  }

  // Show login if not authenticated
  if (!isAuthenticated) {
    return <StaffLogin onLoginSuccess={login} />;
  }

  // Check role requirement
  if (requiredRole && staff?.role !== requiredRole) {
    return (
      fallbackComponent || (
        <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6">
          <div className="max-w-md w-full text-center">
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-6">
              <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🚫</span>
              </div>
              <h2 className="text-xl font-bold text-red-400 mb-2">Access Denied</h2>
              <p className="text-slate-400">
                This area requires <span className="text-red-400 font-medium">{requiredRole}</span> role access.
              </p>
              <p className="text-slate-500 text-sm mt-2">
                Your current role: <span className="text-slate-400">{staff?.role}</span>
              </p>
            </div>
          </div>
        </div>
      )
    );
  }

  // Check permission requirement
  if (requiredPermission && !hasPermission(requiredPermission)) {
    return (
      fallbackComponent || (
        <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6">
          <div className="max-w-md w-full text-center">
            <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-6">
              <div className="w-16 h-16 bg-amber-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">⚠️</span>
              </div>
              <h2 className="text-xl font-bold text-amber-400 mb-2">Insufficient Permissions</h2>
              <p className="text-slate-400">
                This action requires <span className="text-amber-400 font-medium">{requiredPermission}</span> permission.
              </p>
              <p className="text-slate-500 text-sm mt-2">
                Contact your manager to request access.
              </p>
            </div>
          </div>
        </div>
      )
    );
  }

  // Render children if all checks pass
  return <>{children}</>;
};

export const AuthWrapper: React.FC<AuthWrapperProps> = (props) => {
  return (
    <StaffAuthProvider>
      <AuthWrapperContent {...props} />
    </StaffAuthProvider>
  );
};