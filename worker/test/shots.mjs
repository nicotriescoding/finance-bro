// Visual check driver: real browser against local next dev + wrangler dev.
// Usage: PLAYWRIGHT_SKIP_VALIDATE_HOST_REQUIREMENTS=true node worker/test/shots.mjs <outdir>
import { chromium } from "playwright-core";

const OUT = process.argv[2] ?? "/tmp/shots";
const SITE = "http://127.0.0.1:3111";

const browser = await chromium.launch({
    executablePath: process.env.CHROMIUM_PATH,
    args: ["--no-sandbox", "--disable-dev-shm-usage"],
});
const ctx = await browser.newContext({
    viewport: { width: 1280, height: 900 },
    colorScheme: "dark", // Nico's machine is dark mode - the page must stay light
});
// pre-answer the cookie banner so it never overlays the buttons
await ctx.addInitScript(() => {
    try {
        localStorage.setItem(
            "fb-cookie-consent",
            JSON.stringify({ analytics: false, decidedAt: Date.now() })
        );
    } catch {}
});
const page = await ctx.newPage();
page.on("pageerror", (e) => console.log("PAGEERROR:", e.message));
page.on("console", (m) => m.type() === "error" && console.log("CONSOLE:", m.text()));

await page.goto(`${SITE}/multiplayer`, { waitUntil: "networkidle" });
await page.fill("#mp-name", "ScreenshotBro");
await page.screenshot({ path: `${OUT}/mp-home.png`, fullPage: true });
console.log("shot: home");

// open a room -> lobby
await page.click("text=Open a room 🔑");
await page.waitForSelector("text=Game setup", { timeout: 15000 });
await page.screenshot({ path: `${OUT}/mp-lobby.png`, fullPage: true });
console.log("shot: lobby");

// add the bot, start, wait for the posting card
await page.click("text=Let Inflation 📈 play too");
await page.click("text=Open the market 🔔");
await page.waitForSelector("text=Live scoreboard", { timeout: 15000 });
await page.waitForSelector("text=POSTING 01", { timeout: 15000 });
await page.screenshot({ path: `${OUT}/mp-game.png`, fullPage: true });
console.log("shot: game");

await browser.close();
console.log("done");
