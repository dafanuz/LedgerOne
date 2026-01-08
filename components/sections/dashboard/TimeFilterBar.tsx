import { TimeFilter } from "@/types";
import { memo } from "react";

export const TimeFilterBar = memo<{
  filters: TimeFilter[];
  activeFilter: TimeFilter;
  onFilterChange: (filter: TimeFilter) => void;
  t: (key: string) => string;
}>(({ filters, activeFilter, onFilterChange, t }) => (
  <div className="flex space-x-2 overflow-x-auto pb-2 scrollbar-hide">
    {filters.map((f) => (
      <button
        key={f}
        onClick={() => onFilterChange(f)}
        className={`px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
          activeFilter === f
            ? "bg-primary-600 text-white shadow-lg shadow-primary-500/30"
            : "bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 border border-slate-100 dark:border-slate-800"
        }`}
      >
        {t(`time.${f}`)}
      </button>
    ))}
  </div>
));

TimeFilterBar.displayName = "TimeFilterBar";