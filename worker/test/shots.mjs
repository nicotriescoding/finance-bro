// Visual check driver: real browser against local next dev + wrangler dev.
// Usage: PLAYWRIGHT_SKIP_VALIDATE_HOST_REQUIREMENTS=true node worker/test/shots.mjs <outdir>
import { chromium } from "playwright-core";

const OUT = process.argv[2] ?? "/tmp/shots";
const SITE = "http://127.0.0.1:3111";

const browser = await chromium.launch({
    executablePath: process.env.CHROMIUM_PATH,
    args: ["--no-sandbox", "--disable-dev-shm-usage"],
});

async function makeContext(viewport) {
    const ctx = await browser.newContext({ viewport, colorScheme: "dark" });
    await ctx.addInitScript(() => {
        try {
            localStorage.setItem(
                "fb-cookie-consent",
                JSON.stringify({ analytics: false, decidedAt: Date.now() })
            );
        } catch {}
    });
    return ctx;
}

// ---------------------------------------------------------------- desktop
{
    const ctx = await makeContext({ width: 1440, height: 900 });
    const page = await ctx.newPage();
    page.on("pageerror", (e) => console.log("PAGEERROR:", e.message));

    await page.goto(`${SITE}/multiplayer`, { waitUntil: "networkidle" });
    await page.fill("#mp-name", "ScreenshotBro");
    await page.screenshot({ path: `${OUT}/mp-home.png`, fullPage: true });
    console.log("shot: home");

    await page.click("text=Challenge Inflation 📈");
    await page.waitForSelector("text=Game setup", { timeout: 15000 });
    await page.waitForSelector("text=Inflation 📈", { timeout: 15000 });
    await page.click("button:has-text('⚡ Rapid')");
    await page.waitForTimeout(400);
    await page.screenshot({ path: `${OUT}/mp-lobby.png`, fullPage: true });
    console.log("shot: lobby (bot seated, rapid on)");

    await page.click("text=Open the market 🔔");
    await page.waitForSelector("text=The corporate ladder", { timeout: 15000 });
    await page.waitForSelector("text=POSTING 01", { timeout: 15000 });
    await page.screenshot({ path: `${OUT}/mp-game-desktop.png`, fullPage: false });
    console.log("shot: game desktop");
    await ctx.close();
}

// ---------------------------------------------------------------- phone
{
    const ctx = await makeContext({ width: 390, height: 844 });
    const page = await ctx.newPage();
    page.on("pageerror", (e) => console.log("PAGEERROR:", e.message));

    await page.goto(`${SITE}/`, { waitUntil: "networkidle" });
    await page.screenshot({ path: `${OUT}/landing-phone.png`, fullPage: true });
    console.log("shot: landing phone");

    await page.goto(`${SITE}/multiplayer`, { waitUntil: "networkidle" });
    await page.fill("#mp-name", "PhoneBro");
    await page.screenshot({ path: `${OUT}/mp-home-phone.png`, fullPage: true });
    console.log("shot: mp home phone");

    await page.click("text=Challenge Inflation 📈");
    await page.waitForSelector("text=Game setup", { timeout: 15000 });
    await page.click("text=Open the market 🔔");
    await page.waitForSelector("text=POSTING 01", { timeout: 15000 });
    await page.screenshot({ path: `${OUT}/mp-game-phone.png`, fullPage: false });
    console.log("shot: game phone");
    await ctx.close();
}

await browser.close();
console.log("done");
