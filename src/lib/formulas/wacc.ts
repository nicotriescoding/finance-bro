// --- Typdefinitionen ---

type CapmExpectedReturnInput = { rRF: number; rMkt: number; beta_i: number };
type UnleveredCostNoTaxesInput = { E: number; D: number; rE: number; rD: number };
type LeveredEquityCostNoTaxesInput = { rU: number; rD: number; D: number; E: number };
type UnleveredBetaInput = { beta_E: number; beta_D: number; E: number; D: number };
type EquityBetaInput = { beta_U: number; beta_D: number; E: number; D: number };
type WACCWithTaxesInput = { E: number; D: number; rE: number; rD: number; tauC: number };
type WACCTargetLeverageInput = { rU: number; D: number; E: number; tauC: number; rD: number };
type HamadaUnleveredBetaInput = { beta_E: number; D: number; E: number; tauC: number };
type LeveredFirmValueInput = { VU: number; PV_ITS: number };

// --- Formeln ---

export const waccFormulas = {
    capm_expected_return: ({ rRF, rMkt, beta_i }: CapmExpectedReturnInput) =>
        rRF + (rMkt - rRF) * beta_i,

    unlevered_cost_no_taxes: ({ E, D, rE, rD }: UnleveredCostNoTaxesInput) =>
        (E / (E + D)) * rE + (D / (E + D)) * rD,

    levered_equity_cost_no_taxes: ({ rU, rD, D, E }: LeveredEquityCostNoTaxesInput) =>
        rU + (D / E) * (rU - rD),

    unlevered_beta: ({ beta_E, beta_D, E, D }: UnleveredBetaInput) =>
        (E / (E + D)) * beta_E + (D / (E + D)) * beta_D,

    equity_beta: ({ beta_U, beta_D, E, D }: EquityBetaInput) =>
        beta_U + (D / E) * (beta_U - beta_D),

    wacc_with_taxes: ({ E, D, rE, rD, tauC }: WACCWithTaxesInput) =>
        (E / (E + D)) * rE + (D / (E + D)) * rD * (1 - tauC),

    wacc_target_leverage: ({ rU, D, E, tauC, rD }: WACCTargetLeverageInput) =>
        rU - (D / (E + D)) * tauC * rD,

    hamada_unlevered_beta: ({ beta_E, D, E, tauC }: HamadaUnleveredBetaInput) =>
        beta_E / (1 + (D / E) * (1 - tauC)),

    levered_firm_value: ({ VU, PV_ITS }: LeveredFirmValueInput) => VU + PV_ITS,
};