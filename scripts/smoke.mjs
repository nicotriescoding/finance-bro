/**
 * Route smoke test. Boots the production build and asserts every route still
 * serves what it is supposed to serve.
 *
 * Run: npm run smoke   (requires `npm run build` first - `npm run check` chains both)
 *
 * Each check below exists because something actually broke once. Add a case
 * whenever you fix a bug that a build alone would not have caught.
 */
import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import { setTimeout as sleep } from "node:timers/promises";

const PORT = 3210;
const BASE = `http://127.0.0.1:${PORT}`;

const failures = [];
const passes = [];

function check(name, condition, detail = "") {
    if (condition) passes.push(name);
    else failures.push(`${name}${detail ? ` - ${detail}` : ""}`);
}

// Run the local binary rather than `npx` so there is no wrapper process between
// us and the server, and put it in its own process group so shutdown takes the
// whole tree with it.
const nextBin = existsSync("node_modules/.bin/next") ? "node_modules/.bin/next" : "npx";
const nextArgs =
    nextBin === "npx"
        ? ["next", "start", "-p", String(PORT)]
        : ["start", "-p", String(PORT)];

const server = spawn(nextBin, nextArgs, {
    stdio: ["ignore", "pipe", "pipe"],
    env: process.env,
    detached: true,
});
let serverLog = "";
server.stdout.on("data", (d) => (serverLog += d));
server.stderr.on("data", (d) => (serverLog += d));

async function waitForServer(timeoutMs = 60_000) {
    const deadline = Date.now() + timeoutMs;
    while (Date.now() < deadline) {
        try {
            const r = await fetch(BASE, { redirect: "manual" });
            if (r.status < 500) return true;
        } catch {
            /* not up yet */
        }
        await sleep(500);
    }
    return false;
}

try {
    if (!(await waitForServer())) {
        console.error("Server never became ready.\n" + serverLog);
        process.exit(1);
    }

    // --- home page -------------------------------------------------------
    const home = await fetch(BASE);
    const homeHtml = await home.text();
    check("/ returns 200", home.status === 200, `got ${home.status}`);
    check(
        "/ is branded FinanceBro (caps F and B, per Nico 2026-08-25)",
        /<title>FinanceBro<\/title>/.test(homeHtml),
        "title tag is not exactly 'FinanceBro'"
    );
    check(
        "/ no longer says FinanzTrainer",
        !/FinanzTrainer/.test(homeHtml)
    );
    check(
        "/ has a meta description",
        /<meta name="description"/.test(homeHtml)
    );
    check(
        "/ ships structured data",
        /application\/ld\+json/.test(homeHtml)
    );
    for (const label of [
        "Investment &amp; Financial Management",
        "Economics 1",
        "Economics 2",
        "Financial Accounting",
        "Cost Accounting",
        "Entrepreneurship",
        "Marketing",
    ]) {
        check(`/ lists ${label}`, homeHtml.includes(label));
    }
    check(
        "/ renders server-side (no empty loading shell)",
        homeHtml.includes("questions") && !/^\s*Loading\.\.\.\s*$/m.test(homeHtml)
    );
    // The six non-Finance banks are empty until their TUM past exams are
    // ingested; their cards must say so instead of advertising "0 questions".
    check(
        "/ shows the exam-ingest empty state for rebuilt banks",
        homeHtml.includes("Exam questions coming soon")
    );
    // The site is English end to end. A German edition is planned as a separate
    // locale later - until then, stray German is a regression, not a feature.
    check(
        "/ ships English copy",
        homeHtml.includes("against inflation") && homeHtml.includes("topics")
    );
    check("/ declares lang=en", /<html[^>]+lang="en"/.test(homeHtml));
    check(
        "/ has an English meta description",
        /<meta name="description" content="Free exam trainer/.test(homeHtml)
    );
    for (const german of ["Zinsen", "Aufgaben", "Klausur", "Themen", "Kapitalkosten"]) {
        check(`/ has no leftover German ("${german}")`, !homeHtml.includes(german));
    }
    // The landing page's one job (2026-08-22) is pointing at /career; the
    // course names stay below in the subject strip for SEO. Since 2026-08-25
    // it does so dressed as a banking app.
    check("/ has the Make some money CTA", homeHtml.includes("Make some money 🤑"));
    check(
        "/ wears the bank statement",
        homeHtml.includes("Available balance") && homeHtml.includes("Recent transactions")
    );
    // (SSR puts a comment node between "Salary · " and the rank name, so the
    // pieces are asserted separately.)
    check(
        "/ shows the current position's payroll (0 € for Unemployed)",
        homeHtml.includes("Salary ·") &&
            homeHtml.includes("Unemployed") &&
            homeHtml.includes("Last payroll")
    );
    check(
        "/ balance pill names the rank, not the tier",
        homeHtml.includes("UNEMPLOYED") && !homeHtml.includes("TIER 1")
    );
    // Removed 2026-08-25 per Nico - these lines must stay gone.
    check(
        "/ dropped the tuition chip",
        !homeHtml.includes("works fully offline") && !homeHtml.includes("tuition: 0")
    );
    check(
        "/ dropped the TUM tagline sentence",
        !homeHtml.includes("exam trainer for business administration at TUM")
    );
    check("/ races inflation, not the clock", !homeHtml.includes("against the clock"));
    check("/ teases the Munich Matcha Alert", homeHtml.includes("Munich Matcha Alert"));
    // Nico's rule (2026-08-22): no em dashes in shipped copy, ever. (Escaped
    // so this file itself stays em-dash-free.)
    const EM_DASH = "\u2014";
    check("/ ships no em dashes", !homeHtml.includes(EM_DASH));

    // --- dark-mode regression guard -------------------------------------
    // An unlayered `body { background }` rule behind a prefers-color-scheme
    // media query once beat Tailwind's utilities and rendered dark text on a
    // dark background for anyone whose OS was in dark mode.
    const cssHrefs = [...homeHtml.matchAll(/href="([^"]+\.css[^"]*)"/g)].map((m) => m[1]);
    check("/ links at least one stylesheet", cssHrefs.length > 0);
    for (const href of cssHrefs) {
        const css = await (await fetch(new URL(href, BASE))).text();
        check(
            `stylesheet ${href} has no prefers-color-scheme override`,
            !css.includes("prefers-color-scheme")
        );
    }

    // --- quiz ------------------------------------------------------------
    for (const subject of [
        "finance",
        "econ1",
        "econ2",
        "financial_accounting",
        "cost_accounting",
        "entrepreneurship",
        "marketing",
    ]) {
        const r = await fetch(`${BASE}/quiz?subject=${subject}`);
        check(`/quiz?subject=${subject} returns 200`, r.status === 200, `got ${r.status}`);
    }

    // --- career (session setup, design 3a) -------------------------------
    const career = await fetch(`${BASE}/career`);
    const careerHtml = await career.text();
    check("/career returns 200", career.status === 200, `got ${career.status}`);
    check(
        "/career is the dead-end career setup",
        careerHtml.includes("dead-end career")
    );
    check(
        "/career has the start button",
        careerHtml.includes("Start earning")
    );
    // stepped setup (2026-08-22): explicit steps, nothing preselected, a
    // "Select all" tick row instead of a text toggle
    check(
        "/career shows the stepped setup with Select all",
        careerHtml.includes("Step 1") && careerHtml.includes("Select all")
    );
    check("/career ships no em dashes", !careerHtml.includes(EM_DASH));
    // "Ad rail · kept away from the maths" was meta-commentary, not UI copy;
    // removed 2026-08-25 (the ad slots themselves stay).
    const quiz = await fetch(`${BASE}/quiz?subject=finance`);
    const quizHtml = await quiz.text();
    check("/quiz has no ad-rail meta label", !quizHtml.includes("kept away from the maths"));
    // the navy chrome links every page to the setup
    check("/ links the Career page", homeHtml.includes("Career 🪦"));

    // --- library (took the Language slot in the nav, 2026-08-21) ---------
    const library = await fetch(`${BASE}/library`);
    const libraryHtml = await library.text();
    check("/library returns 200", library.status === 200, `got ${library.status}`);
    check(
        "/library shelves the founding books",
        libraryHtml.includes("SPIN Selling") && libraryHtml.includes("The Lean Startup")
    );
    check(
        "/library discloses the affiliate links as advertising",
        libraryHtml.includes("affiliate")
    );
    // Nico's rule: the Library is ad-free. "Sponsored" is AdSlot's label.
    check("/library carries no ad slots", !libraryHtml.includes("Sponsored"));
    // Real shop since 2026-08-28: Amazon links live, the dead placeholder is gone.
    check("/library links Amazon", libraryHtml.includes("amazon.de"));
    check("/library rates by ROI multiplier", libraryHtml.includes("ROI"));
    const products = await fetch(`${BASE}/products`);
    const productsHtml = await products.text();
    check("/products returns 200", products.status === 200, `got ${products.status}`);
    check("/products links Amazon", productsHtml.includes("amazon.de"));
    check(
        "/products lost the dead placeholder links",
        !productsHtml.includes("affiliate-link.de")
    );
    check(
        "/products keeps the canon vest copy",
        productsHtml.includes("superiority complex")
    );
    check("/products sells the Birkin out", productsHtml.includes("SOLD OUT"));
    // The three joke bundles (2026-08-29) and the desktop skyscraper rails.
    check(
        "/products shelves the three bundles",
        productsHtml.includes("FinanceBro Starter Pack") &&
            productsHtml.includes("Undercover Broke Student") &&
            productsHtml.includes("BWL Marie")
    );
    check(
        "/products carries the desktop skyscraper rail",
        productsHtml.includes("wide skyscraper")
    );
    // Lean Startup's corrected rating (Nico, 2026-08-29): ×67, that's the point.
    check("/library rates Lean Startup ×67", libraryHtml.includes("ROI ×67"));
    // The small print merged into one compact card (Nico: less dominant).
    check(
        "/library keeps the compact small print",
        libraryHtml.includes("The small print")
    );
    check("/ links the Library", homeHtml.includes("Library 📚"));
    check("/ no longer links the Language page", !homeHtml.includes("Language 🎤"));

    // --- legal pages (added 2026-08-21) -----------------------------------
    const impressum = await fetch(`${BASE}/impressum`);
    const impressumHtml = await impressum.text();
    check("/impressum returns 200", impressum.status === 200, `got ${impressum.status}`);
    check(
        "/impressum names the operator with a full address (§ 5 DDG)",
        impressumHtml.includes("Nicolas Dumpe") && impressumHtml.includes("85579 Neubiberg")
    );
    // The EU ODR platform shut down 2025-07-20; the once-mandatory link must
    // never come back.
    check(
        "/impressum has no dead EU-ODR link",
        !impressumHtml.includes("ec.europa.eu/odr")
    );

    const privacy = await fetch(`${BASE}/privacy`);
    const privacyHtml = await privacy.text();
    check("/privacy returns 200", privacy.status === 200, `got ${privacy.status}`);
    check(
        "/privacy covers consent-gated analytics",
        privacyHtml.includes("PostHog") && privacyHtml.includes("consent")
    );
    check(
        "/ footer links the legal pages from every page",
        homeHtml.includes("Impressum") && homeHtml.includes("Cookie settings")
    );

    // --- legacy route ----------------------------------------------------
    const tasks = await fetch(`${BASE}/tasks`, { redirect: "manual" });
    check(
        "/tasks redirects to the quiz",
        [301, 302, 307, 308].includes(tasks.status) &&
            (tasks.headers.get("location") ?? "").includes("/quiz"),
        `status ${tasks.status}, location ${tasks.headers.get("location")}`
    );

    // --- SEO surface -----------------------------------------------------
    const robots = await fetch(`${BASE}/robots.txt`);
    const robotsTxt = await robots.text();
    check("/robots.txt returns 200", robots.status === 200);
    check("/robots.txt points at the sitemap", robotsTxt.includes("sitemap.xml"));

    const sitemap = await fetch(`${BASE}/sitemap.xml`);
    const sitemapXml = await sitemap.text();
    check("/sitemap.xml returns 200", sitemap.status === 200);
    check(
        "/sitemap.xml lists every subject",
        ["finance", "econ1", "econ2", "financial_accounting", "cost_accounting", "entrepreneurship", "marketing"]
            .every((s) => sitemapXml.includes(`subject=${s}`))
    );

    const og = await fetch(`${BASE}/opengraph-image`);
    check("/opengraph-image returns 200", og.status === 200, `got ${og.status}`);
    check(
        "/opengraph-image is a PNG",
        (og.headers.get("content-type") ?? "").includes("image/png")
    );
} finally {
    try {
        process.kill(-server.pid, "SIGTERM"); // whole process group
    } catch {
        server.kill("SIGTERM");
    }
}

console.log(`${passes.length} checks passed`);
if (failures.length) {
    console.error(`\n${failures.length} FAILED:`);
    failures.forEach((f) => console.error("  x " + f));
    process.exit(1);
}
console.log("Route smoke test clean.");
// The server's piped stdio would otherwise keep the event loop alive.
process.exit(0);
