import { supabase } from "@/lib/supabase";

const FALLBACK_RATES = [
  { bank: "Air Bank", fix_3: 4.89, fix_5: 4.79, fix_7: 4.89, fix_10: 4.99 },
  { bank: "Česká spořitelna", fix_3: 4.99, fix_5: 4.79, fix_7: 4.89, fix_10: 5.09 },
  { bank: "Raiffeisenbank", fix_3: 4.99, fix_5: 4.89, fix_7: 4.99, fix_10: 5.19 },
  { bank: "ČSOB / Hyp. banka", fix_3: 5.19, fix_5: 4.99, fix_7: 5.09, fix_10: 5.29 },
  { bank: "Komerční banka", fix_3: 5.09, fix_5: 4.99, fix_7: 5.09, fix_10: 5.19 },
  { bank: "Moneta", fix_3: 5.29, fix_5: 5.09, fix_7: 5.19, fix_10: 5.39 },
  { bank: "mBank", fix_3: 5.19, fix_5: 5.09, fix_7: 5.19, fix_10: 5.29 },
  { bank: "UniCredit Bank", fix_3: 5.09, fix_5: 4.99, fix_7: 5.09, fix_10: 5.19 },
];

export async function GET() {
  try {
    const { data, error } = await supabase
      .from("rates")
      .select("*")
      .order("bank");

    if (error || !data || data.length === 0) {
      return Response.json(FALLBACK_RATES);
    }

    return Response.json(data);
  } catch {
    return Response.json(FALLBACK_RATES);
  }
}
