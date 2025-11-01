'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, Edit, ChevronDown, ChevronUp } from 'lucide-react';
import { ManualQuoteDay, ManualQuoteExpense } from '@/lib/api/types';
import { CurrencyDisplay } from '@/components/common/currency-display';
import { ExpenseForm } from './expense-form';
import type { CreateManualQuoteExpenseInput } from '@/lib/validators/manual-quote';

interface DayBuilderProps {
  days: ManualQuoteDay[];
  onAddExpense: (dayId: number, expense: CreateManualQuoteExpenseInput) => void;
  onUpdateExpense: (expenseId: number, expense: Partial<CreateManualQuoteExpenseInput>) => void;
  onRemoveExpense: (expenseId: number) => void;
  onRemoveDay: (dayId: number) => void;
  transportPricingMode?: string;
  currency?: 'USD' | 'EUR' | 'TRY';
}

const EXPENSE_CATEGORY_LABELS: Record<string, string> = {
  hotelAccommodation: 'Hotel',
  meals: 'Meals',
  entranceFees: 'Entrance',
  sicTourCost: 'SIC Tour',
  tips: 'Tips',
  transportation: 'Transport',
  guide: 'Guide',
  guideDriverAccommodation: 'Guide/Driver',
  parking: 'Parking',
};

export function DayBuilder({
  days,
  onAddExpense,
  onUpdateExpense,
  onRemoveExpense,
  onRemoveDay,
  transportPricingMode = 'total',
  currency = 'EUR',
}: DayBuilderProps) {
  const [expandedDays, setExpandedDays] = useState<Set<number>>(new Set(days.map(d => d.id)));
  const [expenseFormOpen, setExpenseFormOpen] = useState(false);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [editingExpense, setEditingExpense] = useState<ManualQuoteExpense | null>(null);

  const toggleDay = (dayId: number) => {
    const newExpanded = new Set(expandedDays);
    if (newExpanded.has(dayId)) {
      newExpanded.delete(dayId);
    } else {
      newExpanded.add(dayId);
    }
    setExpandedDays(newExpanded);
  };

  const handleAddExpense = (dayId: number) => {
    setSelectedDay(dayId);
    setEditingExpense(null);
    setExpenseFormOpen(true);
  };

  const handleEditExpense = (expense: ManualQuoteExpense) => {
    setEditingExpense(expense);
    setExpenseFormOpen(true);
  };

  const handleExpenseSubmit = (data: CreateManualQuoteExpenseInput) => {
    if (editingExpense) {
      onUpdateExpense(editingExpense.id, data);
    } else if (selectedDay) {
      onAddExpense(selectedDay, data);
    }
    setExpenseFormOpen(false);
    setEditingExpense(null);
    setSelectedDay(null);
  };

  if (days.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-gray-500">
          No days added yet. Days will be auto-generated based on start/end dates.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {days.map((day) => {
        const isExpanded = expandedDays.has(day.id);
        const totalExpenses = day.expenses.reduce((sum, exp) => sum + Number(exp.price), 0);

        return (
          <Card key={day.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleDay(day.id)}
                  >
                    {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </Button>
                  <CardTitle className="text-lg">
                    Day {day.dayNumber} - {new Date(day.date).toLocaleDateString()}
                  </CardTitle>
                  <Badge variant="outline">
                    {day.expenses.length} expense{day.expenses.length !== 1 ? 's' : ''}
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">
                    Total: <CurrencyDisplay amount={totalExpenses} currency={currency} />
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleAddExpense(day.id)}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add Expense
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onRemoveDay(day.id)}
                  >
                    <Trash2 className="h-4 w-4 text-red-600" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            {isExpanded && (
              <CardContent>
                {day.expenses.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-4">
                    No expenses added for this day
                  </p>
                ) : (
                  <div className="space-y-2">
                    {day.expenses.map((expense) => (
                      <div
                        key={expense.id}
                        className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <Badge>{EXPENSE_CATEGORY_LABELS[expense.category] || expense.category}</Badge>
                            {expense.location && (
                              <span className="text-sm text-gray-600">{expense.location}</span>
                            )}
                          </div>
                          {expense.description && (
                            <p className="text-sm text-gray-600 mt-1">{expense.description}</p>
                          )}
                          <div className="flex gap-4 mt-2 text-xs text-gray-500">
                            <span>Base: <CurrencyDisplay amount={expense.price} currency={currency} /></span>
                            {expense.singleSupplement && (
                              <span>Single: +<CurrencyDisplay amount={expense.singleSupplement} currency={currency} /></span>
                            )}
                            {expense.vehicleCount && (
                              <span>{expense.vehicleCount} vehicle(s)</span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditExpense(expense)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onRemoveExpense(expense.id)}
                          >
                            <Trash2 className="h-4 w-4 text-red-600" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            )}
          </Card>
        );
      })}

      <ExpenseForm
        open={expenseFormOpen}
        onOpenChange={setExpenseFormOpen}
        onSubmit={handleExpenseSubmit}
        defaultValues={editingExpense || undefined}
        transportPricingMode={transportPricingMode}
      />
    </div>
  );
}
