import { memo } from "react";

export const DebtPaymentToggle: React.FC<{
  isDebtPayment: boolean;
  onChange: (value: boolean) => void;
  t: (key: string) => string;
}> = memo(({ isDebtPayment, onChange, t }) => (
  <div className="flex bg-slate-200 dark:bg-slate-800 p-1 rounded-xl mb-2">
    <button
      onClick={() => onChange(false)}
      className={`flex-1 py-1.5 text-[10px] font-bold rounded-lg transition-colors ${
        !isDebtPayment
          ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
          : 'text-slate-500'
      }`}
    >
      {t('ui.debt_borrow')}
    </button>
    <button
      onClick={() => onChange(true)}
      className={`flex-1 py-1.5 text-[10px] font-bold rounded-lg transition-colors ${
        isDebtPayment
          ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
          : 'text-slate-500'
      }`}
    >
      {t('ui.debt_pay')}
    </button>
  </div>
));

DebtPaymentToggle.displayName = "DebtPaymentToggle";