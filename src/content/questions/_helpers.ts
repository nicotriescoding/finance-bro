/** Shared number formatting + math helpers for question banks. */

/**
 * The site is English, so numbers are en-US. A German edition only has to flip
 * this one locale string - every number on screen goes through these helpers.
 */
const LOCALE = "en-US";

const fmt = (min = 2, max = 2) =>
    new Intl.NumberFormat(LOCALE, { minimumFractionDigits: min, maximumFractionDigits: max });

/** 1234.5 -> "1,234.50" */
export const n2 = (v: number) => fmt(2, 2).format(v);
/** 1234.5 -> "1,234.5" (drops trailing zeros) */
export const n = (v: number) => fmt(0, 2).format(v);
/** 1234.5 -> "1,234.50 €" */
export const eur = (v: number) => `${n2(v)} €`;
/** 8.25 -> "8.25 %" */
export const pct = (v: number) => `${fmt(0, 2).format(v)} %`;

/** Standard normal CDF (Abramowitz & Stegun 26.2.17, |err| < 7.5e-8). */
export function normCdf(x: number): number {
    const t = 1 / (1 + 0.2316419 * Math.abs(x));
    const d = 0.3989422804014327 * Math.exp((-x * x) / 2);
    const p =
        d * t * (0.319381530 + t * (-0.356563782 + t * (1.781477937 + t * (-1.821255978 + t * 1.330274429))));
    return x >= 0 ? 1 - p : p;
}

/** Net present value of a cash-flow array, CF[0] at t=0. r as decimal. */
export function npv(cashflows: number[], r: number): number {
    return cashflows.reduce((sum, cf, t) => sum + cf / (1 + r) ** t, 0);
}

/** Internal rate of return via bisection. Returns a decimal (0.12 = 12 %). */
export function irr(cashflows: number[]): number {
    let lo = -0.9999;
    let hi = 10;
    let fLo = npv(cashflows, lo);
    for (let i = 0; i < 200; i++) {
        const mid = (lo + hi) / 2;
        const fMid = npv(cashflows, mid);
        if (Math.abs(fMid) < 1e-9) return mid;
        if (fLo * fMid < 0) hi = mid;
        else {
            lo = mid;
            fLo = fMid;
        }
    }
    return (lo + hi) / 2;
}

/** Macaulay duration of a straight coupon bond. r as decimal. */
export function macaulayDuration(coupon: number, face: number, r: number, years: number) {
    let price = 0;
    let weighted = 0;
    for (let t = 1; t <= years; t++) {
        const cf = t === years ? coupon + face : coupon;
        const pv = cf / (1 + r) ** t;
        price += pv;
        weighted += t * pv;
    }
    return { price, duration: weighted / price };
}

/** Renders a "given values" table from label -> formatted value pairs. */
export type Given = Record<string, string>;
