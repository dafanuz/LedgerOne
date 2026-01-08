import { memo, useState } from "react";
import { ChevronDown, Activity } from "lucide-react";

const PERIODS = [
  { value: "today", label: "TODAY" },
  { value: "week", label: "WEEK" },
  { value: "month", label: "MONTH" },
  { value: "year", label: "YEAR" },
  { value: "all", label: "ALL" },
] as const;

type Period = (typeof PERIODS)[number]["value"];

export const PeriodPerformanceHeader = memo(({
  value,
  onChange,
}: {
  value: Period;
  onChange: (v: Period) => void;
}) => {
  const [open, setOpen] = useState(false);

  const current = PERIODS.find((p) => p.value === value);

  return (
    <div className="flex items-center justify-between">
      {/* LEFT TITLE */}
      <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-sm font-medium tracking-wide uppercase">
        <Activity size={16} className="text-blue-500" />
        <span>Period Performance</span>
      </div>

      {/* DROPDOWN */}
      <div className="relative">
        <button
          onClick={() => setOpen(!open)}
          className="
            flex items-center gap-2
            px-4 py-2
            rounded-full
            bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 border border-slate-100 dark:border-slate-800
            text-white text-sm font-semibold
            shadow-[inset_0_0_0_1px_rgba(255,255,255,0.06)]
            transition-all
          "
        >
          {current?.label}
          <ChevronDown
            size={16}
            className={`transition-transform ${open ? "rotate-180" : ""}`}
          />
        </button>

        {/* MENU */}
        {open && (
          <div
            className="
              absolute right-0 mt-2 w-36
              rounded-2xl
              bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 border border-slate-100 dark:border-slate-800
              shadow-xl
              ring-1 ring-white/10
              overflow-hidden
              z-50
            "
          >
            {PERIODS.map((p) => (
              <button
                key={p.value}
                onClick={() => {
                  onChange(p.value);
                  setOpen(false);
                }}
                className={`
                  w-full text-left px-4 py-2 text-sm
                  transition-colors
                  ${value === p.value
                    ? "bg-blue-600/20 text-blue-400"
                    : "text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                  }
                `}
              >
                {p.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
});

PeriodPerformanceHeader.displayName = "PeriodPerformanceHeader";
