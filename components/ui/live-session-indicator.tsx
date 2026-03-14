"use client";

import { useState, useEffect } from 'react';
import { Activity, Wifi } from 'lucide-react';
import { RealTimeClock } from './real-time-clock';

export const LiveSessionIndicator: React.FC = () => {
  const [sessionStart] = useState(new Date());
  const [uptime, setUptime] = useState(0);
  const [connectionStatus, setConnectionStatus] = useState<'online' | 'offline'>('online');

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      const diff = Math.floor((now.getTime() - sessionStart.getTime()) / 1000);
      setUptime(diff);
    }, 1000);

    // Monitor connection status
    const checkConnection = () => {
      setConnectionStatus(navigator.onLine ? 'online' : 'offline');
    };

    window.addEventListener('online', checkConnection);
    window.addEventListener('offline', checkConnection);

    return () => {
      clearInterval(timer);
      window.removeEventListener('online', checkConnection);
      window.removeEventListener('offline', checkConnection);
    };
  }, [sessionStart]);

  const formatUptime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    } else {
      return `${secs}s`;
    }
  };

  return (
    <div className="flex items-center gap-3 text-xs">
      {/* Connection Status */}
      <div className={`flex items-center gap-2 px-3 py-2 rounded-lg backdrop-blur-sm ${
        connectionStatus === 'online' 
          ? 'bg-green-500/20 border border-green-500/30' 
          : 'bg-red-500/20 border border-red-500/30'
      }`}>
        <Wifi className={`w-3 h-3 ${
          connectionStatus === 'online' ? 'text-green-400' : 'text-red-400'
        }`} />
        <span className={`font-medium ${connectionStatus === 'online' ? 'text-green-400' : 'text-red-400'}`}>
          {connectionStatus}
        </span>
      </div>

      {/* Session Uptime */}
      <div className="flex items-center gap-2 px-3 py-2 bg-blue-500/20 border border-blue-500/30 rounded-lg backdrop-blur-sm">
        <Activity className="w-3 h-3 text-blue-400" />
        <span className="text-blue-400 font-medium">
          {formatUptime(uptime)}
        </span>
      </div>

      {/* Live Time */}
      <div className="flex items-center gap-2 px-3 py-2 bg-amber-500/20 border border-amber-500/30 rounded-lg backdrop-blur-sm">
        <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse" />
        <RealTimeClock 
          format="time" 
          className="text-amber-400 font-mono font-semibold tracking-tight"
          updateInterval={500} // Update every 500ms for smooth seconds
        />
      </div>
    </div>
  );
};