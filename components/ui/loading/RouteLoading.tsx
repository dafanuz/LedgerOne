import React from "react";

export const RouteLoading: React.FC = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-emerald-50 to-teal-100 dark:from-slate-900 dark:to-slate-800">
      <div className="text-center">
        <div className="inline-flex items-center justify-center">
          <div className="w-12 h-12 border-4 border-emerald-200 dark:border-slate-700 border-t-emerald-600 rounded-full animate-spin"></div>
        </div>
        <p className="mt-4 text-slate-600 dark:text-slate-400 font-medium">
          Loading...
        </p>
      </div>
    </div>
  );
};
