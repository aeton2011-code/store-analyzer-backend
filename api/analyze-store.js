// api/analyze-store.js
const chromium = require("@sparticuz/chromium");
const puppeteer = require("puppeteer-core");

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, error: "Method not allowed" });
  }

  let body = req.body;
  if (typeof body === "string") {
    try {
      body = JSON.parse(body || "{}");
    } catch {
      return res.status(400).json({ ok: false, error: "Invalid JSON body" });
    }
  }

  const url = body?.url;
  if (!url) {
    return res.status(400).json({ ok: false, error: "Missing 'url'" });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ ok: false, error: "Missing GEMINI_API_KEY" });
  }

  let browser;

  try {
    // المهم هنا! إعدادات Vercel المضمونة
    const execPath = await chromium.executablePath();

    browser = await puppeteer.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath: execPath,
      headless: true,              // مهم
      ignoreDefaultArgs: ["--disable-extensions"],
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 720 });
    await page.goto(url, { waitUntil: "networkidle2", timeout: 60000 });

    const screenshotBuffer = await page.screenshot({ type: "png", fullPage: true });

    await browser.close();
    browser = null;

    const base64Image = screenshotBuffer.toString("base64");

    const prompt =
      "أنت خبير تحسين تجربة شراء وتجربة مستخدم CRO/UX. " +
      "حلّل الصفحة بناءً على الصورة واقترح تحسينات واضحة.".trim();

    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=" +
        apiKey,
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
                    data: base64Image,
                  },
                },
              ],
            },
          ],
        }),
      }
    );

    const json = await response.json();

    return res.status(200).json({
      ok: true,
      result: json,
    });
  } catch (err) {
    console.error("ERROR:", err);
    if (browser) await browser.close();

    return res.status(500).json({
      ok: false,
      error: err.message,
    });
  }
};
