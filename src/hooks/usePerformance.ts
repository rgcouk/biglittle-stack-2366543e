import { useEffect, useState } from 'react';

interface PerformanceMetrics {
  firstPaint?: number;
  firstContentfulPaint?: number;
  largestContentfulPaint?: number;
  cumulativeLayoutShift?: number;
  totalBlockingTime?: number;
  timeToInteractive?: number;
}

export function usePerformance() {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let observer: PerformanceObserver;
    const newMetrics: PerformanceMetrics = {};

    try {
      // Create performance observer
      observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          switch (entry.entryType) {
            case 'paint':
              if (entry.name === 'first-paint') {
                newMetrics.firstPaint = entry.startTime;
              } else if (entry.name === 'first-contentful-paint') {
                newMetrics.firstContentfulPaint = entry.startTime;
              }
              break;
            case 'largest-contentful-paint':
              newMetrics.largestContentfulPaint = entry.startTime;
              break;
            case 'layout-shift':
              if (!('hadRecentInput' in entry) || !(entry as any).hadRecentInput) {
                newMetrics.cumulativeLayoutShift = 
                  (newMetrics.cumulativeLayoutShift || 0) + (entry as any).value;
              }
              break;
          }
        }
        
        setMetrics({ ...newMetrics });
      });

      // Observe different types of performance entries
      observer.observe({ entryTypes: ['paint', 'largest-contentful-paint', 'layout-shift'] });

      // Get navigation timing
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      if (navigation) {
        newMetrics.timeToInteractive = navigation.domInteractive - navigation.fetchStart;
      }

      setIsLoading(false);
    } catch (error) {
      console.warn('Performance monitoring not supported', error);
      setIsLoading(false);
    }

    return () => {
      if (observer) {
        observer.disconnect();
      }
    };
  }, []);

  return { metrics, isLoading };
}

// Hook for monitoring component render performance
export function useRenderPerformance(componentName: string) {
  useEffect(() => {
    if (process.env.NODE_ENV !== 'development') return;

    const startTime = performance.now();
    
    return () => {
      const endTime = performance.now();
      const renderTime = endTime - startTime;
      
      if (renderTime > 16) { // More than one frame at 60fps
        console.warn(`${componentName} render took ${renderTime.toFixed(2)}ms`);
      }
    };
  });
}

// Hook for measuring custom metrics
export function useCustomMetric(metricName: string, fn: () => number | Promise<number>) {
  useEffect(() => {
    const measureMetric = async () => {
      const startTime = performance.now();
      
      try {
        const result = await fn();
        const endTime = performance.now();
        
        // Create custom performance entry
        if ('mark' in performance && 'measure' in performance) {
          performance.mark(`${metricName}-start`);
          performance.mark(`${metricName}-end`);
          performance.measure(metricName, `${metricName}-start`, `${metricName}-end`);
        }
        
        console.log(`${metricName}: ${result}, took ${(endTime - startTime).toFixed(2)}ms`);
      } catch (error) {
        console.error(`Error measuring ${metricName}:`, error);
      }
    };

    measureMetric();
  }, [metricName, fn]);
}