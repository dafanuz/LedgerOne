import { useEffect, useState, useMemo, useCallback } from "react";
import { useSettings } from "@/contexts/SettingsContext";
import { useAuth } from "@/contexts/AuthContext";
import { useTranslation } from "@/store";
import supabase from "@/utils/supabase";
import { Currency } from "@/types";
import { DashboardHeader } from "@/components/sections/dashboard/DashboardHeader";
import { NetIncomeCard } from "@/components/sections/dashboard/NetIncomeCard";
import { Summary, UserBalance } from "@/types/summary.type";
import { calculateSavingsRate, getGreetingKey } from "@/utils/helpers";
import { StatsGrid } from "@/components/sections/dashboard/StatsGrid";
import { InsightsCard } from "@/components/sections/dashboard/InsightsCard";
import { PeriodPerformanceHeader } from "@/components/sections/dashboard/PeriodPerformanceHeader";

type TimeFilter = "today" | "week" | "month" | "year" | "all";

const ONE_THIRD_RULE_THRESHOLD = 33;

export const Dashboard: React.FC = () => {
  const { currency } = useSettings();
  const { user } = useAuth();
  const { t } = useTranslation();

  const [filter, setFilter] = useState<TimeFilter>("month");
  const [summary, setSummary] = useState<Summary | null>({
    income: 0,
    expenses: 0,
    net_result: 0,
    income_trend: 0,
    expenses_trend: 0,
    net_result_trend: 0,
  });
  const [balance, setBalance] = useState<UserBalance | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingBalance, setIsLoadingBalance] = useState(true);

  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      if (!user?.id) return;

      try {
        setIsLoading(true);
        setError(null);

        const showTrend = filter === "month" || filter === "year";

        if (showTrend) {
          const [summaryResult, trendResult] = await Promise.all([
            supabase.rpc("rpc_get_financial_summary_v2", {
              p_user_id: user.id,
              p_period: filter,
            }),
            supabase.rpc("rpc_get_financial_trend", {
              p_user_id: user.id,
              p_period: filter,
            }),
          ]);

          if (summaryResult.error) throw summaryResult.error;
          if (trendResult.error) throw trendResult.error;

          if (isMounted) {
            setSummary({
              ...summaryResult.data?.[0],
              ...trendResult.data?.[0],
            });
          }
        } else {
          const { data, error: rpcError } = await supabase.rpc(
            "rpc_get_financial_summary",
            {
              p_user_id: user.id,
              p_period: filter,
            }
          );

          if (rpcError) throw rpcError;

          if (isMounted) {
            setSummary(data?.[0] || null);
          }
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : "Failed to fetch data");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, [filter, user?.id]);

  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();

    const fetchSummary = async () => {
      try {
        setIsLoadingBalance(true);
        setError(null);

        const { data: dataBalance, error: rpcBalanceError } =
          await supabase.rpc("rpc_get_balance_overview", {
            p_user_id: user.id,
          });
        if (isMounted) {
          setBalance(dataBalance?.[0] || null);
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : "Failed to fetch data");
          console.error("Dashboard fetch error:", err);
        }
      } finally {
        if (isMounted) {
          setIsLoadingBalance(false);
        }
      }
    };

    fetchSummary();

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, [user.id]);

  const greetingKey = useMemo(() => getGreetingKey(), []);

  const savingsRate = useMemo(() => {
    if (!summary) return 0;
    return calculateSavingsRate(summary.expenses, summary.income);
  }, [summary]);

  const isOneThirdRuleMet = useMemo(() => {
    return (
      !!summary && summary.income > 0 && savingsRate >= ONE_THIRD_RULE_THRESHOLD
    );
  }, [summary, savingsRate]);

  const handleFilterChange = useCallback((newFilter: TimeFilter) => {
    setFilter(newFilter);
  }, []);

  if (error) {
    return (
      <div className="p-6 space-y-6 pt-10">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <p className="text-red-800 dark:text-red-200">
            {t("common.error")}: {error}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 pt-10">
      <DashboardHeader greeting={t(greetingKey)} subtitle={t("dash.header")} />

      <NetIncomeCard
        total={balance?.net_worth || 0}
        assets={balance?.total_assets || 0}
        liabilities={balance?.total_liabilities || 0}
        accounts = {balance?.asset_accounts || []}
        currency={currency}
        isLoading={isLoadingBalance}
        t={t}
      />

      <PeriodPerformanceHeader value={filter} onChange={handleFilterChange} />

      {summary && (
        <StatsGrid
          summary={summary}
          currency={currency}
          t={t}
          isLoading={isLoading}
          filter={filter}
        />
      )}

      {summary && (
        <InsightsCard
          isRuleMet={isOneThirdRuleMet}
          savingsRate={savingsRate}
          t={t}
        />
      )}
    </div>
  );
};
