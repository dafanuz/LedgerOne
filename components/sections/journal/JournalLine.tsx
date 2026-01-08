import { IconRenderer } from "@/components/ui/icon/icon";
import { Currency } from "@/types";
import { Line } from "@/types/journal.type";
import { convertAmount, formatCurrency } from "@/utils";
import { ArrowRight } from "lucide-react";
import React, { memo } from "react";

export const JournalLine: React.FC<{
  line: Line;
  time: string;
  currency: Currency;
  onNavigate: (id: string) => void;
}> = memo(({ line, time, currency, onNavigate }) => {
  const isIncome = line.is_income;
  const isNegative = line.amount.toString().startsWith("-");
  const bgClass = isIncome
    ? "bg-emerald-50 dark:bg-emerald-900/20"
    : "bg-rose-50 dark:bg-rose-900/20";
  const amountClass =
    line.account_type_label === "TRANSFER"
      ? "text-blue-600 dark:text-blue-400"
      : isNegative
      ? "text-rose-600 dark:text-rose-400"
      : "text-emerald-600 dark:text-emerald-400";

  return (
    <div
      onClick={() => onNavigate(line.transaction_id!)}
      className="bg-white dark:bg-[#0f1729] p-4 rounded-2xl border border-slate-100 dark:border-slate-800 transition-colors flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer active:scale-[0.99]"
    >
      <div className="flex items-center gap-4">
        <div
          className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shadow-sm bg-slate-50 dark:bg-[#1e293b]`}
        >
          <IconRenderer
            name={line.account_emoji}
            className={`text-lg ${amountClass}`}
          />
        </div>
        <div className="flex flex-col">
          <span className="font-bold text-sm text-slate-800 dark:text-white">
            {line.account_type_label === "TRANSFER" ? (
              <span className="flex items-center gap-1">
                {line.account_name} <ArrowRight size={12} />{" "}
                {line.dest_account_name}
              </span>
            ) : (
              line.account_name
            )}
          </span>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-medium text-slate-400 dark:text-slate-500 truncate max-w-[120px] uppercase">
              {line.dest_account_name}
            </span>
            {/* <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">
              {time}
            </span>
            {line.description && (
              <>
                <span className="text-[10px] text-slate-300">•</span>
                <span className="text-[10px] text-slate-400 dark:text-slate-500 truncate max-w-[120px] italic">
                  {line.description}
                </span>
              </>
            )} */}
          </div>
        </div>
      </div>
      <div
        className={`text-sm font-mono tracking-tight ${amountClass} line-clamp-1`}
      >
        {formatCurrency(
          convertAmount(line.amount || 0, Currency.IDR, currency),
          currency
        )}
      </div>
    </div>
  );
});

JournalLine.displayName = "JournalLine";
