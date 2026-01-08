import { memo } from "react";
import { Currency } from "@/types";
import { formatCurrency } from "@/utils";
import { TrendingDown, TrendingUp } from "lucide-react";
import { P } from "@/dist/assets/ui-JalTEb1u";

interface StatCardProps {
  label: string;
  amount: number;
  currency: Currency;
  trend?: number | null;
  color: "green" | "red" | "blue" | "gray";
  inverse?: boolean;
  className?: string;
  icon?: React.ReactNode;
  isLoading?: boolean;
}

const ICON_BG_MAP = {
  default: "text-slate-800 dark:text-slate-100",
  green:
    "bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400",
  red: "bg-rose-100 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400",
  blue: "bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400",
  gray: "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400",
} as const;

export const StatCard = memo<StatCardProps>(
  ({
    label,
    amount,
    currency,
    trend,
    color,
    inverse = false,
    className = "",
    icon,
    isLoading,
  }) => {
    const isPositive = trend !== null && trend !== undefined && trend > 0;
    const hasTrend = trend !== null && trend !== undefined;

    const getColor = () => {
      if (inverse) {
        if (amount > 0) {
          return ICON_BG_MAP["green"];
        } else {
          return ICON_BG_MAP["red"];
        }
      }
      return null;
    };

    const getTrending = () => {
      if (inverse) {
        if (amount > 0) return true;

        if (amount <= 0) return false;
      }

      return null;
    };

    const iconTrend = getTrending();
    const colorClass = getColor();

    return (
      <div
        className={`bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col justify-between h-32 transition-colors ${className}`}
      >
        <div className="flex justify-between items-start gap-2">
          <div className="flex items-center gap-2">
            {icon && (
              <div
                className={`p-1.5 rounded-md ${
                  inverse
                    ? ICON_BG_MAP["blue"]
                    : ICON_BG_MAP[color]
                }`}
              >
                {icon}
              </div>
            )}
          </div>
          {/* {hasTrend && (
            <div
              className={`flex items-center text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-opacity-10 dark:bg-opacity-20 ${
                inverse
                  ? iconTrend
                    ? ICON_BG_MAP["green"]
                    : ICON_BG_MAP["red"]
                  : ICON_BG_MAP[color]
              }`}
            >
              {isPositive ? "+" : "-"}
              {Math.round(trend)}%
            </div>
          )} */}
        </div>
        <div>
          <div className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase mb-1 tracking-tight">
            {label}
          </div>
          <div className="text-lg font-bold text-slate-800 dark:text-slate-100 truncate">
            {isLoading ? (
              <div className="flex items-center justify-start py-2">
                <span className="w-2 h-2 mx-1 bg-slate-800 dark:bg-slate-100 rounded-full animate-wave"></span>
                <span className="w-2 h-2 mx-1 bg-slate-800 dark:bg-slate-100 rounded-full animate-wave [animation-delay:200ms]"></span>
                <span className="w-2 h-2 mx-1 bg-slate-800 dark:bg-slate-100 rounded-full animate-wave [animation-delay:400ms]"></span>
              </div>
            ) : (
              <span
                className={` ${
                  inverse
                    ? iconTrend
                      ? ICON_BG_MAP["green"]
                      : ICON_BG_MAP["red"]
                    : ICON_BG_MAP[color]
                } !bg-transparent`}
              >
                {formatCurrency(amount, currency)}
              </span>
            )}
          </div>
        </div>
      </div>
    );
  }
);

StatCard.displayName = "StatCard";
