"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  LayoutDashboard,
  ShoppingCart,
  Users,
  ChefHat,
  BarChart3,
  Settings,
  User,
  Clock,
  DollarSign,
  TrendingUp,
  Coffee,
  Utensils,
  MapPin,
  Bell,
  LogOut
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { POSOrderInterface } from "./POSOrderInterface";
import { TableManagement } from "./TableManagement";
import { MenuManagement } from "./MenuManagement";
import { OrderType } from "@/types/pos.types";

type POSView = 
  | "dashboard" 
  | "orders" 
  | "tables" 
  | "menu" 
  | "kitchen" 
  | "analytics" 
  | "settings";

export const POSDashboard = () => {
  const [currentView, setCurrentView] = useState<POSView>("dashboard");
  const [selectedTable, setSelectedTable] = useState<number | null>(null);
  const [orderType, setOrderType] = useState<OrderType>(OrderType.DINE_IN);
  const [staffInfo] = useState({
    name: "Sarah Johnson",
    role: "waiter", // admin, manager, waiter, chef, cashier
    shift: "Morning Shift (9:00 AM - 5:00 PM)"
  });

  const [todayStats, setTodayStats] = useState({
    totalOrders: 47,
    totalRevenue: 125600,
    averageOrderValue: 2670,
    activeOrders: 12,
    completedOrders: 35,
    pendingPayments: 3,
    popularItem: "Grilled Salmon",
    peakTime: "1:30 PM - 2:30 PM"
  });

  const sidebarItems = [
    {
      id: "dashboard",
      label: "Dashboard", 
      icon: LayoutDashboard,
      active: currentView === "dashboard"
    },
    {
      id: "orders",
      label: "New Order",
      icon: ShoppingCart,
      active: currentView === "orders",
      badge: selectedTable ? `Table ${selectedTable}` : null
    },
    {
      id: "tables", 
      label: "Tables",
      icon: Users,
      active: currentView === "tables"
    },
    {
      id: "menu",
      label: "Menu",
      icon: Utensils,
      active: currentView === "menu",
      restricted: staffInfo.role === "waiter" || staffInfo.role === "cashier"
    },
    {
      id: "kitchen",
      label: "Kitchen",
      icon: ChefHat,
      active: currentView === "kitchen",
      badge: "8", // Active orders in kitchen
      restricted: staffInfo.role === "waiter" || staffInfo.role === "cashier"
    },
    {
      id: "analytics",
      label: "Analytics", 
      icon: BarChart3,
      active: currentView === "analytics",
      restricted: staffInfo.role === "waiter"
    },
    {
      id: "settings",
      label: "Settings",
      icon: Settings,
      active: currentView === "settings",
      restricted: staffInfo.role !== "admin" && staffInfo.role !== "manager"
    }
  ];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN'
    }).format(amount);
  };

  const handleTableSelect = (tableNumber: number) => {
    setSelectedTable(tableNumber);
    setOrderType(OrderType.DINE_IN);
    setCurrentView("orders");
  };

  const renderCurrentView = () => {
    switch (currentView) {
      case "orders":
        return (
          <POSOrderInterface
            tableNumber={selectedTable || undefined}
            orderType={orderType}
            staffName={staffInfo.name}
          />
        );
      case "tables":
        return (
          <TableManagement
            staffRole={staffInfo.role}
            onSelectTable={handleTableSelect}
          />
        );
      case "menu":
        return <MenuManagement userRole={staffInfo.role} />;
      case "kitchen":
        return <div className="text-white">Kitchen Display System - Coming Soon</div>;
      case "analytics": 
        return <div className="text-white">Advanced Analytics - Coming Soon</div>;
      case "settings":
        return <div className="text-white">System Settings - Coming Soon</div>;
      default:
        return <DashboardOverview stats={todayStats} />;
    }
  };

  return (
    <div className="h-screen flex bg-slate-900">
      {/* Sidebar */}
      <div className="w-64 bg-slate-800 border-r border-slate-700 flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-slate-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-500 rounded-lg flex items-center justify-center">
              <Coffee className="w-6 h-6 text-black" />
            </div>
            <div>
              <h2 className="text-white font-bold">Restaurant POS</h2>
              <p className="text-slate-400 text-xs">Management System</p>
            </div>
          </div>
        </div>

        {/* Staff Info */}
        <div className="p-4 border-b border-slate-700">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-slate-700 rounded-full flex items-center justify-center">
              <User className="w-4 h-4 text-slate-300" />
            </div>
            <div className="flex-1">
              <p className="text-white text-sm font-medium">{staffInfo.name}</p>
              <p className="text-slate-400 text-xs capitalize">{staffInfo.role}</p>
            </div>
            <Badge variant="secondary" className="text-xs bg-green-500/20 text-green-400">
              Online
            </Badge>
          </div>
          <div className="mt-2 text-xs text-slate-400 flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {staffInfo.shift}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4">
          <div className="space-y-2">
            {sidebarItems.map((item) => {
              if (item.restricted) return null;
              
              return (
                <button
                  key={item.id}
                  onClick={() => setCurrentView(item.id as POSView)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                    item.active
                      ? 'bg-amber-500 text-black'
                      : 'text-slate-300 hover:bg-slate-700 hover:text-white'
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="flex-1">{item.label}</span>
                  {item.badge && (
                    <Badge 
                      variant={item.active ? "secondary" : "outline"}
                      className={`text-xs ${
                        item.active ? 'bg-black/20 text-black' : 'border-slate-600 text-slate-400'
                      }`}
                    >
                      {item.badge}
                    </Badge>
                  )}
                </button>
              );
            })}
          </div>
        </nav>

        {/* Quick Actions */}
        <div className="p-4 border-t border-slate-700">
          <div className="space-y-2">
            <Button 
              variant="outline"
              size="sm"
              className="w-full justify-start text-slate-400 border-slate-600 hover:bg-slate-700"
            >
              <Bell className="w-4 h-4 mr-2" />
              Notifications
            </Button>
            <Button 
              variant="ghost"
              size="sm"
              className="w-full justify-start text-red-400 hover:bg-red-500/10 hover:text-red-300"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentView}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="h-full"
          >
            {renderCurrentView()}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

// Dashboard Overview Component
const DashboardOverview = ({ stats }: { stats: any }) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN'
    }).format(amount);
  };

  return (
    <div className="p-6 space-y-6 overflow-y-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white mb-2">Restaurant Overview</h1>
        <p className="text-slate-400">
          Today's performance • {new Date().toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm">Total Revenue</p>
              <p className="text-2xl font-bold text-white">
                {formatCurrency(stats.totalRevenue)}
              </p>
              <p className="text-green-400 text-xs flex items-center gap-1 mt-1">
                <TrendingUp className="w-3 h-3" />
                +12.5% from yesterday
              </p>
            </div>
            <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-green-400" />
            </div>
          </div>
        </div>

        <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm">Total Orders</p>
              <p className="text-2xl font-bold text-white">{stats.totalOrders}</p>
              <p className="text-amber-400 text-xs flex items-center gap-1 mt-1">
                <Clock className="w-3 h-3" />
                {stats.activeOrders} active
              </p>
            </div>
            <div className="w-12 h-12 bg-amber-500/20 rounded-lg flex items-center justify-center">
              <ShoppingCart className="w-6 h-6 text-amber-400" />
            </div>
          </div>
        </div>

        <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm">Average Order</p>
              <p className="text-2xl font-bold text-white">
                {formatCurrency(stats.averageOrderValue)}
              </p>
              <p className="text-blue-400 text-xs flex items-center gap-1 mt-1">
                <TrendingUp className="w-3 h-3" />
                +5.2% this week
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
              <BarChart3 className="w-6 h-6 text-blue-400" />
            </div>
          </div>
        </div>

        <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm">Table Occupancy</p>
              <p className="text-2xl font-bold text-white">78%</p>
              <p className="text-purple-400 text-xs flex items-center gap-1 mt-1">
                <Users className="w-3 h-3" />
                18 of 23 tables
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-purple-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity & Popular Items */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-6">
          <h3 className="text-lg font-bold text-white mb-4">Recent Orders</h3>
          <div className="space-y-3">
            {[
              { id: "ORDER-047", table: 5, amount: 3400, status: "preparing", time: "2m ago" },
              { id: "ORDER-046", table: 12, amount: 2150, status: "ready", time: "8m ago" },
              { id: "ORDER-045", table: 3, amount: 4200, status: "served", time: "15m ago" },
              { id: "ORDER-044", table: 7, amount: 1800, status: "served", time: "22m ago" }
            ].map((order) => (
              <div key={order.id} className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-amber-500/20 rounded-lg flex items-center justify-center">
                    <span className="text-amber-400 font-bold text-xs">{order.table}</span>
                  </div>
                  <div>
                    <p className="text-white font-medium text-sm">{order.id}</p>
                    <p className="text-slate-400 text-xs">Table {order.table} • {order.time}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-white font-medium">{formatCurrency(order.amount)}</p>
                  <Badge 
                    variant="secondary"
                    className={`text-xs ${
                      order.status === 'served' ? 'bg-green-500/20 text-green-400' :
                      order.status === 'ready' ? 'bg-blue-500/20 text-blue-400' :
                      'bg-amber-500/20 text-amber-400'
                    }`}
                  >
                    {order.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Popular Items */}
        <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-6">
          <h3 className="text-lg font-bold text-white mb-4">Popular Items Today</h3>
          <div className="space-y-3">
            {[
              { name: "Grilled Salmon", orders: 12, revenue: 54000 },
              { name: "Beef Tenderloin", orders: 8, revenue: 54400 },
              { name: "Caesar Salad", orders: 15, revenue: 33000 },
              { name: "Chocolate Lava Cake", orders: 10, revenue: 18000 }
            ].map((item, index) => (
              <div key={item.name} className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-amber-500/20 rounded-lg flex items-center justify-center">
                    <span className="text-amber-400 font-bold text-xs">#{index + 1}</span>
                  </div>
                  <div>
                    <p className="text-white font-medium text-sm">{item.name}</p>
                    <p className="text-slate-400 text-xs">{item.orders} orders</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-green-400 font-medium text-sm">
                    {formatCurrency(item.revenue)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Peak Times & Performance */}
      <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-6">
        <h3 className="text-lg font-bold text-white mb-4">Today's Performance</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-2">
              <Clock className="w-8 h-8 text-green-400" />
            </div>
            <h4 className="text-white font-medium">Peak Time</h4>
            <p className="text-slate-400 text-sm">{stats.peakTime}</p>
            <p className="text-green-400 text-xs">Most orders placed</p>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-amber-500/20 rounded-full flex items-center justify-center mx-auto mb-2">
              <Utensils className="w-8 h-8 text-amber-400" />
            </div>
            <h4 className="text-white font-medium">Best Seller</h4>
            <p className="text-slate-400 text-sm">{stats.popularItem}</p>
            <p className="text-amber-400 text-xs">12 orders today</p>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-2">
              <TrendingUp className="w-8 h-8 text-blue-400" />
            </div>
            <h4 className="text-white font-medium">Completion Rate</h4>
            <p className="text-slate-400 text-sm">94.3%</p>
            <p className="text-blue-400 text-xs">Orders completed on time</p>
          </div>
        </div>
      </div>
    </div>
  );
};