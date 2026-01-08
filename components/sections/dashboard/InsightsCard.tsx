import { Card } from "@/components/Layout";
import { Sparkles } from "lucide-react";
import { memo } from "react";

export const InsightsCard = memo<{
  isRuleMet: boolean;
  savingsRate: number;
  t: (key: string) => string;
}>(({ isRuleMet, savingsRate, t }) => (
  <Card title={t("dash.insight_title")}>
    <div className="flex flex-col gap-4">
      <div className="flex items-start gap-3">
        <div
          className={`p-2 rounded-lg ${
            isRuleMet
              ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400"
              : "bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400"
          }`}
        >
          <Sparkles size={20} />
        </div>
        <div className="flex-1">
          <h4 className="font-semibold text-sm text-slate-800 dark:text-slate-200">
            {t("dash.rule_title")}
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
            {isRuleMet ? t("dash.rule_pass") : t("dash.rule_fail")}
          </p>
          <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full mt-2 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                isRuleMet ? "bg-emerald-500" : "bg-amber-500"
              }`}
              style={{
                width: `${Math.max(0, Math.min(savingsRate, 100))}%`,
              }}
            />
          </div>
          <div className="text-[10px] text-slate-400 mt-1 text-right font-bold">
            {Math.round(savingsRate)}% {t("dash.savings_rate")}
          </div>
        </div>
      </div>
    </div>
  </Card>
));
InsightsCard.displayName = "InsightsCard";
