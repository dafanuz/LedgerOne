import { memo } from "react";

export const EmptyState: React.FC<{
  hasEntries: boolean;
  t: (key: string) => string;
}> = memo(({ hasEntries, t }) => (
  <div className="text-center py-20 text-slate-400">
    {!hasEntries ? (
      <>
        <p>{t("journal.no_entries")}</p>
        <p className="text-sm">{t("journal.tap_to_add")}</p>
      </>
    ) : (
      <p>{t("journal.no_results")}</p>
    )}
  </div>
));
EmptyState.displayName = "EmptyState";