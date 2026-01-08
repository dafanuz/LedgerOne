export function AuthLoading() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-safe flex items-center justify-center">
      <div className="flex flex-col items-center gap-4 animate-slide-in">
        <div className="w-10 h-10 rounded-full border-2
                        border-slate-300 dark:border-slate-700
                        border-t-primary-600
                        animate-spin" />
      </div>
    </div>
  );
}