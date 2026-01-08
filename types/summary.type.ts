export interface Summary {
  income: number;
  expenses: number;
  net_result: number;

  income_trend: number;
  expenses_trend: number;
  net_result_trend: number;
}

export interface UserBalance {
  net_worth?: number;
  total_assets?: number;
  total_liabilities?: number;
  asset_accounts?: AssetAccount[];
}

export interface AssetAccount {
  id?: string;
  name?: string;
  emoji?: string;
  balance?: number;
  is_negative?: boolean;
}
