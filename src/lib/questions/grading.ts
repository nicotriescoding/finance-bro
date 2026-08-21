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
    years: "years",
    number: "",
    units: "units",
};

/**
 * Deliberately locale-agnostic. The app displays en-US, but the students are
 * German and type what they are used to, so both conventions have to parse:
 * "1,234.56" "1.234,56" "1234.56" "1234,56" "12.5 %" "€1,200" "-1.234,56".
 *
 * The one genuinely ambiguous case is a lone comma. "1,234" is read as en-US
 * thousands, because that is the format the app itself puts on screen and a
 * student re-typing a displayed number must not be marked wrong. Any other
 * shape ("8,24", "0,5") is a German decimal comma. A German decimal with
 * exactly three places and at most three integer digits therefore loses -
 * accepted, because nobody writes 1,000 to mean one.
 */
export function parseNumericInput(raw: string): number | null {
    if (!raw) return null;
    let s = raw.trim().replace(/[€%\s]/g, "").replace(/[a-zA-Z]/g, "");
    if (!s) return null;

    // Pull the sign off first so the shape tests below see digits only.
    // U+2212 MINUS SIGN is what the prompts render, so accept it too.
    const negative = /^[-−]/.test(s);
    s = s.replace(/^[-−+]/, "");
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
        s = /^\d{1,3}(,\d{3})+$/.test(s) ? s.split(",").join("") : s.replace(",", ".");
    } else if (hasDot && (s.match(/\./g)?.length ?? 0) > 1) {
        // Two or more dots can only be German thousands ("1.234.567").
        // A single dot stays the decimal separator.
        s = s.split(".").join("");
    }

    const n = Number(s);
    if (!Number.isFinite(n)) return null;
    return negative ? -n : n;
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

/** "±0.5 %" - the effective relative tolerance, for the posting meta row. */
export function toleranceLabel(unit: Unit, override?: number): string {
    const [rel] = TOLERANCE[unit] ?? TOLERANCE.number;
    const pct = (override ?? rel) * 100;
    const shown = pct >= 1 ? pct.toFixed(0) : pct.toFixed(1);
    return `±${shown} %`;
}

const NUM = new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
});

export function formatAnswer(value: number, unit: Unit): string {
    if (!Number.isFinite(value)) return "-";
    const n = NUM.format(value);
    const suffix = UNIT_SUFFIX[unit];
    return suffix ? `${n} ${suffix}` : n;
}

/** Human-readable hint about what the grader expects, shown in the input. */
export function unitHint(unit: Unit): string {
    switch (unit) {
        case "EUR":
            return "Answer in € (e.g. 1234.56)";
        case "percent":
            return "Answer in % (e.g. 8.24 for 8.24 %)";
        case "years":
            return "Answer in years (e.g. 3.5)";
        case "units":
            return "Answer in units";
        case "ratio":
            return "Answer as a factor (e.g. 1.45)";
        default:
            return "Your answer";
    }
}
