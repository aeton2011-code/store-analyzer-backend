// api/analyze-store.js
module.exports = async (req, res) => {
  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, error: "Method not allowed" });
  }

  const body = typeof req.body === "string" ? JSON.parse(req.body || "{}") : req.body;
  const url = body?.url;

  if (!url) {
    return res.status(400).json({ ok: false, error: "url is required" });
  }

  // مفتاح Gemini
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ ok: false, error: "Missing GEMINI_API_KEY" });
  }

  try {
    // 1) أخذ Screenshot من موقع مجاني (URLBox)
    const screenshotUrl =
      `https://api.urlbox.io/v1/[public]/png?url=${encodeURIComponent(url)}&width=1280&height=2000&full_page=true&encoding=base64`;

    const screenshotRes = await fetch(screenshotUrl);
    const screenshotJson = await screenshotRes.json();

    const base64Image = screenshotJson.base64;

    if (!base64Image) {
      return res.status(500).json({
        ok: false,
        error: "Failed to capture screenshot"
      });
    }

    // 2) إرسال الصورة إلى Gemini
    const prompt =
      "حلّل هذا المتجر الإلكتروني من ناحية تجربة المستخدم، الثقة، وضوح العرض، مشاكل الشراء، والتحسينات الممكنة. " +
      "أعد النتيجة بصيغة JSON نصّي يحتوي: summary, issues, recommendations, seo_score, ux_score, trust_score.";

    const geminiRes = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=" + apiKey,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [
                { text: prompt },
                {
                  inline_data: {
                    mime_type: "image/png",
                    data: base64Image
                  }
                }
              ]
            }
          ]
        })
      }
    );

    const geminiJson = await geminiRes.json();
    const text = geminiJson?.candidates?.[0]?.content?.parts?.[0]?.text || "";

    return res.status(200).json({
      ok: true,
      analysis_text: text,
      raw: geminiJson
    });
  } catch (err) {
    return res.status(500).json({ ok: false, error: err.message });
  }
};
