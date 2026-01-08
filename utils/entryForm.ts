import { Currency, JournalLineItem } from "@/types";
import { EntryMode } from "@/types/entryForm.type";

export const getAccountTypeForSelector = (
  mode: EntryMode,
  selectorType: "main" | "sub",
  accountTypeMap: Record<string, number>
): number => {
  if (selectorType === "sub") {
    return accountTypeMap.Asset;
  }

  switch (mode) {
    case "expense":
      return accountTypeMap.Expense;
    case "income":
      return accountTypeMap.Income;
    case "transfer":
      return accountTypeMap.Liability;
    default:
      return accountTypeMap.Asset;
  }
};

export const createJournalItems = (
  mode: EntryMode,
  amount: number,
  mainAccountId: string,
  subAccountId: string,
  currency: Currency,
  isDebtPayment: boolean
): JournalLineItem[] => {
  switch (mode) {
    case "expense":
      return [
        {
          id: "1",
          accountId: mainAccountId,
          debit: amount,
          credit: 0,
          currency,
        },
        {
          id: "2",
          accountId: subAccountId,
          debit: 0,
          credit: amount,
          currency,
        },
      ];

    case "income":
      return [
        {
          id: "1",
          accountId: subAccountId,
          debit: amount,
          credit: 0,
          currency,
        },
        {
          id: "2",
          accountId: mainAccountId,
          debit: 0,
          credit: amount,
          currency,
        },
      ];

    case "transfer":
      if (isDebtPayment) {
        return [
          {
            id: "1",
            accountId: mainAccountId,
            debit: amount,
            credit: 0,
            currency,
          },
          {
            id: "2",
            accountId: subAccountId,
            debit: 0,
            credit: amount,
            currency,
          },
        ];
      }
      return [
        {
          id: "1",
          accountId: subAccountId,
          debit: amount,
          credit: 0,
          currency,
        },
        {
          id: "2",
          accountId: mainAccountId,
          debit: 0,
          credit: amount,
          currency,
        },
      ];

    default:
      return [];
  }
};

export const formatWithDots = (value: string): string => {
  if (!value) return "";

  // Remove all non-digit characters
  const cleanNumber = value.replace(/\D/g, "");

  if (!cleanNumber) return "";

  // Add thousand separators with dots
  return cleanNumber.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
};

/**
 * Removes formatting and returns clean number string
 * @param value - Formatted string (e.g., "1.000.000")
 * @returns Clean number string (e.g., "1000000")
 *
 * @example
 * parseAmount("1.000.000") // "1000000"
 * parseAmount("Rp 1.000") // "1000"
 */
export const parseAmount = (value: string): string => {
  return value.replace(/\D/g, "");
};

/**
 * Parses a formatted amount to a float
 * @param value - Formatted string
 * @returns Number value
 *
 * @example
 * parseAmountToFloat("1.000.000") // 1000000
 * parseAmountToFloat("invalid") // 0
 */
export const parseAmountToFloat = (value: string): number => {
  const cleaned = parseAmount(value);
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : parsed;
};

/**
 * Formats a number for display with currency
 * @param amount - Number amount
 * @param addDots - Whether to add thousand separators
 * @returns Formatted string
 *
 * @example
 * formatAmount(1000000) // "1.000.000"
 * formatAmount(1000000, false) // "1000000"
 */
export const formatAmount = (
  amount: number,
  addDots: boolean = true
): string => {
  if (isNaN(amount)) return "0";

  const str = Math.floor(amount).toString();
  return addDots ? formatWithDots(str) : str;
};

/**
 * Validates if a string is a valid amount
 * @param value - String to validate
 * @returns True if valid number
 *
 * @example
 * isValidAmount("1000") // true
 * isValidAmount("abc") // false
 * isValidAmount("") // false
 */
export const isValidAmount = (value: string): boolean => {
  const cleaned = parseAmount(value);
  if (!cleaned) return false;

  const parsed = parseFloat(cleaned);
  return !isNaN(parsed) && parsed > 0;
};

type LabelConfig = {
  select: string;
  loading: string;
  notFound: string;
  add: string;
};

export const getLabelConfig = (
  type: string,
  mode: string,
  t: (key: string) => string
): LabelConfig => {
  const isMainType = type === "main";
  const isExpenseMode = mode === "expense";
  const isIncomeMode = mode === "income";

  // Handle main type
  if (isMainType) {
    if (isExpenseMode) {
      return {
        select: t("entry.select_category"),
        loading: t("entry.loading_category"),
        notFound: t("entry.no_category_found"),
        add: t("entry.add_category"),
      };
    }
    if (isIncomeMode) {
      return {
        select: t("entry.select_account"),
        loading: t("entry.loading_account"),
        notFound: t("entry.no_account_found"),
        add: t("entry.add_account"),
      };
    }
    // Debt/Transfer mode for main type
    return {
      select: t("entry.select_account"),
      loading: t("entry.loading_account"),
      notFound: t("entry.no_account_found"),
      add: t("entry.add_account"),
    };
  }

  // Handle secondary type (expense/income modes)
  if (isExpenseMode || isIncomeMode) {
    return {
      select: t("entry.select_account"),
      loading: t("entry.loading_account"),
      notFound: t("entry.no_account_found"),
      add: t("entry.add_account"),
    };
  }

  // Debt/Transfer mode for secondary type
  return {
    select: t("entry.select_account"),
    loading: t("entry.loading_account"),
    notFound: t("entry.no_account_found"),
    add: t("entry.add_account"),
  };
};
