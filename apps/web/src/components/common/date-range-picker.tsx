'use client';

import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

interface DateRangePickerProps {
  startDate: string;
  endDate: string;
  onStartDateChange: (date: string) => void;
  onEndDateChange: (date: string) => void;
  minDate?: string;
  maxDate?: string;
  startLabel?: string;
  endLabel?: string;
  className?: string;
  disabled?: boolean;
}

export function DateRangePicker({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  minDate,
  maxDate,
  startLabel = 'Start Date',
  endLabel = 'End Date',
  className = '',
  disabled = false,
}: DateRangePickerProps) {
  return (
    <div className={cn('grid grid-cols-1 md:grid-cols-2 gap-4', className)}>
      <div className="space-y-2">
        <Label htmlFor="start-date">{startLabel}</Label>
        <Input
          id="start-date"
          type="date"
          value={startDate}
          onChange={(e) => onStartDateChange(e.target.value)}
          min={minDate}
          max={endDate || maxDate}
          disabled={disabled}
          className="w-full"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="end-date">{endLabel}</Label>
        <Input
          id="end-date"
          type="date"
          value={endDate}
          onChange={(e) => onEndDateChange(e.target.value)}
          min={startDate || minDate}
          max={maxDate}
          disabled={disabled}
          className="w-full"
        />
      </div>
    </div>
  );
}

// Single date picker component for convenience
interface DatePickerProps {
  value: string;
  onChange: (date: string) => void;
  label?: string;
  minDate?: string;
  maxDate?: string;
  className?: string;
  disabled?: boolean;
}

export function DatePicker({
  value,
  onChange,
  label,
  minDate,
  maxDate,
  className = '',
  disabled = false,
}: DatePickerProps) {
  return (
    <div className={cn('space-y-2', className)}>
      {label && <Label htmlFor="date-picker">{label}</Label>}
      <Input
        id="date-picker"
        type="date"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        min={minDate}
        max={maxDate}
        disabled={disabled}
        className="w-full"
      />
    </div>
  );
}
