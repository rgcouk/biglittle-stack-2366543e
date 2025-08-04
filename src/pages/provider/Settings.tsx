import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { Settings, User, CreditCard } from "lucide-react";

export default function ProviderSettings() {
  const { signOut } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Settings</h1>
              <p className="text-muted-foreground">Manage your account preferences</p>
            </div>
            <Button 
              variant="outline" 
              onClick={signOut}
              className="ml-4"
            >
              Sign Out
            </Button>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {/* Account Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Account Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-sm text-muted-foreground">
                  <p>Account Type: <span className="font-medium text-foreground">Provider</span></p>
                  <p>Status: <span className="font-medium text-green-600">Active</span></p>
                </div>
              </CardContent>
            </Card>

            {/* Billing Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Billing & Subscription
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-sm text-muted-foreground">
                  <p>Plan: <span className="font-medium text-foreground">Free Plan</span></p>
                  <p>Storage Units: <span className="font-medium text-foreground">Unlimited</span></p>
                  <p>Next Billing: <span className="font-medium text-foreground">Never</span></p>
                </div>
                <Button variant="outline" className="w-full" disabled>
                  Manage Billing
                  <span className="ml-2 text-xs bg-muted px-2 py-1 rounded">Coming Soon</span>
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Navigation Links */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 md:grid-cols-3">
                <Button variant="outline" onClick={() => window.location.href = '/provider'}>
                  Dashboard
                </Button>
                <Button variant="outline" onClick={() => window.location.href = '/provider/units'}>
                  Manage Units
                </Button>
                <Button variant="outline" onClick={() => window.location.href = '/provider/onboarding'}>
                  Facility Setup
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}