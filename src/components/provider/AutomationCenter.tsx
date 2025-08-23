import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Zap, 
  Plus, 
  Settings, 
  Mail,
  CreditCard,
  Calendar,
  Users,
  AlertTriangle,
  Clock,
  CheckCircle
} from 'lucide-react';

interface AutomationRule {
  id: string;
  name: string;
  description: string;
  trigger: string;
  action: string;
  isActive: boolean;
  lastRun?: string;
  runsCount: number;
}

const automationRules: AutomationRule[] = [
  {
    id: '1',
    name: 'Payment Reminder',
    description: 'Send email reminder 3 days before payment due',
    trigger: 'Payment due in 3 days',
    action: 'Send email notification',
    isActive: true,
    lastRun: '2 hours ago',
    runsCount: 47
  },
  {
    id: '2', 
    name: 'New Customer Welcome',
    description: 'Send welcome email and SMS to new customers',
    trigger: 'New booking created',
    action: 'Send welcome sequence',
    isActive: true,
    lastRun: '1 day ago',
    runsCount: 23
  }
];

export function AutomationCenter() {
  const [selectedRule, setSelectedRule] = useState<AutomationRule | null>(null);

  const toggleRule = (ruleId: string) => {
    console.log('Toggle rule:', ruleId);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Automation Center</h1>
          <p className="text-muted-foreground">Automate workflows and streamline operations</p>
        </div>
        
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Create Automation
        </Button>
      </div>

      <Tabs defaultValue="rules" className="space-y-4">
        <TabsList>
          <TabsTrigger value="rules">Automation Rules</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="logs">Activity Logs</TabsTrigger>
        </TabsList>
        
        <TabsContent value="rules" className="space-y-4">
          <div className="grid gap-4">
            {automationRules.map((rule) => (
              <Card key={rule.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <div className="space-y-1">
                    <CardTitle className="text-lg font-semibold">{rule.name}</CardTitle>
                    <p className="text-sm text-muted-foreground">{rule.description}</p>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <Badge variant={rule.isActive ? "default" : "secondary"}>
                      {rule.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                    <Switch 
                      checked={rule.isActive}
                      onCheckedChange={() => toggleRule(rule.id)}
                    />
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-xs text-muted-foreground">TRIGGER</Label>
                      <div className="flex items-center gap-2 mt-1">
                        <Zap className="h-4 w-4 text-orange-500" />
                        <span className="text-sm">{rule.trigger}</span>
                      </div>
                    </div>
                    
                    <div>
                      <Label className="text-xs text-muted-foreground">ACTION</Label>
                      <div className="flex items-center gap-2 mt-1">
                        <Mail className="h-4 w-4 text-blue-500" />
                        <span className="text-sm">{rule.action}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between pt-2 border-t">
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>Runs: {rule.runsCount}</span>
                      {rule.lastRun && (
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          Last run: {rule.lastRun}
                        </span>
                      )}
                    </div>
                    
                    <Button variant="ghost" size="sm">
                      <Settings className="h-4 w-4 mr-2" />
                      Configure
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="templates" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[
              {
                name: 'Customer Onboarding',
                description: 'Welcome new customers with email sequence',
                icon: Users,
                category: 'Customer Management'
              },
              {
                name: 'Payment Processing',
                description: 'Automate payment reminders and processing',
                icon: CreditCard,
                category: 'Billing'
              },
              {
                name: 'Booking Confirmations',
                description: 'Send booking confirmations and updates',
                icon: Calendar,
                category: 'Operations'
              }
            ].map((template, index) => (
              <Card key={index} className="hover:shadow-md transition-shadow cursor-pointer">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <template.icon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-base">{template.name}</CardTitle>
                      <Badge variant="outline" className="mt-1">{template.category}</Badge>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">{template.description}</p>
                  <Button variant="outline" className="w-full">
                    Use Template
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="logs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Automation Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  {
                    action: 'Payment Reminder sent',
                    target: 'john.smith@email.com',
                    time: '2 hours ago',
                    status: 'success'
                  },
                  {
                    action: 'New Customer Welcome triggered',
                    target: 'sarah.jones@email.com',
                    time: '4 hours ago',
                    status: 'success'
                  },
                  {
                    action: 'Overdue Payment Chase failed',
                    target: 'mike.wilson@email.com',
                    time: '6 hours ago',
                    status: 'error'
                  }
                ].map((log, index) => (
                  <div key={index} className="flex items-center justify-between py-2">
                    <div className="flex items-center gap-3">
                      {log.status === 'success' ? (
                        <CheckCircle className="h-4 w-4 text-emerald-500" />
                      ) : (
                        <AlertTriangle className="h-4 w-4 text-red-500" />
                      )}
                      <div>
                        <p className="text-sm font-medium">{log.action}</p>
                        <p className="text-xs text-muted-foreground">{log.target}</p>
                      </div>
                    </div>
                    <span className="text-xs text-muted-foreground">{log.time}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}