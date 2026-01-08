import { EntryMode } from "@/types/entryForm.type";
import { memo } from "react";

export const ModeSelector: React.FC<{
  mode: EntryMode;
  onChange: (mode: EntryMode) => void;
  t: (key: string) => string;
}> = memo(({ mode, onChange, t }) => (
  <div className="flex bg-slate-100 dark:bg-slate-900 p-1 rounded-2xl mb-8">
    {(['expense', 'income', 'transfer'] as EntryMode[]).map((m) => (
      <button
        key={m}
        onClick={() => onChange(m)}
        className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all ${
          mode === m
            ? 'bg-white dark:bg-slate-800 text-primary-600 dark:text-primary-400 shadow-sm'
            : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
        }`}
      >
        {t(`mode.${m}`)}
      </button>
    ))}
  </div>
));

ModeSelector.displayName = "ModeSelector";