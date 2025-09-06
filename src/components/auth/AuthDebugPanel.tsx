import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/hooks/useAuth";
import { useUserRole } from "@/hooks/useUserRole";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { 
  RefreshCw, 
  Database, 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  User,
  Settings 
} from "lucide-react";

interface AuthDebugPanelProps {
  isVisible: boolean;
}

export function AuthDebugPanel({ isVisible }: AuthDebugPanelProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [debugInfo, setDebugInfo] = useState<any>(null);
  
  const { user, session } = useAuth();
  const { data: userRole, isLoading: roleLoading, error: roleError, refetch } = useUserRole();
  const { toast } = useToast();

  if (!isVisible) return null;

  const runDiagnostics = async () => {
    setIsLoading(true);
    try {
      const diagnostics: any = {
        timestamp: new Date().toISOString(),
        auth: {
          hasUser: !!user,
          hasSession: !!session,
          userId: user?.id,
          email: user?.email,
          sessionExpiry: session?.expires_at,
        },
        role: {
          value: userRole,
          loading: roleLoading,
          error: roleError?.message,
        },
        database: {},
      };

      // Test database connection
      if (user) {
        try {
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('user_id', user.id)
            .maybeSingle();

          diagnostics.database.profileQuery = {
            success: !profileError,
            error: profileError?.message,
            data: profileData,
          };

          // Test RPC function
          const { data: rpcData, error: rpcError } = await supabase.rpc('get_user_role_enhanced', {
            user_uuid: user.id
          });
          diagnostics.database.rpcFunction = {
            success: !rpcError,
            error: rpcError?.message,
            data: rpcData,
          };
        } catch (error: any) {
          diagnostics.database.error = error.message;
        }
      }

      setDebugInfo(diagnostics);
      toast({
        title: "Diagnostics completed",
        description: "Check the debug panel for results",
      });
    } catch (error: any) {
      toast({
        title: "Diagnostics failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const refreshAuth = async () => {
    setIsLoading(true);
    try {
      await supabase.auth.refreshSession();
      await refetch();
      toast({
        title: "Auth refreshed",
        description: "Authentication state has been refreshed",
      });
    } catch (error: any) {
      toast({
        title: "Refresh failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusIcon = (condition: boolean) => {
    return condition ? (
      <CheckCircle className="h-4 w-4 text-green-600" />
    ) : (
      <AlertTriangle className="h-4 w-4 text-red-600" />
    );
  };

  return (
    <Card className="mt-4 border-amber-200 bg-amber-50">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Authentication Debug Panel
          </CardTitle>
          <Badge variant="secondary" className="text-xs">
            Development Mode
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Quick Status */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2">
            {getStatusIcon(!!user)}
            <span>User: {user ? "Authenticated" : "Not authenticated"}</span>
          </div>
          <div className="flex items-center gap-2">
            {getStatusIcon(!!session)}
            <span>Session: {session ? "Active" : "Inactive"}</span>
          </div>
          <div className="flex items-center gap-2">
            {getStatusIcon(!!userRole && !roleLoading)}
            <span>Role: {userRole || "Loading..."}</span>
          </div>
          <div className="flex items-center gap-2">
            {getStatusIcon(!roleError)}
            <span>DB Access: {roleError ? "Error" : "OK"}</span>
          </div>
        </div>

        <Separator />

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={runDiagnostics}
            disabled={isLoading}
            className="flex-1"
          >
            <Database className="mr-2 h-4 w-4" />
            {isLoading ? "Running..." : "Run Diagnostics"}
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={refreshAuth}
            disabled={isLoading}
            className="flex-1"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh Auth
          </Button>
        </div>

        {/* Debug Information */}
        {debugInfo && (
          <div className="space-y-3">
            <Separator />
            <div className="text-xs font-mono space-y-2">
              <div><strong>User ID:</strong> {debugInfo.auth.userId || "N/A"}</div>
              <div><strong>Email:</strong> {debugInfo.auth.email || "N/A"}</div>
              <div><strong>Role:</strong> {debugInfo.role.value || "N/A"}</div>
              {debugInfo.role.error && (
                <div className="text-red-600">
                  <strong>Role Error:</strong> {debugInfo.role.error}
                </div>
              )}
              {debugInfo.database.profileQuery && (
                <div>
                  <strong>Profile Query:</strong>{" "}
                  {debugInfo.database.profileQuery.success ? "Success" : "Failed"}
                  {debugInfo.database.profileQuery.error && (
                    <div className="text-red-600 ml-2">
                      {debugInfo.database.profileQuery.error}
                    </div>
                  )}
                </div>
              )}
              {debugInfo.database.rpcFunction && (
                <div>
                  <strong>RPC Function:</strong>{" "}
                  {debugInfo.database.rpcFunction.success ? "Success" : "Failed"}
                  {debugInfo.database.rpcFunction.error && (
                    <div className="text-red-600 ml-2">
                      {debugInfo.database.rpcFunction.error}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}