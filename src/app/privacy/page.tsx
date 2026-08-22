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
 * EU cloud) runs ONLY after consent via the cookie banner, that localStorage
 * data never leaves the browser, and that no ad network is wired. If any of
 * that changes, change this page in the same commit.
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
                    Last updated: 21 August 2026
                </p>
            </header>

            <Section title="The short version">
                <p>
                    No account, no newsletter, no forms. Your quiz scores stay in your
                    browser. Analytics only runs if you explicitly say yes to the cookie
                    banner - decline it and nothing is tracked. No ad network is
                    currently connected.
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
                    server logs, which are deleted after a short period. Legal basis:
                    our legitimate interest in delivering and securing the site
                    (Art. 6 (1) (f) GDPR). A data processing agreement per Art. 28 GDPR
                    is in place with Vercel; transfers to the USA are safeguarded by EU
                    standard contractual clauses (Art. 46 GDPR).
                </p>
            </Section>

            <Section title="3. Local storage on your device">
                <p>
                    Your scores, rank, current quiz run and your cookie-banner choice
                    are stored in your browser&apos;s localStorage. This data never
                    leaves your device and we cannot read it - it exists so the site
                    works (progress survives a reload). Storing it is strictly
                    necessary and requires no consent (§ 25 (2) TDDDG). Clearing your
                    browser data removes it.
                </p>
            </Section>

            <Section title="4. Analytics (PostHog) - only with your consent">
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
            </Section>

            <Section title="5. Advertising and affiliate links">
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

            <Section title="6. Contact by e-mail">
                <p>
                    If you write to us, the e-mail and its contents are processed to
                    answer your inquiry (Art. 6 (1) (b) and (f) GDPR) and deleted once
                    the matter is closed, unless retention duties apply.
                </p>
            </Section>

            <Section title="7. Your rights">
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

            <Section title="8. Changes">
                <p>
                    This policy is updated whenever the site&apos;s data processing
                    changes (for example when analytics goes live or an ad network is
                    connected). The date at the top tells you the last revision.
                </p>
            </Section>
        </div>
    );
}
