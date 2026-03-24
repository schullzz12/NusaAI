import { createAdminSupabase } from "@/lib/supabase/server";
import { CREDIT_COSTS } from "@/types";

/**
 * Check if user has enough credits for an action
 */
export async function hasEnoughCredits(
  userId: string,
  action: keyof typeof CREDIT_COSTS
): Promise<{ enough: boolean; current: number; required: number }> {
  const supabase = createAdminSupabase();
  const required = CREDIT_COSTS[action];

  const { data, error } = await supabase
    .from("profiles")
    .select("credits")
    .eq("id", userId)
    .single();

  if (error || !data) {
    return { enough: false, current: 0, required };
  }

  return {
    enough: data.credits >= required,
    current: data.credits,
    required,
  };
}

/**
 * Deduct credits atomically using database function
 * Returns remaining credits or throws if insufficient
 */
export async function deductCredits(
  userId: string,
  action: keyof typeof CREDIT_COSTS
): Promise<number> {
  const supabase = createAdminSupabase();
  const amount = CREDIT_COSTS[action];

  const { data, error } = await supabase.rpc("deduct_credits", {
    p_user_id: userId,
    p_amount: amount,
  });

  if (error) {
    if (error.message.includes("Kredit tidak cukup")) {
      throw new Error("INSUFFICIENT_CREDITS");
    }
    throw error;
  }

  // Log the usage
  await supabase.from("transactions").insert({
    user_id: userId,
    type: "usage",
    credits: -amount,
    status: "paid",
    description: `Chat message (${amount} kredit)`,
  });

  return data as number;
}

/**
 * Get user's current credit balance
 */
export async function getCredits(userId: string): Promise<number> {
  const supabase = createAdminSupabase();

  const { data } = await supabase
    .from("profiles")
    .select("credits")
    .eq("id", userId)
    .single();

  return data?.credits ?? 0;
}
