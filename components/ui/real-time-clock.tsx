"use client";

import { useState, useEffect } from 'react';

interface RealTimeClockProps {
  format?: 'time' | 'date' | 'datetime' | 'full';
  className?: string;
  updateInterval?: number; // in milliseconds
}

export const RealTimeClock: React.FC<RealTimeClockProps> = ({
  format = 'time',
  className = '',
  updateInterval = 1000
}) => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, updateInterval);

    return () => clearInterval(timer);
  }, [updateInterval]);

  const formatTime = (date: Date): string => {
    switch (format) {
      case 'time':
        return date.toLocaleTimeString('en-US', { 
          hour: '2-digit', 
          minute: '2-digit',
          second: '2-digit'
        });
      case 'date':
        return date.toLocaleDateString('en-US', { 
          weekday: 'short', 
          month: 'short', 
          day: 'numeric',
          year: 'numeric'
        });
      case 'datetime':
        return date.toLocaleString('en-US', { 
          hour: '2-digit', 
          minute: '2-digit',
          month: 'short',
          day: 'numeric'
        });
      case 'full':
        return date.toLocaleString('en-US', { 
          weekday: 'short',
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit', 
          minute: '2-digit',
          second: '2-digit'
        });
      default:
        return date.toLocaleTimeString();
    }
  };

  return (
    <span className={className}>
      {formatTime(currentTime)}
    </span>
  );
};

// Specialized components for common use cases
export const LiveTime: React.FC<{ className?: string }> = ({ className }) => (
  <RealTimeClock format="time" className={className} />
);

export const LiveDate: React.FC<{ className?: string }> = ({ className }) => (
  <RealTimeClock format="date" className={className} />
);

export const LiveDateTime: React.FC<{ className?: string }> = ({ className }) => (
  <RealTimeClock format="datetime" className={className} />
);

export const LiveFullDateTime: React.FC<{ className?: string }> = ({ className }) => (
  <RealTimeClock format="full" className={className} />
);