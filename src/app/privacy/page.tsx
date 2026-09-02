import type { Metadata } from "next";
import CookieSettingsLink from "@/components/consent/CookieSettingsLink";

export const metadata: Metadata = {
    title: "Privacy Policy",
    description:
        "Privacy policy (Datenschutzerklärung) for finance-bro.de - what data the site touches, and the analytics that only ever run with your consent.",
};

/**
 * Datenschutzerklärung (Art. 13 GDPR), in English like the rest of the site.
 * Keep this file in sync with reality: it promises that analytics (PostHog,
 * EU cloud) runs ONLY after consent via the cookie banner AND is deleted or
 * anonymized after at most 24 months (configure PostHog to match before
 * go-live), that localStorage data is never transmitted to us, that the
 * multiplayer/scoreboard worker (Cloudflare) only processes the display
 * name, game state and the per-posting scoreboard reports described in
 * section 4 (old-semester scoreboard rows must actually be deleted within
 * 12 months), and that no ad network is wired. If any of that changes,
 * change this page in the same commit.
 */

function Section({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <section className="rounded-[14px] border border-hairline bg-surface p-5 shadow-[0_1px_2px_rgba(15,33,55,.05)]">
            <h2 className="font-extrabold">{title}</h2>
            <div className="mt-1.5 flex flex-col gap-2.5 text-sm leading-relaxed text-muted">
                {children}
            </div>
        </section>
    );
}

export default function PrivacyPage() {
    return (
        <div className="mx-auto flex max-w-3xl flex-col gap-5 px-4 py-8">
            <header>
                <h1 className="text-2xl font-extrabold tracking-[-0.02em]">
                    Privacy Policy · Datenschutzerklärung
                </h1>
                <p className="mt-1.5 text-sm leading-relaxed text-muted">
                    Last updated: 1 September 2026
                </p>
            </header>

            <Section title="The short version">
                <p>
                    No account, no newsletter. Your quiz balance stays in your
                    browser; the semester leaderboard only receives a random player
                    ID plus the BroDollars you earn. Multiplayer works with a
                    self-chosen display name - no registration. Analytics only runs
                    if you explicitly say yes to the
                    cookie banner - decline it and nothing is tracked. No ad network
                    is currently connected.
                </p>
            </Section>

            <Section title="1. Controller">
                <p>
                    Responsible for data processing on this site (Art. 4 (7) GDPR):
                </p>
                <p>
                    Nicolas Dumpe
                    <br />
                    Kiem-Pauli-Weg 41
                    <br />
                    85579 Neubiberg, Germany
                    <br />
                    E-mail: nicolas.dumpe@gmx.de
                </p>
            </Section>

            <Section title="2. Hosting and server logs">
                <p>
                    The site is hosted by Vercel Inc. (USA). When you visit, Vercel
                    technically necessarily processes connection data - IP address,
                    date and time, requested URL, browser and operating system - in
                    server logs. Logs are kept only as long as needed to deliver,
                    secure and debug the site and are then deleted automatically.
                    Legal basis: our legitimate interest in delivering and securing
                    the site (Art. 6 (1) (f) GDPR). A data processing agreement per
                    Art. 28 GDPR is in place with Vercel. Vercel Inc. is certified
                    under the EU-US Data Privacy Framework, so transfers to the USA
                    rest on the EU Commission&apos;s adequacy decision (Art. 45 GDPR),
                    with EU standard contractual clauses (Art. 46 GDPR) as a
                    fallback.
                </p>
            </Section>

            <Section title="3. Local storage on your device">
                <p>
                    Your scores, rank, current quiz run and your cookie-banner choice
                    are stored in your browser&apos;s localStorage. The site&apos;s
                    code reads this data locally in your browser on each visit (for
                    example to show your balance and rank), but it is never
                    transmitted to our servers - it exists so the site works
                    (progress survives a reload). Storing and reading it is strictly
                    necessary and requires no consent (§ 25 (2) TDDDG). Clearing your
                    browser data removes it.
                </p>
            </Section>

            <Section title="4. Multiplayer and semester leaderboard (Cloudflare)">
                <p>
                    The optional multiplayer mode and the semester leaderboard run on
                    infrastructure provided by Cloudflare, Inc. (USA). When you create or join a room, the
                    following is processed on Cloudflare&apos;s servers: the display
                    name you enter (free choice - it does not have to be your real
                    name), a randomly generated player ID stored in your browser,
                    your answers and scores during the game, and the connection data
                    (including IP address) technically required to maintain the
                    realtime connection. Room state is held only for the duration of
                    a game and discarded when the room closes.
                </p>
                <p>
                    The semester leaderboard ranks players by the BroDollars they
                    earn. Each time you solve a quiz question correctly, and at the
                    end of every multiplayer game, the following is sent to
                    Cloudflare&apos;s servers: your player ID, your display name (or
                    an automatically generated placeholder such as &quot;Excel
                    Intern #4127&quot; until you pick one), the question and answer
                    involved (so the result can be re-checked) and the BroDollars
                    earned, per subject. Leaderboard entries are kept for the
                    semester they belong to and deleted at the latest 12 months after
                    that semester ends.
                </p>
                <p>
                    Legal basis: performance of the service you request by starting a
                    game (Art. 6 (1) (b) GDPR). A data processing agreement per
                    Art. 28 GDPR is in place with Cloudflare; Cloudflare, Inc. is
                    certified under the EU-US Data Privacy Framework, so transfers to
                    the USA rest on the EU Commission&apos;s adequacy decision
                    (Art. 45 GDPR). If the leaderboard service is unreachable, the
                    site keeps working - the result simply goes unrecorded.
                </p>
            </Section>

            <Section title="5. Analytics (PostHog) - only with your consent">
                <p>
                    We use PostHog to understand which pages and questions get used -
                    but <strong>only if you accept the cookie banner</strong>. Until
                    you do, no analytics script loads, no cookie is set and no data is
                    collected. If you decline, the site works exactly the same.
                </p>
                <p>
                    With your consent, PostHog stores identifiers (cookies /
                    localStorage) and collects usage events: pages viewed, interactions,
                    approximate device and browser information. We use PostHog&apos;s EU
                    cloud, so analytics data is stored on servers in Frankfurt, Germany
                    (provider: PostHog Inc., USA, under a data processing agreement with
                    EU standard contractual clauses).
                </p>
                <p>
                    Legal basis: your consent (Art. 6 (1) (a) GDPR, § 25 (1) TDDDG). You
                    can withdraw it at any time with effect for the future via{" "}
                    <CookieSettingsLink /> - withdrawal stops all capturing and resets
                    the stored identifiers.
                </p>
                <p>
                    Retention: analytics data is deleted or irreversibly anonymized at
                    the latest 24 months after collection.
                </p>
            </Section>

            <Section title="6. Advertising and affiliate links">
                <p>
                    Ad placements on this site are currently decorative placeholders -
                    no ad network is connected and no ad-related data is processed. If
                    that changes, this policy and the consent banner will be updated
                    first.
                </p>
                <p>
                    The Library page will contain affiliate links, labelled as
                    advertising. Clicking one takes you to the merchant (for example
                    Amazon), which then processes your data under its own privacy
                    policy; nothing is transmitted by us beforehand.
                </p>
            </Section>

            <Section title="7. Contact by e-mail">
                <p>
                    If you write to us, the e-mail and its contents are processed to
                    answer your inquiry (Art. 6 (1) (b) and (f) GDPR) and deleted once
                    the matter is closed, unless retention duties apply.
                </p>
            </Section>

            <Section title="8. Your rights">
                <p>
                    Under the GDPR you have the right to access (Art. 15),
                    rectification (Art. 16), erasure (Art. 17), restriction of
                    processing (Art. 18), data portability (Art. 20) and objection to
                    processing based on legitimate interest (Art. 21). Consent can be
                    withdrawn at any time (Art. 7 (3)). To exercise any of these,
                    e-mail the address in section 1.
                </p>
                <p>
                    You also have the right to lodge a complaint with a supervisory
                    authority (Art. 77 GDPR) - for this site that is the Bavarian Data
                    Protection Authority (BayLDA, Ansbach), though any EU supervisory
                    authority will forward your complaint.
                </p>
            </Section>

            <Section title="9. Changes">
                <p>
                    This policy is updated whenever the site&apos;s data processing
                    changes (for example when analytics goes live or an ad network is
                    connected). The date at the top tells you the last revision.
                </p>
            </Section>
        </div>
    );
}
