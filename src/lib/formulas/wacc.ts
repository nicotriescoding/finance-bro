export const waccFormulas = {
    capm_expected_return: ({ rRF, rMkt, beta_i }) =>
        rRF + (rMkt - rRF) * beta_i,

    unlevered_cost_no_taxes: ({ E, D, rE, rD }) =>
        (E / (E + D)) * rE + (D / (E + D)) * rD,

    levered_equity_cost_no_taxes: ({ rU, rD, D, E }) =>
        rU + (D / E) * (rU - rD),

    unlevered_beta: ({ beta_E, beta_D, E, D }) =>
        (E / (E + D)) * beta_E + (D / (E + D)) * beta_D,

    equity_beta: ({ beta_U, beta_D, E, D }) =>
        beta_U + (D / E) * (beta_U - beta_D),

    wacc_with_taxes: ({ E, D, rE, rD, tauC }) =>
        (E / (E + D)) * rE + (D / (E + D)) * rD * (1 - tauC),

    wacc_target_leverage: ({ rU, D, E, tauC, rD }) =>
        rU - (D / (E + D)) * tauC * rD,

    hamada_unlevered_beta: ({ beta_E, D, E, tauC }) =>
        beta_E / (1 + (D / E) * (1 - tauC)),

    levered_firm_value: ({ VU, PV_ITS }) => VU + PV_ITS,
};