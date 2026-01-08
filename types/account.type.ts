export interface AccountType {
  id: number;
  name: string;
}

export interface Account {
  id: string;
  user_id: string;
  account_type_id: number;
  name: string;
  emoji?: string | null;
  currency: string;
  is_custom: boolean;
  created_at: string;
}

export interface CreateAccountInput {
  account_type_id: number;
  name: string;
  emoji?: string;
}