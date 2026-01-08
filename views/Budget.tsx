import React, { useState, useMemo, useEffect } from "react";
import { useTranslation } from "../store";
import { formatCurrency, convertAmount } from "../utils";
import { Button } from "../components/Layout";
import {
  Plus,
  X,
  ChevronDown,
  ChevronLeft,
  Trash2,
  Edit2,
  History,
  Check,
} from "lucide-react";
import { Currency } from "../types";
import type { Budget as BudgetType } from "@/types/budget.type";
import { endOfMonth, differenceInDays } from "date-fns";
import { useSettings } from "@/contexts/SettingsContext";
import { useAccountTypes } from "@/contexts/AccountTypeContext";
import { useAccounts } from "@/hooks/useAccounts";
import supabase from "@/utils/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { IconRenderer } from "@/components/ui/icon/icon";
import { LoadingState } from "@/components/ui/loading/LoadingState";

export const BudgetPage: React.FC = () => {
  const { user } = useAuth();
  const { AccountTypeMapByName } = useAccountTypes();

  const { accounts } = useAccounts();
  const { currency } = useSettings();
  const { t } = useTranslation();

  const [viewState, setViewState] = useState<"list" | "detail" | "form">(
    "list"
  );
  const [selectedBudget, setSelectedBudget] = useState<BudgetType | null>(null);
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  const [budgets, setBudgets] = useState<BudgetType[]>([]);
  const [budgetHistory, setBudgetHistory] = useState<
    {
      transaction_id: string;
      transaction_date: string;
      description: string;
      amount: number;
    }[]
  >([]);

  const [formAccountId, setFormAccountId] = useState("");
  const [formLimit, setFormLimit] = useState("");
  const [displayLimit, setDisplayLimit] = useState("");
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const now = new Date();
  const daysLeftInMonth = differenceInDays(endOfMonth(now), now);

  const expenseAccounts = useMemo(() => {
    const excludeIds = [
      "5996eef7-e5d4-4ff6-8437-f047b708b278",
      "8cf750ad-6705-4100-b47d-6aea5f2811fe",
      "471f020a-1d19-4d7d-af27-33d279ca31c5",
      "b618c3cc-46ac-4b69-8760-d99378fa906e",
    ];
    const alreadyBudgetedIds = budgets.map((b) => b.account_id);

    return accounts.filter(
      (a) =>
        a.account_type_id === AccountTypeMapByName.Expense &&
        !excludeIds.includes(a.id) &&
        (selectedBudget?.account_id === a.id ||
          !alreadyBudgetedIds.includes(a.id))
    );
  }, [accounts, budgets, selectedBudget]);

  const formatWithDots = (val: string) => {
    if (!val) return "";
    const num = val.toString().replace(/\D/g, "");
    return num.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };

  const getAccountData = (accId: string) => {
    const acc = accounts.find((a) => a.id === accId);
    if (!acc) return { name: "Unknown", emoji: "💸" };
    const key = `acc.${acc.name}`;
    const translated = t(key);
    return {
      name: translated !== key ? translated : acc.name,
      emoji: acc.emoji || "💸",
    };
  };

  const getCurrencySymbol = (currency: Currency) => {
    switch (currency) {
      case Currency.IDR:
        return "Rp";
      case Currency.USD:
        return "$";
      case Currency.EUR:
        return "€";
      case Currency.JPY:
        return "¥";
      default:
        return currency;
    }
  };

  const getStatusColor = (remainingPercent: number, isOver: boolean) => {
    if (isOver || remainingPercent <= 20)
      return { text: "text-rose-500", bg: "bg-rose-500" };
    if (remainingPercent <= 50)
      return { text: "text-amber-500", bg: "bg-amber-500" };
    return { text: "text-emerald-400", bg: "bg-emerald-400" };
  };

  const handleOpenCreate = () => {
    setSelectedBudget(null);
    setFormAccountId("");
    setFormLimit("");
    setDisplayLimit("");
    setViewState("form");
  };

  const handleEditFromDetail = () => {
    if (!selectedBudget) return;
    setFormAccountId(selectedBudget.account_id);
    const convertedLimit = convertAmount(
      selectedBudget.amount_limit,
      Currency.IDR,
      currency
    );
    const rounded = Math.round(convertedLimit);
    setFormLimit(rounded.toString());
    setDisplayLimit(formatWithDots(rounded.toString()));
    setViewState("form");
  };

  const handleSave = async () => {
    try {
      if (!formAccountId || !formLimit) return;
      setIsLoading(true);
      if (selectedBudget) {
        const payload = {
          p_budget_id: selectedBudget.budget_id,
          p_user_id: user?.id,
          p_amount_limit: convertAmount(
            parseFloat(formLimit),
            currency,
            Currency.IDR
          ),
        };

        const { error } = await supabase.rpc("update_budget", payload);
      } else {
        const payload = {
          p_user_id: user?.id,
          p_account_id: formAccountId,
          p_amount_limit: convertAmount(
            parseFloat(formLimit),
            currency,
            Currency.IDR
          ),
          p_period: "monthly",
        };

        const { data, error } = await supabase.rpc("create_budget", payload);
      }
    } catch (error) {
    } finally {
      setRefreshTrigger((prev) => prev + 1);
      setSelectedBudget(null);
      setTimeout(() => {
        setIsLoading(false);
        setViewState("list");
      }, 1000);
    }
  };

  useEffect(() => {
    const getBudget = async () => {
      if (!user?.id) return;
      const { data, error } = await supabase.rpc("get_budgets", {
        p_user_id: user.id,
      });

      if (!error) {
        setBudgets(data as BudgetType[]);
      } else {
        console.error("Error fetching budgets:", error);
      }
    };

    getBudget();
  }, [refreshTrigger, user.id]);

  useEffect(() => {
    if (!selectedBudget || !user) return;

    let isMounted = true;

    const getDetailBudget = async () => {
      const { data, error } = await supabase.rpc("get_budget_history", {
        p_user_id: user.id,
        p_budget_id: selectedBudget.budget_id,
      });

      if (error) {
        console.error("Error fetching budget history:", error);
        return;
      }

      if (isMounted) {
        setBudgetHistory(data ?? []);
      }
    };

    getDetailBudget();

    return () => {
      isMounted = false;
    };
  }, [selectedBudget?.budget_id, user.id]);

  const handleDeleteBudget = async (budgetId: string) => {
    try {
      const { data, error } = await supabase.rpc("delete_budget", {
        p_budget_id: budgetId,
        p_user_id: user?.id,
      });
    } catch (error) {
    } finally {
      setRefreshTrigger((prev) => prev + 1);
      setSelectedBudget(null);
      setTimeout(() => {
        setIsLoading(false);
        setViewState("list");
      }, 1000);
    }
  };

  if (isLoading) return <LoadingState />;

  if (viewState === "form") {
    const activeAcc = getAccountData(formAccountId);
    return (
      <div className="p-6 pt-10 min-h-screen bg-white dark:bg-slate-950 transition-colors">
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => setViewState(selectedBudget ? "detail" : "list")}
            className="p-2 -ml-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <ChevronLeft size={24} />
          </button>
          <h1 className="text-xl font-bold">
            {selectedBudget ? t("budget.edit_limit") : t("budget.new_limit")}
          </h1>
        </div>

        <div className="space-y-6 max-w-md mx-auto">
          <div>
            <label className="text-[10px] font-extrabold text-slate-500 uppercase mb-2 block tracking-widest">
              {t("budget.expense_acc")}
            </label>
            <button
              onClick={() => !selectedBudget && setShowCategoryPicker(true)}
              className={`w-full flex items-center justify-between bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 text-sm font-semibold transition-all ${
                !selectedBudget ? "active:scale-[0.98]" : "opacity-70"
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-lg">
                  {formAccountId ? (
                    <IconRenderer
                      name={activeAcc.emoji}
                      className="text-lg text-amber-500"
                    />
                  ) : (
                    "🔍"
                  )}
                </span>
                <span
                  className={
                    formAccountId
                      ? "text-slate-900 dark:text-white"
                      : "text-slate-400"
                  }
                >
                  {formAccountId ? activeAcc.name : t("budget.select_category")}
                </span>
              </div>
              {!selectedBudget && (
                <ChevronDown size={18} className="text-slate-400" />
              )}
            </button>
          </div>

          <div>
            <label className="text-[10px] font-extrabold text-slate-500 uppercase mb-2 block tracking-widest">
              {t("budget.monthly_limit")} ({currency})
            </label>
            <div className="relative flex items-center bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl px-4 overflow-hidden focus-within:ring-2 focus-within:ring-primary-500 transition-all">
              <span className="text-slate-400 font-bold text-lg">
                {getCurrencySymbol(currency)}
              </span>
              <input
                type="text"
                inputMode="numeric"
                value={displayLimit}
                onChange={(e) => {
                  const raw = e.target.value.replace(/\D/g, "");
                  setFormLimit(raw);
                  setDisplayLimit(formatWithDots(raw));
                }}
                placeholder="0"
                className="flex-1 bg-transparent p-4 text-2xl font-bold text-slate-900 dark:text-white outline-none w-full"
              />
            </div>
          </div>

          <Button
            onClick={handleSave}
            disabled={!formAccountId || !formLimit}
            className="w-full py-5 mt-8 rounded-3xl shadow-xl shadow-primary-500/20 text-lg"
          >
            {selectedBudget ? t("budget.update") : t("budget.save")}
          </Button>
        </div>

        {showCategoryPicker && (
          <div className="fixed inset-0 z-[110] flex items-end justify-center bg-slate-900/60 backdrop-blur-sm">
            <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-t-[2.5rem] shadow-2xl p-6 pb-12">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold">
                  {t("budget.select_category")}
                </h3>
                <button
                  onClick={() => setShowCategoryPicker(false)}
                  className="p-2 bg-slate-100 dark:bg-slate-800 rounded-full"
                >
                  <X size={20} />
                </button>
              </div>
              <div className="grid grid-cols-1 gap-2 max-h-[50vh] overflow-y-auto">
                {expenseAccounts.map((acc) => {
                  const info = getAccountData(acc.id);
                  return (
                    <button
                      key={acc.id}
                      onClick={() => {
                        setFormAccountId(acc.id);
                        setShowCategoryPicker(false);
                      }}
                      className={`flex items-center justify-between p-4 rounded-2xl transition-all ${
                        formAccountId === acc.id
                          ? "bg-primary-50 dark:bg-primary-900/20 border-2 border-primary-500"
                          : "bg-slate-50 dark:bg-slate-800 border-2 border-transparent"
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <IconRenderer
                          name={info.emoji}
                          className="text-lg text-amber-500"
                        />
                        <span className="font-bold text-slate-800 dark:text-slate-200">
                          {info.name}
                        </span>
                      </div>
                      {formAccountId === acc.id && (
                        <Check size={20} className="text-primary-500" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  if (viewState === "detail" && selectedBudget) {
    const info = getAccountData(selectedBudget.account_id);
    const colors = getStatusColor(
      100 - selectedBudget.percent_used,
      selectedBudget.percent_used >= 100
    );
    return (
      <div className="p-6 pt-10 min-h-screen bg-slate-50 dark:bg-black transition-colors flex flex-col">
        <div className="flex justify-between items-center mb-10">
          <button
            onClick={() => setViewState("list")}
            className="p-2 -ml-2 rounded-full bg-white dark:bg-slate-900 shadow-sm"
          >
            <ChevronLeft size={20} />
          </button>
          <div className="flex gap-2">
            <button
              onClick={handleEditFromDetail}
              className="p-2 dark:hover:bg-slate-900 rounded-full text-slate-600 transition-colors"
            >
              <Edit2 size={18} />
            </button>
            <button
              onClick={() => {
                if (window.confirm(t("budget.delete_confirm"))) {
                  handleDeleteBudget(selectedBudget.budget_id);
                }
              }}
              className="p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-full transition-colors"
            >
              <Trash2 size={18} />
            </button>
          </div>
        </div>
        <div className="flex flex-col items-center text-center mb-10">
          <div className="text-6xl mb-4">
            <IconRenderer name={info.emoji} className="text-lg" />
          </div>
          <h1 className="text-2xl font-bold mb-6 text-slate-800 dark:text-white">
            {info.name}
          </h1>
          <div
            className={`text-5xl font-bold tracking-tight mb-2 ${colors.text} truncate`}
          >
            {
              formatCurrency(
                convertAmount(
                  selectedBudget?.remaining_amount,
                  Currency.IDR,
                  currency
                ),
                currency
              ).split(",")[0]
            }
          </div>
          <div className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-10">
            {selectedBudget?.percent_used >= 100
              ? "Spent Over Limit"
              : "Available to spend"}
          </div>
          <div className="w-full bg-slate-200 dark:bg-slate-900 h-6 rounded-3xl overflow-hidden p-1">
            <div
              className={`h-full rounded-2xl transition-all duration-1000 ease-out ${colors.bg}`}
              style={{
                width: `${Math.min(
                  Math.max(100 - selectedBudget.percent_used, 0),
                  100
                )}%`,
              }}
            />
          </div>
        </div>
        <div className="mt-4 flex-1">
          <div className="flex items-center gap-2 mb-4">
            <History size={16} className="text-slate-400" />
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Activity This Month
            </h3>
          </div>
          <div className="space-y-2 pb-10">
            {budgetHistory.map((entry) => {
              return (
                <div
                  key={entry.transaction_id}
                  className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 flex justify-between items-center shadow-sm"
                >
                  <div className="flex flex-col flex-1 min-w-0 pr-2">
                    <span className="text-sm font-bold text-slate-800 dark:text-slate-200 truncate">
                      {info.name}
                    </span>
                    <span className="text-[10px] text-slate-600 italic truncate">
                      {entry.description}
                    </span>
                    <span className="text-[10px] text-slate-400 italic truncate">
                      {entry.transaction_date}
                    </span>
                  </div>
                  <div className="text-sm font-mono font-bold text-slate-700 dark:text-slate-300 truncate">
                    -
                    {
                      formatCurrency(
                        convertAmount(entry.amount, Currency.IDR, currency),
                        currency
                      ).split(",")[0]
                    }
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative p-6 pt-10 min-h-screen">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">
            {t("budget.title")}
          </h1>
          <span className="bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-2 py-0.5 rounded-[4px] text-[10px] font-extrabold uppercase">
            {daysLeftInMonth} days left
          </span>
        </div>
        <button
          onClick={handleOpenCreate}
          className="bg-slate-900 dark:bg-white text-white dark:text-black p-3 rounded-full shadow-lg active:scale-90 transition-all"
        >
          <Plus size={20} />
        </button>
      </div>
      <div className="grid grid-cols-2 gap-3 pb-24">
        {budgets.map((budget) => {
          const info = getAccountData(budget.account_id);
          const colors = getStatusColor(
            100 - budget.percent_used,
            budget.percent_used >= 100
          );
          return (
            <div
              key={budget.budget_id}
              onClick={() => {
                setSelectedBudget(budget);
                setViewState("detail");
              }}
              className="bg-slate-900 dark:bg-black rounded-3xl p-4 flex flex-col justify-between border border-slate-800 shadow-xl active:scale-95 transition-all aspect-square"
            >
              <div className="flex flex-col">
                <span className="text-2xl mb-2">
                  <IconRenderer name={info.emoji} className="text-lg" />
                </span>
                <span className="font-bold text-white text-[13px] line-clamp-1">
                  {info.name}
                </span>
              </div>
              <div>
                <div
                  className={`text-xl font-bold tracking-tight mb-1 ${colors.text}`}
                >
                  {
                    formatCurrency(
                      convertAmount(
                        budget.remaining_amount,
                        Currency.IDR,
                        currency
                      ),
                      currency
                    ).split(",")[0]
                  }
                </div>
                <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mt-2">
                  <div
                    className={`h-full rounded-full ${colors.bg}`}
                    style={{
                      width: `${Math.max(100 - budget.percent_used, 0)}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
