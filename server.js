const express = require("express");
const { chromium } = require("@playwright/test");

const app = express();
app.use(express.json({ limit: "10mb" }));

// Test basic route
app.get("/", (req, res) => {
  res.json({ ok: true, message: "Playwright backend is running!" });
});

// Screenshot endpoint
app.post("/api/screenshot", async (req, res) => {
  try {
    const url = req.body?.url;
    if (!url) {
      return res.status(400).json({ ok: false, error: "URL is required" });
    }

    // Launch the browser
    const browser = await chromium.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"]
    });

    const page = await browser.newPage();
    await page.goto(url, { waitUntil: "networkidle" });

    const image = await page.screenshot({ fullPage: true });
    await browser.close();

    res.json({
      ok: true,
      screenshot: image.toString("base64")
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({
      ok: false,
      error: err.message
    });
  }
});

// Render uses PORT from env
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on ${PORT}`));
