import { IconRenderer } from "@/components/ui/icon/icon";
import { EntryMode } from "@/types/entryForm.type";
import { ChevronDown } from "lucide-react";
import { memo } from "react";

export const AccountSelector: React.FC<{
  type: "main" | "sub";
  mode: EntryMode;
  selectedId: string;
  onClick: () => void;
  getAccountData: (id: string) => { name: string; emoji: string };
  t: (key: string) => string;
}> = memo(({ type, mode, selectedId, onClick, getAccountData, t }) => {
  const getLabel = () => {
    if (type === "main") {
      if (mode === "expense") return t("ui.category");
      if (mode === "income") return t("ui.account");
      return t("ui.transfer_to");
    }

    if (mode === "expense") return t("ui.from");
    if (mode === "income") return t("ui.to");
    return t("ui.transfer_from");
  };

  const getPlaceholder = () => {
    if (type === "main") {
      if (mode === "expense") return t("entry.select_category");
      if (mode === "income") return t("entry.select_account");
      return t("entry.select_account");
    }

    if (mode === "expense") return t("entry.select_account");
    if (mode === "income") return t("entry.select_account");
    return t("entry.select_account");
  };

  const accountData = getAccountData(selectedId);

  return (
    <div onClick={onClick} className="cursor-pointer">
      <label className="text-[10px] font-extrabold text-slate-400 uppercase ml-1">
        {getLabel()}
      </label>
      <div className="flex items-center justify-between p-4 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm mt-1 active:scale-[0.98] transition-all">
        <div className="flex items-center gap-3">
          <IconRenderer
            name={accountData.emoji}
            className="text-lg text-amber-500"
          />
          <span
            className={`font-semibold text-sm ${
              selectedId ? "text-slate-800 dark:text-white" : "text-slate-400"
            }`}
          >
            {selectedId === "" ? getPlaceholder() : accountData.name}
          </span>
        </div>
        <ChevronDown size={18} className="text-slate-300" />
      </div>
    </div>
  );
});

AccountSelector.displayName = "AccountSelector";
