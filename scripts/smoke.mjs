/**
 * Route smoke test. Boots the production build and asserts every route still
 * serves what it is supposed to serve.
 *
 * Run: npm run smoke   (requires `npm run build` first — `npm run check` chains both)
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
    else failures.push(`${name}${detail ? ` — ${detail}` : ""}`);
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
        "/ is branded finance-bro",
        /<title>finance-bro<\/title>/.test(homeHtml),
        "title tag is not exactly 'finance-bro'"
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
        homeHtml.includes("works fully offline") && homeHtml.includes("topics")
    );
    check("/ declares lang=en", /<html[^>]+lang="en"/.test(homeHtml));
    check(
        "/ has an English meta description",
        /<meta name="description" content="Free exam trainer/.test(homeHtml)
    );
    for (const german of ["Zinsen", "Aufgaben", "Klausur", "Themen", "Kapitalkosten"]) {
        check(`/ has no leftover German ("${german}")`, !homeHtml.includes(german));
    }

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
