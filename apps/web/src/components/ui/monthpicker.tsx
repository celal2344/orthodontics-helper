"use client";

import type { TranslationKey } from "@orthodontics-helper/i18n";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const monthRows = [
  [0, 1, 2, 3],
  [4, 5, 6, 7],
  [8, 9, 10, 11],
] as const;

export function MonthPicker({
  selectedMonth,
  onMonthSelect,
  minDate,
  maxDate,
  className,
  t,
}: {
  selectedMonth: Date;
  onMonthSelect: (date: Date) => void;
  minDate?: Date;
  maxDate?: Date;
  className?: string;
  t: (key: TranslationKey) => string;
}) {
  const [visibleYear, setVisibleYear] = useState(selectedMonth.getFullYear());

  useEffect(() => {
    setVisibleYear(selectedMonth.getFullYear());
  }, [selectedMonth]);

  return (
    <div className={cn("w-72 rounded-md border bg-background p-3 shadow-lg", className)}>
      <div className="relative mb-3 flex items-center justify-center">
        <Button
          aria-label="Previous year"
          className="absolute left-0 size-8 px-0"
          variant="outline"
          onClick={() => setVisibleYear((year) => year - 1)}
        >
          <ChevronLeft aria-hidden="true" />
        </Button>
        <p className="text-sm font-medium">{visibleYear}</p>
        <Button
          aria-label="Next year"
          className="absolute right-0 size-8 px-0"
          variant="outline"
          onClick={() => setVisibleYear((year) => year + 1)}
        >
          <ChevronRight aria-hidden="true" />
        </Button>
      </div>

      <div className="grid grid-cols-4 gap-2">
        {monthRows.flat().map((monthIndex) => {
          const monthDate = new Date(visibleYear, monthIndex, 1);
          const selected =
            selectedMonth.getFullYear() === visibleYear &&
            selectedMonth.getMonth() === monthIndex;
          const disabled =
            (minDate && monthDate < firstOfMonth(minDate)) ||
            (maxDate && monthDate > firstOfMonth(maxDate));

          return (
            <Button
              className="h-9 px-2 text-xs"
              disabled={disabled}
              key={monthIndex}
              variant={selected ? "default" : "ghost"}
              onClick={() => onMonthSelect(monthDate)}
            >
              {t(`month.short.${monthIndex}` as TranslationKey)}
            </Button>
          );
        })}
      </div>
    </div>
  );
}

function firstOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}
