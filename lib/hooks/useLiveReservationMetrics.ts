"use client";

import { useState, useEffect } from "react";

interface ReservationMetrics {
  avgPartySize: string;
  partySizeChange: string;
  peakTime: string;
  peakTimeBookings: number;
  specialRequests: number;
  dietaryCount: number;
  occasionCount: number;
  confirmedCount: number;
  pendingCount: number;
  cancelledCount: number;
  occupancyRate: string;
}

export function useLiveReservationMetrics(initialData: ReservationMetrics, updateInterval = 30000) {
  const [data, setData] = useState(initialData);
  const [isLoading, setIsLoading] = useState(false);

  const fetchReservationData = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/analytics');
      const analytics = await response.json();

      setData({
        avgPartySize: analytics.avgPartySize || '2.0',
        partySizeChange: analytics.partySizeChange || '0%',
        peakTime: analytics.peakTime || '7:30 PM',
        peakTimeBookings: analytics.peakTimeBookings || 0,
        specialRequests: analytics.specialRequests || 0,
        dietaryCount: analytics.dietaryCount || 0,
        occasionCount: analytics.occasionCount || 0,
        confirmedCount: analytics.confirmedCount || 0,
        pendingCount: analytics.pendingCount || 0,
        cancelledCount: analytics.cancelledCount || 0,
        occupancyRate: analytics.occupancyRate || '0'
      });
    } catch (error) {
      console.error('Failed to fetch reservation data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const interval = setInterval(fetchReservationData, updateInterval);
    return () => clearInterval(interval);
  }, [updateInterval]);

  return { data, isLoading, refetch: fetchReservationData };
}