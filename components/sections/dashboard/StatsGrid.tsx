import { StatCard } from "@/components/ui/card/StatCard";
import { Currency, TimeFilter } from "@/types";
import { Summary } from "@/types/summary.type";
import { convertAmount } from "@/utils";
import { ArrowUp, TrendingUp } from "lucide-react";
import { memo, useMemo } from "react";

export const StatsGrid = memo<{
  summary: Summary;
  currency: Currency;
  isLoading: boolean;
  filter: TimeFilter;
  t: (key: string) => string;
}>(({ summary, currency, isLoading, filter, t }) => {
  const stats = useMemo(
    () => [
      {
        label: t("dash.total_income"),
        amount: convertAmount(summary.income, Currency.IDR, currency),
        trend: summary.income_trend || 0,
        color: "green" as const,
        icon: <ArrowUp size={18} className="rotate-45" />,
        inverse: false,
      },
      {
        label: t("dash.total_expenses"),
        amount: convertAmount(summary.expenses, Currency.IDR, currency),
        trend: summary.expenses_trend || 0,
        color: "red" as const,
        icon: <ArrowUp size={18} className="rotate-[140deg]" />,
        inverse: false,
      },
      {
        label: `${t("dash.net_result")} (${filter.toUpperCase()})`,
        amount: convertAmount(summary.net_result, Currency.IDR, currency),
        trend: summary.net_result_trend || 0,
        color: "green" as const,
        icon: <TrendingUp size={18} />,
        inverse: true,
        className:
          "!flex-row-reverse !h-max justify-between !col-span-2 bg-slate-50 dark:bg-slate-800/50",
      },
    ],
    [summary, currency, t]
  );

  return (
    <div className="grid grid-cols-2 gap-4">
      {stats.map((stat, index) => (
        <StatCard
          key={index}
          {...stat}
          currency={currency}
          isLoading={isLoading}
        />
      ))}
    </div>
  );
});

StatsGrid.displayName = "StatsGrid";
