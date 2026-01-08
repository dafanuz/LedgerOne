
export enum AccountType {
  ASSET = 'Asset',
  LIABILITY = 'Liability',
  EQUITY = 'Equity',
  INCOME = 'Income',
  EXPENSE = 'Expense',
}

export enum Currency {
  IDR = 'IDR',
  USD = 'USD',
  EUR = 'EUR',
  JPY = 'JPY'
}

export type Language = 'en' | 'id';

export interface Account {
  id: string;
  name: string;
  type: AccountType;
  emoji?: string; // Field baru untuk menyimpan emoji kustom
  isSystem?: boolean; // Cannot be deleted
}

export interface JournalLineItem {
  id: string;
  accountId: string;
  debit: number;
  credit: number;
  currency: Currency; // STORE THE ORIGINAL CURRENCY
}

export interface JournalEntry {
  id: string;
  date: string; // ISO string
  description: string;
  items: JournalLineItem[];
  createdAt: number;
}


export interface Budget {
  id: string;
  accountId: string; // Expense account
  limit: number;
  currency: Currency; // Budget is set in a specific currency
  period: 'monthly' | 'weekly';
}

export interface AppState {
  entries: JournalEntry[];
  accounts: Account[];
  budgets: Budget[];
}

export type TimeFilter = 'today' | 'week' | 'month' | 'year' | 'all';

export interface FinancialSnapshot {
  assets: number;
  liabilities: number;
  equity: number;
  income: number;
  expenses: number;
  netIncome: number;
}
