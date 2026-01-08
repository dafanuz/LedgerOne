import React from "react";
import {
  format,
  isSameDay,
  isSameWeek,
  isSameMonth,
  isSameYear,
  startOfWeek,
  subMonths,
  startOfMonth,
  endOfMonth,
  isWithinInterval,
} from "date-fns";
import {
  Currency,
  TimeFilter,
  JournalEntry,
  AccountType,
  Account,
  Language,
} from "./types";
import { RATES_TO_IDR } from "./constants";

import * as XLSX from "xlsx";

// Helper to convert any amount from Source Currency to Target Currency via IDR Base
export const convertAmount = (
  amount: number,
  from: Currency,
  to: Currency
): number => {
  if (from === to) return amount;

  // 1. Convert "From" to IDR (Base)
  const amountInIdr = amount * RATES_TO_IDR[from];

  // 2. Convert IDR to "To"
  return amountInIdr / RATES_TO_IDR[to];
};

export const formatCurrency = (amount: number, currency: Currency): string => {
  // Use 'id-ID' locale to ensure standard Indonesian formatting:
  // - Thousands separator: Dot (.)
  // - Decimal separator: Comma (,)
  // const fractionDigits = currency === Currency.JPY ? 0 : 2;
  const fractionDigits = 0;

  const formatter = new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: currency,
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  });
  return formatter.format(amount);
};

export const formatDate = (
  dateString: string,
  language: Language = "en"
): string => {
  const date = new Date(dateString);
  const locale = language === "id" ? "id-ID" : "en-US";

  // Format: "Selasa, 16 Desember 2025" or "Tuesday, 16 December 2025"
  return new Intl.DateTimeFormat(locale, {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date);
};

export const filterEntriesByTime = (
  entries: JournalEntry[],
  filter: TimeFilter
): JournalEntry[] => {
  const now = new Date();
  return entries.filter((entry) => {
    const entryDate = new Date(entry.date);
    switch (filter) {
      case "today":
        return isSameDay(entryDate, now);
      case "week":
        return isSameWeek(entryDate, now, { weekStartsOn: 1 });
      case "month":
        return isSameMonth(entryDate, now);
      case "year":
        return isSameYear(entryDate, now);
      case "all":
        return true;
      default:
        return true;
    }
  });
};

export const calculateTotals = (
  entries: JournalEntry[],
  accounts: Account[],
  displayCurrency: Currency = Currency.IDR
) => {
  const balances: Record<string, number> = {};

  accounts.forEach((acc) => (balances[acc.id] = 0));

  entries.forEach((entry) => {
    entry.items.forEach((item) => {
      const acc = accounts.find((a) => a.id === item.accountId);
      if (!acc) return;

      const itemCurrency = item.currency || Currency.IDR;

      const debitInDisplay = convertAmount(
        item.debit,
        itemCurrency,
        displayCurrency
      );
      const creditInDisplay = convertAmount(
        item.credit,
        itemCurrency,
        displayCurrency
      );

      const amount = debitInDisplay - creditInDisplay;

      if (acc.type === AccountType.ASSET || acc.type === AccountType.EXPENSE) {
        balances[acc.id] += amount;
      } else {
        balances[acc.id] -= amount;
      }
    });
  });

  const totals = {
    assets: 0,
    liabilities: 0,
    equity: 0,
    income: 0,
    expenses: 0,
    netIncome: 0,
    netWorth: 0,
  };

  accounts.forEach((acc) => {
    const bal = balances[acc.id] || 0;
    switch (acc.type) {
      case AccountType.ASSET:
        totals.assets += bal;
        break;
      case AccountType.LIABILITY:
        totals.liabilities += bal;
        break;
      case AccountType.EQUITY:
        totals.equity += bal;
        break;
      case AccountType.INCOME:
        totals.income += bal;
        break;
      case AccountType.EXPENSE:
        totals.expenses += bal;
        break;
    }
  });

  totals.netIncome = totals.income - totals.expenses;

  // Standard Accounting Equation: Assets = Liabilities + Equity
  // Therefore: Equity (Net Worth) = Assets - Liabilities
  // We use this formula for the "Net Worth" display to ensure it captures
  // the true position regardless of how the user categorized 'Owner Capital' entries.
  totals.netWorth = totals.assets - totals.liabilities;

  // For book balancing purposes, we still track the Ledger Equity
  totals.equity += totals.netIncome;

  return totals;
};

export const getPreviousPeriodData = (
  entries: JournalEntry[],
  accounts: Account[],
  filter: TimeFilter,
  displayCurrency: Currency
) => {
  if (filter === "all" || filter === "year") return null;

  const now = new Date();
  let start: Date, end: Date;

  if (filter === "month") {
    start = startOfMonth(subMonths(now, 1));
    end = endOfMonth(subMonths(now, 1));
  } else if (filter === "week") {
    start = startOfWeek(subMonths(now, 1));
    return null;
  } else {
    return null;
  }

  const prevEntries = entries.filter((e) =>
    isWithinInterval(new Date(e.date), { start, end })
  );
  return calculateTotals(prevEntries, accounts, displayCurrency);
};

export const exportBackupToFile = (data: any) => {
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: "application/json",
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = `ledger-backup-${Date.now()}.json`;

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
};

export const exportBackupToExcel = async (data: any) => {
  const wb = XLSX.utils.book_new();
  const tables = [
    "accounts",
    "transactions",
    "journal_entries",
    "budgets",
    "budget_logs",
  ];

  tables.forEach((tableName) => {
    const tableData = data[tableName];

    if (Array.isArray(tableData) && tableData.length > 0) {
      const ws = XLSX.utils.json_to_sheet(tableData);
      XLSX.utils.book_append_sheet(wb, ws, tableName);
    } else {
      const ws = XLSX.utils.json_to_sheet([]);
      XLSX.utils.book_append_sheet(wb, ws, tableName);
    }
  });

  XLSX.writeFile(wb, `ledger-backup-${Date.now()}.xlsx`);
};
