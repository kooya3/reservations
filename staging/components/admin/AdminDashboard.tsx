"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { RefreshCw, Bell, Search, Filter, ShoppingCart, DollarSign, TrendingUp, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createColumns } from "@/components/table/columns";
import { DataTable } from "@/components/table/DataTable";
import { FixedExportData } from "./FixedExportData";
import { NewReservation } from "./NewReservation";
import { LiveTime } from "@/components/ui/real-time-clock";
import { LiveSessionIndicator } from "@/components/ui/live-session-indicator";
import { useRealtimeOrders } from "@/lib/hooks/useRealtimeOrders";

interface AdminDashboardProps {
  initialAnalytics: any;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ initialAnalytics }) => {
  const [analytics, setAnalytics] = useState(initialAnalytics);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");

  // Real-time POS orders updates
  const { isConnected: posConnected, lastUpdate: posLastUpdate } = useRealtimeOrders({
    onNewOrder: (order) => {
      console.log('🆕 New order received:', order);
      // Refresh analytics when new order comes in
      refreshData(false);

      // Show notification for new order
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('🍽️ New Order!', {
          body: `Order #${order.$id} for KSH ${order.totalAmount}`,
          icon: '/assets/icons/logo-full.svg',
          tag: `new-order-${order.$id}`,
        });
      }
    },
    onOrderUpdate: (order) => {
      console.log('🔄 Order updated:', order);
      refreshData(false);
    }
  });

  // Request notification permission on mount
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission().then((permission) => {
        console.log('📢 Notification permission:', permission);
      });
    }
  }, []);

  // Auto-refresh data every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      refreshData();
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, []);

  const refreshData = async (showLoading = false) => {
    if (showLoading) setIsRefreshing(true);

    try {
      console.log("🔄 AdminDashboard: Refreshing analytics data...");
      // Fetch both reservation and POS analytics
      const [reservationResponse, posResponse] = await Promise.all([
        fetch('/api/analytics'),
        fetch('/api/admin/analytics')
      ]);

      const reservationAnalytics = await reservationResponse.json();
      const posAnalytics = await posResponse.json();

      // Combine analytics
      const combinedAnalytics = {
        ...reservationAnalytics,
        todaysOrders: posAnalytics.success ? posAnalytics.today.orders : 0,
        todaysOrderRevenue: posAnalytics.success ? posAnalytics.today.revenue : 0,
        avgOrderValue: posAnalytics.success ? posAnalytics.today.avgOrderValue : 0,
        peakOrderTime: posAnalytics.success ? posAnalytics.peakHours.time : '7:30 PM',
        peakOrderBookings: posAnalytics.success ? posAnalytics.peakHours.orders : 0,
        topProducts: posAnalytics.success ? posAnalytics.topProducts : [],
        serverPerformance: posAnalytics.success ? posAnalytics.servers : [],
        allRecentReservations: reservationAnalytics.allRecentReservations || reservationAnalytics.recentReservations
      };

      console.log("✅ AdminDashboard: Analytics refreshed successfully");
      setAnalytics(combinedAnalytics);
      setLastUpdated(new Date());

      // Show browser notifications for new reservations and status changes
      if ('Notification' in window && Notification.permission === 'granted') {
        const newReservations = combinedAnalytics.recentReservations.filter(
          (res: any) => !analytics.recentReservations.find((existing: any) => existing.$id === res.$id)
        );

        // Check for status changes in existing reservations
        const statusChanges = combinedAnalytics.recentReservations.filter((newRes: any) => {
          const existing = analytics.recentReservations.find((existingRes: any) => existingRes.$id === newRes.$id);
          return existing && existing.status !== newRes.status;
        });

        // Notify about new reservations
        if (newReservations.length > 0) {
          newReservations.forEach((reservation: any) => {
            new Notification('🎉 New Reservation Alert!', {
              body: `${reservation.patient.name} booked a table for ${reservation.partySize || '2 guests'} on ${new Date(reservation.schedule).toLocaleDateString()}`,
              icon: '/assets/icons/logo-full.svg',
              tag: `new-reservation-${reservation.$id}`,
            });
          });
        }

        // Notify about status changes
        if (statusChanges.length > 0) {
          statusChanges.forEach((reservation: any) => {
            const statusEmoji = reservation.status === 'scheduled' ? '✅' : reservation.status === 'cancelled' ? '❌' : '⏳';
            new Notification(`${statusEmoji} Reservation Update`, {
              body: `${reservation.patient.name}'s reservation is now ${reservation.status.toUpperCase()}`,
              icon: '/assets/icons/logo-full.svg',
              tag: `status-change-${reservation.$id}`,
            });
          });
        }
      }
    } catch (error) {
      console.error('❌ AdminDashboard: Failed to refresh data:', error);

      // Show error notification to admin
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('⚠️ Data Refresh Failed', {
          body: 'Unable to fetch latest reservation data. Using cached information.',
          icon: '/assets/icons/logo-full.svg',
          tag: 'refresh-error',
        });
      }
    }

    if (showLoading) setIsRefreshing(false);
  };

  const handleReservationUpdate = () => {
    refreshData(false);
  };

  const filteredReservations = (analytics.allRecentReservations || analytics.recentReservations).filter((reservation: any) => {
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch = searchQuery === "" ||
      reservation.patient.name.toLowerCase().includes(searchLower) ||
      reservation.patient.email.toLowerCase().includes(searchLower) ||
      (reservation.patient.phone && reservation.patient.phone.toLowerCase().includes(searchLower)) ||
      (reservation.primaryPhysician && reservation.primaryPhysician.toLowerCase().includes(searchLower)) ||
      (reservation.reason && reservation.reason.toLowerCase().includes(searchLower)) ||
      (reservation.note && reservation.note.toLowerCase().includes(searchLower)) ||
      new Date(reservation.schedule).toLocaleDateString().includes(searchQuery);

    const matchesStatus = statusFilter === "all" || reservation.status === statusFilter;

    // Date filtering
    const reservationDate = new Date(reservation.schedule);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    const thisWeek = new Date(today);
    thisWeek.setDate(today.getDate() + 7);

    let matchesDate = true;
    if (dateFilter === "today") {
      matchesDate = reservationDate.toDateString() === today.toDateString();
    } else if (dateFilter === "tomorrow") {
      matchesDate = reservationDate.toDateString() === tomorrow.toDateString();
    } else if (dateFilter === "week") {
      matchesDate = reservationDate >= today && reservationDate <= thisWeek;
    } else if (dateFilter === "past") {
      matchesDate = reservationDate < today;
    }

    return matchesSearch && matchesStatus && matchesDate;
  });

  const columns = createColumns(handleReservationUpdate);

  return (
    <div className="space-y-8">
      {/* Header with Live Updates */}
      <section className="space-y-6">
        {/* Top Row - Title and Session Info */}
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white mb-3">Recent Reservations</h2>
            <div className="space-y-2">
              <p className="text-slate-400 text-sm">
                Manage and track all table bookings
              </p>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400">
                  Data updated: {lastUpdated.toLocaleTimeString()}
                </span>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Row - Controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search name, email, phone, date..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 w-64 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:border-amber-500 focus:outline-none"
              />
            </div>

            {/* Date Filter */}
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-white focus:border-amber-500 focus:outline-none"
            >
              <option value="all">All Dates</option>
              <option value="today">Today</option>
              <option value="tomorrow">Tomorrow</option>
              <option value="week">This Week</option>
              <option value="past">Past</option>
            </select>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-white focus:border-amber-500 focus:outline-none"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="scheduled">Confirmed</option>
              <option value="cancelled">Cancelled</option>
            </select>

            {/* Refresh Button */}
            <motion.div whileTap={{ scale: 0.95 }}>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => refreshData(true)}
                disabled={isRefreshing}
                className="text-slate-400 hover:text-white hover:bg-white/10 border border-slate-700 hover:border-slate-600"
              >
                <motion.div
                  animate={isRefreshing ? { rotate: 360 } : {}}
                  transition={isRefreshing ? { duration: 1, repeat: Infinity, ease: "linear" } : {}}
                >
                  <RefreshCw className="w-4 h-4" />
                </motion.div>
                <span className="ml-2">Refresh</span>
              </Button>
            </motion.div>

          </div>

          {/* Export & New Reservation */}
          <div className="flex items-center gap-3">
            <FixedExportData
              data={filteredReservations}
            />
            <NewReservation />
          </div>
        </div>
      </section>

      {/* POS Analytics Section */}
      <section className="backdrop-blur-xl bg-white/5 rounded-2xl border border-white/10 p-6">
        <h3 className="text-xl font-bold text-white mb-6">Point of Sale Analytics</h3>

        {/* POS Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          {/* Today's Orders */}
          <div className="backdrop-blur-xl bg-gradient-to-br from-indigo-500/10 to-indigo-600/10 rounded-xl border border-indigo-500/20 p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center">
                <ShoppingCart className="w-4 h-4 text-indigo-400" />
              </div>
              <span className="text-xs font-medium px-2 py-1 rounded-lg bg-indigo-500/20 text-indigo-400">
                Today
              </span>
            </div>
            <p className="text-slate-400 text-sm mb-1">Orders</p>
            <p className="text-2xl font-bold text-white">{analytics.todaysOrders || 0}</p>
          </div>

          {/* Order Revenue */}
          <div className="backdrop-blur-xl bg-gradient-to-br from-green-500/10 to-green-600/10 rounded-xl border border-green-500/20 p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="w-8 h-8 rounded-lg bg-green-500/20 flex items-center justify-center">
                <DollarSign className="w-4 h-4 text-green-400" />
              </div>
              <span className="text-xs font-medium px-2 py-1 rounded-lg bg-green-500/20 text-green-400">
                Revenue
              </span>
            </div>
            <p className="text-slate-400 text-sm mb-1">Order Revenue</p>
            <p className="text-2xl font-bold text-white">KSH {(analytics.todaysOrderRevenue || 0).toFixed(1)}K</p>
          </div>

          {/* Average Order Value */}
          <div className="backdrop-blur-xl bg-gradient-to-br from-purple-500/10 to-purple-600/10 rounded-xl border border-purple-500/20 p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-purple-400" />
              </div>
              <span className="text-xs font-medium px-2 py-1 rounded-lg bg-purple-500/20 text-purple-400">
                Average
              </span>
            </div>
            <p className="text-slate-400 text-sm mb-1">Avg Order Value</p>
            <p className="text-2xl font-bold text-white">KSH {(analytics.avgOrderValue || 0).toFixed(0)}</p>
          </div>

          {/* Peak Order Time */}
          <div className="backdrop-blur-xl bg-gradient-to-br from-orange-500/10 to-orange-600/10 rounded-xl border border-orange-500/20 p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="w-8 h-8 rounded-lg bg-orange-500/20 flex items-center justify-center">
                <Clock className="w-4 h-4 text-orange-400" />
              </div>
              <span className="text-xs font-medium px-2 py-1 rounded-lg bg-orange-500/20 text-orange-400">
                Peak Time
              </span>
            </div>
            <p className="text-slate-400 text-sm mb-1">Busiest Hour</p>
            <p className="text-2xl font-bold text-white">{analytics.peakOrderTime || '7:30 PM'}</p>
            <p className="text-xs text-slate-500 mt-1">{analytics.peakOrderBookings || 0} orders</p>
          </div>
        </div>

        {/* Top Products */}
        {analytics.topProducts && analytics.topProducts.length > 0 && (
          <div>
            <h4 className="text-lg font-semibold text-white mb-4">Top Selling Products</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {analytics.topProducts.slice(0, 6).map((product: any, index: number) => (
                <div key={product.name} className="backdrop-blur-xl bg-slate-800/50 rounded-lg border border-slate-700 p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-slate-300">#{index + 1}</span>
                    <span className="text-xs text-slate-500">{product.count} sold</span>
                  </div>
                  <p className="text-white font-medium">{product.name}</p>
                  <p className="text-sm text-green-400">KSH {product.revenue.toFixed(0)} revenue</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Server Performance */}
        {analytics.serverPerformance && analytics.serverPerformance.length > 0 && (
          <div className="mt-6">
            <h4 className="text-lg font-semibold text-white mb-4">Server Performance</h4>
            <div className="space-y-3">
              {analytics.serverPerformance.slice(0, 5).map((server: any) => (
                <div key={server.name} className="flex items-center justify-between p-3 bg-slate-800/30 rounded-lg">
                  <div>
                    <p className="text-white font-medium">{server.name}</p>
                    <p className="text-sm text-slate-400">{server.orders} orders served</p>
                  </div>
                  <div className="text-right">
                    <p className="text-green-400 font-semibold">KSH {server.revenue.toFixed(0)}</p>
                    <p className="text-xs text-slate-500">Avg: KSH {server.avgOrderValue.toFixed(0)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* Enhanced Data Table */}
      <section className="backdrop-blur-xl bg-white/5 rounded-2xl border border-white/10 p-6">
        {/* Table Stats */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-white">{filteredReservations.length}</p>
              <p className="text-xs text-slate-400">Total Reservations</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-yellow-400">
                {filteredReservations.filter((r: any) => r.status === "pending").length}
              </p>
              <p className="text-xs text-slate-400">Pending</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-400">
                {filteredReservations.filter((r: any) => r.status === "scheduled").length}
              </p>
              <p className="text-xs text-slate-400">Confirmed</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-red-400">
                {filteredReservations.filter((r: any) => r.status === "cancelled").length}
              </p>
              <p className="text-xs text-slate-400">Cancelled</p>
            </div>
          </div>

          {searchQuery || statusFilter !== "all" || dateFilter !== "all" ? (
            <div className="text-right">
              <p className="text-sm text-slate-400">
                {filteredReservations.length} of {(analytics.allRecentReservations || analytics.recentReservations).length} reservations
              </p>
              <button
                onClick={() => {
                  setSearchQuery("");
                  setStatusFilter("all");
                  setDateFilter("all");
                }}
                className="text-xs text-amber-400 hover:text-amber-300"
              >
                Clear filters
              </button>
            </div>
          ) : null}
        </div>

        {/* Data Table */}
        <div className="overflow-hidden rounded-xl border border-white/10">
          <DataTable
            columns={columns}
            data={filteredReservations}
          />
        </div>

        {/* Empty State */}
        {filteredReservations.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-slate-500" />
            </div>
            <h3 className="text-lg font-medium text-white mb-2">No reservations found</h3>
            <p className="text-slate-400 text-sm">
              {searchQuery || statusFilter !== "all"
                ? "Try adjusting your search or filter criteria"
                : "New reservations will appear here"
              }
            </p>
          </div>
        )}
      </section>
    </div>
  );
};