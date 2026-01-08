import { Search, X } from "lucide-react";
import { memo } from "react";

export const SearchInput: React.FC<{
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}> =  memo(({ value, onChange, placeholder }) => (
  <div className="relative flex-1">
    <Search
      size={18}
      className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
    />
    <input
      type="text"
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full bg-slate-100 dark:bg-slate-800 rounded-xl pl-10 pr-10 py-3 text-sm text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-primary-500 transition-colors"
    />
    {value && (
      <button
        onClick={() => onChange("")}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
        aria-label="Clear search"
      >
        <X size={16} />
      </button>
    )}
  </div>
));
SearchInput.displayName = "SearchInput";