import type { Unit } from "./types";

/**
 * Tolerance per unit: [relative, absolute floor].
 * A student who rounds intermediate steps must still be marked correct - this
 * was the single biggest source of "wrong" answers in the old version, which
 * compared `toFixed(2)` strings for exact equality.
 */
const TOLERANCE: Record<Unit, [number, number]> = {
    EUR: [0.005, 0.02],
    percent: [0.01, 0.05],
    ratio: [0.01, 0.005],
    years: [0.01, 0.02],
    number: [0.01, 0.01],
    units: [0.005, 0.5],
};

export const UNIT_SUFFIX: Record<Unit, string> = {
    EUR: "€",
    percent: "%",
    ratio: "",
    years: "Jahre",
    number: "",
    units: "Stück",
};

/**
 * Accepts what a German student actually types:
 * "1.234,56"  "1234,56"  "1234.56"  "1 234,56"  "12,5 %"  "€1.200"
 */
export function parseNumericInput(raw: string): number | null {
    if (!raw) return null;
    let s = raw.trim().replace(/[€%\s]/g, "").replace(/[a-zA-Z]/g, "");
    if (!s) return null;

    const hasComma = s.includes(",");
    const hasDot = s.includes(".");

    if (hasComma && hasDot) {
        // whichever comes last is the decimal separator
        const decimalSep = s.lastIndexOf(",") > s.lastIndexOf(".") ? "," : ".";
        const thousandSep = decimalSep === "," ? "." : ",";
        s = s.split(thousandSep).join("");
        s = s.replace(decimalSep, ".");
    } else if (hasComma) {
        s = s.replace(",", ".");
    }
    // a lone "." is treated as the decimal separator (typed input, not formatted)

    const n = Number(s);
    return Number.isFinite(n) ? n : null;
}

export function isWithinTolerance(
    user: number,
    expected: number,
    unit: Unit,
    override?: number
): boolean {
    const [rel, absFloor] = TOLERANCE[unit] ?? TOLERANCE.number;
    const relative = override ?? rel;
    const allowed = Math.max(absFloor, Math.abs(expected) * relative);
    return Math.abs(user - expected) <= allowed;
}

const DE = new Intl.NumberFormat("de-DE", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
});

export function formatAnswer(value: number, unit: Unit): string {
    if (!Number.isFinite(value)) return "-";
    const n = DE.format(value);
    const suffix = UNIT_SUFFIX[unit];
    return suffix ? `${n} ${suffix}` : n;
}

/** Human-readable hint about what the grader expects, shown in the input. */
export function unitHint(unit: Unit): string {
    switch (unit) {
        case "EUR":
            return "Antwort in € (z. B. 1234,56)";
        case "percent":
            return "Antwort in % (z. B. 8,24 für 8,24 %)";
        case "years":
            return "Antwort in Jahren (z. B. 3,5)";
        case "units":
            return "Antwort in Stück";
        case "ratio":
            return "Antwort als Faktor (z. B. 1,45)";
        default:
            return "Deine Antwort";
    }
}
