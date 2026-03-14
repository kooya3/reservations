"use client";

import { useEffect, useState, useRef } from 'react';

interface PerformanceMetrics {
  loadTime: number;
  renderTime: number;
  interactionReady: number;
  memoryUsage?: number;
  connectionType?: string;
  isSlowConnection?: boolean;
}

interface PerformanceHook {
  metrics: PerformanceMetrics | null;
  isLoading: boolean;
  optimizeForConnection: boolean;
  reportPerfIssue: (issue: string) => void;
}

export const usePagePerformance = (): PerformanceHook => {
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [optimizeForConnection, setOptimizeForConnection] = useState(false);
  const startTimeRef = useRef(Date.now());
  const renderStartRef = useRef(Date.now());

  useEffect(() => {
    // Track initial render time
    renderStartRef.current = Date.now();

    // Check connection type and speed
    const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
    const isSlowConnection = connection ? 
      connection.effectiveType === '2g' || 
      connection.effectiveType === 'slow-2g' ||
      connection.downlink < 1.5 : false;

    setOptimizeForConnection(isSlowConnection);

    // Measure performance metrics
    const measurePerformance = () => {
      const loadTime = Date.now() - startTimeRef.current;
      const renderTime = Date.now() - renderStartRef.current;
      
      // Get memory usage if available
      const memoryInfo = (performance as any).memory;
      const memoryUsage = memoryInfo ? memoryInfo.usedJSHeapSize : undefined;

      const performanceMetrics: PerformanceMetrics = {
        loadTime,
        renderTime,
        interactionReady: Date.now(),
        memoryUsage,
        connectionType: connection?.effectiveType || 'unknown',
        isSlowConnection
      };

      setMetrics(performanceMetrics);
      setIsLoading(false);

      // Log performance for monitoring
      console.log('📊 Page Performance Metrics:', performanceMetrics);

      // Report slow performance
      if (loadTime > 3000 || renderTime > 1000) {
        console.warn('⚠️ Slow page performance detected:', {
          loadTime: `${loadTime}ms`,
          renderTime: `${renderTime}ms`,
          recommendation: loadTime > 3000 ? 'Consider lazy loading' : 'Optimize rendering'
        });
      }
    };

    // Measure when page is ready
    if (document.readyState === 'complete') {
      measurePerformance();
    } else {
      window.addEventListener('load', measurePerformance);
      return () => window.removeEventListener('load', measurePerformance);
    }
  }, []);

  const reportPerfIssue = (issue: string) => {
    console.warn('🚨 Performance Issue Reported:', issue, {
      timestamp: new Date().toISOString(),
      metrics,
      userAgent: navigator.userAgent
    });
    
    // In a real app, this would send to analytics/monitoring service
  };

  return {
    metrics,
    isLoading,
    optimizeForConnection,
    reportPerfIssue
  };
};

export const useAccessibility = () => {
  const [highContrast, setHighContrast] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [fontSize, setFontSize] = useState('normal');

  useEffect(() => {
    // Check user preferences
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const prefersHighContrast = window.matchMedia('(prefers-contrast: high)').matches;
    
    setReducedMotion(prefersReducedMotion);
    setHighContrast(prefersHighContrast);

    // Apply accessibility settings
    if (prefersReducedMotion) {
      document.documentElement.style.setProperty('--animation-duration', '0s');
    }

    // Keyboard navigation support
    const handleKeyboardNavigation = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        document.body.classList.add('keyboard-navigation');
      }
    };

    const handleMouseNavigation = () => {
      document.body.classList.remove('keyboard-navigation');
    };

    document.addEventListener('keydown', handleKeyboardNavigation);
    document.addEventListener('mousedown', handleMouseNavigation);

    return () => {
      document.removeEventListener('keydown', handleKeyboardNavigation);
      document.removeEventListener('mousedown', handleMouseNavigation);
    };
  }, []);

  const toggleHighContrast = () => {
    setHighContrast(!highContrast);
    document.documentElement.classList.toggle('high-contrast');
  };

  const adjustFontSize = (size: 'small' | 'normal' | 'large') => {
    setFontSize(size);
    document.documentElement.className = document.documentElement.className.replace(/font-\w+/g, '');
    document.documentElement.classList.add(`font-${size}`);
  };

  return {
    highContrast,
    reducedMotion,
    fontSize,
    toggleHighContrast,
    adjustFontSize
  };
};
