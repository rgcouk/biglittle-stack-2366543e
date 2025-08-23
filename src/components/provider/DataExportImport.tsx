import React, { useState } from 'react';
import { Download, Upload, FileText, Database, CalendarIcon, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

interface ExportOption {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  formats: string[];
  estimatedSize: string;
}

const exportOptions: ExportOption[] = [
  {
    id: 'units',
    name: 'Units Data',
    description: 'All unit information, pricing, and availability',
    icon: <Database className="h-4 w-4" />,
    formats: ['CSV', 'JSON', 'Excel'],
    estimatedSize: '2.3 MB'
  },
  {
    id: 'customers',
    name: 'Customer Data',
    description: 'Customer profiles and contact information',
    icon: <FileText className="h-4 w-4" />,
    formats: ['CSV', 'JSON', 'Excel'],
    estimatedSize: '1.8 MB'
  },
  {
    id: 'bookings',
    name: 'Bookings & Reservations',
    description: 'All booking history and current reservations',
    icon: <CalendarIcon className="h-4 w-4" />,
    formats: ['CSV', 'JSON', 'Excel'],
    estimatedSize: '5.1 MB'
  },
  {
    id: 'payments',
    name: 'Payment Records',
    description: 'Financial transactions and payment history',
    icon: <Database className="h-4 w-4" />,
    formats: ['CSV', 'JSON', 'Excel'],
    estimatedSize: '3.7 MB'
  }
];

export function DataExportImport() {
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [exportFormat, setExportFormat] = useState<string>('CSV');
  const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date }>({});
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [isImporting, setIsImporting] = useState(false);
  const { toast } = useToast();

  const handleOptionChange = (optionId: string, checked: boolean) => {
    if (checked) {
      setSelectedOptions([...selectedOptions, optionId]);
    } else {
      setSelectedOptions(selectedOptions.filter(id => id !== optionId));
    }
  };

  const handleExport = async () => {
    if (selectedOptions.length === 0) {
      toast({
        title: "No data selected",
        description: "Please select at least one data type to export.",
        variant: "destructive",
      });
      return;
    }

    setIsExporting(true);
    setExportProgress(0);

    // Simulate export progress
    const interval = setInterval(() => {
      setExportProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsExporting(false);
          toast({
            title: "Export Complete",
            description: `Your data has been exported as ${exportFormat} format.`,
          });
          return 100;
        }
        return prev + 10;
      });
    }, 200);
  };

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    
    // Simulate import process
    setTimeout(() => {
      setIsImporting(false);
      toast({
        title: "Import Complete",
        description: `Successfully imported data from ${file.name}`,
      });
    }, 3000);
  };

  const getSelectedSize = () => {
    const selectedItems = exportOptions.filter(opt => selectedOptions.includes(opt.id));
    const totalSizeMB = selectedItems.reduce((total, item) => {
      const size = parseFloat(item.estimatedSize.split(' ')[0]);
      return total + size;
    }, 0);
    return `${totalSizeMB.toFixed(1)} MB`;
  };

  return (
    <div className="space-y-6">
      {/* Export Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Export Data
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4">
            <div>
              <h4 className="text-sm font-medium mb-3">Select Data to Export</h4>
              <div className="grid gap-3">
                {exportOptions.map((option) => (
                  <div key={option.id} className="flex items-start space-x-3 p-3 border rounded-lg">
                    <Checkbox
                      id={option.id}
                      checked={selectedOptions.includes(option.id)}
                      onCheckedChange={(checked) => handleOptionChange(option.id, checked as boolean)}
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        {option.icon}
                        <label
                          htmlFor={option.id}
                          className="text-sm font-medium cursor-pointer"
                        >
                          {option.name}
                        </label>
                        <Badge variant="outline" className="text-xs">
                          {option.estimatedSize}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">{option.description}</p>
                      <div className="flex gap-1 mt-2">
                        {option.formats.map((format) => (
                          <Badge key={format} variant="secondary" className="text-xs">
                            {format}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Export Format</label>
                <Select value={exportFormat} onValueChange={setExportFormat}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CSV">CSV</SelectItem>
                    <SelectItem value="JSON">JSON</SelectItem>
                    <SelectItem value="Excel">Excel</SelectItem>
                    <SelectItem value="PDF">PDF Report</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Date Range (Optional)</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dateRange.from && dateRange.to
                        ? `${format(dateRange.from, 'MMM dd, yyyy')} - ${format(dateRange.to, 'MMM dd, yyyy')}`
                        : 'Select date range'
                      }
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <div className="p-3">
                      <p className="text-sm text-muted-foreground mb-2">Select date range for export</p>
                      <div className="space-y-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setDateRange({ 
                            from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), 
                            to: new Date() 
                          })}
                        >
                          Last 30 days
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setDateRange({ 
                            from: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000), 
                            to: new Date() 
                          })}
                        >
                          Last 90 days
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setDateRange({})}
                        >
                          Clear
                        </Button>
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            {selectedOptions.length > 0 && (
              <div className="bg-muted/50 p-4 rounded-lg">
                <div className="flex items-center justify-between text-sm">
                  <span>Selected: {selectedOptions.length} data types</span>
                  <span>Estimated size: {getSelectedSize()}</span>
                </div>
              </div>
            )}

            {isExporting && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Exporting data...</span>
                  <span>{exportProgress}%</span>
                </div>
                <Progress value={exportProgress} />
              </div>
            )}

            <Button 
              onClick={handleExport} 
              disabled={isExporting || selectedOptions.length === 0}
              className="w-full"
            >
              <Download className="h-4 w-4 mr-2" />
              {isExporting ? 'Exporting...' : 'Export Data'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Import Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Import Data
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
            <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <div className="space-y-2">
              <p className="text-sm font-medium">
                {isImporting ? 'Importing data...' : 'Import your data'}
              </p>
              <p className="text-xs text-muted-foreground">
                Supports CSV, JSON, and Excel files
              </p>
              <input
                type="file"
                accept=".csv,.json,.xlsx,.xls"
                onChange={handleImport}
                className="hidden"
                id="file-upload"
                disabled={isImporting}
              />
              <Button variant="outline" asChild disabled={isImporting}>
                <label htmlFor="file-upload" className="cursor-pointer">
                  {isImporting ? 'Processing...' : 'Choose File'}
                </label>
              </Button>
            </div>
          </div>

          <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-lg">
            <div className="flex gap-2">
              <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-amber-800 dark:text-amber-200">
                  Important Notes
                </p>
                <ul className="text-xs text-amber-700 dark:text-amber-300 mt-1 space-y-1">
                  <li>• Importing will overwrite existing data with matching IDs</li>
                  <li>• Make sure to backup your data before importing</li>
                  <li>• Large files may take several minutes to process</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}