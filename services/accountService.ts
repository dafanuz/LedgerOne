
import { Account, AccountType, CreateAccountInput } from "@/types/account.type";
import supabase from "@/utils/supabase";

export const accountService = {
  async getAccounts(userId: string): Promise<Account[]> {
    const { data, error } = await supabase
      .from("accounts")
      .select("*")
      .or(
        `and(is_system.eq.true,user_id.is.null),and(is_system.eq.false,user_id.eq.${userId})`
      )
      .order("account_type_id", { ascending: true })
      .order("is_system", { ascending: false }) // system dulu
      .order("name", { ascending: true });

    if (error) {
      console.error("getAccounts error:", error);
      throw error;
    }

    return data;
  },

  async getAccountsByType(
    userId: string,
    accountTypeId: number
  ): Promise<Account[]> {
    const { data, error } = await supabase
      .from("accounts")
      .select("*")
      .eq("user_id", userId)
      .eq("account_type_id", accountTypeId)
      .order("created_at");

    if (error) {
      console.error("getAccountsByType error:", error);
      throw error;
    }

    return data;
  },

  async createAccount(
    input: CreateAccountInput
  ): Promise<Account> {
    const { data, error } = await supabase
      .rpc("create_account", {
        p_name: input.name,
        p_emoji: input.emoji,
        p_account_type_id: input.account_type_id
      })


    if (error) {
      console.error("createAccount error:", error);
      throw error;
    }

    return data;
  },

  async updateAccount(
    accountId: number,
    payload: Partial<Pick<Account, "name" | "emoji" | "currency">>
  ): Promise<Account> {
    const { data, error } = await supabase
      .from("accounts")
      .update(payload)
      .eq("id", accountId)
      .select()
      .single();

    if (error) {
      console.error("updateAccount error:", error);
      throw error;
    }

    return data;
  },

  async deleteAccount(accountId: number) {
    const { error } = await supabase
      .from("accounts")
      .delete()
      .eq("id", accountId);

    if (error) {
      console.error("deleteAccount error:", error);
      throw error;
    }
  },
};

export const AccountTypeService = {
  async getAll(): Promise<AccountType[]> {
    const { data, error } = await supabase
      .from("account_types")
      .select("*")
      .order("id");

    if (error) {
      console.error("getAccountTypes error:", error);
      throw error;
    }

    return data;
  },
};