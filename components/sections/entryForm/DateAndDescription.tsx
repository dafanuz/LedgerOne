import { memo } from "react";

import { DatePicker } from "@/components/ui/datepicker";

export const DateAndDescription: React.FC<{
  date: string;
  description: string;
  onDateChange: (date: string) => void;
  onDescriptionChange: (desc: string) => void;
  t: (key: string) => string;
}> = memo(({ date, description, onDateChange, onDescriptionChange, t }) => {
  return (
    <div className="grid grid-cols-2 gap-4">
      <DatePicker
        value={date}
        onChange={onDateChange}
        placeholder="Select date"
      />
      <input
        type="text"
        placeholder={t("entry.desc")}
        value={description}
        onChange={(e) => onDescriptionChange(e.target.value)}
        className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl p-3 text-[13px] outline-none"
      />
    </div>
  );
});

DateAndDescription.displayName = "DateAndDescription";
