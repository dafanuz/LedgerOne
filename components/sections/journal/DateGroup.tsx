import { memo, useMemo } from "react";
import { format } from "date-fns";

import { JournalLine } from "./JournalLine";

import { convertAmount, formatCurrency, formatDate } from "@/utils";

import { Currency, Language } from "@/types";
import { GroupEntry } from "@/types/journal.type";

export const DateGroup: React.FC<{
  date: string;
  entries: GroupEntry[];
  currency: Currency;
  language: Language;
  onNavigate: (id: string) => void;
}> = memo(({ date, entries, currency, language, onNavigate }) => {
  const dailyTotal = useMemo(() => {
    return entries.reduce((sum, entry) => {
      const entryTotal = (entry.lines || []).reduce(
        (s, line) => s + (line.debit || 0),
        0
      );
      return sum + convertAmount(entryTotal, currency, currency);
    }, 0);
  }, [entries, currency]);

  return (
    <div className="mb-6">
      <div className="flex justify-between items-end pb-1 mb-2 mt-4">
        <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
          {formatDate(date, language)}
        </h3>
      </div>
      <div className="space-y-2">
        {entries.map((entry) => {
          const time = format(new Date(entry.created_at!), "h:mm a");
          return entry.lines?.map((line, index) => (
            <JournalLine
              key={`line-${index}`}
              line={line}
              time={time}
              currency={currency}
              onNavigate={onNavigate}
            />
          ));
        })}
      </div>
    </div>
  );
});

DateGroup.displayName = "DateGroup";
