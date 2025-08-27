import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { 
  Settings, 
  Bell, 
  Lock, 
  Users, 
  CreditCard,
  Mail,
  Phone,
  MapPin,
  Save,
  Upload,
  Trash2,
  Shield,
  Plus,
  Loader2
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/hooks/useAuth';
import { useProviderFacilities, useUpdateFacility } from '@/hooks/useFacilities';
import { useToast } from '@/hooks/use-toast';

export function SettingsManager() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { data: facilities, isLoading: facilitiesLoading } = useProviderFacilities();
  const updateFacility = useUpdateFacility();
  
  // Get the first facility (assuming single facility for now)
  const facility = facilities?.[0];
  
  const [notifications, setNotifications] = useState({
    email: true,
    sms: false,
    push: true,
    marketing: false
  });

  const [security, setSecurity] = useState({
    twoFactor: false,
    loginAlerts: true,
    sessionTimeout: 30
  });

  const [formData, setFormData] = useState({
    facilityName: '',
    address: '',
    facilityPhone: '',
    facilityEmail: '',
    description: '',
    operatingHours: `Monday - Friday: 8:00 AM - 8:00 PM
Saturday: 9:00 AM - 6:00 PM
Sunday: 10:00 AM - 4:00 PM`
  });

  const [personalData, setPersonalData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: ''
  });

  // Load facility data when it becomes available
  useEffect(() => {
    if (facility) {
      setFormData({
        facilityName: facility.name || '',
        address: facility.address || '',
        facilityPhone: facility.phone || '',
        facilityEmail: facility.email || '',
        description: facility.description || '',
        operatingHours: `Monday - Friday: 8:00 AM - 8:00 PM
Saturday: 9:00 AM - 6:00 PM
Sunday: 10:00 AM - 4:00 PM`
      });
    }
  }, [facility]);

  // Load user data
  useEffect(() => {
    if (user) {
      const firstName = user.user_metadata?.first_name || user.email?.split('@')[0] || '';
      const lastName = user.user_metadata?.last_name || '';
      setPersonalData({
        firstName,
        lastName,
        email: user.email || '',
        phone: user.user_metadata?.phone || ''
      });
    }
  }, [user]);

  const handleSaveChanges = async () => {
    if (!facility) {
      toast({
        title: "Error", 
        description: "No facility found to update",
        variant: "destructive"
      });
      return;
    }

    try {
      await updateFacility.mutateAsync({
        id: facility.id,
        updates: {
          name: formData.facilityName,
          address: formData.address,
          phone: formData.facilityPhone,
          email: formData.facilityEmail,
          description: formData.description
        }
      });
    } catch (error) {
      console.error('Error updating facility:', error);
    }
  };

  if (facilitiesLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground">Manage your account and facility preferences</p>
        </div>
        
        <Button onClick={handleSaveChanges} disabled={updateFacility.isPending}>
          {updateFacility.isPending ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Save className="h-4 w-4 mr-2" />
          )}
          Save Changes
        </Button>
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="facility">Facility</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="billing">Billing</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center space-x-4">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={user?.user_metadata?.avatar_url} />
                  <AvatarFallback>
                    {personalData.firstName.charAt(0)}{personalData.lastName.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="space-y-2">
                  <Button variant="outline">
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Photo
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Remove
                  </Button>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input 
                    id="firstName" 
                    value={personalData.firstName}
                    onChange={(e) => setPersonalData({...personalData, firstName: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input 
                    id="lastName" 
                    value={personalData.lastName}
                    onChange={(e) => setPersonalData({...personalData, lastName: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input 
                    id="email" 
                    type="email" 
                    value={personalData.email}
                    onChange={(e) => setPersonalData({...personalData, email: e.target.value})}
                    disabled
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input 
                    id="phone" 
                    type="tel" 
                    value={personalData.phone}
                    onChange={(e) => setPersonalData({...personalData, phone: e.target.value})}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="timezone">Timezone</Label>
                <Select defaultValue="europe/london">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="europe/london">Europe/London (GMT)</SelectItem>
                    <SelectItem value="america/new_york">America/New_York (EST)</SelectItem>
                    <SelectItem value="america/los_angeles">America/Los_Angeles (PST)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="facility" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Facility Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="facilityName">Facility Name</Label>
                <Input 
                  id="facilityName" 
                  value={formData.facilityName}
                  onChange={(e) => setFormData({...formData, facilityName: e.target.value})}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Textarea 
                  id="address" 
                  value={formData.address}
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
                  rows={3}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="facilityPhone">Phone</Label>
                  <Input 
                    id="facilityPhone" 
                    value={formData.facilityPhone}
                    onChange={(e) => setFormData({...formData, facilityPhone: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="facilityEmail">Email</Label>
                  <Input 
                    id="facilityEmail" 
                    value={formData.facilityEmail}
                    onChange={(e) => setFormData({...formData, facilityEmail: e.target.value})}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="hours">Operating Hours</Label>
                <Textarea 
                  id="hours"
                  value={formData.operatingHours}
                  onChange={(e) => setFormData({...formData, operatingHours: e.target.value})}
                  rows={4}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Facility Description</Label>
                <Textarea 
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Describe your facility's features and amenities..."
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Access & Security Features</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { name: '24/7 Access', enabled: true },
                { name: 'CCTV Monitoring', enabled: true },
                { name: 'Electronic Gate Access', enabled: true },
                { name: 'Climate Control', enabled: false },
                { name: 'Moving Supplies', enabled: true },
                { name: 'Truck Rental', enabled: false }
              ].map((feature) => (
                <div key={feature.name} className="flex items-center justify-between">
                  <Label>{feature.name}</Label>
                  <Switch defaultChecked={feature.enabled} />
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notification Preferences
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Email Notifications</Label>
                    <p className="text-sm text-muted-foreground">Receive updates via email</p>
                  </div>
                  <Switch 
                    checked={notifications.email}
                    onCheckedChange={(checked) => setNotifications({...notifications, email: checked})}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label>SMS Notifications</Label>
                    <p className="text-sm text-muted-foreground">Receive urgent alerts via SMS</p>
                  </div>
                  <Switch 
                    checked={notifications.sms}
                    onCheckedChange={(checked) => setNotifications({...notifications, sms: checked})}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Push Notifications</Label>
                    <p className="text-sm text-muted-foreground">Browser and mobile notifications</p>
                  </div>
                  <Switch 
                    checked={notifications.push}
                    onCheckedChange={(checked) => setNotifications({...notifications, push: checked})}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Marketing Updates</Label>
                    <p className="text-sm text-muted-foreground">Product updates and tips</p>
                  </div>
                  <Switch 
                    checked={notifications.marketing}
                    onCheckedChange={(checked) => setNotifications({...notifications, marketing: checked})}
                  />
                </div>
              </div>
              
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold mb-4">Notification Types</h3>
                <div className="space-y-3">
                  {[
                    'New customer bookings',
                    'Payment confirmations',
                    'Overdue payments',
                    'Unit availability changes',
                    'Security alerts',
                    'System maintenance'
                  ].map((type) => (
                    <div key={type} className="flex items-center justify-between">
                      <Label>{type}</Label>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <Mail className="h-3 w-3" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Phone className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Security Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Two-Factor Authentication</Label>
                    <p className="text-sm text-muted-foreground">Add extra security to your account</p>
                  </div>
                  <Switch 
                    checked={security.twoFactor}
                    onCheckedChange={(checked) => setSecurity({...security, twoFactor: checked})}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Login Alerts</Label>
                    <p className="text-sm text-muted-foreground">Get notified of new sign-ins</p>
                  </div>
                  <Switch 
                    checked={security.loginAlerts}
                    onCheckedChange={(checked) => setSecurity({...security, loginAlerts: checked})}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Session Timeout (minutes)</Label>
                  <Select 
                    value={security.sessionTimeout.toString()}
                    onValueChange={(value) => setSecurity({...security, sessionTimeout: parseInt(value)})}
                  >
                    <SelectTrigger className="w-48">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="15">15 minutes</SelectItem>
                      <SelectItem value="30">30 minutes</SelectItem>
                      <SelectItem value="60">1 hour</SelectItem>
                      <SelectItem value="120">2 hours</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold mb-4">Password</h3>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Current Password</Label>
                    <Input type="password" />
                  </div>
                  <div className="space-y-2">
                    <Label>New Password</Label>
                    <Input type="password" />
                  </div>
                  <div className="space-y-2">
                    <Label>Confirm New Password</Label>
                    <Input type="password" />
                  </div>
                  <Button>Update Password</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="billing" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Billing Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Payment Methods</h3>
                <div className="border rounded-lg p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <CreditCard className="h-5 w-5" />
                    <div>
                      <p className="font-medium">•••• •••• •••• 4242</p>
                      <p className="text-sm text-muted-foreground">Expires 12/2028</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">Update</Button>
                </div>
                <Button variant="outline">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Payment Method
                </Button>
              </div>
              
              <div className="space-y-4 border-t pt-6">
                <h3 className="text-lg font-semibold">Billing Address</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Street Address</Label>
                    <Input defaultValue="123 Business Street" />
                  </div>
                  <div className="space-y-2">
                    <Label>City</Label>
                    <Input defaultValue="London" />
                  </div>
                  <div className="space-y-2">
                    <Label>Postal Code</Label>
                    <Input defaultValue="SW1A 1AA" />
                  </div>
                  <div className="space-y-2">
                    <Label>Country</Label>
                    <Select defaultValue="uk">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="uk">United Kingdom</SelectItem>
                        <SelectItem value="us">United States</SelectItem>
                        <SelectItem value="ca">Canada</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}