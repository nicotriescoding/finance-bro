import type { Question } from "@/lib/questions/types";
import type { Rng } from "@/lib/questions/rng";
import { eur, n, n2, pct } from "./_helpers";

/** "1 worker" / "3 workers" - counts that can hit 1. */
const plural = (k: number, one: string, many = `${one}s`) => `${n(k)} ${k === 1 ? one : many}`;

/**
 * Economics 2 - Macroeconomics.
 *
 * Built from the real TUM Economics II exams SS2017, SS2018 and SS2019 under
 * the copyright-redesign policy: only the tested competency, the standard
 * lecture formulas and standard terminology carry over from the exams. Every
 * scenario, country, firm and person is invented fresh, and every question
 * draws its numbers from the seeded rng (numeric-only for now: choice
 * questions removed 2026-08-28 per Nico, recoverable from git).
 * Structural variants that recur across
 * exams are merged into one generator citing all occurrences.
 */

// ---------------------------------------------------------------------------
// Efficiency-wage block: verified parameter sets.
// Derivation: e(w) = a·√w − b with b = a·rt/2 makes the Solow condition
// e'(w)·w = e(w) solve to √w* = 2b/a = rt, so w* = rt² and e* = b.
// Labor demand from max p·√(e·L) − w·L gives L = p²e/(4w²); with p = 2·rt²·s
// this is L = s²·b - an integer below the labor supply Ls in every entry.
const EW_CONFIGS = [
    // Curated so every entry solves in integers.
    { a: 4, rt: 2, s: 2, Ls: 20 },  // w*=4, e*=4, p=16, L=16, u=20 %
    { a: 10, rt: 1, s: 2, Ls: 25 }, // w*=1, e*=5, p=4,  L=20, u=20 %
    { a: 8, rt: 1, s: 3, Ls: 45 },  // w*=1, e*=4, p=6,  L=36, u=20 %
    { a: 6, rt: 3, s: 1, Ls: 12 },  // w*=9, e*=9, p=18, L=9,  u=25 %
    { a: 2, rt: 2, s: 3, Ls: 24 },  // w*=4, e*=2, p=24, L=18, u=25 %
    { a: 8, rt: 2, s: 2, Ls: 40 },  // w*=4, e*=8, p=16, L=32, u=20 %
] as const;

function ewDerived(cfg: (typeof EW_CONFIGS)[number]) {
    const b = (cfg.a * cfg.rt) / 2;
    const w = cfg.rt ** 2;
    const e = b;
    const p = 2 * cfg.rt ** 2 * cfg.s;
    const L = (p * p * e) / (4 * w * w);
    return { b, w, e, p, L };
}

// ---------------------------------------------------------------------------
// Goods-market block: one shared draw so equilibrium output is always a round
// number (Y is a multiple of 400, and every demand component is derived from
// the target Y, never the other way around - one draw feeds prompt AND answer).
function drawGoodsMarket(rng: Rng) {
    const c1 = rng.pick([0.4, 0.5, 0.6, 0.75, 0.8] as const);
    const t = rng.pick([0.2, 0.25, 0.5] as const);
    const Y = 400 * rng.int(5, 20);
    const D = 1 - c1 * (1 - t); // 0.36 <= D <= 0.8, never 0
    const A = Math.round(Y * D); // total autonomous demand, integer
    const G = 25 * rng.int(4, Math.floor(A / 75));
    const c0 = 25 * rng.int(1, Math.floor(A / 125));
    const X = 25 * rng.int(1, Math.floor(A / 125));
    const M = 25 * rng.int(0, Math.min(X / 25, Math.floor(A / 125)));
    const I = A - c0 - G - X + M; // > 0 by construction
    return { c1, t, Y, D, c0, G, X, M, I };
}

function goodsMarketGiven(d: ReturnType<typeof drawGoodsMarket>) {
    return {
        "Autonomous consumption $c_0$": n(d.c0),
        "Marginal propensity to consume $c_1$": n(d.c1),
        "Income tax rate t": pct(d.t * 100),
        "Investment I": n(d.I),
        "Government purchases G": n(d.G),
        "Exports X": n(d.X),
        "Imports M": n(d.M),
    };
}

// ---------------------------------------------------------------------------
// Solow golden-rule block: verified (A, r0) pairs for f(k) = A·√k.
// f'(k) = A/(2√k) = n+g+δ solves to √k_gr = A/(2(n+g+δ)) = r0, so k_gr = r0²
// and (n+g+δ) in percent is A·100/(2·r0) - an integer for every pair.
const SOLOW_GR = [
    { A: 1, r0: 2 },  // n+g+δ = 25 %, k_gr = 4
    { A: 1, r0: 5 },  // n+g+δ = 10 %, k_gr = 25
    { A: 2, r0: 5 },  // n+g+δ = 20 %, k_gr = 25
    { A: 2, r0: 10 }, // n+g+δ = 10 %, k_gr = 100
    { A: 3, r0: 10 }, // n+g+δ = 15 %, k_gr = 100
    { A: 2, r0: 4 },  // n+g+δ = 25 %, k_gr = 16
] as const;

// ---------------------------------------------------------------------------
// Helpers for the 2026-09 expansion (SS2017-SS2019 exams + lecture decks).
// Real countries, rotated per seed, so variants never repeat a source story.
const EU_COUNTRIES = [
    "Germany", "France", "the Netherlands", "Poland", "Spain",
    "Italy", "Portugal", "Austria", "Belgium", "Denmark",
] as const;
const WORLD_COUNTRIES = [
    ...EU_COUNTRIES, "Japan", "South Korea", "Brazil", "Canada", "Sweden", "Norway",
] as const;

// Goods-market draw for the new generators. The (c1, t) pairs are chosen so
// that D·200 is an integer (Y is a multiple of 200, so autonomous demand
// A = D·Y is always an integer); every pair has c1 >= 0.6.
const GM2_PAIRS = [
    { c1: 0.75, t: 0.2, D: 0.4 },
    { c1: 0.8, t: 0.25, D: 0.4 },
    { c1: 0.6, t: 0.25, D: 0.55 },
    { c1: 0.8, t: 0.2, D: 0.36 },
    { c1: 0.6, t: 0.3, D: 0.58 },
    { c1: 0.75, t: 0.3, D: 0.475 },
    { c1: 0.8, t: 0.3, D: 0.44 },
    { c1: 0.6, t: 0.2, D: 0.52 },
] as const;

function drawGM2(rng: Rng) {
    const p = rng.pick(GM2_PAIRS);
    const Y = 200 * rng.int(8, 30);
    const A = Math.round(p.D * Y); // integer by construction of GM2_PAIRS
    const c0 = 50 * rng.int(1, 4);
    const X = 25 * rng.int(2, 6);
    const M = 25 * rng.int(0, Math.min(X / 25, 4));
    const rest = A - c0 - X + M; // >= 0.36·1600 − 200 − 150 = 226
    const G = 25 * rng.int(2, Math.min(40, Math.floor((rest - 50) / 25)));
    const I = rest - G; // >= 50 by the G bound
    return { c1: p.c1, t: p.t, D: p.D, Y, A, c0, X, M, G, I };
}

function gm2Given(d: ReturnType<typeof drawGM2>) {
    return {
        "Autonomous consumption $c_0$": n(d.c0),
        "Marginal propensity to consume $c_1$": n(d.c1),
        "Income tax rate t": pct(d.t * 100),
        "Investment I": n(d.I),
        "Government purchases G": n(d.G),
        "Exports X": n(d.X),
        "Imports M": n(d.M),
    };
}

// Technology menus for the isocost/innovation-rent family (lecture Unit II,
// SS2019 Q6). Input prices are drawn from value sets that exclude every price
// appearing in lecture examples.
const TECH_WAGES = [8, 12, 14, 16, 18] as const;
const TECH_ENERGY_PRICES = [4, 6, 9, 11] as const;

// ---------------------------------------------------------------------------
// Story-line variants (2026-09). Every question that tells a story draws one
// scenario FIRST inside build, so the same concept shows up dressed
// differently from seed to seed. Scenarios hold strings only - every number
// still comes from the rng. Pure-formula questions and the ones that already
// rotate a real country have no scenario array.

/** "she" -> "She" for a scenario word at the start of a sentence. */
const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

const E2_GR_TOTAL_GROWTH_SCENARIOS = [
    { place: "The kingdom of Solmara" },
    { place: "The island state of Kirrova" },
    { place: "The federation of Ostmere" },
] as const;

const E2_GR_GDP_PC_GROWTH_SCENARIOS = [
    { office: "The statistics office of Veldaria" },
    { office: "The central bank of Brannock" },
    { office: "The finance ministry of Ilmara" },
] as const;

const E2_GDP_VALUE_ADDED_SCENARIOS = [
    { place: "Listrana", art1: "An", s1: "olive grower", L1: "Grower", subj1: "she", sale1: "her entire harvest", imp1: "fertilizer", s2: "oil mill", L2: "Mill", imp2: "glass bottles", prod2: "bottled oil", s3: "delicatessen maker", L3: "Delicatessen maker", make3: "turns the oil it bought into antipasti" },
    { place: "Varnholm", art1: "A", s1: "sheep farmer", L1: "Farmer", subj1: "he", sale1: "his entire wool clip", imp1: "feed", s2: "spinning mill", L2: "Mill", imp2: "dye", prod2: "dyed yarn", s3: "knitwear maker", L3: "Knitwear maker", make3: "turns the yarn it bought into sweaters" },
    { place: "Cazorra", art1: "A", s1: "cocoa farmer", L1: "Farmer", subj1: "she", sale1: "her entire bean harvest", imp1: "fertilizer", s2: "chocolate factory", L2: "Factory", imp2: "sugar", prod2: "chocolate", s3: "confectioner", L3: "Confectioner", make3: "turns the chocolate it bought into pralines" },
    { place: "Rendale", art1: "A", s1: "wheat farmer", L1: "Farmer", subj1: "he", sale1: "his entire grain harvest", imp1: "seed", s2: "flour mill", L2: "Mill", imp2: "paper sacks", prod2: "flour", s3: "pastry bakery", L3: "Bakery", make3: "turns the flour it bought into pastries" },
] as const;

const E2_TECH_SWITCH_RENT_SCENARIOS = [
    { firm: "A ceramics workshop in Tavia", batch: "fire one kiln batch", energy: "gas" },
    { firm: "A bakery in Rulmond", batch: "bake one batch of loaves", energy: "gas" },
    { firm: "A dye-house in Amberly", batch: "dye one batch of cloth", energy: "steam" },
    { firm: "A foundry in Kestrin", batch: "cast one batch of fittings", energy: "coke" },
] as const;

const E2_TECH_MPL_SCENARIOS = [
    { firm: "A bicycle-frame manufacturer" },
    { firm: "A furniture workshop" },
    { firm: "A solar-panel assembler" },
] as const;

const E2_RD_PRIVATE_OPTIMUM_SCENARIOS = [
    { labs: "Two rival battery labs, Voltra and Cellix", items: "patentable cell designs", plural: "designs", item: "design", Items: "Designs" },
    { labs: "Two rival drone makers, Aerix and Skylon", items: "patentable flight-controller designs", plural: "designs", item: "design", Items: "Designs" },
    { labs: "Two rival materials labs, Ferrox and Alumet", items: "patentable alloys", plural: "alloys", item: "alloy", Items: "Alloys" },
] as const;

const E2_RD_SUBSIDY_SCENARIOS = [
    { labs: "Two rival vaccine labs", items: "candidate compounds", item: "compound", Items: "Compounds" },
    { labs: "Two rival chip-design labs", items: "patentable chip layouts", item: "layout", Items: "Layouts" },
    { labs: "Two rival enzyme labs", items: "patentable enzymes", item: "enzyme", Items: "Enzymes" },
] as const;

const E2_RD_MERGER_SCENARIOS = [
    { labs: "Two agri-tech labs", items: "patentable seed varieties", item: "variety", Items: "Varieties" },
    { labs: "Two robotics labs", items: "patentable gripper designs", item: "design", Items: "Designs" },
    { labs: "Two pharma labs", items: "patentable molecules", item: "molecule", Items: "Molecules" },
] as const;

const E2_GM_EQUILIBRIUM_OUTPUT_SCENARIOS = [
    { place: "the open economy of Orvania" },
    { place: "the open economy of Marrowin" },
    { place: "the trading nation of Selvane" },
] as const;

const E2_GM_CONSUMPTION_SCENARIOS = [
    { place: "The republic of Quenavia" },
    { place: "The duchy of Ferrant" },
    { place: "The island nation of Tolmere" },
] as const;

const E2_GM_MULTIPLIER_SCENARIOS = [
    { place: "Bellmark", stimulus: "Parliament passes a stimulus that raises government purchases by" },
    { place: "Corvath", stimulus: "The government launches a road-building programme that raises its purchases by" },
    { place: "Ilsmere", stimulus: "A hospital-building plan raises government purchases by" },
] as const;

const E2_GM_BUDGET_BALANCE_SCENARIOS = [
    { placePoss: "Novaria's" },
    { placePoss: "Estrel's" },
    { placePoss: "Wendmark's" },
] as const;

const E2_GM_BALANCED_BUDGET_TAX_SCENARIOS = [
    { placePoss: "Caldonia's" },
    { placePoss: "Lorimar's" },
    { placePoss: "Tessvane's" },
] as const;

const E2_LM_EFFICIENCY_WAGE_SCENARIOS = [
    { firm: "A fish cannery on the island of Skarvoy" },
    { firm: "A call centre in the town of Brennholm" },
    { firm: "A textile mill in Varduna" },
    { firm: "A fruit-packing plant near Lomera" },
] as const;

const E2_LM_UNEMPLOYMENT_SCENARIOS = [
    { town: "Halvora", firm: "the cannery", units: "crates", unit: "crate" },
    { town: "Norrhaven", firm: "the quarry", units: "pallets of stone", unit: "pallet" },
    { town: "Ashmoor", firm: "the brickworks", units: "pallets of bricks", unit: "pallet" },
    { town: "Kellmere", firm: "the dairy", units: "wheels of cheese", unit: "wheel" },
] as const;

const E2_LM_PROFIT_SCENARIOS = [
    { firm: "The only sawmill in the valley of Drenn", short: "the mill", units: "pallets of timber" },
    { firm: "The only paper mill in the valley of Lisk", short: "the mill", units: "rolls of paper" },
    { firm: "The only bottling plant in the valley of Orra", short: "the plant", units: "crates of mineral water" },
    { firm: "The only tannery in the valley of Vell", short: "the tannery", units: "bundles of leather" },
] as const;

const E2_LM_MINIMUM_WAGE_SCENARIOS = [
    { firm: "The mining company", town: "Corvane", units: "tons of ore" },
    { firm: "The salt works", town: "Halvane", units: "tons of salt" },
    { firm: "The peat company", town: "Moorkirk", units: "tons of peat" },
] as const;

const E2_LM_RENT_HOURLY_SCENARIOS = [
    { who: "A crane operator in the port of Vestre", subj: "she", obj: "her", poss: "her" },
    { who: "A tram driver in Aldbury", subj: "he", obj: "him", poss: "his" },
    { who: "A welder at the shipyard of Norrvik", subj: "she", obj: "her", poss: "her" },
    { who: "A night-shift baker in Carrow", subj: "he", obj: "him", poss: "his" },
] as const;

const E2_LM_RENT_TOTAL_SCENARIOS = [
    { who: "A machinist in Ostbro", subj: "he", obj: "him", poss: "his" },
    { who: "A lab technician in Welmond", subj: "she", obj: "her", poss: "her" },
    { who: "A forklift driver in Tarn", subj: "he", obj: "him", poss: "his" },
    { who: "A pastry chef in Selmar", subj: "she", obj: "her", poss: "her" },
] as const;

const E2_IT_INTEREST_RATE_SCENARIOS = [
    { name: "Marisol", subj: "she", poss: "her" },
    { name: "Rafael", subj: "he", poss: "his" },
    { name: "Yuki", subj: "she", poss: "her" },
] as const;

const E2_IT_AFFORDABLE_SCENARIOS = [
    { name: "Tobias", subj: "he" },
    { name: "Amara", subj: "she" },
    { name: "Niklas", subj: "he" },
] as const;

const E2_FX_CROSS_RATE_SCENARIOS = [
    { a: "taler", as: "talers", aC: "Aldunia", A: "T", b: "rupel", bs: "rupels", bC: "Brevia", B: "R", c: "denar", C: "D" },
    { a: "florin", as: "florins", aC: "Marovia", A: "F", b: "pell", bs: "pells", bC: "Selunia", B: "P", c: "ducat", C: "D" },
    { a: "crona", as: "cronas", aC: "Ithria", A: "C", b: "ryal", bs: "ryals", bC: "Ombra", B: "R", c: "lumen", C: "L" },
] as const;

// Currency names whose plural equals the singular ("norn per kess").
const E2_FX_CHANGE_PCT_SCENARIOS = [
    { a: "norn", aC: "Norvia", b: "kess", bC: "Kessland" },
    { a: "vell", aC: "Vellia", b: "tor", bC: "Torland" },
    { a: "quin", aC: "Quinar", b: "orm", bC: "Ormsk" },
] as const;

// Two-good economy shared by the three original real/nominal questions (the
// same economy appears in all three, as in the source design). Good A takes
// the low price draw (2-6), good B the high one (8-15).
const E2_RN_REAL_GROWTH_SCENARIOS = [
    { place: "Miravel", gA: "rye bread", uA: "loaves", uA1: "loaf", lA: "bread", LA: "Bread", gB: "olive oil", uB: "liters", uB1: "liter", lB: "oil", LB: "Oil" },
    { place: "Tarvenna", gA: "goat cheese", uA: "wheels", uA1: "wheel", lA: "cheese", LA: "Cheese", gB: "cider", uB: "casks", uB1: "cask", lB: "cider", LB: "Cider" },
    { place: "Lorsk", gA: "honey", uA: "jars", uA1: "jar", lA: "honey", LA: "Honey", gB: "wool", uB: "bales", uB1: "bale", lB: "wool", LB: "Wool" },
] as const;
const E2_RN_DEFLATOR_SCENARIOS = E2_RN_REAL_GROWTH_SCENARIOS;
const E2_RN_CPI_INFLATION_SCENARIOS = E2_RN_REAL_GROWTH_SCENARIOS;

const E2_II_NOMINAL_WAGE_SCENARIOS = [
    { union: "The dockworkers' union of Port Havelin" },
    { union: "The nurses' union of Brennmark" },
    { union: "The metalworkers' union of Ostvale" },
] as const;

const E2_II_REAL_RATE_SCENARIOS = [
    { product: "A one-year savings deposit in Meridia", noun: "deposit" },
    { product: "A one-year government bond issued by Meridia", noun: "bond" },
    { product: "A one-year fixed-term account at a bank in Calvera", noun: "account" },
] as const;

const E2_GDP_VA_TWO_STAGE_SCENARIOS = [
    { f1: "roastery", F1: "Roastery", imp: "green coffee beans from Brazil", impShort: "beans", prod1: "roasted coffee", prod1Short: "coffee", f2: "café chain", F2: "Café chain", prod2: "drinks" },
    { f1: "tannery", F1: "Tannery", imp: "raw hides from Argentina", impShort: "hides", prod1: "finished leather", prod1Short: "leather", f2: "shoemaker", F2: "Shoemaker", prod2: "shoes" },
    { f1: "cotton mill", F1: "Cotton mill", imp: "raw cotton bales from Egypt", impShort: "cotton bales", prod1: "cloth", prod1Short: "cloth", f2: "tailoring workshop", F2: "Tailoring workshop", prod2: "garments" },
] as const;

const E2_GDP_VA_FIRM_SCENARIOS = [
    { firm: "A furniture maker in Poland", dom: "timber from domestic sawmills", imp: "fittings" },
    { firm: "A bicycle assembler in Portugal", dom: "frames from domestic welders", imp: "gear sets" },
    { firm: "A winery in Spain", dom: "grapes from domestic growers", imp: "oak barrels" },
] as const;

const E2_RN_NOMINAL_GROWTH_SCENARIOS = [
    { place: "The economy of a Japanese island", gA: "rice", uA: "sacks", LA: "Rice", gB: "fish", uB: "crates", LB: "Fish" },
    { place: "The economy of a Norwegian fjord", gA: "potatoes", uA: "sacks", LA: "Potatoes", gB: "salmon", uB: "crates", LB: "Salmon" },
    { place: "The economy of a Canadian island", gA: "apples", uA: "baskets", LA: "Apples", gB: "lobster", uB: "crates", LB: "Lobster" },
] as const;

const E2_RN_REAL_LEVEL_SCENARIOS = [
    { place: "A Danish coastal economy", gA: "butter", uA: "kg", uA1: "kg", gB: "herring", uB: "barrels", uB1: "barrel" },
    { place: "A Swedish lakeside economy", gA: "flour", uA: "kg", uA1: "kg", gB: "crayfish", uB: "crates", uB1: "crate" },
    { place: "A Portuguese coastal economy", gA: "salt", uA: "kg", uA1: "kg", gB: "sardines", uB: "barrels", uB1: "barrel" },
] as const;

const E2_RN_DEFLATOR_INFLATION_SCENARIOS = [
    { place: "A Portuguese island economy", gA: "olives", uA: "crates", uA1: "crate", gB: "cork", uB: "bales", uB1: "bale" },
    { place: "A Spanish highland economy", gA: "almonds", uA: "sacks", uA1: "sack", gB: "wool", uB: "bales", uB1: "bale" },
    { place: "An Italian island economy", gA: "lemons", uA: "crates", uA1: "crate", gB: "wine", uB: "casks", uB1: "cask" },
] as const;

const E2_RN_CPI_LEVEL_SCENARIOS = [
    { place: "an Austrian valley", gA: "bread", uA: "loaves", uA1: "loaf", lA: "bread", gB: "mountain cheese", uB: "wheels", uB1: "wheel", lB: "cheese" },
    { place: "a Belgian town", gA: "beer", uA: "bottles", uA1: "bottle", lA: "beer", gB: "chocolate", uB: "boxes", uB1: "box", lB: "chocolate" },
    { place: "a Polish village", gA: "milk", uA: "liters", uA1: "liter", lA: "milk", gB: "smoked sausage", uB: "rings", uB1: "ring", lB: "sausage" },
] as const;

const E2_II_BORROWER_REAL_SCENARIOS = [
    { name: "Mateus", country: "Brazil" },
    { name: "Ingrid", country: "Norway" },
    { name: "Hana", country: "Japan" },
] as const;

const E2_II_REQUIRED_NOMINAL_SCENARIOS = [
    { investor: "A pension fund in the Netherlands" },
    { investor: "An insurance company in Austria" },
    { investor: "A university endowment in Sweden" },
] as const;

const E2_II_REAL_VALUE_SCENARIOS = [
    { who: "A retiree in Italy", how: "in cash" },
    { who: "A student in Spain", how: "in a drawer" },
    { who: "A shopkeeper in Poland", how: "in the shop safe" },
] as const;

const E2_GM_IMPORT_MULTIPLIER_SCENARIOS = [
    { place: "the open economy of Belgium" },
    { place: "the small open economy of Denmark" },
    { place: "the open economy of Portugal" },
] as const;

const E2_GM_INVESTMENT_SHOCK_SCENARIOS = [
    { shock: "Business confidence in Spain collapses and firms cut investment by" },
    { shock: "A credit crunch in Italy forces firms to cut investment by" },
    { shock: "After a stock-market crash in Sweden, firms cut investment by" },
] as const;

const E2_GM_C0_SHOCK_SCENARIOS = [
    { cause: "After a fall in house prices, households in the Netherlands" },
    { cause: "Alarmed by news of an approaching recession, households in Austria" },
    { cause: "After a wave of layoffs, households in Denmark" },
] as const;

const E2_GM_NEW_EQUILIBRIUM_SCENARIOS = [
    { place: "Portville", cause: "a recession abroad makes investment fall to" },
    { place: "Kestwick", cause: "a banking crisis makes investment fall to" },
    { place: "Sundmar", cause: "a surge in energy prices makes investment fall to" },
] as const;

const E2_GM_TAX_REVENUE_SCENARIOS = [
    { placePoss: "Aldermoor's" },
    { placePoss: "Brightmere's" },
    { placePoss: "Vennock's" },
] as const;

const E2_LM_EFFORT_COST_SCENARIOS = [
    { firm: "A logistics warehouse in Poland", workers: "packers", worker: "packer" },
    { firm: "A call centre in Portugal", workers: "agents", worker: "agent" },
    { firm: "A fruit farm in Spain", workers: "pickers", worker: "picker" },
    { firm: "A hotel in Austria", workers: "cleaners", worker: "cleaner" },
] as const;

const E2_LM_PRICE_SETTING_SCENARIOS = [
    { sector: "the French manufacturing sector" },
    { sector: "the Italian textile sector" },
    { sector: "the Dutch food-processing sector" },
] as const;

const E2_LM_PROFIT_PER_WORKER_SCENARIOS = [
    { sector: "the Italian food industry" },
    { sector: "the Polish furniture industry" },
    { sector: "the Spanish car-parts industry" },
] as const;

const E2_LM_RENT_BENEFIT_CHANGE_SCENARIOS = [
    { who: "A warehouse worker in Austria", subj: "she", poss: "her" },
    { who: "A bus driver in Portugal", subj: "he", poss: "his" },
    { who: "A lab assistant in Denmark", subj: "she", poss: "her" },
] as const;

const E2_IT_SMOOTHING_SCENARIOS = [
    { name: "Élodie", country: "France", subj: "she", poss: "her" },
    { name: "Marco", country: "Italy", subj: "he", poss: "his" },
    { name: "Aiko", country: "Japan", subj: "she", poss: "her" },
] as const;

const E2_IT_MRS_SCENARIOS = [
    { name: "Jonas", poss: "his" },
    { name: "Leila", poss: "her" },
    { name: "Oskar", poss: "his" },
] as const;

const E2_IT_RETURN_SCENARIOS = [
    { name: "Ana", country: "Portugal", subj: "she", obj: "her", poss: "her", venture: "workshop" },
    { name: "Piet", country: "the Netherlands", subj: "he", obj: "him", poss: "his", venture: "fishing boat" },
    { name: "Sanna", country: "Sweden", subj: "she", obj: "her", poss: "her", venture: "farm" },
] as const;

const E2_IT_PV_MAX_SCENARIOS = [
    { name: "Bram", country: "Belgium", subj: "he", obj: "him", poss: "his" },
    { name: "Chiara", country: "Italy", subj: "she", obj: "her", poss: "her" },
    { name: "Emil", country: "Denmark", subj: "he", obj: "him", poss: "his" },
] as const;

const E2_IT_REPAYMENT_SCENARIOS = [
    { name: "Lena", country: "Germany", subj: "she", poss: "her" },
    { name: "Karim", country: "France", subj: "he", poss: "his" },
    { name: "Zofia", country: "Poland", subj: "she", poss: "her" },
] as const;

const E2_TECH_COST_SCENARIOS = [
    { firm: "A brick kiln in Brazil", action: "fires one batch of bricks" },
    { firm: "A bakery in Canada", action: "bakes one batch of bread" },
    { firm: "A paper mill in Sweden", action: "produces one batch of pulp" },
] as const;

const E2_TECH_CHEAPEST_GAP_SCENARIOS = [
    { firm: "A Spanish tile factory", action: "fire one batch" },
    { firm: "A Polish glass factory", action: "melt one batch" },
    { firm: "A Canadian sawmill", action: "dry one batch of timber" },
] as const;

const E2_TECH_PROCESS_INNOVATION_SCENARIOS = [
    { firm: "A glassworks in the Netherlands", action: "melts one batch", energy: "gas", Energy: "Gas" },
    { firm: "A steel forge in Austria", action: "heats one batch of billets", energy: "gas", Energy: "Gas" },
    { firm: "A cold-storage plant in Norway", action: "freezes one batch of fish", energy: "electricity", Energy: "Electricity" },
] as const;

const E2_TECH_FIRST_MOVER_RENT_SCENARIOS = [
    { firms: "breweries", firm: "brewery", town: "a Danish town", verb: "brew" },
    { firms: "bakeries", firm: "bakery", town: "a Belgian town", verb: "bake" },
    { firms: "dairies", firm: "dairy", town: "a Dutch town", verb: "make cheese" },
] as const;

const E2_FX_EXPORT_PRICE_SCENARIOS = [
    { item: "A camera made in Japan", noun: "camera" },
    { item: "A pair of headphones made in Japan", noun: "headphones" },
    { item: "A mechanical keyboard made in Japan", noun: "keyboard" },
    { item: "A ceramic tea set made in Japan", noun: "tea set" },
] as const;

const E2_MB_NETWORTH_SCENARIOS = [
    { bank: "A commercial bank in Spain" },
    { bank: "A savings bank in Austria" },
    { bank: "A cooperative bank in the Netherlands" },
] as const;

const E2_MB_LEVERAGE_SCENARIOS = [
    { bank: "A bank headquartered in France" },
    { bank: "A bank headquartered in Germany" },
    { bank: "An investment bank based in Sweden" },
] as const;

const E2_MB_INSOLVENCY_DROP_SCENARIOS = [
    { bank: "A bank in Italy" },
    { bank: "A mortgage bank in Denmark" },
    { bank: "A regional bank in Poland" },
] as const;

const E2_MB_SPREAD_SCENARIOS = [
    { bank: "A regional bank in Austria" },
    { bank: "A savings bank in Portugal" },
    { bank: "A cooperative bank in Belgium" },
] as const;

const E2_MB_MONEY_CREATION_SCENARIOS = [
    { saver: "A saver", poss: "her", bank: "a Portuguese bank", borrower: "a firm", borrowerPoss: "the firm's" },
    { saver: "A pensioner", poss: "his", bank: "a Dutch bank", borrower: "a bakery", borrowerPoss: "the bakery's" },
    { saver: "A student", poss: "her", bank: "a Polish bank", borrower: "a start-up", borrowerPoss: "the start-up's" },
] as const;

export const econ2Questions: Question[] = [
    // ------------------------------------------------------------ growth rates
    {
        id: "e2-gr-total-growth",
        subject: "econ2",
        topic: "growth_rates",
        difficulty: "very_easy",
        kind: "numeric",
        unit: "percent",
        source: "TUM Economics II SS2018 Q3; SS2019 Q3",
        build: (rng) => {
            const s = rng.pick(E2_GR_TOTAL_GROWTH_SCENARIOS);
            const gdp0 = rng.int(150, 950);
            const c = rng.int(1, 9) * rng.pick([1, -1]);
            const gdp1 = Math.round(gdp0 * (1 + c / 100));
            const pop0 = rng.int(200, 1200) / 10;
            const pop1 = pop0 + rng.int(-15, 15) / 10;
            const answer = (gdp1 / gdp0 - 1) * 100;
            return {
                prompt: `${s.place} reports GDP of ${n(gdp0)} billion in year 1 and ${n(gdp1)} billion in year 2. Its population grows from ${n(pop0)} million to ${n(pop1)} million. What is the growth rate of **total** GDP from year 1 to year 2?`,
                given: {
                    "GDP year 1": `${n(gdp0)} billion`,
                    "GDP year 2": `${n(gdp1)} billion`,
                    "Population year 1": `${n(pop0)} million`,
                    "Population year 2": `${n(pop1)} million`,
                },
                answer,
                explanation: String.raw`$g_Y = \frac{Y_1}{Y_0} - 1$ - total GDP growth ignores the population (that only matters per capita): ${n(gdp1)} / ${n(gdp0)} − 1 = ${pct(answer)}.`,
            };
        },
    },
    {
        id: "e2-gr-gdp-pc-growth",
        subject: "econ2",
        topic: "growth_rates",
        difficulty: "easy",
        kind: "numeric",
        unit: "percent",
        source: "TUM Economics II SS2018 Q3; SS2019 Q3; SS2017 Q2",
        build: (rng) => {
            const s = rng.pick(E2_GR_GDP_PC_GROWTH_SCENARIOS);
            const gdp0 = rng.int(150, 950);
            const gdp1 = gdp0 + rng.int(-Math.floor(gdp0 * 0.08), Math.floor(gdp0 * 0.08));
            const pop0 = rng.int(200, 1200) / 10;
            const pop1 = pop0 + rng.int(-20, 20) / 10;
            const pc0 = gdp0 / pop0;
            const pc1 = gdp1 / pop1;
            const answer = (pc1 / pc0 - 1) * 100;
            return {
                prompt: `${s.office} reports GDP of ${n(gdp0)} billion in year 1 and ${n(gdp1)} billion in year 2, with a population of ${n(pop0)} million in year 1 and ${n(pop1)} million in year 2. What is the growth rate of GDP **per capita**?`,
                given: {
                    "GDP year 1": `${n(gdp0)} billion`,
                    "GDP year 2": `${n(gdp1)} billion`,
                    "Population year 1": `${n(pop0)} million`,
                    "Population year 2": `${n(pop1)} million`,
                },
                answer,
                explanation: String.raw`$g_{pc} = \frac{Y_1 / N_1}{Y_0 / N_0} - 1$ - divide each year's GDP by that year's population first. GDP per capita is ${n2(pc0)} thousand in year 1 and ${n2(pc1)} thousand in year 2, so it grows by ${n2(pc1)} / ${n2(pc0)} − 1 = ${pct(answer)}. Using the same population for both years is the classic mistake.`,
            };
        },
    },

    // --------------------------------------------------------- GDP accounting
    {
        id: "e2-gdp-value-added",
        subject: "econ2",
        topic: "gdp_accounting",
        difficulty: "medium",
        kind: "numeric",
        unit: "EUR",
        source: "TUM Economics II SS2018 Q4; SS2019 Q2; SS2017 Q16",
        build: (rng) => {
            const s = rng.pick(E2_GDP_VALUE_ADDED_SCENARIOS);
            const m1 = rng.int(1, 4) * 5000;
            const s1 = m1 + rng.int(4, 12) * 5000;
            const m2 = rng.int(1, 3) * 5000;
            const s2 = s1 + m2 + rng.int(6, 16) * 5000;
            const frac = rng.pick([0.5, 0.75, 0.8] as const);
            const buy3 = frac * s2;
            const s3 = buy3 + rng.int(8, 20) * 5000;
            const w1 = rng.int(2, 6) * 1000;
            const w2 = rng.int(3, 8) * 1000;
            const k2 = rng.int(2, 6) * 1000;
            const va1 = s1 - m1;
            const va2 = s2 - s1 - m2;
            const va3 = s3 - buy3;
            const answer = va1 + va2 + va3;
            return {
                prompt: `The economy of ${s.place} has exactly three producers. ${s.art1} **${s.s1}** imports ${s.imp1} for ${eur(m1)} and sells ${s.sale1} to the ${s.s2} for ${eur(s1)}; ${s.subj1} pays ${eur(w1)} in wages. The **${s.s2}** additionally imports ${s.imp2} for ${eur(m2)} and sells ${s.prod2} worth ${eur(s2)} - ${pct(frac * 100)} of it to the ${s.s3}, the rest directly to households; it pays ${eur(w2)} in wages and ${eur(k2)} in capital costs. The **${s.s3}** ${s.make3} sold for ${eur(s3)}, half of them exported. What is ${s.place}'s GDP?`,
                given: {
                    [`${s.L1}: imported ${s.imp1}`]: eur(m1),
                    [`${s.L1}: sales to ${s.s2}`]: eur(s1),
                    [`${s.L2}: imported ${s.imp2}`]: eur(m2),
                    [`${s.L2}: total sales`]: eur(s2),
                    [`Share of ${s.s2} output sold to ${s.s3}`]: pct(frac * 100),
                    [`${s.L3}: sales`]: eur(s3),
                },
                answer,
                explanation: String.raw`$GDP = \sum_i VA_i = \sum_i \left( \text{sales}_i - \text{intermediate inputs}_i \right)$ - imported inputs are subtracted at the stage that buys them, and wages or capital costs only distribute the value added, they never enter the sum. ${s.L1}: ${eur(s1)} − ${eur(m1)} = ${eur(va1)}. ${s.L2}: ${eur(s2)} − ${eur(s1)} − ${eur(m2)} = ${eur(va2)}. ${s.L3}: it bought ${pct(frac * 100)} of the ${s.s2}'s output, i.e. ${eur(buy3)}, so ${eur(s3)} − ${eur(buy3)} = ${eur(va3)}. GDP = ${eur(answer)}. Whether output goes to households, downstream firms or exports does not change any firm's value added.`,
            };
        },
    },

    // ------------------------------------------------------ technology & R&D
    {
        id: "e2-tech-switch-rent",
        subject: "econ2",
        topic: "technology_rd",
        difficulty: "medium",
        kind: "numeric",
        unit: "EUR",
        source: "TUM Economics II SS2018 Q8; SS2019 Q6; SS2017 Q4",
        build: (rng) => {
            const s = rng.pick(E2_TECH_SWITCH_RENT_SCENARIOS);
            const lA = rng.int(1, 3);
            const dl = rng.int(2, 4);
            const lB = lA + dl;
            const eB = rng.int(2, 5);
            const de = rng.int(3, 6);
            const eA = eB + de;
            const wm = rng.int(2, 5);
            const w = de * wm;
            const thr = dl * wm; // gas price at which A and B cost the same
            const pHigh = thr + rng.int(1, 4);
            const pLow = rng.int(1, thr - 1);
            const costAOld = eA * pHigh + lA * w;
            const costBOld = eB * pHigh + lB * w;
            const costANew = eA * pLow + lA * w;
            const costBNew = eB * pLow + lB * w;
            const answer = costBNew - costANew;
            return {
                prompt: `${s.firm} can ${s.batch} with technique **A** (${n(eA)} units of ${s.energy}, ${plural(lA, "worker-day")}) or technique **B** (${n(eB)} units of ${s.energy}, ${plural(lB, "worker-day")}). A worker-day costs ${eur(w)}. At the old ${s.energy} price of ${eur(pHigh)} per unit the firm correctly chose technique B. The ${s.energy} price now falls to ${eur(pLow)} per unit while the wage stays put. What is the rent per batch from switching to technique A?`,
                given: {
                    "Technique A": `${n(eA)} ${s.energy} + ${plural(lA, "worker-day")}`,
                    "Technique B": `${n(eB)} ${s.energy} + ${plural(lB, "worker-day")}`,
                    "Wage per worker-day": eur(w),
                    [`Old ${s.energy} price`]: eur(pHigh),
                    [`New ${s.energy} price`]: eur(pLow),
                },
                answer,
                explanation: String.raw`$c_T = e_T \cdot p_{${s.energy}} + l_T \cdot w$ per technique, and the switching rent is the cost difference at the **new** prices. Old price: A costs ${eur(costAOld)}, B costs ${eur(costBOld)} - B was the right choice. New price: A costs ${eur(costANew)}, B costs ${eur(costBNew)}. Switching to the ${s.energy}-intensive technique A now saves ${eur(costBNew)} − ${eur(costANew)} = ${eur(answer)} per batch.`,
                hint: String.raw`A technique costs each of its inputs times that input's price, and the rent from switching is how much cheaper the new technique is than the one in use - evaluated at the prices that hold now, not at the old ones: $c_T = e_T \cdot p + l_T \cdot w$.`,
            };
        },
    },
    {
        id: "e2-tech-mpl",
        subject: "econ2",
        topic: "technology_rd",
        difficulty: "easy",
        kind: "numeric",
        unit: "number",
        source: "TUM Economics II SS2019, Q4",
        build: (rng) => {
            const s = rng.pick(E2_TECH_MPL_SCENARIOS);
            const a = rng.int(2, 5);
            const aL = rng.int(2, 3);
            const aK = rng.int(2, 3);
            const L0 = rng.int(2, 4);
            const K0 = rng.int(2, 3);
            const answer = a * aL * L0 ** (aL - 1) * K0 ** aK;
            const lTerm = aL - 1 === 1 ? "L" : `L^{${aL - 1}}`;
            return {
                prompt: String.raw`${s.firm} produces with $Y = ${a} L^{${aL}} K^{${aK}}$, where $L$ is labor and $K$ is capital. What is the **marginal product of labor** at $L = ${L0}$ and $K = ${K0}$?`,
                given: {
                    "Production function": String.raw`$Y = ${a} L^{${aL}} K^{${aK}}$`,
                    "Labor input L": n(L0),
                    "Capital input K": n(K0),
                },
                answer,
                explanation: String.raw`$MPL = \frac{\partial Y}{\partial L}$ - differentiate with respect to labor only: $MPL = ${a * aL} \, ${lTerm} K^{${aK}}$. At $L = ${L0}$, $K = ${K0}$ this gives ${n(a * aL)} · ${n(L0 ** (aL - 1))} · ${n(K0 ** aK)} = ${n(answer)}.`,
            };
        },
    },
    {
        id: "e2-rd-private-optimum",
        subject: "econ2",
        topic: "technology_rd",
        difficulty: "medium",
        kind: "numeric",
        unit: "number",
        source: "TUM Economics II SS2017, Q10",
        build: (rng) => {
            const s = rng.pick(E2_RD_PRIVATE_OPTIMUM_SCENARIOS);
            const h = rng.int(3, 7);
            const m = 2 * h;
            const answer = h * h; // (m/2)²
            const dTotal = m * (1.5 * h); // output at the symmetric optimum
            return {
                prompt: String.raw`${s.labs}, each choose research spending $C_i$ (in million €, at a cost of 1 per unit). Research spills over: lab $i$ obtains $D_i = ${m}\left(\sqrt{C_i} + \tfrac{1}{2}\sqrt{C_j}\right)$ ${s.items}, and each ${s.item} earns a profit of 1 million €. Each lab maximizes its own profit, taking the rival's spending as given. What research spending $C_i$ does each lab choose?`,
                given: {
                    [`${s.Items} of lab i`]: String.raw`$D_i = ${m}\left(\sqrt{C_i} + \tfrac{1}{2}\sqrt{C_j}\right)$`,
                    [`Profit per ${s.item}`]: `${n(1)} million €`,
                    "Cost per unit of research": `${n(1)} million €`,
                },
                answer,
                explanation: String.raw`$\frac{\partial D_i}{\partial C_i} = \frac{m}{2\sqrt{C_i}} = 1$ - each lab spends until its **own** marginal ${s.item} output equals the marginal research cost; the spillover onto the rival is ignored. With $m = ${m}$: $\sqrt{C_i^*} = ${n(m)}/2 = ${n(h)}$, so $C_i^* = ${n(answer)}$. Each lab then produces ${n(dTotal)} ${s.plural}.`,
            };
        },
    },
    {
        id: "e2-rd-subsidy",
        subject: "econ2",
        topic: "technology_rd",
        difficulty: "hard",
        kind: "numeric",
        unit: "number",
        source: "TUM Economics II SS2017, Q11",
        build: (rng) => {
            const s = rng.pick(E2_RD_SUBSIDY_SCENARIOS);
            const sPct = rng.pick([20, 50] as const);
            const m = sPct === 20 ? rng.pick([8, 24] as const) : 2 * rng.int(2, 6);
            const netCost = 1 - sPct / 100;
            const sqrtC = m / (2 * netCost);
            const answer = sqrtC * sqrtC;
            const cPrivate = (m / 2) ** 2;
            return {
                prompt: String.raw`${s.labs} each choose research spending $C_i$ (in million €, at a cost of 1 per unit) and obtain $D_i = ${m}\left(\sqrt{C_i} + \tfrac{1}{2}\sqrt{C_j}\right)$ ${s.items}, each worth a profit of 1 million €. To correct the underinvestment caused by the spillover, the government now covers ${pct(sPct)} of every euro spent on research. What research spending $C_i$ does each lab choose **with** the subsidy?`,
                given: {
                    [`${s.Items} of lab i`]: String.raw`$D_i = ${m}\left(\sqrt{C_i} + \tfrac{1}{2}\sqrt{C_j}\right)$`,
                    [`Profit per ${s.item}`]: `${n(1)} million €`,
                    "Research subsidy": pct(sPct),
                },
                answer,
                explanation: String.raw`$\frac{m}{2\sqrt{C_i}} = 1 - \sigma$ - the subsidy lowers the marginal cost of research from 1 to $1 - \sigma$. With $m = ${m}$ and $\sigma = ${n(sPct / 100)}$: $\sqrt{C_i} = ${n(m)} / (2 \cdot ${n(netCost)}) = ${n(sqrtC)}$, so $C_i = ${n(answer)}$ - up from the unsubsidized optimum of ${n(cPrivate)}.`,
            };
        },
    },
    {
        id: "e2-rd-merger",
        subject: "econ2",
        topic: "technology_rd",
        difficulty: "hard",
        kind: "numeric",
        unit: "number",
        source: "TUM Economics II SS2017, Q12",
        build: (rng) => {
            const s = rng.pick(E2_RD_MERGER_SCENARIOS);
            const h = rng.pick([2, 3, 5] as const);
            const m = 4 * h;
            const answer = 9 * h * h; // (3m/4)²
            const cPrivate = (m / 2) ** 2;
            return {
                prompt: String.raw`${s.labs} each choose research spending $C_i$ (in million €, at a cost of 1 per unit) and obtain $D_i = ${m}\left(\sqrt{C_i} + \tfrac{1}{2}\sqrt{C_j}\right)$ ${s.items}, each worth a profit of 1 million €. The labs now **merge** and choose both research budgets to maximize their **joint** profit. What spending $C_i$ does the merged firm pick for each lab?`,
                given: {
                    [`${s.Items} of lab i`]: String.raw`$D_i = ${m}\left(\sqrt{C_i} + \tfrac{1}{2}\sqrt{C_j}\right)$`,
                    [`Profit per ${s.item}`]: `${n(1)} million €`,
                },
                answer,
                explanation: String.raw`$\frac{\partial (D_i + D_j)}{\partial C_i} = \frac{m}{2\sqrt{C_i}} + \frac{m}{4\sqrt{C_i}} = \frac{3m}{4\sqrt{C_i}} = 1$ - after the merger, a euro spent in lab $i$ also raises lab $j$'s output, and that extra benefit is counted. With $m = ${m}$: $\sqrt{C_i} = 3 \cdot ${n(m)} / 4 = ${n(3 * h)}$, so $C_i = ${n(answer)}$ per lab, versus ${n(cPrivate)} before the merger. Total output rises by ${pct(50)}.`,
                hint: String.raw`A single owner counts what a euro of research in one lab adds in **both** labs, so the cross effect that a rival would ignore enters the first-order condition: $\frac{\partial (D_i + D_j)}{\partial C_i} = 1$.`,
            };
        },
    },

    // ------------------------------------------------- goods market & fiscal
    {
        id: "e2-gm-equilibrium-output",
        subject: "econ2",
        topic: "goods_market",
        difficulty: "easy",
        kind: "numeric",
        unit: "number",
        source: "TUM Economics II SS2018 Q10; SS2019 Q7; SS2017 Q19",
        build: (rng) => {
            const s = rng.pick(E2_GM_EQUILIBRIUM_OUTPUT_SCENARIOS);
            const d = drawGoodsMarket(rng);
            const autonomous = d.c0 + d.I + d.G + d.X - d.M;
            return {
                prompt: String.raw`In ${s.place}, consumption follows $C = c_0 + c_1 (1 - t) Y$ with $c_0 = ${n(d.c0)}$ and $c_1 = ${n(d.c1)}$; the income tax rate is ${pct(d.t * 100)}. Investment is ${n(d.I)}, government purchases are ${n(d.G)}, exports are ${n(d.X)} and imports are ${n(d.M)} (all exogenous). What is the equilibrium output $Y$?`,
                given: goodsMarketGiven(d),
                answer: d.Y,
                explanation: String.raw`$Y = \frac{c_0 + I + G + X - M}{1 - c_1 (1 - t)}$ - collect the $Y$ terms of $Y = C + I + G + X - M$ on one side. Autonomous demand is ${n(d.c0)} + ${n(d.I)} + ${n(d.G)} + ${n(d.X)} − ${n(d.M)} = ${n(autonomous)}, the multiplier denominator is 1 − ${n(d.c1)} · ${n(1 - d.t)} = ${n(d.D)}, so Y = ${n(autonomous)} / ${n(d.D)} = ${n(d.Y)}.`,
            };
        },
    },
    {
        id: "e2-gm-consumption",
        subject: "econ2",
        topic: "goods_market",
        difficulty: "medium",
        kind: "numeric",
        unit: "number",
        source: "TUM Economics II SS2018 Q10; SS2017 Q19",
        build: (rng) => {
            const s = rng.pick(E2_GM_CONSUMPTION_SCENARIOS);
            const d = drawGoodsMarket(rng);
            const answer = d.c0 + d.c1 * (1 - d.t) * d.Y;
            return {
                prompt: String.raw`${s.place} has consumption $C = c_0 + c_1 (1 - t) Y$ with $c_0 = ${n(d.c0)}$, $c_1 = ${n(d.c1)}$ and an income tax rate of ${pct(d.t * 100)}. Investment is ${n(d.I)}, government purchases ${n(d.G)}, exports ${n(d.X)}, imports ${n(d.M)}. What is **consumption** in the goods-market equilibrium?`,
                given: goodsMarketGiven(d),
                answer,
                explanation: String.raw`$C = c_0 + c_1 (1 - t) \cdot Y^*$ - first solve for equilibrium output, then feed it into the consumption function. $Y^* = \frac{c_0 + I + G + X - M}{1 - c_1(1-t)}$ = ${n(d.c0 + d.I + d.G + d.X - d.M)} / ${n(d.D)} = ${n(d.Y)}. Then C = ${n(d.c0)} + ${n(d.c1)} · ${n(1 - d.t)} · ${n(d.Y)} = ${n(answer)}.`,
            };
        },
    },
    {
        id: "e2-gm-multiplier",
        subject: "econ2",
        topic: "goods_market",
        difficulty: "medium",
        kind: "numeric",
        unit: "number",
        source: "TUM Economics II SS2018 Q11; SS2019 Q8",
        build: (rng) => {
            const s = rng.pick(E2_GM_MULTIPLIER_SCENARIOS);
            const c1 = rng.pick([0.4, 0.5, 0.6, 0.75, 0.8] as const);
            const t = rng.pick([0.2, 0.25, 0.5] as const);
            const dG = 25 * rng.int(2, 12);
            const D = 1 - c1 * (1 - t);
            const mult = 1 / D;
            const answer = dG * mult;
            return {
                prompt: String.raw`In ${s.place}, consumption follows $C = c_0 + c_1 (1 - t) Y$ with $c_1 = ${n(c1)}$ and a tax rate of ${pct(t * 100)}. ${s.stimulus} ${n(dG)}. By how much does equilibrium output rise?`,
                given: {
                    "Marginal propensity to consume $c_1$": n(c1),
                    "Income tax rate t": pct(t * 100),
                    "Increase in G": n(dG),
                },
                answer,
                explanation: String.raw`$\Delta Y = \frac{1}{1 - c_1 (1 - t)} \cdot \Delta G$ - the fiscal multiplier times the spending change. The multiplier is 1 / (1 − ${n(c1)} · ${n(1 - t)}) = 1 / ${n(D)} = ${n2(mult)}, so ΔY = ${n2(mult)} · ${n(dG)} = ${n2(answer)}.`,
            };
        },
    },
    {
        id: "e2-gm-budget-balance",
        subject: "econ2",
        topic: "goods_market",
        difficulty: "medium",
        kind: "numeric",
        unit: "number",
        source: "TUM Economics II SS2018 Q11; SS2019 Q7",
        build: (rng) => {
            const s = rng.pick(E2_GM_BUDGET_BALANCE_SCENARIOS);
            const d = drawGoodsMarket(rng);
            const answer = d.t * d.Y - d.G;
            return {
                prompt: String.raw`${s.placePoss} consumption is $C = c_0 + c_1 (1 - t) Y$ with $c_0 = ${n(d.c0)}$, $c_1 = ${n(d.c1)}$ and a proportional income tax of ${pct(d.t * 100)}. Investment is ${n(d.I)}, government purchases ${n(d.G)}, exports ${n(d.X)}, imports ${n(d.M)}. What is the government's **budget balance** in equilibrium? (Negative = deficit.)`,
                given: goodsMarketGiven(d),
                answer,
                explanation: String.raw`$BB = t \cdot Y^* - G$ - tax revenue at equilibrium output minus purchases. First $Y^* = \frac{c_0 + I + G + X - M}{1 - c_1(1-t)}$ = ${n(d.c0 + d.I + d.G + d.X - d.M)} / ${n(d.D)} = ${n(d.Y)}. Then BB = ${n(d.t)} · ${n(d.Y)} − ${n(d.G)} = ${n(answer)}.`,
                hint: String.raw`The budget balance is what the proportional income tax brings in at equilibrium output, minus what the government spends - so the goods market has to be solved first: $BB = t \cdot Y^* - G$.`,
            };
        },
    },
    {
        id: "e2-gm-balanced-budget-tax",
        subject: "econ2",
        topic: "goods_market",
        difficulty: "very_hard",
        kind: "numeric",
        unit: "percent",
        source: "TUM Economics II SS2018 Q12; SS2019 Q9; SS2017 Q20",
        build: (rng) => {
            const s = rng.pick(E2_GM_BALANCED_BUDGET_TAX_SCENARIOS);
            const c1 = rng.pick([0.4, 0.5, 0.6, 0.75] as const);
            const tPct = rng.pick([20, 25, 30, 40] as const);
            const Y = 400 * rng.int(5, 15);
            const A = Math.round(Y * (1 - c1) * (1 - tPct / 100)); // c0 + I + NX
            const c0 = 25 * rng.int(2, Math.floor(A / 75));
            const NX = 25 * rng.int(0, Math.floor(A / 100));
            const I = A - c0 - NX;
            const G = (tPct / 100) * Y;
            return {
                prompt: String.raw`${s.placePoss} consumption is $C = c_0 + c_1 (1 - t) Y$ with $c_0 = ${n(c0)}$ and $c_1 = ${n(c1)}$. Investment is ${n(I)} and net exports are ${n(NX)}. The government must run a strictly **balanced budget**, so its purchases equal its tax revenue: $G = t \cdot Y$. Which tax rate $t$ makes the equilibrium output come out at exactly ${n(Y)}?`,
                given: {
                    "Autonomous consumption $c_0$": n(c0),
                    "Marginal propensity to consume $c_1$": n(c1),
                    "Investment I": n(I),
                    "Net exports NX": n(NX),
                    "Target output Y": n(Y),
                    "Budget rule": String.raw`$G = t \cdot Y$`,
                },
                answer: tPct,
                explanation: String.raw`$Y = c_0 + c_1 (1 - t) Y + I + t \cdot Y + NX$ - substitute the budget rule $G = tY$ into the equilibrium condition, then solve for $t$: $t = 1 - \frac{c_0 + I + NX}{(1 - c_1) \, Y}$. With $c_0 + I + NX$ = ${n(A)} and $(1 - c_1) Y$ = ${n(1 - c1)} · ${n(Y)} = ${n((1 - c1) * Y)}: t = 1 − ${n(A)} / ${n((1 - c1) * Y)} = ${n(tPct / 100)}, i.e. ${pct(tPct)}. Government purchases are then G = ${n(G)}.`,
            };
        },
    },

    // ------------------------------------------ labor market: efficiency wages
    {
        id: "e2-lm-efficiency-wage",
        subject: "econ2",
        topic: "labor_market",
        difficulty: "medium",
        kind: "numeric",
        unit: "EUR",
        source: "TUM Economics II SS2018 Q16; SS2019 Q15",
        build: (rng) => {
            const s = rng.pick(E2_LM_EFFICIENCY_WAGE_SCENARIOS);
            // Explicit (a, rt) allowlist keeps w*, e* and p integer.
            const [a, rt] = rng.pick([
                [2, 1], [2, 2], [2, 3],
                [4, 2], [4, 3],
                [6, 1], [6, 3],
                [8, 1], [8, 2], [8, 3],
            ] as const);
            const b = (a * rt) / 2;
            const answer = rt * rt;
            const eStar = a * rt - b; // = b
            return {
                prompt: String.raw`${s.firm} observes that its workers' effort depends on the hourly wage $w$ (in €): $e(w) = ${n(a)}\sqrt{w} - ${n(b)}$. Output is proportional to effort. What **efficiency wage** does the firm set?`,
                given: {
                    "Effort function": String.raw`$e(w) = ${n(a)}\sqrt{w} - ${n(b)}$`,
                },
                answer,
                explanation: String.raw`$e'(w) \cdot w = e(w)$ - the Solow condition: at the efficiency wage, the elasticity of effort with respect to the wage is one. Here $\frac{${n(a)}}{2\sqrt{w}} \cdot w = ${n(a)}\sqrt{w} - ${n(b)}$, so $\frac{${n(a)}}{2}\sqrt{w} = ${n(b)}$ and $\sqrt{w^*} = ${n((2 * b) / a)}$, giving $w^*$ = ${eur(answer)} with effort $e(w^*) = ${n(eStar)}$.`,
                hint: String.raw`The efficiency wage is the wage that buys a unit of effort most cheaply, $\min_w \frac{w}{e(w)}$; the first-order condition makes the elasticity of effort with respect to the wage equal to one: $e'(w) \cdot w = e(w)$.`,
            };
        },
    },
    {
        id: "e2-lm-unemployment",
        subject: "econ2",
        topic: "labor_market",
        difficulty: "hard",
        kind: "numeric",
        unit: "percent",
        source: "TUM Economics II SS2018 Q17; SS2019 Q16",
        build: (rng) => {
            const s = rng.pick(E2_LM_UNEMPLOYMENT_SCENARIOS);
            const cfg = rng.pick(EW_CONFIGS);
            const { b, w, e, p, L } = ewDerived(cfg);
            const answer = ((cfg.Ls - L) / cfg.Ls) * 100;
            return {
                prompt: String.raw`${s.town} is a company town: ${s.firm} is the only employer, and ${n(cfg.Ls)} people supply labor. Production is $Y = \sqrt{e \cdot L}$ (${s.units}), sold at ${eur(p)} per ${s.unit}. Worker effort is $e(w) = ${n(cfg.a)}\sqrt{w} - ${n(b)}$. ${cap(s.firm)} freely chooses the wage and the number of workers to maximize profit. What is the unemployment rate in ${s.town}?`,
                given: {
                    "Labor supply": `${n(cfg.Ls)} workers`,
                    "Production function": String.raw`$Y = \sqrt{e \cdot L}$`,
                    "Output price p": eur(p),
                    "Effort function": String.raw`$e(w) = ${n(cfg.a)}\sqrt{w} - ${n(b)}$`,
                },
                answer,
                explanation: String.raw`$e'(w) \cdot w = e(w)$ pins the wage, then labor demand follows from $p \cdot \frac{\partial Y}{\partial L} = w$. Solow condition: $\frac{${n(cfg.a)}}{2}\sqrt{w} = ${n(b)}$ gives $w^*$ = ${eur(w)} and effort $e^* = ${n(e)}$. Labor demand: $\frac{p}{2}\sqrt{e/L} = w$ solves to $L = \frac{p^2 e}{4 w^2}$ = ${n(p ** 2)} · ${n(e)} / ${n(4 * w * w)} = ${n(L)}. Unemployment: (${n(cfg.Ls)} − ${n(L)}) / ${n(cfg.Ls)} = ${pct(answer)}.`,
            };
        },
    },
    {
        id: "e2-lm-profit",
        subject: "econ2",
        topic: "labor_market",
        difficulty: "hard",
        kind: "numeric",
        unit: "EUR",
        source: "TUM Economics II SS2018 Q18; SS2019 Q17",
        build: (rng) => {
            const s = rng.pick(E2_LM_PROFIT_SCENARIOS);
            const cfg = rng.pick(EW_CONFIGS);
            const { b, w, e, p, L } = ewDerived(cfg);
            const revenue = p * Math.sqrt(e * L);
            const answer = revenue - w * L;
            return {
                prompt: String.raw`${s.firm} faces a labor supply of ${n(cfg.Ls)} workers. It produces $Y = \sqrt{e \cdot L}$ ${s.units}, sold at ${eur(p)} each, and worker effort follows $e(w) = ${n(cfg.a)}\sqrt{w} - ${n(b)}$. ${cap(s.short)} sets the wage and employment to maximize profit. What is ${s.short}'s **profit**?`,
                given: {
                    "Labor supply": `${n(cfg.Ls)} workers`,
                    "Production function": String.raw`$Y = \sqrt{e \cdot L}$`,
                    "Output price p": eur(p),
                    "Effort function": String.raw`$e(w) = ${n(cfg.a)}\sqrt{w} - ${n(b)}$`,
                },
                answer,
                explanation: String.raw`$\Pi = p \cdot \sqrt{e \cdot L} - w \cdot L$ - revenue minus the wage bill at the optimum. The Solow condition $e'(w) w = e(w)$ gives $w^*$ = ${eur(w)} and $e^* = ${n(e)}$; labor demand $L = \frac{p^2 e}{4w^2}$ = ${n(L)}. Revenue: ${eur(p)} · ${n(Math.sqrt(e * L))} = ${eur(revenue)}; wage bill: ${eur(w)} · ${n(L)} = ${eur(w * L)}. Profit = ${eur(answer)} - exactly equal to the wage bill, because the first-order condition makes revenue twice the labor cost.`,
            };
        },
    },
    {
        id: "e2-lm-minimum-wage",
        subject: "econ2",
        topic: "labor_market",
        difficulty: "very_hard",
        kind: "numeric",
        unit: "percent",
        source: "TUM Economics II SS2018, Q20",
        build: (rng) => {
            const s = rng.pick(E2_LM_MINIMUM_WAGE_SCENARIOS);
            const cfg = rng.pick(EW_CONFIGS);
            const { b, p } = ewDerived(cfg);
            const j = rng.int(1, 2);
            const wMin = (cfg.rt + j) ** 2;
            const eMin = cfg.a * (cfg.rt + j) - b;
            const LMin = (p * p * eMin) / (4 * wMin * wMin);
            const answer = ((cfg.Ls - LMin) / cfg.Ls) * 100;
            return {
                prompt: String.raw`${s.firm} is the only employer of the ${n(cfg.Ls)} workers of ${s.town}. It produces $Y = \sqrt{e \cdot L}$ ${s.units} at a price of ${eur(p)} per ton; effort is $e(w) = ${n(cfg.a)}\sqrt{w} - ${n(b)}$. The government now imposes a **minimum wage** of ${eur(wMin)} per hour, and the firm pays exactly this wage. What is the unemployment rate under the minimum wage?`,
                given: {
                    "Labor supply": `${n(cfg.Ls)} workers`,
                    "Production function": String.raw`$Y = \sqrt{e \cdot L}$`,
                    "Output price p": eur(p),
                    "Effort function": String.raw`$e(w) = ${n(cfg.a)}\sqrt{w} - ${n(b)}$`,
                    "Minimum wage": eur(wMin),
                },
                answer,
                explanation: String.raw`$L = \frac{p^2 \, e(w^{min})}{4 \, (w^{min})^2}$ - the wage is no longer chosen, so only the labor-demand condition $p \cdot \frac{\partial Y}{\partial L} = w^{min}$ applies, with effort evaluated at the imposed wage. Effort: $e(${n(wMin)}) = ${n(cfg.a)} \cdot ${n(cfg.rt + j)} - ${n(b)} = ${n(eMin)}$. Employment: ${n(p ** 2)} · ${n(eMin)} / ${n(4 * wMin * wMin)} = ${n2(LMin)}. Unemployment: (${n(cfg.Ls)} − ${n2(LMin)}) / ${n(cfg.Ls)} = ${pct(answer)} - the minimum wage raises effort but cuts employment sharply, because beyond the efficiency wage effort per euro falls.`,
                hint: String.raw`Once the wage is imposed from outside, the firm no longer chooses it: only the labor-demand condition is left, with effort evaluated at the wage actually paid. Unemployment is the share of the labor supply left without a job: $p \cdot \frac{\partial Y}{\partial L} = w$.`,
            };
        },
    },
    {
        id: "e2-lm-rent-hourly",
        subject: "econ2",
        topic: "labor_market",
        difficulty: "easy",
        kind: "numeric",
        unit: "EUR",
        source: "TUM Economics II SS2019, Q12",
        build: (rng) => {
            const s = rng.pick(E2_LM_RENT_HOURLY_SCENARIOS);
            const w = rng.int(12, 30);
            const d = rng.int(3, 8);
            const im = rng.int(1, 3);
            const ps = rng.int(1, 3);
            const H = rng.pick([35, 38, 40] as const);
            const bh = rng.int(1, w - d - 2);
            const B = bh * H;
            const answer = w - d + im + ps - bh;
            return {
                prompt: `${s.who} earns ${eur(w)} per hour for ${n(H)} hours a week. Working costs ${s.obj} the equivalent of ${eur(d)} per hour in effort, but ${s.subj} genuinely enjoys the job - worth ${eur(im)} per hour to ${s.obj} - and being unemployed would additionally burden ${s.obj} psychologically by ${eur(ps)} per hour of lost work. If ${s.subj} lost the job, unemployment benefits would pay ${s.obj} ${eur(B)} per week. What is ${s.poss} **employment rent per hour** worked?`,
                given: {
                    "Hourly wage": eur(w),
                    "Hours per week": n(H),
                    "Disutility of effort (per hour)": eur(d),
                    "Intrinsic enjoyment (per hour)": eur(im),
                    "Psychological cost of unemployment (per hour)": eur(ps),
                    "Unemployment benefit (per week)": eur(B),
                },
                answer,
                explanation: String.raw`$R_h = w - d + i + \psi - \frac{B}{H}$ - what an hour of this job is worth beyond ${s.poss} next-best alternative: the wage, minus effort disutility, plus intrinsic enjoyment, plus the avoided psychological cost, minus the benefits ${s.subj} forgoes per hour. The benefit is worth ${eur(B)} / ${n(H)} = ${eur(bh)} per hour, so $R_h$ = ${eur(w)} − ${eur(d)} + ${eur(im)} + ${eur(ps)} − ${eur(bh)} = ${eur(answer)}.`,
            };
        },
    },
    {
        id: "e2-lm-rent-total",
        subject: "econ2",
        topic: "labor_market",
        difficulty: "medium",
        kind: "numeric",
        unit: "EUR",
        source: "TUM Economics II SS2018 Q21; SS2019 Q13",
        build: (rng) => {
            const s = rng.pick(E2_LM_RENT_TOTAL_SCENARIOS);
            const w = rng.int(12, 30);
            const d = rng.int(3, 8);
            const H = rng.pick([35, 38, 40] as const);
            const bh = rng.int(1, w - d - 2);
            const B = bh * H;
            const weeks = rng.int(20, 45);
            const rentH = w - d - bh;
            const answer = rentH * H * weeks;
            return {
                prompt: `${s.who} earns ${eur(w)} per hour and works ${n(H)} hours a week; the effort costs ${s.obj} the equivalent of ${eur(d)} per hour. If ${s.subj} were dismissed, benefits would pay ${eur(B)} per week, and ${s.subj} would expect to stay unemployed for ${n(weeks)} weeks before finding an equivalent job. What is ${s.poss} **total employment rent**?`,
                given: {
                    "Hourly wage": eur(w),
                    "Hours per week": n(H),
                    "Disutility of effort (per hour)": eur(d),
                    "Unemployment benefit (per week)": eur(B),
                    "Expected unemployment duration": `${n(weeks)} weeks`,
                },
                answer,
                explanation: String.raw`$R = \left( w - d - \frac{B}{H} \right) \cdot H \cdot T$ - the hourly rent, scaled up by the hours per week and the expected weeks of unemployment. Hourly rent: ${eur(w)} − ${eur(d)} − ${eur(B)} / ${n(H)} = ${eur(rentH)}. Total: ${eur(rentH)} · ${n(H)} · ${n(weeks)} = ${eur(answer)}.`,
                hint: String.raw`The employment rent is what the job is worth beyond the next-best alternative: per hour the wage less the disutility of effort and less the benefit given up, accumulated over the hours of the expected unemployment spell - $R = \left( w - d - \frac{B}{H} \right) \cdot H \cdot T$.`,
            };
        },
    },

    // ------------------------------------------------------------ intertemporal
    {
        id: "e2-it-interest-rate",
        subject: "econ2",
        topic: "intertemporal",
        difficulty: "very_easy",
        kind: "numeric",
        unit: "percent",
        source: "TUM Economics II SS2018 Q23; SS2017 Q13",
        build: (rng) => {
            const s = rng.pick(E2_IT_INTEREST_RATE_SCENARIOS);
            const c1max = rng.int(2, 6) * 20;
            const r = rng.int(1, 8) * 5;
            const c2max = c1max * (1 + r / 100);
            return {
                prompt: `${s.name} plans ${s.poss} consumption over this year and next year and can borrow or save freely at ${s.poss} bank. If ${s.subj} consumed everything **this year**, ${s.subj} could consume at most ${n(c1max)} thousand €; if ${s.subj} consumed everything **next year**, at most ${n(c2max)} thousand €. What interest rate is ${s.subj} facing?`,
                given: {
                    "Maximum consumption this year": `${n(c1max)} thousand €`,
                    "Maximum consumption next year": `${n(c2max)} thousand €`,
                },
                answer: r,
                explanation: String.raw`$1 + r = \frac{C_2^{max}}{C_1^{max}}$ - the two intercepts of the intertemporal budget line differ exactly by the interest factor: ${n(c2max)} / ${n(c1max)} = ${n(1 + r / 100)}, so r = ${pct(r)}.`,
            };
        },
    },
    {
        id: "e2-it-affordable",
        subject: "econ2",
        topic: "intertemporal",
        difficulty: "medium",
        kind: "numeric",
        unit: "number",
        source: "TUM Economics II SS2017 Q13; SS2019 Q26",
        build: (rng) => {
            const s = rng.pick(E2_IT_AFFORDABLE_SCENARIOS);
            const c1max = rng.int(2, 6) * 20;
            const r = rng.int(1, 8) * 5;
            const c2max = c1max * (1 + r / 100);
            const x = 10 * rng.int(1, c1max / 10 - 1);
            const answer = c2max - (1 + r / 100) * x;
            return {
                prompt: `${s.name} faces an intertemporal budget line with intercepts ${n(c1max)} thousand € (consume everything this year) and ${n(c2max)} thousand € (consume everything next year). ${cap(s.subj)} decides to consume ${n(x)} thousand € this year. What is the **maximum** ${s.subj} can consume next year (in thousand €)?`,
                given: {
                    "Maximum consumption this year": `${n(c1max)} thousand €`,
                    "Maximum consumption next year": `${n(c2max)} thousand €`,
                    "Chosen consumption this year": `${n(x)} thousand €`,
                },
                answer,
                explanation: String.raw`$C_2 = C_2^{max} - (1 + r) \cdot C_1$ - every unit consumed today costs $1+r$ units of consumption tomorrow. The implied interest factor is ${n(c2max)} / ${n(c1max)} = ${n(1 + r / 100)}, so $C_2$ = ${n(c2max)} − ${n(1 + r / 100)} · ${n(x)} = ${n2(answer)} thousand €.`,
            };
        },
    },

    // ----------------------------------------------------------- exchange rates
    {
        id: "e2-fx-cross-rate",
        subject: "econ2",
        topic: "exchange_rates",
        difficulty: "medium",
        kind: "numeric",
        unit: "ratio",
        source: "TUM Economics II SS2017, Q24",
        build: (rng) => {
            const s = rng.pick(E2_FX_CROSS_RATE_SCENARIOS);
            const T = rng.int(400, 1200) / 100;
            const R = rng.int(150, 600) / 100;
            const answer = T / R;
            return {
                prompt: `The ${s.a} (currency of ${s.aC}) and the ${s.b} (currency of ${s.bC}) are both quoted against the ${s.c}: one ${s.c} costs ${n2(T)} ${s.as}, and one ${s.c} costs ${n2(R)} ${s.bs}. What is the cross rate in **${s.as} per ${s.b}**?`,
                given: {
                    [`${cap(s.as)} per ${s.c}`]: n2(T),
                    [`${cap(s.bs)} per ${s.c}`]: n2(R),
                },
                answer,
                explanation: String.raw`$E_{${s.A}/${s.B}} = \frac{E_{${s.A}/${s.C}}}{E_{${s.B}/${s.C}}}$ - both quotes share the ${s.c}, so dividing them cancels it: ${n2(T)} / ${n2(R)} = ${n2(answer)} ${s.as} per ${s.b}. Multiplying instead of dividing, or flipping the ratio, are the classic traps.`,
            };
        },
    },
    {
        id: "e2-fx-change-pct",
        subject: "econ2",
        topic: "exchange_rates",
        difficulty: "easy",
        kind: "numeric",
        unit: "percent",
        source: "TUM Economics II SS2018 Q28; SS2019 Q32",
        build: (rng) => {
            const s = rng.pick(E2_FX_CHANGE_PCT_SCENARIOS);
            const e0 = rng.int(150, 900) / 100;
            const c = rng.int(2, 12) * rng.pick([1, -1]);
            const e1 = Math.round(e0 * (1 + c / 100) * 100) / 100;
            const answer = (e1 / e0 - 1) * 100;
            return {
                prompt: `The exchange rate between the ${s.a} (${s.aC}) and the ${s.b} (${s.bC}) moves from ${n2(e0)} ${s.a} per ${s.b} in year 1 to ${n2(e1)} ${s.a} per ${s.b} in year 2. What is the **percentage change** of the exchange rate (${s.a} per ${s.b})? A negative number means the rate fell.`,
                given: {
                    [`Rate year 1 (${s.a} per ${s.b})`]: n2(e0),
                    [`Rate year 2 (${s.a} per ${s.b})`]: n2(e1),
                },
                answer,
                explanation: String.raw`$\Delta E \, [\%] = \left( \frac{E_1}{E_0} - 1 \right) \cdot 100$: ${n2(e1)} / ${n2(e0)} − 1 = ${pct(answer)}. ${answer > 0 ? `A rising rate means the ${s.b} appreciated (each ${s.b} buys more ${s.a}) and the ${s.a} depreciated.` : `A falling rate means the ${s.b} depreciated (each ${s.b} buys fewer ${s.a}) and the ${s.a} appreciated.`}`,
            };
        },
    },

    // ------------------------------------------------ real vs nominal, deflator
    {
        id: "e2-rn-real-growth",
        subject: "econ2",
        topic: "real_nominal",
        difficulty: "medium",
        kind: "numeric",
        unit: "percent",
        source: "TUM Economics II SS2019 Q30; SS2017 Q17",
        build: (rng) => {
            const s = rng.pick(E2_RN_REAL_GROWTH_SCENARIOS);
            const p1 = rng.int(2, 6);
            const p2 = rng.int(8, 15);
            const p1b = p1 + rng.int(1, 3);
            const p2b = p2 + rng.int(1, 4);
            const q11 = rng.int(300, 900);
            const q21 = rng.int(100, 400);
            const q12 = q11 + rng.int(-150, 150);
            const q22 = q21 + rng.int(-80, 80);
            const real1 = p1 * q11 + p2 * q21;
            const real2 = p1 * q12 + p2 * q22;
            const answer = (real2 / real1 - 1) * 100;
            return {
                prompt: `The economy of ${s.place} produces only ${s.gA} and ${s.gB}. In year 1 (the **base year**) it produces ${n(q11)} ${s.uA} at ${eur(p1)} each and ${n(q21)} ${s.uB} at ${eur(p2)} each; in year 2 it produces ${n(q12)} ${s.uA} at ${eur(p1b)} each and ${n(q22)} ${s.uB} at ${eur(p2b)} each. What is the growth rate of **real GDP** from year 1 to year 2?`,
                given: {
                    [`${s.LA} year 1`]: `${n(q11)} ${s.uA} at ${eur(p1)}`,
                    [`${s.LB} year 1`]: `${n(q21)} ${s.uB} at ${eur(p2)}`,
                    [`${s.LA} year 2`]: `${n(q12)} ${s.uA} at ${eur(p1b)}`,
                    [`${s.LB} year 2`]: `${n(q22)} ${s.uB} at ${eur(p2b)}`,
                    "Base year": "year 1",
                },
                answer,
                explanation: String.raw`$g^{real} = \frac{\sum p^{base} \, q_2}{\sum p^{base} \, q_1} - 1$ - value both years' quantities at **base-year** prices, so only quantity changes count. Year 1: ${eur(real1)}. Year 2 at year-1 prices: ${eur(p1)} · ${n(q12)} + ${eur(p2)} · ${n(q22)} = ${eur(real2)}. Growth: ${eur(real2)} / ${eur(real1)} − 1 = ${pct(answer)}. The year-2 prices are only needed for nominal GDP, not here.`,
            };
        },
    },
    {
        id: "e2-rn-deflator",
        subject: "econ2",
        topic: "real_nominal",
        difficulty: "medium",
        kind: "numeric",
        unit: "number",
        source: "TUM Economics II SS2019, Q31",
        build: (rng) => {
            const s = rng.pick(E2_RN_DEFLATOR_SCENARIOS);
            const p1 = rng.int(2, 6);
            const p2 = rng.int(8, 15);
            const p1b = p1 + rng.int(1, 3);
            const p2b = p2 + rng.int(1, 4);
            const q11 = rng.int(300, 900);
            const q21 = rng.int(100, 400);
            const q12 = q11 + rng.int(-150, 150);
            const q22 = q21 + rng.int(-80, 80);
            const real2 = p1 * q12 + p2 * q22;
            const nom2 = p1b * q12 + p2b * q22;
            const answer = (100 * nom2) / real2;
            return {
                prompt: `${s.place} produces only ${s.gA} and ${s.gB}. Year 1 is the base year with prices ${eur(p1)} per ${s.uA1} and ${eur(p2)} per ${s.uB1} (quantities: ${n(q11)} ${s.uA}, ${n(q21)} ${s.uB}). In year 2 it produces ${n(q12)} ${s.uA} at ${eur(p1b)} and ${n(q22)} ${s.uB} at ${eur(p2b)}. What is the **GDP deflator** of year 2, on a scale where the base year equals 100?`,
                given: {
                    "Prices year 1 (base)": `${s.lA} ${eur(p1)}, ${s.lB} ${eur(p2)}`,
                    "Quantities year 1": `${n(q11)} ${s.uA}, ${n(q21)} ${s.uB}`,
                    "Prices year 2": `${s.lA} ${eur(p1b)}, ${s.lB} ${eur(p2b)}`,
                    "Quantities year 2": `${n(q12)} ${s.uA}, ${n(q22)} ${s.uB}`,
                },
                answer,
                explanation: String.raw`$P_t = \frac{Y_t^{nominal}}{Y_t^{real}} \cdot 100$ - both valued with **year-2 quantities**. Nominal year 2: ${eur(p1b)} · ${n(q12)} + ${eur(p2b)} · ${n(q22)} = ${eur(nom2)}. Real year 2 (base-year prices): ${eur(p1)} · ${n(q12)} + ${eur(p2)} · ${n(q22)} = ${eur(real2)}. Deflator: 100 · ${eur(nom2)} / ${eur(real2)} = ${n2(answer)}.`,
            };
        },
    },
    {
        id: "e2-rn-cpi-inflation",
        subject: "econ2",
        topic: "real_nominal",
        difficulty: "hard",
        kind: "numeric",
        unit: "percent",
        source: "TUM Economics II SS2017, Q18",
        build: (rng) => {
            const s = rng.pick(E2_RN_CPI_INFLATION_SCENARIOS);
            const p1 = rng.int(2, 6);
            const p2 = rng.int(8, 15);
            const p1b = p1 + rng.int(1, 3);
            const p2b = p2 + rng.int(1, 4);
            const q11 = rng.int(300, 900);
            const q21 = rng.int(100, 400);
            const q12 = q11 + rng.int(-150, 150);
            const q22 = q21 + rng.int(-80, 80);
            const base = p1 * q11 + p2 * q21;
            const now = p1b * q11 + p2b * q21;
            const answer = (now / base - 1) * 100;
            return {
                prompt: `Consumers in ${s.place} buy only ${s.gA} and ${s.gB}. In year 1, prices were ${eur(p1)} per ${s.uA1} and ${eur(p2)} per ${s.uB1}, and the consumption basket was ${n(q11)} ${s.uA} and ${n(q21)} ${s.uB}. In year 2, prices are ${eur(p1b)} and ${eur(p2b)}, and quantities happen to shift to ${n(q12)} ${s.uA} and ${n(q22)} ${s.uB}. What is the **CPI inflation rate** between year 1 and year 2?`,
                given: {
                    "Prices year 1": `${s.lA} ${eur(p1)}, ${s.lB} ${eur(p2)}`,
                    "Basket (year 1)": `${n(q11)} ${s.uA}, ${n(q21)} ${s.uB}`,
                    "Prices year 2": `${s.lA} ${eur(p1b)}, ${s.lB} ${eur(p2b)}`,
                    "Quantities year 2": `${n(q12)} ${s.uA}, ${n(q22)} ${s.uB}`,
                },
                answer,
                explanation: String.raw`$\pi^{CPI} = \frac{\sum p_2 \, q^{base}}{\sum p_1 \, q^{base}} - 1$ - the CPI prices the **fixed base-year basket** at both years' prices, so the year-2 quantities are pure distractor data (they would matter for the GDP deflator, which uses current quantities). Basket at year-1 prices: ${eur(base)}; at year-2 prices: ${eur(p1b)} · ${n(q11)} + ${eur(p2b)} · ${n(q21)} = ${eur(now)}. Inflation: ${eur(now)} / ${eur(base)} − 1 = ${pct(answer)}.`,
                hint: String.raw`The consumer price index prices one and the same basket - the base-year quantities - at both years' prices, so what consumers happen to buy later plays no role: $\pi^{CPI} = \frac{\sum p_2 \, q^{base}}{\sum p_1 \, q^{base}} - 1$.`,
            };
        },
    },

    // ------------------------------------------- inflation and interest rates
    {
        id: "e2-ii-nominal-wage",
        subject: "econ2",
        topic: "inflation_interest",
        difficulty: "very_easy",
        kind: "numeric",
        unit: "percent",
        source: "TUM Economics II SS2019, Q27",
        build: (rng) => {
            const s = rng.pick(E2_II_NOMINAL_WAGE_SCENARIOS);
            const rw = rng.int(0, 30) / 10;
            const piInfl = rng.int(5, 40) / 10;
            const answer = rw + piInfl;
            return {
                prompt: `${s.union} negotiates wages for next year. It targets **real** wage growth of ${pct(rw)}, and inflation is expected to be ${pct(piInfl)}. What nominal wage growth must the union demand?`,
                given: {
                    "Target real wage growth": pct(rw),
                    "Expected inflation": pct(piInfl),
                },
                answer,
                explanation: String.raw`$g_W = g_{W/P} + \pi$ - nominal wage growth is real wage growth plus inflation (the standard approximation): ${pct(rw)} + ${pct(piInfl)} = ${pct(answer)}.`,
            };
        },
    },
    {
        id: "e2-ii-real-rate",
        subject: "econ2",
        topic: "inflation_interest",
        difficulty: "easy",
        kind: "numeric",
        unit: "percent",
        source: "TUM Economics II SS2017, Q23",
        build: (rng) => {
            const s = rng.pick(E2_II_REAL_RATE_SCENARIOS);
            const i = rng.int(0, 60) / 10;
            const piInfl = (rng.int(5, 30) / 10) * rng.pick([1, -1]);
            const answer = i - piInfl;
            return {
                prompt: `${s.product} pays a nominal interest rate of ${pct(i)}. Inflation over the same year is ${pct(piInfl)}. What is the **real** interest rate on the ${s.noun} (Fisher approximation)?`,
                given: {
                    "Nominal interest rate i": pct(i),
                    "Inflation π": pct(piInfl),
                },
                answer,
                explanation: String.raw`$r = i - \pi$ - the Fisher approximation: ${pct(i)} − ${piInfl < 0 ? `(${pct(piInfl)})` : pct(piInfl)} = ${pct(answer)}. ${piInfl < 0 ? "Deflation (negative inflation) is **subtracted as a negative**, so it raises the real rate above the nominal rate." : "Inflation eats part of the nominal return, so the real rate is below the nominal rate."}`,
            };
        },
    },

    // ------------------------------------------------------------------- Solow
    {
        id: "e2-solow-steady-state",
        subject: "econ2",
        topic: "solow",
        difficulty: "medium",
        kind: "numeric",
        unit: "number",
        source: "TUM Economics II SS2017, Q31",
        build: (rng) => {
            const nPop = rng.int(0, 3);
            const g = rng.int(1, 3);
            const delta = rng.int(3, 8);
            const x = nPop + g + delta;
            const ratio = rng.pick([2, 2.5, 3] as const);
            const s = x * ratio;
            const answer = ratio * ratio;
            return {
                prompt: String.raw`A Solow economy has production per effective worker $f(k) = \sqrt{k}$. The savings rate is ${pct(s)}, population grows at ${pct(nPop)}, technology at ${pct(g)}, and capital depreciates at ${pct(delta)}. What is the **steady-state** capital stock per effective worker $k^*$?`,
                given: {
                    "Production per effective worker": String.raw`$f(k) = \sqrt{k}$`,
                    "Savings rate s": pct(s),
                    "Population growth n": pct(nPop),
                    "Technological progress g": pct(g),
                    "Depreciation rate δ": pct(delta),
                },
                answer,
                explanation: String.raw`$s \cdot f(k^*) = (n + g + \delta) \cdot k^*$ - in the steady state, saving per effective worker exactly covers the capital dilution. With $f(k) = \sqrt{k}$: $s \sqrt{k^*} = (n+g+\delta) k^*$, so $\sqrt{k^*} = \frac{s}{n+g+\delta}$ = ${pct(s)} / ${pct(x)} = ${n(ratio)}, giving $k^*$ = ${n(answer)}.`,
            };
        },
    },
    {
        id: "e2-solow-golden-rule-k",
        subject: "econ2",
        topic: "solow",
        difficulty: "hard",
        kind: "numeric",
        unit: "number",
        source: "TUM Economics II SS2018 Q36; SS2019 Q35",
        build: (rng) => {
            const cfg = rng.pick(SOLOW_GR);
            const xPct = (cfg.A * 100) / (2 * cfg.r0);
            const nPop = rng.int(0, 3);
            const g = rng.int(1, 3);
            const delta = xPct - nPop - g;
            const s = rng.int(15, 45);
            const answer = cfg.r0 ** 2;
            const Astr = cfg.A === 1 ? "" : `${cfg.A} `;
            return {
                prompt: String.raw`A Solow economy has production per effective worker $f(k) = ${Astr}\sqrt{k}$. The savings rate is ${pct(s)}, population grows at ${pct(nPop)}, technology at ${pct(g)}, and depreciation is ${pct(delta)}. What is the **golden-rule** capital stock per effective worker $k^{gr}$?`,
                given: {
                    "Production per effective worker": String.raw`$f(k) = ${Astr}\sqrt{k}$`,
                    "Savings rate s": pct(s),
                    "Population growth n": pct(nPop),
                    "Technological progress g": pct(g),
                    "Depreciation rate δ": pct(delta),
                },
                answer,
                explanation: String.raw`$f'(k^{gr}) = n + g + \delta$ - at the golden rule, the marginal product of capital equals the dilution rate; the savings rate plays no role here (it is what would have to adjust). $f'(k) = \frac{${cfg.A}}{2\sqrt{k}}$, so $\sqrt{k^{gr}} = \frac{${cfg.A}}{2 \cdot ${n(xPct / 100)}}$ = ${n(cfg.r0)}, giving $k^{gr}$ = ${n(answer)}.`,
                hint: String.raw`The golden-rule capital stock is the one that leaves the largest steady-state consumption, $f(k) - (n + g + \delta) k$; maximizing it sets the marginal product of capital equal to the dilution rate, with the savings rate playing no role: $f'(k^{gr}) = n + g + \delta$.`,
            };
        },
    },
    {
        id: "e2-solow-golden-rule-s",
        subject: "econ2",
        topic: "solow",
        difficulty: "medium",
        kind: "numeric",
        unit: "percent",
        source: "TUM Economics II SS2018 Q37; SS2019 Q36",
        build: (rng) => {
            const alpha = rng.pick([
                { num: 1, den: 4 },
                { num: 2, den: 5 },
                { num: 1, den: 2 },
                { num: 3, den: 5 },
            ] as const);
            const A = rng.int(2, 5);
            const nPop = rng.int(1, 3);
            const g = rng.int(1, 3);
            const delta = rng.int(3, 8);
            const answer = (alpha.num / alpha.den) * 100;
            return {
                prompt: String.raw`A Solow economy produces with $Y = ${A} \, K^{${alpha.num}/${alpha.den}} (LE)^{${alpha.den - alpha.num}/${alpha.den}}$. Population grows at ${pct(nPop)}, technology at ${pct(g)}, and depreciation is ${pct(delta)}. Which **savings rate** would put the economy on its golden-rule steady state?`,
                given: {
                    "Production function": String.raw`$Y = ${A} \, K^{${alpha.num}/${alpha.den}} (LE)^{${alpha.den - alpha.num}/${alpha.den}}$`,
                    "Population growth n": pct(nPop),
                    "Technological progress g": pct(g),
                    "Depreciation rate δ": pct(delta),
                },
                answer,
                explanation: String.raw`$s^{gr} = \alpha$ - combine the steady-state condition $s f(k) = (n+g+\delta) k$ with the golden rule $f'(k^{gr}) = n+g+\delta$: dividing them gives $s = \frac{k \, f'(k)}{f(k)}$, which for a Cobb-Douglas function is exactly the capital share $\alpha$. Here $\alpha = ${alpha.num}/${alpha.den}$, so $s^{gr}$ = ${pct(answer)} - independent of $n$, $g$, $\delta$ and the scale factor.`,
            };
        },
    },
    {
        id: "e2-solow-golden-rule-c",
        subject: "econ2",
        topic: "solow",
        difficulty: "very_hard",
        kind: "numeric",
        unit: "number",
        source: "TUM Economics II SS2018, Q38",
        build: (rng) => {
            const cfg = rng.pick(SOLOW_GR);
            const xPct = (cfg.A * 100) / (2 * cfg.r0);
            const nPop = rng.int(0, 3);
            const g = rng.int(1, 3);
            const delta = xPct - nPop - g;
            const kGr = cfg.r0 ** 2;
            const fk = cfg.A * cfg.r0;
            const answer = (cfg.A * cfg.r0) / 2;
            const Astr = cfg.A === 1 ? "" : `${cfg.A} `;
            return {
                prompt: String.raw`A Solow economy has production per effective worker $f(k) = ${Astr}\sqrt{k}$, population growth of ${pct(nPop)}, technological progress of ${pct(g)}, and depreciation of ${pct(delta)}. What is the **maximum sustainable consumption per effective worker**?`,
                given: {
                    "Production per effective worker": String.raw`$f(k) = ${Astr}\sqrt{k}$`,
                    "Population growth n": pct(nPop),
                    "Technological progress g": pct(g),
                    "Depreciation rate δ": pct(delta),
                },
                answer,
                explanation: String.raw`$c^{gr} = f(k^{gr}) - (n + g + \delta) \cdot k^{gr}$ - output minus the investment needed to hold $k$ constant, evaluated at the golden rule. First $f'(k) = \frac{${cfg.A}}{2\sqrt{k}} = ${n(xPct / 100)}$ gives $\sqrt{k^{gr}} = ${n(cfg.r0)}$, so $k^{gr} = ${n(kGr)}$. Then $f(k^{gr}) = ${n(fk)}$ and the dilution term is ${n(xPct / 100)} · ${n(kGr)} = ${n(xPct / 100 * kGr)}, leaving $c^{gr}$ = ${n(fk)} − ${n(xPct / 100 * kGr)} = ${n(answer)}.`,
                hint: String.raw`Consumption that can be sustained forever is output minus the investment needed to hold capital per effective worker constant, and it peaks at the golden-rule stock where $f'(k^{gr}) = n + g + \delta$: $c^{gr} = f(k^{gr}) - (n + g + \delta) \cdot k^{gr}$.`,
            };
        },
    },

    // ------------------------------------------------ growth rates (expansion)
    {
        id: "ec2-gr-two-year-cumulative",
        subject: "econ2",
        topic: "growth_rates",
        difficulty: "easy",
        kind: "numeric",
        unit: "percent",
        source: "TUM Economics II SS2019 Q1; SS2019 Q30",
        build: (rng) => {
            const g1 = rng.int(2, 9) * rng.pick([1, -1]);
            const g2 = rng.int(2, 9) * rng.pick([1, -1]);
            const y0 = rng.int(600, 3200);
            const y1 = Math.round(y0 * (1 + g1 / 100));
            const y2 = Math.round(y1 * (1 + g2 / 100));
            const country = rng.pick(WORLD_COUNTRIES);
            const answer = (y2 / y0 - 1) * 100;
            return {
                prompt: `Real GDP of ${country} was ${n(y0)} billion € in year 1, ${n(y1)} billion € in year 2 and ${n(y2)} billion € in year 3. By what percentage did real GDP change over the **whole period** from year 1 to year 3?`,
                given: {
                    "GDP year 1": `${n(y0)} billion €`,
                    "GDP year 2": `${n(y1)} billion €`,
                    "GDP year 3": `${n(y2)} billion €`,
                },
                answer,
                explanation: String.raw`$g = \frac{Y_3}{Y_1} - 1$ - the cumulative change compares the end level directly with the start level: ${n(y2)} / ${n(y0)} − 1 = ${pct(answer)}. Adding the two annual growth rates instead is the classic trap - growth rates compound, they do not add.`,
            };
        },
    },
    {
        id: "ec2-gr-constant-growth",
        subject: "econ2",
        topic: "growth_rates",
        difficulty: "medium",
        kind: "numeric",
        unit: "percent",
        source: "TUM Economics II SS2019, Q1 (compounding of annual growth)",
        build: (rng) => {
            const g = rng.int(2, 6);
            const T = rng.int(3, 8);
            const country = rng.pick(WORLD_COUNTRIES);
            const answer = ((1 + g / 100) ** T - 1) * 100;
            return {
                prompt: `Suppose real GDP of ${country} grows at a constant rate of ${pct(g)} per year for ${n(T)} consecutive years. By what **total** percentage is GDP higher at the end of the ${n(T)} years than at the start?`,
                given: {
                    "Annual growth rate g": pct(g),
                    "Number of years T": n(T),
                },
                answer,
                explanation: String.raw`$\left(1 + g\right)^T - 1$ - constant growth compounds: $${n(1 + g / 100)}^{${T}} - 1$ = ${pct(answer)}. Simply multiplying ${pct(g)} by ${n(T)} gives ${pct(g * T)} and understates the true change, because each year's growth also applies to the previous years' gains.`,
            };
        },
    },
    {
        id: "ec2-gr-percap-from-rates",
        subject: "econ2",
        topic: "growth_rates",
        difficulty: "medium",
        kind: "numeric",
        unit: "percent",
        source: "TUM Economics II SS2019 Q3; SS2018 Q3",
        build: (rng) => {
            const gY = rng.int(-4, 9);
            const gN = rng.int(2, 18) / 10;
            const country = rng.pick(WORLD_COUNTRIES);
            const answer = ((1 + gY / 100) / (1 + gN / 100) - 1) * 100;
            return {
                prompt: `Last year, total GDP of ${country} grew by ${pct(gY)} while its population grew by ${pct(gN)}. What was the growth rate of GDP **per capita**? (Use the exact ratio, not the approximation.)`,
                given: {
                    "Total GDP growth": pct(gY),
                    "Population growth": pct(gN),
                },
                answer,
                explanation: String.raw`$g_{pc} = \frac{1 + g_Y}{1 + g_N} - 1$ - GDP per capita is $Y/N$, so its growth factor is the ratio of the two growth factors: ${n(1 + gY / 100)} / ${n(1 + gN / 100)} − 1 = ${pct(answer)}. The approximation $g_Y - g_N$ = ${pct(gY - gN)} is close but not exact.`,
            };
        },
    },
    {
        id: "ec2-gr-required-total",
        subject: "econ2",
        topic: "growth_rates",
        difficulty: "medium",
        kind: "numeric",
        unit: "percent",
        source: "TUM Economics II SS2019 Q3; SS2018 Q3 (per-capita vs. total growth)",
        build: (rng) => {
            const gpc = rng.int(1, 5);
            const gN = rng.int(2, 18) / 10;
            const country = rng.pick(WORLD_COUNTRIES);
            const answer = ((1 + gpc / 100) * (1 + gN / 100) - 1) * 100;
            return {
                prompt: `The government of ${country} targets GDP **per capita** growth of ${pct(gpc)} for next year. The population is projected to grow by ${pct(gN)}. What growth rate of **total** GDP is required to hit the target exactly?`,
                given: {
                    "Target GDP per capita growth": pct(gpc),
                    "Projected population growth": pct(gN),
                },
                answer,
                explanation: String.raw`$1 + g_Y = (1 + g_{pc})(1 + g_N)$ - total GDP is per-capita GDP times population, so the growth factors multiply: ${n(1 + gpc / 100)} · ${n(1 + gN / 100)} − 1 = ${pct(answer)}. Adding the two rates gives ${pct(gpc + gN)}, which falls just short of the target.`,
            };
        },
    },
    {
        id: "ec2-gr-differential",
        subject: "econ2",
        topic: "growth_rates",
        difficulty: "easy",
        kind: "numeric",
        unit: "percent",
        source: "TUM Economics II SS2019 Q3 (two-country comparison)",
        build: (rng) => {
            const cA = rng.pick(WORLD_COUNTRIES);
            let cB = rng.pick(WORLD_COUNTRIES);
            if (cB === cA) cB = cA === "France" ? "Poland" : "France";
            const gA = rng.int(-3, 8);
            const gB = rng.int(-3, 8);
            const a0 = rng.int(400, 2600);
            const b0 = rng.int(400, 2600);
            const a1 = Math.round(a0 * (1 + gA / 100));
            const b1 = Math.round(b0 * (1 + gB / 100));
            const answer = (a1 / a0 - b1 / b0) * 100;
            return {
                prompt: `Real GDP of ${cA} rose from ${n(a0)} to ${n(a1)} billion € between year 1 and year 2; real GDP of ${cB} moved from ${n(b0)} to ${n(b1)} billion €. By how many **percentage points** did the growth rate of ${cA} exceed that of ${cB}? (Negative if it was lower.)`,
                given: {
                    [`${cA}: GDP year 1 / year 2`]: `${n(a0)} / ${n(a1)} billion €`,
                    [`${cB}: GDP year 1 / year 2`]: `${n(b0)} / ${n(b1)} billion €`,
                },
                answer,
                explanation: String.raw`$\Delta = g_A - g_B$ with $g = \frac{Y_1}{Y_0} - 1$ for each country separately: $g_A$ = ${pct((a1 / a0 - 1) * 100)}, $g_B$ = ${pct((b1 / b0 - 1) * 100)}, so the differential is ${pct(answer)}. Comparing the absolute changes in billions instead of the rates is the trap - the two economies have different sizes.`,
            };
        },
    },
    {
        id: "ec2-gr-percap-level",
        subject: "econ2",
        topic: "growth_rates",
        difficulty: "very_easy",
        kind: "numeric",
        unit: "EUR",
        source: "TUM Economics II SS2019, Q3 (GDP per capita from levels)",
        build: (rng) => {
            const country = rng.pick(WORLD_COUNTRIES);
            const gdp = rng.int(300, 3800);
            const pop = rng.int(10, 85);
            const answer = (gdp / pop) * 1000;
            return {
                prompt: `${country[0].toUpperCase()}${country.slice(1)} reports a GDP of ${n(gdp)} billion € and a population of ${n(pop)} million. What is GDP **per capita** in euros?`,
                given: {
                    "GDP": `${n(gdp)} billion €`,
                    "Population": `${n(pop)} million`,
                },
                answer,
                explanation: String.raw`$y = \frac{Y}{N}$ - divide GDP by the population, keeping the units straight: ${n(gdp)} billion € / ${n(pop)} million people = ${n(gdp / pop)} thousand € per person, i.e. ${eur(answer)}.`,
            };
        },
    },

    // -------------------------------------------- GDP accounting (expansion)
    {
        id: "ec2-gdp-expenditure",
        subject: "econ2",
        topic: "gdp_accounting",
        difficulty: "very_easy",
        kind: "numeric",
        unit: "number",
        source: "TUM Economics II lecture, Unit III slide 7 (GDP = C + I + G + X − M)",
        build: (rng) => {
            const country = rng.pick(WORLD_COUNTRIES);
            const C = 10 * rng.int(60, 240);
            const I = 10 * rng.int(15, 70);
            const G = 10 * rng.int(20, 90);
            const X = 10 * rng.int(20, 120);
            const M = 10 * rng.int(15, 110);
            const answer = C + I + G + X - M;
            return {
                prompt: `The national accounts of ${country} report (in billion €): consumption ${n(C)}, investment ${n(I)}, government purchases ${n(G)}, exports ${n(X)} and imports ${n(M)}. What is GDP by the expenditure approach, in billion €?`,
                given: {
                    "Consumption C": n(C),
                    "Investment I": n(I),
                    "Government purchases G": n(G),
                    "Exports X": n(X),
                    "Imports M": n(M),
                },
                answer,
                explanation: String.raw`$Y = C + I + G + X - M$ - total spending on domestic products; imports are subtracted because they are spending on foreign production: ${n(C)} + ${n(I)} + ${n(G)} + ${n(X)} − ${n(M)} = ${n(answer)} billion €.`,
            };
        },
    },
    {
        id: "ec2-gdp-nx-residual",
        subject: "econ2",
        topic: "gdp_accounting",
        difficulty: "easy",
        kind: "numeric",
        unit: "number",
        source: "TUM Economics II lecture, Unit III slide 7 (expenditure components)",
        build: (rng) => {
            const country = rng.pick(WORLD_COUNTRIES);
            const C = 10 * rng.int(60, 240);
            const I = 10 * rng.int(15, 70);
            const G = 10 * rng.int(20, 90);
            const X = 10 * rng.int(30, 120);
            const M = 10 * rng.int(10, X / 10 - 5);
            const gdp = C + I + G + X - M;
            return {
                prompt: `Statisticians in ${country} know GDP is ${n(gdp)} billion € and have measured (in billion €): consumption ${n(C)}, investment ${n(I)}, government purchases ${n(G)} and exports ${n(X)}. The import figure is still missing. How large must **imports** be, in billion €?`,
                given: {
                    "GDP": n(gdp),
                    "Consumption C": n(C),
                    "Investment I": n(I),
                    "Government purchases G": n(G),
                    "Exports X": n(X),
                },
                answer: M,
                explanation: String.raw`$M = C + I + G + X - Y$ - rearrange the expenditure identity $Y = C + I + G + X - M$: ${n(C)} + ${n(I)} + ${n(G)} + ${n(X)} − ${n(gdp)} = ${n(M)} billion €.`,
            };
        },
    },
    {
        id: "ec2-gdp-trade-balance",
        subject: "econ2",
        topic: "gdp_accounting",
        difficulty: "very_easy",
        kind: "numeric",
        unit: "number",
        source: "TUM Economics II lecture, Unit III slide 7 (net exports)",
        build: (rng) => {
            const country = rng.pick(WORLD_COUNTRIES);
            const X = 10 * rng.int(25, 140);
            const M = 10 * rng.int(25, 140);
            const answer = X - M;
            return {
                prompt: `${country[0].toUpperCase()}${country.slice(1)} exports goods and services worth ${n(X)} billion € and imports goods and services worth ${n(M)} billion €. What is its **trade balance** (net exports), in billion €? A negative number means a trade deficit.`,
                given: {
                    "Exports X": n(X),
                    "Imports M": n(M),
                },
                answer,
                explanation: String.raw`$NX = X - M$: ${n(X)} − ${n(M)} = ${n(answer)} billion €. ${answer > 0 ? "Exports exceed imports, so the country runs a trade surplus." : answer < 0 ? "Imports exceed exports, so the country runs a trade deficit." : "Exports exactly match imports - trade is balanced."}`,
            };
        },
    },
    {
        id: "ec2-gdp-va-two-stage",
        subject: "econ2",
        topic: "gdp_accounting",
        difficulty: "medium",
        kind: "numeric",
        unit: "EUR",
        source: "TUM Economics II SS2019 Q2; SS2018 Q4",
        build: (rng) => {
            const s = rng.pick(E2_GDP_VA_TWO_STAGE_SCENARIOS);
            const m1 = 1000 * rng.int(2, 8);
            const s2 = m1 + 1000 * rng.int(5, 15);
            const frac = rng.pick([0.4, 0.6, 0.8] as const);
            const buy = frac * s2;
            const s3 = buy + 1000 * rng.int(6, 20);
            const w2 = 500 * rng.int(2, 6);
            const w3 = 500 * rng.int(3, 8);
            const va2 = s2 - m1;
            const va3 = s3 - buy;
            const answer = va2 + va3;
            return {
                prompt: `A small economy has exactly two producers. A **${s.f1}** imports ${s.imp} for ${eur(m1)} and sells ${s.prod1} worth ${eur(s2)} in total - ${pct(frac * 100)} of it to a domestic ${s.f2}, the rest directly to households. It pays ${eur(w2)} in wages. The **${s.f2}** turns the ${s.prod1Short} it bought into ${s.prod2} sold for ${eur(s3)} and pays ${eur(w3)} in wages. What is the GDP of this economy?`,
                given: {
                    [`${s.F1}: imported ${s.impShort}`]: eur(m1),
                    [`${s.F1}: total sales`]: eur(s2),
                    [`Share sold to ${s.f2}`]: pct(frac * 100),
                    [`${s.F2}: sales`]: eur(s3),
                    [`Wages ${s.f1} / ${s.f2}`]: `${eur(w2)} / ${eur(w3)}`,
                },
                answer,
                explanation: String.raw`$GDP = \sum_i VA_i = \sum_i \left( \text{sales}_i - \text{intermediate inputs}_i \right)$ - the imported ${s.impShort} are subtracted at the ${s.f1}, and only the ${s.prod1Short} actually bought by the ${s.f2} is its intermediate input. ${s.F1}: ${eur(s2)} − ${eur(m1)} = ${eur(va2)}. ${s.F2}: it bought ${pct(frac * 100)} of ${eur(s2)}, i.e. ${eur(buy)}, so ${eur(s3)} − ${eur(buy)} = ${eur(va3)}. GDP = ${eur(answer)}. Wages only distribute the value added - they never enter the sum.`,
            };
        },
    },
    {
        id: "ec2-gdp-va-firm",
        subject: "econ2",
        topic: "gdp_accounting",
        difficulty: "easy",
        kind: "numeric",
        unit: "EUR",
        source: "TUM Economics II SS2019 Q2 (value added of one stage)",
        build: (rng) => {
            const sc = rng.pick(E2_GDP_VA_FIRM_SCENARIOS);
            const s = 1000 * rng.int(20, 90);
            const d = 1000 * rng.int(3, 12);
            const m = 1000 * rng.int(2, 7);
            const w = 1000 * rng.int(2, 10);
            const k = 1000 * rng.int(1, 5);
            const answer = s - d - m;
            return {
                prompt: `${sc.firm} sells output worth ${eur(s)} in one year. To produce it, the firm buys ${sc.dom} for ${eur(d)} and imports ${sc.imp} from abroad for ${eur(m)}. It pays ${eur(w)} in wages and ${eur(k)} in capital costs. What is the firm's **value added**?`,
                given: {
                    "Sales": eur(s),
                    "Domestic intermediate inputs": eur(d),
                    "Imported inputs": eur(m),
                    "Wages": eur(w),
                    "Capital costs": eur(k),
                },
                answer,
                explanation: String.raw`$VA = \text{sales} - \text{intermediate inputs}$ - both domestic and imported intermediates are subtracted: ${eur(s)} − ${eur(d)} − ${eur(m)} = ${eur(answer)}. Wages and capital costs are how the value added is distributed to workers and owners; subtracting them too is the classic mistake.`,
                hint: String.raw`Value added is what a firm's own production adds on top of the goods it bought in, so every intermediate input is deducted, domestic and imported alike, while payments to workers and owners only distribute what is left: $VA = \text{sales} - \text{intermediate inputs}$.`,
            };
        },
    },

    // ---------------------------------------- real vs. nominal (expansion)
    {
        id: "ec2-rn-nominal-growth",
        subject: "econ2",
        topic: "real_nominal",
        difficulty: "easy",
        kind: "numeric",
        unit: "percent",
        source: "TUM Economics II SS2019, Q30",
        build: (rng) => {
            const s = rng.pick(E2_RN_NOMINAL_GROWTH_SCENARIOS);
            const pa1 = rng.int(2, 7);
            const pb1 = rng.int(12, 20);
            const pa2 = pa1 + rng.int(1, 3);
            const pb2 = pb1 + rng.int(-2, 4);
            const qa1 = rng.int(120, 640);
            const qb1 = rng.int(60, 400);
            const qa2 = qa1 + rng.int(-100, 100);
            const qb2 = qb1 + rng.int(-60, 60);
            const nom1 = pa1 * qa1 + pb1 * qb1;
            const nom2 = pa2 * qa2 + pb2 * qb2;
            const answer = (nom2 / nom1 - 1) * 100;
            return {
                prompt: `${s.place} produces only ${s.gA} and ${s.gB}. In year 1 it produces ${n(qa1)} ${s.uA} of ${s.gA} at ${eur(pa1)} each and ${n(qb1)} ${s.uB} of ${s.gB} at ${eur(pb1)} each; in year 2 it produces ${n(qa2)} ${s.uA} at ${eur(pa2)} and ${n(qb2)} ${s.uB} at ${eur(pb2)}. What is the growth rate of **nominal** GDP from year 1 to year 2?`,
                given: {
                    [`${s.LA} year 1`]: `${n(qa1)} ${s.uA} at ${eur(pa1)}`,
                    [`${s.LB} year 1`]: `${n(qb1)} ${s.uB} at ${eur(pb1)}`,
                    [`${s.LA} year 2`]: `${n(qa2)} ${s.uA} at ${eur(pa2)}`,
                    [`${s.LB} year 2`]: `${n(qb2)} ${s.uB} at ${eur(pb2)}`,
                },
                answer,
                explanation: String.raw`$g^{nom} = \frac{\sum p_2 \, q_2}{\sum p_1 \, q_1} - 1$ - nominal GDP values each year's quantities at that same year's prices. Year 1: ${eur(nom1)}. Year 2: ${eur(pa2)} · ${n(qa2)} + ${eur(pb2)} · ${n(qb2)} = ${eur(nom2)}. Growth: ${eur(nom2)} / ${eur(nom1)} − 1 = ${pct(answer)}. Mixing in base-year prices would give real growth instead.`,
            };
        },
    },
    {
        id: "ec2-rn-real-level",
        subject: "econ2",
        topic: "real_nominal",
        difficulty: "easy",
        kind: "numeric",
        unit: "EUR",
        source: "TUM Economics II SS2019, Q30 (real GDP at base-year prices)",
        build: (rng) => {
            const s = rng.pick(E2_RN_REAL_LEVEL_SCENARIOS);
            const pa1 = rng.int(2, 7);
            const pb1 = rng.int(12, 20);
            const pa2 = pa1 + rng.int(1, 3);
            const pb2 = pb1 + rng.int(1, 4);
            const qa2 = rng.int(120, 640);
            const qb2 = rng.int(60, 400);
            const answer = pa1 * qa2 + pb1 * qb2;
            return {
                prompt: `${s.place} produces only ${s.gA} and ${s.gB}. Year 1 is the base year, with prices of ${eur(pa1)} per ${s.uA1} of ${s.gA} and ${eur(pb1)} per ${s.uB1} of ${s.gB}. In year 2 it produces ${n(qa2)} ${s.uA} of ${s.gA} (price now ${eur(pa2)}) and ${n(qb2)} ${s.uB} of ${s.gB} (price now ${eur(pb2)}). What is **real** GDP of year 2?`,
                given: {
                    "Base-year prices": `${s.gA} ${eur(pa1)}, ${s.gB} ${eur(pb1)}`,
                    "Year-2 quantities": `${n(qa2)} ${s.uA} ${s.gA}, ${n(qb2)} ${s.uB} ${s.gB}`,
                    "Year-2 prices": `${s.gA} ${eur(pa2)}, ${s.gB} ${eur(pb2)}`,
                },
                answer,
                explanation: String.raw`$Y_2^{real} = \sum p^{base} \, q_2$ - real GDP values current quantities at **base-year** prices, so only quantities matter: ${eur(pa1)} · ${n(qa2)} + ${eur(pb1)} · ${n(qb2)} = ${eur(answer)}. The year-2 prices are needed for nominal GDP, not here.`,
                hint: String.raw`Real GDP strips price changes out by valuing the quantities of the year in question at the prices of the base year: $Y_t^{real} = \sum p^{base} \, q_t$.`,
            };
        },
    },
    {
        id: "ec2-rn-deflator-inflation",
        subject: "econ2",
        topic: "real_nominal",
        difficulty: "very_hard",
        kind: "numeric",
        unit: "percent",
        source: "TUM Economics II SS2019, Q31",
        build: (rng) => {
            const s = rng.pick(E2_RN_DEFLATOR_INFLATION_SCENARIOS);
            const pa1 = rng.int(2, 7);
            const pb1 = rng.int(12, 20);
            const pa2 = pa1 + rng.int(1, 3);
            const pb2 = pb1 + rng.int(1, 5);
            const qa2 = rng.int(120, 640);
            const qb2 = rng.int(60, 400);
            const nom2 = pa2 * qa2 + pb2 * qb2;
            const real2 = pa1 * qa2 + pb1 * qb2;
            const answer = (nom2 / real2 - 1) * 100;
            return {
                prompt: `${s.place} produces only ${s.gA} and ${s.gB}. Year 1 is the base year with prices of ${eur(pa1)} per ${s.uA1} of ${s.gA} and ${eur(pb1)} per ${s.uB1} of ${s.gB}. In year 2 the economy produces ${n(qa2)} ${s.uA} of ${s.gA} at ${eur(pa2)} and ${n(qb2)} ${s.uB} of ${s.gB} at ${eur(pb2)}. Measured by the **GDP deflator**, what is the inflation rate between year 1 and year 2?`,
                given: {
                    "Base-year prices": `${s.gA} ${eur(pa1)}, ${s.gB} ${eur(pb1)}`,
                    "Year-2 quantities": `${n(qa2)} ${s.uA}, ${n(qb2)} ${s.uB}`,
                    "Year-2 prices": `${s.gA} ${eur(pa2)}, ${s.gB} ${eur(pb2)}`,
                },
                answer,
                explanation: String.raw`$\pi = \frac{P_2}{P_1} - 1$ with $P_t = \frac{Y_t^{nominal}}{Y_t^{real}} \cdot 100$ and $P_1 = 100$ in the base year, so $\pi = \frac{Y_2^{nominal}}{Y_2^{real}} - 1$, both valued with **year-2 quantities**. Nominal: ${eur(pa2)} · ${n(qa2)} + ${eur(pb2)} · ${n(qb2)} = ${eur(nom2)}. Real: ${eur(pa1)} · ${n(qa2)} + ${eur(pb1)} · ${n(qb2)} = ${eur(real2)}. Inflation: ${eur(nom2)} / ${eur(real2)} − 1 = ${pct(answer)}.`,
            };
        },
    },
    {
        id: "ec2-rn-cpi-level",
        subject: "econ2",
        topic: "real_nominal",
        difficulty: "medium",
        kind: "numeric",
        unit: "number",
        source: "TUM Economics II SS2019 Q31; SS2017 Q18",
        build: (rng) => {
            const s = rng.pick(E2_RN_CPI_LEVEL_SCENARIOS);
            const pa1 = rng.int(2, 7);
            const pb1 = rng.int(12, 20);
            const pa2 = pa1 + rng.int(1, 3);
            const pb2 = pb1 + rng.int(1, 5);
            const qa1 = rng.int(120, 640);
            const qb1 = rng.int(60, 400);
            const base = pa1 * qa1 + pb1 * qb1;
            const now = pa2 * qa1 + pb2 * qb1;
            const answer = (100 * now) / base;
            return {
                prompt: `Consumers in ${s.place} buy only ${s.gA} and ${s.gB}. The base-year basket is ${n(qa1)} ${s.uA} of ${s.lA} and ${n(qb1)} ${s.uB} of ${s.lB}, at base-year prices of ${eur(pa1)} per ${s.uA1} and ${eur(pb1)} per ${s.uB1}. This year, prices are ${eur(pa2)} per ${s.uA1} and ${eur(pb2)} per ${s.uB1}. What is this year's **Consumer Price Index (CPI)**, on a scale where the base year equals 100?`,
                given: {
                    "Basket (base year)": `${n(qa1)} ${s.uA}, ${n(qb1)} ${s.uB}`,
                    "Base-year prices": `${s.lA} ${eur(pa1)}, ${s.lB} ${eur(pb1)}`,
                    "Current prices": `${s.lA} ${eur(pa2)}, ${s.lB} ${eur(pb2)}`,
                },
                answer,
                explanation: String.raw`$CPI_t = \frac{\sum p_t \, q^{base}}{\sum p^{base} \, q^{base}} \cdot 100$ - the **fixed base-year basket** is priced at both years' prices. At base prices the basket costs ${eur(base)}; at current prices ${eur(pa2)} · ${n(qa1)} + ${eur(pb2)} · ${n(qb1)} = ${eur(now)}. CPI = 100 · ${eur(now)} / ${eur(base)} = ${n2(answer)}.`,
            };
        },
    },

    // ------------------------------------- inflation & interest (expansion)
    {
        id: "ec2-ii-real-wage-growth",
        subject: "econ2",
        topic: "inflation_interest",
        difficulty: "very_easy",
        kind: "numeric",
        unit: "percent",
        source: "TUM Economics II SS2019, Q27 (real wage growth definition)",
        build: (rng) => {
            const gW = rng.int(5, 45) / 10;
            const piInfl = rng.int(4, 38) / 10;
            const country = rng.pick(EU_COUNTRIES);
            const answer = gW - piInfl;
            return {
                prompt: `In ${country}, nominal wages grew by ${pct(gW)} last year while consumer prices rose by ${pct(piInfl)}. What was the growth rate of **real** wages? (Use the approximation, not the exact ratio.)`,
                given: {
                    "Nominal wage growth": pct(gW),
                    "Inflation": pct(piInfl),
                },
                answer,
                explanation: String.raw`$g_{W/P} = g_W - \pi$ - real wage growth is nominal wage growth minus inflation: ${pct(gW)} − ${pct(piInfl)} = ${pct(answer)}. ${answer < 0 ? "Prices rose faster than wages, so workers' purchasing power fell despite the nominal raise." : answer > 0 ? "Wages outpaced prices, so purchasing power rose." : "Wages only kept pace with prices - purchasing power was unchanged."}`,
                hint: String.raw`The real wage is the nominal wage deflated by the price level, so to a first approximation its growth rate is the difference of the two growth rates: $g_{W/P} = g_W - \pi$.`,
            };
        },
    },
    {
        id: "ec2-ii-bargaining-gap",
        subject: "econ2",
        topic: "inflation_interest",
        difficulty: "easy",
        kind: "numeric",
        unit: "percent",
        source: "TUM Economics II lecture, Unit VIII slide 19 (Phillips curve with expectations)",
        build: (rng) => {
            const piLag = rng.int(4, 40) / 10;
            const gap = (rng.int(2, 20) / 10) * rng.pick([1, -1]);
            const country = rng.pick(EU_COUNTRIES);
            const answer = piLag + gap;
            return {
                prompt: `In ${country}, wage bargainers form their inflation expectations **adaptively**. Last year's inflation was ${pct(piLag)}. Unemployment is ${gap > 0 ? "below" : "above"} its equilibrium level, creating a bargaining gap of ${pct(gap)}. According to the Phillips curve with expectations, what is this year's inflation rate?`,
                given: {
                    "Last year's inflation": pct(piLag),
                    "Bargaining gap": pct(gap),
                    "Expectations": "adaptive",
                },
                answer,
                explanation: String.raw`$\pi = \pi^e + \text{bargaining gap}$ - expected inflation is built into wage claims, and the bargaining gap adds to (or subtracts from) it: ${pct(piLag)} ${gap >= 0 ? "+" : "−"} ${pct(Math.abs(gap))} = ${pct(answer)}.`,
                hint: String.raw`Adaptive expectations means bargainers simply carry last year's actual inflation forward as this year's expectation, and the bargaining gap is added on top of it: $\pi = \pi^e + \text{gap}$ with $\pi^e = \pi_{-1}$.`,
            };
        },
    },
    {
        id: "ec2-ii-inflation-path",
        subject: "econ2",
        topic: "inflation_interest",
        difficulty: "hard",
        kind: "numeric",
        unit: "percent",
        source: "TUM Economics II lecture, Unit VIII slide 20 (constant gap, rising inflation)",
        build: (rng) => {
            const pi0 = rng.int(10, 40) / 10;
            const gap = rng.int(5, 20) / 10;
            const N = rng.int(2, 5);
            const country = rng.pick(EU_COUNTRIES);
            const answer = pi0 + N * gap;
            return {
                prompt: `${country[0].toUpperCase()}${country.slice(1)} starts in year 0 with inflation of ${pct(pi0)} and a labour market in equilibrium. From year 1 on, a boom keeps unemployment below equilibrium, creating a constant **positive bargaining gap of ${pct(gap)}** in every year. Expectations are **adaptive**. What is the inflation rate in year ${n(N)}?`,
                given: {
                    "Inflation in year 0": pct(pi0),
                    "Bargaining gap (each year from year 1)": pct(gap),
                    "Expectations": "adaptive",
                },
                answer,
                explanation: String.raw`$\pi_t = \pi_{t-1} + \text{gap}$ - with adaptive expectations, $\pi_t = \pi_t^e + \text{gap} = \pi_{t-1} + \text{gap}$, so a constant gap makes inflation **ratchet up every year**: after ${n(N)} years, $\pi_{${N}} = ${n(pi0)}\,\% + ${n(N)} \cdot ${n(gap)}\,\%$ = ${pct(answer)}. Inflation does not stay at ${pct(pi0 + gap)} - that is the classic mistake.`,
                hint: String.raw`With adaptive expectations the rate expected this year is last year's actual rate, so a gap that persists is added on again in every single year instead of once: $\pi_t = \pi_{t-1} + \text{gap}$.`,
            };
        },
    },
    {
        id: "ec2-ii-borrower-real",
        subject: "econ2",
        topic: "inflation_interest",
        difficulty: "medium",
        kind: "numeric",
        unit: "percent",
        source: "TUM Economics II lecture, Unit VIII slide 6 (Fisher equation example)",
        build: (rng) => {
            const s = rng.pick(E2_II_BORROWER_REAL_SCENARIOS);
            const P = 100 * rng.int(2, 20);
            const i = rng.int(3, 12);
            const R = P * (1 + i / 100);
            const piInfl = rng.int(5, Math.max(6, 10 * i - 5)) / 10;
            const answer = i - piInfl;
            return {
                prompt: `${s.name} lends ${eur(P)} to a friend in ${s.country} for one year and receives a repayment of ${eur(R)}. Over that year, inflation turns out to be ${pct(piInfl)}. What **real** interest rate did ${s.name} earn (Fisher approximation)?`,
                given: {
                    "Amount lent": eur(P),
                    "Repayment after one year": eur(R),
                    "Inflation": pct(piInfl),
                },
                answer,
                explanation: String.raw`$r = i - \pi$ - first recover the nominal rate from the repayment: $i = \frac{${n(R)}}{${n(P)}} - 1$ = ${pct(i)}. Then subtract inflation: ${pct(i)} − ${pct(piInfl)} = ${pct(answer)}. In real terms ${s.name} can buy ${pct(answer)} more than a year ago, not ${pct(i)}.`,
            };
        },
    },
    {
        id: "ec2-ii-required-nominal",
        subject: "econ2",
        topic: "inflation_interest",
        difficulty: "easy",
        kind: "numeric",
        unit: "percent",
        source: "TUM Economics II SS2017 Q23; lecture Unit VIII slide 6",
        build: (rng) => {
            const s = rng.pick(E2_II_REQUIRED_NOMINAL_SCENARIOS);
            const r = rng.int(5, 40) / 10;
            const piInfl = rng.int(8, 45) / 10;
            const answer = r + piInfl;
            return {
                prompt: `${s.investor} wants its one-year bond investments to earn a **real** return of ${pct(r)}. It expects inflation of ${pct(piInfl)} over the year. What nominal interest rate must the bonds pay (Fisher approximation)?`,
                given: {
                    "Target real return r": pct(r),
                    "Expected inflation π": pct(piInfl),
                },
                answer,
                explanation: String.raw`$i = r + \pi^e$ - rearranging the Fisher approximation $r = i - \pi$: ${pct(r)} + ${pct(piInfl)} = ${pct(answer)}. The nominal rate must cover both the desired real return and the expected loss of purchasing power.`,
            };
        },
    },
    {
        id: "ec2-ii-real-value",
        subject: "econ2",
        topic: "inflation_interest",
        difficulty: "medium",
        kind: "numeric",
        unit: "EUR",
        source: "TUM Economics II lecture, Unit VIII slide 7 (inflation and fixed nominal income)",
        build: (rng) => {
            const s = rng.pick(E2_II_REAL_VALUE_SCENARIOS);
            const X = 100 * rng.int(8, 30);
            const piInfl = rng.int(2, 9);
            const answer = X / (1 + piInfl / 100);
            return {
                prompt: `${s.who} keeps ${eur(X)} ${s.how} for exactly one year, during which prices rise by ${pct(piInfl)}. What is the **real value** of the cash at the end of the year, expressed in start-of-year euros?`,
                given: {
                    "Nominal amount": eur(X),
                    "Inflation over the year": pct(piInfl),
                },
                answer,
                explanation: String.raw`$\text{real value} = \frac{X}{1 + \pi}$ - after inflation of ${pct(piInfl)}, every euro buys $1/(1+\pi)$ of what it used to: ${eur(X)} / ${n(1 + piInfl / 100)} = ${eur(answer)}. This is why unexpected inflation hurts people on fixed nominal incomes and benefits debtors.`,
                hint: String.raw`Rising prices shrink what a fixed nominal amount buys, so deflate the amount by the price level of the year you want to express it in: $\text{real value} = \frac{X}{1 + \pi}$.`,
            };
        },
    },

    // ------------------------------------------- goods market (expansion)
    {
        id: "ec2-gm-import-multiplier",
        subject: "econ2",
        topic: "goods_market",
        difficulty: "hard",
        kind: "numeric",
        unit: "number",
        source: "TUM Economics II lecture, Unit IV slides 26/36 (multiplier with imports)",
        build: (rng) => {
            const s = rng.pick(E2_GM_IMPORT_MULTIPLIER_SCENARIOS);
            const c1 = rng.pick([0.6, 0.75, 0.8] as const);
            const t = rng.pick([0.2, 0.25, 0.3] as const);
            const m = rng.pick([0.1, 0.15, 0.2] as const);
            const dG = 25 * rng.int(2, 12);
            const D = 1 - c1 * (1 - t) + m;
            const mult = 1 / D;
            const answer = dG * mult;
            return {
                prompt: String.raw`In ${s.place}, consumption follows $C = c_0 + c_1 (1 - t) Y$ with $c_1 = ${n(c1)}$ and a tax rate of ${pct(t * 100)}. In addition, households spend a fraction $m = ${n(m)}$ of every extra unit of income on **imports** (the marginal propensity to import). The government raises its purchases by ${n(dG)}. By how much does equilibrium output rise?`,
                given: {
                    "Marginal propensity to consume $c_1$": n(c1),
                    "Income tax rate t": pct(t * 100),
                    "Marginal propensity to import m": n(m),
                    "Increase in G": n(dG),
                },
                answer,
                explanation: String.raw`$\Delta Y = \frac{1}{1 - c_1 (1 - t) + m} \cdot \Delta G$ - import spending leaks out of the domestic circular flow, so $m$ **adds** to the multiplier denominator: 1 − ${n(c1)} · ${n(1 - t)} + ${n(m)} = ${n(D)}, multiplier ${n2(mult)}, so ΔY = ${n2(mult)} · ${n(dG)} = ${n2(answer)} - noticeably less than the closed-economy multiplier of ${n2(1 / (1 - c1 * (1 - t)))} would deliver.`,
            };
        },
    },
    {
        id: "ec2-gm-investment-shock",
        subject: "econ2",
        topic: "goods_market",
        difficulty: "medium",
        kind: "numeric",
        unit: "number",
        source: "TUM Economics II lecture, Unit IV slides 9-10 (negative investment shock)",
        build: (rng) => {
            const s = rng.pick(E2_GM_INVESTMENT_SHOCK_SCENARIOS);
            const c1 = rng.pick([0.6, 0.75, 0.8] as const);
            const t = rng.pick([0.2, 0.25, 0.3] as const);
            const dI = 25 * rng.int(2, 10);
            const D = 1 - c1 * (1 - t);
            const answer = dI / D;
            return {
                prompt: String.raw`${s.shock} ${n(dI)}. Consumption follows $C = c_0 + c_1 (1 - t) Y$ with $c_1 = ${n(c1)}$ and an income tax rate of ${pct(t * 100)}; all other demand components are unchanged. By how much does equilibrium output **fall**? (Give the fall as a positive number.)`,
                given: {
                    "Fall in investment": n(dI),
                    "Marginal propensity to consume $c_1$": n(c1),
                    "Income tax rate t": pct(t * 100),
                },
                answer,
                explanation: String.raw`$|\Delta Y| = \frac{1}{1 - c_1 (1 - t)} \cdot |\Delta I|$ - the multiplier works identically for any demand component, downward as well as upward. Denominator: 1 − ${n(c1)} · ${n(1 - t)} = ${n(D)}, so the fall is ${n(dI)} / ${n(D)} = ${n2(answer)} - the initial shock of ${n(dI)} is amplified as lower income cuts consumption round after round.`,
            };
        },
    },
    {
        id: "ec2-gm-c0-shock",
        subject: "econ2",
        topic: "goods_market",
        difficulty: "medium",
        kind: "numeric",
        unit: "number",
        source: "TUM Economics II lecture, Unit IV slides 13/18 (precautionary saving shifts AD)",
        build: (rng) => {
            const s = rng.pick(E2_GM_C0_SHOCK_SCENARIOS);
            const c1 = rng.pick([0.6, 0.75, 0.8] as const);
            const t = rng.pick([0.2, 0.25, 0.3] as const);
            const dc0 = 25 * rng.int(2, 8);
            const D = 1 - c1 * (1 - t);
            const answer = dc0 / D;
            return {
                prompt: String.raw`${s.cause} engage in precautionary saving: autonomous consumption $c_0$ drops by ${n(dc0)}. Consumption follows $C = c_0 + c_1 (1 - t) Y$ with $c_1 = ${n(c1)}$ and a tax rate of ${pct(t * 100)}. By how much does equilibrium output fall? (Positive number.)`,
                given: {
                    "Fall in autonomous consumption": n(dc0),
                    "Marginal propensity to consume $c_1$": n(c1),
                    "Income tax rate t": pct(t * 100),
                },
                answer,
                explanation: String.raw`$|\Delta Y| = \frac{|\Delta c_0|}{1 - c_1 (1 - t)}$ - a shift in autonomous consumption moves the AD curve just like a change in $I$ or $G$ and is amplified by the same multiplier: ${n(dc0)} / ${n(D)} = ${n2(answer)}. This is the paradox of thrift: the attempt to save more shrinks income for everyone.`,
            };
        },
    },
    {
        id: "ec2-gm-new-equilibrium",
        subject: "econ2",
        topic: "goods_market",
        difficulty: "hard",
        kind: "numeric",
        unit: "number",
        source: "TUM Economics II SS2018, Q11-12 (new equilibrium after ΔI and ΔG)",
        build: (rng) => {
            const s = rng.pick(E2_GM_NEW_EQUILIBRIUM_SCENARIOS);
            const d = drawGM2(rng);
            const dI = 25 * rng.int(2, 8);
            const dG = 25 * rng.int(1, Math.max(1, Math.min(6, d.G / 25 - 1)));
            const I0 = d.I + dI;
            const G0 = d.G - dG;
            return {
                prompt: String.raw`The economy of ${s.place} has consumption $C = c_0 + c_1 (1 - t) Y$ with $c_0 = ${n(d.c0)}$, $c_1 = ${n(d.c1)}$ and a tax rate of ${pct(d.t * 100)}; exports are ${n(d.X)} and imports ${n(d.M)}. Initially, investment is ${n(I0)} and government purchases are ${n(G0)}. Then ${s.cause} ${n(d.I)}, and the government responds by raising its purchases to ${n(d.G)}. What is the **new** equilibrium output?`,
                given: {
                    "Autonomous consumption $c_0$": n(d.c0),
                    "Marginal propensity to consume $c_1$": n(d.c1),
                    "Income tax rate t": pct(d.t * 100),
                    "Exports X / imports M": `${n(d.X)} / ${n(d.M)}`,
                    "Investment: before / after": `${n(I0)} / ${n(d.I)}`,
                    "Government purchases: before / after": `${n(G0)} / ${n(d.G)}`,
                },
                answer: d.Y,
                explanation: String.raw`$Y = \frac{c_0 + I + G + X - M}{1 - c_1 (1 - t)}$ - only the **new** values of $I$ and $G$ matter for the new equilibrium. Autonomous demand: ${n(d.c0)} + ${n(d.I)} + ${n(d.G)} + ${n(d.X)} − ${n(d.M)} = ${n(d.A)}; denominator: 1 − ${n(d.c1)} · ${n(1 - d.t)} = ${n(d.D)}; so Y = ${n(d.A)} / ${n(d.D)} = ${n(d.Y)}.`,
            };
        },
    },
    {
        id: "ec2-gm-tax-revenue",
        subject: "econ2",
        topic: "goods_market",
        difficulty: "medium",
        kind: "numeric",
        unit: "number",
        source: "TUM Economics II SS2019 Q7; SS2018 Q11 (BB = tY − G components)",
        build: (rng) => {
            const s = rng.pick(E2_GM_TAX_REVENUE_SCENARIOS);
            const d = drawGM2(rng);
            const answer = d.t * d.Y;
            return {
                prompt: String.raw`${s.placePoss} consumption is $C = c_0 + c_1 (1 - t) Y$ with $c_0 = ${n(d.c0)}$, $c_1 = ${n(d.c1)}$ and a proportional income tax of ${pct(d.t * 100)}. Investment is ${n(d.I)}, government purchases ${n(d.G)}, exports ${n(d.X)}, imports ${n(d.M)}. What is the government's **tax revenue** in the goods-market equilibrium?`,
                given: gm2Given(d),
                answer,
                explanation: String.raw`$T = t \cdot Y^*$ - first solve for equilibrium output: $Y^* = \frac{c_0 + I + G + X - M}{1 - c_1(1-t)}$ = ${n(d.A)} / ${n(d.D)} = ${n(d.Y)}. Then tax revenue is ${n(d.t)} · ${n(d.Y)} = ${n(answer)}. The budget balance would additionally subtract G (${n(d.G)}), giving ${n(answer - d.G)}.`,
                hint: String.raw`A proportional income tax raises revenue on the income actually earned, so the goods market has to be solved for equilibrium output before the rate is applied: $T = t \cdot Y^*$.`,
            };
        },
    },

    // ------------------------------------------- labor market (expansion)
    {
        id: "ec2-lm-effort-cost",
        subject: "econ2",
        topic: "labor_market",
        difficulty: "very_easy",
        kind: "numeric",
        unit: "EUR",
        source: "TUM Economics II lecture, Unit V slide 22 (cost per unit of effort)",
        build: (rng) => {
            const s = rng.pick(E2_LM_EFFORT_COST_SCENARIOS);
            const w = rng.int(9, 24);
            const e = rng.pick([0.4, 0.5, 0.6, 0.75, 0.8] as const);
            const answer = w / e;
            return {
                prompt: `${s.firm} pays its ${s.workers} a wage of ${eur(w)} per hour. At that wage, one ${s.worker} provides ${n(e)} units of effort per hour. What is the firm's **cost per unit of effort**?`,
                given: {
                    "Hourly wage w": eur(w),
                    "Effort per hour e": n(e),
                },
                answer,
                explanation: String.raw`$c = \frac{w}{e}$ - what matters for production is not the hour but the effort delivered in it: ${eur(w)} / ${n(e)} = ${eur(answer)} per unit of effort. This is the quantity the efficiency-wage-setting firm minimizes.`,
            };
        },
    },
    {
        id: "ec2-lm-price-setting",
        subject: "econ2",
        topic: "labor_market",
        difficulty: "easy",
        kind: "numeric",
        unit: "EUR",
        source: "TUM Economics II lecture, Unit V slide 42 (price-setting curve w = λ(1 − μ))",
        build: (rng) => {
            const s = rng.pick(E2_LM_PRICE_SETTING_SCENARIOS);
            const lam = rng.int(40, 120);
            const mu = rng.pick([0.1, 0.15, 0.2, 0.25] as const);
            const answer = lam * (1 - mu);
            return {
                prompt: `In ${s.sector}, output per worker is ${eur(lam)} per day. Competition in the product market pins the firms' markup at ${pct(mu * 100)}. According to the price-setting curve, what **real wage** per worker and day results when all firms set their profit-maximizing prices?`,
                given: {
                    "Output per worker λ": eur(lam),
                    "Markup μ": pct(mu * 100),
                },
                answer,
                explanation: String.raw`$\frac{W}{P} = \lambda (1 - \mu)$ - the markup claims the share $\mu$ of output per worker for profits, leaving the rest as the real wage: ${eur(lam)} · ${n(1 - mu)} = ${eur(answer)}.`,
            };
        },
    },
    {
        id: "ec2-lm-profit-per-worker",
        subject: "econ2",
        topic: "labor_market",
        difficulty: "easy",
        kind: "numeric",
        unit: "EUR",
        source: "TUM Economics II lecture, Unit V slide 39 (division of output per worker)",
        build: (rng) => {
            const s = rng.pick(E2_LM_PROFIT_PER_WORKER_SCENARIOS);
            const lam = rng.int(40, 120);
            const mu = rng.pick([0.1, 0.15, 0.2, 0.25] as const);
            const answer = lam * mu;
            return {
                prompt: `Firms in ${s.sector} produce output worth ${eur(lam)} per worker and day and, given the intensity of competition, charge a markup of ${pct(mu * 100)}. What is the **real profit per worker** and day that accrues to the owners?`,
                given: {
                    "Output per worker λ": eur(lam),
                    "Markup μ": pct(mu * 100),
                },
                answer,
                explanation: String.raw`$\frac{\Pi}{p} = \lambda \cdot \mu$ - output per worker splits into real profit per worker and the real wage, $\lambda = \frac{\Pi}{p} + \frac{W}{p}$: profits take ${eur(lam)} · ${n(mu)} = ${eur(answer)}, and the real wage is the remainder, ${eur(lam * (1 - mu))}.`,
            };
        },
    },
    {
        id: "ec2-lm-rent-benefit-change",
        subject: "econ2",
        topic: "labor_market",
        difficulty: "medium",
        kind: "numeric",
        unit: "EUR",
        source: "TUM Economics II SS2019, Q13 (rent after a change in benefits)",
        build: (rng) => {
            const s = rng.pick(E2_LM_RENT_BENEFIT_CHANGE_SCENARIOS);
            const w = rng.int(14, 32);
            const dis = rng.int(3, 8);
            const H = rng.pick([36, 38, 42] as const);
            const bh = rng.int(2, w - dis - 3);
            const B = bh * H;
            const dB = 10 * rng.int(2, 8);
            const weeks = rng.int(20, 45);
            const answer = dB * weeks;
            return {
                prompt: `${s.who} earns ${eur(w)} per hour for ${n(H)} hours a week; ${s.poss} disutility of effort is ${eur(dis)} per hour. If dismissed, ${s.subj} would expect ${n(weeks)} weeks of unemployment with a weekly benefit of ${eur(B)}. The government now **raises** the weekly unemployment benefit by ${eur(dB)}. By how much does ${s.poss} **total employment rent** for the expected unemployment spell **fall**?`,
                given: {
                    "Hourly wage": eur(w),
                    "Hours per week": n(H),
                    "Disutility of effort (per hour)": eur(dis),
                    "Weekly benefit: increase": eur(dB),
                    "Expected unemployment duration": `${n(weeks)} weeks`,
                },
                answer,
                explanation: String.raw`$\Delta R = \Delta B \cdot T$ - the hourly rent falls by $\frac{\Delta B}{H}$, and the total rent is the hourly rent times $H \cdot T$, so the hours cancel: ${eur(dB)} · ${n(weeks)} = ${eur(answer)}. Recomputing the whole rent from scratch works too but is unnecessary - the wage and disutility terms are unchanged.`,
            };
        },
    },

    // --------------------------------------- labour market statistics (new)
    {
        id: "ec2-ls-unemployment-rate",
        subject: "econ2",
        topic: "labor_stats",
        difficulty: "very_easy",
        kind: "numeric",
        unit: "percent",
        source: "TUM Economics II lecture, Unit V slide 8 (labour market statistics)",
        build: (rng) => {
            const country = rng.pick(WORLD_COUNTRIES);
            const E = rng.int(150, 450) / 10;
            const U = rng.int(8, 60) / 10;
            const answer = (U / (E + U)) * 100;
            return {
                prompt: `In ${country}, ${n(E)} million people are employed and ${n(U)} million are unemployed according to the ILO definition. What is the **unemployment rate**?`,
                given: {
                    "Employed": `${n(E)} million`,
                    "Unemployed": `${n(U)} million`,
                },
                answer,
                explanation: String.raw`$u = \frac{U}{\text{labour force}} = \frac{U}{E + U}$ - the denominator is the labour force (employed **plus** unemployed), not the population: ${n(U)} / ${n(E + U)} = ${pct(answer)}.`,
            };
        },
    },
    {
        id: "ec2-ls-participation-rate",
        subject: "econ2",
        topic: "labor_stats",
        difficulty: "very_easy",
        kind: "numeric",
        unit: "percent",
        source: "TUM Economics II lecture, Unit V slide 8 (participation rate)",
        build: (rng) => {
            const country = rng.pick(WORLD_COUNTRIES);
            const E = rng.int(150, 450) / 10;
            const U = rng.int(8, 60) / 10;
            const wap = Math.round((E + U) * (1 + rng.int(20, 60) / 100) * 10) / 10;
            const answer = ((E + U) / wap) * 100;
            return {
                prompt: `The working-age population of ${country} is ${n(wap)} million. Of these, ${n(E)} million are employed and ${n(U)} million are unemployed; the rest are not in the labour force. What is the **participation rate**?`,
                given: {
                    "Working-age population": `${n(wap)} million`,
                    "Employed": `${n(E)} million`,
                    "Unemployed": `${n(U)} million`,
                },
                answer,
                explanation: String.raw`$\text{participation rate} = \frac{\text{labour force}}{\text{working-age population}} = \frac{E + U}{WAP}$ - the unemployed count as part of the labour force: (${n(E)} + ${n(U)}) / ${n(wap)} = ${pct(answer)}.`,
            };
        },
    },
    {
        id: "ec2-ls-employment-rate",
        subject: "econ2",
        topic: "labor_stats",
        difficulty: "easy",
        kind: "numeric",
        unit: "percent",
        source: "TUM Economics II lecture, Unit V slides 8-9 (employment vs. unemployment rate)",
        build: (rng) => {
            const country = rng.pick(WORLD_COUNTRIES);
            const E = rng.int(150, 450) / 10;
            const U = rng.int(8, 60) / 10;
            const wap = Math.round((E + U) * (1 + rng.int(20, 60) / 100) * 10) / 10;
            const answer = (E / wap) * 100;
            return {
                prompt: `In ${country}, the working-age population is ${n(wap)} million, of whom ${n(E)} million are employed and ${n(U)} million are unemployed. What is the **employment rate**?`,
                given: {
                    "Working-age population": `${n(wap)} million`,
                    "Employed": `${n(E)} million`,
                    "Unemployed": `${n(U)} million`,
                },
                answer,
                explanation: String.raw`$\text{employment rate} = \frac{E}{WAP}$ - employed relative to the **working-age population**, not to the labour force: ${n(E)} / ${n(wap)} = ${pct(answer)}. (Dividing by the labour force ${n(E + U)} would mix it up with the unemployment rate's denominator - that is why a country can have a low unemployment rate and a low employment rate at the same time.)`,
            };
        },
    },
    {
        id: "ec2-ls-employed-count",
        subject: "econ2",
        topic: "labor_stats",
        difficulty: "medium",
        kind: "numeric",
        unit: "number",
        source: "TUM Economics II lecture, Unit V slide 8 (combining the three rates)",
        build: (rng) => {
            const country = rng.pick(WORLD_COUNTRIES);
            const wap = rng.int(30, 70);
            const part = rng.int(60, 80);
            const u = rng.int(3, 12);
            const lf = wap * (part / 100);
            const answer = lf * (1 - u / 100);
            return {
                prompt: `${country[0].toUpperCase()}${country.slice(1)} has a working-age population of ${n(wap)} million, a participation rate of ${pct(part)} and an unemployment rate of ${pct(u)}. How many million people are **employed**?`,
                given: {
                    "Working-age population": `${n(wap)} million`,
                    "Participation rate": pct(part),
                    "Unemployment rate": pct(u),
                },
                answer,
                explanation: String.raw`$E = WAP \cdot \text{participation rate} \cdot (1 - u)$ - the participation rate gives the labour force, and the unemployment rate carves out the jobless share of that labour force: ${n(wap)} · ${n(part / 100)} = ${n2(lf)} million in the labour force, times ${n(1 - u / 100)} = ${n2(answer)} million employed.`,
            };
        },
    },

    // ------------------------------------------- intertemporal (expansion)
    {
        id: "ec2-it-smoothing",
        subject: "econ2",
        topic: "intertemporal",
        difficulty: "hard",
        kind: "numeric",
        unit: "number",
        source: "TUM Economics II SS2018, Q23-24 (Cobb-Douglas consumption smoothing)",
        build: (rng) => {
            const s = rng.pick(E2_IT_SMOOTHING_SCENARIOS);
            const y1 = 10 * rng.int(4, 16);
            const r = 3 * rng.int(1, 10);
            const c1 = y1 / 2;
            const answer = (1 + r / 100) * c1;
            return {
                prompt: String.raw`${s.name} in ${s.country} earns ${n(y1)} thousand € this year and nothing next year. ${cap(s.subj)} can save any part of it at an interest rate of ${pct(r)} and has the utility function $U = C_1^{0.5} \cdot C_2^{0.5}$ over consumption this year ($C_1$) and next year ($C_2$). How much does ${s.subj} optimally consume **next year**, in thousand €?`,
                given: {
                    "Income this year": `${n(y1)} thousand €`,
                    "Income next year": "0",
                    "Interest rate r": pct(r),
                    "Utility": String.raw`$U = C_1^{0.5} \cdot C_2^{0.5}$`,
                },
                answer,
                explanation: String.raw`$MRS = \frac{C_2}{C_1} = 1 + r = MRT$ - at the optimum the indifference curve is tangent to the budget line $C_2 = (1+r)(y_1 - C_1)$. Substituting $C_2 = (1+r) C_1$ into the budget line gives $C_1 = \frac{y_1}{2}$ = ${n(c1)}: with equal exponents ${s.subj} splits ${s.poss} endowment half-half. So $C_2 = (1+r) \cdot \frac{y_1}{2}$ = ${n(1 + r / 100)} · ${n(c1)} = ${n(answer)} thousand €.`,
            };
        },
    },
    {
        id: "ec2-it-mrs",
        subject: "econ2",
        topic: "intertemporal",
        difficulty: "medium",
        kind: "numeric",
        unit: "ratio",
        source: "TUM Economics II SS2017 (MRS problem); lecture Unit VII slide 11",
        build: (rng) => {
            const s = rng.pick(E2_IT_MRS_SCENARIOS);
            const a = rng.int(1, 3);
            const b = rng.int(1, 3);
            const C1 = rng.int(2, 12);
            const C2 = rng.int(2, 12);
            const answer = (a * C2) / (b * C1);
            return {
                prompt: String.raw`${s.name} evaluates consumption this year ($C_1$) and next year ($C_2$) with the utility function $U = C_1^{${a}} \cdot C_2^{${b}}$. What is ${s.poss} marginal rate of substitution $MRS_{C_1, C_2}$ at the bundle $C_1 = ${C1}$, $C_2 = ${C2}$?`,
                given: {
                    "Utility": String.raw`$U = C_1^{${a}} \cdot C_2^{${b}}$`,
                    "Bundle": String.raw`$C_1 = ${C1}$, $C_2 = ${C2}$`,
                },
                answer,
                explanation: String.raw`$MRS = \frac{\partial U / \partial C_1}{\partial U / \partial C_2} = \frac{${a} \, C_2}{${b} \, C_1}$ - the exponents come down when differentiating, and the remaining powers cancel: ${n(a)} · ${n(C2)} / (${n(b)} · ${n(C1)}) = ${n2(answer)}. This is how many units of next year's consumption ${s.name} will give up for one more unit this year.`,
            };
        },
    },
    {
        id: "ec2-it-return",
        subject: "econ2",
        topic: "intertemporal",
        difficulty: "easy",
        kind: "numeric",
        unit: "percent",
        source: "TUM Economics II SS2019, Q26",
        build: (rng) => {
            const s = rng.pick(E2_IT_RETURN_SCENARIOS);
            const y1 = 20 * rng.int(2, 6);
            const r = 3 * rng.int(1, 10) * rng.pick([1, -1]);
            const F = y1 * (1 + r / 100);
            return {
                prompt: `${s.name} in ${s.country} earns ${n(y1)} thousand € this year and nothing next year. If ${s.subj} invests ${s.poss} entire income in ${s.poss} ${s.venture}, ${s.subj} can consume at most ${n(F)} thousand € next year (there is no other way to transfer income between the years). What rate of return does ${s.poss} investment yield? A negative number means the investment loses value.`,
                given: {
                    "Maximum consumption this year": `${n(y1)} thousand €`,
                    "Maximum consumption next year": `${n(F)} thousand €`,
                },
                answer: r,
                explanation: String.raw`$1 + r = \frac{C_2^{max}}{C_1^{max}}$ - the two intercepts of the feasible frontier differ exactly by the return factor: ${n(F)} / ${n(y1)} = ${n(1 + r / 100)}, so r = ${pct(r)}. ${r < 0 ? `The frontier is flatter than the 45° line: storage-like investment that loses value still lets ${s.obj} move some consumption to next year.` : "The frontier is steeper than the 45° line, so shifting consumption to next year earns a premium."}`,
            };
        },
    },
    {
        id: "ec2-it-pv-max",
        subject: "econ2",
        topic: "intertemporal",
        difficulty: "medium",
        kind: "numeric",
        unit: "number",
        source: "TUM Economics II SS2017 Q13; lecture Unit VII slide 9 (borrowing against future income)",
        build: (rng) => {
            const s = rng.pick(E2_IT_PV_MAX_SCENARIOS);
            const r = rng.pick([5, 10, 20, 25, 50] as const);
            const k = rng.int(1, 5);
            const y2 = ((100 + r) * k) / 10;
            const pv2 = 10 * k;
            const y1 = 10 * rng.int(2, 10);
            const answer = y1 + pv2;
            return {
                prompt: `${s.name} in ${s.country} earns ${n(y1)} thousand € this year and will earn ${n(y2)} thousand € next year. ${cap(s.poss)} bank lets ${s.obj} borrow freely against next year's income at an interest rate of ${pct(r)}. What is the **maximum** ${s.subj} could consume this year, in thousand €?`,
                given: {
                    "Income this year": `${n(y1)} thousand €`,
                    "Income next year": `${n(y2)} thousand €`,
                    "Interest rate r": pct(r),
                },
                answer,
                explanation: String.raw`$C_1^{max} = y_1 + \frac{y_2}{1 + r}$ - ${s.subj} can consume ${s.poss} current income plus the **present value** of next year's income, because a loan of $\frac{y_2}{1+r}$ today is exactly repaid by $y_2$ next year: ${n(y1)} + ${n(y2)} / ${n(1 + r / 100)} = ${n(y1)} + ${n(pv2)} = ${n(answer)} thousand €. Adding the two incomes without discounting is the classic trap.`,
            };
        },
    },
    {
        id: "ec2-it-repayment",
        subject: "econ2",
        topic: "intertemporal",
        difficulty: "very_easy",
        kind: "numeric",
        unit: "EUR",
        source: "TUM Economics II lecture, Unit VII slide 9 (repayment = principal + interest)",
        build: (rng) => {
            const s = rng.pick(E2_IT_REPAYMENT_SCENARIOS);
            const P = 100 * rng.int(2, 20);
            const r = rng.int(3, 12);
            const answer = P * (1 + r / 100);
            return {
                prompt: `${s.name} borrows ${eur(P)} from ${s.poss} bank in ${s.country} for one year at an interest rate of ${pct(r)}. How much does ${s.subj} have to repay at the end of the year?`,
                given: {
                    "Principal": eur(P),
                    "Interest rate r": pct(r),
                },
                answer,
                explanation: String.raw`$\text{repayment} = P \cdot (1 + r)$ - principal plus interest: ${eur(P)} · ${n(1 + r / 100)} = ${eur(answer)}. The factor $1 + r$ is the price of bringing buying power forward in time - one unit of consumption today costs $1 + r$ units next year.`,
            };
        },
    },

    // ------------------------------------------ technology & R&D (expansion)
    {
        id: "ec2-tech-cost",
        subject: "econ2",
        topic: "technology_rd",
        difficulty: "very_easy",
        kind: "numeric",
        unit: "EUR",
        source: "TUM Economics II SS2019 Q6; lecture Unit II slide 19 (c = wL + pR)",
        build: (rng) => {
            const s = rng.pick(E2_TECH_COST_SCENARIOS);
            const w = rng.pick(TECH_WAGES);
            const p = rng.pick(TECH_ENERGY_PRICES);
            const L = rng.int(1, 8);
            const R = rng.int(1, 8);
            const answer = w * L + p * R;
            return {
                prompt: `${s.firm} ${s.action} with a technology that uses ${n(L)} workers and ${n(R)} MWh of energy. The wage per worker is ${eur(w)} and energy costs ${eur(p)} per MWh. What are the total costs of one batch?`,
                given: {
                    "Workers L": n(L),
                    "Energy R": `${n(R)} MWh`,
                    "Wage w": eur(w),
                    "Energy price p": eur(p),
                },
                answer,
                explanation: String.raw`$c = w \cdot L + p \cdot R$ - each input times its price: ${eur(w)} · ${n(L)} + ${eur(p)} · ${n(R)} = ${eur(answer)}. The isocost line through this technology collects all input combinations with the same total cost.`,
            };
        },
    },
    {
        id: "ec2-tech-cheapest-gap",
        subject: "econ2",
        topic: "technology_rd",
        difficulty: "medium",
        kind: "numeric",
        unit: "EUR",
        source: "TUM Economics II SS2019, Q6 (cheapest vs. most expensive technology)",
        build: (rng) => {
            const s = rng.pick(E2_TECH_CHEAPEST_GAP_SCENARIOS);
            const w = rng.pick(TECH_WAGES);
            const p = rng.pick(TECH_ENERGY_PRICES);
            const L1 = rng.int(1, 3);
            const R1 = rng.int(6, 10);
            const L2 = rng.int(4, 6);
            const R2 = rng.int(3, 5);
            const L3 = rng.int(7, 10);
            const R3 = rng.int(1, 2);
            const costs = [w * L1 + p * R1, w * L2 + p * R2, w * L3 + p * R3];
            const answer = Math.max(...costs) - Math.min(...costs);
            return {
                prompt: `${s.firm} can ${s.action} with technology **A** (${n(L1)} workers, ${n(R1)} MWh), **B** (${n(L2)} workers, ${n(R2)} MWh) or **C** (${n(L3)} workers, ${n(R3)} MWh). The wage is ${eur(w)} per worker and energy costs ${eur(p)} per MWh. By how much do the total costs of the **most expensive** and the **cheapest** technology differ?`,
                given: {
                    "Technology A": `${n(L1)} workers + ${n(R1)} MWh`,
                    "Technology B": `${n(L2)} workers + ${n(R2)} MWh`,
                    "Technology C": `${n(L3)} workers + ${n(R3)} MWh`,
                    "Wage w": eur(w),
                    "Energy price p": eur(p),
                },
                answer,
                explanation: String.raw`$c_T = w \cdot L_T + p \cdot R_T$ per technology: A costs ${eur(costs[0])}, B costs ${eur(costs[1])}, C costs ${eur(costs[2])}. The gap between the dearest and the cheapest is ${eur(Math.max(...costs))} − ${eur(Math.min(...costs))} = ${eur(answer)}. Which technology wins depends entirely on the relative input prices - that is the engine of technology adoption.`,
            };
        },
    },
    {
        id: "ec2-tech-process-innovation",
        subject: "econ2",
        topic: "technology_rd",
        difficulty: "easy",
        kind: "numeric",
        unit: "EUR",
        source: "TUM Economics II lecture, Unit II slide 31 (process innovation)",
        build: (rng) => {
            const s = rng.pick(E2_TECH_PROCESS_INNOVATION_SCENARIOS);
            const w = rng.pick(TECH_WAGES);
            const p = rng.pick(TECH_ENERGY_PRICES);
            const L = rng.int(1, 5);
            const R = rng.int(5, 9);
            const dR = rng.int(2, 4);
            const cOld = w * L + p * R;
            const cNew = w * L + p * (R - dR);
            const answer = cOld - cNew;
            return {
                prompt: `${s.firm} ${s.action} with ${n(L)} workers and ${n(R)} MWh of ${s.energy} (wage ${eur(w)}, ${s.energy} ${eur(p)} per MWh). A process innovation cuts the ${s.energy} requirement to ${n(R - dR)} MWh with the same number of workers. What is the **innovation rent** per batch?`,
                given: {
                    "Old process": `${n(L)} workers + ${n(R)} MWh`,
                    "New process": `${n(L)} workers + ${n(R - dR)} MWh`,
                    "Wage w": eur(w),
                    [`${s.Energy} price p`]: eur(p),
                },
                answer,
                explanation: String.raw`$IR = c_{old} - c_{new}$ - with the labor input unchanged, only the energy saving matters: $c_{old}$ = ${eur(cOld)}, $c_{new}$ = ${eur(cNew)}, so the rent is $p \cdot \Delta R$ = ${eur(p)} · ${n(dR)} = ${eur(answer)} per batch. First adopters pocket this Schumpeterian rent until competitors catch up.`,
                hint: String.raw`An innovation rent is what the better process saves per batch at the prevailing input prices - the total cost of the old process minus that of the new one: $IR = c_{old} - c_{new}$.`,
            };
        },
    },
    {
        id: "ec2-tech-first-mover-rent",
        subject: "econ2",
        topic: "technology_rd",
        difficulty: "medium",
        kind: "numeric",
        unit: "EUR",
        source: "TUM Economics II lecture, Unit II slide 22 (innovation rents); SS2019 Q6",
        build: (rng) => {
            const s = rng.pick(E2_TECH_FIRST_MOVER_RENT_SCENARIOS);
            const w = rng.pick(TECH_WAGES);
            const dL = rng.int(2, 4);
            const dR = rng.int(2, 3);
            const pOptions = TECH_ENERGY_PRICES.filter((price) => price * dR < w * dL);
            const p = rng.pick(pOptions); // non-empty: w·dL >= 16 > 11·? guarded by filter
            const LA = rng.int(1, 3);
            const LB = LA + dL;
            const RB = rng.int(1, 4);
            const RA = RB + dR;
            const cA = w * LA + p * RA;
            const cB = w * LB + p * RB;
            const q = 50 * rng.int(2, 10);
            const answer = (cB - cA) * q;
            return {
                prompt: `All ${s.firms} in ${s.town} ${s.verb} with technique **B** (${plural(LB, "worker")}, ${n(RB)} MWh per batch). One ${s.firm} pioneers the energy-intensive technique **A** (${plural(LA, "worker")}, ${n(RA)} MWh per batch). The wage is ${eur(w)} per worker, energy costs ${eur(p)} per MWh, and the ${s.firm} produces ${n(q)} batches per year. What **annual innovation rent** does the first mover earn?`,
                given: {
                    "Technique A": `${plural(LA, "worker")} + ${n(RA)} MWh`,
                    "Technique B": `${plural(LB, "worker")} + ${n(RB)} MWh`,
                    "Wage w": eur(w),
                    "Energy price p": eur(p),
                    "Batches per year": n(q),
                },
                answer,
                explanation: String.raw`$IR = (c_B - c_A) \cdot q$ - the rent per batch is the cost difference at the current input prices: $c_A$ = ${eur(w)} · ${n(LA)} + ${eur(p)} · ${n(RA)} = ${eur(cA)}, $c_B$ = ${eur(cB)}, difference ${eur(cB - cA)}. Over ${n(q)} batches the first mover earns ${eur(answer)} per year - until the rivals adopt A and competition erodes the rent.`,
                hint: String.raw`The rent per batch is the cost gap between the pioneer's technique and the one the rest of the industry still uses, priced at the current wage and energy price; a year's rent scales that gap by the batches produced: $IR = (c_B - c_A) \cdot q$.`,
            };
        },
    },

    // ------------------------------------------ exchange rates (expansion)
    {
        id: "ec2-fx-import-price",
        subject: "econ2",
        topic: "exchange_rates",
        difficulty: "very_easy",
        kind: "numeric",
        unit: "number",
        source: "TUM Economics II SS2019, Q32 (import prices and the exchange rate)",
        build: (rng) => {
            const cfg = rng.pick([
                { cur: "zloty", country: "Poland", lo: 400, hi: 560, div: 100 },
                { cur: "yen", country: "Japan", lo: 130, hi: 178, div: 1 },
                { cur: "kronor", country: "Sweden", lo: 980, hi: 1240, div: 100 },
            ] as const);
            const E = rng.int(cfg.lo, cfg.hi) / cfg.div;
            const X = 10 * rng.int(5, 30);
            const answer = X * E;
            return {
                prompt: `A machine part made in Germany costs ${eur(X)}. The exchange rate is ${n2(E)} ${cfg.cur} per euro. How much does the part cost a buyer in ${cfg.country}, in ${cfg.cur}?`,
                given: {
                    "Price in euros": eur(X),
                    "Exchange rate": `${n2(E)} ${cfg.cur} per euro`,
                },
                answer,
                explanation: String.raw`$P^{foreign} = P^{EUR} \cdot E$ - each euro of the price must be bought at ${n2(E)} ${cfg.cur}: ${n(X)} · ${n2(E)} = ${n2(answer)} ${cfg.cur}. If the euro appreciates (E rises), German goods become dearer abroad and export demand falls.`,
            };
        },
    },
    {
        id: "ec2-fx-export-price",
        subject: "econ2",
        topic: "exchange_rates",
        difficulty: "easy",
        kind: "numeric",
        unit: "EUR",
        source: "TUM Economics II SS2019, Q32 (prices across currencies)",
        build: (rng) => {
            const s = rng.pick(E2_FX_EXPORT_PRICE_SCENARIOS);
            const Y = 1000 * rng.int(20, 90);
            const E = rng.int(130, 178);
            const answer = Y / E;
            return {
                prompt: `${s.item} costs ${n(Y)} yen. The exchange rate is ${n(E)} yen per euro. What is the price of the ${s.noun} in euros?`,
                given: {
                    "Price in yen": n(Y),
                    "Exchange rate": `${n(E)} yen per euro`,
                },
                answer,
                explanation: String.raw`$P^{EUR} = \frac{P^{yen}}{E}$ - the yen price is converted by dividing through the yen-per-euro rate: ${n(Y)} / ${n(E)} = ${eur(answer)}. Multiplying instead of dividing is the classic direction mistake - check the units: yen divided by yen-per-euro leaves euros.`,
            };
        },
    },
    {
        id: "ec2-fx-reciprocal",
        subject: "econ2",
        topic: "exchange_rates",
        difficulty: "medium",
        kind: "numeric",
        unit: "percent",
        source: "TUM Economics II SS2018 Q28; SS2019 Q32",
        build: (rng) => {
            const E0 = rng.int(130, 178);
            const c = rng.int(2, 12) * rng.pick([1, -1]);
            const E1 = Math.round(E0 * (1 + c / 100));
            const answer = (E0 / E1 - 1) * 100;
            return {
                prompt: `The yen-per-euro exchange rate moves from ${n(E0)} in year 1 to ${n(E1)} in year 2. By what percentage does the **euro-per-yen** rate change over the same period? A negative number means it fell.`,
                given: {
                    "Yen per euro, year 1": n(E0),
                    "Yen per euro, year 2": n(E1),
                },
                answer,
                explanation: String.raw`$\Delta E^{-1} \, [\%] = \left( \frac{E_0}{E_1} - 1 \right) \cdot 100$ - the euro-per-yen rate is the reciprocal $1/E$, so its growth factor is $E_0 / E_1$: ${n(E0)} / ${n(E1)} − 1 = ${pct(answer)}. Note that the reciprocal rate does **not** simply change by ${pct(-((E1 / E0 - 1) * 100))} with the opposite sign - reciprocals are not symmetric in percentages.`,
            };
        },
    },
    {
        id: "ec2-fx-cross-change",
        subject: "econ2",
        topic: "exchange_rates",
        difficulty: "hard",
        kind: "numeric",
        unit: "percent",
        source: "TUM Economics II SS2019, Q32 (cross-rate appreciation)",
        build: (rng) => {
            const W0 = rng.int(1250, 1550);
            const W1 = W0 + rng.int(-60, 60);
            const F0 = rng.int(92, 110) / 100;
            const F1 = (F0 * 100 + rng.int(-5, 5)) / 100;
            const cross0 = W0 / F0;
            const cross1 = W1 / F1;
            const answer = (cross1 / cross0 - 1) * 100;
            return {
                prompt: `Both the South Korean won and the Swiss franc are quoted against the euro. In year 1, one euro costs ${n(W0)} won and ${n2(F0)} francs; in year 2, it costs ${n(W1)} won and ${n2(F1)} francs. By what percentage does the **cross rate in won per franc** change from year 1 to year 2? A positive number means the franc appreciated against the won.`,
                given: {
                    "Won per euro: year 1 / year 2": `${n(W0)} / ${n(W1)}`,
                    "Francs per euro: year 1 / year 2": `${n2(F0)} / ${n2(F1)}`,
                },
                answer,
                explanation: String.raw`$E_{W/F} = \frac{E_{W/EUR}}{E_{F/EUR}}$ - the euro cancels out of the two quotes. Year 1: ${n(W0)} / ${n2(F0)} = ${n2(cross0)} won per franc; year 2: ${n(W1)} / ${n2(F1)} = ${n2(cross1)}. Change: ${n2(cross1)} / ${n2(cross0)} − 1 = ${pct(answer)}. ${answer > 0 ? "The franc buys more won than before - it appreciated against the won." : answer < 0 ? "The franc buys fewer won than before - it depreciated against the won." : "The cross rate is unchanged - neither currency moved against the other."}`,
            };
        },
    },

    // ------------------------------------------------------- Solow (expansion)
    {
        id: "ec2-solow-output-ss",
        subject: "econ2",
        topic: "solow",
        difficulty: "medium",
        kind: "numeric",
        unit: "number",
        source: "TUM Economics II SS2017, Q31 (steady state)",
        build: (rng) => {
            const A = rng.pick([1, 2, 3] as const);
            const ratio = rng.pick([1.5, 2, 2.5, 3, 4] as const);
            const nPop = rng.int(0, 3);
            const g = rng.int(1, 3);
            const delta = rng.int(3, 8);
            const x = nPop + g + delta;
            const s = x * ratio;
            const rootK = A * ratio;
            const answer = A * A * ratio;
            const Astr = A === 1 ? "" : `${A} `;
            return {
                prompt: String.raw`A Solow economy produces with $f(k) = ${Astr}\sqrt{k}$ per effective worker. The savings rate is ${pct(s)}, population grows at ${pct(nPop)}, technology at ${pct(g)}, and capital depreciates at ${pct(delta)}. What is **output per effective worker** $y^*$ in the steady state?`,
                given: {
                    "Production per effective worker": String.raw`$f(k) = ${Astr}\sqrt{k}$`,
                    "Savings rate s": pct(s),
                    "Population growth n": pct(nPop),
                    "Technological progress g": pct(g),
                    "Depreciation rate δ": pct(delta),
                },
                answer,
                explanation: String.raw`$s \cdot f(k^*) = (n + g + \delta) \cdot k^*$ pins down the steady state: with $f(k) = ${Astr}\sqrt{k}$ this gives $\sqrt{k^*} = \frac{s \cdot ${A}}{n + g + \delta}$ = ${pct(s)} · ${n(A)} / ${pct(x)} = ${n(rootK)}, so $k^* = ${n(rootK * rootK)}$. Output is $y^* = ${Astr}\sqrt{k^*}$ = ${n(A)} · ${n(rootK)} = ${n(answer)}.`,
            };
        },
    },
    {
        id: "ec2-solow-consumption-ss",
        subject: "econ2",
        topic: "solow",
        difficulty: "hard",
        kind: "numeric",
        unit: "number",
        source: "TUM Economics II SS2017 Q31; lecture Unit IX slide 13 (c = f(k) − s·f(k))",
        build: (rng) => {
            const A = rng.pick([1, 2] as const);
            const ratio = rng.pick([2, 2.5, 3] as const);
            const nPop = rng.int(0, 3);
            const g = rng.int(1, 3);
            const delta = rng.int(3, 8);
            const x = nPop + g + delta;
            const s = x * ratio;
            const rootK = A * ratio;
            const yStar = A * A * ratio;
            const answer = (1 - s / 100) * yStar;
            const Astr = A === 1 ? "" : `${A} `;
            return {
                prompt: String.raw`A Solow economy has $f(k) = ${Astr}\sqrt{k}$ per effective worker, a savings rate of ${pct(s)}, population growth of ${pct(nPop)}, technological progress of ${pct(g)} and depreciation of ${pct(delta)}. What is **consumption per effective worker** $c^*$ in the steady state?`,
                given: {
                    "Production per effective worker": String.raw`$f(k) = ${Astr}\sqrt{k}$`,
                    "Savings rate s": pct(s),
                    "Population growth n": pct(nPop),
                    "Technological progress g": pct(g),
                    "Depreciation rate δ": pct(delta),
                },
                answer,
                explanation: String.raw`$c^* = (1 - s) \cdot f(k^*)$ - whatever is not saved is consumed. Steady state: $\sqrt{k^*} = \frac{s \cdot ${A}}{n+g+\delta}$ = ${n(rootK)}, so $y^* = ${Astr}\sqrt{k^*}$ = ${n(yStar)}. Consumption: ${n(1 - s / 100)} · ${n(yStar)} = ${n2(answer)}.`,
            };
        },
    },
    {
        id: "ec2-solow-breakeven",
        subject: "econ2",
        topic: "solow",
        difficulty: "very_easy",
        kind: "numeric",
        unit: "number",
        source: "TUM Economics II lecture, Unit IX slide 15 (break-even investment)",
        build: (rng) => {
            const k = rng.int(10, 80);
            const nPop = rng.int(0, 3);
            const g = rng.int(1, 3);
            const delta = rng.int(3, 8);
            const x = nPop + g + delta;
            const answer = (x / 100) * k;
            return {
                prompt: String.raw`In a Solow economy, the capital stock per effective worker is currently $k = ${n(k)}$. Population grows at ${pct(nPop)}, technology at ${pct(g)}, and capital depreciates at ${pct(delta)}. How much **investment per effective worker** is needed just to keep $k$ constant (the break-even investment)?`,
                given: {
                    "Capital per effective worker k": n(k),
                    "Population growth n": pct(nPop),
                    "Technological progress g": pct(g),
                    "Depreciation rate δ": pct(delta),
                },
                answer,
                explanation: String.raw`$i^{\text{break-even}} = (n + g + \delta) \cdot k$ - investment must replace depreciated capital ($\delta k$) and equip both the extra workers ($n k$) and the extra effective labor from technological progress ($g k$): ${pct(x)} · ${n(k)} = ${n2(answer)}.`,
            };
        },
    },
    {
        id: "ec2-solow-percap-growth",
        subject: "econ2",
        topic: "solow",
        difficulty: "very_easy",
        kind: "numeric",
        unit: "percent",
        source: "TUM Economics II SS2019 Q38; lecture Unit IX slide 18",
        build: (rng) => {
            const nPop = rng.int(1, 3);
            const g = rng.int(1, 6);
            const delta = rng.int(3, 8);
            const s = rng.int(15, 40);
            return {
                prompt: String.raw`A Solow economy is in its steady state. The savings rate is ${pct(s)}, population grows at ${pct(nPop)}, technology progresses at ${pct(g)}, and capital depreciates at ${pct(delta)}. At what rate does **output per capita** grow in the steady state?`,
                given: {
                    "Savings rate s": pct(s),
                    "Population growth n": pct(nPop),
                    "Technological progress g": pct(g),
                    "Depreciation rate δ": pct(delta),
                },
                answer: g,
                explanation: String.raw`$g_y = g$ - in the steady state, output per **effective** worker is constant, so output per capita grows exactly at the rate of technological progress: ${pct(g)}. Neither the savings rate nor population growth affects the long-run growth rate - they only shift the **level** of the steady-state path.`,
            };
        },
    },
    {
        id: "ec2-solow-required-s",
        subject: "econ2",
        topic: "solow",
        difficulty: "hard",
        kind: "numeric",
        unit: "percent",
        source: "TUM Economics II SS2017, Q31 (steady-state condition, solved for s)",
        build: (rng) => {
            const r = rng.int(2, 6);
            const delta = rng.int(3, 6);
            const g = rng.int(1, 3);
            const xMax = Math.min(15, Math.floor(55 / r));
            const nPop = rng.int(0, Math.max(0, xMax - delta - g));
            const x = nPop + g + delta;
            const kStar = r * r;
            const answer = x * r;
            return {
                prompt: String.raw`A Solow economy produces with $f(k) = \sqrt{k}$ per effective worker. Population grows at ${pct(nPop)}, technology at ${pct(g)}, and depreciation is ${pct(delta)}. Which **savings rate** $s$ sustains a steady state with a capital stock of exactly $k^* = ${n(kStar)}$ per effective worker?`,
                given: {
                    "Production per effective worker": String.raw`$f(k) = \sqrt{k}$`,
                    "Target steady-state capital $k^*$": n(kStar),
                    "Population growth n": pct(nPop),
                    "Technological progress g": pct(g),
                    "Depreciation rate δ": pct(delta),
                },
                answer,
                explanation: String.raw`$s \cdot f(k^*) = (n + g + \delta) \cdot k^*$ - solve the steady-state condition for $s$: $s = \frac{(n+g+\delta) \, k^*}{f(k^*)} = (n+g+\delta) \sqrt{k^*}$ = ${pct(x)} · ${n(r)} = ${pct(answer)}. A higher target capital stock demands a proportionally higher savings rate because saving must cover the dilution of a bigger stock.`,
            };
        },
    },

    // ------------------------------------------- money & banking (new topic)
    {
        id: "ec2-mb-broad-money",
        subject: "econ2",
        topic: "money_banking",
        difficulty: "very_easy",
        kind: "numeric",
        unit: "number",
        source: "TUM Economics II lecture, Unit VII slide 21 (broad money = base + bank money)",
        build: (rng) => {
            const country = rng.pick(EU_COUNTRIES);
            const base = 10 * rng.int(5, 40);
            const bank = 10 * rng.int(20, 120);
            const answer = base + bank;
            return {
                prompt: `In ${country}, the central bank has issued base money (notes, coins and central-bank reserves) of ${n(base)} billion €. Commercial banks have created bank money of ${n(bank)} billion € by extending loans. What is **broad money**, in billion €?`,
                given: {
                    "Base money": `${n(base)} billion €`,
                    "Bank money": `${n(bank)} billion €`,
                },
                answer,
                explanation: String.raw`$\text{broad money} = \text{base money} + \text{bank money}$: ${n(base)} + ${n(bank)} = ${n(answer)} billion €. Only the central bank creates legal tender, but most of the money in circulation is bank money created when commercial banks lend.`,
            };
        },
    },
    {
        id: "ec2-mb-networth",
        subject: "econ2",
        topic: "money_banking",
        difficulty: "very_easy",
        kind: "numeric",
        unit: "number",
        source: "TUM Economics II lecture, Unit VII slide 15 (net worth = assets − liabilities)",
        build: (rng) => {
            const s = rng.pick(E2_MB_NETWORTH_SCENARIOS);
            const nw = 10 * rng.int(2, 15);
            const assets = 10 * rng.int(30, 120);
            const liab = assets - nw;
            return {
                prompt: `${s.bank} holds total assets (base money, loans to customers, financial assets and buildings) of ${n(assets)} billion € and total liabilities (deposits and borrowing) of ${n(liab)} billion €. What is the bank's **net worth** (equity), in billion €?`,
                given: {
                    "Total assets": `${n(assets)} billion €`,
                    "Total liabilities": `${n(liab)} billion €`,
                },
                answer: nw,
                explanation: String.raw`$\text{net worth} = \text{assets} - \text{liabilities}$: ${n(assets)} − ${n(liab)} = ${n(nw)} billion €. This equity is the buffer that absorbs losses before the depositors and other creditors are hit.`,
            };
        },
    },
    {
        id: "ec2-mb-leverage",
        subject: "econ2",
        topic: "money_banking",
        difficulty: "easy",
        kind: "numeric",
        unit: "ratio",
        source: "TUM Economics II lecture, Unit VII slides 31-34 (leverage ratio)",
        build: (rng) => {
            const s = rng.pick(E2_MB_LEVERAGE_SCENARIOS);
            const E = rng.int(2, 9);
            const mult = rng.int(8, 30);
            const assets = E * mult;
            return {
                prompt: `${s.bank} has total assets of ${n(assets)} billion € and a net worth (equity) of ${n(E)} billion €. What is its **leverage ratio**?`,
                given: {
                    "Total assets": `${n(assets)} billion €`,
                    "Net worth (equity)": `${n(E)} billion €`,
                },
                answer: mult,
                explanation: String.raw`$\text{leverage} = \frac{\text{assets}}{\text{net worth}}$: ${n(assets)} / ${n(E)} = ${n(mult)}. The bank holds ${n(mult)} € of assets for every euro of its own equity - the rest is financed by debt, which is what makes highly leveraged banks fragile.`,
                hint: String.raw`Leverage measures how many euros of assets a bank carries per euro of its own equity: $\text{leverage} = \frac{\text{assets}}{\text{net worth}}$.`,
            };
        },
    },
    {
        id: "ec2-mb-insolvency-drop",
        subject: "econ2",
        topic: "money_banking",
        difficulty: "medium",
        kind: "numeric",
        unit: "percent",
        source: "TUM Economics II lecture, Unit VII slide 34 (asset fall that wipes out equity)",
        build: (rng) => {
            const s = rng.pick(E2_MB_INSOLVENCY_DROP_SCENARIOS);
            const assets = 100 * rng.int(4, 12);
            const E = rng.int(8, 60);
            const answer = (E / assets) * 100;
            return {
                prompt: `${s.bank} has total assets of ${n(assets)} billion € and a net worth of ${n(E)} billion €. By what **percentage** would the value of its assets have to fall to wipe out the bank's net worth entirely?`,
                given: {
                    "Total assets": `${n(assets)} billion €`,
                    "Net worth (equity)": `${n(E)} billion €`,
                },
                answer,
                explanation: String.raw`$\frac{\text{net worth}}{\text{assets}} \cdot 100$ - liabilities are fixed, so every euro of asset losses eats a euro of equity; equity is gone when losses reach the full net worth: ${n(E)} / ${n(assets)} = ${pct(answer)}. This is the flip side of leverage: the higher the leverage, the smaller the asset fall a bank can survive.`,
                hint: String.raw`What a bank owes is fixed in nominal terms, so a loss in asset value eats equity euro for euro, and the bank is wiped out once the losses reach its whole net worth: $\frac{\text{net worth}}{\text{assets}} \cdot 100$.`,
            };
        },
    },
    {
        id: "ec2-mb-spread",
        subject: "econ2",
        topic: "money_banking",
        difficulty: "medium",
        kind: "numeric",
        unit: "number",
        source: "TUM Economics II lecture, Unit VII slides 19/30 (banks profit from the interest spread)",
        build: (rng) => {
            const s = rng.pick(E2_MB_SPREAD_SCENARIOS);
            const iL = rng.int(4, 9);
            const iD = rng.int(1, iL - 2);
            const L = 10 * rng.int(20, 80);
            const D = L - 10 * rng.int(0, 15); // D <= L keeps net interest income positive
            const answer = (L * iL) / 100 - (D * iD) / 100;
            return {
                prompt: `${s.bank} has extended loans of ${n(L)} million € on which it charges an average lending rate of ${pct(iL)}. It funds itself with deposits of ${n(D)} million € on which it pays ${pct(iD)}. What is the bank's annual **net interest income**, in million €?`,
                given: {
                    "Loans outstanding": `${n(L)} million €`,
                    "Lending rate": pct(iL),
                    "Deposits": `${n(D)} million €`,
                    "Deposit rate": pct(iD),
                },
                answer,
                explanation: String.raw`$\text{net interest income} = i_L \cdot L - i_D \cdot D$ - interest earned on loans minus interest paid on deposits: ${n(L)} · ${n(iL / 100)} − ${n(D)} · ${n(iD / 100)} = ${n2((L * iL) / 100)} − ${n2((D * iD) / 100)} = ${n2(answer)} million €. This spread between the lending and the deposit rate is how banks make profits; operating costs and loan defaults would still come out of it.`,
            };
        },
    },
    {
        id: "ec2-mb-money-creation",
        subject: "econ2",
        topic: "money_banking",
        difficulty: "medium",
        kind: "numeric",
        unit: "number",
        source: "TUM Economics II lecture, Unit VII slides 21-23 (money creation by lending)",
        build: (rng) => {
            const s = rng.pick(E2_MB_MONEY_CREATION_SCENARIOS);
            const X = 50 * rng.int(1, 8);
            const Y = 50 * rng.int(1, 8) + 25;
            const answer = X + Y;
            return {
                prompt: `${s.saver} deposits ${n(X)} € of cash at ${s.bank}, which credits ${s.poss} account with ${n(X)} €. The bank then grants ${s.borrower} a loan of ${n(Y)} € by crediting ${s.borrowerPoss} account - no cash changes hands. How much **broad money** now exists in this small banking system, in €?`,
                given: {
                    "Cash deposited": `${n(X)} €`,
                    "Loan granted by account credit": `${n(Y)} €`,
                },
                answer,
                explanation: String.raw`$\text{broad money} = \text{deposits from base money} + \text{deposits created by lending}$ - the saver's account holds ${n(X)} € and ${s.borrowerPoss} account holds ${n(Y)} €, so ${n(X)} + ${n(Y)} = ${n(answer)} € is payable on demand, although only ${n(X)} € of base money exists. The loan created new bank money: it is a liability of the bank, matched by the loan contract on its asset side.`,
                hint: `Broad money counts everything that is payable on demand: the deposits backed by base money plus the deposits a bank creates out of nothing when it grants a loan by crediting an account.`,
            };
        },
    },
];
