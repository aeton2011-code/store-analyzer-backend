const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const { chromium } = require("playwright");

const app = express();
app.use(cors());
app.use(bodyParser.json({ limit: "20mb" }));

app.get("/", (req, res) => {
  res.json({ ok: true, message: "Playwright Backend Running" });
});

app.post("/analyze", async (req, res) => {
  const url = req.body?.url;

  if (!url) {
    return res.status(400).json({ ok: false, error: "Missing 'url'" });
  }

  try {
    const browser = await chromium.launch({
      headless: true,
      args: ["--no-sandbox"]
    });

    const page = await browser.newPage();
    await page.setViewportSize({ width: 1280, height: 1500 });

    await page.goto(url, {
      waitUntil: "networkidle",
      timeout: 60000
    });

    const screenshot = await page.screenshot({ fullPage: true });

    const html = await page.content();
    const title = await page.title();

    await browser.close();

    res.json({
      ok: true,
      title,
      screenshot_base64: screenshot.toString("base64"),
      html
    });
  } catch (err) {
    return res.status(500).json({
      ok: false,
      error: err.message
    });
  }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () =>
  console.log("Playwright Store Analyzer running on port " + PORT)
);
