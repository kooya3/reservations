"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { RefreshCw, ShoppingBag, DollarSign, TrendingUp, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRealtimeOrders } from "@/lib/hooks/useRealtimeOrders";
import { formatCurrency } from "@/lib/utils";
import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then(res => res.json());

interface AdminDashboardProps {
  initialAnalytics: any;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ initialAnalytics }) => {
  const [lastUpdated, setLastUpdated] = useState(new Date());

  // Fetch real-time POS analytics
  const { data: analytics, mutate, isLoading } = useSWR(
    '/api/admin/analytics',
    fetcher,
    {
      refreshInterval: 30000, // Refresh every 30 seconds
      fallbackData: initialAnalytics
    }
  );

  // Real-time order subscriptions
  const { isConnected, lastUpdate } = useRealtimeOrders({
    onNewOrder: (order) => {
      console.log('📦 New order received:', order);
      mutate(); // Refresh analytics
      setLastUpdated(new Date());

      // Show browser notification
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('🎉 New Order!', {
          body: `Order ${order.orderNumber}: ${formatCurrency(order.totalAmount)}`,
          icon: '/assets/icons/logo-full.svg',
        });
      }
    },
    onOrderUpdate: (order) => {
      console.log('🔄 Order updated:', order);
      mutate();
      setLastUpdated(new Date());
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

  const handleRefresh = async () => {
    await mutate();
    setLastUpdated(new Date());
  };

  if (!analytics || !analytics.success) {
    return (
      <div className="space-y-8">
        <div className="backdrop-blur-xl bg-white/5 rounded-2xl border border-white/10 p-8 text-center">
          <p className="text-slate-400">Loading analytics...</p>
        </div>
      </div>
    );
  }

  const { today, revenue, peakHours, topProducts, servers } = analytics;

  return (
    <div className="space-y-8">
      {/* Header with Live Status */}
      <section className="space-y-4">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">POS Analytics</h2>
            <p className="text-slate-400 text-sm">
              Real-time order data and performance metrics
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Live Indicator */}
            <div className={`flex items-center gap-2 rounded-lg border px-4 py-2 ${isConnected
                ? 'border-green-500/20 bg-green-500/10'
                : 'border-red-500/20 bg-red-500/10'
              }`}>
              <div className={`size-2 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'
                }`} />
              <span className={`text-sm font-medium ${isConnected ? 'text-green-500' : 'text-red-500'
                }`}>
                {isConnected ? 'Live' : 'Offline'}
              </span>
            </div>

            {/* Refresh Button */}
            <motion.div whileTap={{ scale: 0.95 }}>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRefresh}
                disabled={isLoading}
                className="text-slate-400 hover:text-white hover:bg-white/10 border border-slate-700 hover:border-slate-600"
              >
                <motion.div
                  animate={isLoading ? { rotate: 360 } : {}}
                  transition={isLoading ? { duration: 1, repeat: Infinity, ease: "linear" } : {}}
                >
                  <RefreshCw className="w-4 h-4" />
                </motion.div>
                <span className="ml-2">Refresh</span>
              </Button>
            </motion.div>
          </div>
        </div>

        <div className="text-xs text-slate-400">
          Last updated: {lastUpdated.toLocaleTimeString()}
          {lastUpdate && ` • Last order: ${lastUpdate.toLocaleTimeString()}`}
        </div>
      </section>

      {/* Key Metrics Grid */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Today's Orders */}
        <div className="backdrop-blur-xl bg-gradient-to-br from-blue-500/10 to-blue-600/10 rounded-2xl border border-blue-500/20 p-6 hover:shadow-xl hover:shadow-blue-500/10 transition-all">
          <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
              <ShoppingBag className="w-6 h-6 text-blue-400" />
            </div>
          </div>
          <p className="text-slate-400 text-sm mb-1">Today's Orders</p>
          <p className="text-3xl font-bold text-white">{today.orders}</p>
          <p className="text-xs text-slate-500 mt-2">completed orders</p>
        </div>

        {/* Today's Revenue */}
        <div className="backdrop-blur-xl bg-gradient-to-br from-green-500/10 to-green-600/10 rounded-2xl border border-green-500/20 p-6 hover:shadow-xl hover:shadow-green-500/10 transition-all">
          <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-green-400" />
            </div>
          </div>
          <p className="text-slate-400 text-sm mb-1">Today's Revenue</p>
          <p className="text-3xl font-bold text-white">{formatCurrency(today.revenue)}</p>
          <p className="text-xs text-slate-500 mt-2">total sales</p>
        </div>

        {/* Avg Order Value */}
        <div className="backdrop-blur-xl bg-gradient-to-br from-purple-500/10 to-purple-600/10 rounded-2xl border border-purple-500/20 p-6 hover:shadow-xl hover:shadow-purple-500/10 transition-all">
          <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-purple-400" />
            </div>
          </div>
          <p className="text-slate-400 text-sm mb-1">Avg Order Value</p>
          <p className="text-3xl font-bold text-white">{formatCurrency(today.avgOrderValue)}</p>
          <p className="text-xs text-slate-500 mt-2">per transaction</p>
        </div>

        {/* Peak Hour */}
        <div className="backdrop-blur-xl bg-gradient-to-br from-amber-500/10 to-amber-600/10 rounded-2xl border border-amber-500/20 p-6 hover:shadow-xl hover:shadow-amber-500/10 transition-all">
          <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center">
              <Clock className="w-6 h-6 text-amber-400" />
            </div>
          </div>
          <p className="text-slate-400 text-sm mb-1">Peak Hour</p>
          <p className="text-3xl font-bold text-white">{peakHours.time}</p>
          <p className="text-xs text-slate-500 mt-2">{peakHours.orders} orders</p>
        </div>
      </section>

      {/* Top Products */}
      {topProducts && topProducts.length > 0 && (
        <section className="backdrop-blur-xl bg-white/5 rounded-2xl border border-white/10 p-6">
          <h3 className="text-lg font-bold text-white mb-4">Top Products</h3>
          <div className="space-y-3">
            {topProducts.map((product: any, index: number) => (
              <div key={index} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                    <span className="text-sm font-bold text-emerald-400">#{index + 1}</span>
                  </div>
                  <div>
                    <p className="text-white font-medium">{product.name}</p>
                    <p className="text-xs text-slate-400">{product.count} sold</p>
                  </div>
                </div>
                <p className="text-emerald-400 font-bold">{formatCurrency(product.revenue)}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Server Performance */}
      {servers && servers.length > 0 && (
        <section className="backdrop-blur-xl bg-white/5 rounded-2xl border border-white/10 p-6">
          <h3 className="text-lg font-bold text-white mb-4">Server Performance</h3>
          <div className="space-y-3">
            {servers.map((server: any, index: number) => (
              <div key={index} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                <div>
                  <p className="text-white font-medium">{server.name}</p>
                  <p className="text-xs text-slate-400">{server.orders} orders • Avg: {formatCurrency(server.avgOrderValue)}</p>
                </div>
                <p className="text-emerald-400 font-bold">{formatCurrency(server.revenue)}</p>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};