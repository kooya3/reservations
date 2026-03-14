"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Users, 
  UserPlus, 
  UserCheck, 
  Trophy, 
  TrendingUp,
  Heart,
  Calendar,
  DollarSign
} from "lucide-react";

interface TopGuest {
  name: string;
  visits: number;
  totalSpent: number;
  lastVisit: Date;
  occasions: string[];
}

interface GuestAnalyticsDisplayProps {
  initialData: {
    repeatGuestRate: string;
    newGuestsToday: number;
    returningGuestsToday: number;
    totalUniqueGuests: number;
    avgVisitsPerGuest: string;
    topGuests: TopGuest[];
  };
  updateInterval?: number;
}

export const GuestAnalyticsDisplay: React.FC<GuestAnalyticsDisplayProps> = ({
  initialData,
  updateInterval = 60000
}) => {
  const [data, setData] = useState(initialData);
  const [isLoading, setIsLoading] = useState(false);

  const fetchGuestAnalytics = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/analytics');
      const analytics = await response.json();
      
      setData({
        repeatGuestRate: analytics.repeatGuestRate,
        newGuestsToday: analytics.newGuestsToday,
        returningGuestsToday: analytics.returningGuestsToday,
        totalUniqueGuests: analytics.totalUniqueGuests,
        avgVisitsPerGuest: analytics.avgVisitsPerGuest,
        topGuests: analytics.topGuests
      });
    } catch (error) {
      console.error('Failed to fetch guest analytics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const interval = setInterval(fetchGuestAnalytics, updateInterval);
    return () => clearInterval(interval);
  }, [updateInterval]);

  return (
    <section className="space-y-6">
      {/* Guest Analytics Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold text-white mb-2">Guest Analytics</h3>
          <p className="text-slate-400 text-sm">Track customer loyalty and retention</p>
        </div>
        {isLoading && (
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-5 h-5 border border-amber-400 border-t-transparent rounded-full"
          />
        )}
      </div>

      {/* Guest Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Repeat Guest Rate */}
        <div className="backdrop-blur-xl bg-gradient-to-br from-purple-500/10 to-purple-600/10 rounded-xl border border-purple-500/20 p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
              <Heart className="w-5 h-5 text-purple-400" />
            </div>
          </div>
          <p className="text-slate-400 text-xs mb-1">Repeat Guest Rate</p>
          <motion.p
            key={data.repeatGuestRate}
            initial={{ scale: 1.1, opacity: 0.8 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="text-2xl font-bold text-purple-400"
          >
            {data.repeatGuestRate}%
          </motion.p>
          <p className="text-xs text-slate-500 mt-1">customer loyalty</p>
        </div>

        {/* New Guests Today */}
        <div className="backdrop-blur-xl bg-gradient-to-br from-blue-500/10 to-blue-600/10 rounded-xl border border-blue-500/20 p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
              <UserPlus className="w-5 h-5 text-blue-400" />
            </div>
          </div>
          <p className="text-slate-400 text-xs mb-1">New Guests Today</p>
          <motion.p
            key={data.newGuestsToday}
            initial={{ scale: 1.1, opacity: 0.8 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="text-2xl font-bold text-blue-400"
          >
            {data.newGuestsToday}
          </motion.p>
          <p className="text-xs text-slate-500 mt-1">first-time diners</p>
        </div>

        {/* Returning Guests Today */}
        <div className="backdrop-blur-xl bg-gradient-to-br from-green-500/10 to-green-600/10 rounded-xl border border-green-500/20 p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
              <UserCheck className="w-5 h-5 text-green-400" />
            </div>
          </div>
          <p className="text-slate-400 text-xs mb-1">Returning Today</p>
          <motion.p
            key={data.returningGuestsToday}
            initial={{ scale: 1.1, opacity: 0.8 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="text-2xl font-bold text-green-400"
          >
            {data.returningGuestsToday}
          </motion.p>
          <p className="text-xs text-slate-500 mt-1">loyal customers</p>
        </div>

        {/* Average Visits */}
        <div className="backdrop-blur-xl bg-gradient-to-br from-amber-500/10 to-amber-600/10 rounded-xl border border-amber-500/20 p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-amber-400" />
            </div>
          </div>
          <p className="text-slate-400 text-xs mb-1">Avg Visits/Guest</p>
          <motion.p
            key={data.avgVisitsPerGuest}
            initial={{ scale: 1.1, opacity: 0.8 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="text-2xl font-bold text-amber-400"
          >
            {data.avgVisitsPerGuest}
          </motion.p>
          <p className="text-xs text-slate-500 mt-1">engagement rate</p>
        </div>
      </div>

      {/* Top Guests Section */}
      {data.topGuests.length > 0 && (
        <div className="backdrop-blur-xl bg-white/5 rounded-xl border border-white/10 p-6">
          <div className="flex items-center gap-2 mb-4">
            <Trophy className="w-5 h-5 text-yellow-400" />
            <h4 className="text-lg font-semibold text-white">Top Guests</h4>
            <span className="text-xs text-slate-500">by visit frequency</span>
          </div>

          <div className="space-y-3">
            {data.topGuests.map((guest, index) => (
              <motion.div
                key={guest.name}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/5 hover:bg-white/10 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                    index === 0 ? 'bg-yellow-500/20 text-yellow-400' :
                    index === 1 ? 'bg-slate-500/20 text-slate-400' :
                    index === 2 ? 'bg-orange-500/20 text-orange-400' :
                    'bg-purple-500/20 text-purple-400'
                  }`}>
                    {index + 1}
                  </div>
                  <div>
                    <p className="text-white font-medium text-sm">{guest.name}</p>
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                      <span>{guest.visits} visits</span>
                      <span>•</span>
                      <span>KSH {(guest.totalSpent / 1000).toFixed(1)}K spent</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-slate-500">Last visit</p>
                  <p className="text-xs text-white">
                    {new Date(guest.lastVisit).toLocaleDateString()}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Guest Insights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="backdrop-blur-xl bg-white/5 rounded-xl border border-white/10 p-4">
          <div className="flex items-center gap-2 mb-3">
            <Users className="w-4 h-4 text-blue-400" />
            <h5 className="text-sm font-medium text-white">Total Guests</h5>
          </div>
          <p className="text-2xl font-bold text-white">{data.totalUniqueGuests}</p>
          <p className="text-xs text-slate-500 mt-1">unique customers served</p>
        </div>

        <div className="backdrop-blur-xl bg-white/5 rounded-xl border border-white/10 p-4">
          <div className="flex items-center gap-2 mb-3">
            <Calendar className="w-4 h-4 text-green-400" />
            <h5 className="text-sm font-medium text-white">Today's Split</h5>
          </div>
          <div className="flex items-center gap-4">
            <div>
              <p className="text-lg font-bold text-blue-400">{data.newGuestsToday}</p>
              <p className="text-xs text-slate-500">new</p>
            </div>
            <div className="w-px h-8 bg-slate-600" />
            <div>
              <p className="text-lg font-bold text-green-400">{data.returningGuestsToday}</p>
              <p className="text-xs text-slate-500">returning</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};