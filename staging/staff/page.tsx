"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  User,
  LogOut,
  Settings,
  Bell,
  Clock,
  Calendar,
  Users,
  Utensils,
  BarChart3,
  Shield,
  DollarSign
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AuthWrapper } from "@/components/auth/AuthWrapper";
import { useStaffAuth } from "@/hooks/useStaffAuth";
import { POSDashboard } from "@/components/pos/POSDashboard";
import { KitchenDashboard } from "@/components/pos/KitchenDashboard";
import { StaffManagement } from "@/components/admin/StaffManagement";

type DashboardView = "overview" | "pos" | "kitchen" | "staff" | "analytics" | "schedule";

const StaffDashboardContent = () => {
  const { staff, logout, hasPermission } = useStaffAuth();
  const [currentView, setCurrentView] = useState<DashboardView>("overview");
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleLogout = async () => {
    if (confirm("Are you sure you want to log out?")) {
      await logout();
    }
  };

  const getRoleColor = (role: string) => {
    const colors: Record<string, string> = {
      manager: "bg-purple-500/20 text-purple-400 border-purple-500/30",
      waiter: "bg-blue-500/20 text-blue-400 border-blue-500/30",
      kitchen_staff: "bg-green-500/20 text-green-400 border-green-500/30",
      bartender: "bg-amber-500/20 text-amber-400 border-amber-500/30",
      host: "bg-pink-500/20 text-pink-400 border-pink-500/30",
      admin: "bg-red-500/20 text-red-400 border-red-500/30"
    };
    return colors[role] || "bg-slate-500/20 text-slate-400 border-slate-500/30";
  };

  const getAvailableViews = () => {
    if (!staff) return [];

    const views: { key: DashboardView; label: string; icon: any; permission?: string }[] = [
      { key: "overview", label: "Dashboard", icon: BarChart3 },
    ];

    // Add role-specific views
    if (hasPermission("manage_orders") || hasPermission("manage_tables")) {
      views.push({ key: "pos", label: "Point of Sale", icon: Utensils, permission: "manage_orders" });
    }

    if (hasPermission("view_orders") || staff.role === "kitchen_staff") {
      views.push({ key: "kitchen", label: "Kitchen", icon: User, permission: "view_orders" });
    }

    if (hasPermission("manage_staff")) {
      views.push({ key: "staff", label: "Staff", icon: Users, permission: "manage_staff" });
    }

    if (hasPermission("view_analytics")) {
      views.push({ key: "analytics", label: "Analytics", icon: BarChart3, permission: "view_analytics" });
    }

    views.push({ key: "schedule", label: "Schedule", icon: Calendar });

    return views.filter(view => !view.permission || hasPermission(view.permission));
  };

  const OverviewSection = () => (
    <div className="space-y-6">
      {/* Welcome Card */}
      <Card className="bg-gradient-to-r from-amber-600/20 to-amber-800/20 border-amber-500/30">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white">
                Welcome back, {staff?.firstName}!
              </h2>
              <p className="text-amber-200">
                {currentTime.toLocaleString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>
            <div className="text-center">
              <Badge className={getRoleColor(staff?.role || "")}>
                {staff?.role.replace('_', ' ').toUpperCase()}
              </Badge>
              <p className="text-amber-200 text-sm mt-2">{staff?.department}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-400">
              Hours This Week
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold text-white">38.5</span>
              <Clock className="w-8 h-8 text-blue-500" />
            </div>
            <p className="text-xs text-slate-500 mt-2">
              Target: 40 hours
            </p>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-400">
              Today's Shift
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold text-white">9:00 AM</span>
              <Calendar className="w-8 h-8 text-green-500" />
            </div>
            <p className="text-xs text-slate-500 mt-2">
              Ends at 5:00 PM
            </p>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-400">
              This Week's Earnings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold text-white">${((staff?.hourlyWage || 0) * 38.5).toFixed(0)}</span>
              <DollarSign className="w-8 h-8 text-amber-500" />
            </div>
            <p className="text-xs text-slate-500 mt-2">
              ${staff?.hourlyWage}/hour
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {getAvailableViews().slice(1).map(view => {
              const IconComponent = view.icon;
              return (
                <Button
                  key={view.key}
                  variant="outline"
                  className="h-20 flex-col gap-2 border-slate-600 hover:bg-slate-700"
                  onClick={() => setCurrentView(view.key)}
                >
                  <IconComponent className="w-6 h-6" />
                  <span className="text-sm">{view.label}</span>
                </Button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 bg-slate-700/50 rounded-lg">
              <Clock className="w-4 h-4 text-blue-400" />
              <div>
                <p className="text-white text-sm">Clocked in at 9:00 AM</p>
                <p className="text-slate-400 text-xs">Today</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-slate-700/50 rounded-lg">
              <Utensils className="w-4 h-4 text-green-400" />
              <div>
                <p className="text-white text-sm">Served 12 orders yesterday</p>
                <p className="text-slate-400 text-xs">Total earnings: $96</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-slate-700/50 rounded-lg">
              <Bell className="w-4 h-4 text-amber-400" />
              <div>
                <p className="text-white text-sm">Schedule updated for next week</p>
                <p className="text-slate-400 text-xs">2 hours ago</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const ScheduleSection = () => (
    <Card className="bg-slate-800/50 border-slate-700">
      <CardHeader>
        <CardTitle className="text-white">My Schedule</CardTitle>
        <p className="text-slate-400">Your work schedule for this week</p>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {[
            { day: "Monday", date: "Nov 25", shift: "9:00 AM - 5:00 PM", status: "completed" },
            { day: "Tuesday", date: "Nov 26", shift: "9:00 AM - 5:00 PM", status: "today" },
            { day: "Wednesday", date: "Nov 27", shift: "9:00 AM - 5:00 PM", status: "upcoming" },
            { day: "Thursday", date: "Nov 28", shift: "Rest Day", status: "off" },
            { day: "Friday", date: "Nov 29", shift: "9:00 AM - 5:00 PM", status: "upcoming" },
            { day: "Saturday", date: "Nov 30", shift: "10:00 AM - 6:00 PM", status: "upcoming" },
            { day: "Sunday", date: "Dec 1", shift: "Rest Day", status: "off" },
          ].map((day) => (
            <div key={day.day} className={`flex items-center justify-between p-4 rounded-lg ${
              day.status === "today" ? "bg-amber-500/20 border border-amber-500/30" :
              day.status === "completed" ? "bg-green-500/10" :
              day.status === "off" ? "bg-slate-700/30" :
              "bg-slate-700/50"
            }`}>
              <div>
                <p className="text-white font-medium">{day.day}</p>
                <p className="text-slate-400 text-sm">{day.date}</p>
              </div>
              <div className="text-right">
                <p className="text-white">{day.shift}</p>
                {day.status === "today" && (
                  <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30 text-xs mt-1">
                    Today
                  </Badge>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );

  const NavigationTabs = () => (
    <div className="flex flex-wrap gap-2 bg-slate-800 rounded-lg p-1">
      {getAvailableViews().map(view => {
        const IconComponent = view.icon;
        return (
          <button
            key={view.key}
            onClick={() => setCurrentView(view.key)}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              currentView === view.key
                ? "bg-amber-600 text-white"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <IconComponent className="w-4 h-4" />
            {view.label}
          </button>
        );
      })}
    </div>
  );

  const renderCurrentView = () => {
    switch (currentView) {
      case "overview":
        return <OverviewSection />;
      case "pos":
        return <POSDashboard />;
      case "kitchen":
        return <KitchenDashboard staffRole={staff?.role || ""} staffId={staff?.$id || ""} staffName={`${staff?.firstName} ${staff?.lastName}`} />;
      case "staff":
        return <StaffManagement canManageStaff={hasPermission("manage_staff")} />;
      case "schedule":
        return <ScheduleSection />;
      case "analytics":
        return (
          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-12 text-center">
              <BarChart3 className="w-16 h-16 text-slate-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-white mb-2">Analytics Dashboard</h3>
              <p className="text-slate-400">Advanced analytics and reporting coming soon</p>
            </CardContent>
          </Card>
        );
      default:
        return <OverviewSection />;
    }
  };

  if (!staff) return null;

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Header */}
      <header className="bg-slate-800 border-b border-slate-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-amber-600 rounded-full flex items-center justify-center text-white font-medium">
              {staff.firstName[0]}{staff.lastName[0]}
            </div>
            <div>
              <h1 className="text-xl font-semibold text-white">
                {staff.firstName} {staff.lastName}
              </h1>
              <p className="text-slate-400 text-sm">
                {staff.role.replace('_', ' ')} • {staff.department}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              className="border-slate-600 text-slate-300 hover:bg-slate-700"
            >
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="border-red-600/50 text-red-400 hover:bg-red-500 hover:text-white"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <div className="px-6 py-4 border-b border-slate-700">
        <NavigationTabs />
      </div>

      {/* Main Content */}
      <main className="p-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            key={currentView}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {renderCurrentView()}
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default function StaffPage() {
  return (
    <AuthWrapper>
      <StaffDashboardContent />
    </AuthWrapper>
  );
}