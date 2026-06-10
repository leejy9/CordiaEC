import type { VercelRequest, VercelResponse } from "@vercel/node";
import { createClient } from "@supabase/supabase-js";

export default async function handler(_req: VercelRequest, res: VercelResponse) {
  const supabase = createClient(
    process.env.VITE_SUPABASE_URL!,
    process.env.VITE_SUPABASE_ANON_KEY!
  );
  await supabase.from("site_settings").select("key").limit(1);
  res.status(200).json({ ok: true });
}
