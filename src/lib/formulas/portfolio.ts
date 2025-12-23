// --- Typdefinitionen ---

type PortfolioReturnTwoAssetsInput = {
    wA: number;
    rA: number;
    wB: number;
    rB: number;
};

type PortfolioVarianceTwoAssetsInput = {
    wA: number;
    wB: number;
    sigmaA: number;
    sigmaB: number;
    rhoAB: number;
};

type PortfolioStdDevTwoAssetsInput = {
    varP: number;
};

// --- Formeln ---

export const portfolioFormulas = {
    portfolio_return_two_assets: ({ wA, rA, wB, rB }: PortfolioReturnTwoAssetsInput) =>
        wA * (rA / 100) + wB * (rB / 100),

    portfolio_variance_two_assets: ({
                                        wA,
                                        wB,
                                        sigmaA,
                                        sigmaB,
                                        rhoAB,
                                    }: PortfolioVarianceTwoAssetsInput) =>
        Math.pow(wA * (sigmaA / 100), 2) +
        Math.pow(wB * (sigmaB / 100), 2) +
        2 * wA * wB * (sigmaA / 100) * (sigmaB / 100) * rhoAB,

    portfolio_stddev_two_assets: ({ varP }: PortfolioStdDevTwoAssetsInput) => Math.sqrt(varP),
};