import { supabase } from "@/lib/supabase";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, phone, topic, note, params } = body;

    if (!name || !phone) {
      return Response.json({ error: "Jméno a telefon jsou povinné." }, { status: 400 });
    }

    const { error } = await supabase
      .from("leads")
      .insert({ name, phone, topic: topic ?? null, note: note ?? null, params: params ?? null });

    if (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }

    return Response.json({ ok: true });
  } catch {
    return Response.json({ error: "Neplatný požadavek." }, { status: 400 });
  }
}
