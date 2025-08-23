import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { 
  Activity, 
  Clock, 
  Cpu, 
  HardDrive, 
  Wifi,
  AlertTriangle,
  CheckCircle,
  XCircle
} from 'lucide-react';

interface PerformanceMetrics {
  loadTime: number;
  memoryUsage: number;
  networkLatency: number;
  renderTime: number;
  cacheHitRate: number;
}

export function PerformanceMonitor() {
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Only show in development
    if (process.env.NODE_ENV !== 'development') return;

    const measurePerformance = () => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      const memory = (performance as any).memory;
      
      const loadTime = navigation.loadEventEnd - navigation.loadEventStart;
      const renderTime = navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart;
      
      setMetrics({
        loadTime: loadTime || 0,
        memoryUsage: memory ? (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100 : 0,
        networkLatency: navigation.responseEnd - navigation.requestStart || 0,
        renderTime: renderTime || 0,
        cacheHitRate: Math.random() * 100 // Mock cache hit rate
      });
    };

    measurePerformance();
    
    // Show monitor after a delay
    const timer = setTimeout(() => setIsVisible(true), 2000);
    
    return () => clearTimeout(timer);
  }, []);

  if (!metrics || !isVisible || process.env.NODE_ENV !== 'development') {
    return null;
  }

  const getPerformanceStatus = (value: number, thresholds: [number, number]) => {
    if (value <= thresholds[0]) return { status: 'good', color: 'text-emerald-500', icon: CheckCircle };
    if (value <= thresholds[1]) return { status: 'warning', color: 'text-orange-500', icon: AlertTriangle };
    return { status: 'poor', color: 'text-red-500', icon: XCircle };
  };

  const loadTimeStatus = getPerformanceStatus(metrics.loadTime, [1000, 3000]);
  const memoryStatus = getPerformanceStatus(metrics.memoryUsage, [50, 80]);
  const latencyStatus = getPerformanceStatus(metrics.networkLatency, [100, 500]);

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm animate-slide-in-right">
      <Card className="shadow-lg border-2">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Performance Monitor
            <Badge variant="outline" className="ml-auto">DEV</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                <span>Load Time</span>
              </div>
              <div className="flex items-center gap-1">
                <loadTimeStatus.icon className={`h-3 w-3 ${loadTimeStatus.color}`} />
                <span className="font-mono">{metrics.loadTime.toFixed(0)}ms</span>
              </div>
            </div>
            
            <div className="space-y-1">
              <div className="flex items-center gap-1">
                <Cpu className="h-3 w-3" />
                <span>Memory</span>
              </div>
              <div className="flex items-center gap-1">
                <memoryStatus.icon className={`h-3 w-3 ${memoryStatus.color}`} />
                <span className="font-mono">{metrics.memoryUsage.toFixed(1)}%</span>
              </div>
            </div>
            
            <div className="space-y-1">
              <div className="flex items-center gap-1">
                <Wifi className="h-3 w-3" />
                <span>Latency</span>
              </div>
              <div className="flex items-center gap-1">
                <latencyStatus.icon className={`h-3 w-3 ${latencyStatus.color}`} />
                <span className="font-mono">{metrics.networkLatency.toFixed(0)}ms</span>
              </div>
            </div>
            
            <div className="space-y-1">
              <div className="flex items-center gap-1">
                <HardDrive className="h-3 w-3" />
                <span>Cache Hit</span>
              </div>
              <div className="flex items-center gap-1">
                <CheckCircle className="h-3 w-3 text-emerald-500" />
                <span className="font-mono">{metrics.cacheHitRate.toFixed(1)}%</span>
              </div>
            </div>
          </div>
          
          <div className="space-y-2 pt-2 border-t">
            <div>
              <div className="flex justify-between mb-1">
                <span>Memory Usage</span>
                <span className="font-mono">{metrics.memoryUsage.toFixed(1)}%</span>
              </div>
              <Progress value={metrics.memoryUsage} className="h-1" />
            </div>
            
            <div>
              <div className="flex justify-between mb-1">
                <span>Cache Efficiency</span>
                <span className="font-mono">{metrics.cacheHitRate.toFixed(1)}%</span>
              </div>
              <Progress value={metrics.cacheHitRate} className="h-1" />
            </div>
          </div>
          
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full"
            onClick={() => setIsVisible(false)}
          >
            Hide Monitor
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

// Web Vitals monitoring hook
export function useWebVitals() {
  useEffect(() => {
    if (process.env.NODE_ENV !== 'development') return;

     // Simple performance tracking without external dependencies
     const measureVitals = () => {
       if ('performance' in window) {
         const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
         console.log('Page Load Time:', navigation.loadEventEnd - navigation.fetchStart);
         console.log('DOM Content Loaded:', navigation.domContentLoadedEventEnd - navigation.fetchStart);
         console.log('First Paint:', performance.getEntriesByName('first-paint')[0]?.startTime || 0);
       }
     };

    // Measure after page load
    if (document.readyState === 'complete') {
      measureVitals();
    } else {
      window.addEventListener('load', measureVitals);
      return () => window.removeEventListener('load', measureVitals);
    }
  }, []);
}