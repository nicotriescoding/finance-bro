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
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
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
    // Banks without an ingested exam yet (Financial Accounting, Entrepreneurship,
    // Marketing) must say so instead of advertising "0 questions".
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
    // Body only: since 2026-09-11 the <head> deliberately carries German search
    // terms ("Klausuraufgaben", the meta keywords) - that is how the audience
    // googles, and it is metadata, not copy. See src/lib/seo.ts.
    // The JSON-LD <script> sits in the body and carries the same terms - strip
    // scripts, keep the copy.
    const bodyStart = homeHtml.indexOf("<body");
    check("/ has a <body>", bodyStart > 0);
    const homeBody = homeHtml.slice(bodyStart).replace(/<script[\s\S]*?<\/script>/g, "");
    for (const german of ["Zinsen", "Aufgaben", "Klausur", "Themen", "Kapitalkosten"]) {
        check(`/ has no leftover German in the body ("${german}")`, !homeBody.includes(german));
    }
    // --- search metadata (scenario A, 2026-09-11) -------------------------
    // Every page carries its own canonical (the root used to set "/" for all
    // of them) and the geo terms sit in the root description.
    check(
        "/ canonical is the root",
        /<link rel="canonical" href="https:\/\/www\.finance-bro\.de\/?"\/?>/.test(homeHtml)
    );
    check(
        "/ description names München and Garching",
        /<meta name="description" content="[^"]*München[^"]*Garching/.test(homeHtml)
    );
    check(
        "/ ships the Organization + WebSite + WebApplication graph",
        /"@graph"/.test(homeHtml) && /"areaServed"/.test(homeHtml) && /"EducationalAudience"/.test(homeHtml)
    );
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
        "/ shows the current position's payroll (20 € pocket money for Pupil)",
        homeHtml.includes("Salary ·") &&
            homeHtml.includes("Pupil") &&
            homeHtml.includes("Last payroll")
    );
    check(
        "/ balance pill names the rank, not the tier",
        homeHtml.includes("PUPIL") && !homeHtml.includes("TIER 1")
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
    check(
        "/quiz?subject=finance canonical keeps the subject query",
        quizHtml.includes('rel="canonical" href="https://www.finance-bro.de/quiz?subject=finance"')
    );
    check(
        "/quiz?subject=finance description carries the German course name and the city",
        /<meta name="description" content="[^"]*Investition und Finanzierung[^"]*München/.test(quizHtml)
    );
    // 2026-09-06: the quiz page server-renders a real h1 + subject intro so a
    // crawler / AdSense reviewer never lands on a bare "Loading..." shell.
    const quizText = quizHtml
        .replace(/<script[\s\S]*?<\/script>/g, "")
        .replace(/<[^>]+>/g, " ")
        .replace(/\s+/g, " ");
    check(
        "/quiz?subject=finance server-renders the subject h1 and intro",
        quizHtml.includes("<h1") &&
            quizHtml.includes("Investment &amp; Financial Management") &&
            quizText.includes("questions across")
    );
    check(
        "/quiz?subject=finance has >150 words of visible text",
        quizText.split(" ").length > 150,
        `${quizText.split(" ").length} words`
    );
    const quizBare = await (await fetch(`${BASE}/quiz`)).text();
    check("/quiz without a subject lists the subjects", quizBare.includes("Cost Accounting"));
    check("/quiz without a subject has a TUM-free description", !/<meta[^>]+TUM/.test(quizBare));
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
    check(
        "/library has its own canonical",
        libraryHtml.includes('rel="canonical" href="https://www.finance-bro.de/library"')
    );
    // Nico's TUM rule (2026-09-11): TUM in metadata only on /, /career and the
    // /quiz subject pages - never on /library or /products. The root Open Graph
    // block used to leak onto both.
    check("/library metadata never names TUM", !/<meta[^>]+TUM/.test(libraryHtml));
    // Per-page Open Graph blocks replace the root one wholesale in Next, so
    // the file-based /opengraph-image must be re-attached by pageMeta().
    check("/library keeps the og:image", /property="og:image"/.test(libraryHtml));
    // 2026-09-08 legal audit: no publisher cover art (generated CoverCard
    // instead) and the PartnerNet disclosure sentence visible on the page.
    check(
        "/library ships no cover images",
        !/<img[^>]+src="[^"]*covers\//.test(libraryHtml) && !libraryHtml.includes("openlibrary")
    );
    check(
        "/library states the Amazon Associates disclosure",
        libraryHtml.includes("As an Amazon Associate, this site earns from qualifying purchases")
    );
    // Real shop since 2026-08-28: Amazon links live, the dead placeholder is gone.
    check("/library links Amazon", libraryHtml.includes("amazon.de"));
    check("/library rates by ROI multiplier", libraryHtml.includes("ROI"));
    const products = await fetch(`${BASE}/products`);
    const productsHtml = await products.text();
    check("/products returns 200", products.status === 200, `got ${products.status}`);
    check("/products links Amazon", productsHtml.includes("amazon.de"));
    check(
        "/products has its own canonical",
        productsHtml.includes('rel="canonical" href="https://www.finance-bro.de/products"')
    );
    check("/products metadata never names TUM", !/<meta[^>]+TUM/.test(productsHtml));
    check("/products keeps the og:image", /property="og:image"/.test(productsHtml));
    check(
        "/products lost the dead placeholder links",
        !productsHtml.includes("affiliate-link.de")
    );
    check(
        "/products keeps the canon vest copy",
        productsHtml.includes("superiority complex")
    );
    check("/products sells the Birkin out", productsHtml.includes("SOLD OUT"));
    // 2026-09-06 legal pass: every affiliate button carries its own
    // advertising label (§ 5a UWG), and the ellesse link no longer wears the
    // Patagonia mark.
    check(
        "/products labels each affiliate link as advertising",
        productsHtml.includes("affiliate link (Amazon)") &&
            productsHtml.includes("earns from qualifying purchases")
    );
    check(
        "/products no longer sells a 'Patagonia' vest",
        !productsHtml.includes("Patagonia Vest")
    );
    check(
        "/library labels each affiliate link as advertising",
        libraryHtml.includes("affiliate link (Amazon)")
    );
    // The joke bundles (eight since 2026-09-06) and the desktop skyscraper rails.
    check(
        "/products shelves the founding bundles",
        productsHtml.includes("FinanceBro Starter Pack") &&
            productsHtml.includes("Undercover Broke Student") &&
            productsHtml.includes("BWL Marie")
    );
    check(
        "/products carries the desktop skyscraper rail",
        // striped placeholder while the slot id is empty, live AdSense unit once filled
        productsHtml.includes("wide skyscraper") ||
            productsHtml.includes('class="adsbygoogle')
    );
    // Images are committed Adobe Stock files since 2026-08-29 - no hotlinks.
    check(
        "/products serves local product images",
        productsHtml.includes("/products/birkin.jpg") &&
            !/<img[^>]+src="https?:\/\//.test(productsHtml)
    );
    // 2026-09-07: every product links one amazon.de listing (ASIN); since
    // 2026-09-08 (beer mortar dropped) no search link is left. The four
    // Commons photos are CC BY-SA and need their credit lines in the footer.
    check(
        "/products links specific Amazon listings",
        new Set(productsHtml.match(/amazon\.de\/dp\/[A-Z0-9]+/g)).size >= 35 &&
            !/amazon\.de\/s\?k=/.test(productsHtml)
    );
    check(
        "/products credits the CC BY-SA photos",
        productsHtml.includes("CC BY-SA") &&
            ["Wen-Cheng Liu", "Klaas van Buiten", "TaurusEmerald", "Pundit"].every(
                (name) => productsHtml.includes(name)
            )
    );
    // 2026-09-08 audit: share-alike needs the deed link and the statement that
    // the edited image carries the same licence; the Birkin stays 2.0.
    check(
        "/products CC BY-SA credits link the deeds and state share-alike",
        productsHtml.includes("creativecommons.org/licenses/by-sa/4.0/") &&
            productsHtml.includes("creativecommons.org/licenses/by-sa/2.0/") &&
            (productsHtml.match(/licensed under CC BY-SA \d\.\d as well/g) ?? []).length >= 4
    );
    // 2026-09-08: the exam-legal calculator (Casio FX-85MS per the TUM
    // finance chair's policy) and the pattern behind, not over, the photo.
    check(
        "/products links the exam-legal Casio FX-85MS",
        productsHtml.includes("amazon.de/dp/B000120516") &&
            productsHtml.includes("FX-85MS")
    );
    check(
        "/products keeps the money pattern behind the photo",
        !productsHtml.includes("mix-blend-mode")
    );
    check(
        "/products puts the glasses and the sleep mask first",
        productsHtml.indexOf("Blue-Light Glasses") <
            productsHtml.indexOf("Mechanical Keyboard, Clicky") &&
            productsHtml.indexOf("Post-Exam Coma Mask") <
                productsHtml.indexOf("Energy Drinks, 24-Pack")
    );
    // Removed per Nico 2026-08-29 - keep them gone.
    // After-Exam Party Kit (2026-09-06) and the croc Birkin.
    check(
        "/products shelves the After-Exam Party Kit",
        productsHtml.includes("After-Exam Party Kit") &&
            productsHtml.includes("/products/aperol-tower.jpg") &&
            productsHtml.includes("Beer Pong Set") &&
            !productsHtml.includes("Beer Mortar")
    );
    // 2026-09-12: the secret "?" position (Rickroll, worker-side counter -
    // SSR shows the fallback copy) and the subscription desk with the
    // Amazon bounties, Prime Student first and tagged.
    check(
        "/products hides the Insider Position behind a question mark",
        productsHtml.includes("The Insider Position") &&
            productsHtml.includes("youtube.com/watch?v=dQw4w9WgXcQ") &&
            productsHtml.includes("Not one of them has forgotten it")
    );
    check(
        "/products runs the Burn Rate Desk with the student Prime deal",
        productsHtml.includes("The Burn Rate Desk") &&
            productsHtml.indexOf("Prime Student") < productsHtml.indexOf("Audible") &&
            productsHtml.includes("6 months free") &&
            /amazon\.de\/amazonprime\?[^"]*tag=financebro0a-21/.test(productsHtml) &&
            /amazon\.de\/hz\/audible\/mlp\?tag=/.test(productsHtml) &&
            /amazon\.de\/music\/unlimited\?tag=/.test(productsHtml) &&
            /amazon\.de\/kindle-dbs\/hz\/subscribe\/ku\?tag=/.test(productsHtml)
    );
    check(
        "/products dropped the ketchup and the cigarettes",
        !productsHtml.includes("Ketchup") &&
            !productsHtml.includes("Cigarettes")
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

    // --- semester leaderboard (2026-09-02) ---------------------------------
    // Optional extra (hard rule 1). `npm run check` builds with a dummy
    // NEXT_PUBLIC_MP_URL (`build:check`) so the enabled branch - the one
    // production runs - is what gets smoked: tabs, your-desk card, net-worth
    // card, all server-rendered before any worker call; the worker itself is
    // unreachable, so the client lands in the error states, never a blank page.
    // A build without the URL takes the "desk not staffed" branch instead.
    const board = await fetch(`${BASE}/leaderboard`);
    const boardHtml = await board.text();
    check("/leaderboard returns 200", board.status === 200, `got ${board.status}`);
    check(
        "/leaderboard renders its own state without a worker",
        boardHtml.includes("Leaderboard 🏆") &&
            (boardHtml.includes("desk is not staffed") || boardHtml.includes("Overall"))
    );
    if (boardHtml.includes("Overall")) {
        check(
            "/leaderboard (worker configured) server-renders the desk card and the rich list",
            boardHtml.includes("Your desk") && boardHtml.includes("Net worth")
        );
    }
    check("/ links the Leaderboard", homeHtml.includes("Leaderboard 🏆"));
    // 2026-09-08: the corporate ladder renders below the board from local
    // state alone (hard rule 1) - every rung, bottom to top, SSR'd as Pupil.
    check(
        "/leaderboard shows the corporate ladder without a worker",
        boardHtml.includes("Corporate ladder") &&
            boardHtml.includes("Pupil") &&
            boardHtml.includes("FinanceBro #N") &&
            boardHtml.includes("The Richest Person") &&
            boardHtml.includes("from 1,000,000 💸")
    );
    check("/leaderboard ships no em dashes", !boardHtml.includes(EM_DASH));
    // 2026-09-08: one statement per rung - Pupil's pocket-money statement on
    // first paint, and the running gag that closes every statement.
    check(
        "/ shows the Pupil statement",
        homeHtml.includes("Gummy bears") && homeHtml.includes("0DTE SPY calls")
    );

    // --- multiplayer (optional extra, hard rule 1) -------------------------
    const mp = await fetch(`${BASE}/multiplayer`);
    const mpHtml = await mp.text();
    check("/multiplayer returns 200", mp.status === 200, `got ${mp.status}`);
    check("/multiplayer ships no em dashes", !mpHtml.includes(EM_DASH));
    // Art. 13 notice at the point of entry (NameField, shared with /leaderboard).
    check(
        "/multiplayer name field says the name is public and links the rules",
        mpHtml.includes("Shown publicly on the leaderboard") && mpHtml.includes('href="/terms"')
    );

    // The unlinked Language page was deleted 2026-09-08 - it must stay gone.
    const language = await fetch(`${BASE}/language`);
    check("/language is gone", language.status === 404, `got ${language.status}`);

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
        "/privacy carries the AdSense section (ads are live in code)",
        privacyHtml.includes("Google AdSense") && privacyHtml.includes("FCCDCF")
    );
    // Google's verification crawler wants the literal tag in the raw <head>,
    // not a client-injected script (that was the "code not found" failure).
    // `defer` instead of `async` since 2026-09-08 so the consent bootstrap
    // is guaranteed to run first (layout.tsx explains).
    check(
        "/ carries the AdSense tag in the HTML head",
        /<head>[\s\S]*<script defer="" src="https:\/\/pagead2\.googlesyndication\.com\/pagead\/js\/adsbygoogle\.js\?client=ca-pub-6951760347839431" crossorigin="anonymous">/.test(
            homeHtml
        )
    );
    // 2026-09-08 legal audit: nothing ad-related before a consent decision.
    // The consent bootstrap (Consent Mode denied + pauseAdRequests) must sit
    // in the head BEFORE adsbygoogle.js, on every page.
    check(
        "/ pauses AdSense and denies Consent Mode before the tag loads",
        /pauseAdRequests=1[\s\S]*adsbygoogle\.js\?client=/.test(homeHtml) &&
            homeHtml.includes("ad_storage:'denied'") &&
            homeHtml.indexOf("pauseAdRequests=1") < homeHtml.indexOf("adsbygoogle.js?client=")
    );
    // DSA (2026-09-08): terms page with name rules, the Art. 16 report
    // mailto and the Arts. 11/12 point of contact, linked from every footer
    // and listed in the sitemap.
    const terms = await fetch(`${BASE}/terms`);
    const termsHtml = await terms.text();
    check("/terms returns 200", terms.status === 200, `got ${terms.status}`);
    check(
        "/terms carries the DSA contact and the report-a-name mailto",
        termsHtml.includes("nicolas.dumpe@gmx.de") &&
            termsHtml.includes("mailto:nicolas.dumpe@gmx.de?subject=Report") &&
            termsHtml.includes("Name rules") &&
            termsHtml.includes("Point of contact")
    );
    check("/terms ships no em dashes", !termsHtml.includes(EM_DASH));
    // --- static course pages + city page (scenario C, 2026-09-11) ----------
    for (const [slug, h1] of [
        ["finance", "Investment &amp; Financial Management"],
        ["econ-1", "Economics 1"],
        ["econ-2", "Economics 2"],
        ["financial-accounting", "Financial Accounting"],
        ["cost-accounting", "Cost Accounting"],
        ["entrepreneurship", "Entrepreneurship"],
        ["marketing", "Marketing"],
    ]) {
        const r = await fetch(`${BASE}/${slug}`);
        const html = await r.text();
        check(`/${slug} returns 200`, r.status === 200, `got ${r.status}`);
        check(`/${slug} renders the course h1`, new RegExp(`<h1[^>]*>[^<]*${h1}`).test(html.replace(/<!-- -->/g, "")));
        check(
            `/${slug} has its own canonical`,
            html.includes(`rel="canonical" href="https://www.finance-bro.de/${slug}"`)
        );
        check(`/${slug} names München in the description`, /<meta name="description" content="[^"]*München/.test(html));
        const disclaimerAt = html.indexOf("not affiliated");
        const h1At = html.indexOf("<h1");
        check(`/${slug} opens with the not-affiliated line`, disclaimerAt > -1 && h1At > -1 && disclaimerAt < h1At);
        check(`/${slug} ships LearningResource structured data`, html.includes('"LearningResource"'));
        check(`/${slug} ships no em dashes`, !html.includes(EM_DASH));
    }
    const finance = await (await fetch(`${BASE}/finance`)).text();
    check(
        "/finance shows the live question count and topics",
        /\d+ questions<\/strong> across/.test(finance.replace(/<!-- -->/g, "")) && finance.includes("Capital Budgeting")
    );
    check("/finance links the run setup", finance.includes('href="/career?subject=finance"'));
    const city = await fetch(`${BASE}/bwl-muenchen`);
    const cityHtml = await city.text();
    check("/bwl-muenchen returns 200", city.status === 200, `got ${city.status}`);
    const cityDisclaimerAt = cityHtml.indexOf("not affiliated");
    check("/bwl-muenchen opens with the not-affiliated line", cityDisclaimerAt > -1 && cityDisclaimerAt < cityHtml.indexOf("<h1"));
    for (const place of ["Garching", "Arcisstraße", "Straubing", "Heilbronn", "Ottobrunn"]) {
        check(`/bwl-muenchen names ${place}`, cityHtml.includes(place));
    }
    check("/bwl-muenchen metadata never names TUM", !/<meta[^>]+TUM/.test(cityHtml));
    check("/bwl-muenchen links every course page", cityHtml.includes('href="/econ-1"') && cityHtml.includes('href="/marketing"'));
    check("/bwl-muenchen ships no em dashes", !cityHtml.includes(EM_DASH));
    const missing = await fetch(`${BASE}/definitely-not-a-course`);
    check("unknown root slug is a 404, not a rendered course page", missing.status === 404, `got ${missing.status}`);
    // the first root-level dynamic segment must not shadow public/
    const adsTxt = await fetch(`${BASE}/ads.txt`);
    check("/ads.txt still comes from public/", adsTxt.status === 200, `got ${adsTxt.status}`);
    check("/ footer links the course pages and BWL München", homeHtml.includes('href="/cost-accounting"') && homeHtml.includes('href="/bwl-muenchen"'));

    // TUM rule (2026-09-11): only /, /career, the /quiz subject pages and the
    // static course pages may name TUM in their metadata.
    for (const [route, html] of [
        ["/leaderboard", boardHtml],
        ["/multiplayer", mpHtml],
        ["/impressum", impressumHtml],
        ["/privacy", privacyHtml],
        ["/terms", termsHtml],
    ]) {
        check(`${route} metadata never names TUM`, !/<meta[^>]+TUM/.test(html));
    }
    check("/ footer links the terms page", homeHtml.includes('href="/terms"'));
    check(
        "/privacy links the terms and names Art. 6 (1) (f) for the leaderboard",
        privacyHtml.includes('href="/terms"') && privacyHtml.includes("legitimate interest in running the game")
    );
    check(
        "/privacy names Amazon PartnerNet and the under-16 rule",
        privacyHtml.includes("PartnerNet") && privacyHtml.includes("under 16")
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

    // --- provenance stays off the wire ------------------------------------
    // 2026-09-08: the Turbopack loader in next.config.ts strips `source` from
    // the question banks. Every bank's source strings start with "TUM " and
    // name an exam or problem set; none of that may survive in any built
    // chunk (client or server) - and the questions themselves must.
    const chunkFiles = [];
    const walk = (dir) => {
        for (const entry of readdirSync(dir)) {
            const full = join(dir, entry);
            if (statSync(full).isDirectory()) walk(full);
            else if (/\.(js|mjs|cjs)$/.test(entry)) chunkFiles.push(full);
        }
    };
    for (const dir of [".next/static", ".next/server"]) if (existsSync(dir)) walk(dir);
    const leakingChunks = chunkFiles.filter((f) =>
        /source:"TUM |"TUM [^"]*(Exam|Problem Set|eTest|catalogue)/.test(readFileSync(f, "utf8"))
    );
    check(
        "built chunks carry no question `source` provenance",
        chunkFiles.length > 0 && leakingChunks.length === 0,
        leakingChunks.slice(0, 3).join(", ")
    );
    check(
        "built chunks still carry the question banks",
        chunkFiles.some((f) => readFileSync(f, "utf8").includes("fin-bond-modified-duration"))
    );

    // --- SEO surface -----------------------------------------------------
    const robots = await fetch(`${BASE}/robots.txt`);
    const robotsTxt = await robots.text();
    check("/robots.txt returns 200", robots.status === 200);
    check("/robots.txt points at the sitemap", robotsTxt.includes("sitemap.xml"));

    const sitemap = await fetch(`${BASE}/sitemap.xml`);
    const sitemapXml = await sitemap.text();
    check("/sitemap.xml returns 200", sitemap.status === 200);
    check("/sitemap.xml lists the terms page", sitemapXml.includes("/terms"));
    check(
        "/sitemap.xml lists every subject",
        ["finance", "econ1", "econ2", "financial_accounting", "cost_accounting", "entrepreneurship", "marketing"]
            .every((s) => sitemapXml.includes(`subject=${s}`))
    );
    check(
        "/sitemap.xml lists the course pages and BWL München (scenario C)",
        sitemapXml.includes("finance-bro.de/bwl-muenchen") &&
            ["finance", "econ-1", "econ-2", "financial-accounting", "cost-accounting", "entrepreneurship", "marketing"]
                .every((slug) => sitemapXml.includes(`finance-bro.de/${slug}</loc>`))
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
