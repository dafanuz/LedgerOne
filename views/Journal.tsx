import React, {
  useState,
  useMemo,
  useEffect,
  useCallback,
  useRef,
} from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "../store";

import { useSettings } from "@/contexts/SettingsContext";
import { useAuth } from "@/contexts/AuthContext";
import { useAccountTypes } from "@/contexts/AccountTypeContext";

import {
  DEBOUNCE_DELAY,
  FilterType,
  GroupEntry,
  Line,
} from "@/types/journal.type";

import { SearchInput } from "@/components/sections/journal/SearchInput";
import { FilterSelect } from "@/components/sections/journal/FilterSelect";
import { LoadingState } from "@/components/ui/loading/LoadingState";
import { EmptyState } from "@/components/sections/journal/EmptyState";
import { DateGroup } from "@/components/sections/journal/DateGroup";

import supabase from "@/utils/supabase";

export const Journal: React.FC = () => {
  const { user } = useAuth();
  const { currency } = useSettings();
  const { accountTypes } = useAccountTypes();
  const { t, language } = useTranslation();
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<FilterType>("All");
  const [rows, setRows] = useState<Line[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const abortControllerRef = useRef<AbortController | null>(null);
  const isInitialMount = useRef(true);

  useEffect(() => {
    if (isInitialMount.current || abortControllerRef.current === null) {
      setIsLoading(true);
    }

    const fetchData = async () => {
      if (!user?.id) {
        setIsLoading(false);
        return;
      }

      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      abortControllerRef.current = new AbortController();

      try {
        const { data, error } = await supabase.rpc("rpc_get_journal_v4", {
          p_user_id: user.id,
          p_search: searchTerm,
          p_account_type: filterType === "All" ? null : filterType,
        });

        if (!error && data) {
          setRows((data || []).filter((item: Line) => item.amount !== null));
        }
      } catch (err) {
        // Ignore abort errors
        if (err.name !== "AbortError") {
          console.error("Error fetching journal:", err);
        }
      } finally {
        setIsLoading(false);
        abortControllerRef.current = null;
        isInitialMount.current = false;
      }
    };

    const shouldDebounce =
      !isInitialMount.current && abortControllerRef.current !== null;
    const delay = shouldDebounce ? DEBOUNCE_DELAY : 0;

    const timeoutId = setTimeout(fetchData, delay);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [filterType, searchTerm, user?.id]);

  const handleSetFilter = (value: FilterType) => {
    setIsLoading(true);
    setFilterType(value);
  };

  const groupedEntries = useMemo(() => {
    const grouped = rows.reduce((acc, row) => {
      const date = row.tx_date?.toString() || "";
      const txId = row.transaction_id || "";

      if (!acc[date]) {
        acc[date] = {};
      }

      if (!acc[date][txId]) {
        acc[date][txId] = {
          transaction_id: txId,
          description: row.description,
          created_at: row.created_at,
          lines: [],
        };
      }

      acc[date][txId].lines!.push(row);
      return acc;
    }, {} as Record<string, Record<string, GroupEntry>>);

    return Object.fromEntries(
      Object.entries(grouped).map(([date, txMap]) => [
        date,
        Object.values(txMap),
      ])
    );
  }, [rows]);

  const sortedDates = useMemo(
    () =>
      Object.keys(groupedEntries).sort(
        (a, b) => new Date(b).getTime() - new Date(a).getTime()
      ),
    [groupedEntries]
  );

  const handleNavigate = useCallback(
    (id: string) => navigate(`/entry/${id}`),
    [navigate]
  );

  return (
    <div className="p-6 pt-10 min-h-screen">
      <div className="flex flex-col gap-4 mb-2">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white">
          {t("nav.journal")}
        </h1>

        <div className="flex gap-2 mb-4">
          <SearchInput
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder={
              t("journal.search_placeholder") || "Search transactions..."
            }
          />
          <FilterSelect
            value={filterType}
            onChange={handleSetFilter}
            options={accountTypes}
            t={t}
          />
        </div>
      </div>

      <div className="pb-20">
        {isLoading ? (
          <LoadingState text={"Loading journal..."} />
        ) : sortedDates.length === 0 ? (
          <EmptyState hasEntries={rows.length > 0} t={t} />
        ) : (
          sortedDates.map((date) => (
            <DateGroup
              key={date}
              date={date}
              entries={groupedEntries[date]}
              currency={currency}
              language={language}
              onNavigate={handleNavigate}
            />
          ))
        )}
      </div>
    </div>
  );
};
