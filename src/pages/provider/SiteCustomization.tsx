import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Palette, ArrowLeft, BarChart3, Users, Building2, FileText, Bell, Plug, Activity, Database } from "lucide-react";
import { Link } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MultiFacilityDashboard } from "@/components/provider/MultiFacilityDashboard";
import { AdvancedReporting } from "@/components/provider/AdvancedReporting";
import { NotificationCenter } from "@/components/provider/NotificationCenter";
import { IntegrationCenter } from "@/components/provider/IntegrationCenter";
import { AuditLogViewer } from "@/components/provider/AuditLogViewer";
import { DataExportImport } from "@/components/provider/DataExportImport";

export default function SiteCustomization() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center space-x-4">
            <Link to="/provider" className="flex items-center space-x-2 text-muted-foreground hover:text-primary">
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Dashboard</span>
            </Link>
            <h1 className="text-2xl font-bold">Advanced Management Hub</h1>
            <p className="text-muted-foreground text-sm">
              Comprehensive facility management tools and integrations
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        <Tabs defaultValue="customization" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 lg:grid-cols-7">
            <TabsTrigger value="customization" className="flex items-center gap-2">
              <Palette className="h-4 w-4" />
              Customization
            </TabsTrigger>
            <TabsTrigger value="multi-facility" className="flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              Multi-Facility
            </TabsTrigger>
            <TabsTrigger value="advanced-reports" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Reports
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-2">
              <Bell className="h-4 w-4" />
              Notifications
            </TabsTrigger>
            <TabsTrigger value="integrations" className="flex items-center gap-2">
              <Plug className="h-4 w-4" />
              Integrations
            </TabsTrigger>
            <TabsTrigger value="audit" className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Audit Log
            </TabsTrigger>
            <TabsTrigger value="data" className="flex items-center gap-2">
              <Database className="h-4 w-4" />
              Data
            </TabsTrigger>
          </TabsList>

          <TabsContent value="customization">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="h-5 w-5" />
                  Site Customization
                </CardTitle>
                <CardDescription>
                  Customize your customer-facing storefront appearance and functionality
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  <p className="mb-4">Site customization features are coming soon!</p>
                  <p className="text-sm">This will include:</p>
                  <ul className="text-sm mt-2 space-y-1">
                    <li>• Brand colors and logo customization</li>
                    <li>• Custom domain setup</li>
                    <li>• Page content editing</li>
                    <li>• SEO optimization tools</li>
                    <li>• Advanced styling options</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="multi-facility">
            <MultiFacilityDashboard />
          </TabsContent>

          <TabsContent value="advanced-reports">
            <AdvancedReporting />
          </TabsContent>

          <TabsContent value="notifications">
            <NotificationCenter />
          </TabsContent>

          <TabsContent value="integrations">
            <IntegrationCenter />
          </TabsContent>

          <TabsContent value="audit">
            <AuditLogViewer />
          </TabsContent>

          <TabsContent value="data">
            <DataExportImport />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}