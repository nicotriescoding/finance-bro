import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Impressum",
    description: "Legal notice (Impressum) for finance-bro.de pursuant to § 5 DDG.",
};

/**
 * Legal notice for a privately run site without a legal entity. Required
 * because the site carries ad slots and (planned) affiliate links, which makes
 * it "geschäftsmäßig" under § 5 DDG - the purely-private exemption does not
 * apply. English on purpose: the whole site is English and the DDG does not
 * prescribe a language.
 *
 * Deliberately absent: the EU ODR platform link (ec.europa.eu/odr). The
 * platform was shut down on 2025-07-20 and the old mandatory reference must
 * no longer be used - the smoke test asserts it stays gone.
 *
 * Contact email is temporary (BACKLOG: swap to a finance-bro.de address).
 */
export default function ImpressumPage() {
    return (
        <div className="mx-auto flex max-w-3xl flex-col gap-5 px-4 py-8">
            <header>
                <h1 className="text-2xl font-extrabold tracking-[-0.02em]">
                    Impressum · Legal Notice
                </h1>
                <p className="mt-1.5 text-sm leading-relaxed text-muted">
                    Information pursuant to § 5 DDG (German Digital Services Act).
                </p>
            </header>

            <section className="rounded-[14px] border border-hairline bg-surface p-5 shadow-[0_1px_2px_rgba(15,33,55,.05)]">
                <h2 className="caps-label text-[10px] text-muted-light">Site operator</h2>
                <p className="mt-2 leading-relaxed">
                    Nicolas Dumpe
                    <br />
                    Kiem-Pauli-Weg 41
                    <br />
                    85579 Neubiberg
                    <br />
                    Germany
                </p>
                <h2 className="caps-label mt-5 text-[10px] text-muted-light">Contact</h2>
                <p className="mt-2 leading-relaxed">
                    E-mail: nicolas.dumpe@gmx.de
                </p>
                <h2 className="caps-label mt-5 text-[10px] text-muted-light">
                    Responsible for content (§ 18 (2) MStV)
                </h2>
                <p className="mt-2 leading-relaxed">Nicolas Dumpe, address as above.</p>
            </section>

            <section className="rounded-[14px] border border-hairline bg-surface p-5 shadow-[0_1px_2px_rgba(15,33,55,.05)]">
                <h2 className="font-extrabold">Legal form</h2>
                <p className="mt-1.5 text-sm leading-relaxed text-muted">
                    finance-bro.de is a privately operated project. It is not run by a
                    registered company; there is therefore no commercial register entry
                    and no VAT identification number.
                </p>
                <h2 className="mt-5 font-extrabold">Advertising on this site</h2>
                <p className="mt-1.5 text-sm leading-relaxed text-muted">
                    Pages may contain clearly labelled ad placements and affiliate links
                    (marked &quot;AD&quot; or &quot;advertising&quot;). If you buy
                    something through an affiliate link, the site may earn a commission;
                    your price does not change.
                </p>
                <h2 className="mt-5 font-extrabold">Consumer dispute resolution</h2>
                <p className="mt-1.5 text-sm leading-relaxed text-muted">
                    The EU online dispute resolution (ODR) platform was discontinued on
                    20 July 2025. We are neither obliged nor willing to participate in
                    dispute resolution proceedings before a consumer arbitration board
                    (§ 36 VSBG).
                </p>
                <h2 className="mt-5 font-extrabold">Liability for content and links</h2>
                <p className="mt-1.5 text-sm leading-relaxed text-muted">
                    The content of this site is created with care but comes without any
                    guarantee of accuracy, completeness or timeliness - it is study
                    material, not professional (and certainly not financial) advice.
                    External links lead to third-party sites whose content is beyond our
                    control; at the time of linking no legal violations were apparent.
                    If you spot a problem, write to the address above and it will be
                    fixed.
                </p>
            </section>
        </div>
    );
}
