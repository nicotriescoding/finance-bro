export const valuationFormulas = {
    stock_total_return: ({ D1, P0, P1 }) => D1 / P0 + (P1 - P0) / P0,
    ddm_constant_growth: ({ D1, rE, w }) => D1 / ((rE / 100) - (w / 100)),
    ddm_changing_growth: ({ D1, wa, wb, rE, N }) => {
        const part1 = Array.from({ length: N }, (_, t) =>
            D1 * Math.pow(1 + wa / 100, t) / Math.pow(1 + rE / 100, t + 1)
        ).reduce((a, b) => a + b, 0);
        const part2 =
            (D1 * Math.pow(1 + wa / 100, N) * (1 + wb / 100)) /
            ((rE / 100) - (wb / 100)) /
            Math.pow(1 + rE / 100, N + 1);
        return part1 + part2;
    },
    multiple_PE: ({ P0, EPS }) => P0 / EPS,
    multiple_PB: ({ P0, VE }) => P0 / VE,
};

