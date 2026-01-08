import { format } from 'date-fns';

export type EntryMode = 'expense' | 'income' | 'transfer';
export type SelectorType = 'main' | 'sub' | null;

export interface FormState {
  mode: EntryMode;
  date: string;
  description: string;
  amount: string;
  displayAmount: string;
  mainAccount: string;
  subAccount: string;
  // isDebtPayment: boolean;
}

export interface AccountSelectorProps {
  type: 'main' | 'sub';
  mode: EntryMode;
  isDebtPayment: boolean;
  selectedId: string;
  accounts: any[];
  onSelect: (id: string) => void;
  t: (key: string) => string;
}

export const INITIAL_FORM_STATE: FormState = {
  mode: 'expense',
  date: format(new Date(), 'yyyy-MM-dd'),
  description: '',
  amount: '',
  displayAmount: '',
  mainAccount: '',
  subAccount: '',
  // isDebtPayment: false,
};