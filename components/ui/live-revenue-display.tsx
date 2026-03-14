"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { DollarSign, TrendingUp, TrendingDown, Minus } from "lucide-react";

interface LiveRevenueDisplayProps {
  initialRevenue: number;
  initialChange: string;
  updateInterval?: number;
  className?: string;
}

export const LiveRevenueDisplay: React.FC<LiveRevenueDisplayProps> = ({
  initialRevenue,
  initialChange,
  updateInterval = 60000, // Update every minute
  className = ""
}) => {
  const [revenue, setRevenue] = useState(initialRevenue);
  const [changePercent, setChangePercent] = useState(initialChange);
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  // Calculate revenue change from chart data
  const calculateRevenueChange = (chartData: Array<{ date: string; revenue: number }>) => {
    if (chartData.length < 2) return "0%";

    const sortedData = chartData.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    const today = sortedData[0]?.revenue || 0;
    const yesterday = sortedData[1]?.revenue || 0;

    if (yesterday === 0) return "0%";

    const change = ((today - yesterday) / yesterday) * 100;
    const sign = change >= 0 ? '+' : '';
    return `${sign}${change.toFixed(1)}%`;
  };

  // Fetch live revenue data
  const fetchRevenue = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/admin/analytics');
      const analytics = await response.json();

      if (analytics.success) {
        setRevenue(analytics.today.revenue || 0);
        // Calculate revenue change from chart data if available
        const changePercent = analytics.revenue?.chartData?.length > 1
          ? calculateRevenueChange(analytics.revenue.chartData)
          : "0%";
        setChangePercent(changePercent);
        setLastUpdated(new Date());
      }
    } catch (error) {
      console.error('Failed to fetch revenue data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const interval = setInterval(fetchRevenue, updateInterval);
    return () => clearInterval(interval);
  }, [updateInterval]);

  const isPositive = changePercent.includes('+');
  const isNegative = changePercent.includes('-') && !changePercent.includes('0%');
  const isNeutral = changePercent === '0%';

  const getChangeIcon = () => {
    if (isPositive) return <TrendingUp className="w-3 h-3" />;
    if (isNegative) return <TrendingDown className="w-3 h-3" />;
    return <Minus className="w-3 h-3" />;
  };

  const getChangeColor = () => {
    if (isPositive) return 'text-green-400 bg-green-500/20';
    if (isNegative) return 'text-red-400 bg-red-500/20';
    return 'text-slate-400 bg-slate-500/20';
  };

  return (
    <div className={`backdrop-blur-xl bg-gradient-to-br from-green-500/10 to-green-600/10 rounded-2xl border border-green-500/20 p-6 hover:shadow-xl hover:shadow-green-500/10 transition-all ${className}`}>
      <div className="flex items-start justify-between mb-4">
        <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center">
          <DollarSign className="w-6 h-6 text-green-400" />
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-xs font-medium px-2 py-1 rounded-lg flex items-center gap-1 ${getChangeColor()}`}>
            {getChangeIcon()}
            {changePercent} from yesterday
          </span>
          {isLoading && (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="w-3 h-3 border border-green-400 border-t-transparent rounded-full"
            />
          )}
        </div>
      </div>

      <p className="text-slate-400 text-sm mb-1">Revenue Today</p>

      <motion.p
        key={revenue}
        initial={{ scale: 1.05, opacity: 0.8 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="text-3xl font-bold text-white"
      >
        KSH {revenue.toFixed(1)}K
      </motion.p>

      <div className="flex items-center justify-between mt-2">
        <p className="text-xs text-slate-500">estimated revenue</p>
        <p className="text-xs text-slate-600">
          Updated: {lastUpdated.toLocaleTimeString()}
        </p>
      </div>
    </div>
  );
};

// Component for average check size calculation
export const LiveCheckSizeDisplay: React.FC<{
  confirmedCount: number;
  totalRevenue: number;
  updateInterval?: number;
}> = ({ confirmedCount, totalRevenue, updateInterval = 60000 }) => {
  const [avgCheckSize, setAvgCheckSize] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const calculateCheckSize = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/analytics');
      const analytics = await response.json();

      // Calculate more accurate average check size
      const confirmedReservations = analytics.recentReservations.filter(
        (r: any) => r.status === 'scheduled' || r.status === 'confirmed'
      );

      if (confirmedReservations.length > 0) {
        const totalGuests = confirmedReservations.reduce((total: number, r: any) => {
          let sizeStr = r.partySize;
          if (!sizeStr && r.note) {
            const match = r.note.match(/Party Size: ([^|]+)/);
            sizeStr = match ? match[1].trim() : "2 Guests";
          }
          if (!sizeStr) sizeStr = "2 Guests";

          const match = sizeStr.match(/\d+/);
          const guests = match ? parseInt(match[0]) : 2;
          return total + guests;
        }, 0);

        const estimated = (analytics.todaysRevenue * 1000) / totalGuests;
        setAvgCheckSize(estimated);
      } else {
        setAvgCheckSize(totalRevenue > 0 && confirmedCount > 0 ? (totalRevenue * 1000) / confirmedCount : 0);
      }
    } catch (error) {
      console.error('Failed to calculate check size:', error);
      setAvgCheckSize(totalRevenue > 0 && confirmedCount > 0 ? (totalRevenue * 1000) / confirmedCount : 0);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    calculateCheckSize();
    const interval = setInterval(calculateCheckSize, updateInterval);
    return () => clearInterval(interval);
  }, [confirmedCount, totalRevenue, updateInterval]);

  return (
    <div className="backdrop-blur-xl bg-white/5 rounded-xl border border-white/10 p-4 flex items-center gap-3">
      <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
        <DollarSign className="w-5 h-5 text-green-400" />
      </div>
      <div className="flex-1">
        <p className="text-xs text-slate-400">Avg Check Size</p>
        <div className="flex items-center gap-2">
          <motion.p
            key={avgCheckSize}
            initial={{ scale: 1.05, opacity: 0.8 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="text-lg font-semibold text-white"
          >
            KSH {(avgCheckSize / 1000).toFixed(1)}K
          </motion.p>
          {isLoading && (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="w-3 h-3 border border-green-400 border-t-transparent rounded-full"
            />
          )}
        </div>
      </div>
    </div>
  );
};