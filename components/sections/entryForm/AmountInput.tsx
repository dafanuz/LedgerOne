import { Currency } from "@/types";
import { memo, useEffect, useRef, useState } from "react";

export const AmountInput: React.FC<{
  currency: Currency;
  value: string;
  onChange: (value: string) => void;
  t: (key: string) => string;
}> = memo(({ currency, value, onChange, t }) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [fontSize, setFontSize] = useState(48);

  useEffect(() => {
    if (!value || !inputRef.current) {
      setFontSize(48);
      return;
    }

    const length = value.length;

    if (length <= 3) {
      setFontSize(48); // text-5xl
    } else if (length <= 6) {
      setFontSize(40); // text-4xl
    } else if (length <= 9) {
      setFontSize(32); // text-3xl
    } else if (length <= 12) {
      setFontSize(28); // text-2xl
    } else if (length <= 15) {
      setFontSize(24); // text-xl
    } else {
      setFontSize(20); // text-lg
    }
  }, [value]);

  return (
    <div className="text-center px-4">
      <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">
        {t("ui.amount")}
      </label>
      <div className="flex items-center justify-center gap-2 mt-2">
        <span className="text-2xl font-bold text-slate-400">{currency}</span>
        <input
          ref={inputRef}
          type="text"
          inputMode="numeric"
          placeholder="0"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          style={{ fontSize: `${fontSize}px` }}
          className="bg-transparent font-bold text-slate-800 dark:text-white outline-none text-center flex-1 min-w-0 transition-all duration-200"
          autoFocus
        />
      </div>
    </div>
  );
});

AmountInput.displayName = "AmountInput";
