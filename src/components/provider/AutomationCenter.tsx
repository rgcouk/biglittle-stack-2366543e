import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { 
  Bot, 
  Mail, 
  MessageSquare, 
  Bell, 
  Calendar, 
  DollarSign,
  Users,
  Zap,
  Clock,
  AlertTriangle,
  CheckCircle,
  PlayCircle
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface AutomationRule {
  id: string;
  name: string;
  description: string;
  trigger: string;
  action: string;
  enabled: boolean;
  lastRun?: Date;
  runsCount: number;
}

const sampleAutomations: AutomationRule[] = [
  {
    id: '1',
    name: 'Welcome New Customers',
    description: 'Send welcome email and SMS to new customers within 1 hour of booking',
    trigger: 'New booking created',
    action: 'Send email + SMS',
    enabled: true,
    lastRun: new Date(Date.now() - 2 * 60 * 60 * 1000),
    runsCount: 47
  },
  {
    id: '2',
    name: 'Payment Reminder',
    description: 'Remind customers 3 days before payment due date',
    trigger: 'Payment due in 3 days',
    action: 'Send reminder email',
    enabled: true,
    lastRun: new Date(Date.now() - 24 * 60 * 60 * 1000),
    runsCount: 23
  },
  {
    id: '3',
    name: 'Overdue Payment Follow-up',
    description: 'Send follow-up for payments overdue by 7+ days',
    trigger: 'Payment overdue 7 days',
    action: 'Email + mark account',
    enabled: false,
    runsCount: 8
  },
  {
    id: '4',
    name: 'Unit Available Notification',
    description: 'Notify waiting list when preferred unit becomes available',
    trigger: 'Unit becomes available',
    action: 'Email waiting list',
    enabled: true,
    lastRun: new Date(Date.now() - 6 * 60 * 60 * 1000),
    runsCount: 12
  }
];

export function AutomationCenter() {
  const { toast } = useToast();
  const [automations, setAutomations] = useState<AutomationRule[]>(sampleAutomations);

  const toggleAutomation = (id: string) => {
    setAutomations(prev => prev.map(auto => 
      auto.id === id ? { ...auto, enabled: !auto.enabled } : auto
    ));
    
    const automation = automations.find(a => a.id === id);
    toast({
      title: `Automation ${automation?.enabled ? 'disabled' : 'enabled'}`,
      description: `"${automation?.name}" has been ${automation?.enabled ? 'disabled' : 'enabled'}`,
    });
  };

  const runAutomation = (id: string) => {
    const automation = automations.find(a => a.id === id);
    toast({
      title: "Automation triggered",
      description: `"${automation?.name}" is running now`,
    });
  };

  return (
    <div className="space-y-6">
      {/* Automation Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5" />
            Automation Center
          </CardTitle>
          <CardDescription>
            Automate customer communications, payments, and business processes
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {automations.filter(a => a.enabled).length}
              </div>
              <p className="text-sm text-muted-foreground">Active Automations</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">
                {automations.reduce((sum, a) => sum + a.runsCount, 0)}
              </div>
              <p className="text-sm text-muted-foreground">Total Runs</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">97.2%</div>
              <p className="text-sm text-muted-foreground">Success Rate</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">2.4h</div>
              <p className="text-sm text-muted-foreground">Time Saved Daily</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="rules" className="space-y-4">
        <TabsList>
          <TabsTrigger value="rules">Automation Rules</TabsTrigger>
          <TabsTrigger value="templates">Email Templates</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="rules" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Active Automation Rules</CardTitle>
                <Button>
                  <Zap className="h-4 w-4 mr-2" />
                  Create Rule
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {automations.map((automation) => (
                  <div key={automation.id} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <h3 className="font-medium">{automation.name}</h3>
                          <Badge variant={automation.enabled ? "default" : "secondary"}>
                            {automation.enabled ? "Active" : "Inactive"}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          {automation.description}
                        </p>
                      </div>
                      <Switch
                        checked={automation.enabled}
                        onCheckedChange={() => toggleAutomation(automation.id)}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Trigger: </span>
                        <span className="font-medium">{automation.trigger}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Action: </span>
                        <span className="font-medium">{automation.action}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Runs: </span>
                        <span className="font-medium">{automation.runsCount}</span>
                      </div>
                    </div>

                    {automation.lastRun && (
                      <div className="flex items-center justify-between pt-2 border-t">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          Last run: {automation.lastRun.toLocaleString()}
                        </div>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => runAutomation(automation.id)}
                        >
                          <PlayCircle className="h-3 w-3 mr-1" />
                          Run Now
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="templates" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Email Templates
              </CardTitle>
              <CardDescription>Customize automated email communications</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  { name: 'Welcome Email', type: 'welcome', usage: 47 },
                  { name: 'Payment Reminder', type: 'payment', usage: 23 },
                  { name: 'Payment Confirmation', type: 'confirmation', usage: 89 },
                  { name: 'Unit Available', type: 'notification', usage: 12 },
                  { name: 'Contract Expiry', type: 'expiry', usage: 5 },
                  { name: 'Maintenance Notice', type: 'maintenance', usage: 8 }
                ].map((template, index) => (
                  <Card key={index} className="cursor-pointer hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Mail className="h-4 w-4 text-blue-600" />
                        <span className="font-medium">{template.name}</span>
                      </div>
                      <p className="text-xs text-muted-foreground mb-2">
                        Used {template.usage} times this month
                      </p>
                      <Button variant="outline" size="sm" className="w-full">
                        Edit Template
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Automation Performance</CardTitle>
                <CardDescription>Success rates and metrics</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Email Delivery Rate</span>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">98.7%</span>
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm">SMS Delivery Rate</span>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">99.2%</span>
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm">Failed Automations</span>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">3</span>
                    <AlertTriangle className="h-4 w-4 text-yellow-600" />
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm">Customer Response Rate</span>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">24.6%</span>
                    <Badge variant="default">+3.2%</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Time & Cost Savings</CardTitle>
                <CardDescription>Efficiency gains from automation</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">147</div>
                  <p className="text-sm text-muted-foreground">Hours saved this month</p>
                </div>
                
                <Separator />
                
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm">Manual email time saved</span>
                    <span className="font-medium">89h</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Payment processing time</span>
                    <span className="font-medium">34h</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Customer follow-ups</span>
                    <span className="font-medium">24h</span>
                  </div>
                </div>
                
                <Separator />
                
                <div className="text-center">
                  <div className="text-lg font-bold">£2,940</div>
                  <p className="text-xs text-muted-foreground">Estimated cost savings</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}