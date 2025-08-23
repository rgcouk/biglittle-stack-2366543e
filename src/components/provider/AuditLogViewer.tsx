import React from 'react';
import { Activity, User, Calendar, MapPin, Monitor } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAuditLog, AuditLogEntry } from '@/hooks/useAuditLog';
import { formatDistanceToNow, format } from 'date-fns';

const getActionColor = (action: string) => {
  if (action.includes('create')) return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
  if (action.includes('update')) return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
  if (action.includes('delete')) return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
  return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
};

const formatActionName = (action: string) => {
  return action
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

export function AuditLogViewer() {
  const { data: auditLog, isLoading } = useAuditLog(100);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Audit Log
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="animate-pulse flex space-x-4">
                <div className="rounded-full bg-muted h-10 w-10"></div>
                <div className="flex-1 space-y-2 py-1">
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                  <div className="h-3 bg-muted rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Audit Log
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[500px] pr-4">
          {auditLog && auditLog.length > 0 ? (
            <div className="space-y-4">
              {auditLog.map((entry) => (
                <div key={entry.id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-full bg-muted">
                        <Activity className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <Badge className={getActionColor(entry.action)}>
                            {formatActionName(entry.action)}
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            {entry.resource_type}
                          </span>
                        </div>
                        <p className="text-sm font-medium">
                          {entry.user_name || 'Unknown User'}
                        </p>
                      </div>
                    </div>
                    <div className="text-right text-sm text-muted-foreground">
                      <p>{formatDistanceToNow(new Date(entry.timestamp), { addSuffix: true })}</p>
                      <p className="text-xs">{format(new Date(entry.timestamp), 'PPp')}</p>
                    </div>
                  </div>

                  {entry.details && Object.keys(entry.details).length > 0 && (
                    <div className="bg-muted/50 rounded p-3 space-y-2">
                      <p className="text-sm font-medium">Details:</p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                        {Object.entries(entry.details).map(([key, value]) => (
                          <div key={key} className="flex justify-between">
                            <span className="text-muted-foreground capitalize">
                              {key.replace(/_/g, ' ')}:
                            </span>
                            <span className="font-mono text-xs">
                              {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {entry.ip_address}
                    </div>
                    <div className="flex items-center gap-1">
                      <User className="h-3 w-3" />
                      ID: {entry.user_id}
                    </div>
                    <div className="flex items-center gap-1">
                      <Monitor className="h-3 w-3" />
                      {entry.user_agent.split(' ')[0]}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No audit log entries found</p>
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}