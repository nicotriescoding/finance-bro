import { interestFormulas } from "./interest";
import { annuityFormulas } from "./annuities";
import { bondFormulas } from "./bonds";
import { valuationFormulas } from "./valuation";
import { ratioFormulas } from "./ratios";
import { optionFormulas } from "./options";
import { portfolioFormulas } from "./portfolio";
import { investmentFormulas } from "./investment";
import { capitalIncreaseFormulas } from "./capital_increase";

export const formulaMap = {
    ...interestFormulas,
    ...annuityFormulas,
    ...bondFormulas,
    ...valuationFormulas,
    ...ratioFormulas,
    ...optionFormulas,
    ...portfolioFormulas,
    ...investmentFormulas,
    ...capitalIncreaseFormulas,
    default: () => NaN,
};
