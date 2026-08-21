/**
 * BroDollars. Amounts are written as an en-US number followed by the flying
 * bill - "1,340 💸" - matching the numbers the questions themselves display.
 */
export const MONEY = "💸";

const FMT = new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 });

export function formatMoney(n: number): string {
    return FMT.format(Math.round(n));
}
