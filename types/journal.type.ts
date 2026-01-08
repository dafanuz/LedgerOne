import { AccountType } from "@/types";

export interface GroupEntry {
  transaction_id?: string;
  description?: string;
  created_at?: Date | string;
  lines?: Line[];
}

export interface Line {
  tx_date?: Date | string;
  transaction_id?: string;
  account_id?: string;
  account_name?: string;
  account_emoji?: string;
  account_type?: number;
  account_type_label?: string;
  description?: string;
  credit?: number;
  debit?: number;
  amount?: number;
  is_income?: boolean;
  created_at?: Date | string;
  dest_account_name?: string;

}

export interface TransactionDetail {
  account_id: string;
  account_name: string;
  emoji: string;
  account_type: number;
  account_type_label: string;
  description: string;
  transaction_date: string;
  debit: number;
  credit: number;
  created_at: string;
}

export interface GroupedByDate {
  [date: string]: GroupEntry[];
}

export type FilterType = AccountType | number | "All";

export const DEBOUNCE_DELAY = 2000;
export const TIME_FORMAT = "h:mm a";
