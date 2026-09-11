/**
 * The above-the-fold disclaimer for the course and city pages (Nico's TUM
 * rule 5, 2026-09-11): every page that names TUM says at the top that it is
 * not TUM's. Small, muted, one line - present, not loud.
 */
export default function NotAffiliated() {
    return (
        <p className="caps-label text-[9px] tracking-[.14em] text-muted-light">
            Independent student project · not affiliated with or endorsed by the Technical
            University of Munich (TUM)
        </p>
    );
}
