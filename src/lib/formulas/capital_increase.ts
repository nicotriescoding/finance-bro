export const capitalIncreaseFormulas = {
    capital_increase_cash_Pex: ({ BV, Pcum, IP }) => (BV * Pcum + IP) / (BV + 1),
    capital_increase_SR_no_div_disadv: ({ Pcum, IP, BV }) => (Pcum - IP) / (BV + 1),
    capital_increase_SR_with_div_disadv: ({ Pcum, IP, Diva, Divn, q, t, BV }) =>
        (Pcum - IP - (Diva - Divn) * Math.pow(q, -t)) / (BV + 1),
    capital_increase_from_funds_Pex: ({ Pcum, BV }) => Pcum / (1 + 1 / BV),
};

