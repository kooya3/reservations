"use client";

import { useState, useEffect } from "react";

interface POSMetrics {
  todaysOrders: number;
  todaysOrderRevenue: number;
  avgOrderValue: number;
}

export function useLivePOSMetrics(initialData: POSMetrics, updateInterval = 30000) {
  const [data, setData] = useState(initialData);
  const [isLoading, setIsLoading] = useState(false);

  const fetchPOSData = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/admin/analytics');
      const analytics = await response.json();

      if (analytics.success) {
        setData({
          todaysOrders: analytics.today.orders || 0,
          todaysOrderRevenue: analytics.today.revenue || 0,
          avgOrderValue: analytics.today.avgOrderValue || 0
        });
      }
    } catch (error) {
      console.error('Failed to fetch POS data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const interval = setInterval(fetchPOSData, updateInterval);
    return () => clearInterval(interval);
  }, [updateInterval]);

  return { data, isLoading, refetch: fetchPOSData };
}