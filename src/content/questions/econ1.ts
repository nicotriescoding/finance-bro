import type { Question } from "@/lib/questions/types";
import { eur, n2, pct } from "./_helpers";

export const econ1Questions: Question[] = [
    {
        id: "e1-sd-shift",
        subject: "econ1", topic: "supply_demand", difficulty: "easy", kind: "choice",
        prompt: "The price of a good that is complementary to good X rises. What happens in the market for X?",
        choices: [
            "The demand curve for X shifts left; price and quantity both fall.",
            "The demand curve for X shifts right; price and quantity both rise.",
            "The supply curve for X shifts left; the price rises.",
            "There is merely a movement along the demand curve.",
        ],
        correct: 0,
        explanation: "Complements are consumed together. If the complement becomes more expensive, demand for X falls at every price — the entire curve shifts left.",
    },
    {
        id: "e1-sd-equilibrium",
        subject: "econ1", topic: "supply_demand", difficulty: "medium", kind: "numeric", unit: "number",
        build: (rng) => {
            const a = rng.int(80, 200);
            const b = rng.int(2, 6);
            const c = rng.int(1, 4);
            // a - b*P = c*P  =>  P = a/(b+c)
            const p = a / (b + c);
            return {
                prompt: `Demand is Q_d = ${a} − ${b}·P and supply is Q_s = ${c}·P. What is the **equilibrium price P***?`,
                given: { Demand: `Q_d = ${a} − ${b}P`, Supply: `Q_s = ${c}P` },
                answer: p,
                explanation: `Q_d = Q_s → ${a} − ${b}P = ${c}P → P* = ${a}/${b + c} = ${n2(p)}`,
            };
        },
    },
    {
        id: "e1-el-price",
        subject: "econ1", topic: "elasticity", difficulty: "medium", kind: "numeric", unit: "ratio",
        build: (rng) => {
            const p0 = rng.int(10, 40);
            const p1 = p0 + rng.int(2, 10);
            const q0 = rng.int(100, 500);
            const q1 = q0 - rng.int(10, Math.floor(q0 * 0.4));
            const e = ((q1 - q0) / q0) / ((p1 - p0) / p0);
            return {
                prompt: `The price rises from ${eur(p0)} to ${eur(p1)} and the quantity demanded falls from ${q0} to ${q1} units. What is the **price elasticity of demand** (point elasticity, including the sign)?`,
                given: { "P₀ → P₁": `${eur(p0)} → ${eur(p1)}`, "Q₀ → Q₁": `${q0} → ${q1}` },
                answer: e,
                explanation: `ε = (ΔQ/Q₀)/(ΔP/P₀) = ${n2(e)} — magnitude ${Math.abs(e) > 1 ? "> 1, so demand is elastic" : "< 1, so demand is inelastic"}.`,
            };
        },
    },
    {
        id: "e1-el-revenue",
        subject: "econ1", topic: "elasticity", difficulty: "medium", kind: "choice",
        prompt: "The price elasticity of demand is −0.4. A firm raises its price. What happens to revenue?",
        choices: [
            "Revenue rises, because demand is inelastic.",
            "Revenue falls, because demand is elastic.",
            "Revenue is unchanged.",
            "This cannot be determined without knowing the cost function.",
        ],
        correct: 0,
        explanation: "|ε| < 1 means inelastic: quantity responds less than proportionally to the price, so the revenue effect of the higher price dominates.",
    },
    {
        id: "e1-consumer-mrs",
        subject: "econ1", topic: "consumer", difficulty: "hard", kind: "choice",
        prompt: "At the consumer's optimum with an interior solution:",
        choices: [
            "MRS = P_x / P_y; the indifference curve is tangent to the budget line.",
            "MRS = 0; the indifference curve is horizontal.",
            "The marginal utility of both goods is the same.",
            "The budget is not fully spent.",
        ],
        correct: 0,
        explanation: "At the optimum the marginal rate of substitution equals the price ratio, i.e. MU_x/MU_y = P_x/P_y.",
    },
    {
        id: "e1-consumer-giffen",
        subject: "econ1", topic: "consumer", difficulty: "hard", kind: "choice",
        prompt: "Which statement about a Giffen good is correct?",
        choices: [
            "The income effect is negative and outweighs the substitution effect, so the demand curve slopes upward.",
            "The substitution effect is positive and outweighs the income effect.",
            "Giffen goods are always luxury goods as well.",
            "For Giffen goods there is no substitution effect.",
        ],
        correct: 0,
        explanation: "A Giffen good is a strongly inferior good for which the negative income effect dominates the substitution effect.",
    },
    {
        id: "e1-prod-costs",
        subject: "econ1", topic: "production_costs", difficulty: "easy", kind: "numeric", unit: "EUR",
        build: (rng) => {
            const fix = rng.int(20, 120) * 100;
            const varUnit = rng.int(3, 25);
            const q = rng.int(50, 500);
            const answer = (fix + varUnit * q) / q;
            return {
                prompt: `Fixed costs are ${eur(fix)} and variable cost per unit is ${eur(varUnit)}. What is the **average cost** at an output of ${q} units?`,
                given: { "Fixed costs": eur(fix), "Variable cost per unit": eur(varUnit), Quantity: `${q} units` },
                answer,
                explanation: `ATC = (FC + AVC·q)/q = ${eur(answer)}`,
            };
        },
    },
    {
        id: "e1-prod-mc-atc",
        subject: "econ1", topic: "production_costs", difficulty: "medium", kind: "choice",
        prompt: "The marginal cost curve intersects the average cost curve …",
        choices: [
            "at its minimum.",
            "at its maximum.",
            "always at an output of zero.",
            "never — the two curves run parallel.",
        ],
        correct: 0,
        explanation: "As long as MC < ATC average cost is falling; once MC > ATC it is rising. The point of intersection is therefore the minimum of ATC.",
    },
    {
        id: "e1-market-pc",
        subject: "econ1", topic: "market_forms", difficulty: "easy", kind: "choice",
        prompt: "Which condition does a firm under perfect competition satisfy at its profit maximum?",
        choices: [
            "P = MC",
            "MR > MC",
            "P = ATC",
            "MR = 0",
        ],
        correct: 0,
        explanation: "Under perfect competition the price equals marginal revenue, so the profit maximum is where P = MR = MC.",
    },
    {
        id: "e1-market-monopoly",
        subject: "econ1", topic: "market_forms", difficulty: "hard", kind: "choice",
        prompt: "A monopolist maximizes its profit. Which statement is correct?",
        choices: [
            "It sets a price above marginal cost and thereby creates a deadweight loss.",
            "It produces in the inelastic range of the demand curve.",
            "It sets the price equal to marginal cost.",
            "It always earns a positive economic profit.",
        ],
        correct: 0,
        explanation: "MR = MC < P: the mark-up over marginal cost is what creates the deadweight loss. A monopolist always produces in the elastic range, and profits are not guaranteed.",
    },
    {
        id: "e1-welfare-tax",
        subject: "econ1", topic: "welfare", difficulty: "medium", kind: "choice",
        prompt: "A per-unit tax is levied on a good whose demand is very inelastic and whose supply is very elastic. Who bears the greater part of the burden?",
        choices: [
            "The consumers.",
            "The producers.",
            "Both sides equally, regardless of the elasticities.",
            "The government, because it levies the tax.",
        ],
        correct: 0,
        explanation: "The tax burden falls mainly on the side of the market that responds less elastically — here the consumers.",
    },
    {
        id: "e1-welfare-surplus",
        subject: "econ1", topic: "welfare", difficulty: "medium", kind: "numeric", unit: "EUR",
        build: (rng) => {
            const pMax = rng.int(40, 120);
            const p = rng.int(10, pMax - 10);
            const q = rng.int(20, 200);
            const answer = 0.5 * (pMax - p) * q;
            return {
                prompt: `The (linear) demand curve intersects the price axis at ${eur(pMax)}. In equilibrium the price is ${eur(p)} and the quantity is ${q} units. How large is the **consumer surplus**?`,
                given: { "Choke price": eur(pMax), "P*": eur(p), "Q*": `${q} units` },
                answer,
                explanation: `CS = ½·(P_max − P*)·Q* = ${eur(answer)}`,
            };
        },
    },
];
