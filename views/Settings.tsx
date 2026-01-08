import React, { useRef } from "react";
import { useTranslation } from "../store";
import { Currency, Language } from "../types";
import {
  Moon,
  DollarSign,
  Bell,
  Euro,
  JapaneseYen,
  Globe,
  Download,
  Upload,
} from "lucide-react";
import { useBookkeeping } from "@/contexts/BookKeepingContext";
import { useSettings } from "@/contexts/SettingsContext";
import * as XLSX from "xlsx";
import supabase from "@/utils/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { exportBackupToExcel, exportBackupToFile } from "@/utils";
import { useToast } from "@/components/ui/toast/ToastContext";

export const Settings: React.FC = () => {
  const { user } = useAuth();
  const {
    currency,
    language,
    darkMode,
    notifications,
    toggleDarkMode,
    toggleNotifications,
    setCurrency,
    setLanguage,
  } = useSettings();
  const { t } = useTranslation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { showToast } = useToast();

  const getCurrencyIcon = (currency: string) => {
    switch (currency) {
      case Currency.IDR:
        return (
          <div className="w-5 h-5 flex items-center justify-center font-bold text-xs">
            Rp
          </div>
        );
      case Currency.EUR:
        return <Euro size={20} />;
      case Currency.JPY:
        return <JapaneseYen size={20} />;
      default:
        return <DollarSign size={20} />;
    }
  };

  const handleExport = async () => {
    try {
      const { data, error } = await supabase.rpc("rpc_backup_data", {
        p_user_id: user.id,
      });

      if (!error) {
        exportBackupToExcel(data?.data); // download JSON
      }
    } catch (error) {}
  };

  const handleImportClick = () => fileInputRef.current?.click();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const arrayBuffer = await file.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer, { type: "array" });

      const backup = {
        data: {
          budgets: [],
          accounts: [],
          budget_logs: [],
          transactions: [],
          journal_entries: [],
        },
        meta: {
          app: "LedgerApp",
          userId: user.id,
          version: "1.0.0",
          exportedAt: new Date().toISOString(),
        },
      };

      workbook.SheetNames.forEach((sheetName) => {
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);

        if (sheetName in backup.data) {
          backup.data[sheetName] = jsonData;
        }
      });

      const { error } = await supabase.rpc("rpc_restore_data", {
        p_user_id: user.id,
        p_backup: backup,
      });

      if (error) throw error;

      showToast("✅ Restore completed successfully", "success");
      window.location.reload();
    } catch (err: any) {
      showToast(`❌ Restore failed: ${err.message}`, "error");
    } finally {
      e.target.value = "";
    }
  };

  return (
    <div className="p-6 pt-10 min-h-screen">
      <h1 className="text-2xl font-bold mb-6 text-slate-800 dark:text-white">
        {t("set.title")}
      </h1>

      <div className="space-y-6">
        <section>
          <h3 className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase mb-3 ml-2">
            {t("set.data_mgmt")}
          </h3>
          <div className="grid grid-cols-1 gap-3">
            <button
              onClick={handleExport}
              className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-4 rounded-2xl flex flex-col items-center justify-center gap-2 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-sm"
            >
              <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-full">
                <Download size={24} />
              </div>
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Backup Data
              </span>
            </button>
            {/* <button
              onClick={handleImportClick}
              className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-4 rounded-2xl flex flex-col items-center justify-center gap-2 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-sm"
            >
              <div className="p-3 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full">
                <Upload size={24} />
              </div>
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Restore Data
              </span>
            </button> */}
            <input
              type="file"
              accept=".xlsx, .xls"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
            />
          </div>
        </section>

        <section>
          <h3 className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase mb-3 ml-2">
            {t("set.preferences")}
          </h3>
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden shadow-sm">
            <button
              onClick={toggleDarkMode}
              className="w-full flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors border-b border-slate-100 dark:border-slate-800"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-lg">
                  <Moon size={20} />
                </div>
                <div className="text-left">
                  <div className="font-semibold text-sm text-slate-800 dark:text-slate-200">
                    {t("set.dark_mode")}
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    {darkMode ? t("set.on") : t("set.off")}
                  </div>
                </div>
              </div>
              <div
                className={`w-12 h-7 rounded-full p-1 transition-colors ${
                  darkMode ? "bg-primary-600" : "bg-slate-200 dark:bg-slate-700"
                }`}
              >
                <div
                  className={`w-5 h-5 bg-white rounded-full shadow-sm transform transition-transform ${
                    darkMode ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </div>
            </button>

            <button
              onClick={toggleNotifications}
              className="w-full flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors border-b border-slate-100 dark:border-slate-800"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-lg">
                  <Bell size={20} />
                </div>
                <div className="text-left">
                  <div className="font-semibold text-sm text-slate-800 dark:text-slate-200">
                    {t("set.notifications")}
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    {notifications ? t("set.enabled") : t("set.disabled")}
                  </div>
                </div>
              </div>
              <div
                className={`w-12 h-7 rounded-full p-1 transition-colors ${
                  notifications
                    ? "bg-primary-600"
                    : "bg-slate-200 dark:bg-slate-700"
                }`}
              >
                <div
                  className={`w-5 h-5 bg-white rounded-full shadow-sm transform transition-transform ${
                    notifications ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </div>
            </button>

            <div className="w-full flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg">
                  <Globe size={20} />
                </div>
                <div className="font-semibold text-sm text-slate-800 dark:text-slate-200">
                  {t("set.language")}
                </div>
              </div>
              <div className="flex bg-slate-100 dark:bg-slate-800 rounded-lg p-1">
                {(["en", "id"] as Language[]).map((lang) => (
                  <button
                    key={lang}
                    onClick={() => setLanguage(lang)}
                    className={`px-3 py-1 rounded-md text-[10px] font-bold transition-all ${
                      language === lang
                        ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm"
                        : "text-slate-400"
                    }`}
                  >
                    {lang.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section>
          <h3 className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase mb-3 ml-2">
            {t("set.currency")}
          </h3>
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden shadow-sm">
            {Object.keys(Currency).map((cur, index) => (
              <button
                key={cur}
                onClick={() => setCurrency(cur as Currency)}
                className={`w-full flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors ${
                  index !== 0
                    ? "border-t border-slate-100 dark:border-slate-800"
                    : ""
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-lg">
                    {getCurrencyIcon(cur)}
                  </div>
                  <div className="font-semibold text-sm text-slate-800 dark:text-slate-200">
                    {cur}
                  </div>
                </div>
                {currency === cur && (
                  <div className="w-2 h-2 rounded-full bg-primary-500 shadow-sm ring-4 ring-primary-100 dark:ring-primary-900/30" />
                )}
              </button>
            ))}
          </div>
          <p className="text-[10px] text-slate-400 mt-2 px-2">
            {t("set.currency_desc")}
          </p>
        </section>
      </div>
    </div>
  );
};
