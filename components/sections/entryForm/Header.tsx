import { ChevronLeft, Trash2 } from "lucide-react";
import { memo } from "react";

export const Header: React.FC<{
  editId: string | null;
  onBack: () => void;
  onDelete: () => void;
  t: (key: string) => string;
}> = memo(({ editId, onBack, onDelete, t }) => (
  <div className="flex items-center justify-between mb-8">
    <button
      onClick={onBack}
      className="p-2 -ml-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
    >
      <ChevronLeft />
    </button>
    <h2 className="text-lg font-bold">
      {editId ? t('entry.edit_title') : t('entry.new_title')}
    </h2>
    {editId ? (
      <button
        onClick={onDelete}
        className="p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-full transition-colors"
      >
        <Trash2 size={20} />
      </button>
    ) : (
      <div className="w-10" />
    )}
  </div>
));
Header.displayName = "Header";
