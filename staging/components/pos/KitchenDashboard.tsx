"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  ChefHat,
  Clock,
  TrendingUp,
  Users,
  AlertCircle,
  CheckCircle,
  Timer,
  BarChart3,
  Settings,
  Utensils,
  Target
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { KitchenDisplaySystem } from "./KitchenDisplaySystem";
import { getKitchenAnalytics } from "@/lib/actions/pos-kitchen.actions";

interface KitchenDashboardProps {
  staffRole: string;
  staffId: string;
  staffName: string;
}

export const KitchenDashboard: React.FC<KitchenDashboardProps> = ({ 
  staffRole, 
  staffId, 
  staffName 
}) => {
  const [activeView, setActiveView] = useState<"overview" | "orders" | "analytics">("orders");
  const [analytics, setAnalytics] = useState<any>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
    
    // Refresh analytics every 5 minutes
    const interval = setInterval(loadAnalytics, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const loadAnalytics = async () => {
    try {
      const data = await getKitchenAnalytics();
      setAnalytics(data);
      console.log("✅ Kitchen analytics loaded");
    } catch (error) {
      console.error("Error loading kitchen analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  const getPerformanceColor = (percentage: number) => {
    if (percentage >= 90) return "text-green-400";
    if (percentage >= 75) return "text-amber-400";
    return "text-red-400";
  };

  const NavigationButtons = () => (
    <div className="flex bg-slate-800 rounded-lg p-1">
      {[
        { key: "overview", label: "Overview", icon: BarChart3 },
        { key: "orders", label: "Orders", icon: Utensils },
        { key: "analytics", label: "Analytics", icon: TrendingUp }
      ].map((view) => {
        const IconComponent = view.icon;
        return (
          <button
            key={view.key}
            onClick={() => setActiveView(view.key as any)}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              activeView === view.key
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

  const OverviewSection = () => (
    <div className="space-y-6">
      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Active Orders</p>
                <p className="text-2xl font-bold text-white">{analytics.currentQueueLength || 0}</p>
              </div>
              <Clock className="w-8 h-8 text-amber-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Completed Today</p>
                <p className="text-2xl font-bold text-white">{analytics.completedOrders || 0}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Avg Prep Time</p>
                <p className="text-2xl font-bold text-white">{analytics.averagePreparationTime || 0}m</p>
              </div>
              <Timer className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">On-Time Rate</p>
                <p className={`text-2xl font-bold ${getPerformanceColor(analytics.onTimeDelivery || 0)}`}>
                  {analytics.onTimeDelivery || 0}%
                </p>
              </div>
              <Target className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Status Breakdown */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Utensils className="w-5 h-5" />
            Order Status Breakdown
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-2">
                <Clock className="w-6 h-6 text-blue-400" />
              </div>
              <p className="text-2xl font-bold text-blue-400">
                {analytics.statusBreakdown?.received || 0}
              </p>
              <p className="text-xs text-slate-400">New Orders</p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-amber-500/20 rounded-full flex items-center justify-center mx-auto mb-2">
                <Timer className="w-6 h-6 text-amber-400" />
              </div>
              <p className="text-2xl font-bold text-amber-400">
                {analytics.statusBreakdown?.preparing || 0}
              </p>
              <p className="text-xs text-slate-400">Preparing</p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-2">
                <CheckCircle className="w-6 h-6 text-green-400" />
              </div>
              <p className="text-2xl font-bold text-green-400">
                {analytics.statusBreakdown?.ready || 0}
              </p>
              <p className="text-xs text-slate-400">Ready</p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-slate-500/20 rounded-full flex items-center justify-center mx-auto mb-2">
                <Users className="w-6 h-6 text-slate-400" />
              </div>
              <p className="text-2xl font-bold text-slate-400">
                {analytics.statusBreakdown?.completed || 0}
              </p>
              <p className="text-xs text-slate-400">Served</p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-2">
                <AlertCircle className="w-6 h-6 text-red-400" />
              </div>
              <p className="text-2xl font-bold text-red-400">
                {analytics.statusBreakdown?.delayed || 0}
              </p>
              <p className="text-xs text-slate-400">Delayed</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white text-sm">Today's Performance</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Orders Completed</span>
              <span className="text-white font-medium">
                {analytics.completedOrders || 0}/{analytics.totalOrders || 0}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Average Prep Time</span>
              <span className="text-white font-medium">{analytics.averagePreparationTime || 0}m</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400">On-Time Delivery</span>
              <span className={`font-medium ${getPerformanceColor(analytics.onTimeDelivery || 0)}`}>
                {analytics.onTimeDelivery || 0}%
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Delayed Orders</span>
              <span className="text-red-400 font-medium">{analytics.delayedOrders || 0}</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white text-sm">Hourly Volume</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {Object.entries(analytics.hourlyVolume || {}).map(([hour, count]) => (
                <div key={hour} className="flex items-center gap-3">
                  <span className="text-sm text-slate-400 w-12">
                    {hour.padStart(2, '0')}:00
                  </span>
                  <div className="flex-1 bg-slate-700 rounded-full h-2">
                    <div 
                      className="bg-amber-500 h-2 rounded-full"
                      style={{ 
                        width: `${Math.min(100, ((count as number) / Math.max(...Object.values(analytics.hourlyVolume || {}).map(v => v as number), 1)) * 100)}%` 
                      }}
                    />
                  </div>
                  <span className="text-sm text-white w-6">{count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-400">Loading kitchen dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-600 rounded-lg flex items-center justify-center">
              <ChefHat className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Kitchen Dashboard</h1>
              <p className="text-slate-400">Welcome back, {staffName}</p>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <NavigationButtons />
          <Button
            variant="outline"
            size="sm"
            onClick={loadAnalytics}
            className="border-slate-600"
          >
            <Settings className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Content */}
      <motion.div
        key={activeView}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {activeView === "overview" && <OverviewSection />}
        
        {activeView === "orders" && (
          <KitchenDisplaySystem 
            staffRole={staffRole} 
            staffId={staffId} 
          />
        )}
        
        {activeView === "analytics" && (
          <div className="space-y-6">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Detailed Analytics</CardTitle>
                <p className="text-slate-400">Comprehensive kitchen performance metrics</p>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <BarChart3 className="w-16 h-16 text-slate-500 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-white mb-2">Advanced Analytics</h3>
                  <p className="text-slate-400">Detailed analytics dashboard coming soon</p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </motion.div>
    </div>
  );
};