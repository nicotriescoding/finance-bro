// --- Typdefinitionen ---

type CapitalIncreaseCash = {
    BV: number;
    Pcum: number;
    IP: number;
};

type CapitalIncreaseSRNoDiv = {
    Pcum: number;
    IP: number;
    BV: number;
};

type CapitalIncreaseSRWithDiv = {
    Pcum: number;
    IP: number;
    Diva: number;
    Divn: number;
    q: number;
    t: number;
    BV: number;
};

type CapitalIncreaseFromFunds = {
    Pcum: number;
    BV: number;
};

// --- Formeln ---

export const capitalIncreaseFormulas = {
    capital_increase_cash_Pex: ({ BV, Pcum, IP }: CapitalIncreaseCash) =>
        (BV * Pcum + IP) / (BV + 1),

    capital_increase_SR_no_div_disadv: ({ Pcum, IP, BV }: CapitalIncreaseSRNoDiv) =>
        (Pcum - IP) / (BV + 1),

    capital_increase_SR_with_div_disadv: ({
                                              Pcum,
                                              IP,
                                              Diva,
                                              Divn,
                                              q,
                                              t,
                                              BV,
                                          }: CapitalIncreaseSRWithDiv) =>
        (Pcum - IP - (Diva - Divn) * Math.pow(q, -t)) / (BV + 1),

    capital_increase_from_funds_Pex: ({ Pcum, BV }: CapitalIncreaseFromFunds) =>
        Pcum / (1 + 1 / BV),
};