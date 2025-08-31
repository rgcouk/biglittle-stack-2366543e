import React, { useState } from 'react';
import { Plug, Settings, CheckCircle, AlertCircle, ExternalLink, Key, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { useIntegrations, useCreateIntegration, useUpdateIntegration, useTestIntegration } from '@/hooks/useIntegrations';

interface IntegrationTemplate {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'payment' | 'accounting' | 'communication' | 'analytics';
  defaultSettings: Record<string, any>;
}

const integrationTemplates: IntegrationTemplate[] = [
  {
    id: 'stripe',
    name: 'Stripe',
    description: 'Accept payments and manage billing',
    icon: '💳',
    category: 'payment',
    defaultSettings: { currency: 'gbp' }
  },
  {
    id: 'quickbooks',
    name: 'QuickBooks',
    description: 'Sync financial data and accounting',
    icon: '📊',
    category: 'accounting',
    defaultSettings: { sync_frequency: 'daily' }
  },
  {
    id: 'mailgun',
    name: 'Mailgun',
    description: 'Send automated emails and notifications',
    icon: '📧',
    category: 'communication',
    defaultSettings: { domain: '' }
  },
  {
    id: 'google-analytics',
    name: 'Google Analytics',
    description: 'Track website and customer behavior',
    icon: '📈',
    category: 'analytics',
    defaultSettings: { tracking_id: '' }
  },
  {
    id: 'twilio',
    name: 'Twilio',
    description: 'SMS notifications and customer communication',
    icon: '📱',
    category: 'communication',
    defaultSettings: { phone_number: '' }
  },
  {
    id: 'zapier',
    name: 'Zapier',
    description: 'Connect to 1000+ apps and automate workflows',
    icon: '⚡',
    category: 'analytics',
    defaultSettings: { webhook_url: '' }
  }
];

const getStatusColor = (status: 'connected' | 'disconnected' | 'error') => {
  switch (status) {
    case 'connected':
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
    case 'error':
      return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
  }
};

const getStatusIcon = (status: 'connected' | 'disconnected' | 'error') => {
  switch (status) {
    case 'connected':
      return <CheckCircle className="h-4 w-4" />;
    case 'error':
      return <AlertCircle className="h-4 w-4" />;
    default:
      return <Plug className="h-4 w-4" />;
  }
};

export function IntegrationCenter() {
  const [selectedTemplate, setSelectedTemplate] = useState<IntegrationTemplate | null>(null);
  const [apiKey, setApiKey] = useState('');
  const [webhookUrl, setWebhookUrl] = useState('');
  const [isEnabled, setIsEnabled] = useState(false);
  const { toast } = useToast();

  const { data: integrations = [], isLoading } = useIntegrations();
  const createIntegration = useCreateIntegration();
  const updateIntegration = useUpdateIntegration();
  const testIntegration = useTestIntegration();

  const categories = ['all', 'payment', 'accounting', 'communication', 'analytics'] as const;
  const [activeCategory, setActiveCategory] = useState<typeof categories[number]>('all');

  // Merge templates with actual integrations
  const mergedIntegrations = integrationTemplates.map(template => {
    const existing = integrations.find(i => i.service_name === template.id);
    return {
      ...template,
      status: existing?.status || 'disconnected' as const,
      integrationId: existing?.id,
      settings: existing?.settings || template.defaultSettings,
      lastTested: existing?.last_tested_at,
    };
  });

  const filteredIntegrations = activeCategory === 'all' 
    ? mergedIntegrations 
    : mergedIntegrations.filter(i => i.category === activeCategory);

  const handleConnect = async (template: IntegrationTemplate) => {
    if (!apiKey) {
      toast({
        title: "API Key Required",
        description: "Please enter an API key to connect this integration.",
        variant: "destructive",
      });
      return;
    }

    await createIntegration.mutateAsync({
      service_name: template.id,
      service_id: template.id,
      status: 'connected',
      api_key_encrypted: apiKey,
      webhook_url: webhookUrl || undefined,
      settings: { ...template.defaultSettings, enabled: isEnabled },
    });

    setSelectedTemplate(null);
    setApiKey('');
    setWebhookUrl('');
  };

  const handleDisconnect = async (integrationId: string) => {
    await updateIntegration.mutateAsync({
      integrationId,
      updates: { status: 'disconnected' },
    });
  };

  const handleTest = async (serviceName: string) => {
    const integration = integrations.find(i => i.service_name === serviceName);
    if (integration?.api_key_encrypted) {
      await testIntegration.mutateAsync({
        serviceName,
        apiKey: integration.api_key_encrypted,
      });
      
      await updateIntegration.mutateAsync({
        integrationId: integration.id,
        updates: { last_tested_at: new Date().toISOString() },
      });
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plug className="h-5 w-5" />
            Integration Center
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeCategory} onValueChange={(value) => setActiveCategory(value as any)}>
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="payment">Payment</TabsTrigger>
              <TabsTrigger value="accounting">Accounting</TabsTrigger>
              <TabsTrigger value="communication">Communication</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
            </TabsList>

            <TabsContent value={activeCategory} className="mt-6">
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {filteredIntegrations.map((integration) => (
                    <Card key={integration.id} className="relative">
                      <CardHeader className="pb-4">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <span className="text-2xl">{integration.icon}</span>
                            <div>
                              <CardTitle className="text-lg">{integration.name}</CardTitle>
                              <Badge className={getStatusColor(integration.status)}>
                                <span className="flex items-center gap-1">
                                  {getStatusIcon(integration.status)}
                                  {integration.status}
                                </span>
                              </Badge>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedTemplate(integration)}
                          >
                            <Settings className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground mb-4">
                          {integration.description}
                        </p>
                        {integration.lastTested && (
                          <p className="text-xs text-muted-foreground mb-4">
                            Last tested: {new Date(integration.lastTested).toLocaleString()}
                          </p>
                        )}
                        <div className="flex gap-2">
                          {integration.status === 'connected' ? (
                            <>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleTest(integration.id)}
                                disabled={testIntegration.isPending}
                              >
                                {testIntegration.isPending ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  'Test'
                                )}
                              </Button>
                              <Button 
                                variant="destructive" 
                                size="sm"
                                onClick={() => integration.integrationId && handleDisconnect(integration.integrationId)}
                                disabled={updateIntegration.isPending}
                              >
                                Disconnect
                              </Button>
                            </>
                          ) : (
                            <Button 
                              size="sm"
                              onClick={() => setSelectedTemplate(integration)}
                            >
                              Connect
                            </Button>
                          )}
                          <Button variant="ghost" size="sm">
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {selectedTemplate && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              {selectedTemplate.name} Configuration
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="api-key">API Key *</Label>
                <Input
                  id="api-key"
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="Enter your API key..."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="webhook-url">Webhook URL</Label>
                <Input
                  id="webhook-url"
                  value={webhookUrl}
                  onChange={(e) => setWebhookUrl(e.target.value)}
                  placeholder="https://your-domain.com/webhook"
                />
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Enable Integration</Label>
                  <p className="text-sm text-muted-foreground">
                    Allow this integration to access your facility data
                  </p>
                </div>
                <Switch checked={isEnabled} onCheckedChange={setIsEnabled} />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label>Auto-sync</Label>
                  <p className="text-sm text-muted-foreground">
                    Automatically sync data every hour
                  </p>
                </div>
                <Switch />
              </div>
            </div>

            <div className="flex gap-2 pt-4">
              <Button 
                onClick={() => handleConnect(selectedTemplate)}
                disabled={createIntegration.isPending || !apiKey}
              >
                {createIntegration.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : null}
                Connect Integration
              </Button>
              <Button variant="outline" onClick={() => {
                setSelectedTemplate(null);
                setApiKey('');
                setWebhookUrl('');
                setIsEnabled(false);
              }}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}