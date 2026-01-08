import React, { useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "../store";
import { convertAmount, formatCurrency, formatDate } from "../utils";
import {
  ChevronLeft,
  Edit3,
  Calendar,
  Clock,
  CheckCircle2,
} from "lucide-react";
import { format } from "date-fns";
import { useSettings } from "@/contexts/SettingsContext";
import supabase from "@/utils/supabase";
import { IconRenderer } from "@/components/ui/icon/icon";
import { TransactionDetail } from "@/types/journal.type";
import { Currency } from "@/types";
import { LoadingState } from "@/components/ui/loading/LoadingState";

export const EntryDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currency } = useSettings();
  const { t, language } = useTranslation();
  const [entries, setEntries] = React.useState<TransactionDetail[]>([]);
  const [loading, setLoading] = React.useState<boolean>(false);

  useEffect(() => {
    const transactionDetail = async () => {
      try {
        setLoading(true);
        if (!id) return;
        const { data, error } = await supabase.rpc("rpc_get_journal_detail", {
          p_transaction_id: id,
        });

        if (!error && data) {
          setEntries(data);
        }
      } catch (error) {}
      finally{
        setLoading(false);
      }
    };

    transactionDetail();
  }, [id]);

  if(loading) return <LoadingState />

  if (!loading && entries.length === 0) {
    return (
      <div className="p-6 text-center pt-20">
        <p className="text-slate-400">Transaction not found.</p>
        <button
          onClick={() => navigate("/journal")}
          className="mt-4 text-primary-600 font-bold"
        >
          Go back
        </button>
      </div>
    );
  }

  const totalDebit = entries.reduce((sum, i) => sum + i.debit, 0);
  const totalCredit = entries.reduce((sum, i) => sum + i.credit, 0);

  return (
    <div className="p-6 pt-10 min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors">
      <div className="flex items-center justify-between mb-8">
        <button
          onClick={() => navigate("/journal")}
          className="p-2 -ml-2 hover:bg-white dark:hover:bg-slate-900 rounded-full shadow-sm transition-all active:scale-95"
        >
          <ChevronLeft />
        </button>
        <h2 className="text-sm font-bold uppercase tracking-widest text-slate-400">
          {t("entry.detail_title") || "Transaction Detail"}
        </h2>
        <button
          onClick={() => navigate(`/new?id=${id}`)}
          className="p-2 bg-white dark:bg-slate-900 rounded-full shadow-sm text-slate-600 dark:text-slate-400 active:scale-90 transition-all border border-slate-100 dark:border-slate-800"
        >
          <Edit3 size={18} />
        </button>
      </div>

      <div className="space-y-6">
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-800 text-center">
          <div className="text-5xl mb-4 drop-shadow-lg">
            <IconRenderer name={entries[0].emoji} />
          </div>
          <h3 className="font-bold text-xl text-slate-800 dark:text-white mb-6">
            {t(entries[0].description) !== entries[1].description
              ? t(entries[0].description)
              : entries[0].description}
          </h3>

          <div className="grid grid-cols-2 gap-4 pt-6 border-t border-slate-50 dark:border-slate-800">
            <div className="flex items-center justify-center gap-2">
              <Calendar size={14} className="text-slate-400" />
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tight">
                {formatDate(entries[0].created_at, language)}
              </span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <Clock size={14} className="text-slate-400" />
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tight">
                {format(entries[0].created_at, "hh:mm a")}
              </span>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex justify-between items-center px-2">
            <h4 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">
              Double-Entry Journal
            </h4>
            <div className="flex items-center gap-1 text-[10px] text-emerald-500 font-bold bg-emerald-500/10 px-2 py-0.5 rounded">
              <CheckCircle2 size={10} />
              {entries.length > 0 && totalDebit === totalCredit ? (
                "BALANCED"
              ) : (
                <span className="text-red-500"> NOT BALANCED</span>
              )}
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-3xl overflow-hidden shadow-sm border border-slate-100 dark:border-slate-800">
            <table className="w-full table-fixed text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/50">
                  <th className="p-4 text-[10px] font-bold text-slate-400 uppercase">
                    Account
                  </th>
                  <th className="p-4 text-[10px] font-bold text-slate-400 uppercase text-right">
                    Debit
                  </th>
                  <th className="p-4 text-[10px] font-bold text-slate-400 uppercase text-right">
                    Credit
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                {entries.map((item, idx) => {
                  return (
                    <tr key={idx} className="group">
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <span className="text-xs">{item.emoji}</span>
                          <div className="text-sm font-bold text-slate-700 dark:text-slate-200">
                            {item.account_name}
                          </div>
                        </div>
                        <div className="text-[10px] text-slate-400 font-medium ml-6">
                          {item.account_type_label}
                        </div>
                      </td>

                      <CurrencyCellStacked
                        amount={item.debit}
                        currency={currency}
                        type={"debit"}
                      />
                      <CurrencyCellStacked
                        amount={item.credit}
                        currency={currency}
                        type={"credit"}
                      />
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        <div className="p-4 bg-indigo-50 dark:bg-indigo-950/20 rounded-2xl border border-indigo-100 dark:border-indigo-900/30">
          <p className="text-[11px] text-indigo-600 dark:text-indigo-400 leading-relaxed italic">
            "Accounting Rule: Every transaction must have at least one debit and
            one credit that balance out. Your entry correctly affects these
            accounts in the background."
          </p>
        </div>
      </div>
    </div>
  );
};

interface CurrencyCellProps {
  amount: number;
  currency: Currency;
  type: "debit" | "credit";
}

export const CurrencyCellStacked: React.FC<CurrencyCellProps> = ({
  amount,
  currency,
  type,
}) => {
  const hasValue = amount > 0;

  const { currencySymbol, numberValue, fontSize } = useMemo(() => {
    if (!hasValue)
      return {
        currencySymbol: "",
        numberValue: "-",
        fontSize: "text-sm",
      };

    const converted = convertAmount(amount, Currency.IDR, currency);
    const formatted = formatCurrency(converted, currency);

    const parts = formatted.split(" ");
    let number = formatted;

    if (parts.length > 1) {
      number = parts.slice(1).join(" ");
    }

    const length = number.length;
    let size = "text-sm";

    if (length <= 8) size = "text-sm";
    else if (length <= 12) size = "text-xs";
    else if (length <= 16) size = "text-[11px]";
    else size = "text-[10px]";

    return {
      numberValue: number,
      fontSize: size,
    };
  }, [amount, currency, hasValue]);

  return (
    <td className="p-4 text-right tabular-nums">
      {hasValue ? (
        <div className="flex flex-col items-end gap-0.5">
          <span className="text-[10px] font-medium text-slate-400 dark:text-slate-500">
            {currencySymbol}
          </span>
          <span
            className={`font-mono font-bold text-slate-900 dark:text-white transition-all ${fontSize}`}
          >
            {numberValue}
          </span>
        </div>
      ) : (
        <span className="text-sm text-slate-300 dark:text-slate-700">-</span>
      )}
    </td>
  );
};
