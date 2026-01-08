
export interface Budget {
    "budget_id": string;
    "account_id": string;
    "category_name": string;
    "amount_limit": number;
    "spent_amount": number;
    "remaining_amount": number;
    "percent_used": number
}