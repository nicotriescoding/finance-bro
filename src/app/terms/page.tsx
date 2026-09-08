import type { Metadata } from "next";
import Link from "next/link";
import { CONTACT_EMAIL, REPORT_MAILTO } from "@/lib/legal";

export const metadata: Metadata = {
    title: "Terms · Name rules",
    description:
        "Terms of use for finance-bro.de: what the service is, the rules for display names on the leaderboard and in duels, how to report a name, and the DSA point of contact.",
};

/**
 * Terms of use + Digital Services Act (DSA) page (2026-09-08 legal audit).
 *
 * Why it exists: the semester leaderboard and the duels desk store and show
 * display names that visitors type themselves. That makes finance-bro.de a
 * hosting service under Art. 3 (g) DSA, and a hosting provider - however
 * small - owes: a single point of contact for authorities and for users
 * (Arts. 11, 12), terms that state the content restrictions and how
 * moderation works (Art. 14), and a notice-and-action mechanism (Art. 16).
 * The micro-enterprise exemption (Art. 19) only lifts Arts. 20-24, not
 * these. The "report a name" mailto below carries the Art. 16 (2) elements
 * (where, what, why, who, good-faith statement) as a prefilled body.
 *
 * Names are the ONLY user content on the site (no accounts, no comments, no
 * uploads), so the rules stay short. Moderation = the automatic word filter
 * in `sanitizeName` (`src/lib/multiplayer/protocol.ts`, also run by the
 * worker) plus manual replacement after a report. English on purpose, like
 * the rest of the site; the contact handles German too.
 */
export default function TermsPage() {
    return (
        <div className="mx-auto flex max-w-3xl flex-col gap-5 px-4 py-8">
            <header>
                <h1 className="text-2xl font-extrabold tracking-[-0.02em]">
                    Terms of use · Name rules
                </h1>
                <p className="mt-1.5 text-sm leading-relaxed text-muted">
                    The short version: the site is free, you need no account, and the only thing you
                    can publish here is the name on your desk. Be decent with it. Last updated 8
                    September 2026.
                </p>
            </header>

            <section className="rounded-[14px] border border-hairline bg-surface p-5 shadow-[0_1px_2px_rgba(15,33,55,.05)]">
                <h2 className="font-extrabold">1. What this is</h2>
                <p className="mt-1.5 text-sm leading-relaxed text-muted">
                    finance-bro.de is a free, private exam trainer for business administration, run
                    by the person named in the{" "}
                    <Link
                        href="/impressum"
                        className="font-bold text-brand underline underline-offset-2"
                    >
                        Impressum
                    </Link>
                    . Questions, BroDollars, ranks and titles are a game. Nothing here is financial,
                    legal or academic advice, and nothing here is affiliated with the Technical
                    University of Munich. Use at your own risk; the site may change or go offline at
                    any time.
                </p>

                <h2 className="mt-5 font-extrabold">2. Your content: the display name</h2>
                <p className="mt-1.5 text-sm leading-relaxed text-muted">
                    Two optional features show text you typed to other visitors: the semester
                    leaderboard and the duels desk (multiplayer). In both, the only user content is
                    the display name you choose (up to 20 characters). It is shown publicly next to
                    your score. You do not have to enter one - an automatic placeholder such as
                    &quot;Excel Intern #4127&quot; is used until you do. How names and scores are
                    processed is explained in the{" "}
                    <Link
                        href="/privacy"
                        className="font-bold text-brand underline underline-offset-2"
                    >
                        privacy policy
                    </Link>
                    , section 4.
                </p>

                <h2 className="mt-5 font-extrabold">3. Name rules (content restrictions)</h2>
                <p className="mt-1.5 text-sm leading-relaxed text-muted">
                    A display name must not:
                </p>
                <ul className="mt-1.5 list-disc space-y-1 pl-5 text-sm leading-relaxed text-muted">
                    <li>
                        be the real name of another person, or otherwise impersonate a real person,
                        a company, a university or its staff;
                    </li>
                    <li>
                        contain insults, slurs, threats, hate speech, sexual or violent content, or
                        anything else that is illegal in Germany or the EU;
                    </li>
                    <li>
                        contain contact details (phone numbers, e-mail addresses, social-media
                        handles), URLs, advertising or spam;
                    </li>
                    <li>
                        infringe third-party rights, for example trademarks used to suggest an
                        endorsement.
                    </li>
                </ul>
                <p className="mt-1.5 text-sm leading-relaxed text-muted">
                    Your own first name, a nickname or a joke title are fine. If you are under 16,
                    please stick to a nickname.
                </p>

                <h2 className="mt-5 font-extrabold">4. How moderation works</h2>
                <p className="mt-1.5 text-sm leading-relaxed text-muted">
                    Names pass an automatic word filter when you save them (the filter replaces a
                    blocked name with the placeholder; no human reads submissions, and nothing else
                    is checked automatically). Names that break the rules and slip through are
                    replaced with the placeholder by hand as soon as we become aware of them -
                    through a report (see 5) or on our own initiative. The score itself stays; only
                    the name changes. Because there are no accounts, there is no suspension or ban;
                    repeated abuse from one browser can be excluded from the leaderboard. If your
                    name was replaced and you think that was wrong, write to the contact in section
                    6 - you will get a reasoned answer.
                </p>

                <h2 className="mt-5 font-extrabold">5. Report a name (notice and action)</h2>
                <p className="mt-1.5 text-sm leading-relaxed text-muted">
                    Anyone can report a display name they consider illegal or against these rules.
                    Send an e-mail to{" "}
                    <a
                        href={REPORT_MAILTO}
                        className="font-bold text-brand underline underline-offset-2"
                    >
                        {CONTACT_EMAIL}
                    </a>{" "}
                    (the link prefills the form) stating where you saw the name, the name itself,
                    why you consider it illegal or against the rules, your name and e-mail address,
                    and a statement that your report is made in good faith. You will receive a
                    confirmation of receipt, a decision without undue delay (usually within a few
                    days), and the reasons for it. The person whose name was changed does not learn
                    who reported it.
                </p>
                <p className="mt-2">
                    <a
                        href={REPORT_MAILTO}
                        className="inline-flex items-center gap-2 rounded-[9px] border border-brand-border bg-brand-input px-3 py-1.5 text-sm font-extrabold text-brand transition hover:bg-brand-tint"
                    >
                        🚩 Report a name
                    </a>
                </p>

                <h2 className="mt-5 font-extrabold">6. Point of contact (Arts. 11, 12 DSA)</h2>
                <p className="mt-1.5 text-sm leading-relaxed text-muted">
                    Single point of contact for authorities of the EU member states, the European
                    Commission, the European Board for Digital Services, and for users of the
                    service:
                </p>
                <p className="mt-1.5 text-sm leading-relaxed">
                    Nicolas Dumpe · Kiem-Pauli-Weg 41 · 85579 Neubiberg · Germany
                    <br />
                    E-mail:{" "}
                    <a
                        href={`mailto:${CONTACT_EMAIL}`}
                        className="font-bold text-brand underline underline-offset-2"
                    >
                        {CONTACT_EMAIL}
                    </a>
                    <br />
                    Languages: German, English.
                </p>
                <p className="mt-1.5 text-sm leading-relaxed text-muted">
                    finance-bro.de is a micro-enterprise within the meaning of Art. 19 DSA; the
                    obligations of Arts. 20 to 24 DSA (internal complaint system, out-of-court
                    dispute settlement, trusted flaggers, transparency reports) therefore do not
                    apply. Sections 4 and 5 are provided anyway.
                </p>

                <h2 className="mt-5 font-extrabold">7. The rest</h2>
                <p className="mt-1.5 text-sm leading-relaxed text-muted">
                    The site&apos;s own texts, questions and design are protected; you may use them
                    for your own studying, not republish them. German law applies. If one clause of
                    these terms is invalid, the others stand. These terms can change; the date at
                    the top tells you when they last did.
                </p>
            </section>
        </div>
    );
}
