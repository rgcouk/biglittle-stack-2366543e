import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Smartphone, Tablet, Monitor, Wifi, Download, Star } from "lucide-react";

interface MobileMetrics {
  mobileUsers: number;
  tabletUsers: number;
  desktopUsers: number;
  avgLoadTime: number;
  mobileConversionRate: number;
  appRating: number;
}

export function MobileOptimization() {
  const [metrics, setMetrics] = useState<MobileMetrics>({
    mobileUsers: 68,
    tabletUsers: 18,
    desktopUsers: 14,
    avgLoadTime: 2.3,
    mobileConversionRate: 12.4,
    appRating: 4.7,
  });

  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <div className="space-y-6">
      {/* Connection Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wifi className={isOnline ? "text-green-600" : "text-red-600"} />
            Connection Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <Badge variant={isOnline ? "default" : "destructive"}>
              {isOnline ? "Online" : "Offline"}
            </Badge>
            <span className="text-sm text-muted-foreground">
              {isOnline ? "All features available" : "Limited functionality in offline mode"}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Device Usage Statistics */}
      <Card>
        <CardHeader>
          <CardTitle>Device Usage Analytics</CardTitle>
          <CardDescription>How customers access your storage platform</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center space-y-2">
              <Smartphone className="h-8 w-8 mx-auto text-blue-600" />
              <div className="text-2xl font-bold">{metrics.mobileUsers}%</div>
              <p className="text-sm text-muted-foreground">Mobile Users</p>
              <Badge variant="default">Primary</Badge>
            </div>
            
            <div className="text-center space-y-2">
              <Tablet className="h-8 w-8 mx-auto text-green-600" />
              <div className="text-2xl font-bold">{metrics.tabletUsers}%</div>
              <p className="text-sm text-muted-foreground">Tablet Users</p>
              <Badge variant="secondary">Growing</Badge>
            </div>
            
            <div className="text-center space-y-2">
              <Monitor className="h-8 w-8 mx-auto text-purple-600" />
              <div className="text-2xl font-bold">{metrics.desktopUsers}%</div>
              <p className="text-sm text-muted-foreground">Desktop Users</p>
              <Badge variant="outline">Stable</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Mobile Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Mobile Performance</CardTitle>
            <CardDescription>Key mobile experience metrics</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm">Average Load Time</span>
              <div className="flex items-center gap-2">
                <span className="font-medium">{metrics.avgLoadTime}s</span>
                <Badge variant={metrics.avgLoadTime < 3 ? "default" : "destructive"}>
                  {metrics.avgLoadTime < 3 ? "Good" : "Needs Work"}
                </Badge>
              </div>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm">Mobile Conversion Rate</span>
              <div className="flex items-center gap-2">
                <span className="font-medium">{metrics.mobileConversionRate}%</span>
                <Badge variant="default">+2.1%</Badge>
              </div>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm">Touch Interaction Score</span>
              <div className="flex items-center gap-2">
                <span className="font-medium">92%</span>
                <Badge variant="default">Excellent</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Mobile App Status</CardTitle>
            <CardDescription>Progressive Web App features</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Download className="h-4 w-4" />
                <span className="text-sm">PWA Installable</span>
              </div>
              <Badge variant="default">Available</Badge>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Wifi className="h-4 w-4" />
                <span className="text-sm">Offline Mode</span>
              </div>
              <Badge variant="secondary">Partial</Badge>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Star className="h-4 w-4" />
                <span className="text-sm">User Rating</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="font-medium">{metrics.appRating}</span>
                <Badge variant="default">★★★★★</Badge>
              </div>
            </div>

            <Button className="w-full mt-4">
              <Download className="h-4 w-4 mr-2" />
              Install Mobile App
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Mobile Optimization Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle>Mobile Optimization Recommendations</CardTitle>
          <CardDescription>Suggestions to improve mobile user experience</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start gap-3 p-3 border rounded-lg">
              <div className="w-2 h-2 rounded-full bg-green-500 mt-2"></div>
              <div>
                <h4 className="font-medium text-sm">Touch Target Size</h4>
                <p className="text-xs text-muted-foreground">All buttons and interactive elements meet the 44px minimum touch target size.</p>
              </div>
              <Badge variant="default" className="ml-auto">Good</Badge>
            </div>
            
            <div className="flex items-start gap-3 p-3 border rounded-lg">
              <div className="w-2 h-2 rounded-full bg-yellow-500 mt-2"></div>
              <div>
                <h4 className="font-medium text-sm">Image Optimization</h4>
                <p className="text-xs text-muted-foreground">Consider using WebP format and responsive images for faster loading.</p>
              </div>
              <Badge variant="secondary" className="ml-auto">Improve</Badge>
            </div>
            
            <div className="flex items-start gap-3 p-3 border rounded-lg">
              <div className="w-2 h-2 rounded-full bg-blue-500 mt-2"></div>
              <div>
                <h4 className="font-medium text-sm">Offline Functionality</h4>
                <p className="text-xs text-muted-foreground">Enable viewing of booked units and basic account info when offline.</p>
              </div>
              <Badge variant="outline" className="ml-auto">Planned</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}