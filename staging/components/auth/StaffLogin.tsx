"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { 
  User, 
  Lock, 
  LogIn, 
  Eye, 
  EyeOff,
  ChefHat,
  AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { staffLogin } from "@/lib/actions/staff.actions";

interface StaffLoginProps {
  onLoginSuccess: (staff: any, session: any) => void;
}

export const StaffLogin: React.FC<StaffLoginProps> = ({ onLoginSuccess }) => {
  const [credentials, setCredentials] = useState({
    email: "",
    password: ""
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!credentials.email || !credentials.password) {
      setError("Please fill in all fields");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const result = await staffLogin(credentials.email, credentials.password);
      console.log("✅ Login successful:", result.staff.firstName);
      
      // Store session in localStorage
      localStorage.setItem("staff_session", JSON.stringify(result.session));
      localStorage.setItem("staff_data", JSON.stringify(result.staff));
      
      onLoginSuccess(result.staff, result.session);
      
    } catch (error: any) {
      console.error("❌ Login failed:", error);
      setError(error.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = () => {
    setCredentials({
      email: "demo@restaurant.com",
      password: "demo123"
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-amber-900 flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full space-y-8"
      >
        {/* Header */}
        <div className="text-center">
          <div className="w-16 h-16 bg-amber-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <ChefHat className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-white">Staff Portal</h2>
          <p className="text-slate-400 mt-2">Sign in to access the restaurant system</p>
        </div>

        {/* Demo Credentials */}
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle className="w-4 h-4 text-blue-400" />
            <span className="text-blue-400 font-medium text-sm">Demo Access</span>
          </div>
          <div className="text-sm text-slate-300 space-y-1">
            <p><strong>Email:</strong> demo@restaurant.com</p>
            <p><strong>Password:</strong> demo123</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleDemoLogin}
            className="mt-2 border-blue-500/50 text-blue-400 hover:bg-blue-500 hover:text-white"
          >
            Use Demo Credentials
          </Button>
        </div>

        {/* Login Form */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700 p-8"
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Field */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">Email Address</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                <input
                  type="email"
                  value={credentials.email}
                  onChange={(e) => setCredentials(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full pl-10 pr-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:border-amber-500 focus:outline-none transition-colors"
                  placeholder="Enter your email"
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={credentials.password}
                  onChange={(e) => setCredentials(prev => ({ ...prev, password: e.target.value }))}
                  className="w-full pl-10 pr-12 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:border-amber-500 focus:outline-none transition-colors"
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="bg-red-500/10 border border-red-500/20 rounded-lg p-3"
              >
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-400" />
                  <span className="text-red-400 text-sm">{error}</span>
                </div>
              </motion.div>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-amber-600 hover:bg-amber-700 text-white py-3 font-medium"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Signing in...</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <LogIn className="w-4 h-4" />
                  <span>Sign In</span>
                </div>
              )}
            </Button>
          </form>
        </motion.div>

        {/* Available Roles */}
        <div className="text-center">
          <p className="text-slate-400 text-sm mb-3">Available Staff Roles:</p>
          <div className="flex flex-wrap gap-2 justify-center">
            <Badge variant="outline" className="border-amber-500/30 text-amber-400">Manager</Badge>
            <Badge variant="outline" className="border-blue-500/30 text-blue-400">Waiter</Badge>
            <Badge variant="outline" className="border-green-500/30 text-green-400">Kitchen Staff</Badge>
            <Badge variant="outline" className="border-purple-500/30 text-purple-400">Bartender</Badge>
            <Badge variant="outline" className="border-slate-500/30 text-slate-400">Host</Badge>
          </div>
        </div>

        {/* Help Text */}
        <div className="text-center text-xs text-slate-500">
          <p>Having trouble signing in? Contact your manager for assistance.</p>
        </div>
      </motion.div>
    </div>
  );
};