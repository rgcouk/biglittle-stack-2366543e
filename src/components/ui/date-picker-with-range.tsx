import React from 'react';
import { Button } from '@/components/ui/button';
import { Calendar } from 'lucide-react';

interface DatePickerWithRangeProps {
  className?: string;
}

export function DatePickerWithRange({ className }: DatePickerWithRangeProps) {
  return (
    <Button variant="outline" className={className}>
      <Calendar className="h-4 w-4 mr-2" />
      Select date range
    </Button>
  );
}