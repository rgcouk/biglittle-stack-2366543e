import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";

interface Props {
  children: ReactNode;
  fallbackComponent?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class AuthErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { 
      hasError: true, 
      error,
      errorInfo: null 
    };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('AuthErrorBoundary caught an error:', error, errorInfo);
    
    this.setState({
      error,
      errorInfo,
    });

    // Log authentication errors for monitoring
    if (typeof window !== 'undefined') {
      console.error('Authentication Error:', {
        message: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
        timestamp: new Date().toISOString(),
        url: window.location.href,
      });
    }
  }

  private handleRefresh = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.reload();
  };

  private handleGoHome = () => {
    window.location.href = '/';
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallbackComponent) {
        return this.props.fallbackComponent;
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-hero p-6">
          <Card className="w-full max-w-md shadow-elevated">
            <CardHeader className="text-center">
              <div className="mx-auto p-3 bg-red-100 rounded-full w-fit mb-4">
                <AlertTriangle className="h-8 w-8 text-red-600" />
              </div>
              <CardTitle className="text-xl">Authentication Error</CardTitle>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Something went wrong with the authentication system. This is usually a temporary issue.
                </AlertDescription>
              </Alert>

              {process.env.NODE_ENV === 'development' && (
                <div className="text-xs font-mono bg-gray-100 p-3 rounded border overflow-auto max-h-32">
                  <div className="font-bold mb-2">Error Details:</div>
                  <div>{this.state.error?.message}</div>
                  {this.state.error?.stack && (
                    <details className="mt-2">
                      <summary className="cursor-pointer">Stack trace</summary>
                      <pre className="mt-1 text-xs">{this.state.error.stack}</pre>
                    </details>
                  )}
                </div>
              )}

              <div className="flex gap-2 pt-4">
                <Button 
                  onClick={this.handleRefresh} 
                  className="flex-1"
                  variant="default"
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Retry
                </Button>
                <Button 
                  onClick={this.handleGoHome} 
                  className="flex-1"
                  variant="outline"
                >
                  <Home className="mr-2 h-4 w-4" />
                  Go Home
                </Button>
              </div>

              <div className="text-center text-sm text-muted-foreground pt-2">
                If this problem persists, please contact support.
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}