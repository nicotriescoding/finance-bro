// --- Typdefinitionen ---

type RatioInvestedCapitalInput = { E: number; NFO: number };
type RatioNetDebtInput = { D: number; FA: number };
type RatioDebtToCapitalInput = { D: number; E: number };
type RatioDebtToEquityInput = { D: number; E: number };
type RatioNFLInput = { NFO: number; E: number };
type RatioDebtToEVInput = { NFO: number; MV_E: number };
type RatioInterestCoverageInput = { EBIT: number; IE: number };
type RatioCurrentInput = { CA: number; CL: number };
type RatioQuickInput = { Cash: number; STI: number; AR: number; CL: number };
type RatioROEInput = { NI: number; E: number };
type RatioROICInput = { EBIT: number; tauC: number; IC: number };
type RatioNFEInput = { FE: number; NFO: number };
type RatioEBITMarginInput = { EBIT: number; Sales: number };
type RatioNetProfitMarginInput = { NI: number; Sales: number };
type RatioEPSInput = { NI: number; a: number };
type RatioDilutedEPSInput = { NI: number; a: number; df: number };
type RatioPEFromMCInput = { MC: number; NI: number };
type RatioEBITDAMultipleInput = { EV: number; EBITDA: number };
type RatioMarketToBookInput = { P0: number; a: number; VE: number };

// --- Formeln ---

export const ratioFormulas = {
    ratio_invested_capital: ({ E, NFO }: RatioInvestedCapitalInput) => E + NFO,
    ratio_net_debt: ({ D, FA }: RatioNetDebtInput) => D - FA,
    ratio_debt_to_capital: ({ D, E }: RatioDebtToCapitalInput) => D / (E + D),
    ratio_debt_to_equity: ({ D, E }: RatioDebtToEquityInput) => D / E,
    ratio_nfl: ({ NFO, E }: RatioNFLInput) => NFO / E,
    ratio_debt_to_ev: ({ NFO, MV_E }: RatioDebtToEVInput) => NFO / (MV_E + NFO),
    ratio_interest_coverage: ({ EBIT, IE }: RatioInterestCoverageInput) => EBIT / IE,
    ratio_current: ({ CA, CL }: RatioCurrentInput) => CA / CL,
    ratio_quick: ({ Cash, STI, AR, CL }: RatioQuickInput) => (Cash + STI + AR) / CL,
    ratio_roe: ({ NI, E }: RatioROEInput) => NI / E,
    ratio_roic_at: ({ EBIT, tauC, IC }: RatioROICInput) => (EBIT * (1 - tauC)) / IC,
    ratio_nfe: ({ FE, NFO }: RatioNFEInput) => FE / NFO,
    ratio_ebit_margin: ({ EBIT, Sales }: RatioEBITMarginInput) => EBIT / Sales,
    ratio_net_profit_margin: ({ NI, Sales }: RatioNetProfitMarginInput) => NI / Sales,
    ratio_eps: ({ NI, a }: RatioEPSInput) => NI / a,
    ratio_diluted_eps_simple: ({ NI, a, df }: RatioDilutedEPSInput) => NI / (a * df),
    ratio_pe_from_mc: ({ MC, NI }: RatioPEFromMCInput) => MC / NI,
    ratio_ebitda_multiple: ({ EV, EBITDA }: RatioEBITDAMultipleInput) => EV / EBITDA,
    ratio_market_to_book: ({ P0, a, VE }: RatioMarketToBookInput) => (P0 * a) / VE,
};