import { Currency } from "@/types";
import { formatCurrency } from "@/utils";
import { Check, CircleAlert, Shield } from "lucide-react";
import { memo, useMemo } from "react";
import { convertAmount } from "@/utils";
import { AssetAccount } from "@/types/summary.type";

const defaultAssetAccount = [
  {
    id: "aa80e08f-4dd2-4392-9a32-92699352f831",
    name: "Cash",
    emoji: "💵",
    balance: 0,
    is_negative: false,
  },
  {
    id: "86ff1582-6af0-4f97-aa90-e4d403322043",
    name: "Credit Card",
    emoji: "💳",
    balance: 0,
    is_negative: false,
  },
  {
    id: "077d952c-534a-4cdb-8267-20b35985c9de",
    name: "Bank Accounts",
    emoji: "🏢",
    balance: 0,
    is_negative: false,
  },
];

const customOrder = {
  Cash: 1,
  "Credit Card": 2,
  "Bank Accounts": 3,
};

export const NetIncomeCard = memo<{
  total: number;
  assets: number;
  liabilities: number;
  accounts: AssetAccount[];
  currency: Currency;
  isLoading: boolean;
  t: (key: string) => string;
}>(({ total, assets, liabilities, accounts, currency, isLoading, t }) => {
  const { fontSize } = useMemo(() => {
    const converted = convertAmount(total, Currency.IDR, currency);
    const formatted = formatCurrency(converted, currency);

    const parts = formatted.split(" ");
    let number = formatted;

    if (parts.length > 1) {
      number = parts.slice(1).join(" ");
    }

    const length = number.length;
    let size = "text-5xl"; // Changed from text-sm

    if (length <= 8) size = "text-5xl";
    else if (length <= 12) size = "text-4xl";
    else if (length <= 16) size = "text-3xl";
    else size = "text-2xl";

    return {
      numberValue: number,
      fontSize: size,
    };
  }, [total, currency]);

  const { fontSizeAccount } = useMemo(() => {
    const converted = convertAmount(total, Currency.IDR, currency);
    const formatted = formatCurrency(converted, currency);

    const parts = formatted.split(" ");
    let number = formatted;

    if (parts.length > 1) {
      number = parts.slice(1).join(" ");
    }

    const length = number.length;
    let size = "text-lg"; // Changed from text-sm

    if (length <= 8) size = "text-lg";
    else if (length <= 12) size = "text-xl";
    else if (length <= 16) size = "text-lg";
    else size = "text-base";

    return {
      numberValue: number,
      fontSizeAccount: size,
    };
  }, [accounts, currency]);

  const mergeAccount = defaultAssetAccount.map((defaultAcc) => {
    const apiAcc = accounts.find(
      (acc) => acc.name.toLowerCase() === defaultAcc.name.toLowerCase()
    );

    return apiAcc ? { ...defaultAcc, ...apiAcc } : defaultAcc;
  });

  return (
    <div>
      <div className="flex py-8 flex-col items-center justify-center gap-2">
        {/* Header */}
        <div className="flex items-start justify-between">
          <p className="text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider text-blue-100">
            {t("dash.total_equity")}
          </p>
        </div>

        {/* Loading */}
        <div
          className={`text-slate-500 dark:text-white font-bold tracking-tight truncate ${fontSize}`}
        >
          {isLoading ? (
            <div className="flex items-center space-x-2">
              <span className="h-2 w-2 animate-wave rounded-full bg-slate-800 dark:bg-slate-100" />
              <span className="h-2 w-2 animate-wave rounded-full bg-slate-800 dark:bg-slate-100 [animation-delay:150ms]" />
              <span className="h-2 w-2 animate-wave rounded-full bg-slate-800 dark:bg-slate-100 [animation-delay:300ms]" />
            </div>
          ) : (
            <span>
              {formatCurrency(
                convertAmount(total, Currency.IDR, currency),
                currency
              )}
            </span>
          )}
        </div>

        {/* Safe balance */}
        <div className="bg-slate-50 dark:bg-[#041721] flex items-center gap-1 px-3 py-1 rounded-full">
          <div className="relative flex items-center justify-center">
            <Shield
              size={20}
              className="text-emerald-600 dark:text-emerald-400"
            />
            <Check
              size={10}
              className="absolute text-emerald-600 dark:text-emerald-400"
            />
          </div>
          <h1 className="text-sm font-medium text-emerald-600 dark:text-emerald-400 tracking-wider">
            SAFE BALANCE
          </h1>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <h1 className="text-slate-500 dark:text-slate-400 text-xs font-bold tracking-wide uppercase">
          Accounts
        </h1>
        {isLoading &&
          [1, 2, 3].map((account, index) => (
            <div
              key={index}
              className={`bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 flex justify-between transition-colors`}
            >
              <div className="flex items-center space-x-2">
                <span className="h-2 w-2 animate-wave rounded-full bg-slate-800 dark:bg-slate-100" />
                <span className="h-2 w-2 animate-wave rounded-full bg-slate-800 dark:bg-slate-100 [animation-delay:150ms]" />
                <span className="h-2 w-2 animate-wave rounded-full bg-slate-800 dark:bg-slate-100 [animation-delay:300ms]" />
              </div>
            </div>
          ))}
        {!isLoading &&
          mergeAccount
            .sort((a, b) => customOrder[a.name] - customOrder[b.name])
            .map((account, index) => (
              <div
                key={index}
                className={`bg-white dark:bg-[#0f1729] p-4 rounded-2xl border border-slate-100 dark:border-slate-800 flex justify-between transition-colors`}
              >
                <div className="flex justify-between items-center gap-2.5">
                  <div className="bg-slate-50 dark:bg-[#1e293b] flex items-center justify-center h-10 w-10 rounded-xl">
                    {account?.emoji && account?.emoji}
                  </div>
                  <p className="text-sm m-0 font-medium text-slate-500 dark:text-slate-200 capitalize mb-1 tracking-tight">
                    {account?.name}
                  </p>
                </div>
                <div>
                  <div className="text-lg font-bold text-slate-800 dark:text-slate-100 truncate">
                    {isLoading ? (
                      <div className="flex items-center space-x-2">
                        <span className="h-2 w-2 animate-wave rounded-full bg-slate-800 dark:bg-slate-100" />
                        <span className="h-2 w-2 animate-wave rounded-full bg-slate-800 dark:bg-slate-100 [animation-delay:150ms]" />
                        <span className="h-2 w-2 animate-wave rounded-full bg-slate-800 dark:bg-slate-100 [animation-delay:300ms]" />
                      </div>
                    ) : (
                      <span
                        className={`${fontSizeAccount} ${
                          account.is_negative
                            ? "text-rose-600 dark:text-rose-400"
                            : "text-slate-500 dark:text-white"
                        }`}
                      >
                        {formatCurrency(
                          convertAmount(
                            account.balance,
                            Currency.IDR,
                            currency
                          ),
                          currency
                        )}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
      </div>
      {/* Bottom Cards */}
      <div className="mt-8 grid grid-cols-2 gap-4">
        <div className="rounded-2xl bg-white dark:bg-[#0f1729] p-4 rounded-2xl border border-slate-100 dark:border-slate-800 flex flex-col justify-between transition-colors">
          <p className="text-sm m-0 font-medium text-emerald-600 dark:text-emerald-400 capitalize mb-1 tracking-tight">
            {t("dash.total_assets")}
          </p>
          <div className="mt-1 text-lg font-semibold truncate">
            {isLoading ? (
              <div className="flex items-center space-x-2">
                <span className="h-2 w-2 animate-wave rounded-full bg-slate-800 dark:bg-slate-100" />
                <span className="h-2 w-2 animate-wave rounded-full bg-slate-800 dark:bg-slate-100 [animation-delay:150ms]" />
                <span className="h-2 w-2 animate-wave rounded-full bg-slate-800 dark:bg-slate-100 [animation-delay:300ms]" />
              </div>
            ) : (
              <span
                className={`${fontSizeAccount} text-emerald-600 dark:text-emerald-400`}
              >
                {formatCurrency(
                  convertAmount(assets, Currency.IDR, currency),
                  currency
                )}
              </span>
            )}
          </div>
        </div>

        <div className="rounded-2xl bg-white dark:bg-[#0f1729] p-4 rounded-2xl border border-slate-100 dark:border-slate-800 flex flex-col justify-between transition-colors">
          <div className="flex items-center justify-between">
            <p className="text-sm m-0 font-medium text-rose-600 dark:text-rose-400 capitalize mb-1 tracking-tight">
              {t("dash.total_liabilities")}
            </p>
            <CircleAlert
              size={12}
              className="text-rose-600 dark:text-rose-400"
            />
          </div>

          <div className="mt-1 text-lg font-semibold truncate">
            {isLoading ? (
              <div className="flex items-center space-x-2">
                <span className="h-2 w-2 animate-wave rounded-full bg-slate-800 dark:bg-slate-100" />
                <span className="h-2 w-2 animate-wave rounded-full bg-slate-800 dark:bg-slate-100 [animation-delay:150ms]" />
                <span className="h-2 w-2 animate-wave rounded-full bg-slate-800 dark:bg-slate-100 [animation-delay:300ms]" />
              </div>
            ) : (
              <span
                className={`${fontSizeAccount} text-rose-600 dark:text-rose-400`}
              >
                {formatCurrency(
                  convertAmount(liabilities, Currency.IDR, currency),
                  currency
                )}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
});

NetIncomeCard.displayName = "NetIncomeCard";
