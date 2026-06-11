// DeepL 번역 프록시 (한국어 → 영어)
// - DEEPL_API_KEY는 서버에만 존재 (브라우저 노출 없음)
// - 관리자(Supabase Auth 로그인) 토큰을 검증한 요청만 처리 → 무료 한도 도용 방지
export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const deeplKey = process.env.DEEPL_API_KEY;
  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const anonKey = process.env.VITE_SUPABASE_ANON_KEY;

  if (!deeplKey) {
    res.status(500).json({ error: "DEEPL_API_KEY is not configured in Vercel env vars" });
    return;
  }

  // 1) 관리자 인증 검증
  const authHeader = req.headers.authorization || "";
  const token = authHeader.replace(/^Bearer\s+/i, "");
  if (!token) {
    res.status(401).json({ error: "Login required" });
    return;
  }
  const userRes = await fetch(`${supabaseUrl}/auth/v1/user`, {
    headers: { apikey: anonKey, Authorization: `Bearer ${token}` },
  });
  if (!userRes.ok) {
    res.status(401).json({ error: "Invalid session" });
    return;
  }

  // 2) 번역 요청
  const { texts } = req.body || {};
  if (!Array.isArray(texts) || texts.length === 0 || texts.length > 20) {
    res.status(400).json({ error: "texts must be an array of 1-20 strings" });
    return;
  }

  const deeplRes = await fetch("https://api-free.deepl.com/v2/translate", {
    method: "POST",
    headers: {
      Authorization: `DeepL-Auth-Key ${deeplKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      text: texts.map((t) => String(t).slice(0, 20000)),
      source_lang: "KO",
      target_lang: "EN-US",
    }),
  });

  if (!deeplRes.ok) {
    const detail = await deeplRes.text();
    res.status(502).json({ error: `DeepL error (${deeplRes.status})`, detail: detail.slice(0, 300) });
    return;
  }

  const data = await deeplRes.json();
  res.status(200).json({ translations: data.translations.map((t) => t.text) });
}
