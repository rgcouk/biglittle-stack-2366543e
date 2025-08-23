import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { 
  FileText, 
  Download, 
  Mail, 
  TrendingUp, 
  BarChart3, 
  PieChart, 
  Calendar as CalendarIcon,
  Filter,
  Users,
  DollarSign,
  Building2,
  Clock
} from "lucide-react";
import { LineChart, Line, BarChart, Bar, PieChart as RechartsPieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format, startOfMonth, endOfMonth, subMonths } from "date-fns";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/currency";
import { useToast } from "@/hooks/use-toast";

const reportTypes = [
  { id: 'revenue', name: 'Revenue Report', icon: DollarSign, description: 'Detailed revenue analysis and trends' },
  { id: 'occupancy', name: 'Occupancy Report', icon: Building2, description: 'Unit occupancy rates and patterns' },
  { id: 'customer', name: 'Customer Report', icon: Users, description: 'Customer analytics and demographics' },
  { id: 'financial', name: 'Financial Summary', icon: BarChart3, description: 'Complete financial overview' },
  { id: 'performance', name: 'Performance Report', icon: TrendingUp, description: 'KPI tracking and performance metrics' },
];

const sampleRevenueData = [
  { month: 'Jan 2024', revenue: 12500, target: 15000, units: 45 },
  { month: 'Feb 2024', revenue: 14200, target: 15000, units: 48 },
  { month: 'Mar 2024', revenue: 15800, target: 15000, units: 52 },
  { month: 'Apr 2024', revenue: 16500, target: 16000, units: 54 },
  { month: 'May 2024', revenue: 17200, target: 16000, units: 56 },
  { month: 'Jun 2024', revenue: 18100, target: 17000, units: 58 },
];

const sampleOccupancyData = [
  { category: 'Small', occupied: 18, available: 2, revenue: 3600 },
  { category: 'Medium', occupied: 24, available: 6, revenue: 7200 },
  { category: 'Large', occupied: 12, available: 3, revenue: 4800 },
  { category: 'Extra Large', occupied: 4, available: 1, revenue: 2400 },
];

const customerSegmentData = [
  { name: 'Residential', value: 65, color: '#3b82f6' },
  { name: 'Business', value: 25, color: '#22c55e' },
  { name: 'Student', value: 10, color: '#f59e0b' },
];

export function AdvancedReporting() {
  const { toast } = useToast();
  const [selectedReport, setSelectedReport] = useState('revenue');
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date }>({
    from: startOfMonth(subMonths(new Date(), 5)),
    to: endOfMonth(new Date()),
  });
  const [fromDate, setFromDate] = useState<Date | undefined>(dateRange.from);
  const [toDate, setToDate] = useState<Date | undefined>(dateRange.to);

  const handleExportReport = (format: 'pdf' | 'excel' | 'csv') => {
    // Here you would implement actual export functionality
    toast({
      title: `Exporting ${selectedReport} report`,
      description: `Report will be exported as ${format.toUpperCase()}`,
    });
  };

  const handleEmailReport = () => {
    toast({
      title: "Email sent",
      description: "Report has been emailed to your registered address",
    });
  };

  const handleScheduleReport = () => {
    toast({
      title: "Report scheduled",
      description: "Automated report has been scheduled",
    });
  };

  return (
    <div className="space-y-6">
      {/* Report Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Advanced Reporting & Analytics
          </CardTitle>
          <CardDescription>
            Generate detailed reports and export business analytics
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {reportTypes.map((report) => (
              <Card
                key={report.id}
                className={cn(
                  "cursor-pointer transition-all hover:shadow-md",
                  selectedReport === report.id ? "ring-2 ring-primary" : ""
                )}
                onClick={() => setSelectedReport(report.id)}
              >
                <CardContent className="p-4 text-center">
                  <report.icon className="h-8 w-8 mx-auto mb-2 text-primary" />
                  <h3 className="font-medium mb-1">{report.name}</h3>
                  <p className="text-xs text-muted-foreground">{report.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Date Range and Controls */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <CalendarIcon className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Date Range:</span>
            </div>

            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm">
                  {fromDate ? format(fromDate, "MMM dd, yyyy") : "From date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={fromDate}
                  onSelect={setFromDate}
                  initialFocus
                  className="pointer-events-auto"
                />
              </PopoverContent>
            </Popover>

            <span className="text-muted-foreground">to</span>

            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm">
                  {toDate ? format(toDate, "MMM dd, yyyy") : "To date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={toDate}
                  onSelect={setToDate}
                  initialFocus
                  className="pointer-events-auto"
                />
              </PopoverContent>
            </Popover>

            <Separator orientation="vertical" className="h-6" />

            <div className="flex gap-2 ml-auto">
              <Button variant="outline" size="sm" onClick={() => handleExportReport('pdf')}>
                <Download className="h-4 w-4 mr-1" />
                PDF
              </Button>
              <Button variant="outline" size="sm" onClick={() => handleExportReport('excel')}>
                <Download className="h-4 w-4 mr-1" />
                Excel
              </Button>
              <Button variant="outline" size="sm" onClick={handleEmailReport}>
                <Mail className="h-4 w-4 mr-1" />
                Email
              </Button>
              <Button variant="outline" size="sm" onClick={handleScheduleReport}>
                <Clock className="h-4 w-4 mr-1" />
                Schedule
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Report Content */}
      <Tabs value={selectedReport} onValueChange={setSelectedReport}>
        <TabsContent value="revenue">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Revenue Trends</CardTitle>
                <CardDescription>Monthly revenue vs targets</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={sampleRevenueData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip formatter={(value, name) => [
                        formatCurrency(value as number), 
                        name === 'revenue' ? 'Actual Revenue' : 'Target Revenue'
                      ]} />
                      <Line type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={3} name="revenue" />
                      <Line type="monotone" dataKey="target" stroke="#22c55e" strokeDasharray="5 5" name="target" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Revenue Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="text-2xl font-bold">{formatCurrency(18100)}</div>
                  <p className="text-sm text-muted-foreground">Current Month</p>
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm">Total Revenue (6mo)</span>
                    <span className="font-medium">{formatCurrency(94300)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Average Monthly</span>
                    <span className="font-medium">{formatCurrency(15717)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Growth Rate</span>
                    <Badge variant="default">+12.3%</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Target Achievement</span>
                    <Badge variant="default">106.5%</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="occupancy">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Occupancy by Unit Type</CardTitle>
                <CardDescription>Current occupancy rates by unit category</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={sampleOccupancyData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="category" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="occupied" fill="#3b82f6" name="Occupied" />
                      <Bar dataKey="available" fill="#22c55e" name="Available" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Occupancy Statistics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {sampleOccupancyData.map((item) => {
                    const total = item.occupied + item.available;
                    const rate = Math.round((item.occupied / total) * 100);
                    return (
                      <div key={item.category} className="space-y-2">
                        <div className="flex justify-between">
                          <span className="font-medium">{item.category} Units</span>
                          <Badge variant={rate >= 80 ? "default" : rate >= 60 ? "secondary" : "outline"}>
                            {rate}%
                          </Badge>
                        </div>
                        <div className="grid grid-cols-3 gap-2 text-sm">
                          <div>Occupied: {item.occupied}</div>
                          <div>Available: {item.available}</div>
                          <div>Revenue: {formatCurrency(item.revenue)}</div>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ width: `${rate}%` }}
                          ></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="customer">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Customer Segments</CardTitle>
                <CardDescription>Customer breakdown by type</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsPieChart>
                      <Pie
                        data={customerSegmentData}
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        dataKey="value"
                        label={({ name, value }) => `${name}: ${value}%`}
                      >
                        {customerSegmentData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Customer Metrics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold">127</div>
                    <p className="text-sm text-muted-foreground">Total Customers</p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">12</div>
                    <p className="text-sm text-muted-foreground">New This Month</p>
                  </div>
                </div>
                
                <Separator />
                
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm">Avg. Lease Duration</span>
                    <span className="font-medium">14.2 months</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Customer Retention</span>
                    <Badge variant="default">89.3%</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Avg. Revenue per Customer</span>
                    <span className="font-medium">{formatCurrency(142)}/mo</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Payment Success Rate</span>
                    <Badge variant="default">96.8%</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="financial">
          <Card>
            <CardHeader>
              <CardTitle>Financial Overview</CardTitle>
              <CardDescription>Complete financial summary and key ratios</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="text-center space-y-2">
                  <DollarSign className="h-8 w-8 mx-auto text-green-600" />
                  <div className="text-2xl font-bold">{formatCurrency(18100)}</div>
                  <p className="text-sm text-muted-foreground">Monthly Revenue</p>
                  <Badge variant="default">+12.3%</Badge>
                </div>
                
                <div className="text-center space-y-2">
                  <TrendingUp className="h-8 w-8 mx-auto text-blue-600" />
                  <div className="text-2xl font-bold">{formatCurrency(3420)}</div>
                  <p className="text-sm text-muted-foreground">Operating Costs</p>
                  <Badge variant="secondary">+2.1%</Badge>
                </div>
                
                <div className="text-center space-y-2">
                  <BarChart3 className="h-8 w-8 mx-auto text-purple-600" />
                  <div className="text-2xl font-bold">{formatCurrency(14680)}</div>
                  <p className="text-sm text-muted-foreground">Net Profit</p>
                  <Badge variant="default">+18.7%</Badge>
                </div>
                
                <div className="text-center space-y-2">
                  <PieChart className="h-8 w-8 mx-auto text-orange-600" />
                  <div className="text-2xl font-bold">81.1%</div>
                  <p className="text-sm text-muted-foreground">Profit Margin</p>
                  <Badge variant="default">+4.2%</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance">
          <Card>
            <CardHeader>
              <CardTitle>Key Performance Indicators</CardTitle>
              <CardDescription>Track your business performance metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                Performance dashboard with KPI tracking coming soon...
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}