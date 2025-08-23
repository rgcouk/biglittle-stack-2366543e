import React, { useState } from 'react';
import { Plug, Settings, CheckCircle, AlertCircle, ExternalLink, Key } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';

interface Integration {
  id: string;
  name: string;
  description: string;
  status: 'connected' | 'disconnected' | 'error';
  icon: string;
  category: 'payment' | 'accounting' | 'communication' | 'analytics';
  settings?: Record<string, any>;
}

const integrations: Integration[] = [
  {
    id: 'stripe',
    name: 'Stripe',
    description: 'Accept payments and manage billing',
    status: 'disconnected',
    icon: '💳',
    category: 'payment'
  },
  {
    id: 'quickbooks',
    name: 'QuickBooks',
    description: 'Sync financial data and accounting',
    status: 'disconnected',
    icon: '📊',
    category: 'accounting'
  },
  {
    id: 'mailgun',
    name: 'Mailgun',
    description: 'Send automated emails and notifications',
    status: 'connected',
    icon: '📧',
    category: 'communication',
    settings: { domain: 'mg.example.com' }
  },
  {
    id: 'google-analytics',
    name: 'Google Analytics',
    description: 'Track website and customer behavior',
    status: 'connected',
    icon: '📈',
    category: 'analytics',
    settings: { tracking_id: 'GA-123456789' }
  },
  {
    id: 'twilio',
    name: 'Twilio',
    description: 'SMS notifications and customer communication',
    status: 'error',
    icon: '📱',
    category: 'communication'
  },
  {
    id: 'zapier',
    name: 'Zapier',
    description: 'Connect to 1000+ apps and automate workflows',
    status: 'disconnected',
    icon: '⚡',
    category: 'analytics'
  }
];

const getStatusColor = (status: Integration['status']) => {
  switch (status) {
    case 'connected':
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
    case 'error':
      return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
  }
};

const getStatusIcon = (status: Integration['status']) => {
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
  const [selectedIntegration, setSelectedIntegration] = useState<Integration | null>(null);
  const [apiKey, setApiKey] = useState('');
  const [webhookUrl, setWebhookUrl] = useState('');
  const { toast } = useToast();

  const categories = ['all', 'payment', 'accounting', 'communication', 'analytics'] as const;
  const [activeCategory, setActiveCategory] = useState<typeof categories[number]>('all');

  const filteredIntegrations = activeCategory === 'all' 
    ? integrations 
    : integrations.filter(i => i.category === activeCategory);

  const handleConnect = (integration: Integration) => {
    toast({
      title: "Integration Connected",
      description: `${integration.name} has been connected successfully.`,
    });
  };

  const handleDisconnect = (integration: Integration) => {
    toast({
      title: "Integration Disconnected", 
      description: `${integration.name} has been disconnected.`,
    });
  };

  const handleTest = (integration: Integration) => {
    toast({
      title: "Testing Integration",
      description: `Testing connection to ${integration.name}...`,
    });
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
                          onClick={() => setSelectedIntegration(integration)}
                        >
                          <Settings className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-4">
                        {integration.description}
                      </p>
                      <div className="flex gap-2">
                        {integration.status === 'connected' ? (
                          <>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleTest(integration)}
                            >
                              Test
                            </Button>
                            <Button 
                              variant="destructive" 
                              size="sm"
                              onClick={() => handleDisconnect(integration)}
                            >
                              Disconnect
                            </Button>
                          </>
                        ) : (
                          <Button 
                            size="sm"
                            onClick={() => handleConnect(integration)}
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
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {selectedIntegration && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              {selectedIntegration.name} Configuration
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="api-key">API Key</Label>
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
                <Switch defaultChecked={selectedIntegration.status === 'connected'} />
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
              <Button>Save Configuration</Button>
              <Button variant="outline" onClick={() => setSelectedIntegration(null)}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}