import { memo } from "react";

export const LoadingState = memo<{ text?: string }>(({ text = null }) => (
  <div className="text-center py-20">
    <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary-600 dark:border-primary-400 border-r-transparent"></div>
    {text ? <p className="mt-4 text-slate-600 dark:text-slate-400">{text}</p> : null}
  </div>
));

LoadingState.displayName = "LoadingState";
