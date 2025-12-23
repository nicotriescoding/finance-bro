// --- Typdefinitionen ---

type StockTotalReturnInput = { D1: number; P0: number; P1: number };
type DDMConstantGrowthInput = { D1: number; rE: number; w: number };
type DDMChangingGrowthInput = { D1: number; wa: number; wb: number; rE: number; N: number };
type MultiplePEInput = { P0: number; EPS: number };
type MultiplePBInput = { P0: number; VE: number };

// --- Formeln ---

export const valuationFormulas = {
    stock_total_return: ({ D1, P0, P1 }: StockTotalReturnInput) => D1 / P0 + (P1 - P0) / P0,

    ddm_constant_growth: ({ D1, rE, w }: DDMConstantGrowthInput) => D1 / ((rE / 100) - (w / 100)),

    ddm_changing_growth: ({ D1, wa, wb, rE, N }: DDMChangingGrowthInput) => {
        const part1 = Array.from({ length: N }, (_, t) =>
            D1 * Math.pow(1 + wa / 100, t) / Math.pow(1 + rE / 100, t + 1)
        ).reduce((a, b) => a + b, 0);

        const part2 =
            (D1 * Math.pow(1 + wa / 100, N) * (1 + wb / 100)) /
            ((rE / 100) - (wb / 100)) /
            Math.pow(1 + rE / 100, N + 1);

        return part1 + part2;
    },

    multiple_PE: ({ P0, EPS }: MultiplePEInput) => P0 / EPS,
    multiple_PB: ({ P0, VE }: MultiplePBInput) => P0 / VE,
};