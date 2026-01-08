import { FilterType } from "@/types/journal.type";
import { Filter } from "lucide-react";
import { memo } from "react";

export const FilterSelect: React.FC<{
  value: FilterType;
  onChange: (value: FilterType) => void;
  options: Array<{ id: number; name: string }>;
  t: (key: string) => string;
}> = memo(({ value, onChange, options, t }) => (
  <div className="relative">
    <select
      value={value}
      onChange={(e) => onChange(e.target.value as FilterType)}
      className="h-full appearance-none bg-slate-100 dark:bg-slate-800 rounded-xl pl-4 pr-10 py-3 text-sm font-medium text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-primary-500 transition-colors"
    >
      <option value="All">{t("journal.filter_all") || "All Types"}</option>
      {options
        .filter((type) => type.name !== "Liability" && type.name !== "Equity")
        .map((type) => (
          <option key={type.id} value={type.id}>
            {
              type.name === "Asset" ? 'Transfer' : t(`type.${type.name}`)
            }
          </option>
        ))}
    </select>
    <Filter
      size={16}
      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
    />
  </div>
));

FilterSelect.displayName = "FilterSelect";
