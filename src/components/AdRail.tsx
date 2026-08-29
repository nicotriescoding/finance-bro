import AdSlot from "@/components/AdSlot";

/**
 * The desktop ad rail (2026-08-29, per Nico): every page except `/`, the
 * ad-free `/library` and `/career` carries ads alongside the whole page on
 * desktop - the 160 × 600 IAB wide skyscraper plus a 200 × 200 square,
 * sticky so the rail rides along however far the page scrolls.
 *
 * Format note: the 160 × 600 wide skyscraper is a standard unit every network
 * fills, but the top-earning sidebar unit is the 300 × 600 half page. If ad
 * revenue ever matters, widen this rail to 300px instead of adding new slots -
 * the sticky layout already reserves the right spot.
 */
export default function AdRail({ note }: { note?: string }) {
    return (
        <aside className="sticky top-20 hidden w-[200px] flex-none flex-col gap-3 self-start xl:flex">
            <AdSlot variant="skyscraper" note={note} />
            <AdSlot variant="square" />
        </aside>
    );
}
