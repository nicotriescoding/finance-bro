import type { Question } from "@/lib/questions/types";
import { eur, n, n2, pct } from "./_helpers";

/**
 * Economics 1 - Microeconomics.
 *
 * Built from real TUM course material under the copyright-redesign policy:
 * the Economics I exercise exam WT22/23 (Prof. Schwenen) plus the W22/23
 * tutorial problem sets 2-13, the Economics I exam WS19/20 (Prof.
 * Kurschilgen, with model solution), the Economics I eTest W20/21 (with
 * answer key) and the micro blocks 1-5 of the Principles of Economics
 * exercise exams WS17/18 = WS20/21 (von Weizsaecker / Feilcke; the macro
 * blocks 6-8 belong to Econ 2 and were left out on purpose). Every question keeps only the
 * tested competency and the standard lecture formulas. Scenarios, names,
 * goods, wording and all numbers are new - every question draws its
 * figures from the seeded rng. `source` records provenance only.
 * Numeric-only for now: the choice questions were removed on 2026-08-28
 * per Nico (recoverable from git, commits ed4eb4f + 560c0a0).
 */
// ---- helpers for the seeded draws added 2026-09-02 ----
/** Greatest common divisor - keeps the greedy split in the joint-PPF question clean. */
const gcd = (x: number, y: number): number => (y === 0 ? x : gcd(y, x % y));

type Pair = readonly [number, number];

/**
 * Minutes per unit as [t_X, t_Y], grouped by the opportunity cost of ONE unit
 * of good Y measured in units of good X (= t_Y / t_X). Drawing distinct groups
 * guarantees by construction that the producers' opportunity costs differ.
 */
const OC_Y_GROUPS: { oc: number; pairs: Pair[] }[] = [
    { oc: 0.4, pairs: [[10, 4], [15, 6], [20, 8], [30, 12]] },
    { oc: 0.5, pairs: [[8, 4], [10, 5], [12, 6], [20, 10], [24, 12]] },
    { oc: 0.75, pairs: [[8, 6], [12, 9], [16, 12], [20, 15]] },
    { oc: 0.8, pairs: [[5, 4], [10, 8], [15, 12], [25, 20], [30, 24]] },
    { oc: 1.2, pairs: [[5, 6], [10, 12], [15, 18], [20, 24], [25, 30]] },
    { oc: 1.25, pairs: [[4, 5], [8, 10], [12, 15], [16, 20], [24, 30]] },
    { oc: 1.5, pairs: [[4, 6], [6, 9], [8, 12], [10, 15], [12, 18], [20, 30]] },
    { oc: 1.6, pairs: [[5, 8], [10, 16], [15, 24]] },
    { oc: 2.4, pairs: [[5, 12], [10, 24]] },
    { oc: 2.5, pairs: [[4, 10], [6, 15], [8, 20], [10, 25], [12, 30]] },
    { oc: 3.5, pairs: [[4, 14], [6, 21], [8, 28]] },
];

/**
 * Same idea, but grouped by the opportunity cost of one unit of good X in
 * units of good Y (= t_X / t_Y), and every t_Y divides 60 so the hourly output
 * of good Y is an integer.
 */
const OC_X_GROUPS: { oc: number; pairs: Pair[] }[] = [
    { oc: 0.4, pairs: [[4, 10], [6, 15], [8, 20], [12, 30]] },
    { oc: 0.5, pairs: [[5, 10], [6, 12], [10, 20], [15, 30]] },
    { oc: 0.6, pairs: [[6, 10], [9, 15], [12, 20], [18, 30]] },
    { oc: 0.75, pairs: [[9, 12], [15, 20]] },
    { oc: 0.8, pairs: [[4, 5], [8, 10], [12, 15], [16, 20], [24, 30]] },
    { oc: 1.2, pairs: [[6, 5], [12, 10], [18, 15], [24, 20], [36, 30]] },
    { oc: 1.25, pairs: [[5, 4], [15, 12], [25, 20]] },
    { oc: 1.5, pairs: [[6, 4], [9, 6], [15, 10], [18, 12], [30, 20]] },
    { oc: 2, pairs: [[8, 4], [10, 5], [12, 6], [20, 10], [24, 12], [30, 15], [40, 20]] },
    { oc: 2.5, pairs: [[10, 4], [15, 6], [25, 10], [30, 12]] },
    { oc: 3, pairs: [[12, 4], [15, 5], [18, 6], [30, 10], [36, 12]] },
    { oc: 4, pairs: [[16, 4], [20, 5], [24, 6], [40, 10]] },
];

/**
 * As OC_X_GROUPS, but every minute figure divides 60, 120 AND 180, so a whole
 * shift of T minutes always converts into an integer maximum output.
 */
const OC_T_GROUPS: { oc: number; pairs: Pair[] }[] = [
    { oc: 0.25, pairs: [[5, 20]] },
    { oc: 0.3, pairs: [[6, 20]] },
    { oc: 0.4, pairs: [[6, 15]] },
    { oc: 0.5, pairs: [[5, 10], [6, 12], [10, 20]] },
    { oc: 0.6, pairs: [[6, 10], [12, 20]] },
    { oc: 0.75, pairs: [[15, 20]] },
    { oc: 0.8, pairs: [[12, 15]] },
    { oc: 1.2, pairs: [[6, 5], [12, 10]] },
    { oc: 1.25, pairs: [[15, 12]] },
    { oc: 1.5, pairs: [[15, 10]] },
    { oc: 2, pairs: [[10, 5], [12, 6], [20, 10]] },
    { oc: 2.4, pairs: [[12, 5]] },
    { oc: 2.5, pairs: [[15, 6]] },
    { oc: 3, pairs: [[15, 5]] },
    { oc: 4, pairs: [[20, 5]] },
];
/** `L^{3/4}`, or plain `L` when the exponent is 1. Used by the returns-to-scale item. */
const powTex = (base: string, num: number, den: number) =>
    den === 1 ? (num === 1 ? base : `${base}^{${num}}`) : `${base}^{${num}/${den}}`;

/** `\frac{3}{4}`, or a bare `1` when the denominator is 1. */
const fracTex = (num: number, den: number) => (den === 1 ? `${num}` : String.raw`\frac{${num}}{${den}}`);


/**
 * Labour-leisure tuples [p, w, m] for the compensated-bundle items: the new
 * wage is w' = p * m and the time budget is Z = p (m+1)^2 (p + w). Then the
 * old optimum F_0 = p^2 (m+1)^2 and q_0 = (w (m+1))^2 are perfect squares, so
 * U_0 = (m+1)(p+w) and the compensated bundle are integers too, and Z stays
 * inside 30..168 hours.
 */
const LABOR_TUPLES = [
    [1, 3, 2],
    [1, 4, 2],
    [1, 5, 2],
    [1, 6, 2],
    [1, 8, 2],
    [1, 10, 2],
    [1, 12, 2],
    [1, 2, 3],
    [1, 4, 3],
    [1, 5, 3],
    [1, 6, 3],
    [1, 8, 3],
    [1, 2, 4],
    [1, 3, 4],
    [1, 5, 4],
    [1, 2, 5],
    [1, 3, 5],
    [2, 3, 2],
    [2, 5, 2],
    [2, 6, 2],
    [2, 3, 3],
    [3, 2, 2],
] as const;

/** Cobb-Douglas exponent pairs [a-numerator, b-numerator, denominator], a + b = 1. */
const CD_SHARES = [
    [1, 1, 2],
    [1, 2, 3],
    [2, 1, 3],
    [1, 3, 4],
    [3, 1, 4],
] as const;
/** Coefficient in front of a variable: "3\," for 3, "" for 1 (prints "Q", not "1 Q"). */
const co = (v: number) => (v === 1 ? "" : `${n(v)}\\,`);

// ---- story lines (added 2026-09-08) ----
// Every question that tells a story draws one of these FIRST inside `build`
// (`const s = rng.pick(...)`), so the same concept shows up dressed
// differently from seed to seed. Scenarios hold strings only - every number
// still comes from the rng. Pure-formula questions have no scenario array.

/** "she" -> "She" for a scenario word at the start of a sentence. */
const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

const E1_CA_SPECIALIZATION_TOTAL_SCENARIOS = [
    { intro: "Two carpenters share a workshop", a: "Ava", b: "Ben", verb: "build", x: "chairs", y: "tables", yOne: "table", total: "pieces of furniture (chairs plus tables)", who: "the workshop" },
    { intro: "Two bakers run a small bakery", a: "Noor", b: "Elias", verb: "bake", x: "baguettes", y: "tarts", yOne: "tart", total: "baked goods (baguettes plus tarts)", who: "the bakery" },
    { intro: "Two tailors share an atelier", a: "Mei", b: "Luca", verb: "sew", x: "shirts", y: "jackets", yOne: "jacket", total: "garments (shirts plus jackets)", who: "the atelier" },
    { intro: "Two developers run a small app studio", a: "Priya", b: "Tom", verb: "ship", x: "bug fixes", y: "new features", yOne: "feature", total: "tickets (bug fixes plus features)", who: "the studio" },
] as const;

const E1_CA_TRADE_PRICE_BOUND_SCENARIOS = [
    { a: "Livonia", b: "Carinia", x: "sacks of grain", xUnit: "sacks of grain", xShort: "grain", y: "barrels of olive oil", yOne: "barrel of oil", yShort: "oil" },
    { a: "Norland", b: "Sudmark", x: "tonnes of fish", xUnit: "tonnes of fish", xShort: "fish", y: "bales of wool", yOne: "bale of wool", yShort: "wool" },
    { a: "Aurelia", b: "Bastia", x: "crates of apples", xUnit: "crates of apples", xShort: "apples", y: "casks of wine", yOne: "cask of wine", yShort: "wine" },
    { a: "Veltria", b: "Osmara", x: "rolls of cloth", xUnit: "rolls of cloth", xShort: "cloth", y: "sacks of rice", yOne: "sack of rice", yShort: "rice" },
] as const;

const E1_CT_COBB_DOUGLAS_DEMAND_SCENARIOS = [
    { who: "A student", subj: "she", poss: "her", g1: "streaming hours", g1One: "one streaming hour", g2: "cinema visits", g2One: "one cinema visit", unit1: "hours" },
    { who: "A retiree", subj: "he", poss: "his", g1: "rounds of golf", g1One: "one round of golf", g2: "spa visits", g2One: "one spa visit", unit1: "rounds" },
    { who: "A nurse", subj: "she", poss: "her", g1: "yoga classes", g1One: "one yoga class", g2: "concert tickets", g2One: "one concert ticket", unit1: "classes" },
    { who: "A commuter", subj: "he", poss: "his", g1: "coffees", g1One: "one coffee", g2: "croissants", g2One: "one croissant", unit1: "coffees" },
] as const;

const E1_PC_SHORTRUN_LOSS_SCENARIOS = [
    { firm: "brewery", one: "crate" },
    { firm: "bakery", one: "tray of loaves" },
    { firm: "sawmill", one: "cubic metre" },
    { firm: "cheese dairy", one: "wheel" },
] as const;

const E1_MKT_EQUILIBRIUM_PRICE_SCENARIOS = [
    { good: "reusable coffee cups", unit: "cups" },
    { good: "yoga mats", unit: "mats" },
    { good: "umbrellas", unit: "umbrellas" },
    { good: "notebooks", unit: "notebooks" },
] as const;

const E1_MKT_CONSUMER_SURPLUS_SCENARIOS = [
    { good: "phone chargers" },
    { good: "bike locks" },
    { good: "desk lamps" },
] as const;

const E1_MKT_AD_VALOREM_TAX_SCENARIOS = [
    { good: "e-scooter rides" },
    { good: "takeaway coffees" },
    { good: "cinema tickets" },
    { good: "taxi rides" },
] as const;

const E1_MKT_UNIT_TAX_DWL_SCENARIOS = [
    { good: "board games" },
    { good: "vinyl records" },
    { good: "scented candles" },
] as const;

const E1_MONO_OPTIMAL_QUANTITY_SCENARIOS = [
    { intro: "A patent-holding pharma firm is the sole seller of a drug" },
    { intro: "A software firm holds the sole licence for a tax-filing tool" },
    { intro: "A single operator runs the only toll road over a mountain pass" },
    { intro: "A brewery holds the exclusive right to sell beer inside a stadium" },
] as const;

const E1_MONO_PROFIT_TAX_RATE_SCENARIOS = [
    { firm: "A monopoly ferry operator" },
    { firm: "The only water utility of a small island" },
    { firm: "The single toll-bridge operator of a river town" },
    { firm: "The only cinema in a valley town" },
] as const;

const E1_MONO_UNIT_TAX_REVENUE_SCENARIOS = [
    { firm: "A city's only cable-car operator", one: "ride", units: "rides" },
    { firm: "A seaside town's only cinema", one: "ticket", units: "tickets" },
    { firm: "A town's single minigolf course", one: "round", units: "rounds" },
    { firm: "The only ferry crossing a fjord", one: "crossing", units: "crossings" },
] as const;

const E1_OC_MIN_BENEFIT_SCENARIOS = [
    {
        name: "Jonas", subj: "he", poss: "his", when: "Saturday evening",
        opt1: "attend a jazz concert", fee: "ticket", feeLabel: "Concert ticket", event: "concert",
        travel: "he would get there with the annual transit pass he bought last year for", travelLabel: "Transit pass, bought last year", travelNoun: "The transit pass",
        home: "play video games at home", homeLabel: "Benefit of gaming", homeNoun: "Gaming",
        job: "help a neighbor move furniture for a payment of", jobLabel: "Moving job: pay / effort cost", jobNoun: "the moving job",
    },
    {
        name: "Mira", subj: "she", poss: "her", when: "Friday night",
        opt1: "go bungee jumping from the river bridge", fee: "jump fee", feeLabel: "Jump fee", event: "jump",
        travel: "she would drive there in the car she insured for the year at a premium of", travelLabel: "Car insurance, paid for the year", travelNoun: "The car insurance",
        home: "binge a series on the sofa", homeLabel: "Benefit of the series", homeNoun: "The series",
        job: "cover a bar shift for a colleague for a payment of", jobLabel: "Bar shift: pay / effort cost", jobNoun: "the bar shift",
    },
    {
        name: "Tariq", subj: "he", poss: "his", when: "Sunday afternoon",
        opt1: "watch a film at the cinema", fee: "ticket", feeLabel: "Cinema ticket", event: "cinema visit",
        travel: "he would ride there on the bike he bought last year for", travelLabel: "Bike, bought last year", travelNoun: "The bike",
        home: "read on the balcony", homeLabel: "Benefit of reading", homeNoun: "Reading",
        job: "walk the neighbors' dogs for a payment of", jobLabel: "Dog walking: pay / effort cost", jobNoun: "the dog walking",
    },
    {
        name: "Sofia", subj: "she", poss: "her", when: "Saturday",
        opt1: "take a pottery class", fee: "class fee", feeLabel: "Class fee", event: "class",
        travel: "she would go there with the yearly bus pass she paid for in January at", travelLabel: "Bus pass, paid for the year", travelNoun: "The bus pass",
        home: "cook and relax at home", homeLabel: "Benefit of the evening at home", homeNoun: "The evening at home",
        job: "babysit for a neighbor for a payment of", jobLabel: "Babysitting: pay / effort cost", jobNoun: "the babysitting",
    },
    {
        name: "Kenji", subj: "he", poss: "his", when: "Friday evening",
        opt1: "see a football match in the stadium", fee: "ticket", feeLabel: "Match ticket", event: "match",
        travel: "he would wear the scarf and jersey he bought last season for", travelLabel: "Fan gear, bought last season", travelNoun: "The fan gear",
        home: "play board games with his flatmates", homeLabel: "Benefit of the game night", homeNoun: "The game night",
        job: "work a delivery shift for a payment of", jobLabel: "Delivery shift: pay / effort cost", jobNoun: "the delivery shift",
    },
] as const;

const E1_CA_AUTARKY_ASSEMBLY_SCENARIOS = [
    { name: "Marta", subj: "she", refl: "herself", product: "mechanical watches", one: "watch", partA: "case", partsA: "cases", partB: "movement", partsB: "movements", verb: "machine" },
    { name: "Yusuf", subj: "he", refl: "himself", product: "wooden chairs", one: "chair", partA: "seat", partsA: "seats", partB: "frame", partsB: "frames", verb: "carve" },
    { name: "Ines", subj: "she", refl: "herself", product: "electric guitars", one: "guitar", partA: "body", partsA: "bodies", partB: "neck", partsB: "necks", verb: "shape" },
    { name: "Bram", subj: "he", refl: "himself", product: "custom bicycles", one: "bicycle", partA: "frame", partsA: "frames", partB: "wheelset", partsB: "wheelsets", verb: "build" },
] as const;

const E1_CT_SUBSTITUTES_QUANTITY_SCENARIOS = [
    { who: "A commuter", subj: "she", poss: "her", g1: "regional-train tickets", g2: "express-bus tickets", one1: "A train ticket", one2: "a bus ticket", ask: "bus tickets", budget: "monthly travel budget", units: "tickets" },
    { who: "A student", subj: "he", poss: "his", g1: "canteen lunches", g2: "food-truck lunches", one1: "A canteen lunch", one2: "a food-truck lunch", ask: "food-truck lunches", budget: "monthly lunch budget", units: "lunches" },
    { who: "A gardener", subj: "she", poss: "her", g1: "garden-centre compost bags", g2: "farm-shop compost bags", one1: "A garden-centre bag", one2: "a farm-shop bag", ask: "farm-shop bags", budget: "seasonal compost budget", units: "bags" },
] as const;

const E1_MKT_POINT_ELASTICITY_SCENARIOS = [
    { good: "museum tickets" },
    { good: "zoo tickets" },
    { good: "swimming-pool entries" },
    { good: "escape-room bookings" },
] as const;

const E1_MKT_UNIT_ELASTIC_PRICE_SCENARIOS = [
    { good: "open-air-cinema tickets" },
    { good: "festival day passes" },
    { good: "ferris-wheel rides" },
] as const;

const E1_MKT_SUPPLY_ELASTICITY_SCENARIOS = [
    { good: "oat flour" },
    { good: "honey" },
    { good: "goat cheese" },
] as const;

const E1_MKT_DEMAND_SHIFTERS_SCENARIOS = [
    { good: "ice cream at a lakeside kiosk" },
    { good: "day tickets at an open-air swimming pool" },
    { good: "rental bikes at a seaside resort" },
    { good: "cocktails at a rooftop bar" },
] as const;

const E1_MKT_TWO_PART_TARIFF_SCENARIOS = [
    { service: "A car-sharing service", unit: "hour of use", memberA: "a casual user", memberB: "a commuter", theA: "the casual user", theB: "the commuter", labelA: "Casual", labelB: "Commuter", verb: "driving" },
    { service: "A coworking space", unit: "hour at a desk", memberA: "an occasional visitor", memberB: "a freelancer", theA: "the occasional visitor", theB: "the freelancer", labelA: "Occasional", labelB: "Freelancer", verb: "working there" },
    { service: "A rowing club", unit: "hour on the water", memberA: "a weekend rower", memberB: "a competitive rower", theA: "the weekend rower", theB: "the competitive rower", labelA: "Weekend", labelB: "Competitive", verb: "rowing" },
    { service: "A padel club", unit: "hour of court time", memberA: "a casual player", memberB: "a league player", theA: "the casual player", theB: "the league player", labelA: "Casual", labelB: "League", verb: "playing" },
] as const;

const E1_MKT_VAT_REVENUE_SCENARIOS = [
    { good: "craft cider" },
    { good: "kombucha" },
    { good: "artisan chocolate" },
] as const;

const E1_PROD_MP_FROM_AP_SCENARIOS = [
    { intro: "A pottery workshop keeps its kilns fixed", worker: "potter", workers: "potters", unit: "bowls" },
    { intro: "A bakery keeps its ovens fixed", worker: "baker", workers: "bakers", unit: "loaves" },
    { intro: "A print shop keeps its presses fixed", worker: "operator", workers: "operators", unit: "posters" },
    { intro: "A car wash keeps its washing bays fixed", worker: "washer", workers: "washers", unit: "cars" },
] as const;

const E1_PROD_AP_MAXIMUM_SCENARIOS = [
    { intro: "A bottling plant with a fixed machine park", unit: "crates" },
    { intro: "A cannery with a fixed set of lines", unit: "tins" },
    { intro: "A laundry with a fixed set of washers", unit: "loads" },
] as const;

const E1_PROD_FACTOR_DEMAND_SCENARIOS = [
    { firm: "A price-taking olive press", units: "bottles", per: "per bottle" },
    { firm: "A price-taking apple orchard", units: "crates of apples", per: "per crate" },
    { firm: "A price-taking fishing boat", units: "kilograms of fish", per: "per kilogram" },
] as const;

const E1_PROD_MINIMUM_WAGE_COST_SCENARIOS = [
    { firm: "A furniture factory", capital: "machines" },
    { firm: "A parcel-sorting depot", capital: "sorting lines" },
    { firm: "A vineyard", capital: "tractors" },
] as const;

const E1_EXT_SOCIAL_OUTPUT_SCENARIOS = [
    { firm: "A gravel quarry", short: "the quarry", one: "ton", units: "tons", harm: "Its dust damages a neighboring vineyard", victim: "the vineyard", costLabel: "Quarry costs" },
    { firm: "A paper mill", short: "the mill", one: "tonne", units: "tonnes", harm: "Its effluent hurts a trout farm downstream", victim: "the trout farm", costLabel: "Mill costs" },
    { firm: "An open-air concert venue", short: "the venue", one: "concert", units: "concerts", harm: "Its noise disturbs a neighboring hotel", victim: "the hotel", costLabel: "Venue costs" },
    { firm: "A charter airline", short: "the airline", one: "flight", units: "flights", harm: "Its noise burdens the residents under the flight path", victim: "the residents", costLabel: "Airline costs" },
] as const;

const E1_EXT_INTERNALIZE_GAIN_SCENARIOS = [
    { firm: "A dye plant", short: "the plant", one: "batch", units: "batches", harm: "its wastewater reduces a downstream oyster farm's profit", costLabel: "Plant costs" },
    { firm: "A sawmill", short: "the mill", one: "truckload", units: "truckloads", harm: "its noise cuts the bookings of a neighbouring campsite, reducing its profit", costLabel: "Mill costs" },
    { firm: "A fish smokehouse", short: "the smokehouse", one: "batch", units: "batches", harm: "its smoke drives customers away from a next-door café, reducing its profit", costLabel: "Smokehouse costs" },
    { firm: "A haulage firm", short: "the haulier", one: "trip", units: "trips", harm: "its lorries wear out a farm's access road, reducing the farm's profit", costLabel: "Haulier costs" },
] as const;

const E1_MONO_PRICE_MIDPOINT_SCENARIOS = [
    { firm: "The only hot-air-balloon operator in an alpine valley", one: "ride", units: "rides" },
    { firm: "The only escape room in a provincial town", one: "booking", units: "bookings" },
    { firm: "The only zip-line operator in a canyon", one: "ride", units: "rides" },
    { firm: "The only cinema on a small island", one: "ticket", units: "tickets" },
] as const;

const E1_MONO_DEADWEIGHT_LOSS_SCENARIOS = [
    { firm: "A regional utility is the sole supplier of district heating" },
    { firm: "A private company is the sole supplier of drinking water in a mountain resort" },
    { firm: "One firm holds the only licence for ferry crossings on a lake" },
    { firm: "A single company runs all the charging points along a motorway" },
] as const;

const E1_CA_MINUTES_OPPORTUNITY_COST_SCENARIOS = [
    { intro: "Three pickers work on a fruit farm near Seville, each at a steady pace", names: ["Marta", "Diego", "Rosa"], verb: "picking", xOne: "crate of oranges", xUnit: "crates of oranges", xUnits: "crates", xShort: "crate", x: "oranges", yOne: "basket of almonds", yShort: "basket", y: "almonds" },
    { intro: "Three cooks prep in a hotel kitchen in Bruges, each at a steady pace", names: ["Lotte", "Wout", "Femke"], verb: "cooking", xOne: "tray of croquettes", xUnit: "trays of croquettes", xUnits: "trays", xShort: "tray", x: "croquettes", yOne: "pot of soup", yShort: "pot", y: "soup" },
    { intro: "Three volunteers pack aid parcels in a warehouse in Gdansk, each at a steady pace", names: ["Kasia", "Piotr", "Ola"], verb: "packing", xOne: "food parcel", xUnit: "food parcels", xUnits: "parcels", xShort: "parcel", x: "food parcels", yOne: "hygiene kit", yShort: "kit", y: "hygiene kits" },
    { intro: "Three interns work at a bike-repair shop in Utrecht, each at a steady pace", names: ["Sanne", "Daan", "Noor"], verb: "doing", xOne: "puncture repair", xUnit: "puncture repairs", xUnits: "repairs", xShort: "repair", x: "puncture repairs", yOne: "gear tune-up", yShort: "tune-up", y: "gear tune-ups" },
] as const;

const E1_CA_HOURLY_OUTPUT_SPECIALIZED_SCENARIOS = [
    { intro: "Three friends run a market stall in Lyon and work for exactly one hour", names: ["Camille", "Hugo", "Manon"], x: "macarons", xOne: "box of macarons", xShort: "box", y: "lemonade", yOne: "litre of lemonade", yUnits: "litres", yAsk: "litres of lemonade", doY: "pour lemonade" },
    { intro: "Three students staff a charity bake sale in Cork and work for exactly one hour", names: ["Aoife", "Cian", "Niamh"], x: "scones", xOne: "batch of scones", xShort: "batch", y: "tea", yOne: "pot of tea", yUnits: "pots", yAsk: "pots of tea", doY: "brew tea" },
    { intro: "Three friends run a beach kiosk in Split and work for exactly one hour", names: ["Ivana", "Luka", "Petra"], x: "smoothies", xOne: "smoothie", xShort: "smoothie", y: "sandwiches", yOne: "sandwich", yUnits: "sandwiches", yAsk: "sandwiches", doY: "make sandwiches" },
    { intro: "Three apprentices work a florist's stand in Ghent for exactly one hour", names: ["Lore", "Jef", "Maud"], x: "bouquets", xOne: "bouquet", xShort: "bouquet", y: "wreaths", yOne: "wreath", yUnits: "wreaths", yAsk: "wreaths", doY: "bind wreaths" },
] as const;

const E1_CA_JOINT_PPF_THREE_SCENARIOS = [
    { intro: "Three workers on an olive farm in Puglia", names: ["Elena", "Marco", "Giulia"], team: "The farm", xOne: "crate of olives", xUnits: "crates", xShort: "crate", x: "olives", yOne: "litre of oil", yUnits: "litres", y: "oil", asMuch: "as much oil", doX: "pick", doXs: "picks", doY: "press oil" },
    { intro: "Three bakers in a bakery in Bergen", names: ["Ida", "Sander", "Mia"], team: "The bakery", xOne: "tray of rolls", xUnits: "trays", xShort: "tray", x: "rolls", yOne: "loaf of bread", yUnits: "loaves", y: "bread", asMuch: "as much bread", doX: "bake", doXs: "bakes", doY: "bake bread" },
    { intro: "Three gardeners at a nursery in Boskoop", names: ["Roos", "Tim", "Eva"], team: "The nursery", xOne: "flat of seedlings", xUnits: "flats", xShort: "flat", x: "seedlings", yOne: "bundle of cut flowers", yUnits: "bundles", y: "cut flowers", asMuch: "as many cut flowers", doX: "pot", doXs: "pots", doY: "cut flowers" },
] as const;

const E1_CA_TERMS_OF_TRADE_LOWER_BOUND_SCENARIOS = [
    { intro: "Two potters share a studio in Porto", names: ["Tiago", "Sofia"], x: "mug", xs: "mugs", y: "bowl", ys: "bowls" },
    { intro: "Two weavers share a loom hall in Kilkenny", names: ["Aoife", "Rory"], x: "scarf", xs: "scarves", y: "blanket", ys: "blankets" },
    { intro: "Two jewellers share a bench in Antwerp", names: ["Lise", "Omar"], x: "ring", xs: "rings", y: "pendant", ys: "pendants" },
    { intro: "Two illustrators share a studio in Leipzig", names: ["Jana", "Milo"], x: "icon", xs: "icons", y: "poster", ys: "posters" },
] as const;

// Country pairs for the tea/coffee family (5 questions share the structure,
// so each gets three pairs from the same pool).
const E1_CA_JOINT_PPF_TWO_COUNTRIES_SCENARIOS = [
    { a: "Kenya", b: "Ethiopia", x: "tea", y: "coffee" },
    { a: "Chile", b: "Peru", x: "grapes", y: "avocados" },
    { a: "Ghana", b: "Ivory Coast", x: "cocoa", y: "cashews" },
] as const;

const E1_CA_MAX_CONSUMPTION_EXPORTER_SCENARIOS = [
    { a: "Kenya", b: "Ethiopia", x: "tea", y: "coffee" },
    { a: "Vietnam", b: "Thailand", x: "rice", y: "rubber" },
    { a: "Portugal", b: "Spain", x: "cork", y: "olives" },
] as const;

const E1_CA_MAX_CONSUMPTION_IMPORTER_SCENARIOS = [
    { a: "Chile", b: "Peru", x: "grapes", y: "avocados" },
    { a: "Ghana", b: "Ivory Coast", x: "cocoa", y: "cashews" },
    { a: "New Zealand", b: "Australia", x: "kiwifruit", y: "wheat" },
] as const;

const E1_CA_CONSUMPTION_TARGET_EXPORTER_SCENARIOS = [
    { a: "Kenya", b: "Ethiopia", x: "tea", y: "coffee" },
    { a: "Vietnam", b: "Thailand", x: "rice", y: "rubber" },
    { a: "New Zealand", b: "Australia", x: "kiwifruit", y: "wheat" },
] as const;

const E1_CA_CONSUMPTION_TARGET_IMPORTER_SCENARIOS = [
    { a: "Chile", b: "Peru", x: "grapes", y: "avocados" },
    { a: "Portugal", b: "Spain", x: "cork", y: "olives" },
    { a: "Vietnam", b: "Thailand", x: "rice", y: "rubber" },
] as const;

const E1_OC_PARETO_THRESHOLD_SCENARIOS = [
    { intro: "Three flatmates in Lisbon can share the household budget in two ways", a: "Alina", b: "Bruno", c: "Chiara" },
    { intro: "Three siblings in Zagreb can divide their grandmother's garden plots in two ways", a: "Ana", b: "Boris", c: "Dora" },
    { intro: "Three founders in Tallinn can split the company's equity in two ways", a: "Kai", b: "Liis", c: "Mart" },
    { intro: "Three colleagues in Lyon can allocate the office desks in two ways", a: "Amir", b: "Bea", c: "Cyril" },
] as const;

const E1_OC_SUNK_COST_NET_BENEFIT_SCENARIOS = [
    { name: "Lena", subj: "she", item: "a concert ticket", itemWord: "ticket", when: "Tonight", whenLow: "tonight", opt1: "go to the concert", val1: "she values that evening at", cost1: "the train ride there costs", label1: "Concert: value / travel", noun1: "the concert", opt2: "join a climbing session", val2: "she values at", cost2: "for which the gym charges", label2: "Climbing: value / fee", noun2: "the climbing session" },
    { name: "Omar", subj: "he", item: "a ticket for a stand-up show", itemWord: "ticket", when: "Tonight", whenLow: "tonight", opt1: "go to the show", val1: "he values that evening at", cost1: "the taxi there costs", label1: "Show: value / taxi", noun1: "the show", opt2: "go bowling with friends", val2: "he values at", cost2: "for which the alley charges", label2: "Bowling: value / fee", noun2: "the bowling night" },
    { name: "Hana", subj: "she", item: "a ticket for a football match", itemWord: "ticket", when: "This evening", whenLow: "this evening", opt1: "go to the match", val1: "she values that evening at", cost1: "the tram ride there costs", label1: "Match: value / travel", noun1: "the match", opt2: "take a cooking class", val2: "she values at", cost2: "for which the school charges", label2: "Cooking class: value / fee", noun2: "the cooking class" },
    { name: "Diego", subj: "he", item: "a day pass for a theme park", itemWord: "pass", when: "On Saturday", whenLow: "on Saturday", opt1: "go to the park", val1: "he values that day at", cost1: "the fuel for the drive costs", label1: "Theme park: value / fuel", noun1: "the theme park", opt2: "go kayaking on the lake", val2: "he values at", cost2: "for which the rental costs", label2: "Kayaking: value / rental", noun2: "the kayaking trip" },
    { name: "Yuki", subj: "she", item: "a ticket for a musical", itemWord: "ticket", when: "Tonight", whenLow: "tonight", opt1: "go to the musical", val1: "she values that evening at", cost1: "the bus ride there costs", label1: "Musical: value / travel", noun1: "the musical", opt2: "join a pottery workshop", val2: "she values at", cost2: "for which the studio charges", label2: "Pottery: value / fee", noun2: "the pottery workshop" },
] as const;

const E1_CT_CD_QUANTITY_AFTER_PRICE_CHANGE_SCENARIOS = [
    { who: "A student in Lisbon", subj: "she", poss: "her", g1: "tram rides", g1One: "A tram ride", g1Units: "rides", g1Price: "the tram fare", g2: "pastéis de nata", g2One: "a pastel de nata", g2Units: "pastéis" },
    { who: "A nurse in Manchester", subj: "he", poss: "his", g1: "gym sessions", g1One: "A gym session", g1Units: "sessions", g1Price: "the gym price", g2: "smoothies", g2One: "a smoothie", g2Units: "smoothies" },
    { who: "A teacher in Kraków", subj: "she", poss: "her", g1: "cinema visits", g1One: "A cinema visit", g1Units: "visits", g1Price: "the cinema price", g2: "portions of pierogi", g2One: "a portion of pierogi", g2Units: "portions" },
    { who: "An apprentice in Vienna", subj: "he", poss: "his", g1: "bouldering sessions", g1One: "A bouldering session", g1Units: "sessions", g1Price: "the bouldering price", g2: "slices of Sachertorte", g2One: "a slice of Sachertorte", g2Units: "slices" },
] as const;

const E1_CT_CD_MAX_UTILITY_COEFFICIENT_SCENARIOS = [
    { who: "A household in Bologna", g1: "plates of fresh pasta", g1Units: "plates", g2: "glasses of Lambrusco", g2One: "a glass of Lambrusco", g2Units: "glasses" },
    { who: "A household in Istanbul", g1: "portions of simit", g1Units: "portions", g2: "cups of tea", g2One: "a cup of tea", g2Units: "cups" },
    { who: "A student flat in Munich", g1: "pretzels", g1Units: "pretzels", g2: "litres of apple spritz", g2One: "a litre of apple spritz", g2Units: "litres" },
] as const;

const E1_CT_CD_HYPOTHETICAL_INCOME_SCENARIOS = [
    { who: "A swimmer in Copenhagen", subj: "she", poss: "her", g1: "pool entries", g1One: "a pool entry", g1Units: "entries", g2: "cinnamon buns", g2One: "A bun", g2Units: "buns" },
    { who: "A climber in Innsbruck", subj: "he", poss: "his", g1: "climbing-hall entries", g1One: "a climbing-hall entry", g1Units: "entries", g2: "energy bars", g2One: "A bar", g2Units: "bars" },
    { who: "A skater in Helsinki", subj: "she", poss: "her", g1: "rink sessions", g1One: "a rink session", g1Units: "sessions", g2: "hot chocolates", g2One: "A hot chocolate", g2Units: "hot chocolates" },
] as const;

const E1_CT_LABOR_FREE_TIME_SCENARIOS = [
    { who: "A freelance illustrator in Porto", subj: "she", poss: "her" },
    { who: "A ride-share driver in Athens", subj: "he", poss: "his" },
    { who: "A yoga instructor in Riga", subj: "she", poss: "her" },
] as const;

const E1_CT_LABOR_HOURS_WORKED_SCENARIOS = [
    { who: "A bike courier in Tallinn", subj: "he", poss: "his" },
    { who: "A tour guide in Dubrovnik", subj: "she", poss: "her" },
    { who: "A carpenter in Bergen", subj: "he", poss: "his" },
] as const;

const E1_CT_LABOR_CONSUMPTION_SCENARIOS = [
    { who: "A piano teacher in Ljubljana", subj: "she", poss: "her", work: "paid lessons", activity: "teaching" },
    { who: "A tattoo artist in Berlin", subj: "he", poss: "his", work: "paid sessions", activity: "tattooing" },
    { who: "A private tutor in Cork", subj: "she", poss: "her", work: "paid tutoring", activity: "tutoring" },
] as const;

const E1_CT_LABOR_HYPOTHETICAL_BUNDLE_SCENARIOS = [
    { who: "A data analyst in Bilbao", subj: "she", poss: "her" },
    { who: "A welder in Ostrava", subj: "he", poss: "his" },
    { who: "A pastry chef in Nice", subj: "she", poss: "her" },
] as const;

const E1_CT_LABOR_HYPOTHETICAL_TIME_BUDGET_SCENARIOS = [
    { who: "A translator in Turku", subj: "she", poss: "her" },
    { who: "A physiotherapist in Graz", subj: "he", poss: "his" },
    { who: "A sound engineer in Bristol", subj: "she", poss: "her" },
] as const;

const E1_CT_LEONTIEF_DEMAND_SCENARIOS = [
    { who: "A guest at a café in Valencia", subj: "he", g1: "coffees", g1One: "coffee", g2: "biscuits", verbPre: "eats", verbPost: "with", one1: "A coffee", one2: "a biscuit" },
    { who: "A hobbyist at a hardware store in Leeds", subj: "he", g1: "shelves", g1One: "shelf", g2: "brackets", verbPre: "uses", verbPost: "with", one1: "A shelf", one2: "a bracket" },
    { who: "A model builder at a hobby shop in Dresden", subj: "she", g1: "kits", g1One: "kit", g2: "paint pots", verbPre: "uses", verbPost: "for", one1: "A kit", one2: "a paint pot" },
    { who: "A gardener at a nursery in Malmö", subj: "she", g1: "planters", g1One: "planter", g2: "seedlings", verbPre: "puts", verbPost: "in", one1: "A planter", one2: "a seedling" },
] as const;

const E1_CT_SUBSTITUTES_MAX_UTILITY_SCENARIOS = [
    { who: "A cyclist in Utrecht", subj: "she", good: "energy bars", one: "bar", units: "bars" },
    { who: "A student in Bologna", subj: "he", good: "instant-noodle packs", one: "pack", units: "packs" },
    { who: "A painter in Lisbon", subj: "she", good: "tubes of white paint", one: "tube", units: "tubes" },
] as const;

const E1_CT_CROSS_PRICE_QUANTITY_SCENARIOS = [
    { who: "A supermarket chain in Antwerp", qty: "litres of oat drink", unit: "litres", g1: "oat drink", g2: "cow milk" },
    { who: "A sports retailer in Leeds", qty: "pairs of running shoes", unit: "pairs", g1: "running shoes", g2: "gym memberships" },
    { who: "A grocery chain in Vienna", qty: "boxes of frozen pizza", unit: "boxes", g1: "frozen pizza", g2: "delivery meals" },
    { who: "A bike shop in Lyon", qty: "e-bikes", unit: "e-bikes", g1: "e-bikes", g2: "public-transport passes" },
] as const;

const E1_CT_OWN_PRICE_QUANTITY_CHANGE_SCENARIOS = [
    { who: "A gym chain in Gothenburg", good: "its monthly passes", one: "a pass", units: "passes" },
    { who: "A ferry line in Split", good: "its return tickets", one: "a ticket", units: "tickets" },
    { who: "A streaming service in Dublin", good: "its subscriptions", one: "a subscription", units: "subscriptions" },
    { who: "A ski resort in Andorra", good: "its day passes", one: "a day pass", units: "day passes" },
] as const;

const E1_PROD_MRTS_AT_POINT_SCENARIOS = [
    { who: "A ceramics studio in Faenza", capital: "machines" },
    { who: "A bookbindery in Ghent", capital: "presses" },
    { who: "A microbrewery in Leuven", capital: "tanks" },
] as const;

const E1_PROD_AVERAGE_PRODUCT_AT_POINT_SCENARIOS = [
    { who: "A cannery in Vigo", unit: "tins" },
    { who: "A bakery in Porto", unit: "loaves" },
    { who: "A bottling plant in Graz", unit: "bottles" },
] as const;

const E1_PROD_RETURNS_TO_SCALE_FACTOR_SCENARIOS = [
    { who: "A shipyard in Gdansk" },
    { who: "A wind-turbine plant in Esbjerg" },
    { who: "A furniture factory in Kaunas" },
] as const;

const E1_PROD_COST_MIN_LABOR_BILINEAR_SCENARIOS = [
    { who: "A glassworks in Murano" },
    { who: "A tannery in Igualada" },
    { who: "A candle factory in Aarhus" },
] as const;

const E1_PROD_MIN_COST_BILINEAR_SCENARIOS = [
    { who: "A brewery in Plzen" },
    { who: "A cider press in Asturias" },
    { who: "A chocolate factory in Turin" },
] as const;

const E1_PROD_MIN_COST_COBB_DOUGLAS_SCENARIOS = [
    { who: "A paper mill in Lahti" },
    { who: "A steel foundry in Linz" },
    { who: "A flour mill in Szeged" },
] as const;

const E1_PROD_OUTPUT_FROM_BUDGET_SCENARIOS = [
    { who: "A print shop in Leipzig" },
    { who: "A textile mill in Lodz" },
    { who: "A joinery in Bolzano" },
] as const;

const E1_PROD_ZERO_PROFIT_PRICE_SCENARIOS = [
    { who: "A soap works in Marseille", short: "the soap works", units: "bars of soap", one: "bar" },
    { who: "A candle maker in Tallinn", short: "the candle maker", units: "candles", one: "candle" },
    { who: "A cheese dairy in Gouda", short: "the dairy", units: "wheels of cheese", one: "wheel" },
] as const;

const E1_PROD_MARGINAL_COST_FROM_TECHNOLOGY_SCENARIOS = [
    { who: "A machine shop in Brno" },
    { who: "A foundry in Bilbao" },
    { who: "A pottery in Stoke-on-Trent" },
] as const;

const E1_PROD_UNIT_COST_CRS_SCENARIOS = [
    { who: "A blade plant in Aalborg", short: "the plant" },
    { who: "A tile factory in Castellón", short: "the factory" },
    { who: "A sawmill in Joensuu", short: "the mill" },
] as const;

const E1_PC_SHORTRUN_SUPPLY_FROM_MC_SCENARIOS = [
    { who: "A price-taking olive mill in Jaén", short: "the mill", units: "hectolitres", one: "hectolitre", made: "of oil pressed", verb: "press" },
    { who: "A price-taking cider press in Somerset", short: "the cidery", units: "hectolitres", one: "hectolitre", made: "of cider pressed", verb: "press" },
    { who: "A price-taking honey farm in Provence", short: "the farm", units: "kilograms", one: "kilogram", made: "of honey harvested", verb: "harvest" },
] as const;

const E1_PC_THRESHOLD_PRICE_NO_LINEAR_SCENARIOS = [
    { who: "A workshop for hand-glazed tiles in Lisbon", short: "the workshop", one: "crate of tiles", units: "crates" },
    { who: "A small distillery on Islay", short: "the distillery", one: "cask of whisky", units: "casks" },
    { who: "A bindery for hand-bound notebooks in Florence", short: "the bindery", one: "box of notebooks", units: "boxes" },
] as const;

const E1_PC_SHUTDOWN_PRICE_SCENARIOS = [
    { who: "A mineral-water bottler in Bergen", short: "the bottler", one: "crate" },
    { who: "A brick works in Leuven", short: "the works", one: "pallet" },
    { who: "A mushroom farm in Wallonia", short: "the farm", one: "crate" },
] as const;

const E1_PC_SHORTRUN_PROFIT_POSITIVE_SCENARIOS = [
    { who: "A cheese dairy in Groningen", short: "the dairy", units: "wheels of cheese", one: "wheel", unitsShort: "wheels" },
    { who: "A jam kitchen in Graz", short: "the kitchen", units: "cases of jam", one: "case", unitsShort: "cases" },
    { who: "A charcoal maker in the Ardennes", short: "the maker", units: "sacks of charcoal", one: "sack", unitsShort: "sacks" },
] as const;

const E1_PC_LONGRUN_QUANTITY_AT_PRICE_SCENARIOS = [
    { who: "A tulip-bulb grower in Lisse", short: "the grower", one: "crate of bulbs", oneShort: "crate", units: "crates" },
    { who: "A lavender distiller in Provence", short: "the distiller", one: "litre of lavender oil", oneShort: "litre", units: "litres" },
    { who: "A salt works in Trapani", short: "the works", one: "tonne of sea salt", oneShort: "tonne", units: "tonnes" },
] as const;

const E1_PC_LR_PRICE_WITH_FIXED_COST_SCENARIOS = [
    { who: "Every actual and potential builder of steel bicycle frames in Utrecht", one: "frame", units: "frames" },
    { who: "Every actual and potential maker of wooden surfboards in Biarritz", one: "board", units: "boards" },
    { who: "Every actual and potential cooper of oak barrels in Jerez", one: "barrel", units: "barrels" },
] as const;

const E1_PC_LR_NUMBER_OF_FIRMS_LINEAR_TERM_SCENARIOS = [
    { who: "Coffee roasters in Trieste", product: "roasted coffee", units: "sacks", firms: "roasters" },
    { who: "Kombucha brewers in Hamburg", product: "kombucha", units: "crates", firms: "brewers" },
    { who: "Candle workshops in Riga", product: "candles", units: "boxes", firms: "workshops" },
] as const;

const E1_PC_LR_PRODUCER_SURPLUS_SCENARIOS = [
    { who: "Soap makers in Marseille", units: "bars" },
    { who: "Tofu makers in Rotterdam", units: "blocks" },
    { who: "Bagel bakeries in Montreal", units: "bagels" },
] as const;

const E1_PC_LR_TOTAL_SURPLUS_SCENARIOS = [
    { who: "Pasta makers in Bologna", units: "crates" },
    { who: "Cheese makers in Gruyères", units: "wheels" },
    { who: "Tortilla bakeries in Oaxaca", units: "crates" },
] as const;

const E1_PC_MARKET_SUPPLY_N_FIRMS_SCENARIOS = [
    { who: "identical sawmills in Tampere", firm: "mill", firms: "mills", units: "cubic metres", one: "cubic metre", made: "of sawn timber" },
    { who: "identical brick kilns in Tuscany", firm: "kiln", firms: "kilns", units: "pallets", one: "pallet", made: "of bricks" },
    { who: "identical quarries in Carrara", firm: "quarry", firms: "quarries", units: "tonnes", one: "tonne", made: "of marble" },
] as const;

const E1_MKT_EQUILIBRIUM_QUANTITY_SCENARIOS = [
    { good: "oat milk in Copenhagen", units: "cartons", one: "carton" },
    { good: "sourdough bread in Lisbon", units: "loaves", one: "loaf" },
    { good: "cold-brew coffee in Milan", units: "bottles", one: "bottle" },
] as const;

const E1_MKT_PRODUCER_SURPLUS_SCENARIOS = [
    { good: "Farmed mussels in Galway" },
    { good: "Smoked trout in Bavaria" },
    { good: "Fresh figs in Izmir" },
] as const;

const E1_MKT_EQUILIBRIUM_FROM_WORDS_SCENARIOS = [
    { place: "the weekly market in Valencia", good: "strawberries", sellers: "The growers", why: "the berries spoil otherwise", unitsLong: "kilograms", units: "kg", one: "kilogram" },
    { place: "the fish market in Porto", good: "fresh sardines", sellers: "The boat crews", why: "the catch spoils otherwise", unitsLong: "kilograms", units: "kg", one: "kilogram" },
    { place: "the flower market in Aalsmeer", good: "cut tulips", sellers: "The growers", why: "the flowers wilt otherwise", unitsLong: "bunches", units: "bunches", one: "bunch" },
] as const;

const E1_MKT_PS_TRAPEZOID_SCENARIOS = [
    { good: "firewood in Innsbruck", seller: "the local forestry", why: "thinning waste it has to clear anyway", units: "bundles" },
    { good: "wood chips in Jyväskylä", seller: "the local sawmill", why: "offcuts it has to get rid of anyway", units: "cubic metres" },
    { good: "compost in Utrecht", seller: "the municipal green-waste plant", why: "material it has to dispose of anyway", units: "sacks" },
] as const;

const E1_MKT_ELASTICITY_AT_EQUILIBRIUM_SCENARIOS = [
    { good: "bicycle helmets in Amsterdam", units: "helmets" },
    { good: "rain jackets in Bergen", units: "jackets" },
    { good: "sunglasses in Nice", units: "pairs" },
] as const;

const E1_MKT_UNIT_TAX_CONSUMER_PRICE_SCENARIOS = [
    { good: "ceramic mugs in Kraków", one: "mug", units: "mugs" },
    { good: "leather belts in Florence", one: "belt", units: "belts" },
    { good: "wool hats in Reykjavik", one: "hat", units: "hats" },
] as const;

const E1_MKT_UNIT_TAX_REVENUE_SCENARIOS = [
    { good: "Wool blankets in Cardiff", units: "blankets" },
    { good: "Linen tablecloths in Vilnius", units: "tablecloths" },
    { good: "Cast-iron pans in Sheffield", units: "pans" },
] as const;

const E1_MKT_TOTAL_SURPLUS_SCENARIOS = [
    { good: "Second-hand bicycles in Ghent", units: "bicycles" },
    { good: "Used textbooks in Leuven", units: "textbooks" },
    { good: "Refurbished laptops in Tallinn", units: "laptops" },
] as const;

const E1_PCTL_CAP_NONBINDING_QUANTITY_SCENARIOS = [
    { intro: "On the Cypriot island bus route from Larnaca to the airport", units: "rides", one: "ride", price: "fare", authority: "The ministry of transport" },
    { intro: "On the harbour ferry between Valletta and Sliema", units: "crossings", one: "crossing", price: "fare", authority: "The transport authority" },
    { intro: "At the public swimming pool in Ljubljana", units: "entries", one: "entry", price: "price", authority: "The city council" },
    { intro: "In the municipal car park of Bratislava's old town", units: "parking hours", one: "hour", price: "tariff", authority: "The city council" },
] as const;

const E1_PCTL_CAP_NONBINDING_SURPLUS_SCENARIOS = [
    { place: "Casablanca", good: "butane cylinders", one: "cylinder", units: "cylinders", authority: "The regulator" },
    { place: "Tunis", good: "cans of cooking oil", one: "can", units: "cans", authority: "The ministry of trade" },
    { place: "Lima", good: "sacks of rice", one: "sack", units: "sacks", authority: "The government" },
] as const;

const E1_PCTL_CAP_BINDING_QUANTITY_SCENARIOS = [
    { place: "Cairo", good: "sacks of wheat flour", one: "sack", units: "sacks", purpose: "To keep flour affordable" },
    { place: "Lagos", good: "bags of rice", one: "bag", units: "bags", purpose: "To keep rice affordable" },
    { place: "Buenos Aires", good: "litres of milk", one: "litre", units: "litres", purpose: "To keep milk affordable" },
] as const;

const E1_PCTL_CAP_BINDING_DWL_SCENARIOS = [
    { place: "Belgrade", good: "firewood", one: "cubic metre", units: "cubic metres", short: "m³", authority: "The city" },
    { place: "Sofia", good: "heating oil", one: "litre", units: "litres", short: "litres", authority: "The government" },
    { place: "Sarajevo", good: "coal briquettes", one: "tonne", units: "tonnes", short: "tonnes", authority: "The canton" },
] as const;

const E1_PCTL_CAP_BINDING_CS_SCENARIOS = [
    { place: "Ankara", good: "bags of animal feed", one: "bag", units: "bags" },
    { place: "Nairobi", good: "bags of maize flour", one: "bag", units: "bags" },
    { place: "Tbilisi", good: "sacks of fertiliser", one: "sack", units: "sacks" },
] as const;

const E1_PCTL_FLOOR_DWL_SCENARIOS = [
    { intro: "France's raw-milk market is quoted in hectolitres (100 litres)", one: "hectolitre", units: "hectolitres", short: "hL", product: "milk", producers: "farmers", authority: "the state" },
    { intro: "Poland's apple market is quoted in tonnes", one: "tonne", units: "tonnes", short: "tonnes", product: "apples", producers: "growers", authority: "the government" },
    { intro: "Spain's olive-oil market is quoted in hectolitres (100 litres)", one: "hectolitre", units: "hectolitres", short: "hL", product: "oil", producers: "producers", authority: "the ministry" },
] as const;

const E1_MONO_PRICE_QUADRATIC_COST_SCENARIOS = [
    { firm: "The only ferry company serving the island of Heligoland", units: "return tickets", unitsShort: "tickets", price: "fare" },
    { firm: "The only cable car up a Tyrolean peak", units: "return rides", unitsShort: "rides", price: "fare" },
    { firm: "The only campsite on a small Croatian island", units: "overnight stays", unitsShort: "stays", price: "price" },
    { firm: "The only ice rink in a Finnish town", units: "session tickets", unitsShort: "tickets", price: "price" },
] as const;

const E1_MONO_CONSUMER_SURPLUS_SCENARIOS = [
    { firm: "The company holding the exclusive concession for parking at Riga airport", units: "parking days", per: "per day" },
    { firm: "The company holding the sole licence for boat moorings in a Croatian marina", units: "mooring nights", per: "per night" },
    { firm: "The only operator of luggage lockers at Prague's main station", units: "locker days", per: "per day" },
] as const;

const E1_MONO_PROFIT_SCENARIOS = [
    { firm: "The only company selling day passes in the Andorran ski resort of Arinsal", units: "passes", one: "pass" },
    { firm: "The only operator of glacier tours in a Swiss valley", units: "tours", one: "tour" },
    { firm: "The only water park on the Costa Brava", units: "entries", one: "entry" },
] as const;

const E1_MONO_PERFECT_DISCRIMINATION_QUANTITY_SCENARIOS = [
    { firm: "A Danish firm holds the only patent on a soil-analysis kit", units: "kits", one: "kit" },
    { firm: "A Dutch firm holds the only patent on a greenhouse sensor", units: "sensors", one: "sensor" },
    { firm: "An Austrian firm holds the only patent on an avalanche beacon", units: "beacons", one: "beacon" },
] as const;

const E1_MONO_PERFECT_DISCRIMINATION_PROFIT_SCENARIOS = [
    { firm: "The sole provider of satellite broadband in the Scottish Highlands", units: "subscriptions" },
    { firm: "The only water-delivery service on a small Greek island", units: "monthly contracts" },
    { firm: "The sole cable-TV operator in a Norwegian fjord town", units: "subscriptions" },
] as const;

const E1_MONO_PRICE_LINEAR_COST_GENERAL_SCENARIOS = [
    { firm: "The only natural-gas distributor on a Croatian island" },
    { firm: "The only district-heating supplier in a Lapland town" },
    { firm: "The sole electricity supplier on a Faroese island" },
] as const;

const E1_MONO_UNIT_TAX_PROFIT_SCENARIOS = [
    { firm: "The only licensed bottler of spring water in Rogaska Slatina", short: "the bottler", state: "Slovenia", units: "crates", one: "crate" },
    { firm: "The only licensed distillery on the island of Islay", short: "the distillery", state: "Scotland", units: "cases", one: "case" },
    { firm: "The only licensed oyster farm in the bay of Arcachon", short: "the farm", state: "France", units: "crates", one: "crate" },
] as const;

const E1_EXT_DWL_NEGATIVE_SCENARIOS = [
    { intro: "Sand is dredged from the Danube near Novi Sad and sold by the tonne", supply: "the dredgers' private supply", one: "tonne", units: "tonnes", harmPre: "Every tonne dredged costs downstream fishers", harmPost: "in lost catch, which no dredger pays for" },
    { intro: "Gravel is quarried near Lake Bled and sold by the tonne", supply: "the quarries' private supply", one: "tonne", units: "tonnes", harmPre: "Every tonne quarried costs the lakeside hotels", harmPost: "in lost bookings from dust and noise, which no quarry pays for" },
    { intro: "Coal is mined in a valley in Silesia and sold by the tonne", supply: "the mines' private supply", one: "tonne", units: "tonnes", harmPre: "Every tonne mined costs the nearby farms", harmPost: "in crop damage from the dust, which no mine pays for" },
] as const;

const E1_EXT_PIGOU_TAX_RISING_DAMAGE_SCENARIOS = [
    { intro: "Peat briquettes from a bog in County Offaly are traded by the tonne", one: "tonne", units: "tonnes", why: "Each extra tonne cut degrades the bog further" },
    { intro: "Groundwater from an aquifer near Murcia is pumped and traded by the megalitre", one: "megalitre", units: "megalitres", why: "Each extra megalitre pumped lowers the water table further" },
    { intro: "Whitefish from a lake in Carinthia are caught and traded by the tonne", one: "tonne", units: "tonnes", why: "Each extra tonne caught depletes the stock further" },
] as const;

const E1_EXT_POSITIVE_SOCIAL_QUANTITY_SCENARIOS = [
    { who: "A clinic in Tampere sells flu shots", units: "shots", one: "shot", benefit: "Every shot also spares other people an infection worth", noun: "vaccination", subsidy: "per shot" },
    { who: "A nursery in Ghent sells street trees to homeowners", units: "trees", one: "tree", benefit: "Every tree also cools and shades the neighbours' homes, a benefit worth", noun: "tree planting", subsidy: "per tree" },
    { who: "A school in Bergen sells places on evening first-aid courses", units: "places", one: "place", benefit: "Every trained person also makes bystanders safer, a benefit worth", noun: "first-aid training", subsidy: "per place" },
    { who: "An installer in Leeds sells rooftop solar panels", units: "panels", one: "panel", benefit: "Every panel also cuts emissions for everyone else, a benefit worth", noun: "solar installation", subsidy: "per panel" },
] as const;

const E1_EXT_POSITIVE_DWL_SCENARIOS = [
    { intro: "Beekeepers in Provence rent out hives for the almond bloom", buyers: "growers", units: "hives", one: "hive", per: "per hive-season", benefit: "Each hive also pollinates neighbouring orchards that pay nothing, an external benefit of", never: "rented" },
    { intro: "Landscapers in Utrecht plant front-garden hedges", buyers: "homeowners", units: "hedges", one: "hedge", per: "per hedge", benefit: "Each hedge also cools and greens the street for neighbours who pay nothing, an external benefit of", never: "planted" },
    { intro: "Language schools in Porto offer evening courses in sign language", buyers: "learners", units: "course places", one: "place", per: "per place", benefit: "Each trained person also makes daily life easier for deaf neighbours who pay nothing, an external benefit of", never: "filled" },
] as const;

const E1_PG_EFFICIENT_PROVISION_IDENTICAL_SCENARIOS = [
    { members: "households", member: "household", place: "of Ostuni", what: "the village fireworks show, a pure public good", one: "minute", units: "minutes", good: "fireworks", provider: "the pyrotechnician charges" },
    { members: "flats", member: "flat", place: "in a Hamburg apartment block", what: "the lighting of the shared courtyard, a pure public good", one: "lamp", units: "lamps", good: "courtyard lighting", provider: "the electrician charges" },
    { members: "villages", member: "village", place: "along a Norwegian fjord", what: "the winter snow-clearing of their shared access road, a pure public good", one: "kilometre", units: "kilometres", good: "cleared road", provider: "the contractor charges" },
    { members: "cabins", member: "cabin", place: "around a Finnish lake", what: "the treatment of the lake against algae, a pure public good", one: "hour", units: "hours", good: "treatment", provider: "the contractor charges" },
] as const;

const E1_PG_EFFICIENT_PROVISION_TWO_TYPES_SCENARIOS = [
    { intro: "The Greek village of Kardamyli installs a shared Wi-Fi mast; its bandwidth $Q$ (in Mbit/s) is a pure public good", type1: "households", type1One: "household", type2: "guesthouses", type2One: "guesthouse", unit: "Mbit/s", unitOne: "Mbit/s", asks: "Which bandwidth is socially efficient?" },
    { intro: "The Austrian village of Lech extends its avalanche-warning system; its coverage $Q$ (in monitored slopes) is a pure public good", type1: "residents", type1One: "resident", type2: "hotels", type2One: "hotel", unit: "slopes", unitOne: "slope", asks: "How many slopes should be monitored to be socially efficient?" },
    { intro: "The Dutch town of Zierikzee raises its sea dyke; the extra height $Q$ (in centimetres) is a pure public good", type1: "homeowners", type1One: "homeowner", type2: "businesses", type2One: "business", unit: "centimetres", unitOne: "centimetre", asks: "Which extra height is socially efficient?" },
] as const;

const E1_PG_UNDERPROVISION_GAP_SCENARIOS = [
    { members: "households", member: "household", intro: "on a street in Naples can hire a night security patrol for the whole street, a pure public good", unit: "patrol hour", costPhrase: "an hour of patrolling costs" },
    { members: "farms", member: "farm", intro: "in a valley in Tyrol can hire a helicopter for hail-defence flights over the whole valley, a pure public good", unit: "flight hour", costPhrase: "an hour of flying costs" },
    { members: "shops", member: "shop", intro: "in an arcade in Genoa can hire a cleaner for the shared passage, a pure public good", unit: "cleaning hour", costPhrase: "an hour of cleaning costs" },
    { members: "boat owners", member: "boat owner", intro: "in a marina in Kiel can hire a night watch for all the pontoons, a pure public good", unit: "watch hour", costPhrase: "an hour of watch costs" },
] as const;

export const econ1Questions: Question[] = [
    // ------------------------------------------------ comparative advantage
    {
        id: "e1-ca-specialization-total",
        subject: "econ1",
        topic: "comparative_advantage",
        difficulty: "easy",
        kind: "numeric",
        unit: "units",
        source: "TUM Economics I Exercise Exam WT22/23, Q3",
        build: (rng) => {
            const s = rng.pick(E1_CA_SPECIALIZATION_TOTAL_SCENARIOS);
            const cA = rng.int(12, 20) * 100; // A: good X if only X
            const tA = rng.int(2, 4) * 100; // A: good Y if only Y
            const cB = rng.int(8, 12) * 100; // B: good X if only X
            const tB = rng.int(6, 10) * 100; // B: good Y if only Y
            // opportunity cost of Y (in X): A >= 3, B <= 2 by construction
            const answer = cA + tB;
            return {
                prompt: `${s.intro}. Working alone for a month, ${s.a} can ${s.verb} ${n(cA)} ${s.x} **or** ${n(tA)} ${s.y}, while ${s.b} can ${s.verb} ${n(cB)} ${s.x} **or** ${n(tB)} ${s.y}. Each specializes fully in the good in which they hold the comparative advantage. How many ${s.total} does ${s.who} produce in total per month?`,
                given: {
                    [`${s.a}: ${s.x} or ${s.y}`]: `${n(cA)} or ${n(tA)}`,
                    [`${s.b}: ${s.x} or ${s.y}`]: `${n(cB)} or ${n(tB)}`,
                },
                answer,
                explanation: String.raw`Each producer specializes where their opportunity cost is lowest: $OC_{\text{${s.yOne}}} = \frac{\text{${s.x} given up}}{\text{${s.y} gained}}$. ${s.a}'s opportunity cost of a ${s.yOne} is ${n(cA)} / ${n(tA)} = ${n2(cA / tA)} ${s.x}, ${s.b}'s is ${n(cB)} / ${n(tB)} = ${n2(cB / tB)} ${s.x}. ${s.b}'s is lower, so ${s.b} makes only ${s.y} (${n(tB)}) and ${s.a} only ${s.x} (${n(cA)}). Total output: ${n(cA)} + ${n(tB)} = ${n(answer)}.`,
            };
        },
    },
    {
        id: "e1-ca-trade-price-bound",
        subject: "econ1",
        topic: "comparative_advantage",
        difficulty: "medium",
        kind: "numeric",
        unit: "ratio",
        source: "TUM Economics I Exercise Exam WT22/23, Q5",
        build: (rng) => {
            const s = rng.pick(E1_CA_TRADE_PRICE_BOUND_SCENARIOS);
            const yA = rng.int(3, 6) * 100; // country A: units of good Y
            const mult = rng.pick([3, 4, 5]); // A's opportunity cost of Y (in X)
            const xA = yA * mult; // country A: units of good X
            const yB = rng.int(6, 10) * 100; // country B: units of good Y
            const fac = rng.pick([1, 1.25, 2]); // B's opportunity cost of Y
            const xB = yB * fac; // country B: units of good X
            return {
                prompt: `${s.a} can produce ${n(xA)} ${s.x} **or** ${n(yA)} ${s.y} per year; ${s.b} can produce ${n(xB)} ${s.x} **or** ${n(yB)} ${s.y}. They want to trade ${s.yShort} for ${s.xShort}. What is the **maximum** price of one ${s.yOne}, measured in ${s.xUnit}, at which both countries still gain from trade?`,
                given: {
                    [`${s.a}: ${s.xShort} or ${s.yShort}`]: `${n(xA)} or ${n(yA)}`,
                    [`${s.b}: ${s.xShort} or ${s.yShort}`]: `${n(xB)} or ${n(yB)}`,
                },
                answer: mult,
                explanation: String.raw`Both gain only if the relative price lies between the two opportunity costs: $OC_{\text{${s.b}}} < p_{\text{${s.yShort}}} < OC_{\text{${s.a}}}$. Opportunity cost of one ${s.yOne}: ${s.a} ${n(xA)} / ${n(yA)} = ${n(mult)} ${s.xUnit}, ${s.b} ${n(xB)} / ${n(yB)} = ${n(fac)} ${s.xUnit}. ${s.b} (the low-cost producer) sells ${s.yShort}, and ${s.a} will pay at most its own opportunity cost. The mutually beneficial range is ${n(fac)} to ${n(mult)} ${s.xUnit} per ${s.yOne}, so the maximum price is ${n(mult)}.`,
            };
        },
    },

    // ------------------------------------------------------- consumer theory
    {
        id: "e1-ct-cobb-douglas-demand",
        subject: "econ1",
        topic: "consumer_theory",
        difficulty: "medium",
        kind: "numeric",
        unit: "units",
        source: "TUM Economics I Exercise Exam WT22/23, Q11",
        build: (rng) => {
            const s = rng.pick(E1_CT_COBB_DOUGLAS_DEMAND_SCENARIOS);
            const pair = rng.pick([
                [1, 4],
                [3, 4],
                [1, 3],
                [2, 3],
                [1, 2],
            ] as const);
            const [num, den] = pair;
            const p1 = rng.int(2, 8);
            const p2 = rng.int(2, 8);
            const k = rng.int(5, 20);
            const m = p1 * den * k; // makes q1 a clean integer
            const answer = num * k; // = (num/den) * m / p1
            return {
                prompt: String.raw`${s.who} has Cobb-Douglas preferences $U(q_1, q_2) = q_1^{${num}/${den}} \cdot q_2^{${den - num}/${den}}$ over ${s.g1} ($q_1$) and ${s.g2} ($q_2$). ${cap(s.poss)} budget is ${eur(m)}, ${s.g1One} costs ${eur(p1)} and ${s.g2One} costs ${eur(p2)}. How many ${s.g1} does ${s.subj} buy at the optimum?`,
                given: {
                    "Budget m": eur(m),
                    "Price $p_1$": eur(p1),
                    "Price $p_2$": eur(p2),
                },
                answer,
                explanation: String.raw`With Cobb-Douglas utility $U = q_1^{a} q_2^{b}$ and $a + b = 1$, each exponent is the expenditure share: $q_1^* = a \cdot \frac{m}{p_1}$. Here $a = \frac{${num}}{${den}}$, so $q_1^*$ = ${n(num)}/${n(den)} · ${eur(m)} / ${eur(p1)} = ${n(answer)} ${s.unit1}. (Analogously $q_2^* = \frac{${den - num}}{${den}} \cdot \frac{m}{p_2}$ = ${n2(((den - num) / den) * (m / p2))}.)`,
            };
        },
    },
    {
        id: "e1-ct-indirect-utility",
        subject: "econ1",
        topic: "consumer_theory",
        difficulty: "hard",
        kind: "numeric",
        unit: "number",
        source: "TUM Economics I Exercise Exam WT22/23, Q12",
        build: (rng) => {
            const pair = rng.pick([
                [1, 4],
                [3, 4],
                [1, 3],
                [2, 3],
                [1, 2],
            ] as const);
            const [num, den] = pair;
            const a = num / den;
            const b = (den - num) / den;
            const p1 = rng.int(2, 5);
            const p1New = 2 * p1; // the price of good 1 doubles
            const p2 = rng.pick([3, 4, 5, 7, 8]);
            const k = rng.int(4, 12);
            const m = p1New * den * k; // q1 stays a clean integer at the NEW price
            const q1 = num * k;
            const q2 = (b * m) / p2;
            const answer = q1 ** a * q2 ** b;
            return {
                prompt: String.raw`A consumer with utility $U(q_1, q_2) = q_1^{${num}/${den}} \cdot q_2^{${den - num}/${den}}$ has income ${eur(m)}. The price of good 2 is ${eur(p2)}. The price of good 1 has just **doubled** from ${eur(p1)} to ${eur(p1New)}. What utility level does she reach at the new prices (her indirect utility)?`,
                given: {
                    "Income m": eur(m),
                    "New price $p_1$": eur(p1New),
                    "Price $p_2$": eur(p2),
                },
                answer,
                explanation: String.raw`First find the new optimal bundle from the expenditure shares $q_1^* = a \cdot \frac{m}{p_1}$, $q_2^* = b \cdot \frac{m}{p_2}$, then evaluate $U$ at that bundle. Here $q_1^*$ = ${n(num)}/${n(den)} · ${eur(m)} / ${eur(p1New)} = ${n(q1)} and $q_2^*$ = ${n(den - num)}/${n(den)} · ${eur(m)} / ${eur(p2)} = ${n2(q2)}. Utility: $U = q_1^{*\,${num}/${den}} \cdot q_2^{*\,${den - num}/${den}}$ = ${n2(q1)}^${n(a)} · ${n2(q2)}^${n(b)} = ${n2(answer)}. Only good 1's demand falls - with Cobb-Douglas preferences the price change does not shift spending across goods.`,
            };
        },
    },

    // -------------------------------------------- production & cost minimum
    {
        id: "e1-pc-cost-minimization",
        subject: "econ1",
        topic: "production_costs",
        difficulty: "hard",
        kind: "numeric",
        unit: "units",
        source: "TUM Economics I Exercise Exam WT22/23, Q22",
        build: (rng) => {
            const a = rng.pick([2, 4]); // technology coefficient
            const s = rng.int(1, 3); // wage-rental ratio w/r
            const r = rng.pick([5, 15, 20]);
            const w = s * r;
            const L = rng.int(6, 14);
            const coef = s * a + 1; // Q = (sa + 1) L^2 at the optimum
            const Q = coef * L * L;
            const K = ((s * a + 2) / a) * L;
            return {
                prompt: String.raw`A workshop produces with the technology $Q = ${a} K L - L^2$. The wage is ${eur(w)} per unit of labor and the rental rate of capital is ${eur(r)}. It must deliver an output of ${n(Q)} units at minimum cost. How much **labor** $L$ does it hire?`,
                given: {
                    "Technology": String.raw`$Q = ${a} K L - L^2$`,
                    "Wage w": eur(w),
                    "Rental rate r": eur(r),
                    "Required output Q": `${n(Q)} units`,
                },
                answer: L,
                explanation: String.raw`Cost minimization requires $MRTS_{L,K} = \frac{MP_L}{MP_K} = \frac{w}{r}$. Here $MP_L = ${a}K - 2L$ and $MP_K = ${a}L$, so $\frac{${a}K - 2L}{${a}L} = ${n(s)}$, which gives $K = ${n((s * a + 2) / a)}\, L$. Substituting into the technology: $Q = ${a} K L - L^2 = ${n(coef)}\, L^2$, so $L = \sqrt{Q / ${n(coef)}}$ = ${n(L)} units (and $K$ = ${n2(K)}).`,
            };
        },
    },

    // ---------------------------------------------------- perfect competition
    {
        id: "e1-pc-shortrun-loss",
        subject: "econ1",
        topic: "perfect_competition",
        difficulty: "hard",
        kind: "numeric",
        unit: "EUR",
        source: "TUM Economics I Exercise Exam WT22/23, Q23",
        build: (rng) => {
            const s = rng.pick(E1_PC_SHORTRUN_LOSS_SCENARIOS);
            const c2 = rng.pick([0.2, 0.25, 0.5]);
            const c1 = rng.pick([6, 7, 8, 9, 11, 12, 13, 14]);
            const q = rng.int(4, 10);
            const p = c1 + 2 * c2 * q; // price such that MC = p at q
            const vp = c2 * q * q; // variable profit (p - AVC) * q area
            const loss = rng.int(2, 8) * 10;
            const F = vp + loss; // fixed cost chosen so profit = -loss < 0
            return {
                prompt: String.raw`A price-taking ${s.firm} has short-run costs $C(q) = ${n(c2)} q^2 + ${n(c1)} q + ${n(F)}$. The market price is ${eur(p)} per ${s.one}. What profit does it earn at its optimal short-run output? (A loss is a negative number.)`,
                given: {
                    "Cost function": String.raw`$C(q) = ${n(c2)} q^2 + ${n(c1)} q + ${n(F)}$`,
                    "Market price p": eur(p),
                },
                answer: -loss,
                explanation: String.raw`A competitive firm produces where $p = MC(q)$, then $\pi = p \cdot q - C(q)$. Here $MC = ${n(2 * c2)} q + ${n(c1)} = $ ${n(p)} gives $q^*$ = ${n(q)}. Profit: ${eur(p * q)} − ${eur(vp + c1 * q + F)} = ${eur(-loss)}. The firm still produces in the short run: $p > AVC = ${n(c2)} q + ${n(c1)}$ (= ${eur(c2 * q + c1)} at $q^*$), so operating covers all variable cost plus part of the fixed cost - shutting down would lose the full ${eur(F)}.`,
            };
        },
    },
    {
        id: "e1-pc-longrun-entry-price",
        subject: "econ1",
        topic: "perfect_competition",
        difficulty: "medium",
        kind: "numeric",
        unit: "EUR",
        source: "TUM Economics I Exercise Exam WT22/23, Q24",
        build: (rng) => {
            const c2 = rng.pick([0.2, 0.25, 0.5]);
            const qm = rng.int(1, 3) * 10; // output at minimum average cost
            const F = c2 * qm * qm; // integer by construction
            const c1 = rng.int(4, 12);
            const answer = c1 + 2 * c2 * qm; // min AC
            return {
                prompt: String.raw`Firms in a competitive market all have the cost function $C(q) = ${n(c2)} q^2 + ${n(c1)} q + ${n(F)}$, and entry and exit are free. What is the long-run **break-even price**?`,
                given: {
                    "Cost function": String.raw`$C(q) = ${n(c2)} q^2 + ${n(c1)} q + ${n(F)}$`,
                },
                answer,
                explanation: String.raw`The long-run entry/exit threshold is the minimum of average cost: $AC(q) = ${n(c2)} q + ${n(c1)} + \frac{${n(F)}}{q}$, minimized where $${n(c2)} = \frac{${n(F)}}{q^2}$, i.e. $q^* = \sqrt{F / ${n(c2)}}$ = ${n(qm)}. There $AC = $ ${n(c2)} · ${n(qm)} + ${n(c1)} + ${n(F)}/${n(qm)} = ${eur(answer)}. Above this price firms earn profit and entry occurs; below it they exit.`,
                hint: String.raw`Firms enter above the threshold and exit below it, so the break-even price is the lowest average cost the technology allows: minimise $AC(q) = \frac{C(q)}{q}$ over $q$.`,
            };
        },
    },
    {
        id: "e1-pc-scale-economies",
        subject: "econ1",
        topic: "perfect_competition",
        difficulty: "medium",
        kind: "numeric",
        unit: "units",
        source: "TUM Economics I Exercise Exam WT22/23, Q25",
        build: (rng) => {
            const c2 = rng.pick([0.2, 0.25, 0.5]);
            const qm = rng.int(1, 3) * 10;
            const F = c2 * qm * qm;
            const c1 = rng.int(5, 15);
            return {
                prompt: String.raw`A firm produces with the cost function $C(q) = ${n(c2)} q^2 + ${n(c1)} q + ${n(F)}$. Up to which output level does the firm enjoy **economies of scale**?`,
                given: {
                    "Cost function": String.raw`$C(q) = ${n(c2)} q^2 + ${n(c1)} q + ${n(F)}$`,
                },
                answer: qm,
                explanation: String.raw`Economies of scale last while $AC(q) = ${n(c2)} q + ${n(c1)} + \frac{${n(F)}}{q}$ is falling; they are exhausted at the minimum, where $\frac{dAC}{dq} = ${n(c2)} - \frac{${n(F)}}{q^2} = 0$, i.e. $q^* = \sqrt{F / c_2}$ = √(${n(F)} / ${n(c2)}) = ${n(qm)} units. Below ${n(qm)} the spread of the fixed cost dominates and AC falls; above it the rising marginal cost dominates.`,
                hint: String.raw`Economies of scale mean a falling average cost, so they run out where $AC(q) = \frac{C(q)}{q}$ reaches its minimum: set $\frac{dAC}{dq} = 0$.`,
            };
        },
    },
    {
        id: "e1-pc-longrun-firm-output",
        subject: "econ1",
        topic: "perfect_competition",
        difficulty: "easy",
        kind: "numeric",
        unit: "units",
        source: "TUM Economics I Exercise Exam WT22/23, Q27",
        build: (rng) => {
            const qm = 2 * rng.int(3, 7); // 6..14, even so F is an integer
            const F = (qm * qm) / 2;
            return {
                prompt: String.raw`Every firm in a competitive industry has the cost function $C(q) = 0.5 q^2 + ${n(F)}$, and entry and exit are free. How much does each firm produce in the **long-run equilibrium**?`,
                given: {
                    "Cost function": String.raw`$C(q) = 0.5 q^2 + ${n(F)}$`,
                },
                answer: qm,
                explanation: String.raw`Free entry drives price down to minimum average cost, so each firm produces at the minimum of $AC(q) = 0.5 q + \frac{F}{q}$. Setting $0.5 = \frac{F}{q^2}$ gives $q^* = \sqrt{2F}$ = √(2 · ${n(F)}) = ${n(qm)} units. At any other output AC would exceed the market price and the firm would make a loss.`,
            };
        },
    },

    // ---------------------------------------- market equilibrium, surplus, tax
    {
        id: "e1-mkt-equilibrium-price",
        subject: "econ1",
        topic: "market_equilibrium",
        difficulty: "very_easy",
        kind: "numeric",
        unit: "EUR",
        source: "TUM Economics I Exercise Exam WT22/23, Q30",
        build: (rng) => {
            const s = rng.pick(E1_MKT_EQUILIBRIUM_PRICE_SCENARIOS);
            const a = rng.int(3, 6) * 10; // supply slope
            const p0 = rng.int(1, 3); // supply choke price
            const b = a * p0; // supply intercept
            const gap = rng.int(4, 6);
            const pStar = p0 + gap;
            const d = rng.int(3, 6) * 10; // demand slope
            const Q = a * gap;
            const c = Q + d * pStar; // demand intercept
            return {
                prompt: String.raw`In the market for ${s.good}, supply is $Q_S = ${n(a)} p - ${n(b)}$ and demand is $Q_D = ${n(c)} - ${n(d)} p$. What is the equilibrium price?`,
                given: {
                    "Supply": String.raw`$Q_S = ${n(a)} p - ${n(b)}$`,
                    "Demand": String.raw`$Q_D = ${n(c)} - ${n(d)} p$`,
                },
                answer: pStar,
                explanation: String.raw`In equilibrium $Q_S = Q_D$: $${n(a)} p - ${n(b)} = ${n(c)} - ${n(d)} p$, so $p^* = \frac{${n(c)} + ${n(b)}}{${n(a)} + ${n(d)}}$ = ${eur(pStar)}. The equilibrium quantity is $Q^*$ = ${n(a)} · ${n(pStar)} − ${n(b)} = ${n(Q)} ${s.unit}.`,
            };
        },
    },
    {
        id: "e1-mkt-consumer-surplus",
        subject: "econ1",
        topic: "market_equilibrium",
        difficulty: "medium",
        kind: "numeric",
        unit: "EUR",
        source: "TUM Economics I Exercise Exam WT22/23, Q31",
        build: (rng) => {
            const s = rng.pick(E1_MKT_CONSUMER_SURPLUS_SCENARIOS);
            const a = rng.int(3, 6) * 10;
            const p0 = rng.int(1, 3);
            const b = a * p0;
            const gap = rng.int(4, 6);
            const pStar = p0 + gap;
            const d = rng.int(3, 6) * 10;
            const Q = a * gap;
            const c = Q + d * pStar;
            const pMax = c / d; // demand choke price
            const answer = 0.5 * (pMax - pStar) * Q; // = Q^2 / (2d)
            return {
                prompt: String.raw`In the market for ${s.good}, supply is $Q_S = ${n(a)} p - ${n(b)}$ and demand is $Q_D = ${n(c)} - ${n(d)} p$. Compute the **consumer surplus** in the market equilibrium.`,
                given: {
                    "Supply": String.raw`$Q_S = ${n(a)} p - ${n(b)}$`,
                    "Demand": String.raw`$Q_D = ${n(c)} - ${n(d)} p$`,
                },
                answer,
                explanation: String.raw`$CS = \frac{1}{2} \left( p_{max} - p^* \right) \cdot Q^*$, where $p_{max}$ is the demand choke price. Equilibrium: $p^* = \frac{${n(c)} + ${n(b)}}{${n(a)} + ${n(d)}}$ = ${eur(pStar)} with $Q^*$ = ${n(Q)}. Choke price: $p_{max} = \frac{${n(c)}}{${n(d)}}$ = ${n2(pMax)}. So CS = ½ · (${n2(pMax)} − ${n(pStar)}) · ${n(Q)} = ${eur(answer)}. (The producer surplus would be the triangle above the supply curve: ½ · (${n(pStar)} − ${n(p0)}) · ${n(Q)} = ${eur(0.5 * (pStar - p0) * Q)}.)`,
            };
        },
    },
    {
        id: "e1-mkt-ad-valorem-tax",
        subject: "econ1",
        topic: "market_equilibrium",
        difficulty: "very_hard",
        kind: "numeric",
        unit: "EUR",
        source: "TUM Economics I Exercise Exam WT22/23, Q32",
        build: (rng) => {
            const s = rng.pick(E1_MKT_AD_VALOREM_TAX_SCENARIOS);
            const a = rng.int(3, 6) * 10;
            const p0 = rng.int(1, 3);
            const b = a * p0;
            const gap = rng.int(4, 6);
            const pStar = p0 + gap;
            const d = rng.int(3, 6) * 10;
            const c = a * gap + d * pStar;
            const t = rng.pick([10, 20, 25, 50]); // ad-valorem rate in percent
            const tau = 1 + t / 100;
            const pS = (c + b) / (a + d * tau); // net producer price
            const answer = tau * pS; // gross consumer price
            return {
                prompt: String.raw`In the market for ${s.good}, supply is $Q_S = ${n(a)} p_S - ${n(b)}$ and demand is $Q_D = ${n(c)} - ${n(d)} p_D$. The government introduces an **ad-valorem tax of ${pct(t)} on consumers**, so the gross price is $p_D = ${n(tau)} \cdot p_S$. What price do consumers pay (including tax) in the new equilibrium?`,
                given: {
                    "Supply": String.raw`$Q_S = ${n(a)} p_S - ${n(b)}$`,
                    "Demand": String.raw`$Q_D = ${n(c)} - ${n(d)} p_D$`,
                    "Tax rate t": pct(t),
                },
                answer,
                explanation: String.raw`With an ad-valorem tax on consumers, $p_D = (1 + t) \cdot p_S$; set $Q_S(p_S) = Q_D(p_D)$ and solve for the net price: $${n(a)} p_S - ${n(b)} = ${n(c)} - ${n(d)} \cdot ${n(tau)}\, p_S$, so $p_S = \frac{${n(c)} + ${n(b)}}{${n(a)} + ${n(d)} \cdot ${n(tau)}}$ = ${n2(pS)}. Consumers pay $p_D = ${n(tau)} \cdot p_S$ = ${eur(answer)}. Both sides bear part of the tax: without it the price was ${eur(pStar)} - producers now net less, consumers pay more.`,
            };
        },
    },
    {
        id: "e1-mkt-unit-tax-dwl",
        subject: "econ1",
        topic: "market_equilibrium",
        difficulty: "very_hard",
        kind: "numeric",
        unit: "EUR",
        source: "TUM Economics I Exercise Exam WT22/23, Q34",
        build: (rng) => {
            const sc = rng.pick(E1_MKT_UNIT_TAX_DWL_SCENARIOS);
            const d = rng.int(4, 8); // demand slope
            const s = rng.int(3, 6); // supply slope
            const t = rng.int(2, 5); // per-unit tax
            const pStar = rng.int(15, 29);
            const hi = Math.min(80, s * pStar - 5);
            const Q0 = rng.int(25, hi);
            const A = Q0 + d * pStar; // demand intercept
            const B = s * pStar - Q0; // supply intercept (>= 5 by construction)
            const dQ = (d * s * t) / (d + s); // drop in quantity
            const Q1 = Q0 - dQ;
            const pD = pStar + (s * t) / (d + s); // new consumer price
            const answer = 0.5 * t * dQ;
            return {
                prompt: String.raw`In the market for ${sc.good}, demand is $Q_D = ${n(A)} - ${n(d)} p$ and supply is $Q_S = ${n(s)} p - ${n(B)}$. The government levies a per-unit tax of ${eur(t)} **on producers**. What is the deadweight loss of the tax?`,
                given: {
                    "Demand": String.raw`$Q_D = ${n(A)} - ${n(d)} p$`,
                    "Supply": String.raw`$Q_S = ${n(s)} p - ${n(B)}$`,
                    "Per-unit tax t": eur(t),
                },
                answer,
                explanation: String.raw`$DWL = \frac{1}{2} \cdot t \cdot \left( Q_0 - Q_1 \right)$ - the triangle between the old and new quantity. Without the tax: $p^* = \frac{${n(A)} + ${n(B)}}{${n(d)} + ${n(s)}}$ = ${eur(pStar)} and $Q_0$ = ${n(Q0)}. With the tax, producers receive $p - ${n(t)}$, so $${n(A)} - ${n(d)} p = ${n(s)}(p - ${n(t)}) - ${n(B)}$ gives the consumer price $p_D$ = ${n2(pD)} and $Q_1$ = ${n2(Q1)}. DWL = ½ · ${n(t)} · (${n(Q0)} − ${n2(Q1)}) = ${eur(answer)} - these are the trades that were mutually beneficial but no longer happen.`,
            };
        },
    },

    // ---------------------------------------------------------------- monopoly
    {
        id: "e1-mono-optimal-quantity",
        subject: "econ1",
        topic: "monopoly",
        difficulty: "medium",
        kind: "numeric",
        unit: "units",
        source: "TUM Economics I Exercise Exam WT22/23, Q36",
        build: (rng) => {
            const s = rng.pick(E1_MONO_OPTIMAL_QUANTITY_SCENARIOS);
            const beta = rng.pick([2, 4]); // demand slope
            const gamma = rng.pick([1, 2]); // MC slope
            const Qstar = rng.int(40, 69);
            const cc = rng.int(1, 2) * 100; // MC intercept
            const alpha = cc + Qstar * (2 * beta + gamma); // <= 950 by construction
            const FC = rng.int(1, 5) * 100;
            return {
                prompt: String.raw`${s.intro}. Inverse demand is $P = ${n(alpha)} - ${n(beta)} Q$, marginal cost is $MC = ${n(gamma)} Q + ${n(cc)}$, and fixed cost is ${eur(FC)}. Which quantity maximizes its profit?`,
                given: {
                    "Inverse demand": String.raw`$P = ${n(alpha)} - ${n(beta)} Q$`,
                    "Marginal cost": String.raw`$MC = ${n(gamma)} Q + ${n(cc)}$`,
                    "Fixed cost": eur(FC),
                },
                answer: Qstar,
                explanation: String.raw`A monopolist produces where $MR = MC$, and with linear demand MR has twice the slope: $MR = ${n(alpha)} - ${n(2 * beta)} Q$. Setting $${n(alpha)} - ${n(2 * beta)} Q = ${n(gamma)} Q + ${n(cc)}$ gives $Q^* = \frac{${n(alpha)} - ${n(cc)}}{${n(2 * beta + gamma)}}$ = ${n(Qstar)} units. The fixed cost is irrelevant for the output choice - it shifts profit, not marginal profit.`,
            };
        },
    },
    {
        id: "e1-mono-profit-tax-rate",
        subject: "econ1",
        topic: "monopoly",
        difficulty: "very_hard",
        kind: "numeric",
        unit: "percent",
        source: "TUM Economics I Exercise Exam WT22/23, Q37",
        build: (rng) => {
            const s = rng.pick(E1_MONO_PROFIT_TAX_RATE_SCENARIOS);
            const beta = rng.pick([2, 4]);
            const gamma = 2; // keeps the cost function's quadratic term clean
            const Qstar = 2 * rng.int(20, 34); // even, so alpha is divisible by beta
            const cc = rng.pick([100, 200]);
            const alpha = cc + Qstar * (2 * beta + gamma);
            const A = alpha / beta; // integer by construction
            const k = 1 / beta;
            const FC = rng.int(1, 5) * 100;
            const Pstar = alpha - beta * Qstar;
            const profit = Qstar * Qstar * (beta + 1) - FC; // (gamma = 2)
            const rate = rng.pick([20, 25, 40, 50]);
            const T = (profit * rate) / 100;
            return {
                prompt: String.raw`${s.firm} faces the demand $Q = ${n(A)} - ${n(k)} P$. Its marginal cost is $MC = ${n(gamma)} Q + ${n(cc)}$ and its fixed cost is ${eur(FC)}. The government taxes its profit proportionally and collects ${eur(T)}. What is the profit tax rate (in percent)?`,
                given: {
                    "Demand": String.raw`$Q = ${n(A)} - ${n(k)} P$`,
                    "Marginal cost": String.raw`$MC = ${n(gamma)} Q + ${n(cc)}$`,
                    "Fixed cost": eur(FC),
                    "Tax revenue": eur(T),
                },
                answer: rate,
                explanation: String.raw`The rate is $t = \frac{T}{\pi^*}$, so first find the monopoly profit. Inverting demand: $P = ${n(alpha)} - ${n(beta)} Q$, so $MR = ${n(alpha)} - ${n(2 * beta)} Q$. $MR = MC$: $${n(alpha)} - ${n(2 * beta)} Q = ${n(gamma)} Q + ${n(cc)}$ gives $Q^*$ = ${n(Qstar)} and $P^*$ = ${eur(Pstar)}. Cost: $C(Q) = Q^2 + ${n(cc)} Q + ${n(FC)}$ (integrating MC and adding the fixed cost). Profit: ${eur(Pstar * Qstar)} − ${eur(Qstar * Qstar + cc * Qstar + FC)} = ${eur(profit)}. Rate: ${eur(T)} / ${eur(profit)} = ${pct(rate)}.`,
            };
        },
    },
    {
        id: "e1-mono-unit-tax-revenue",
        subject: "econ1",
        topic: "monopoly",
        difficulty: "hard",
        kind: "numeric",
        unit: "EUR",
        source: "TUM Economics I Exercise Exam WT22/23, Q38",
        build: (rng) => {
            const s = rng.pick(E1_MONO_UNIT_TAX_REVENUE_SCENARIOS);
            const beta = rng.pick([2, 3]);
            const gamma = rng.pick([1, 2]);
            const Qt = rng.int(30, 60); // quantity with the tax in place
            const cc = rng.int(1, 2) * 100;
            const t = rng.int(5, 12) * 10;
            const alpha = cc + t + Qt * (2 * beta + gamma);
            const answer = t * Qt;
            return {
                prompt: String.raw`${s.firm} faces inverse demand $P = ${n(alpha)} - ${n(beta)} Q$ and has marginal cost $MC = ${n(gamma)} Q + ${n(cc)}$. The authorities introduce a **per-unit tax of ${eur(t)}** on every ${s.one} sold. How much tax revenue do they collect when the operator re-optimizes?`,
                given: {
                    "Inverse demand": String.raw`$P = ${n(alpha)} - ${n(beta)} Q$`,
                    "Marginal cost": String.raw`$MC = ${n(gamma)} Q + ${n(cc)}$`,
                    "Per-unit tax t": eur(t),
                },
                answer,
                explanation: String.raw`Tax revenue is $T = t \cdot Q_t$, where $Q_t$ solves $MR = MC + t$ - the per-unit tax shifts marginal cost up by $t$. $MR = ${n(alpha)} - ${n(2 * beta)} Q$, so $${n(alpha)} - ${n(2 * beta)} Q = ${n(gamma)} Q + ${n(cc)} + ${n(t)}$ gives $Q_t = \frac{${n(alpha)} - ${n(cc)} - ${n(t)}}{${n(2 * beta + gamma)}}$ = ${n(Qt)} ${s.units}. Revenue: ${eur(t)} · ${n(Qt)} = ${eur(answer)}.`,
            };
        },
    },

    // ------------------------------------ opportunity cost & Pareto efficiency
    {
        id: "e1-oc-min-benefit",
        subject: "econ1",
        topic: "opportunity_cost",
        difficulty: "easy",
        kind: "numeric",
        unit: "EUR",
        source: "TUM Economics I W22/23, Problem Set 2, T1",
        build: (rng) => {
            const s = rng.pick(E1_OC_MIN_BENEFIT_SCENARIOS);
            const obj = s.subj === "he" ? "him" : "her";
            const ticket = rng.int(6, 15);
            const wage = rng.int(16, 30);
            const effort = rng.int(5, wage - 8); // job surplus >= 8 ...
            const jobSurplus = wage - effort;
            const home = rng.int(3, jobSurplus - 2); // ... and strictly the best alternative
            const pass = rng.int(30, 60);
            const answer = ticket + jobSurplus;
            return {
                prompt: `${s.name} can spend ${s.when} in one of three ways: (i) ${s.opt1} (${s.fee} ${eur(ticket)}; ${s.travel} ${eur(pass)}), (ii) ${s.home}, which is worth a benefit of ${eur(home)} to ${obj}, or (iii) ${s.job} ${eur(wage)}, where the effort feels like a cost of ${eur(effort)} to ${obj}. What is the minimum benefit the ${s.event} must provide so that ${s.name} chooses option (i)?`,
                given: {
                    [s.feeLabel]: eur(ticket),
                    [s.travelLabel]: eur(pass),
                    [s.homeLabel]: eur(home),
                    [s.jobLabel]: `${eur(wage)} / ${eur(effort)}`,
                },
                answer,
                explanation: String.raw`${cap(s.subj)} picks the ${s.event} only if its surplus beats the best alternative: $b_{\text{${s.event}}} - \text{expenditure} \geq \text{opportunity cost}$, where the opportunity cost is the highest surplus among the alternatives forgone. ${s.homeNoun} is worth ${eur(home)}; ${s.jobNoun} yields a producer surplus of ${eur(wage)} − ${eur(effort)} = ${eur(jobSurplus)} - the best alternative. ${s.travelNoun} is a **sunk cost**: it was paid for either way and never enters the decision. The ${s.event} must therefore be worth at least its expenditure plus the forgone surplus: ${eur(ticket)} + ${eur(jobSurplus)} = ${eur(answer)}.`,
                hint: String.raw`An option is worth taking only once its benefit covers the money it still costs plus the opportunity cost - the best surplus given up elsewhere. Money paid before the decision is the same under every option and drops out: $b \geq \text{expenditure} + \text{opportunity cost}$.`,
            };
        },
    },

    // ------------------------------------------- comparative advantage (cont.)
    {
        id: "e1-ca-autarky-assembly",
        subject: "econ1",
        topic: "comparative_advantage",
        difficulty: "medium",
        kind: "numeric",
        unit: "units",
        source: "TUM Economics I W22/23, Problem Set 3, T2",
        build: (rng) => {
            const s = rng.pick(E1_CA_AUTARKY_ASSEMBLY_SCENARIOS);
            const a = rng.int(2, 4); // part A per hour
            const b = a + rng.int(1, 3); // part B per hour
            const k = rng.int(4, 9);
            const T = k * (a + b);
            const answer = k * a * b;
            return {
                prompt: String.raw`${s.name} assembles ${s.product}; every ${s.one} needs exactly **one ${s.partA} and one ${s.partB}**. Per hour ${s.subj} can ${s.verb} either ${n(a)} ${s.partsA} or ${n(b)} ${s.partsB}. In a working month of ${n(T)} hours, producing both parts ${s.refl}, how many complete ${s.product} can ${s.subj} assemble at most?`,
                given: {
                    [`${cap(s.partsA)} per hour`]: n(a),
                    [`${cap(s.partsB)} per hour`]: n(b),
                    "Hours available": n(T),
                },
                answer,
                explanation: String.raw`With one of each part per ${s.one}, output solves $x = y$ together with the time constraint $\frac{x}{a} + \frac{y}{b} = T$, so $y = \frac{a \cdot b}{a + b} \cdot T$. Substituting: (${n(a)} · ${n(b)}) / (${n(a)} + ${n(b)}) · ${n(T)} = ${n(answer)} ${s.product}. Equivalently, the time split must be proportional to how long each part takes: ${s.partsB} get $\frac{a}{a+b}$ of the hours, ${s.partsA} the rest - producing equal numbers of both.`,
            };
        },
    },

    // ------------------------------------------------ consumer theory (cont.)
    {
        id: "e1-ct-mrs-cobb-douglas",
        subject: "econ1",
        topic: "consumer_theory",
        difficulty: "easy",
        kind: "numeric",
        unit: "ratio",
        source: "TUM Economics I W22/23, Problem Set 4, T2",
        build: (rng) => {
            const pair = rng.pick([
                [1, 2],
                [2, 1],
                [1, 3],
                [3, 1],
                [2, 3],
                [3, 2],
            ] as const);
            const [aExp, bExp] = pair;
            const q1 = rng.int(2, 9);
            const q2 = rng.int(2, 9);
            const answer = (aExp * q2) / (bExp * q1);
            return {
                prompt: String.raw`A consumer has the utility function $U(q_1, q_2) = q_1^{${aExp}} \cdot q_2^{${bExp}}$. What is the absolute value of the marginal rate of substitution $|MRS_{1,2}|$ at the bundle $(q_1, q_2) = (${n(q1)},\; ${n(q2)})$?`,
                given: {
                    "Utility": String.raw`$U = q_1^{${aExp}} \cdot q_2^{${bExp}}$`,
                    "Bundle $(q_1, q_2)$": `(${n(q1)}, ${n(q2)})`,
                },
                answer,
                explanation: String.raw`$|MRS_{1,2}| = \frac{MU_1}{MU_2} = \frac{a \cdot q_2}{b \cdot q_1}$ for $U = q_1^{a} q_2^{b}$: the marginal utilities are $MU_1 = a\, q_1^{a-1} q_2^{b}$ and $MU_2 = b\, q_1^{a} q_2^{b-1}$, and the powers cancel in the ratio. Substituting: (${n(aExp)} · ${n(q2)}) / (${n(bExp)} · ${n(q1)}) = ${n2(answer)}. The MRS is the (absolute) slope of the indifference curve through the bundle - it falls as $q_1$ rises, which is exactly the convexity of the indifference curves.`,
                hint: String.raw`The marginal rate of substitution says how many units of good 2 the consumer gives up for one more unit of good 1, and it is the ratio of the marginal utilities: $|MRS_{1,2}| = \frac{MU_1}{MU_2}$.`,
            };
        },
    },
    {
        id: "e1-ct-substitutes-quantity",
        subject: "econ1",
        topic: "consumer_theory",
        difficulty: "easy",
        kind: "numeric",
        unit: "units",
        source: "TUM Economics I W22/23, Problem Set 5, T2",
        build: (rng) => {
            const s = rng.pick(E1_CT_SUBSTITUTES_QUANTITY_SCENARIOS);
            const alpha = rng.int(1, 3);
            const beta = rng.int(2, 4);
            const p2 = rng.int(2, 6);
            const p1 = Math.ceil((alpha * p2) / beta) + rng.int(1, 3); // ensures MU2/p2 > MU1/p1
            const m = p2 * rng.int(11, 24);
            const answer = m / p2;
            return {
                prompt: String.raw`${s.who} treats ${s.g1} ($q_1$) and ${s.g2} ($q_2$) as perfect substitutes with utility $U(q_1, q_2) = ${n(alpha)} q_1 + ${n(beta)} q_2$. ${s.one1} costs ${eur(p1)}, ${s.one2} ${eur(p2)}, and ${s.poss} ${s.budget} is ${eur(m)}. How many **${s.ask}** does ${s.subj} buy at the optimum?`,
                given: {
                    "Utility": String.raw`$U = ${n(alpha)} q_1 + ${n(beta)} q_2$`,
                    "Price $p_1$": eur(p1),
                    "Price $p_2$": eur(p2),
                    "Budget m": eur(m),
                },
                answer,
                explanation: String.raw`With linear preferences, compare marginal utility per euro: $\frac{MU_2}{p_2} \gtrless \frac{MU_1}{p_1}$. Here ${n(beta)} / ${n(p2)} = ${n2(beta / p2)} beats ${n(alpha)} / ${n(p1)} = ${n2(alpha / p1)}, so every euro is best spent on ${s.ask} - a corner solution with $q_1 = 0$ and $q_2 = \frac{m}{p_2}$ = ${eur(m)} / ${eur(p2)} = ${n(answer)} ${s.units}. The tangency condition $MRS = p_1 / p_2$ never holds here, because the MRS is constant along the linear indifference curves.`,
            };
        },
    },
    {
        id: "e1-ct-compensated-income",
        subject: "econ1",
        topic: "consumer_theory",
        difficulty: "very_hard",
        kind: "numeric",
        unit: "EUR",
        source: "TUM Economics I W22/23, Problem Set 5, T3",
        build: (rng) => {
            const px = rng.int(11, 24);
            const py = rng.int(10, 30);
            const pyNew = py + rng.int(5, 20);
            const m = 10 * rng.int(30, 80);
            const xStar = m / (2 * px);
            const yStar = m / (2 * py);
            const uBar = xStar * yStar;
            const answer = m * Math.sqrt(pyNew / py);
            return {
                prompt: String.raw`A household with utility $U(x, y) = x \cdot y$ and income ${eur(m)} faces prices $p_x$ = ${eur(px)} and $p_y$ = ${eur(py)}. Then the price of good $y$ rises to ${eur(pyNew)}. What income would the household need at the **new** prices to reach exactly its **old** utility level?`,
                given: {
                    "Income m": eur(m),
                    "Price $p_x$": eur(px),
                    "Old price $p_y$": eur(py),
                    "New price $p_y'$": eur(pyNew),
                },
                answer,
                explanation: String.raw`The required income is the minimum expenditure that restores the old utility at the new prices: for $U = x \cdot y$ it is $E = 2 \sqrt{p_x \cdot p_y' \cdot \bar{U}}$. Old optimum (each good gets half the budget): $x^* = \frac{m}{2 p_x}$ = ${n2(xStar)}, $y^* = \frac{m}{2 p_y}$ = ${n2(yStar)}, so $\bar{U} = x^* y^*$ = ${n2(uBar)}. Then E = 2 · √(${n(px)} · ${n(pyNew)} · ${n2(uBar)}) = ${eur(answer)} - equivalently $E = m \sqrt{p_y' / p_y}$. The difference of ${eur(answer - m)} to the old income is the compensation the price increase would require.`,
            };
        },
    },

    // -------------------------------------------- elasticities & market (cont.)
    {
        id: "e1-mkt-point-elasticity",
        subject: "econ1",
        topic: "market_equilibrium",
        difficulty: "easy",
        kind: "numeric",
        unit: "number",
        source: "TUM Economics I W22/23, Problem Set 6, T1",
        build: (rng) => {
            const s = rng.pick(E1_MKT_POINT_ELASTICITY_SCENARIOS);
            const b = rng.int(2, 8);
            const p0 = rng.int(4, 12);
            const Q0 = rng.int(20, 80);
            const a = Q0 + b * p0;
            const answer = (b * p0) / Q0;
            return {
                prompt: String.raw`The demand for ${s.good} is $Q_D = ${n(a)} - ${n(b)} p$. What is the **absolute value** of the price elasticity of demand at a price of ${eur(p0)}?`,
                given: {
                    "Demand": String.raw`$Q_D = ${n(a)} - ${n(b)} p$`,
                    "Price p": eur(p0),
                },
                answer,
                explanation: String.raw`$\varepsilon_p = \frac{dQ}{dp} \cdot \frac{p}{Q}$ - slope times price-quantity ratio, evaluated at the point. Quantity at ${eur(p0)}: ${n(a)} − ${n(b)} · ${n(p0)} = ${n(Q0)}, and $\frac{dQ}{dp} = -${n(b)}$. So $|\varepsilon_p|$ = ${n(b)} · ${n(p0)} / ${n(Q0)} = ${n2(answer)}. Values above 1 mean elastic, below 1 inelastic demand - along a linear demand curve the elasticity rises from 0 (at $p = 0$) to infinity (at the choke price), so the same curve is inelastic at low and elastic at high prices.`,
            };
        },
    },
    {
        id: "e1-mkt-unit-elastic-price",
        subject: "econ1",
        topic: "market_equilibrium",
        difficulty: "medium",
        kind: "numeric",
        unit: "EUR",
        source: "TUM Economics I W22/23, Problem Set 6, T1",
        build: (rng) => {
            const s = rng.pick(E1_MKT_UNIT_ELASTIC_PRICE_SCENARIOS);
            const b = rng.int(2, 6);
            const half = rng.int(5, 15);
            const a = 2 * b * half;
            return {
                prompt: String.raw`The demand for ${s.good} is $Q_D = ${n(a)} - ${n(b)} p$. At which price is demand exactly **unit-elastic**?`,
                given: {
                    "Demand": String.raw`$Q_D = ${n(a)} - ${n(b)} p$`,
                },
                answer: half,
                explanation: String.raw`Along a linear demand curve, $|\varepsilon_p| = \frac{b\, p}{a - b\, p}$, which equals 1 exactly at the **midpoint** $p = \frac{a}{2b}$. Substituting: ${n(a)} / (2 · ${n(b)}) = ${eur(half)}. Check: there $Q$ = ${n(a)} − ${n(b)} · ${n(half)} = ${n(a - b * half)}, and ${n(b)} · ${n(half)} / ${n(a - b * half)} = 1. Below this price demand is inelastic (elasticity 0 at $p = 0$), above it elastic ($|\varepsilon_p| \to \infty$ toward the choke price ${eur(a / b)}) - and revenue $p \cdot Q$ is maximal at the unit-elastic point.`,
                hint: String.raw`Demand is unit-elastic where a one-percent price rise cuts quantity by exactly one percent, so set the point elasticity to one: $\left| \varepsilon_p \right| = \left| \frac{dQ}{dp} \right| \cdot \frac{p}{Q} = 1$.`,
            };
        },
    },
    {
        id: "e1-mkt-supply-elasticity",
        subject: "econ1",
        topic: "market_equilibrium",
        difficulty: "medium",
        kind: "numeric",
        unit: "number",
        source: "TUM Economics I W22/23, Problem Set 10, T2",
        build: (rng) => {
            const sc = rng.pick(E1_MKT_SUPPLY_ELASTICITY_SCENARIOS);
            const s = rng.int(3, 6) * 10;
            const p0 = rng.int(1, 3);
            const B = s * p0;
            const gap = rng.int(3, 6);
            const pStar = p0 + gap;
            const Q = s * gap;
            const d = rng.int(2, 5) * 10;
            const c = Q + d * pStar;
            const answer = (s * pStar) / Q;
            return {
                prompt: String.raw`In the market for ${sc.good}, supply is $Q_S = ${n(s)} p - ${n(B)}$ and demand is $Q_D = ${n(c)} - ${n(d)} p$. What is the **price elasticity of supply** in the market equilibrium?`,
                given: {
                    "Supply": String.raw`$Q_S = ${n(s)} p - ${n(B)}$`,
                    "Demand": String.raw`$Q_D = ${n(c)} - ${n(d)} p$`,
                },
                answer,
                explanation: String.raw`$\varepsilon_p^S = \frac{dQ_S}{dp} \cdot \frac{p^*}{Q^*}$, evaluated at the equilibrium. Equilibrium: $${n(s)} p - ${n(B)} = ${n(c)} - ${n(d)} p$ gives $p^* = \frac{${n(c)} + ${n(B)}}{${n(s)} + ${n(d)}}$ = ${eur(pStar)} and $Q^*$ = ${n(Q)}. With $\frac{dQ_S}{dp} = ${n(s)}$: $\varepsilon_p^S$ = ${n(s)} · ${n(pStar)} / ${n(Q)} = ${n2(answer)} > 1 - supply is price-elastic. A linear supply curve that cuts the price axis at a positive price is elastic everywhere on it.`,
            };
        },
    },
    {
        id: "e1-mkt-demand-shifters",
        subject: "econ1",
        topic: "market_equilibrium",
        difficulty: "medium",
        kind: "numeric",
        unit: "EUR",
        source: "TUM Economics I W22/23, Problem Set 10, T2",
        build: (rng) => {
            const sc = rng.pick(E1_MKT_DEMAND_SHIFTERS_SCENARIOS);
            const s = rng.int(30, 50);
            const p0 = rng.int(2, 4);
            const B = s * p0;
            const gap = rng.int(4, 6);
            const pStar = p0 + gap;
            const Qstar = s * gap;
            const d = rng.int(15, 30);
            const cEff = Qstar + d * pStar;
            const mPart = rng.int(5, 15) * 10;
            const M = mPart * 100;
            const rC = rng.int(2, 5);
            const R = rng.int(10, 30);
            const A = cEff - mPart + rC * R; // >= 80 by construction
            return {
                prompt: String.raw`The demand for ${sc.good} is $Q_D = ${n(A)} - ${n(d)} p + ${n(0.01)} M - ${n(rC)} R$, where $M$ is average monthly income and $R$ the number of rainy days per season. Supply is $Q_S = ${n(s)} p - ${n(B)}$. This season, $M$ = ${eur(M)} and $R$ = ${n(R)}. What is the equilibrium price?`,
                given: {
                    "Demand": String.raw`$Q_D = ${n(A)} - ${n(d)} p + ${n(0.01)} M - ${n(rC)} R$`,
                    "Supply": String.raw`$Q_S = ${n(s)} p - ${n(B)}$`,
                    "Income M": eur(M),
                    "Rainy days R": n(R),
                },
                answer: pStar,
                explanation: String.raw`First substitute the exogenous shifters into the demand curve, then set $Q_D = Q_S$. The demand intercept becomes ${n(A)} + ${n(0.01)} · ${n(M)} − ${n(rC)} · ${n(R)} = ${n(cEff)}, so demand is $Q_D = ${n(cEff)} - ${n(d)} p$. Equating with supply: $${n(cEff)} - ${n(d)} p = ${n(s)} p - ${n(B)}$ gives $p^* = \frac{${n(cEff)} + ${n(B)}}{${n(d)} + ${n(s)}}$ = ${eur(pStar)}, with $Q^*$ = ${n(Qstar)}. Higher income or fewer rainy days shift the demand curve right and would raise both equilibrium price and quantity.`,
            };
        },
    },
    {
        id: "e1-mkt-two-part-tariff",
        subject: "econ1",
        topic: "market_equilibrium",
        difficulty: "hard",
        kind: "numeric",
        unit: "EUR",
        source: "TUM Economics I W22/23, Problem Set 6, T2",
        build: (rng) => {
            const s = rng.pick(E1_MKT_TWO_PART_TARIFF_SCENARIOS);
            const chokeA = 2 * rng.int(15, 25);
            const chokeB = chokeA + 2 * rng.int(20, 30);
            const bA = rng.pick([0.5, 1] as const);
            const bB = bA * rng.pick([1, 2] as const);
            const p = 2 * rng.int(5, 10);
            const xA = chokeA - p;
            const xB = chokeB - p;
            const cA = bA * chokeA;
            const cB = bB * chokeB;
            const qA = bA * xA;
            const qB = bB * xB;
            const csA = 0.5 * bA * xA * xA;
            const csB = 0.5 * bB * xB * xB;
            const F = csA + rng.int(5, 45) * 10; // strictly between the two surpluses
            const answer = F + p * qB;
            return {
                prompt: String.raw`${s.service} charges ${eur(p)} per ${s.unit} and has two members: ${s.memberA} with monthly demand $q_A = ${n(cA)} - ${n(bA)} p$ and ${s.memberB} with $q_B = ${n(cB)} - ${n(bB)} p$ (hours per month). It introduces a monthly **membership fee** of ${eur(F)} on top of the unchanged hourly price. What is its new total monthly revenue from these two members? (The income effect of the fee on hourly demand is negligible.)`,
                given: {
                    "Hourly price p": eur(p),
                    [`${s.labelA} demand`]: String.raw`$q_A = ${n(cA)} - ${n(bA)} p$`,
                    [`${s.labelB} demand`]: String.raw`$q_B = ${n(cB)} - ${n(bB)} p$`,
                    "Membership fee": eur(F),
                },
                answer,
                explanation: String.raw`A member keeps the contract only if the consumer surplus at the hourly price covers the fee: $CS = \frac{1}{2} \left( p_{max} - p \right) q$. ${s.labelA}: $q_A$ = ${n(qA)} hours, choke price ${eur(chokeA)}, so $CS_A$ = ½ · (${n(chokeA)} − ${n(p)}) · ${n(qA)} = ${eur(csA)} - **less** than the fee of ${eur(F)}, so ${s.theA} cancels. ${s.labelB}: $q_B$ = ${n(qB)} hours, $CS_B$ = ½ · (${n(chokeB)} − ${n(p)}) · ${n(qB)} = ${eur(csB)} > ${eur(F)}, so ${s.theB} stays and keeps ${s.verb} ${n(qB)} hours. Revenue: ${eur(F)} + ${eur(p)} · ${n(qB)} = ${eur(answer)} - the fee skims part of the remaining member's surplus.`,
                hint: String.raw`A member keeps the contract only while the consumer surplus earned at the usage price still covers the fixed fee: $CS = \frac{1}{2} \left( p_{max} - p \right) q$. Revenue is the fee from the members who stay plus the usage price times what they buy.`,
            };
        },
    },
    {
        id: "e1-mkt-vat-revenue",
        subject: "econ1",
        topic: "market_equilibrium",
        difficulty: "hard",
        kind: "numeric",
        unit: "EUR",
        source: "TUM Economics I W22/23, Problem Set 11, T2",
        build: (rng) => {
            const sc = rng.pick(E1_MKT_VAT_REVENUE_SCENARIOS);
            const pair = rng.pick([
                [25, 4],
                [25, 8],
                [50, 2],
                [50, 6],
                [20, 5],
                [20, 10],
                [10, 10],
            ] as const); // combinations where d * (1 + t) stays an integer
            const [t, d] = pair;
            const tau = 1 + t / 100;
            const s = rng.int(4, 8);
            const pS = rng.int(10, 20);
            const Q = s * pS;
            const c = pS * (s + d * tau);
            const answer = (t / 100) * pS * Q;
            return {
                prompt: String.raw`In the competitive market for ${sc.good}, demand is $Q_D = ${n(c)} - ${n(d)} p_D$ and supply is $Q_S = ${n(s)} p_S$. A value-added tax of ${pct(t)} is introduced, so that $p_D = ${n(tau)} \cdot p_S$. How much tax revenue does the government collect in the new equilibrium?`,
                given: {
                    "Demand": String.raw`$Q_D = ${n(c)} - ${n(d)} p_D$`,
                    "Supply": String.raw`$Q_S = ${n(s)} p_S$`,
                    "VAT rate t": pct(t),
                },
                answer,
                explanation: String.raw`$T = t \cdot p_S \cdot Q$ - the tax is levied on the net producer price. The net price solves $Q_D\big((1 + t)\, p_S\big) = Q_S(p_S)$: $${n(c)} - ${n(d)} \cdot ${n(tau)}\, p_S = ${n(s)} p_S$ gives $p_S = \frac{${n(c)}}{${n(s)} + ${n(d)} \cdot ${n(tau)}}$ = ${eur(pS)}. Quantity: $Q$ = ${n(s)} · ${n(pS)} = ${n(Q)}, and consumers pay $p_D$ = ${eur(tau * pS)}. Revenue: ${pct(t)} · ${eur(pS)} · ${n(Q)} = ${eur(answer)}. The wedge between ${eur(tau * pS)} and ${eur(pS)} is shared between the two market sides.`,
            };
        },
    },

    // --------------------------------------------- production & costs (cont.)
    {
        id: "e1-prod-mp-from-ap",
        subject: "econ1",
        topic: "production_costs",
        difficulty: "easy",
        kind: "numeric",
        unit: "units",
        source: "TUM Economics I W22/23, Problem Set 7, T1",
        build: (rng) => {
            const s = rng.pick(E1_PROD_MP_FROM_AP_SCENARIOS);
            // L >= 5 and AP >= 10 keep the table in two-digit territory.
            const L = rng.int(5, 8);
            const AP = rng.int(10, 15);
            const QL = L * AP;
            const MP = rng.int(2, AP - 1); // diminishing: MP below AP
            const Qprev = QL - MP;
            return {
                prompt: `${s.intro}. With ${n(L - 1)} ${s.workers} it produced ${n(Qprev)} ${s.unit} per day; with ${n(L)} ${s.workers} the **average product** of labor is ${n(AP)} ${s.unit}. What is the marginal product of the ${n(L)}th ${s.worker}?`,
                given: {
                    [`Output with ${n(L - 1)} ${s.workers}`]: `${n(Qprev)} ${s.unit}`,
                    [`Average product with ${n(L)} ${s.workers}`]: `${n(AP)} ${s.unit}`,
                },
                answer: MP,
                explanation: String.raw`$MP_L = Q(L) - Q(L-1)$, and total output follows from the average: $Q(L) = AP_L \cdot L$. Output with ${n(L)} ${s.workers}: ${n(AP)} · ${n(L)} = ${n(QL)} ${s.unit}. The ${n(L)}th ${s.worker} therefore adds ${n(QL)} − ${n(Qprev)} = ${n(MP)} ${s.unit} - less than the average product of ${n(AP)}, which is exactly why the average product is falling at this employment level.`,
            };
        },
    },
    {
        id: "e1-prod-ap-maximum",
        subject: "econ1",
        topic: "production_costs",
        difficulty: "medium",
        kind: "numeric",
        unit: "units",
        source: "TUM Economics I W22/23, Problem Set 7, T2",
        build: (rng) => {
            const s = rng.pick(E1_PROD_AP_MAXIMUM_SCENARIOS);
            const pair = rng.pick([
                [0.05, 20],
                [0.05, 40],
                [0.1, 30],
                [0.02, 40],
            ] as const);
            const [b, Lstar] = pair;
            const cFix = b * Lstar * Lstar;
            const a = rng.int(8, 15);
            return {
                prompt: String.raw`${s.intro} produces $Q = -${n(cFix)} + ${n(a)} L - ${n(b)} L^2$ ${s.unit} with labor input $L$. At which labor input does the **average product of labor** reach its maximum?`,
                given: {
                    "Production function": String.raw`$Q = -${n(cFix)} + ${n(a)} L - ${n(b)} L^2$`,
                },
                answer: Lstar,
                explanation: String.raw`$AP_L = \frac{Q}{L} = -\frac{${n(cFix)}}{L} + ${n(a)} - ${n(b)} L$; the maximum solves $\frac{dAP_L}{dL} = \frac{${n(cFix)}}{L^2} - ${n(b)} = 0$, i.e. $L^* = \sqrt{${n(cFix)} / ${n(b)}}$ = ${n(Lstar)}. At that point the marginal product $MP_L = ${n(a)} - ${n(2 * b)} L$ equals the average product: both are ${n(a - 2 * b * Lstar)} ${s.unit} - the MP curve always crosses the AP curve exactly at its maximum (as long as $MP > AP$, one more worker pulls the average up).`,
            };
        },
    },
    {
        id: "e1-prod-factor-demand",
        subject: "econ1",
        topic: "production_costs",
        difficulty: "hard",
        kind: "numeric",
        unit: "units",
        source: "TUM Economics I W22/23, Problem Set 9, T3",
        build: (rng) => {
            const s = rng.pick(E1_PROD_FACTOR_DEMAND_SCENARIOS);
            const w = rng.int(2, 6);
            const m = rng.int(2, 5);
            const p = rng.int(2, 4);
            const A = 2 * w * m;
            const k = m * p; // sqrt(L*) - an integer by construction
            const answer = k * k;
            return {
                prompt: String.raw`${s.firm} produces $Q = ${n(A)} \sqrt{L}$ ${s.units} per day with labor $L$ (its capital is fixed). The market price is ${eur(p)} ${s.per} and the daily wage is ${eur(w)}. How many workers does it employ at the profit maximum?`,
                given: {
                    "Technology": String.raw`$Q = ${n(A)} \sqrt{L}$`,
                    "Output price p": eur(p),
                    "Wage w": eur(w),
                },
                answer,
                explanation: String.raw`A competitive firm hires until the **value of the marginal product** equals the wage: $p \cdot MP_L = w$. Here $MP_L = \frac{${n(A)}}{2 \sqrt{L}}$, so $${n(p)} \cdot \frac{${n(A)}}{2 \sqrt{L}} = ${n(w)}$ gives $\sqrt{L} = \frac{${n(p)} \cdot ${n(A)}}{2 \cdot ${n(w)}} = ${n(k)}$, hence $L^* = ${n(k)}^2 = ${n(answer)}$ workers. A higher wage would raise the required marginal product and - since $MP_L$ is diminishing - cut employment.`,
            };
        },
    },
    {
        id: "e1-prod-minimum-wage-cost",
        subject: "econ1",
        topic: "production_costs",
        difficulty: "very_easy",
        kind: "numeric",
        unit: "EUR",
        source: "TUM Economics I W22/23, Problem Set 8, T3",
        build: (rng) => {
            const s = rng.pick(E1_PROD_MINIMUM_WAGE_COST_SCENARIOS);
            const w = rng.int(4, 9);
            const dw = rng.pick([1.5, 2, 2.5, 3] as const);
            const wmin = w + dw;
            const L = rng.int(6, 15) * 10;
            const K = rng.int(20, 60);
            const r = rng.int(8, 15);
            const answer = dw * L;
            return {
                prompt: `${s.firm} produces its output $Q^*$ at minimum cost with ${n(L)} workers at a wage of ${eur(w)} and ${n(K)} ${s.capital} at a rental rate of ${eur(r)}. Overnight, a statutory minimum wage of ${eur(wmin)} is introduced. In the **short run** the capital stock cannot be adjusted. By how much do the costs of producing $Q^*$ rise?`,
                given: {
                    "Labor / old wage": `${n(L)} workers at ${eur(w)}`,
                    "Minimum wage": eur(wmin),
                    "Capital / rental rate": `${n(K)} ${s.capital} at ${eur(r)}`,
                },
                answer,
                explanation: String.raw`$\Delta C = (w_{min} - w) \cdot L^*$: with capital fixed in the short run, producing $Q^*$ still requires the same ${n(L)} workers, so only the wage bill changes. ΔC = (${eur(wmin)} − ${eur(w)}) · ${n(L)} = ${eur(answer)}; the rental payments for the ${n(K)} ${s.capital} are unaffected. Only in the long run could the firm substitute capital for the now dearer labor along the isoquant - reaching a cost level between the old one and this short-run level.`,
            };
        },
    },

    // ---------------------------------------------- perfect competition (cont.)
    {
        id: "e1-comp-number-of-firms",
        subject: "econ1",
        topic: "perfect_competition",
        difficulty: "hard",
        kind: "numeric",
        unit: "number",
        source: "TUM Economics I W22/23, Problem Set 10, T1",
        build: (rng) => {
            const sQ = rng.int(2, 5); // long-run output per firm
            const F = sQ * sQ;
            const b = rng.int(2, 6);
            const nF = rng.int(20, 60);
            const A = sQ * (nF + 2 * b);
            return {
                prompt: String.raw`In a competitive market with free entry and exit, every (potential) firm has the cost function $C(q) = q^2 + ${n(F)}$ for $q > 0$ and $C(0) = 0$. Market demand is $Q_D = ${n(A)} - ${n(b)} p$. How many firms are active in the long-run equilibrium?`,
                given: {
                    "Cost function": String.raw`$C(q) = q^2 + ${n(F)}$ for $q > 0$`,
                    "Demand": String.raw`$Q_D = ${n(A)} - ${n(b)} p$`,
                },
                answer: nF,
                explanation: String.raw`$n = \frac{Q_D(p^*)}{q^*}$, where free entry drives the price down to minimum average cost. $AC(q) = q + \frac{${n(F)}}{q}$ is minimal where $MC = AC$: $2q = q + \frac{${n(F)}}{q}$, so $q^* = \sqrt{${n(F)}}$ = ${n(sQ)} and $p^* = MC(q^*)$ = ${eur(2 * sQ)}. Market demand at that price: ${n(A)} − ${n(b)} · ${n(2 * sQ)} = ${n(A - 2 * b * sQ)} units. Number of firms: ${n(A - 2 * b * sQ)} / ${n(sQ)} = ${n(nF)} - each produces $q^*$ and earns exactly zero profit, so no firm wants to enter or exit.`,
            };
        },
    },

    // ----------------------------------------------------------- externalities
    {
        id: "e1-ext-social-output",
        subject: "econ1",
        topic: "externalities",
        difficulty: "medium",
        kind: "numeric",
        unit: "units",
        source: "TUM Economics I W22/23, Problem Set 11, T1",
        build: (rng) => {
            const s = rng.pick(E1_EXT_SOCIAL_OUTPUT_SCENARIOS);
            const cSlope = rng.int(1, 3);
            const Qsoc = rng.int(20, 60);
            const dmg = rng.int(2, 8) * 10;
            const p = 2 * cSlope * Qsoc + dmg;
            return {
                prompt: String.raw`${s.firm} sells at the fixed market price of ${eur(p)} per ${s.one} and has production costs $C(Q) = ${n(cSlope)} Q^2$. ${s.harm} by ${eur(dmg)} for every ${s.one}. What is the **socially optimal** output of ${s.short}?`,
                given: {
                    [`Price per ${s.one}`]: eur(p),
                    [s.costLabel]: String.raw`$C(Q) = ${n(cSlope)} Q^2$`,
                    [`External damage per ${s.one}`]: eur(dmg),
                },
                answer: Qsoc,
                explanation: String.raw`The social optimum equates the price with the **social** marginal cost: $p = MC(Q) + MEC$, where $MEC$ is the marginal external cost borne by ${s.victim}. Here $${n(p)} = ${n(2 * cSlope)} Q + ${n(dmg)}$ gives $Q_{soc}$ = ${n(Qsoc)} ${s.units}. Left alone, ${s.short} ignores the damage and produces where $p = MC$ only: $Q_{priv} = ${n(p)} / ${n(2 * cSlope)}$ = ${n2(p / (2 * cSlope))} ${s.units} - more than is socially efficient, because part of its true cost falls on others.`,
            };
        },
    },
    {
        id: "e1-ext-internalize-gain",
        subject: "econ1",
        topic: "externalities",
        difficulty: "hard",
        kind: "numeric",
        unit: "EUR",
        source: "TUM Economics I W22/23, Problem Set 11, T1",
        build: (rng) => {
            const s = rng.pick(E1_EXT_INTERNALIZE_GAIN_SCENARIOS);
            const cSlope = rng.pick([1, 2, 4, 5] as const);
            const k = rng.int(5, 20); // output reduction Q0 - Q1
            const dmg = 2 * cSlope * k;
            const Q0 = k + rng.int(10, 40);
            const p = 2 * cSlope * Q0;
            const Q1 = Q0 - k;
            const answer = cSlope * k * k;
            return {
                prompt: String.raw`${s.firm} sells at the fixed price of ${eur(p)} per ${s.one} and has costs $C(Q) = ${n(cSlope)} Q^2$; ${s.harm} by ${eur(dmg)} per ${s.one}. The two firms merge and from now on maximize **joint profit**. By how much does the sum of the two profits rise compared to separate profit maximization?`,
                given: {
                    [`Price per ${s.one}`]: eur(p),
                    [s.costLabel]: String.raw`$C(Q) = ${n(cSlope)} Q^2$`,
                    [`External damage per ${s.one}`]: eur(dmg),
                },
                answer,
                explanation: String.raw`For a constant marginal damage $d$, the gain from internalizing is $\Delta\pi = \frac{d^2}{4c}$ - the triangle between the private and the joint optimum. Separately, ${s.short} produces where $p = MC$: $Q_0 = \frac{${n(p)}}{${n(2 * cSlope)}}$ = ${n(Q0)} ${s.units}. Jointly, the damage enters the calculus, $p = MC + d$: $Q_1 = \frac{${n(p)} - ${n(dmg)}}{${n(2 * cSlope)}}$ = ${n(Q1)}. On each of the ${n(k)} ${s.units} cut, the damage saved exceeds the profit lost, and joint profit rises by $c \left( Q_0 - Q_1 \right)^2 = ${n(cSlope)} \cdot ${n(k)}^2$ = ${eur(answer)}. The merged firm produces the socially optimal quantity.`,
            };
        },
    },

    // -------------------------------------------------------- monopoly (cont.)
    {
        id: "e1-mono-price-midpoint",
        subject: "econ1",
        topic: "monopoly",
        difficulty: "easy",
        kind: "numeric",
        unit: "EUR",
        source: "TUM Economics I W22/23, Problem Set 12, T2",
        build: (rng) => {
            const s = rng.pick(E1_MONO_PRICE_MIDPOINT_SCENARIOS);
            const kS = rng.pick([0.5, 1, 2] as const);
            const qM = rng.int(20, 60);
            const cM = rng.int(2, 10);
            const A = cM + 2 * kS * qM;
            const answer = cM + kS * qM;
            return {
                prompt: String.raw`${s.firm} faces the inverse demand $P = ${n(A)} - ${n(kS)} Q$ and a constant marginal cost of ${eur(cM)} per ${s.one} (no fixed costs). What price does it charge at the profit maximum?`,
                given: {
                    "Inverse demand": String.raw`$P = ${n(A)} - ${n(kS)} Q$`,
                    "Marginal cost": eur(cM),
                },
                answer,
                explanation: String.raw`Set $MR = MC$, where linear demand doubles the slope: $MR = ${n(A)} - ${n(2 * kS)} Q$. From $${n(A)} - ${n(2 * kS)} Q = ${n(cM)}$: $Q^M = \frac{${n(A)} - ${n(cM)}}{${n(2 * kS)}}$ = ${n(qM)} ${s.units}. The price comes from the demand curve, not from MR: $P^M = ${n(A)} - ${n(kS)} \cdot ${n(qM)}$ = ${eur(answer)}. With linear demand and constant MC this is exactly the midpoint $\frac{${n(A)} + ${n(cM)}}{2}$ between the choke price and marginal cost.`,
            };
        },
    },
    {
        id: "e1-mono-deadweight-loss",
        subject: "econ1",
        topic: "monopoly",
        difficulty: "hard",
        kind: "numeric",
        unit: "EUR",
        source: "TUM Economics I W22/23, Problem Set 12, T2",
        build: (rng) => {
            const s = rng.pick(E1_MONO_DEADWEIGHT_LOSS_SCENARIOS);
            const kS = rng.pick([0.2, 0.5, 1] as const);
            const qM = rng.int(6, 16) * 5; // multiple of 5 keeps A an integer for k = 0.2
            const cM = rng.int(2, 10);
            const A = cM + 2 * kS * qM;
            const pM = cM + kS * qM;
            const Qc = 2 * qM;
            const answer = 0.5 * kS * qM * qM;
            return {
                prompt: String.raw`${s.firm}, with inverse demand $P = ${n(A)} - ${n(kS)} Q$ and a constant marginal cost of ${eur(cM)}. What is the **deadweight loss** of the monopoly compared to the perfectly competitive outcome?`,
                given: {
                    "Inverse demand": String.raw`$P = ${n(A)} - ${n(kS)} Q$`,
                    "Marginal cost": eur(cM),
                },
                answer,
                explanation: String.raw`$DWL = \frac{1}{2} \left( P^M - MC \right) \left( Q_{PC} - Q^M \right)$ - the triangle of units whose willingness to pay exceeds marginal cost but which the monopolist withholds. $MR = MC$: $${n(A)} - ${n(2 * kS)} Q = ${n(cM)}$ gives $Q^M$ = ${n(qM)} and $P^M$ = ${eur(pM)}. Competition would price at marginal cost: $${n(A)} - ${n(kS)} Q = ${n(cM)}$ gives $Q_{PC}$ = ${n(Qc)} - twice the monopoly quantity. DWL = ½ · (${n(pM)} − ${n(cM)}) · (${n(Qc)} − ${n(qM)}) = ${eur(answer)}. Under perfect price discrimination the DWL would vanish (all surplus going to the monopolist).`,
            };
        },
    },


    // =====================================================================
    // Added 2026-09-02 from the WS19/20 exam, the eTest W20/21 and the
    // Principles of Economics exercise exams (WS17/18 = WS20/21), blocks 1-5.
    // =====================================================================
    // ------------------------------------------------ comparative advantage
    {
        id: "e1-ca-minutes-opportunity-cost",
        subject: "econ1",
        topic: "comparative_advantage",
        difficulty: "easy",
        kind: "numeric",
        unit: "ratio",
        source: "TUM Economics I Exam WS19/20, P3",
        build: (rng) => {
            const s = rng.pick(E1_CA_MINUTES_OPPORTUNITY_COST_SCENARIOS);
            const groups = rng.shuffle(OC_Y_GROUPS).slice(0, 3);
            const rows = groups.map((g) => {
                const [tx, ty] = rng.pick(g.pairs);
                return { tx, ty, oc: g.oc };
            });
            const names = s.names;
            const k = rng.int(0, 2);
            const me = rows[k];
            const answer = me.oc; // = t_Y / t_X
            const line = (i: number) =>
                `${names[i]} needs ${n(rows[i].tx)} minutes for one ${s.xOne} and ${n(rows[i].ty)} minutes for one ${s.yOne}`;
            return {
                prompt: `${s.intro}. ${line(0)}; ${line(1)}; ${line(2)}. What is ${names[k]}'s opportunity cost of one ${s.yOne}, measured in ${s.xUnit}?`,
                given: {
                    [`${names[0]}: ${s.x} / ${s.y}`]: `${n(rows[0].tx)} / ${n(rows[0].ty)} min per unit`,
                    [`${names[1]}: ${s.x} / ${s.y}`]: `${n(rows[1].tx)} / ${n(rows[1].ty)} min per unit`,
                    [`${names[2]}: ${s.x} / ${s.y}`]: `${n(rows[2].tx)} / ${n(rows[2].ty)} min per unit`,
                },
                answer,
                explanation: String.raw`The opportunity cost of a ${s.yOne} is the number of ${s.xUnit} given up while ${s.verb} it, so it is the ratio of the two production times: $OC_{\text{${s.y}}} = \frac{t_{\text{${s.y}}}}{t_{\text{${s.x}}}}$. ${names[k]} needs ${n(me.ty)} minutes per ${s.yShort} and ${n(me.tx)} minutes per ${s.xShort}, so the opportunity cost is ${n(me.ty)} / ${n(me.tx)} = ${n2(answer)} ${s.xUnits} per ${s.yShort}. For the whole crew: ${names[0]} ${n2(rows[0].oc)}, ${names[1]} ${n2(rows[1].oc)}, ${names[2]} ${n2(rows[2].oc)} ${s.xUnits} per ${s.yShort} - the lowest value marks the comparative advantage in ${s.y}.`,
            };
        },
    },
    {
        id: "e1-ca-hourly-output-specialized",
        subject: "econ1",
        topic: "comparative_advantage",
        difficulty: "easy",
        kind: "numeric",
        unit: "units",
        source: "TUM Economics I Exam WS19/20, P5",
        build: (rng) => {
            const s = rng.pick(E1_CA_HOURLY_OUTPUT_SPECIALIZED_SCENARIOS);
            const groups = rng.shuffle(OC_X_GROUPS).slice(0, 3);
            const names = rng.shuffle(s.names);
            const rows = groups.map((g, i) => {
                const [tx, ty] = rng.pick(g.pairs);
                return { name: names[i], tx, ty, oc: g.oc };
            });
            // the strictly lowest opportunity cost of good X: unique by construction
            const spec = rows.reduce((best, r) => (r.oc < best.oc ? r : best));
            const others = rows.filter((r) => r !== spec);
            const answer = 60 / others[0].ty + 60 / others[1].ty;
            const line = (r: (typeof rows)[number]) =>
                `${r.name} needs ${n(r.tx)} minutes for one ${s.xOne} and ${n(r.ty)} minutes for one ${s.yOne}`;
            return {
                prompt: `${s.intro}. ${line(rows[0])}; ${line(rows[1])}; ${line(rows[2])}. Whoever holds the comparative advantage in ${s.x} spends the full hour on ${s.x} only, while the other two spend the full hour on ${s.y} only. How many ${s.yAsk} do the three produce in that hour?`,
                given: {
                    [`${rows[0].name}: ${s.x} / ${s.y}`]: `${n(rows[0].tx)} / ${n(rows[0].ty)} min per unit`,
                    [`${rows[1].name}: ${s.x} / ${s.y}`]: `${n(rows[1].tx)} / ${n(rows[1].ty)} min per unit`,
                    [`${rows[2].name}: ${s.x} / ${s.y}`]: `${n(rows[2].tx)} / ${n(rows[2].ty)} min per unit`,
                },
                answer,
                explanation: String.raw`Rank the three by the opportunity cost of a ${s.xOne} and let the cheapest one specialize; an hour of ${s.y} yields $OC_{\text{${s.x}}} = \frac{t_{\text{${s.x}}}}{t_{\text{${s.y}}}}, \qquad q_{\text{${s.y}}} = \frac{60}{t_{\text{${s.y}}}}$. Opportunity costs: ${rows[0].name} ${n2(rows[0].oc)}, ${rows[1].name} ${n2(rows[1].oc)}, ${rows[2].name} ${n2(rows[2].oc)} ${s.yUnits} per ${s.xShort}. ${spec.name} is the cheapest producer of ${s.x} and makes ${s.x} only. The other two ${s.doY}: 60 / ${n(others[0].ty)} = ${n(60 / others[0].ty)} ${s.yUnits} by ${others[0].name} and 60 / ${n(others[1].ty)} = ${n(60 / others[1].ty)} ${s.yUnits} by ${others[1].name}, together ${n(answer)} ${s.yUnits}.`,
            };
        },
    },
    {
        id: "e1-ca-joint-ppf-three",
        subject: "econ1",
        topic: "comparative_advantage",
        difficulty: "hard",
        kind: "numeric",
        unit: "units",
        source: "TUM Economics I eTest W20/21, Q25",
        build: (rng) => {
            const s = rng.pick(E1_CA_JOINT_PPF_THREE_SCENARIOS);
            const T = rng.pick([60, 120, 180]);
            const groups = rng
                .shuffle(OC_T_GROUPS)
                .slice(0, 3)
                .sort((p, q) => p.oc - q.oc); // cheapest producer of good X first
            const names = rng.shuffle(s.names);
            const ranked = groups.map((g, i) => {
                const [tx, ty] = rng.pick(g.pairs);
                return { name: names[i], tx, ty, oc: g.oc };
            });
            const cap1 = T / ranked[0].tx; // crates the cheapest producer can pick alone
            const cap2 = T / ranked[1].tx;
            const onSecond = rng.int(0, 1) === 1;
            let x1: number;
            let x2: number;
            if (onSecond) {
                const step = ranked[1].ty / gcd(ranked[1].tx, ranked[1].ty);
                const maxK = Math.floor((cap2 - 1) / step);
                x1 = cap1;
                x2 = maxK >= 1 ? step * rng.int(1, maxK) : rng.int(1, cap2 - 1);
            } else {
                const step = ranked[0].ty / gcd(ranked[0].tx, ranked[0].ty);
                const maxK = Math.floor((cap1 - 1) / step);
                x1 = maxK >= 1 ? step * rng.int(1, maxK) : rng.int(1, cap1 - 1);
                x2 = 0;
            }
            const target = x1 + x2;
            const oil = [x1, x2, 0].map((x, i) => (T - ranked[i].tx * x) / ranked[i].ty);
            const answer = oil[0] + oil[1] + oil[2];
            const shown = rng.shuffle(ranked);
            const split =
                x2 === 0
                    ? `${ranked[0].name} alone ${s.doXs} all ${n(target)} ${s.xUnits} while ${ranked[1].name} and ${ranked[2].name} ${s.doY} for the whole shift`
                    : `${ranked[0].name} ${s.doXs} ${n(x1)} ${s.xUnits} and ${ranked[1].name} the remaining ${n(x2)}; ${ranked[2].name} touches no ${s.x} at all`;
            const line = (r: (typeof ranked)[number]) =>
                `${r.name} needs ${n(r.tx)} minutes for one ${s.xOne} and ${n(r.ty)} minutes for one ${s.yOne}`;
            return {
                prompt: `${s.intro} each have ${n(T)} minutes left today. ${line(shown[0])}; ${line(shown[1])}; ${line(shown[2])}. ${s.team} must hand over exactly ${n(target)} ${s.xUnits} of ${s.x} tonight and wants to produce ${s.asMuch} as possible with the remaining minutes. How many ${s.yUnits} of ${s.y} does the crew produce?`,
                given: {
                    "Time per worker": `${n(T)} min`,
                    [`${shown[0].name}: ${s.x} / ${s.y}`]: `${n(shown[0].tx)} / ${n(shown[0].ty)} min per unit`,
                    [`${shown[1].name}: ${s.x} / ${s.y}`]: `${n(shown[1].tx)} / ${n(shown[1].ty)} min per unit`,
                    [`${shown[2].name}: ${s.x} / ${s.y}`]: `${n(shown[2].tx)} / ${n(shown[2].ty)} min per unit`,
                    [`${cap(s.x)} required`]: `${n(target)} ${s.xUnits}`,
                },
                answer,
                explanation: String.raw`Fill the ${s.x} target with the workers whose opportunity cost of a ${s.xShort} is lowest, $OC_{\text{${s.x}}} = \frac{t_{\text{${s.x}}}}{t_{\text{${s.y}}}}$, and put every remaining minute into ${s.y}. Ranking: ${ranked[0].name} ${n2(ranked[0].oc)} < ${ranked[1].name} ${n2(ranked[1].oc)} < ${ranked[2].name} ${n2(ranked[2].oc)} ${s.yUnits} per ${s.xShort}. ${ranked[0].name} can ${s.doX} at most ${n(cap1)} ${s.xUnits} in ${n(T)} minutes, so ${split}. Remaining ${s.y}: (${n(T)} − ${n(ranked[0].tx)}·${n(x1)}) / ${n(ranked[0].ty)} = ${n2(oil[0])}, (${n(T)} − ${n(ranked[1].tx)}·${n(x2)}) / ${n(ranked[1].ty)} = ${n2(oil[1])} and ${n(T)} / ${n(ranked[2].ty)} = ${n2(oil[2])} ${s.yUnits}, together ${n2(answer)} ${s.yUnits}.`,
            };
        },
    },
    {
        id: "e1-ca-terms-of-trade-lower-bound",
        subject: "econ1",
        topic: "comparative_advantage",
        difficulty: "medium",
        kind: "numeric",
        unit: "ratio",
        source: "TUM Economics I Exam WS19/20, P7",
        build: (rng) => {
            const s = rng.pick(E1_CA_TERMS_OF_TRADE_LOWER_BOUND_SCENARIOS);
            const groups = rng.shuffle(OC_Y_GROUPS).slice(0, 2);
            const names = rng.shuffle(s.names);
            const rows = groups.map((g, i) => {
                const [tx, ty] = rng.pick(g.pairs);
                return { name: names[i], tx, ty, oc: g.oc };
            });
            const low = rows[0].oc < rows[1].oc ? rows[0] : rows[1];
            const high = rows[0].oc < rows[1].oc ? rows[1] : rows[0];
            const answer = low.oc;
            const line = (r: (typeof rows)[number]) =>
                `${r.name} needs ${n(r.tx)} minutes for one ${s.x} and ${n(r.ty)} minutes for one ${s.y}`;
            return {
                prompt: `${s.intro}. ${line(rows[0])}; ${line(rows[1])}. They think about specializing and then trading ${s.ys} against ${s.xs}. What is the **minimum** price of one ${s.y}, measured in ${s.xs}, at which both of them can still gain from trade?`,
                given: {
                    [`${rows[0].name}: ${s.xs} / ${s.ys}`]: `${n(rows[0].tx)} / ${n(rows[0].ty)} min per unit`,
                    [`${rows[1].name}: ${s.xs} / ${s.ys}`]: `${n(rows[1].tx)} / ${n(rows[1].ty)} min per unit`,
                },
                answer,
                explanation: String.raw`Trade helps both only if the price of a ${s.y} lies between the two opportunity costs, so the lower one is the floor: $p_{\min} = \min\left(\frac{t^{1}_{\text{${s.y}}}}{t^{1}_{\text{${s.x}}}}, \frac{t^{2}_{\text{${s.y}}}}{t^{2}_{\text{${s.x}}}}\right)$. Opportunity cost of a ${s.y}: ${rows[0].name} ${n(rows[0].ty)} / ${n(rows[0].tx)} = ${n2(rows[0].oc)} ${s.xs}, ${rows[1].name} ${n(rows[1].ty)} / ${n(rows[1].tx)} = ${n2(rows[1].oc)} ${s.xs}. ${low.name} is the cheaper ${s.y} producer and sells ${s.ys}; below ${n2(answer)} ${s.xs} per ${s.y} ${low.name} would rather make ${s.xs}, above ${n2(high.oc)} ${s.xs} per ${s.y} ${high.name} would rather make the ${s.ys} alone. The price range is ${n2(answer)} to ${n2(high.oc)} ${s.xs} per ${s.y}, so the minimum is ${n2(answer)}.`,
            };
        },
    },
    {
        id: "e1-ca-joint-ppf-two-countries",
        subject: "econ1",
        topic: "comparative_advantage",
        difficulty: "medium",
        kind: "numeric",
        unit: "units",
        source: "TUM Principles of Economics Exercise Exam WS20/21, P2",
        build: (rng) => {
            const s = rng.pick(E1_CA_JOINT_PPF_TWO_COUNTRIES_SCENARIOS);
            const ocE = rng.pick([2, 3, 4, 5]); // country A: tonnes of Y per tonne of X
            const gap = rng.pick([3, 4, 5, 6]);
            const ocU = ocE + gap; // country B: higher, so A has the advantage in X
            const XE = rng.pick([10, 12, 15, 20]);
            const XU = rng.pick([10, 12, 15, 20]);
            const YE = ocE * XE;
            const YU = ocU * XU;
            const onEthiopia = rng.int(0, 1) === 1;
            const target = onEthiopia ? XE + rng.int(1, XU - 1) : rng.int(1, XE - 1);
            const answer = onEthiopia ? YU - ocU * (target - XE) : YU + YE - ocE * target;
            return {
                prompt: `In one season ${s.a} can produce at most ${n(XE)} tonnes of ${s.x} **or** at most ${n(YE)} tonnes of ${s.y}, ${s.b} at most ${n(XU)} tonnes of ${s.x} **or** at most ${n(YU)} tonnes of ${s.y}. Both production possibility frontiers are straight lines, and any mix along them is feasible. If the two countries together grow exactly ${n(target)} tonnes of ${s.x} and divide the work in the most efficient way, what is the largest total amount of ${s.y} (in tonnes) they can still grow?`,
                given: {
                    [`${s.a}: ${s.x} or ${s.y}`]: `${n(XE)} or ${n(YE)} tonnes`,
                    [`${s.b}: ${s.x} or ${s.y}`]: `${n(XU)} or ${n(YU)} tonnes`,
                    [`${cap(s.x)} required`]: `${n(target)} tonnes`,
                },
                answer,
                explanation: String.raw`On the joint frontier the country with the lower opportunity cost of ${s.x} grows the ${s.x} first: $OC_{\text{${s.a}}} = \frac{Y_E}{X_E} < OC_{\text{${s.b}}} = \frac{Y_U}{X_U}$. Here ${s.a} gives up ${n(YE)} / ${n(XE)} = ${n2(ocE)} tonnes of ${s.y} per tonne of ${s.x}, ${s.b} ${n(YU)} / ${n(XU)} = ${n2(ocU)}, so ${s.a} grows ${s.x} first (it can cover up to ${n(XE)} tonnes). ${
                    onEthiopia
                        ? `The target of ${n(target)} tonnes exceeds ${s.a}'s maximum, so ${s.a} grows only ${s.x} and ${s.b} adds the missing ${n(target - XE)} tonnes: ${s.y} = ${n(YU)} − ${n2(ocU)} · ${n(target - XE)} = ${n2(answer)} tonnes.`
                        : `${s.a} alone covers the target, ${s.b} stays fully in ${s.y}: ${s.y} = ${n(YU)} + ${n(YE)} − ${n2(ocE)} · ${n(target)} = ${n2(answer)} tonnes.`
                }`,
            };
        },
    },
    {
        id: "e1-ca-max-consumption-exporter",
        subject: "econ1",
        topic: "comparative_advantage",
        difficulty: "medium",
        kind: "numeric",
        unit: "units",
        source: "TUM Principles of Economics Exercise Exam WS20/21, P4",
        build: (rng) => {
            const s = rng.pick(E1_CA_MAX_CONSUMPTION_EXPORTER_SCENARIOS);
            const ocE = rng.pick([2, 3, 4, 5]);
            const gap = rng.pick([3, 4, 5, 6]);
            const ocU = ocE + gap;
            const tau = ocE + rng.int(1, gap - 1); // terms of trade, strictly between the two
            const XE = rng.pick([10, 12, 15, 20]);
            const XU = XE + rng.pick([0, 3, 5]);
            const YE = ocE * XE;
            const YU = ocU * XU;
            const answer = tau * XE;
            return {
                prompt: `In one season ${s.a} can produce at most ${n(XE)} tonnes of ${s.x} **or** at most ${n(YE)} tonnes of ${s.y}, ${s.b} at most ${n(XU)} tonnes of ${s.x} **or** at most ${n(YU)} tonnes of ${s.y}; both frontiers are straight lines. The two countries open trade at terms of trade of ${n(tau)} tonnes of ${s.y} per tonne of ${s.x}, and ${s.b}'s ability to deliver ${s.y} is limited only by its own maximum output. ${s.a} specializes completely in ${s.x} and consumes no ${s.x} at all. How many tonnes of ${s.y} can ${s.a} consume at most?`,
                given: {
                    [`${s.a}: ${s.x} or ${s.y}`]: `${n(XE)} or ${n(YE)} tonnes`,
                    [`${s.b}: ${s.x} or ${s.y}`]: `${n(XU)} or ${n(YU)} tonnes`,
                    "Terms of trade": `${n(tau)} tonnes of ${s.y} per tonne of ${s.x}`,
                },
                answer,
                explanation: String.raw`A country that specializes fully and sells everything consumes $Y^{\max}_E = \tau \cdot X_E$ of the imported good. ${s.a}'s opportunity cost of ${s.x} is ${n(YE)} / ${n(XE)} = ${n2(ocE)} tonnes of ${s.y}, below ${s.b}'s ${n(YU)} / ${n(XU)} = ${n2(ocU)}, so ${s.a} is the ${s.x} exporter and the terms of trade ${n(tau)} lie inside that range. Selling all ${n(XE)} tonnes of ${s.x} earns ${n(tau)} · ${n(XE)} = ${n(answer)} tonnes of ${s.y} - more than the ${n(YE)} tonnes ${s.a} could grow on its own. ${s.b} can pay: ${n(answer)} tonnes are within its maximum of ${n(YU)} tonnes.`,
            };
        },
    },
    {
        id: "e1-ca-max-consumption-importer",
        subject: "econ1",
        topic: "comparative_advantage",
        difficulty: "very_hard",
        kind: "numeric",
        unit: "units",
        source: "TUM Principles of Economics Exercise Exam WS20/21, P4",
        build: (rng) => {
            const s = rng.pick(E1_CA_MAX_CONSUMPTION_IMPORTER_SCENARIOS);
            const ocE = rng.pick([2, 3, 4]);
            const gap = rng.pick([3, 4, 5, 6]);
            const ocU = ocE + gap;
            const tau = ocE + rng.int(1, gap - 1);
            const m = rng.int(1, 2);
            const XE = ocU * m; // keeps the import bill an integer
            const XU = XE + rng.pick([0, 4, 6]);
            const YE = ocE * XE;
            const YU = ocU * XU;
            const bill = tau * XE; // tonnes of Y country B hands over
            const ownTea = XU - tau * m; // = X_U (1 - tau X_E / Y_U)
            const answer = XE + ownTea;
            return {
                prompt: `In one season ${s.a} can produce at most ${n(XE)} tonnes of ${s.x} **or** at most ${n(YE)} tonnes of ${s.y}, ${s.b} at most ${n(XU)} tonnes of ${s.x} **or** at most ${n(YU)} tonnes of ${s.y}; both frontiers are straight lines. Trade takes place at ${n(tau)} tonnes of ${s.y} per tonne of ${s.x}. ${s.a} specializes completely in ${s.x}, so it can deliver at most its full harvest of ${n(XE)} tonnes and consumes none of it. ${s.b} wants to consume as many tonnes of ${s.x} as possible: it buys everything ${s.a} delivers, grows the ${s.y} for the bill itself and uses the rest of its land for its own ${s.x}. How many tonnes of ${s.x} can ${s.b} consume at most?`,
                given: {
                    [`${s.a}: ${s.x} or ${s.y}`]: `${n(XE)} or ${n(YE)} tonnes`,
                    [`${s.b}: ${s.x} or ${s.y}`]: `${n(XU)} or ${n(YU)} tonnes`,
                    "Terms of trade": `${n(tau)} tonnes of ${s.y} per tonne of ${s.x}`,
                },
                answer,
                explanation: String.raw`${s.b}'s own frontier trades ${s.x} for ${s.y} at $OC_{\text{${s.b}}}$, and growing the ${s.y} for the import bill takes land away from ${s.x}: $X^{\max}_U = X_E + X_U \left(1 - \frac{\tau \cdot X_E}{Y_U}\right)$. ${s.a} can supply at most ${n(XE)} tonnes of ${s.x}, which cost ${n(tau)} · ${n(XE)} = ${n(bill)} tonnes of ${s.y}. Growing that quantity of ${s.y} uses ${n(bill)} / ${n(YU)} of ${s.b}'s land, leaving ${n(XU)} · (1 − ${n(bill)}/${n(YU)}) = ${n(ownTea)} tonnes of home-grown ${s.x}. Total: ${n(XE)} + ${n(ownTea)} = ${n(answer)} tonnes. The trap is to compute ${n(YU)} / ${n(tau)} = ${n2(YU / tau)} tonnes: ${s.b} could afford that quantity of ${s.x}, but ${s.a} cannot grow it.`,
            };
        },
    },
    {
        id: "e1-ca-consumption-target-exporter",
        subject: "econ1",
        topic: "comparative_advantage",
        difficulty: "medium",
        kind: "numeric",
        unit: "units",
        source: "TUM Principles of Economics Exercise Exam WS20/21, P5",
        build: (rng) => {
            const s = rng.pick(E1_CA_CONSUMPTION_TARGET_EXPORTER_SCENARIOS);
            const ocE = rng.pick([2, 3, 4, 5]);
            const gap = rng.pick([3, 4, 5, 6]);
            const ocU = ocE + gap;
            const tau = ocE + rng.int(1, gap - 1);
            const XE = rng.pick([10, 12, 16, 20]);
            const XU = XE + rng.pick([0, 2, 5]);
            const YE = ocE * XE;
            const YU = ocU * XU;
            const target = rng.int(XE / 2 + 1, XE - 1); // tonnes of X each country consumes
            const sold = XE - target;
            const answer = tau * sold;
            return {
                prompt: `In one season ${s.a} can produce at most ${n(XE)} tonnes of ${s.x} **or** at most ${n(YE)} tonnes of ${s.y}, ${s.b} at most ${n(XU)} tonnes of ${s.x} **or** at most ${n(YU)} tonnes of ${s.y}; both frontiers are straight lines. The two trade at ${n(tau)} tonnes of ${s.y} per tonne of ${s.x}, and each country ends up consuming exactly ${n(target)} tonnes of ${s.x}. ${s.a} specializes completely in ${s.x} and sells whatever it does not consume. How many tonnes of ${s.y} can ${s.a} consume?`,
                given: {
                    [`${s.a}: ${s.x} or ${s.y}`]: `${n(XE)} or ${n(YE)} tonnes`,
                    [`${s.b}: ${s.x} or ${s.y}`]: `${n(XU)} or ${n(YU)} tonnes`,
                    "Terms of trade": `${n(tau)} tonnes of ${s.y} per tonne of ${s.x}`,
                    [`${cap(s.x)} consumed per country`]: `${n(target)} tonnes`,
                },
                answer,
                explanation: String.raw`${s.a}'s ${s.y} is bought entirely with the ${s.x} it exports: $Y^{\max}_E = \tau \left( X_E - \bar{X} \right)$. ${s.a}'s opportunity cost of ${s.x} is ${n(YE)} / ${n(XE)} = ${n2(ocE)} tonnes of ${s.y} against ${s.b}'s ${n(YU)} / ${n(XU)} = ${n2(ocU)}, so full specialization in ${s.x} is the right move. It grows ${n(XE)} tonnes, keeps ${n(target)} and exports ${n(XE)} − ${n(target)} = ${n(sold)} tonnes, which earn ${n(tau)} · ${n(sold)} = ${n(answer)} tonnes of ${s.y}.`,
            };
        },
    },
    {
        id: "e1-ca-consumption-target-importer",
        subject: "econ1",
        topic: "comparative_advantage",
        difficulty: "very_hard",
        kind: "numeric",
        unit: "units",
        source: "TUM Principles of Economics Exercise Exam WS20/21, P5",
        build: (rng) => {
            const s = rng.pick(E1_CA_CONSUMPTION_TARGET_IMPORTER_SCENARIOS);
            const ocE = rng.pick([2, 3, 4, 5]);
            const gap = rng.pick([3, 4, 5, 6]);
            const ocU = ocE + gap;
            const tau = ocE + rng.int(1, gap - 1);
            const XE = rng.pick([10, 12, 16, 20]);
            const XU = XE + rng.pick([0, 2, 5]);
            const YE = ocE * XE;
            const YU = ocU * XU;
            const target = rng.int(XE / 2 + 1, XE - 1);
            const sold = XE - target; // tonnes country B imports
            const own = target - sold; // tonnes country B grows itself
            const bill = tau * sold;
            const grownCoffee = ocU * (XU - own); // = Y_U (1 - own / X_U)
            const answer = grownCoffee - bill;
            return {
                prompt: `In one season ${s.a} can produce at most ${n(XE)} tonnes of ${s.x} **or** at most ${n(YE)} tonnes of ${s.y}, ${s.b} at most ${n(XU)} tonnes of ${s.x} **or** at most ${n(YU)} tonnes of ${s.y}; both frontiers are straight lines. The two trade at ${n(tau)} tonnes of ${s.y} per tonne of ${s.x}, and each country ends up consuming exactly ${n(target)} tonnes of ${s.x}. ${s.a} specializes completely in ${s.x} and sells what it does not consume; ${s.b} buys the ${s.x} on offer, pays in ${s.y} and grows the rest of its ${s.x} itself. How many tonnes of ${s.y} can ${s.b} consume?`,
                given: {
                    [`${s.a}: ${s.x} or ${s.y}`]: `${n(XE)} or ${n(YE)} tonnes`,
                    [`${s.b}: ${s.x} or ${s.y}`]: `${n(XU)} or ${n(YU)} tonnes`,
                    "Terms of trade": `${n(tau)} tonnes of ${s.y} per tonne of ${s.x}`,
                    [`${cap(s.x)} consumed per country`]: `${n(target)} tonnes`,
                },
                answer,
                explanation: String.raw`${s.b} grows the ${s.x} it cannot import and pays for the imports out of its ${s.y}: $Y_U^{\,c} = Y_U \left(1 - \frac{c}{X_U}\right) - \tau \left( X_E - \bar{X} \right)$ with $c$ the ${s.x} ${s.b} grows itself. ${s.a} exports ${n(XE)} − ${n(target)} = ${n(sold)} tonnes, so ${s.b} has to grow $c$ = ${n(target)} − ${n(sold)} = ${n(own)} tonnes on its own land. That leaves ${s.y} of ${n(YU)} · (1 − ${n(own)}/${n(XU)}) = ${n(grownCoffee)} tonnes, out of which the import bill of ${n(tau)} · ${n(sold)} = ${n(bill)} tonnes is paid. ${s.b} consumes ${n(grownCoffee)} − ${n(bill)} = ${n(answer)} tonnes of ${s.y}.`,
            };
        },
    },

    // -------------------------------------------- opportunity cost & Pareto
    {
        id: "e1-oc-pareto-threshold",
        subject: "econ1",
        topic: "opportunity_cost",
        difficulty: "easy",
        kind: "numeric",
        unit: "number",
        source: "TUM Economics I Exam WS19/20, P2",
        build: (rng) => {
            const s = rng.pick(E1_OC_PARETO_THRESHOLD_SCENARIOS);
            const a1 = rng.int(2, 8);
            const a2 = a1 + rng.int(1, 4); // person A strictly gains
            const b1 = rng.int(1, 12); // person B's utility in allocation (1) - the threshold
            const c1 = rng.int(1, 8);
            const c2 = c1 + rng.int(0, 4); // person C is never worse off
            return {
                prompt: String.raw`${s.intro}. Under allocation (1) the utilities are: ${s.a} ${n(a1)}, ${s.b} ${n(b1)}, ${s.c} ${n(c1)}. Under allocation (2) they are: ${s.a} ${n(a2)}, ${s.b} $X$, ${s.c} ${n(c2)}. What is the smallest integer value of $X$ for which allocation (2) is a Pareto improvement over allocation (1)?`,
                given: {
                    [`${s.a}: (1) → (2)`]: `${n(a1)} → ${n(a2)}`,
                    [`${s.b}: (1) → (2)`]: `${n(b1)} → $X$`,
                    [`${s.c}: (1) → (2)`]: `${n(c1)} → ${n(c2)}`,
                },
                answer: b1,
                explanation: String.raw`A Pareto improvement needs $u_i(2) \geq u_i(1)$ for every person, with a strict gain for at least one of them. ${s.a} rises from ${n(a1)} to ${n(a2)} and ${s.c} ${c2 === c1 ? "stays at" : "rises from"} ${n(c1)}${c2 === c1 ? "" : ` to ${n(c2)}`}, so the strict gain is already there and nobody among them loses. The only open condition is ${s.b}, who must not be worse off, i.e. $X \geq$ ${n(b1)}. The smallest integer that satisfies this is ${n(b1)}. Anything below leaves ${s.b} worse off, and then allocation (2) merely redistributes instead of improving.`,
                hint: String.raw`One allocation is a Pareto improvement over another when nobody ends up worse off and at least one person is strictly better off: $u_i(2) \geq u_i(1)$ for every person $i$, with a strict inequality for at least one.`,
            };
        },
    },
    {
        id: "e1-oc-sunk-cost-net-benefit",
        subject: "econ1",
        topic: "opportunity_cost",
        difficulty: "easy",
        kind: "numeric",
        unit: "EUR",
        source: "TUM Economics I Exam WS19/20, P1",
        build: (rng) => {
            const s = rng.pick(E1_OC_SUNK_COST_NET_BENEFIT_SCENARIOS);
            const S = rng.int(6, 15) * 10; // non-refundable ticket, already paid
            const c1 = rng.int(2, 8) * 5; // travel cost to option 1
            const v1 = c1 + rng.int(12, 24) * 5;
            const net1 = v1 - c1;
            const sign = rng.pick([-1, 1]);
            const d = rng.int(1, 12) * 5; // the gap between the two net benefits
            const net2 = net1 + sign * d;
            const c2 = rng.int(1, 6) * 5; // fee for option 2
            const v2 = net2 + c2;
            const better = sign === 1 ? s.noun2 : s.noun1;
            return {
                prompt: `${s.name} bought ${s.item} for ${eur(S)} last month; it cannot be returned or resold. ${s.when} ${s.subj} can either ${s.opt1} - ${s.val1} ${eur(v1)} and ${s.cost1} ${eur(c1)} - or ${s.opt2}, which ${s.val2} ${eur(v2)} and ${s.cost2} ${eur(c2)}. By how many euros is the net benefit of the better option higher than the net benefit of the other one?`,
                given: {
                    [`${cap(s.itemWord)}, bought last month`]: eur(S),
                    [s.label1]: `${eur(v1)} / ${eur(c1)}`,
                    [s.label2]: `${eur(v2)} / ${eur(c2)}`,
                },
                answer: d,
                explanation: String.raw`A rational decision maker compares net benefits and ignores what is already spent: $\Delta NB = \left| (V_1 - c_1) - (V_2 - c_2) \right|$. ${cap(s.noun1)}: ${eur(v1)} − ${eur(c1)} = ${eur(net1)}. ${cap(s.noun2)}: ${eur(v2)} − ${eur(c2)} = ${eur(net2)}. The difference is ${eur(d)} in favour of ${better}. The ${eur(S)} for the ${s.itemWord} is a sunk cost - it is gone whatever ${s.name} does ${s.whenLow}, so it appears in neither net benefit - paying for the ${s.itemWord} does not by itself make ${s.noun1} the better choice.`,
                hint: String.raw`Rank options by net benefit, value minus the cost the choice still causes; spending that has already happened is unavoidable now and is the same under every option: $NB = V - c$.`,
            };
        },
    },

    // ------------------------------------------- consumer theory: Cobb-Douglas
    {
        id: "e1-ct-cd-quantity-after-price-change",
        subject: "econ1",
        topic: "consumer_theory",
        difficulty: "medium",
        kind: "numeric",
        unit: "units",
        source: "TUM Economics I Exam WS19/20, P12",
        build: (rng) => {
            const s = rng.pick(E1_CT_CD_QUANTITY_AFTER_PRICE_CHANGE_SCENARIOS);
            const [na, nb, den] = rng.pick(CD_SHARES);
            const A = rng.pick([2, 3, 4, 5]);
            const p1 = rng.int(3, 6);
            const p2 = 2 * rng.int(1, 3); // even, so a halving still gives a clean price
            const f = rng.pick([2, 3, 0.5]); // the price of good 2 doubles, triples or halves
            const need = f === 3 ? 3 : f === 2 ? 2 : 1; // keeps both quantities integer
            const base = den * p1 * p2 * need;
            const t = rng.int(Math.ceil(96 / base), Math.floor(480 / base));
            const M = base * t;
            const p2New = p2 * f;
            const q1 = na * p2 * need * t; // = (na/den) * M / p1
            const q2 = nb * p1 * need * t; // = (nb/den) * M / p2
            const answer = q2 / f; // = (nb/den) * M / p2New
            return {
                prompt: String.raw`${s.who} splits ${s.poss} monthly budget of ${eur(M)} between ${s.g1} ($q_1$) and ${s.g2} ($q_2$), with preferences $U(q_1, q_2) = ${n(A)} \cdot ${powTex("q_1", na, den)} \cdot ${powTex("q_2", nb, den)}$. ${s.g1One} costs ${eur(p1)}. The price of ${s.g2One} changes from ${eur(p2)} to ${eur(p2New)}, while ${s.poss} budget and ${s.g1Price} stay put. How many ${s.g2} does ${s.subj} buy at ${s.poss} new optimum?`,
                given: {
                    "Budget M": eur(M),
                    "Price $p_1$": eur(p1),
                    "Old price $p_2$": eur(p2),
                    "New price $p_2'$": eur(p2New),
                },
                answer,
                explanation: String.raw`$q_2^* = b \cdot \frac{M}{p_2}$ - with Cobb-Douglas preferences each exponent is the share of the budget spent on that good, and the multiplicative constant in front of the utility function does not change the optimum. Here $b = \frac{${nb}}{${den}}$, so at the new price $q_2^*$ = ${n(nb)}/${n(den)} · ${eur(M)} / ${eur(p2New)} = ${n(answer)} ${s.g2Units}. (Before the change it was ${n(nb)}/${n(den)} · ${eur(M)} / ${eur(p2)} = ${n(q2)}.) The demand for ${s.g1} is unaffected: $q_1^*$ = ${n(na)}/${n(den)} · ${eur(M)} / ${eur(p1)} = ${n(q1)} ${s.g1Units} either way, because the expenditure shares are constant.`,
            };
        },
    },
    {
        id: "e1-ct-cd-max-utility-coefficient",
        subject: "econ1",
        topic: "consumer_theory",
        difficulty: "hard",
        kind: "numeric",
        unit: "number",
        source: "TUM Economics I Exam WS19/20, P13",
        build: (rng) => {
            const s = rng.pick(E1_CT_CD_MAX_UTILITY_COEFFICIENT_SCENARIOS);
            const [na, nb, den] = rng.pick(CD_SHARES);
            const a = na / den;
            const b = nb / den;
            const A = rng.pick([2, 3, 4, 5]);
            const p1 = rng.int(3, 6);
            const p2 = 2 * rng.int(1, 3);
            const f = rng.pick([2, 3, 0.5]);
            const need = f === 3 ? 3 : f === 2 ? 2 : 1;
            const base = den * p1 * p2 * need;
            const t = rng.int(Math.ceil(96 / base), Math.floor(480 / base));
            const M = base * t;
            const p2New = p2 * f;
            const q1 = na * p2 * need * t;
            const q2New = (nb * p1 * need * t) / f;
            const answer = A * q1 ** a * q2New ** b;
            return {
                prompt: String.raw`${s.who} spends ${eur(M)} a month on ${s.g1} ($q_1$, ${eur(p1)} each) and ${s.g2} ($q_2$). Its preferences are $U(q_1, q_2) = ${n(A)} \cdot ${powTex("q_1", na, den)} \cdot ${powTex("q_2", nb, den)}$. The price of ${s.g2One} moves from ${eur(p2)} to ${eur(p2New)}. What is the highest utility level the household can reach after the price change?`,
                given: {
                    "Budget M": eur(M),
                    "Price $p_1$": eur(p1),
                    "New price $p_2'$": eur(p2New),
                },
                answer,
                explanation: String.raw`$U^* = A \cdot (q_1^*)^{a} \cdot (q_2^*)^{b}$ evaluated at the optimal bundle, which follows from the constant expenditure shares $q_1^* = a \frac{M}{p_1}$ and $q_2^* = b \frac{M}{p_2'}$. Here $q_1^*$ = ${n(na)}/${n(den)} · ${eur(M)} / ${eur(p1)} = ${n(q1)} ${s.g1Units} and $q_2^*$ = ${n(nb)}/${n(den)} · ${eur(M)} / ${eur(p2New)} = ${n(q2New)} ${s.g2Units}. Substituting: $U^* = ${n(A)} \cdot ${n(q1)}^{${fracTex(na, den)}} \cdot ${n(q2New)}^{${fracTex(nb, den)}}$ = ${n2(answer)}. This is the indirect utility at the new prices - the constant ${n(A)} scales the utility number but never the chosen bundle.`,
            };
        },
    },
    {
        id: "e1-ct-cd-hypothetical-income",
        subject: "econ1",
        topic: "consumer_theory",
        difficulty: "very_hard",
        kind: "numeric",
        unit: "EUR",
        source: "TUM Economics I Exam WS19/20, P14",
        build: (rng) => {
            const s = rng.pick(E1_CT_CD_HYPOTHETICAL_INCOME_SCENARIOS);
            const [na, nb, den] = rng.pick(CD_SHARES);
            const a = na / den;
            const A = rng.pick([2, 3, 4, 5]);
            const p1 = 2 * rng.int(1, 3); // even, so a halving still gives a clean price
            const p2 = rng.int(3, 6);
            const f = rng.pick([2, 3, 0.5]);
            const need = f === 3 ? 3 : f === 2 ? 2 : 1;
            const base = den * p1 * p2 * need;
            const t = rng.int(Math.ceil(96 / base), Math.floor(480 / base));
            const M = base * t;
            const p1New = p1 * f;
            const q1 = na * p2 * need * t;
            const q2 = nb * p1 * need * t;
            const answer = M * f ** a;
            return {
                prompt: String.raw`${s.who} buys ${s.g1} ($q_1$) and ${s.g2} ($q_2$) with a monthly budget of ${eur(M)} and preferences $U(q_1, q_2) = ${n(A)} \cdot ${powTex("q_1", na, den)} \cdot ${powTex("q_2", nb, den)}$. ${s.g2One} costs ${eur(p2)}; the price of ${s.g1One} changes from ${eur(p1)} to ${eur(p1New)}. Which budget would ${s.subj} need at the new prices to reach exactly the utility level ${s.subj} had before the change?`,
                given: {
                    "Budget M": eur(M),
                    "Old price $p_1$": eur(p1),
                    "New price $p_1'$": eur(p1New),
                    "Price $p_2$": eur(p2),
                },
                answer,
                explanation: String.raw`$M_{hyp} = M \cdot \left( \frac{p_1'}{p_1} \right)^{a}$. The hypothetical (compensated) budget is the **smallest** spending that still buys the old utility level at the new prices: minimising $p_1' q_1 + p_2 q_2$ subject to $U = \bar{U}$ again equates $|MRS_{1,2}|$ with the new price ratio $p_1' / p_2$, and the resulting expenditure function of a Cobb-Douglas consumer, $E = \frac{\bar{U}}{A} \left( \frac{p_1}{a} \right)^{a} \left( \frac{p_2}{b} \right)^{b}$, scales with $p_1^{a}$. The old optimum was $q_1^*$ = ${n(q1)} ${s.g1Units} and $q_2^*$ = ${n(q2)} ${s.g2Units}. The price ratio is ${eur(p1New)} / ${eur(p1)} = ${n(f)}, so $M_{hyp} = M \cdot ${n(f)}^{${fracTex(na, den)}}$ = ${eur(answer)} - a difference of ${eur(Math.abs(answer - M))} against the old budget.`,
            };
        },
    },

    // ------------------------------------- consumer theory: labour-leisure choice
    {
        id: "e1-ct-labor-free-time",
        subject: "econ1",
        topic: "consumer_theory",
        difficulty: "medium",
        kind: "numeric",
        unit: "units",
        source: "TUM Principles of Economics Exercise Exam WS20/21, P6",
        build: (rng) => {
            const s = rng.pick(E1_CT_LABOR_FREE_TIME_SCENARIOS);
            const p = rng.pick([1, 2, 3, 4]);
            const w = rng.pick([2, 3, 4, 5, 6, 8, 10, 12].filter((x) => x !== p));
            const cycle = p * (p + w); // Z = cycle * v keeps F, L and q integer
            const v = rng.int(Math.ceil(30 / cycle), Math.floor(168 / cycle));
            const Z = cycle * v;
            const answer = p * p * v; // = p Z / (p + w)
            return {
                prompt: String.raw`${s.who} has ${n(Z)} hours a week to divide between paid work $L$ and free time $F$. ${cap(s.subj)} earns ${eur(w)} per hour worked and spends every euro on a single consumption good that costs ${eur(p)} per unit. ${cap(s.poss)} preferences are $U(q, F) = \sqrt{q} + \sqrt{F}$. How many hours of **free time** does ${s.subj} choose?`,
                given: {
                    "Time budget Z": `${n(Z)} hours`,
                    "Wage w": eur(w),
                    "Price p": eur(p),
                },
                answer,
                explanation: String.raw`$F^* = \frac{p \, Z}{p + w}$. The budget line is $p \, q + w \, F = w \, Z$ - every hour of free time costs the wage it forgoes. The optimum equates the marginal rate of substitution with the relative price, $\frac{MU_q}{MU_F} = \frac{p}{w}$, which for $U = \sqrt{q} + \sqrt{F}$ gives $\sqrt{F / q} = \frac{p}{w}$, i.e. $F = \left( \frac{p}{w} \right)^2 q$; substituting into the budget line yields the formula above. Here $F^*$ = ${n(p)} · ${n(Z)} / (${n(p)} + ${n(w)}) = ${n(answer)} hours, leaving ${n(Z - answer)} hours of paid work. A higher wage makes free time more expensive and shrinks $F^*$.`,
            };
        },
    },
    {
        id: "e1-ct-labor-hours-worked",
        subject: "econ1",
        topic: "consumer_theory",
        difficulty: "medium",
        kind: "numeric",
        unit: "units",
        source: "TUM Principles of Economics Exercise Exam WS20/21, P7",
        build: (rng) => {
            const s = rng.pick(E1_CT_LABOR_HOURS_WORKED_SCENARIOS);
            const p = rng.pick([1, 2, 3, 4]);
            const w = rng.pick([2, 3, 4, 5, 6, 8, 10, 12].filter((x) => x !== p));
            const cycle = p * (p + w);
            const v = rng.int(Math.ceil(30 / cycle), Math.floor(168 / cycle));
            const Z = cycle * v;
            const F = p * p * v;
            const answer = p * w * v; // = Z - F = w Z / (p + w)
            return {
                prompt: String.raw`${s.who} can allocate ${n(Z)} hours a week between paid work $L$ and free time $F$. Each hour of work pays ${eur(w)}, and all income is spent on one consumption good priced at ${eur(p)} per unit. ${cap(s.poss)} preferences are $U(q, F) = \sqrt{q} + \sqrt{F}$. How many hours does ${s.subj} **work** at ${s.poss} optimum?`,
                given: {
                    "Time budget Z": `${n(Z)} hours`,
                    "Wage w": eur(w),
                    "Price p": eur(p),
                },
                answer,
                explanation: String.raw`$L^* = \frac{w \, Z}{p + w}$, the mirror image of $F^* = \frac{p \, Z}{p + w}$ in the time constraint $L + F = Z$. The optimum condition $\frac{MU_q}{MU_F} = \frac{p}{w}$ for $U = \sqrt{q} + \sqrt{F}$ reads $\sqrt{F / q} = \frac{p}{w}$; inserting $F = \left( \frac{p}{w} \right)^2 q$ into the budget line $p \, q + w \, F = w \, Z$ gives both. Here $L^*$ = ${n(w)} · ${n(Z)} / (${n(p)} + ${n(w)}) = ${n(answer)} hours, so free time is ${n(F)} hours. Note the split depends only on the ratio $p / w$, not on how long the week is.`,
            };
        },
    },
    {
        id: "e1-ct-labor-consumption",
        subject: "econ1",
        topic: "consumer_theory",
        difficulty: "hard",
        kind: "numeric",
        unit: "units",
        source: "TUM Principles of Economics Exercise Exam WS20/21, P8",
        build: (rng) => {
            const s = rng.pick(E1_CT_LABOR_CONSUMPTION_SCENARIOS);
            const p = rng.pick([1, 2, 3, 4]);
            const w = rng.pick([2, 3, 4, 5, 6, 8, 10, 12].filter((x) => x !== p));
            const cycle = p * (p + w);
            const v = rng.int(Math.ceil(30 / cycle), Math.floor(168 / cycle));
            const Z = cycle * v;
            const F = p * p * v;
            const L = p * w * v;
            const answer = w * w * v; // = w^2 Z / (p (p + w))
            return {
                prompt: String.raw`${s.who} divides ${n(Z)} hours a week between ${s.work} $L$ and free time $F$. An hour of ${s.activity} pays ${eur(w)}, and ${s.poss} whole income goes on one consumption good that costs ${eur(p)} per unit. With preferences $U(q, F) = \sqrt{q} + \sqrt{F}$, how many **units of the consumption good** does ${s.subj} buy at ${s.poss} optimum?`,
                given: {
                    "Time budget Z": `${n(Z)} hours`,
                    "Wage w": eur(w),
                    "Price p": eur(p),
                },
                answer,
                explanation: String.raw`$q^* = \frac{w^2 Z}{p \, (p + w)}$. From $\frac{MU_q}{MU_F} = \frac{p}{w}$ the optimum satisfies $F = \left( \frac{p}{w} \right)^2 q$; putting that into the budget line $p \, q + w \, F = w \, Z$ leaves $q \left( p + \frac{p^2}{w} \right) = w Z$, which rearranges to the formula. Here $q^*$ = ${n(w)}² · ${n(Z)} / (${n(p)} · ${n(p + w)}) = ${n(answer)} units. Check with the budget: ${s.subj} works ${n(L)} hours for ${eur(w * L)}, and ${n(answer)} units at ${eur(p)} cost exactly that; ${s.poss} free time is ${n(F)} hours.`,
            };
        },
    },
    {
        id: "e1-ct-labor-hypothetical-bundle",
        subject: "econ1",
        topic: "consumer_theory",
        difficulty: "very_hard",
        kind: "numeric",
        unit: "units",
        source: "TUM Principles of Economics Exercise Exam WS20/21, P9",
        build: (rng) => {
            const s = rng.pick(E1_CT_LABOR_HYPOTHETICAL_BUNDLE_SCENARIOS);
            const [p, w, m] = rng.pick(LABOR_TUPLES);
            const j = m + 1;
            const wNew = p * m; // the wage after the change
            const Z = p * j * j * (p + w);
            const F0 = p * p * j * j;
            const q0 = (w * j) ** 2;
            const U0 = j * (p + w); // = sqrt(q0) + sqrt(F0)
            const answer = ((p + w) * m) ** 2; // = (U0 / (1 + p/wNew))^2
            const FHat = (p + w) ** 2;
            return {
                prompt: String.raw`${s.who} splits ${n(Z)} hours a week between paid work and free time $F$, spending all earnings on one consumption good priced at ${eur(p)} per unit; ${s.poss} preferences are $U(q, F) = \sqrt{q} + \sqrt{F}$. At the old wage of ${eur(w)} per hour ${s.subj} chose ${s.poss} optimum. The wage now changes to ${eur(wNew)}. Which quantity of the consumption good would ${s.subj} buy if ${s.subj} were compensated so that ${s.subj} reaches **exactly ${s.poss} old utility level** at the new wage while spending as little as possible?`,
                given: {
                    "Time budget Z": `${n(Z)} hours`,
                    "Old wage w": eur(w),
                    "New wage w'": eur(wNew),
                    "Price p": eur(p),
                },
                answer,
                explanation: String.raw`$\hat{q} = \left( \frac{U_0}{1 + p / w'} \right)^2$. First the old optimum: $F_0 = \frac{p Z}{p + w}$ = ${n(F0)} hours and $q_0 = \frac{w^2 Z}{p (p + w)}$ = ${n(q0)} units, so $U_0 = \sqrt{q_0} + \sqrt{F_0}$ = ${n(Math.sqrt(q0))} + ${n(Math.sqrt(F0))} = ${n(U0)}. The compensated bundle must satisfy the new tangency $F = \left( \frac{p}{w'} \right)^2 q$ **and** stay on the old indifference curve, so $\sqrt{q} \left( 1 + \frac{p}{w'} \right) = U_0$. Here $1 + \frac{p}{w'} = \frac{${n(j)}}{${n(m)}}$, so $\sqrt{\hat{q}} = ${n(U0)} \cdot \frac{${n(m)}}{${n(j)}} = ${n(Math.sqrt(answer))}$ and $\hat{q}$ = ${n(answer)} units, alongside $\hat{F} = \left( \frac{p}{w'} \right)^2 \hat{q}$ = ${n(FHat)} hours. This is the substitution effect alone - same utility, new relative price of free time.`,
            };
        },
    },
    {
        id: "e1-ct-labor-hypothetical-time-budget",
        subject: "econ1",
        topic: "consumer_theory",
        difficulty: "very_hard",
        kind: "numeric",
        unit: "units",
        source: "TUM Principles of Economics Exercise Exam WS20/21, P9",
        build: (rng) => {
            const s = rng.pick(E1_CT_LABOR_HYPOTHETICAL_TIME_BUDGET_SCENARIOS);
            const obj = s.subj === "he" ? "him" : "her";
            const [p, w, m] = rng.pick(LABOR_TUPLES);
            const j = m + 1;
            const wNew = p * m;
            const Z = p * j * j * (p + w);
            const F0 = p * p * j * j;
            const q0 = (w * j) ** 2;
            const U0 = j * (p + w);
            const qHat = ((p + w) * m) ** 2;
            const FHat = (p + w) ** 2;
            const answer = (p + w) ** 2 * (m + 1); // = (p qHat + wNew FHat) / wNew
            return {
                prompt: String.raw`${s.who} currently has ${n(Z)} hours a week to divide between paid work and free time $F$, buys one consumption good at ${eur(p)} per unit and has preferences $U(q, F) = \sqrt{q} + \sqrt{F}$. ${cap(s.poss)} wage changes from ${eur(w)} to ${eur(wNew)} per hour. How large would ${s.poss} time budget have to be, in hours, so that at the **new** wage ${s.subj} could just afford the bundle that keeps ${obj} at ${s.poss} old utility level?`,
                given: {
                    "Time budget Z": `${n(Z)} hours`,
                    "Old wage w": eur(w),
                    "New wage w'": eur(wNew),
                    "Price p": eur(p),
                },
                answer,
                explanation: String.raw`$\hat{Z} = \frac{p \, \hat{q} + w' \hat{F}}{w'}$ - the time endowment whose full-time value $w' \hat{Z}$ pays for the compensated bundle. Old optimum: $F_0 = \frac{p Z}{p + w}$ = ${n(F0)} hours, $q_0 = \frac{w^2 Z}{p (p + w)}$ = ${n(q0)} units, hence $U_0$ = ${n(Math.sqrt(q0))} + ${n(Math.sqrt(F0))} = ${n(U0)}. The compensated bundle solves $\sqrt{q}\left( 1 + \frac{p}{w'} \right) = U_0$ with $F = \left( \frac{p}{w'} \right)^2 q$: $\hat{q}$ = ${n(qHat)} units and $\hat{F}$ = ${n(FHat)} hours. So $\hat{Z}$ = (${eur(p)} · ${n(qHat)} + ${eur(wNew)} · ${n(FHat)}) / ${eur(wNew)} = ${n(answer)} hours, against the actual ${n(Z)} hours.`,
            };
        },
    },

    // ------------------------------------ consumer theory: other preference types
    {
        id: "e1-ct-leontief-demand",
        subject: "econ1",
        topic: "consumer_theory",
        difficulty: "easy",
        kind: "numeric",
        unit: "units",
        source: "TUM Economics I Exercise Exam WT22/23, Q8",
        build: (rng) => {
            const s = rng.pick(E1_CT_LEONTIEF_DEMAND_SCENARIOS);
            const r = rng.int(2, 6); // units of good 2 per unit of good 1
            const p1 = rng.int(2, 6);
            const p2 = rng.int(1, 4);
            const answer = rng.int(3, 14); // q1*, drawn first so the budget stays clean
            const M = (p1 + r * p2) * answer;
            return {
                prompt: String.raw`${s.who} treats ${s.g1} ($q_1$) and ${s.g2} ($q_2$) as perfect complements: ${s.subj} always ${s.verbPre} exactly ${n(r)} ${s.g2} ${s.verbPost} each ${s.g1One}, so $U(q_1, q_2) = \min\{ ${n(r)}\, q_1,\; q_2 \}$. ${s.one1} costs ${eur(p1)}, ${s.one2} ${eur(p2)}, and ${s.subj} has ${eur(M)} to spend. How many **${s.g1}** does ${s.subj} buy at the optimum?`,
                given: {
                    "Utility": String.raw`$U = \min\{ ${n(r)}\, q_1,\; q_2 \}$`,
                    "Price $p_1$": eur(p1),
                    "Price $p_2$": eur(p2),
                    "Budget M": eur(M),
                },
                answer,
                explanation: String.raw`$q_1^* = \frac{M}{p_1 + p_2 \cdot \alpha / \beta}$ for $U = \min\{ \alpha q_1, \beta q_2 \}$. Nothing above the kink is ever bought, so the optimum sits where $\alpha q_1 = \beta q_2$, here $q_2 = ${n(r)}\, q_1$ - one ${s.g1One} always drags ${n(r)} ${s.g2} along, a bundle costing ${eur(p1)} + ${n(r)} · ${eur(p2)} = ${eur(p1 + r * p2)}. Dividing the budget by that bundle price: ${eur(M)} / ${eur(p1 + r * p2)} = ${n(answer)} ${s.g1}, together with ${n(r * answer)} ${s.g2}. With perfect complements the tangency condition never applies - the indifference curves have a kink, not a slope.`,
            };
        },
    },
    {
        id: "e1-ct-substitutes-max-utility",
        subject: "econ1",
        topic: "consumer_theory",
        difficulty: "medium",
        kind: "numeric",
        unit: "number",
        source: "TUM Economics I Exercise Exam WT22/23, Q14",
        build: (rng) => {
            const s = rng.pick(E1_CT_SUBSTITUTES_MAX_UTILITY_SCENARIOS);
            const p1 = rng.int(2, 6);
            const p2 = rng.int(2, 6);
            const alpha = rng.int(p1, p1 + 5);
            const beta = rng.int(1, Math.floor((0.8 * alpha * p2) / p1)); // beta/p2 <= 0.8 alpha/p1
            const k = rng.int(2, 6);
            const M = p1 * p2 * k;
            const answer = alpha * p2 * k; // = alpha * M / p1, the larger of the two
            const other = beta * p1 * k;
            const swap = rng.int(0, 1) === 1;
            const [cA, pA, cB, pB] = swap ? [beta, p2, alpha, p1] : [alpha, p1, beta, p2];
            return {
                prompt: String.raw`${s.who} buys ${s.good} from two brands that ${s.subj} regards as perfect substitutes, with $U(q_1, q_2) = ${co(cA)}q_1 + ${co(cB)}q_2$. Brand 1 costs ${eur(pA)} per ${s.one}, brand 2 costs ${eur(pB)} per ${s.one}, and ${s.subj} has ${eur(M)} to spend. What is the highest utility level ${s.subj} can reach?`,
                given: {
                    "Utility": String.raw`$U = ${co(cA)}q_1 + ${co(cB)}q_2$`,
                    "Price $p_1$": eur(pA),
                    "Price $p_2$": eur(pB),
                    "Budget M": eur(M),
                },
                answer,
                explanation: String.raw`$U^* = \max \left\{ \frac{\alpha M}{p_1},\; \frac{\beta M}{p_2} \right\}$. Linear preferences mean a constant $MRS$, so the whole budget goes to whichever good delivers more utility per euro: ${n(cA)} / ${n(pA)} = ${n2(cA / pA)} against ${n(cB)} / ${n(pB)} = ${n2(cB / pB)}. The better buy wins by more than 20 %, so this is a corner solution - ${s.subj} spends everything on ${swap ? "brand 2" : "brand 1"} and buys ${n(p2 * k)} ${s.units} of it. Utility: ${n(p2 * k)} · ${n(alpha)} = ${n(answer)}. Spending everything on the other brand would only give ${n(other)}.`,
            };
        },
    },
    {
        id: "e1-ct-cross-price-quantity",
        subject: "econ1",
        topic: "consumer_theory",
        difficulty: "easy",
        kind: "numeric",
        unit: "units",
        source: "TUM Economics I Exercise Exam WT22/23, Q16",
        build: (rng) => {
            const s = rng.pick(E1_CT_CROSS_PRICE_QUANTITY_SCENARIOS);
            const eta = rng.pick([-2, -1.5, -1, -0.5, 0.25, 0.5, 0.8, 1.2, 1.5]);
            const x = rng.pick([4, 5, 8, 10, 12, 15, 20]);
            const scaled = Math.abs(eta * 100 * x); // integer
            const step = 10000 / gcd(scaled, 10000); // smallest q1 that keeps the answer integer
            const lo = Math.ceil(100 / step); // keep the weekly volume realistic
            const q1 = step * rng.int(lo, lo + 8);
            const answer = q1 * (1 + (eta * x) / 100);
            return {
                prompt: String.raw`${s.who} currently sells ${n(q1)} ${s.qty} a week. Its cross-price elasticity of demand with respect to the price of ${s.g2} is ${n(eta)}. The price of ${s.g2} now rises by ${pct(x)}, everything else unchanged. How many ${s.qty} will it sell per week?`,
                given: {
                    "Current quantity $q_1$": `${n(q1)} ${s.unit}`,
                    "Cross-price elasticity $η_{1,2}$": n(eta),
                    "Change in $p_2$": pct(x),
                },
                answer,
                explanation: String.raw`$\eta_{1,2} = \frac{\Delta q_1 / q_1}{\Delta p_2 / p_2}$, so the quantity reacts by $\Delta q_1 / q_1 = \eta_{1,2} \cdot \Delta p_2 / p_2$. Here that is ${n(eta)} · ${pct(x)} = ${pct(eta * x)}, so the ${n(q1)} ${s.unit} change by ${n(answer - q1)} ${s.unit} to ${n(answer)} ${s.unit}. A ${eta > 0 ? "positive" : "negative"} cross-price elasticity marks the two goods as ${eta > 0 ? `substitutes - a higher price of ${s.g2} pushes buyers towards ${s.g1}` : `complements - they are bought together, so a higher price of ${s.g2} drags ${s.g1} down too`}.`,
            };
        },
    },
    {
        id: "e1-ct-own-price-quantity-change",
        subject: "econ1",
        topic: "consumer_theory",
        difficulty: "easy",
        kind: "numeric",
        unit: "percent",
        source: "TUM Economics I Exam WS19/20, P17",
        build: (rng) => {
            const s = rng.pick(E1_CT_OWN_PRICE_QUANTITY_CHANGE_SCENARIOS);
            const eta = rng.pick([-0.4, -0.5, -0.8, -1.25, -1.5, -2, -2.5]);
            const x = rng.pick([4, 5, 8, 10, 12, 15, 20]);
            const up = rng.int(0, 1) === 1;
            const change = up ? x : -x;
            const answer = eta * change;
            return {
                prompt: String.raw`${s.who} estimates the own-price elasticity of demand for ${s.good} at ${n(eta)}. It now ${up ? "raises" : "lowers"} the price of ${s.one} by ${pct(x)}. By what percentage does the number of ${s.units} sold change? (A decrease is a negative number.)`,
                given: {
                    "Own-price elasticity $η_p$": n(eta),
                    "Change in price": pct(change),
                },
                answer,
                explanation: String.raw`$\eta_p = \frac{\Delta q / q}{\Delta p / p}$, so $\Delta q / q = \eta_p \cdot \Delta p / p$. Substituting: ${n(eta)} · ${pct(change)} = ${pct(answer)}. With $|\eta_p|$ = ${n(Math.abs(eta))} demand is ${Math.abs(eta) > 1 ? "elastic" : "inelastic"}: the quantity reacts ${Math.abs(eta) > 1 ? "more" : "less"} than proportionally to the price, so the price ${up ? "rise" : "cut"} ${Math.abs(eta) > 1 ? (up ? "lowers" : "raises") : up ? "raises" : "lowers"} total revenue.`,
            };
        },
    },

    // --------------------------------------------------- production & costs
    {
        id: "e1-prod-mrts-at-point",
        subject: "econ1",
        topic: "production_costs",
        difficulty: "medium",
        kind: "numeric",
        unit: "ratio",
        source: "TUM Economics I Exercise Exam WT22/23, Q19",
        build: (rng) => {
            const s = rng.pick(E1_PROD_MRTS_AT_POINT_SCENARIOS);
            const a = rng.pick([2, 3, 4]);
            const L = rng.int(2, 8);
            const K = Math.ceil((3 * L) / a) + rng.int(0, 6); // a K > 2 L by construction
            const answer = (a * K - 2 * L) / (a * L);
            return {
                prompt: String.raw`${s.who} produces with the technology $Q = ${co(a)}K L - L^2$, where $L$ is labour and $K$ is capital. It currently uses $K$ = ${n(K)} ${s.capital} and $L$ = ${n(L)} workers. What is the absolute value of $MRTS_{L,K}$ at this input combination?`,
                given: {
                    "Technology": String.raw`$Q = ${co(a)}K L - L^2$`,
                    "Capital K": n(K),
                    "Labour L": n(L),
                },
                answer,
                explanation: String.raw`$MRTS_{L,K} = \frac{MP_L}{MP_K}$ - the slope of the isoquant, i.e. how much capital one extra worker replaces. The marginal products are $MP_L = ${co(a)}K - 2 L$ and $MP_K = ${co(a)}L$. At (K, L) = (${n(K)}, ${n(L)}): $MP_L$ = ${n(a)} · ${n(K)} − 2 · ${n(L)} = ${n(a * K - 2 * L)} and $MP_K$ = ${n(a)} · ${n(L)} = ${n(a * L)}. So $MRTS_{L,K}$ = ${n(a * K - 2 * L)} / ${n(a * L)} = ${n2(answer)} units of capital per worker. It falls as $L$ rises - the isoquants are convex.`,
                hint: String.raw`The marginal rate of technical substitution is the slope of the isoquant: how much capital one extra worker replaces at constant output, $MRTS_{L,K} = \frac{MP_L}{MP_K}$.`,
            };
        },
    },
    {
        id: "e1-prod-average-product-at-point",
        subject: "econ1",
        topic: "production_costs",
        difficulty: "easy",
        kind: "numeric",
        unit: "units",
        source: "TUM Economics I Exercise Exam WT22/23, Q19",
        build: (rng) => {
            const s = rng.pick(E1_PROD_AVERAGE_PRODUCT_AT_POINT_SCENARIOS);
            const a = rng.pick([2, 3, 4]);
            const L = rng.int(2, 8);
            const K = Math.ceil((3 * L) / a) + rng.int(0, 6);
            const answer = a * K - L;
            return {
                prompt: String.raw`${s.who} produces $Q = ${co(a)}K L - L^2$ ${s.unit} per shift with $L$ workers and $K$ machines. Today it runs ${n(K)} machines and ${n(L)} workers. What is the **average product of labour** at this input combination, in ${s.unit} per worker?`,
                given: {
                    "Technology": String.raw`$Q = ${co(a)}K L - L^2$`,
                    "Capital K": n(K),
                    "Labour L": n(L),
                },
                answer,
                explanation: String.raw`$AP_L = \frac{Q}{L}$. Dividing the technology by $L$ gives $AP_L = ${co(a)}K - L$, so the machine stock lifts the average product while extra workers erode it. Output today: $Q$ = ${n(a)} · ${n(K)} · ${n(L)} − ${n(L)}² = ${n(a * K * L - L * L)} ${s.unit}, and $AP_L$ = ${n(a * K * L - L * L)} / ${n(L)} = ${n(answer)} ${s.unit} per worker. The marginal product $MP_L = ${co(a)}K - 2 L$ = ${n(a * K - 2 * L)} is below it, so hiring one more worker would pull the average down.`,
            };
        },
    },
    {
        id: "e1-prod-returns-to-scale-factor",
        subject: "econ1",
        topic: "production_costs",
        difficulty: "easy",
        kind: "numeric",
        unit: "ratio",
        source: "TUM Economics I Exercise Exam WT22/23, Q20",
        build: (rng) => {
            const s = rng.pick(E1_PROD_RETURNS_TO_SCALE_FACTOR_SCENARIOS);
            const [an, ad, bn, bd] = rng.pick([
                [1, 2, 1, 2],
                [1, 4, 1, 4],
                [1, 3, 1, 3],
                [1, 2, 1, 4],
                [3, 4, 1, 2],
                [2, 3, 2, 3],
                [1, 1, 1, 1],
            ] as const);
            const lambda = rng.pick([2, 3, 4]);
            const sumNum = an * bd + bn * ad;
            const sumDen = ad * bd;
            const g = gcd(sumNum, sumDen);
            const sum = sumNum / sumDen;
            const answer = lambda ** sum;
            const kind = sum > 1 ? "increasing" : sum < 1 ? "decreasing" : "constant";
            return {
                prompt: String.raw`${s.who} produces with $Q = ${powTex("L", an, ad)} \cdot ${powTex("K", bn, bd)}$. It ${lambda === 2 ? "doubles" : lambda === 3 ? "triples" : "quadruples"} **both** inputs, so labour and capital are each multiplied by ${n(lambda)}. By what factor does output change?`,
                given: {
                    "Technology": String.raw`$Q = ${powTex("L", an, ad)} \cdot ${powTex("K", bn, bd)}$`,
                    "Input factor λ": n(lambda),
                },
                answer,
                explanation: String.raw`$\frac{Q(\lambda L, \lambda K)}{Q(L, K)} = \lambda^{\alpha + \beta}$ for a Cobb-Douglas technology $Q = L^{\alpha} K^{\beta}$: each input contributes $\lambda^{\text{its exponent}}$. Here $\alpha + \beta = ${fracTex(an, ad)} + ${fracTex(bn, bd)} = ${fracTex(sumNum / g, sumDen / g)}$, so output grows by the factor $\lambda^{\alpha + \beta} = ${n(lambda)}^{${fracTex(sumNum / g, sumDen / g)}}$ = ${n2(answer)}. Because the exponents sum to ${sum === 1 ? "exactly 1" : sum > 1 ? "more than 1" : "less than 1"}, the technology has ${kind} returns to scale.`,
            };
        },
    },
    {
        id: "e1-prod-cost-min-labor-bilinear",
        subject: "econ1",
        topic: "production_costs",
        difficulty: "medium",
        kind: "numeric",
        unit: "units",
        source: "TUM Economics I Exam WS19/20, P20",
        build: (rng) => {
            const sc = rng.pick(E1_PROD_COST_MIN_LABOR_BILINEAR_SCENARIOS);
            const c = rng.pick([1, 2, 3, 4]);
            const r = rng.pick([4, 5, 10]);
            const s = rng.int(1, 3); // wage-rental ratio w / r
            const w = s * r;
            const answer = rng.int(3, 12); // L*, drawn first so the root is clean
            const K = s * answer;
            const Q = c * answer * K;
            return {
                prompt: String.raw`${sc.who} produces with $q = ${co(c)}L K$, where $L$ is labour and $K$ is capital. A unit of labour costs ${eur(w)}, a unit of capital ${eur(r)}. The firm has to deliver ${n(Q)} units and wants to do so at minimum cost. How much **labour** does it hire?`,
                given: {
                    "Technology": String.raw`$q = ${co(c)}L K$`,
                    "Wage w": eur(w),
                    "Rental rate r": eur(r),
                    "Required output": `${n(Q)} units`,
                },
                answer,
                explanation: String.raw`$MRTS_{L,K} = \frac{K}{L} = \frac{w}{r}$ at the cost minimum: $MP_L = c K$ and $MP_K = c L$, so the isoquant slope $K / L$ has to match the price ratio. Here $K$ = ${eur(w)} / ${eur(r)} · $L$ = ${n(s)} $L$. Substituting into the technology: ${n(Q)} = ${n(c)} · ${n(s)} · $L^2$, hence $L^* = \sqrt{\frac{\bar q \, r}{c \, w}}$ = √(${n(Q)} / ${n(c * s)}) = ${n(answer)} units of labour, with $K^*$ = ${n(K)}. Cheaper capital would tilt the mix towards capital and away from labour.`,
            };
        },
    },
    {
        id: "e1-prod-min-cost-bilinear",
        subject: "econ1",
        topic: "production_costs",
        difficulty: "medium",
        kind: "numeric",
        unit: "EUR",
        source: "TUM Economics I Exam WS19/20, P21",
        build: (rng) => {
            const sc = rng.pick(E1_PROD_MIN_COST_BILINEAR_SCENARIOS);
            const c = rng.pick([1, 2, 3, 4]);
            const r = rng.pick([4, 5, 10]);
            const s = rng.int(1, 3);
            const w = s * r;
            const L = rng.int(3, 12);
            const K = s * L;
            const Q = c * L * K;
            const answer = w * L + r * K; // = 2 sqrt(Q w r / c)
            return {
                prompt: String.raw`${sc.who} produces with $q = ${co(c)}L K$ from labour $L$ at ${eur(w)} per unit and capital $K$ at ${eur(r)} per unit. What is the **minimum cost** of producing ${n(Q)} units?`,
                given: {
                    "Technology": String.raw`$q = ${co(c)}L K$`,
                    "Wage w": eur(w),
                    "Rental rate r": eur(r),
                    "Required output": `${n(Q)} units`,
                },
                answer,
                explanation: String.raw`$C(\bar q) = w L^* + r K^*$, with the cost-minimising inputs from $\frac{K}{L} = \frac{w}{r}$ and the isoquant. From $K = ${co(s)}L$ and ${n(Q)} = ${n(c)} · ${n(s)} · $L^2$: $L^*$ = ${n(L)} and $K^*$ = ${n(K)}. Cost: ${eur(w)} · ${n(L)} + ${eur(r)} · ${n(K)} = ${eur(answer)}. Equivalently $C(\bar q) = 2 \sqrt{\frac{\bar q \, w \, r}{c}}$ - labour and capital each absorb exactly half of the bill at the optimum.`,
            };
        },
    },
    {
        id: "e1-prod-min-cost-cobb-douglas",
        subject: "econ1",
        topic: "production_costs",
        difficulty: "medium",
        kind: "numeric",
        unit: "EUR",
        source: "TUM Economics I eTest W20/21, Q32",
        build: (rng) => {
            const s = rng.pick(E1_PROD_MIN_COST_COBB_DOUGLAS_SCENARIOS);
            const [w, r] = rng.pick([
                [3, 12],
                [4, 9],
                [4, 16],
                [5, 20],
                [6, 24],
                [8, 18],
                [9, 16],
                [12, 27],
                [2, 18],
            ] as const);
            const root = Math.round(Math.sqrt(w * r)); // exact by construction
            const A = rng.pick([2, 3, 4, 5].filter((d) => (2 * root) % d === 0));
            const t = rng.int(10, 40);
            const Q = A * t;
            const answer = 2 * root * t; // = (2 sqrt(w r) / A) * Q
            return {
                prompt: String.raw`${s.who} produces with $Q = ${n(A)} \, L^{1/2} K^{1/2}$. Labour costs ${eur(w)} per unit, capital ${eur(r)} per unit, and there are no other costs. What is the **minimum cost** of producing ${n(Q)} tonnes?`,
                given: {
                    "Technology": String.raw`$Q = ${n(A)} \, L^{1/2} K^{1/2}$`,
                    "Wage w": eur(w),
                    "Rental rate r": eur(r),
                    "Required output": `${n(Q)} tonnes`,
                },
                answer,
                explanation: String.raw`$C(Q) = \frac{2 \sqrt{w r}}{A} \cdot Q$. Cost minimisation sets $MRTS_{L,K} = \frac{K}{L} = \frac{w}{r}$; substituting $K = \frac{w}{r} L$ into the technology gives $L^* = \frac{Q}{A} \sqrt{\frac{r}{w}}$ and $K^* = \frac{Q}{A} \sqrt{\frac{w}{r}}$, and the two input bills are equal. Here $\sqrt{w r}$ = √(${n(w)} · ${n(r)}) = ${n(root)}, so cost per tonne is 2 · ${n(root)} / ${n(A)} = ${eur((2 * root) / A)} and the total is ${eur((2 * root) / A)} · ${n(Q)} = ${eur(answer)}. Unit cost is constant - the technology has constant returns to scale.`,
            };
        },
    },
    {
        id: "e1-prod-output-from-budget",
        subject: "econ1",
        topic: "production_costs",
        difficulty: "hard",
        kind: "numeric",
        unit: "units",
        source: "TUM Economics I Exam WS19/20, P23",
        build: (rng) => {
            const s = rng.pick(E1_PROD_OUTPUT_FROM_BUDGET_SCENARIOS);
            const c = rng.pick([1, 3, 4, 5]);
            const w = rng.int(2, 12);
            const r = rng.int(2, 12);
            const lcm = (w * r) / gcd(w, r);
            // output is c k^2 lcm / gcd(w, r); pick k so output and budget both stay plausible
            const scale = (c * lcm) / gcd(w, r);
            const lo = Math.max(1, Math.ceil(Math.sqrt(50 / scale)), Math.ceil(60 / lcm));
            const hi = Math.max(lo, Math.floor(Math.sqrt(9000 / scale)));
            const k = rng.int(lo, hi);
            const B = 2 * lcm * k;
            const L = B / (2 * w);
            const K = B / (2 * r);
            const answer = c * L * K; // = c B^2 / (4 w r)
            return {
                prompt: String.raw`${s.who} produces with $q = ${co(c)}L K$ from labour $L$ at ${eur(w)} per unit and capital $K$ at ${eur(r)} per unit. It spends a budget of ${eur(B)} in full and splits it between the two inputs so that output is as large as possible. How many units does it produce?`,
                given: {
                    "Technology": String.raw`$q = ${co(c)}L K$`,
                    "Wage w": eur(w),
                    "Rental rate r": eur(r),
                    "Budget B": eur(B),
                },
                answer,
                explanation: String.raw`$q = c \cdot \frac{B}{2w} \cdot \frac{B}{2r}$. Maximising $c L K$ on the budget line $w L + r K = B$ requires $\frac{MP_L}{MP_K} = \frac{K}{L} = \frac{w}{r}$, which means each input absorbs exactly half of the budget: $L = \frac{B}{2w}$ = ${n(L)} and $K = \frac{B}{2r}$ = ${n(K)}. Output: ${n(c)} · ${n(L)} · ${n(K)} = ${n(answer)} units. Equivalently $q = \frac{c B^2}{4 w r}$ - output grows with the **square** of the budget here, because both inputs expand together.`,
            };
        },
    },
    {
        id: "e1-prod-zero-profit-price",
        subject: "econ1",
        topic: "production_costs",
        difficulty: "medium",
        kind: "numeric",
        unit: "EUR",
        source: "TUM Economics I Exam WS19/20, P24",
        build: (rng) => {
            const sc = rng.pick(E1_PROD_ZERO_PROFIT_PRICE_SCENARIOS);
            const c = rng.pick([1, 2]);
            const r = rng.pick([5, 10, 20]);
            const s = rng.int(1, 3);
            const w = s * r;
            const L = rng.int(3, 8);
            const K = s * L;
            const Q = c * L * K;
            const cost = w * L + r * K;
            const answer = cost / Q; // = 2 sqrt(w r / (c q))
            return {
                prompt: String.raw`${sc.who} produces with $q = ${co(c)}L K$, hiring labour at ${eur(w)} per unit and capital at ${eur(r)} per unit, and it makes ${n(Q)} ${sc.units} at minimum cost. It sells at a price it cannot influence. At which **output price** is its profit exactly zero?`,
                given: {
                    "Technology": String.raw`$q = ${co(c)}L K$`,
                    "Wage w": eur(w),
                    "Rental rate r": eur(r),
                    "Output": `${n(Q)} ${sc.units}`,
                },
                answer,
                explanation: String.raw`$\hat{p} = \frac{C(\bar q)}{\bar q}$ - profit $\hat p \, \bar q - C(\bar q)$ vanishes exactly at average cost. Cost minimisation ($\frac{K}{L} = \frac{w}{r}$) gives $K = ${co(s)}L$, and ${n(Q)} = ${n(c)} · ${n(s)} · $L^2$ gives $L^*$ = ${n(L)}, $K^*$ = ${n(K)}, so $C$ = ${eur(w)} · ${n(L)} + ${eur(r)} · ${n(K)} = ${eur(cost)}. Hence $\hat p$ = ${eur(cost)} / ${n(Q)} = ${eur(answer)}, which is also $2 \sqrt{\frac{w \, r}{c \, \bar q}}$. Below this price ${sc.short} makes a loss on every ${sc.one}.`,
            };
        },
    },
    {
        id: "e1-prod-marginal-cost-from-technology",
        subject: "econ1",
        topic: "production_costs",
        difficulty: "hard",
        kind: "numeric",
        unit: "EUR",
        source: "TUM Principles of Economics Exercise Exam WS20/21, P13",
        build: (rng) => {
            const s = rng.pick(E1_PROD_MARGINAL_COST_FROM_TECHNOLOGY_SCENARIOS);
            const [w, r] = rng.pick([
                [2, 8],
                [3, 12],
                [4, 9],
                [4, 16],
                [5, 20],
                [6, 24],
                [8, 18],
                [9, 16],
            ] as const);
            const root = Math.round(Math.sqrt(w * r));
            const q0 = rng.int(2, 12);
            const answer = 4 * root * q0;
            return {
                prompt: String.raw`${s.who} produces with $q = (L K)^{1/4}$, paying ${eur(w)} per unit of labour and ${eur(r)} per unit of capital, and it always chooses the cheapest input mix for whatever output it makes. What are its **marginal costs** at an output of ${n(q0)} units?`,
                given: {
                    "Technology": String.raw`$q = (L K)^{1/4}$`,
                    "Wage w": eur(w),
                    "Rental rate r": eur(r),
                    "Output q": `${n(q0)} units`,
                },
                answer,
                explanation: String.raw`$MC(q) = 4 \sqrt{w r} \cdot q$. Cost minimisation gives $\frac{K}{L} = \frac{w}{r}$; with $L K = q^4$ that means $L = q^2 \sqrt{\frac{r}{w}}$ and $K = q^2 \sqrt{\frac{w}{r}}$, so $C(q) = w L + r K = 2 \sqrt{w r} \, q^2$ and $MC = \frac{dC}{dq} = 4 \sqrt{w r} \, q$. Here $\sqrt{w r}$ = √(${n(w)} · ${n(r)}) = ${n(root)}, so $MC$ = 4 · ${n(root)} · ${n(q0)} = ${eur(answer)}. Marginal cost rises linearly - the technology has decreasing returns to scale, since the exponents sum to $\frac{1}{2}$.`,
            };
        },
    },
    {
        id: "e1-prod-unit-cost-crs",
        subject: "econ1",
        topic: "production_costs",
        difficulty: "hard",
        kind: "numeric",
        unit: "EUR",
        source: "TUM Economics I eTest W20/21, Q34",
        build: (rng) => {
            const s = rng.pick(E1_PROD_UNIT_COST_CRS_SCENARIOS);
            const [w, r] = rng.pick([
                [3, 12],
                [4, 9],
                [4, 16],
                [5, 20],
                [6, 24],
                [9, 16],
                [12, 27],
                [2, 18],
                [3, 27],
                [7, 28],
                [9, 25],
                [10, 40],
                [8, 32],
            ] as const);
            const root = Math.round(Math.sqrt(w * r));
            const A = rng.pick([2, 3, 4, 5].filter((d) => (2 * root) % d === 0));
            const answer = (2 * root) / A;
            return {
                prompt: String.raw`${s.who} produces with $Q = ${n(A)} \, L^{1/2} K^{1/2}$, paying ${eur(w)} per unit of labour and ${eur(r)} per unit of capital. It has no fixed costs and takes the market price as given. Below which **output price** would it be better off producing nothing at all?`,
                given: {
                    "Technology": String.raw`$Q = ${n(A)} \, L^{1/2} K^{1/2}$`,
                    "Wage w": eur(w),
                    "Rental rate r": eur(r),
                },
                answer,
                explanation: String.raw`$\underline{p} = \frac{2 \sqrt{w r}}{A}$ - the constant unit cost. Cost minimisation ($\frac{K}{L} = \frac{w}{r}$) turns the technology into $C(Q) = \frac{2 \sqrt{w r}}{A} \, Q$: with constant returns to scale, average and marginal cost coincide and never change with output. Here $\sqrt{w r}$ = √(${n(w)} · ${n(r)}) = ${n(root)}, so unit cost is 2 · ${n(root)} / ${n(A)} = ${eur(answer)}. Below that price every unit loses money and ${s.short} shuts down; above it profit grows without bound, and exactly at it any quantity yields zero profit.`,
            };
        },
    },

    // ---------------------------------------------------- perfect competition
    {
        id: "e1-pc-shortrun-supply-from-mc",
        subject: "econ1",
        topic: "perfect_competition",
        difficulty: "easy",
        kind: "numeric",
        unit: "units",
        source: "TUM Principles of Economics Exercise Exam WS20/21, P14",
        build: (rng) => {
            const s = rng.pick(E1_PC_SHORTRUN_SUPPLY_FROM_MC_SCENARIOS);
            const k = rng.pick([2, 4, 5, 8, 10, 20, 25]); // slope of MC
            const q = rng.int(6, 14);
            const p = k * q; // price is a multiple of k, so q* is an integer
            const F = rng.int(2, 12) * 10;
            return {
                prompt: String.raw`${s.who} has the variable cost $C_v(q) = ${n(k / 2)} q^2$, where $q$ is the number of ${s.units} ${s.made} per season, and pays a fixed rent of ${eur(F)} per season. The market price is ${eur(p)} per ${s.one}. How many ${s.units} does ${s.short} ${s.verb} at its short-run profit-maximizing output?`,
                given: {
                    "Variable cost": String.raw`$C_v(q) = ${n(k / 2)} q^2$`,
                    "Fixed rent": eur(F),
                    "Market price p": eur(p),
                },
                answer: q,
                explanation: String.raw`A price taker produces where $p = MC(q)$ - the fixed cost never enters this condition. Marginal cost here is $MC(q) = ${co(k)}q$, so $${co(k)}q = ${n(p)}$ gives $q^*$ = ${n(p)} / ${n(k)} = ${n(q)} ${s.units}. ${cap(s.short)} also stays open: average variable cost $AVC = ${n(k / 2)} q$ approaches 0 as $q \to 0$, so every positive price lies above the shut-down point. The rent of ${eur(F)} is sunk in the short run and only shifts the profit level, never the optimal quantity.`,
            };
        },
    },
    {
        id: "e1-pc-threshold-price-no-linear",
        subject: "econ1",
        topic: "perfect_competition",
        difficulty: "medium",
        kind: "numeric",
        unit: "EUR",
        source: "TUM Principles of Economics Exercise Exam WS20/21, P15",
        build: (rng) => {
            const s = rng.pick(E1_PC_THRESHOLD_PRICE_NO_LINEAR_SCENARIOS);
            const a = rng.pick([1, 2, 4, 5, 10]); // cost curvature
            const qm = rng.int(3, 9); // efficient scale sqrt(F/a)
            const F = a * qm * qm; // makes F/a a perfect square
            const answer = 2 * a * qm; // min AC = 2 sqrt(a F)
            return {
                prompt: String.raw`${s.who} has the long-run cost $C(q) = ${co(a)}q^2 + ${n(F)}$ for $q > 0$, and $C(0) = 0$. It is a price taker. Above which market price per ${s.one} does it stay in the market?`,
                given: {
                    "Long-run cost": String.raw`$C(q) = ${co(a)}q^2 + ${n(F)}$ for $q > 0$`,
                    "Cost when closed": String.raw`$C(0) = 0$`,
                },
                answer,
                explanation: String.raw`The long-run threshold is the minimum of average cost, $\bar p = \min AC = 2 \sqrt{a F}$. Average cost is $AC(q) = ${co(a)}q + \frac{${n(F)}}{q}$; it is minimal where $${n(a)} = \frac{${n(F)}}{q^2}$, i.e. at the efficient scale $q^* = \sqrt{F / a}$ = ${n(qm)} ${s.units}. There $AC$ = ${n(a)} · ${n(qm)} + ${n(F)} / ${n(qm)} = ${eur(answer)}. Below that price no output level covers average cost, so ${s.short} closes; above it, it earns a positive profit.`,
                hint: String.raw`Staying pays only if some output covers its full average cost, so the threshold sits at the minimum of $AC(q) = \frac{C(q)}{q}$ - the efficient scale, where $MC = AC$.`,
            };
        },
    },
    {
        id: "e1-pc-shutdown-price",
        subject: "econ1",
        topic: "perfect_competition",
        difficulty: "easy",
        kind: "numeric",
        unit: "EUR",
        source: "TUM Economics I eTest W20/21, Q37",
        build: (rng) => {
            const s = rng.pick(E1_PC_SHUTDOWN_PRICE_SCENARIOS);
            const a = rng.pick([1, 2, 3, 4, 5]);
            const qm = rng.int(3, 10);
            const F = a * qm * qm;
            const b = rng.int(4, 30); // min AVC
            const lr = b + 2 * a * qm; // long-run break-even price
            return {
                prompt: String.raw`${s.who} has the short-run cost $C(q) = ${co(a)}q^2 + ${co(b)}q + ${n(F)}$, where ${eur(F)} is the fixed cost of the plant and cannot be recovered this season. Below which market price per ${s.one} does ${s.short} stop producing altogether in the **short run**?`,
                given: {
                    "Cost function": String.raw`$C(q) = ${co(a)}q^2 + ${co(b)}q + ${n(F)}$`,
                    "Fixed cost": eur(F),
                },
                answer: b,
                explanation: String.raw`In the short run the fixed cost is sunk, so the firm produces as long as the price covers average variable cost: the shut-down price is $p_{\text{shut}} = \min AVC$. Here $AVC(q) = ${co(a)}q + ${n(b)}$ rises in $q$, so its lowest value is reached as $q \to 0$ and equals ${eur(b)}. Check it directly: the optimum is $q^* = \frac{p - ${n(b)}}{${n(2 * a)}}$, where $AVC = \frac{p + ${n(b)}}{2}$, and $p \geq \frac{p + ${n(b)}}{2}$ holds exactly for $p \geq$ ${eur(b)}. The **long-run** threshold is higher, because there the fixed cost has to be earned as well: $b + 2\sqrt{a F}$ = ${eur(lr)}.`,
                hint: String.raw`A cost the firm carries whether or not it produces cannot be escaped by closing, so in the short run it keeps producing as long as the price covers average variable cost: $p_{\text{shut}} = \min AVC$ with $AVC(q) = \frac{C_v(q)}{q}$.`,
            };
        },
    },
    {
        id: "e1-pc-shortrun-profit-positive",
        subject: "econ1",
        topic: "perfect_competition",
        difficulty: "medium",
        kind: "numeric",
        unit: "EUR",
        source: "TUM Economics I Exam WS19/20, P25",
        build: (rng) => {
            const s = rng.pick(E1_PC_SHORTRUN_PROFIT_POSITIVE_SCENARIOS);
            const a = rng.pick([1, 2, 3, 4, 5]);
            const qm = rng.int(2, 8); // break-even output
            const F = a * qm * qm;
            const b = rng.int(3, 15);
            const q = qm + rng.int(1, 6); // above the break-even scale
            const p = b + 2 * a * q; // price set so MC = p at q
            const answer = a * (q * q - qm * qm); // = a q^2 - F > 0
            return {
                prompt: String.raw`${s.who} is one of many price takers and has the cost function $C(q) = ${co(a)}q^2 + ${co(b)}q + ${n(F)}$, with $q$ measured in ${s.units} per week. The market price is ${eur(p)} per ${s.one}. What weekly profit does ${s.short} earn at its optimal output? (A loss would be a negative number.)`,
                given: {
                    "Cost function": String.raw`$C(q) = ${co(a)}q^2 + ${co(b)}q + ${n(F)}$`,
                    "Market price p": eur(p),
                },
                answer,
                explanation: String.raw`Profit at the optimum is $\pi = p \, q^* - C(q^*)$, where $q^*$ solves $p = MC(q)$. With $MC(q) = ${n(2 * a)} q + ${n(b)}$, the condition $${n(2 * a)} q + ${n(b)} = ${n(p)}$ gives $q^*$ = ${n(q)} ${s.unitsShort}. Revenue is ${eur(p)} · ${n(q)} = ${eur(p * q)}, cost is ${n(a)} · ${n(q * q)} + ${n(b)} · ${n(q)} + ${n(F)} = ${eur(a * q * q + b * q + F)}, so the profit is ${eur(answer)}. The price lies above the break-even price $b + 2\sqrt{a F}$ = ${eur(b + 2 * a * qm)}, which is why the profit is positive rather than a loss.`,
            };
        },
    },
    {
        id: "e1-pc-longrun-quantity-at-price",
        subject: "econ1",
        topic: "perfect_competition",
        difficulty: "hard",
        kind: "numeric",
        unit: "units",
        source: "TUM Economics I eTest W20/21, Q38",
        build: (rng) => {
            const s = rng.pick(E1_PC_LONGRUN_QUANTITY_AT_PRICE_SCENARIOS);
            const a = rng.pick([1, 2, 3, 4, 5]);
            const qm = rng.int(2, 8);
            const F = a * qm * qm;
            const b = rng.int(3, 15);
            const pBar = b + 2 * a * qm; // long-run break-even price
            const above = rng.int(0, 1) === 1;
            // q only sets the price when the firm is below the threshold
            const q = above ? qm + rng.int(1, 6) : rng.int(1, qm - 1);
            const p = b + 2 * a * q;
            const answer = above ? q : 0;
            return {
                prompt: String.raw`${s.who} is a price taker with the **long-run** cost $C(q) = ${co(a)}q^2 + ${co(b)}q + ${n(F)}$ for $q > 0$ and $C(0) = 0$. The price is ${eur(p)} per ${s.one}. How many ${s.units} does ${s.short} produce in the long run? Enter 0 if it leaves the market.`,
                given: {
                    "Long-run cost": String.raw`$C(q) = ${co(a)}q^2 + ${co(b)}q + ${n(F)}$ for $q > 0$`,
                    "Cost when closed": String.raw`$C(0) = 0$`,
                    "Market price p": eur(p),
                },
                answer,
                explanation: above
                    ? String.raw`The firm stays only if $p \geq \bar p = b + 2\sqrt{a F}$, and then produces where $p = MC(q)$. The threshold is ${n(b)} + 2 · √(${n(a)} · ${n(F)}) = ${eur(pBar)}, and the price of ${eur(p)} lies **above** it, so ${s.short} produces. From $MC(q) = ${n(2 * a)} q + ${n(b)} = ${n(p)}$: $q^* = \frac{p - ${n(b)}}{${n(2 * a)}}$ = ${n(q)} ${s.units}. At that output average cost is exactly covered plus a margin, so staying beats exiting.`
                    : String.raw`The firm stays only if $p \geq \bar p = b + 2\sqrt{a F}$, and then produces where $p = MC(q)$. The threshold is ${n(b)} + 2 · √(${n(a)} · ${n(F)}) = ${eur(pBar)}, and the price of ${eur(p)} lies **below** it. Producing where $MC = p$ would give ${n(q)} ${q === 1 ? s.oneShort : s.units}, but there average cost is ${eur((a * q * q + b * q + F) / q)} > ${eur(p)}, so every ${s.oneShort} loses money and the whole ${eur(F)} of overhead is avoidable. ${cap(s.short)} therefore leaves the market and produces nothing.`,
                hint: String.raw`In the long run a firm stays only if the price reaches the minimum of average cost, $\bar p = \min AC$; if it does, output follows from $p = MC(q)$, otherwise the firm exits.`,
            };
        },
    },
    {
        id: "e1-pc-lr-price-with-fixed-cost",
        subject: "econ1",
        topic: "perfect_competition",
        difficulty: "medium",
        kind: "numeric",
        unit: "EUR",
        source: "TUM Principles of Economics Exercise Exam WS20/21, P18",
        build: (rng) => {
            const s = rng.pick(E1_PC_LR_PRICE_WITH_FIXED_COST_SCENARIOS);
            const c = rng.pick([1, 2, 3, 4]);
            const qm = rng.int(2, 9); // efficient scale sqrt(F/c)
            const F = c * qm * qm;
            const b = rng.int(2, 12);
            const answer = b + 2 * c * qm; // min AC = b + 2 sqrt(F c)
            return {
                prompt: String.raw`${s.who} works with the same cost function $C(q) = ${n(F)} + ${co(b)}q + ${co(c)}q^2$ for $q > 0$, and $C(0) = 0$. Firms enter and leave the market freely. Which price per ${s.one} prevails in the long-run equilibrium?`,
                given: {
                    "Cost per firm": String.raw`$C(q) = ${n(F)} + ${co(b)}q + ${co(c)}q^2$ for $q > 0$`,
                    "Market structure": "perfect competition, free entry and exit",
                },
                answer,
                explanation: String.raw`Free entry pushes profits to zero, so the long-run price equals minimum average cost: $p^* = \min AC = b + 2\sqrt{F c}$. Average cost is $AC(q) = \frac{${n(F)}}{q} + ${n(b)} + ${co(c)}q$, minimal where $\frac{${n(F)}}{q^2} = ${n(c)}$, i.e. at $q^*$ = ${n(qm)} ${s.units}. There $AC$ = ${n(F)} / ${n(qm)} + ${n(b)} + ${n(c)} · ${n(qm)} = ${eur(answer)}. Note that no demand curve was needed: demand fixes how **many** firms operate, but the long-run price is pinned down by the cost function alone.`,
            };
        },
    },
    {
        id: "e1-pc-lr-number-of-firms-linear-term",
        subject: "econ1",
        topic: "perfect_competition",
        difficulty: "medium",
        kind: "numeric",
        unit: "number",
        source: "TUM Principles of Economics Exercise Exam WS20/21, P16",
        build: (rng) => {
            const s = rng.pick(E1_PC_LR_NUMBER_OF_FIRMS_LINEAR_TERM_SCENARIOS);
            const c = rng.pick([1, 2, 3, 4]);
            const qm = rng.int(2, 6);
            const F = c * qm * qm;
            const b = rng.int(2, 10);
            const d = rng.int(2, 8); // demand slope
            const pStar = b + 2 * c * qm;
            const nStar = rng.int(8, 40);
            const A = nStar * qm + d * pStar; // demand intercept built from n*
            return {
                prompt: String.raw`${s.who} all share the cost function $C(q) = ${n(F)} + ${co(b)}q + ${co(c)}q^2$ for $q > 0$ and $C(0) = 0$, and entry is free. Market demand for ${s.product} is $Q_D = ${n(A)} - ${co(d)}p$, with $q$ and $Q_D$ in ${s.units} per week. How many ${s.firms} are active in the long-run equilibrium?`,
                given: {
                    "Cost per firm": String.raw`$C(q) = ${n(F)} + ${co(b)}q + ${co(c)}q^2$ for $q > 0$`,
                    "Demand": String.raw`$Q_D = ${n(A)} - ${co(d)}p$`,
                },
                answer: nStar,
                explanation: String.raw`With free entry, $n^* = \frac{Q_D(p^*)}{q^*}$, where $p^* = \min AC$ and $q^*$ is the efficient scale. $AC(q) = \frac{${n(F)}}{q} + ${n(b)} + ${co(c)}q$ is minimal at $q^* = \sqrt{F / c}$ = ${n(qm)} ${s.units}, where $p^*$ = ${n(b)} + 2 · ${n(c)} · ${n(qm)} = ${eur(pStar)}. Market demand at that price: ${n(A)} − ${n(d)} · ${n(pStar)} = ${n(nStar * qm)} ${s.units}. Dividing by the output per firm: ${n(nStar * qm)} / ${n(qm)} = ${n(nStar)} ${s.firms}. Each of them earns exactly zero profit, so nobody enters or exits.`,
            };
        },
    },
    {
        id: "e1-pc-lr-producer-surplus",
        subject: "econ1",
        topic: "perfect_competition",
        difficulty: "hard",
        kind: "numeric",
        unit: "EUR",
        source: "TUM Principles of Economics Exercise Exam WS20/21, P17",
        build: (rng) => {
            const s = rng.pick(E1_PC_LR_PRODUCER_SURPLUS_SCENARIOS);
            const c = rng.pick([1, 2, 3, 4]);
            const qm = rng.int(2, 6);
            const F = c * qm * qm;
            const b = rng.int(2, 10);
            const d = rng.int(2, 8);
            const pStar = b + 2 * c * qm;
            const nStar = rng.int(8, 40);
            const A = nStar * qm + d * pStar;
            const answer = nStar * F; // PS = n* F
            return {
                prompt: String.raw`${s.who} all have the cost function $C(q) = ${n(F)} + ${co(b)}q + ${co(c)}q^2$ for $q > 0$ and $C(0) = 0$. Entry is free and market demand is $Q_D = ${n(A)} - ${co(d)}p$ ${s.units} per day. What is the **producer surplus** in the long-run equilibrium?`,
                given: {
                    "Cost per firm": String.raw`$C(q) = ${n(F)} + ${co(b)}q + ${co(c)}q^2$ for $q > 0$`,
                    "Demand": String.raw`$Q_D = ${n(A)} - ${co(d)}p$`,
                },
                answer,
                explanation: String.raw`Producer surplus is revenue minus **variable** cost, $PS = p^* Q^* - VC$, while profit also subtracts the quasi-fixed cost - so the two differ by exactly that cost. Free entry gives $q^* = \sqrt{F / c}$ = ${n(qm)} ${s.units} and $p^* = \min AC$ = ${eur(pStar)}, and demand ${n(A)} − ${n(d)} · ${n(pStar)} = ${n(nStar * qm)} ${s.units} implies $n^*$ = ${n(nStar)} firms. Per firm: revenue ${eur(pStar * qm)} minus variable cost ${n(b)} · ${n(qm)} + ${n(c)} · ${n(qm * qm)} = ${eur(b * qm + c * qm * qm)} leaves ${eur(F)} - precisely the quasi-fixed cost. Total: ${n(nStar)} · ${eur(F)} = ${eur(answer)}. The trap: profits are zero in the long run, but producer surplus is **not**.`,
                hint: String.raw`Producer surplus is revenue minus variable cost only, while profit also subtracts the cost that arises with production but not with output. Free entry fixes $q^* = \arg\min AC$, $p^* = \min AC$ and the number of firms from demand: $PS = p^* Q^* - VC$.`,
            };
        },
    },
    {
        id: "e1-pc-lr-total-surplus",
        subject: "econ1",
        topic: "perfect_competition",
        difficulty: "very_hard",
        kind: "numeric",
        unit: "EUR",
        source: "TUM Principles of Economics Exercise Exam WS20/21, P19",
        build: (rng) => {
            const s = rng.pick(E1_PC_LR_TOTAL_SURPLUS_SCENARIOS);
            const c = rng.pick([1, 2, 3]);
            const qm = rng.int(2, 5);
            const F = c * qm * qm;
            const b = rng.int(2, 10);
            const d = rng.pick([2, 4, 10]); // even, so the CS triangle stays clean
            const k = rng.int(2, 8);
            const nStar = d * k;
            const pStar = b + 2 * c * qm;
            const Q = nStar * qm;
            const A = Q + d * pStar;
            const choke = A / d; // = p* + Q/d
            const CS = 0.5 * (choke - pStar) * Q;
            const PS = nStar * F;
            const answer = CS + PS;
            return {
                prompt: String.raw`${s.who} all have the cost function $C(q) = ${n(F)} + ${co(b)}q + ${co(c)}q^2$ for $q > 0$ and $C(0) = 0$, and entry is free. Inverse market demand is $p = \frac{${n(A)} - Q}{${n(d)}}$, with $Q$ in ${s.units} per day. What is the **total surplus** (consumer plus producer surplus) in the long-run equilibrium?`,
                given: {
                    "Cost per firm": String.raw`$C(q) = ${n(F)} + ${co(b)}q + ${co(c)}q^2$ for $q > 0$`,
                    "Inverse demand": String.raw`$p = \frac{${n(A)} - Q}{${n(d)}}$`,
                },
                answer,
                explanation: String.raw`$TS = CS + PS$, with $CS = \frac{1}{2}\left(p_{max} - p^*\right) Q^*$ and, under free entry, $PS = n^* F$. Efficient scale $q^* = \sqrt{F / c}$ = ${n(qm)} ${s.units} and $p^* = \min AC$ = ${eur(pStar)}. Market quantity: $Q^*$ = ${n(A)} − ${n(d)} · ${n(pStar)} = ${n(Q)} ${s.units}, so $n^*$ = ${n(Q)} / ${n(qm)} = ${n(nStar)} firms. Choke price: $p_{max}$ = ${n(A)} / ${n(d)} = ${eur(choke)}, hence $CS$ = ½ · (${n(choke)} − ${n(pStar)}) · ${n(Q)} = ${eur(CS)}. Producer surplus is not zero even though profits are: $PS$ = ${n(nStar)} · ${eur(F)} = ${eur(PS)}. Total: ${eur(CS)} + ${eur(PS)} = ${eur(answer)}.`,
            };
        },
    },
    {
        id: "e1-pc-market-supply-n-firms",
        subject: "econ1",
        topic: "perfect_competition",
        difficulty: "easy",
        kind: "numeric",
        unit: "units",
        source: "TUM Economics I Exercise Exam WT22/23, Q26",
        build: (rng) => {
            const s = rng.pick(E1_PC_MARKET_SUPPLY_N_FIRMS_SCENARIOS);
            const F = rng.pick([2, 18, 32, 50, 72]); // sqrt(2F) = 2, 6, 8, 10, 12
            const pBar = Math.round(Math.sqrt(2 * F));
            const nF = rng.int(5, 40);
            const p = rng.int(pBar, 5 * pBar);
            const answer = nF * p;
            return {
                prompt: String.raw`${n(nF)} ${s.who} each have the cost function $C(q) = \tfrac{1}{2} q^2 + ${n(F)}$ for $q > 0$ and $C(0) = 0$, with $q$ in ${s.units} ${s.made} per day. The market price is ${eur(p)} per ${s.one}. How many ${s.units} are supplied by the whole industry per day?`,
                given: {
                    [`Cost per ${s.firm}`]: String.raw`$C(q) = \tfrac{1}{2} q^2 + ${n(F)}$ for $q > 0$`,
                    [`Number of ${s.firms} n`]: n(nF),
                    "Market price p": eur(p),
                },
                answer,
                explanation: String.raw`Market supply is $Q_S(p) = n \cdot q(p)$, where each firm sets $p = MC$ but only supplies at all while $p \geq \min AC$. Here $MC(q) = q$, so a producing ${s.firm} offers $q = p$. The threshold is $\min AC = \sqrt{2 F}$ = √(2 · ${n(F)}) = ${eur(pBar)}, and ${eur(p)} is at or above it, so all ${n(nF)} ${s.firms} produce. Each supplies ${n(p)} ${s.units}, giving $Q_S$ = ${n(nF)} · ${n(p)} = ${n(answer)} ${s.units}. Below ${eur(pBar)} the industry supply would jump to zero.`,
            };
        },
    },

    // ---------------------------------------- market equilibrium, surplus, tax
    {
        id: "e1-mkt-equilibrium-quantity",
        subject: "econ1",
        topic: "market_equilibrium",
        difficulty: "very_easy",
        kind: "numeric",
        unit: "units",
        source: "TUM Economics I eTest W20/21, Q11",
        build: (rng) => {
            const sc = rng.pick(E1_MKT_EQUILIBRIUM_QUANTITY_SCENARIOS);
            const p0 = rng.int(1, 4); // supply choke price
            const s = rng.int(3, 8) * 5; // supply slope
            const B = s * p0;
            const gap = rng.int(3, 8);
            const pStar = p0 + gap;
            const Q = s * gap;
            const d = rng.int(2, 7) * 5; // demand slope
            const A = Q + d * pStar;
            return {
                prompt: String.raw`In the market for ${sc.good}, demand is $Q_D = ${n(A)} - ${co(d)}p$ and supply is $Q_S = ${co(s)}p - ${n(B)}$, with quantities in ${sc.units} per week and $p$ in euros per ${sc.one}. How many ${sc.units} are traded in equilibrium?`,
                given: {
                    "Demand": String.raw`$Q_D = ${n(A)} - ${co(d)}p$`,
                    "Supply": String.raw`$Q_S = ${co(s)}p - ${n(B)}$`,
                },
                answer: Q,
                explanation: String.raw`The market clears where $Q_D = Q_S$; solve for $p^*$ and substitute back into either curve. Here $${n(A)} - ${co(d)}p = ${co(s)}p - ${n(B)}$ gives $p^* = \frac{${n(A)} + ${n(B)}}{${n(d)} + ${n(s)}}$ = ${eur(pStar)}. Substituting into supply: $Q^*$ = ${n(s)} · ${n(pStar)} − ${n(B)} = ${n(Q)} ${sc.units}, and demand confirms it: ${n(A)} − ${n(d)} · ${n(pStar)} = ${n(Q)}.`,
            };
        },
    },
    {
        id: "e1-mkt-producer-surplus",
        subject: "econ1",
        topic: "market_equilibrium",
        difficulty: "medium",
        kind: "numeric",
        unit: "EUR",
        source: "TUM Economics I Exercise Exam WT22/23, Q31",
        build: (rng) => {
            const sc = rng.pick(E1_MKT_PRODUCER_SURPLUS_SCENARIOS);
            const p0 = rng.int(1, 4);
            const s = rng.int(3, 8) * 5;
            const B = s * p0;
            const gap = rng.int(3, 8);
            const pStar = p0 + gap;
            const Q = s * gap;
            const d = rng.int(2, 7) * 5;
            const A = Q + d * pStar;
            const answer = 0.5 * gap * Q;
            return {
                prompt: String.raw`${sc.good} are traded in a competitive market with demand $Q_D = ${n(A)} - ${co(d)}p$ and supply $Q_S = ${co(s)}p - ${n(B)}$, quantities in kilograms per day. Compute the **producer surplus** in the market equilibrium.`,
                given: {
                    "Demand": String.raw`$Q_D = ${n(A)} - ${co(d)}p$`,
                    "Supply": String.raw`$Q_S = ${co(s)}p - ${n(B)}$`,
                },
                answer,
                explanation: String.raw`$PS = \frac{1}{2} \left( p^* - p_{min} \right) Q^*$, where $p_{min}$ is the price at which supply starts, i.e. the intercept of the supply curve on the price axis. Setting $Q_S = 0$: $p_{min} = \frac{${n(B)}}{${n(s)}}$ = ${eur(p0)}. Equilibrium: $p^* = \frac{${n(A)} + ${n(B)}}{${n(d)} + ${n(s)}}$ = ${eur(pStar)} with $Q^*$ = ${n(Q)} kg. So $PS$ = ½ · (${n(pStar)} − ${n(p0)}) · ${n(Q)} = ${eur(answer)}. Do not use the whole price ${eur(pStar)} as the height - below ${eur(p0)} nothing is offered at all.`,
            };
        },
    },
    {
        id: "e1-mkt-equilibrium-from-words",
        subject: "econ1",
        topic: "market_equilibrium",
        difficulty: "easy",
        kind: "numeric",
        unit: "EUR",
        source: "TUM Economics I Exam WS19/20, P30",
        build: (rng) => {
            const sc = rng.pick(E1_MKT_EQUILIBRIUM_FROM_WORDS_SCENARIOS);
            const pStar = rng.int(2, 11);
            const s = rng.int(2, 8) * 20; // extra units per euro of price
            const Q0 = rng.int(2, 9) * 50; // offered at a price of zero
            const Q = Q0 + s * pStar;
            const d = rng.int(1, 6) * 20;
            const A = Q + d * pStar;
            return {
                prompt: String.raw`At ${sc.place}, demand for ${sc.good} is $Q_D = ${n(A)} - ${co(d)}p$ ${sc.unitsLong} per market day. ${sc.sellers} behave as follows: at a price of zero they would still offer ${n(Q0)} ${sc.units} (${sc.why}), and every additional euro of price raises the quantity offered by ${n(s)} ${sc.units}. What is the equilibrium price per ${sc.one}?`,
                given: {
                    "Demand": String.raw`$Q_D = ${n(A)} - ${co(d)}p$`,
                    "Offered at a price of zero": `${n(Q0)} ${sc.units}`,
                    "Extra quantity per euro": `${n(s)} ${sc.units}`,
                },
                answer: pStar,
                explanation: String.raw`First turn the words into a supply curve: an intercept plus a slope, $Q_S = Q_0 + s \, p$. Here $Q_S = ${n(Q0)} + ${co(s)}p$. Market clearing $Q_D = Q_S$: $${n(A)} - ${co(d)}p = ${n(Q0)} + ${co(s)}p$, so $p^* = \frac{${n(A)} - ${n(Q0)}}{${n(d)} + ${n(s)}}$ = ${eur(pStar)}. The traded quantity is $Q^*$ = ${n(Q0)} + ${n(s)} · ${n(pStar)} = ${n(Q)} ${sc.units}. Note the supply curve does **not** run through the origin: it already cuts the quantity axis at ${n(Q0)} ${sc.units}.`,
            };
        },
    },
    {
        id: "e1-mkt-ps-trapezoid",
        subject: "econ1",
        topic: "market_equilibrium",
        difficulty: "hard",
        kind: "numeric",
        unit: "EUR",
        source: "TUM Economics I Exam WS19/20, P31",
        build: (rng) => {
            const sc = rng.pick(E1_MKT_PS_TRAPEZOID_SCENARIOS);
            const pStar = rng.int(2, 11);
            const s = rng.int(2, 8) * 20;
            const Q0 = rng.int(2, 9) * 50;
            const Q = Q0 + s * pStar;
            const d = rng.int(1, 6) * 20;
            const A = Q + d * pStar;
            const answer = 0.5 * (Q0 + Q) * pStar;
            const triangle = 0.5 * Q * pStar;
            return {
                prompt: String.raw`Demand for ${sc.good} is $Q_D = ${n(A)} - ${co(d)}p$ ${sc.units} per week. Even at a price of zero ${sc.seller} offers ${n(Q0)} ${sc.units} (${sc.why}), and every additional euro of price raises the quantity offered by ${n(s)} ${sc.units}. What is the **producer surplus** in the market equilibrium?`,
                given: {
                    "Demand": String.raw`$Q_D = ${n(A)} - ${co(d)}p$`,
                    "Offered at a price of zero": `${n(Q0)} ${sc.units}`,
                    "Extra quantity per euro": `${n(s)} ${sc.units}`,
                },
                answer,
                explanation: String.raw`Producer surplus is the area between the price line and the supply curve, and because supply starts at a positive quantity that area is a **trapezoid**: $PS = \frac{1}{2}\left(Q_0 + Q^*\right) p^*$. Supply is $Q_S = ${n(Q0)} + ${co(s)}p$; equating with demand gives $p^* = \frac{${n(A)} - ${n(Q0)}}{${n(d)} + ${n(s)}}$ = ${eur(pStar)} and $Q^*$ = ${n(Q)} ${sc.units}. So $PS$ = ½ · (${n(Q0)} + ${n(Q)}) · ${n(pStar)} = ${eur(answer)}. Treating it as a triangle ½ · ${n(Q)} · ${n(pStar)} = ${eur(triangle)} understates the surplus - the first ${n(Q0)} ${sc.units} would be supplied even for free, and every euro paid for them is surplus.`,
            };
        },
    },
    {
        id: "e1-mkt-elasticity-at-equilibrium",
        subject: "econ1",
        topic: "market_equilibrium",
        difficulty: "medium",
        kind: "numeric",
        unit: "number",
        source: "TUM Economics I Exercise Exam WT22/23, Q33",
        build: (rng) => {
            const s = rng.pick(E1_MKT_ELASTICITY_AT_EQUILIBRIUM_SCENARIOS);
            const Qstar = rng.int(2, 12) * 5;
            const j = rng.int(1, 8);
            const c = (j * Qstar) / 5; // integer, keeps P*/Q* a clean fifth
            const g = rng.pick([1, 2, 3]); // inverse supply slope
            const Pstar = c + g * Qstar;
            const b = rng.pick([1, 2, 4, 5]); // inverse demand slope
            const A = Pstar + b * Qstar;
            const answer = Pstar / (b * Qstar);
            const verdict =
                answer > 1 ? "elastic" : answer < 1 ? "inelastic" : "exactly unit-elastic";
            return {
                prompt: String.raw`The market for ${s.good} has inverse demand $P = ${n(A)} - ${co(b)}Q$ and inverse supply $P = ${n(c)} + ${co(g)}Q$, with $Q$ in ${s.units} per day. What is the **absolute value** of the price elasticity of demand in the market equilibrium?`,
                given: {
                    "Inverse demand": String.raw`$P = ${n(A)} - ${co(b)}Q$`,
                    "Inverse supply": String.raw`$P = ${n(c)} + ${co(g)}Q$`,
                },
                answer,
                explanation: String.raw`$\left| \eta \right| = \left| \frac{dQ}{dP} \right| \cdot \frac{P^*}{Q^*}$, and inverting the demand curve gives $\frac{dQ}{dP} = -\frac{1}{b}$. Equilibrium first: $${n(A)} - ${co(b)}Q = ${n(c)} + ${co(g)}Q$ gives $Q^*$ = ${n(Qstar)} ${s.units} and $P^*$ = ${n(c)} + ${n(g)} · ${n(Qstar)} = ${eur(Pstar)}. So $\left| \eta \right|$ = (1 / ${n(b)}) · ${n(Pstar)} / ${n(Qstar)} = ${n2(answer)}. A value above 1 means demand is elastic, below 1 inelastic - here it is ${verdict}.`,
            };
        },
    },
    {
        id: "e1-mkt-unit-tax-consumer-price",
        subject: "econ1",
        topic: "market_equilibrium",
        difficulty: "hard",
        kind: "numeric",
        unit: "EUR",
        source: "TUM Economics I Exercise Exam WT22/23, Q34",
        build: (rng) => {
            const sc = rng.pick(E1_MKT_UNIT_TAX_CONSUMER_PRICE_SCENARIOS);
            const t = rng.int(2, 8); // per-unit tax
            const p0 = rng.int(1, 6); // supply choke price
            const gap = t + rng.int(4, 14); // keeps the taxed quantity comfortably positive
            const pStar = p0 + gap;
            const tot = rng.pick([10, 20, 25, 50]); // d + s, divides 100 -> clean prices
            const edge = Math.round(tot / 5); // both slopes stay away from zero
            const s = rng.int(edge, tot - edge);
            const d = tot - s;
            const B = s * p0;
            const Q = s * gap;
            const A = Q + d * pStar;
            // p_D = (A + B + s t) / (d + s); tot divides 100, so this is exact to 2 decimals
            const answer = Math.round((pStar + (s * t) / tot) * 100) / 100;
            return {
                prompt: String.raw`In the market for ${sc.good}, demand is $Q_D = ${n(A)} - ${n(d)} p_D$ and supply is $Q_S = ${n(s)} p_S - ${n(B)}$, in ${sc.units} per day. The government levies a per-unit tax of ${eur(t)} **on the producers**, so that $p_S = p_D - ${n(t)}$. What price do consumers pay per ${sc.one} once the market has adjusted?`,
                given: {
                    "Demand": String.raw`$Q_D = ${n(A)} - ${n(d)} p_D$`,
                    "Supply": String.raw`$Q_S = ${n(s)} p_S - ${n(B)}$`,
                    "Per-unit tax t": eur(t),
                },
                answer,
                explanation: String.raw`Clearing the market with the tax gives $p_D = \frac{A + B + s\, t}{d + s}$ - substitute $p_S = p_D - t$ into supply and solve for the consumer price. Here $${n(A)} - ${n(d)} p_D = ${n(s)}\left(p_D - ${n(t)}\right) - ${n(B)}$, so $p_D$ = (${n(A)} + ${n(B)} + ${n(s)} · ${n(t)}) / ${n(tot)} = ${eur(answer)}. Without the tax the price was ${eur(pStar)}, so consumers bear ${eur(answer - pStar)} of the ${eur(t)}; producers receive ${eur(answer - t)} and bear the rest. The side with the less elastic curve carries the larger share, no matter who hands the money to the tax office.`,
            };
        },
    },
    {
        id: "e1-mkt-unit-tax-revenue",
        subject: "econ1",
        topic: "market_equilibrium",
        difficulty: "medium",
        kind: "numeric",
        unit: "EUR",
        source: "TUM Economics I Exercise Exam WT22/23, Q34",
        build: (rng) => {
            const sc = rng.pick(E1_MKT_UNIT_TAX_REVENUE_SCENARIOS);
            const t = rng.int(2, 8);
            const p0 = rng.int(1, 6);
            const gap = t + rng.int(4, 14);
            const pStar = p0 + gap;
            const tot = rng.pick([10, 20, 25, 50]);
            const edge = Math.round(tot / 5);
            const s = rng.int(edge, tot - edge);
            const d = tot - s;
            const B = s * p0;
            const Q = s * gap;
            const A = Q + d * pStar;
            // tot divides 100, so both stay exact to 2 decimals
            const pD = Math.round((pStar + (s * t) / tot) * 100) / 100;
            const Qt = Math.round((Q - (d * s * t) / tot) * 100) / 100; // traded quantity with the tax
            const answer = Math.round(t * Qt * 100) / 100;
            return {
                prompt: String.raw`${sc.good} are traded competitively, with demand $Q_D = ${n(A)} - ${n(d)} p_D$ and supply $Q_S = ${n(s)} p_S - ${n(B)}$ per week. The government introduces a per-unit tax of ${eur(t)} **on the producers**, so that $p_S = p_D - ${n(t)}$. How much tax revenue does it collect per week?`,
                given: {
                    "Demand": String.raw`$Q_D = ${n(A)} - ${n(d)} p_D$`,
                    "Supply": String.raw`$Q_S = ${n(s)} p_S - ${n(B)}$`,
                    "Per-unit tax t": eur(t),
                },
                answer,
                explanation: String.raw`Tax revenue is $T = t \cdot Q_t$, so the traded quantity **after** the tax is what matters. With $p_S = p_D - t$ the consumer price is $p_D = \frac{A + B + s\, t}{d + s}$ = (${n(A)} + ${n(B)} + ${n(s)} · ${n(t)}) / ${n(tot)} = ${eur(pD)}, and $Q_t$ = ${n(A)} − ${n(d)} · ${n(pD)} = ${n2(Qt)} ${sc.units}. Revenue: ${eur(t)} · ${n2(Qt)} = ${eur(answer)}. Using the pre-tax quantity ${n(Q)} instead would overstate the take, because the tax itself shrinks the market.`,
            };
        },
    },
    {
        id: "e1-mkt-total-surplus",
        subject: "econ1",
        topic: "market_equilibrium",
        difficulty: "medium",
        kind: "numeric",
        unit: "EUR",
        source: "TUM Economics I eTest W20/21, Q12",
        build: (rng) => {
            const sc = rng.pick(E1_MKT_TOTAL_SURPLUS_SCENARIOS);
            const s = rng.int(2, 8) * 10; // supply slope
            const dFac = rng.pick([0.5, 1, 2]);
            const d = s * dFac; // demand slope, keeps Q*/d clean
            const p0 = rng.int(1, 4);
            const B = s * p0;
            const gap = rng.int(3, 8);
            const pStar = p0 + gap;
            const Q = s * gap;
            const A = Q + d * pStar;
            const choke = A / d;
            const CS = 0.5 * (choke - pStar) * Q;
            const PS = 0.5 * gap * Q;
            const answer = CS + PS;
            return {
                prompt: String.raw`${sc.good} are traded in a competitive market with demand $Q_D = ${n(A)} - ${co(d)}p$ and supply $Q_S = ${co(s)}p - ${n(B)}$, in ${sc.units} per month. Compute the **total surplus** (consumer plus producer surplus) in the untaxed market equilibrium.`,
                given: {
                    "Demand": String.raw`$Q_D = ${n(A)} - ${co(d)}p$`,
                    "Supply": String.raw`$Q_S = ${co(s)}p - ${n(B)}$`,
                },
                answer,
                explanation: String.raw`$TS = CS + PS = \frac{1}{2}\left(p_{max} - p^*\right) Q^* + \frac{1}{2}\left(p^* - p_{min}\right) Q^*$ - the two triangles that meet at the equilibrium. Equilibrium: $p^* = \frac{${n(A)} + ${n(B)}}{${n(d)} + ${n(s)}}$ = ${eur(pStar)} and $Q^*$ = ${n(Q)} ${sc.units}. Choke price of demand: $p_{max}$ = ${n(A)} / ${n(d)} = ${eur(choke)}, so $CS$ = ½ · (${n(choke)} − ${n(pStar)}) · ${n(Q)} = ${eur(CS)}. Supply starts at $p_{min}$ = ${n(B)} / ${n(s)} = ${eur(p0)}, so $PS$ = ½ · (${n(pStar)} − ${n(p0)}) · ${n(Q)} = ${eur(PS)}. Total: ${eur(CS)} + ${eur(PS)} = ${eur(answer)}.`,
            };
        },
    },

    // --------------------------------------------------------- price controls
    {
        id: "e1-pctl-cap-nonbinding-quantity",
        subject: "econ1",
        topic: "price_controls",
        difficulty: "easy",
        kind: "numeric",
        unit: "units",
        source: "TUM Economics I Exam WS19/20, P28; TUM Economics I eTest W20/21, Q15",
        build: (rng) => {
            const sc = rng.pick(E1_PCTL_CAP_NONBINDING_QUANTITY_SCENARIOS);
            const d = rng.int(2, 6) * 10; // demand slope
            const s = rng.int(2, 6) * 10; // supply slope
            const pStar = rng.int(6, 15); // equilibrium price, integer by construction
            const A = (s + d) * pStar; // demand intercept
            const Qstar = s * pStar;
            const cap = pStar + rng.int(1, 6); // strictly above p*
            return {
                prompt: String.raw`${sc.intro}, daily demand for ${sc.units} is $Q_D = ${n(A)} - ${co(d)}p$ and daily supply is $Q_S = ${co(s)}p$, where $p$ is the ${sc.price} in euros per ${sc.one}. ${sc.authority} sets a maximum ${sc.price} of ${eur(cap)} per ${sc.one}. How many ${sc.units} per day are traded once this price ceiling is in force?`,
                given: {
                    Demand: String.raw`$Q_D = ${n(A)} - ${co(d)}p$`,
                    Supply: String.raw`$Q_S = ${co(s)}p$`,
                    "Price ceiling": eur(cap),
                },
                answer: Qstar,
                explanation: String.raw`$Q_D(p^*) = Q_S(p^*)$ fixes the free-market price, and a ceiling $\bar{p}$ only bites when $\bar{p} < p^*$. Here $${n(A)} - ${co(d)}p = ${co(s)}p$ gives $p^* = \frac{${n(A)}}{${n(s + d)}}$ = ${eur(pStar)} and $Q^* = ${n(s)} \cdot ${n(pStar)}$ = ${n(Qstar)} ${sc.units}. The ceiling of ${eur(cap)} lies ${eur(cap - pStar)} **above** $p^*$, so it never restricts anyone: the market still clears at ${eur(pStar)} and ${n(Qstar)} ${sc.units} change hands.`,
            };
        },
    },
    {
        id: "e1-pctl-cap-nonbinding-surplus",
        subject: "econ1",
        topic: "price_controls",
        difficulty: "medium",
        kind: "numeric",
        unit: "EUR",
        source: "TUM Economics I Exam WS19/20, P29; TUM Economics I eTest W20/21, Q16",
        build: (rng) => {
            const sc = rng.pick(E1_PCTL_CAP_NONBINDING_SURPLUS_SCENARIOS);
            const m = rng.pick([1, 2, 3]); // supply is m times as flat as demand
            const d = rng.int(2, 6) * 10;
            const s = m * d;
            const pStar = rng.int(6, 15);
            const A = (s + d) * pStar;
            const Qstar = s * pStar;
            const choke = (m + 1) * pStar; // A / d, integer by construction
            const cap = pStar + rng.int(1, 6);
            const answer = 0.5 * (choke - pStar) * Qstar;
            return {
                prompt: String.raw`In ${sc.place} the daily market for ${sc.good} has demand $Q_D = ${n(A)} - ${co(d)}p$ and supply $Q_S = ${co(s)}p$, where $p$ is the price in euros per ${sc.one}. ${sc.authority} caps the price at ${eur(cap)} per ${sc.one}. What is the consumer surplus in this market with the cap in place?`,
                given: {
                    Demand: String.raw`$Q_D = ${n(A)} - ${co(d)}p$`,
                    Supply: String.raw`$Q_S = ${co(s)}p$`,
                    "Price ceiling": eur(cap),
                },
                answer,
                explanation: String.raw`$CS = \frac{1}{2} \left( \frac{A}{d} - p^* \right) Q^*$, the triangle between the demand curve and the price actually paid. Market clearing: $${n(A)} - ${co(d)}p = ${co(s)}p$ gives $p^* $ = ${eur(pStar)} and $Q^*$ = ${n(Qstar)} ${sc.units}. The ceiling of ${eur(cap)} is above $p^*$, so it is not binding - price and quantity are the unregulated ones and the deadweight loss is zero. The choke price is $\frac{${n(A)}}{${n(d)}}$ = ${eur(choke)}, so CS = ½ · (${n(choke)} − ${n(pStar)}) · ${n(Qstar)} = ${eur(answer)}.`,
            };
        },
    },
    {
        id: "e1-pctl-cap-binding-quantity",
        subject: "econ1",
        topic: "price_controls",
        difficulty: "easy",
        kind: "numeric",
        unit: "units",
        source: "TUM Economics I Exam WS19/20, P28",
        build: (rng) => {
            const sc = rng.pick(E1_PCTL_CAP_BINDING_QUANTITY_SCENARIOS);
            const m = rng.pick([1, 2, 3]);
            const d = rng.int(2, 6) * 10;
            const s = m * d;
            const pStar = rng.int(6, 15);
            const A = (s + d) * pStar;
            const Qstar = s * pStar;
            const gap = rng.int(1, 4);
            const cap = pStar - gap; // strictly below p*, and >= 2
            const Qc = s * cap; // short side: supply
            const Qd = A - d * cap;
            const excess = Qd - Qc; // = (m + 1) * d * gap
            return {
                prompt: String.raw`In ${sc.place} the daily market for ${sc.good} has demand $Q_D = ${n(A)} - ${co(d)}p$ and supply $Q_S = ${co(s)}p$, with $p$ in euros per ${sc.one}. ${sc.purpose} the government fixes a maximum price of ${eur(cap)} per ${sc.one}, which lies below the market-clearing price. How many ${sc.units} per day are actually traded under this ceiling?`,
                given: {
                    Demand: String.raw`$Q_D = ${n(A)} - ${co(d)}p$`,
                    Supply: String.raw`$Q_S = ${co(s)}p$`,
                    "Price ceiling": eur(cap),
                },
                answer: Qc,
                explanation: String.raw`With a binding ceiling the **short side** of the market determines trade: $Q = \min \left\{ Q_D(\bar{p}),\, Q_S(\bar{p}) \right\} = Q_S(\bar{p})$. Free-market price: $${n(A)} - ${co(d)}p = ${co(s)}p$ gives $p^*$ = ${eur(pStar)} with $Q^*$ = ${n(Qstar)} ${sc.units}. At the ceiling of ${eur(cap)} sellers offer $Q_S$ = ${n(s)} · ${n(cap)} = ${n(Qc)} ${sc.units} while buyers want $Q_D$ = ${n(A)} − ${n(d)} · ${n(cap)} = ${n(Qd)} ${sc.units}. The excess demand of ${n(excess)} ${sc.units} per day is rationed away (queues, lotteries), and only ${n(Qc)} ${sc.units} are traded.`,
            };
        },
    },
    {
        id: "e1-pctl-cap-binding-dwl",
        subject: "econ1",
        topic: "price_controls",
        difficulty: "hard",
        kind: "numeric",
        unit: "EUR",
        source: "TUM Economics I Exam WS19/20, P28",
        build: (rng) => {
            const sc = rng.pick(E1_PCTL_CAP_BINDING_DWL_SCENARIOS);
            const m = rng.pick([1, 2, 3]);
            const d = rng.int(2, 6) * 10;
            const s = m * d;
            const pStar = rng.int(30, 60);
            const A = (s + d) * pStar;
            const Qstar = s * pStar;
            const gap = rng.int(2, 6);
            const cap = pStar - gap;
            const Qc = s * cap;
            const pD = (m + 1) * pStar - m * cap; // willingness to pay at Q_c, integer
            const answer = 0.5 * (pD - cap) * (Qstar - Qc);
            return {
                prompt: String.raw`In ${sc.place} the monthly market for ${sc.good} has demand $Q_D = ${n(A)} - ${co(d)}p$ and supply $Q_S = ${co(s)}p$, with $p$ in euros per ${sc.one} and quantities in ${sc.units}. ${sc.authority} imposes a maximum price of ${eur(cap)} per ${sc.one}, below the market-clearing price; the scarce ${sc.good} goes to the buyers with the highest willingness to pay. What is the deadweight loss caused by this ceiling?`,
                given: {
                    Demand: String.raw`$Q_D = ${n(A)} - ${co(d)}p$`,
                    Supply: String.raw`$Q_S = ${co(s)}p$`,
                    "Price ceiling": eur(cap),
                },
                answer,
                explanation: String.raw`$DWL = \frac{1}{2} \left( p_D(Q_c) - \bar{p} \right) \left( Q^* - Q_c \right)$ - the surplus on the trades that no longer happen. Without the ceiling $p^*$ = ${eur(pStar)} and $Q^*$ = ${n(Qstar)} ${sc.short}. At the ceiling only $Q_c = ${n(s)} \cdot ${n(cap)}$ = ${n(Qc)} ${sc.short} are supplied. Inverse demand there: $p_D = \frac{${n(A)} - ${n(Qc)}}{${n(d)}}$ = ${eur(pD)}, so each withheld unit was worth ${eur(pD)} to a buyer but only ${eur(cap)} was paid. DWL = ½ · (${n(pD)} − ${n(cap)}) · (${n(Qstar)} − ${n(Qc)}) = ${eur(answer)}.`,
            };
        },
    },
    {
        id: "e1-pctl-cap-binding-cs",
        subject: "econ1",
        topic: "price_controls",
        difficulty: "very_hard",
        kind: "numeric",
        unit: "EUR",
        source: "TUM Economics I Exam WS19/20, P29",
        build: (rng) => {
            const sc = rng.pick(E1_PCTL_CAP_BINDING_CS_SCENARIOS);
            const m = rng.pick([1, 2, 3]);
            const d = rng.int(2, 6) * 10;
            const s = m * d;
            const pStar = rng.int(10, 20);
            const A = (s + d) * pStar;
            const choke = (m + 1) * pStar; // A / d
            const gap = rng.int(1, 5);
            const cap = pStar - gap;
            const Qc = s * cap;
            const pD = choke - m * cap; // = (A - Q_c) / d
            const triangle = 0.5 * (choke - pD) * Qc;
            const rect = (pD - cap) * Qc;
            const answer = triangle + rect;
            return {
                prompt: String.raw`In ${sc.place} the daily market for ${sc.good} has demand $Q_D = ${n(A)} - ${co(d)}p$ and supply $Q_S = ${co(s)}p$, with $p$ in euros per ${sc.one}. A maximum price of ${eur(cap)} per ${sc.one} is imposed, below the market-clearing price, and the scarce ${sc.units} go to the buyers with the highest willingness to pay. What is the consumer surplus under this ceiling?`,
                given: {
                    Demand: String.raw`$Q_D = ${n(A)} - ${co(d)}p$`,
                    Supply: String.raw`$Q_S = ${co(s)}p$`,
                    "Price ceiling": eur(cap),
                },
                answer,
                explanation: String.raw`$CS = \frac{1}{2} \left( \frac{A}{d} - p_D(Q_c) \right) Q_c + \left( p_D(Q_c) - \bar{p} \right) Q_c$ - a triangle on top of a rectangle, because the served buyers pay only $\bar{p}$. Supply at the ceiling: $Q_c = ${n(s)} \cdot ${n(cap)}$ = ${n(Qc)} ${sc.units}. The marginal served buyer values a ${sc.one} at $p_D = \frac{${n(A)} - ${n(Qc)}}{${n(d)}}$ = ${eur(pD)}, and the choke price is $\frac{${n(A)}}{${n(d)}}$ = ${eur(choke)}. Triangle: ½ · (${n(choke)} − ${n(pD)}) · ${n(Qc)} = ${eur(triangle)}; rectangle: (${n(pD)} − ${n(cap)}) · ${n(Qc)} = ${eur(rect)}. Together CS = ${eur(answer)}.`,
            };
        },
    },
    {
        id: "e1-pctl-floor-dwl",
        subject: "econ1",
        topic: "price_controls",
        difficulty: "hard",
        kind: "numeric",
        unit: "EUR",
        source: "TUM Economics I Exercise Exam WT22/23, Q29; TUM Economics I eTest W20/21, Q17",
        build: (rng) => {
            const sc = rng.pick(E1_PCTL_FLOOR_DWL_SCENARIOS);
            const m = rng.pick([1, 2, 3]);
            const k = rng.int(1, 5) * 10;
            const d = m * k; // demand slope
            const s = m * d; // supply slope
            const j = rng.int(1, 3);
            const lift = m * j; // p_f - p*, chosen so p_S(Q_f) stays an integer
            const pStar = rng.int(30, 45);
            const floor = pStar + lift;
            const A = (s + d) * pStar;
            const Qstar = s * pStar;
            const Qf = A - d * floor; // short side: demand
            const pS = pStar - j; // = Q_f / s
            const answer = 0.5 * (floor - pS) * (Qstar - Qf);
            return {
                prompt: String.raw`${sc.intro}. Daily demand is $Q_D = ${n(A)} - ${co(d)}p$ and daily supply is $Q_S = ${co(s)}p$, with $p$ in euros per ${sc.one}. To support ${sc.producers} ${sc.authority} sets a minimum price of ${eur(floor)} per ${sc.one} and does **not** buy up the unsold ${sc.product}. What is the deadweight loss of this price floor?`,
                given: {
                    Demand: String.raw`$Q_D = ${n(A)} - ${co(d)}p$`,
                    Supply: String.raw`$Q_S = ${co(s)}p$`,
                    "Price floor": eur(floor),
                },
                answer,
                explanation: String.raw`$DWL = \frac{1}{2} \left( p_f - p_S(Q_f) \right) \left( Q^* - Q_f \right)$, where $Q_f = Q_D(p_f)$ because demand is now the short side. Free market: $p^*$ = ${eur(pStar)} and $Q^*$ = ${n(Qstar)} ${sc.short}. At the floor buyers take only $Q_f = ${n(A)} - ${n(d)} \cdot ${n(floor)}$ = ${n(Qf)} ${sc.short}, while producers would supply ${n(s * floor)} ${sc.short} - a surplus of ${n(s * floor - Qf)} ${sc.short} that stays unsold. The marginal seller of the ${n(Qf)}th ${sc.one} needs only $p_S = \frac{${n(Qf)}}{${n(s)}}$ = ${eur(pS)}, so DWL = ½ · (${n(floor)} − ${n(pS)}) · (${n(Qstar)} − ${n(Qf)}) = ${eur(answer)}.`,
            };
        },
    },

    // ---------------------------------------------------------------- monopoly
    {
        id: "e1-mono-price-quadratic-cost",
        subject: "econ1",
        topic: "monopoly",
        difficulty: "medium",
        kind: "numeric",
        unit: "EUR",
        source: "TUM Economics I Exam WS19/20, P35; TUM Economics I eTest W20/21, Q20",
        build: (rng) => {
            const s = rng.pick(E1_MONO_PRICE_QUADRATIC_COST_SCENARIOS);
            const c = rng.pick([1, 2, 4]); // cost curvature, C = (c/2) q^2 + F
            const d = rng.pick([3, 4, 5]); // demand slope
            const k = rng.int(2, 8);
            const qM = d * k; // monopoly quantity, integer
            const A = qM * (2 + c * d); // demand intercept
            const F = rng.int(1, 9) * 10;
            const answer = k * (1 + c * d); // = (A - q^M) / d
            const costTex = c === 2 ? String.raw`q^2` : String.raw`${n(c / 2)}\, q^2`;
            return {
                prompt: String.raw`${s.firm} faces the demand $q = ${n(A)} - ${co(d)}p$ for ${s.units} per day, where $p$ is the ${s.price} in euros. Its cost function is $C(q) = ${costTex} + ${n(F)}$. Which ${s.price} does the profit-maximizing monopolist charge?`,
                given: {
                    Demand: String.raw`$q = ${n(A)} - ${co(d)}p$`,
                    "Cost function": String.raw`$C(q) = ${costTex} + ${n(F)}$`,
                },
                answer,
                explanation: String.raw`Invert demand to $p = \frac{A - q}{d}$, so revenue is $\frac{(A - q) q}{d}$ and $MR = \frac{A - 2q}{d}$. Setting $MR = MC = c\, q$ gives $q^M = \frac{A}{2 + c d}$. Here $q^M = \frac{${n(A)}}{${n(2 + c * d)}}$ = ${n(qM)} ${s.unitsShort}. The ${s.price} comes from the demand curve, not from MR: $p^M = \frac{${n(A)} - ${n(qM)}}{${n(d)}}$ = ${eur(answer)}. The fixed cost of ${eur(F)} shifts profit but never the optimal quantity.`,
                hint: String.raw`Marginal cost is the derivative of the cost function, $MC = C'(q)$; the fixed part drops out. A monopolist picks the quantity where $MR = MC$ (invert demand first, $MR$ has twice the slope of inverse demand) and reads the price off the demand curve.`,
            };
        },
    },
    {
        id: "e1-mono-consumer-surplus",
        subject: "econ1",
        topic: "monopoly",
        difficulty: "medium",
        kind: "numeric",
        unit: "EUR",
        source: "TUM Economics I Exam WS19/20, P36; TUM Economics I eTest W20/21, Q21",
        build: (rng) => {
            const s = rng.pick(E1_MONO_CONSUMER_SURPLUS_SCENARIOS);
            const c = rng.pick([1, 2, 4]);
            const d = rng.pick([3, 4, 5]);
            const k = rng.int(2, 8);
            const qM = d * k;
            const A = qM * (2 + c * d);
            const F = rng.int(1, 9) * 10;
            const pM = k * (1 + c * d);
            const choke = A / d; // = k * (2 + c d), integer
            const answer = 0.5 * (choke - pM) * qM; // = d k^2 / 2
            const costTex = c === 2 ? String.raw`q^2` : String.raw`${n(c / 2)}\, q^2`;
            return {
                prompt: String.raw`${s.firm} sells $q = ${n(A)} - ${co(d)}p$ ${s.units} per day at a price of $p$ euros ${s.per}, and its cost function is $C(q) = ${costTex} + ${n(F)}$. It sets one uniform profit-maximizing price. How large is the consumer surplus at that price?`,
                given: {
                    Demand: String.raw`$q = ${n(A)} - ${co(d)}p$`,
                    "Cost function": String.raw`$C(q) = ${costTex} + ${n(F)}$`,
                },
                answer,
                explanation: String.raw`$CS = \frac{1}{2} \left( \frac{A}{d} - p^M \right) q^M$, so first solve $MR = MC$: with $p = \frac{A - q}{d}$ we get $MR = \frac{A - 2q}{d} = c\, q$, hence $q^M = \frac{A}{2 + c d}$. Here $q^M = \frac{${n(A)}}{${n(2 + c * d)}}$ = ${n(qM)} ${s.units} and $p^M = \frac{${n(A)} - ${n(qM)}}{${n(d)}}$ = ${eur(pM)}. The choke price is $\frac{${n(A)}}{${n(d)}}$ = ${eur(choke)}, so CS = ½ · (${n(choke)} − ${n(pM)}) · ${n(qM)} = ${eur(answer)}.`,
                hint: String.raw`Marginal cost is $MC = C'(q)$. Find the monopoly quantity from $MR = MC$ and the price from the demand curve; consumer surplus is the triangle between the demand curve and that price, $CS = \frac{1}{2} (p_{max} - p^M) q^M$.`,
            };
        },
    },
    {
        id: "e1-mono-profit",
        subject: "econ1",
        topic: "monopoly",
        difficulty: "medium",
        kind: "numeric",
        unit: "EUR",
        source: "TUM Economics I Exam WS19/20, P36; TUM Economics I eTest W20/21, Q21",
        build: (rng) => {
            const s = rng.pick(E1_MONO_PROFIT_SCENARIOS);
            const c = rng.pick([1, 2, 4]);
            const d = rng.pick([3, 4, 5]);
            const k = rng.int(3, 8);
            const qM = d * k;
            const A = qM * (2 + c * d);
            const F = rng.int(1, 5) * 10; // small enough that profit stays positive
            const pM = k * (1 + c * d);
            const cost = 0.5 * c * qM * qM + F;
            const answer = pM * qM - cost;
            const costTex = c === 2 ? String.raw`q^2` : String.raw`${n(c / 2)}\, q^2`;
            return {
                prompt: String.raw`${s.firm} faces the demand $q = ${n(A)} - ${co(d)}p$ ${s.units} per day, with $p$ in euros per ${s.one}. Its cost function is $C(q) = ${costTex} + ${n(F)}$. What profit does it make per day at its optimal uniform price?`,
                given: {
                    Demand: String.raw`$q = ${n(A)} - ${co(d)}p$`,
                    "Cost function": String.raw`$C(q) = ${costTex} + ${n(F)}$`,
                },
                answer,
                explanation: String.raw`$\pi = p^M q^M - C(q^M)$ with $q^M$ from $MR = MC$: $\frac{A - 2q}{d} = c\, q$ gives $q^M = \frac{A}{2 + c d}$. Here $q^M = \frac{${n(A)}}{${n(2 + c * d)}}$ = ${n(qM)} ${s.units} and $p^M = \frac{${n(A)} - ${n(qM)}}{${n(d)}}$ = ${eur(pM)}. Revenue: ${eur(pM)} · ${n(qM)} = ${eur(pM * qM)}. Cost: ${eur(0.5 * c * qM * qM)} of variable cost plus the fixed ${eur(F)} = ${eur(cost)}. Profit: ${eur(pM * qM)} − ${eur(cost)} = ${eur(answer)}.`,
                hint: String.raw`Marginal cost is $MC = C'(q)$. The monopoly quantity solves $MR = MC$, the price comes from the demand curve, and profit is revenue minus the full cost function including the fixed part: $\pi = p^M q^M - C(q^M)$.`,
            };
        },
    },
    {
        id: "e1-mono-perfect-discrimination-quantity",
        subject: "econ1",
        topic: "monopoly",
        difficulty: "medium",
        kind: "numeric",
        unit: "units",
        source: "TUM Economics I Exam WS19/20, P37",
        build: (rng) => {
            const s = rng.pick(E1_MONO_PERFECT_DISCRIMINATION_QUANTITY_SCENARIOS);
            const c = rng.pick([1, 2]);
            const d = rng.pick([3, 4, 5]);
            const j = rng.int(1, 3);
            const k = (1 + c * d) * j; // makes the discrimination quantity an integer
            const qM = d * k;
            const A = qM * (2 + c * d);
            const F = rng.int(1, 9) * 10;
            const pM = k * (1 + c * d);
            const answer = d * j * (2 + c * d); // = A / (1 + c d)
            const costTex = c === 2 ? String.raw`q^2` : String.raw`${n(c / 2)}\, q^2`;
            return {
                prompt: String.raw`${s.firm} and faces the demand $q = ${n(A)} - ${co(d)}p$ ${s.units} per month, with $p$ in euros per ${s.one}. Its cost function is $C(q) = ${costTex} + ${n(F)}$. It now knows every buyer's willingness to pay and charges each of them exactly that (perfect price discrimination). How many ${s.units} does it sell per month?`,
                given: {
                    Demand: String.raw`$q = ${n(A)} - ${co(d)}p$`,
                    "Cost function": String.raw`$C(q) = ${costTex} + ${n(F)}$`,
                },
                answer,
                explanation: String.raw`Under first-degree price discrimination the price of the last unit is its inverse demand, so the firm expands until $p(q) = MC$: $\frac{A - q}{d} = c\, q \Rightarrow \tilde{q} = \frac{A}{1 + c d}$. Here $\tilde{q} = \frac{${n(A)}}{${n(1 + c * d)}}$ = ${n(answer)} ${s.units} - the same quantity a competitive market would deliver. A single-price monopolist would stop at $\frac{${n(A)}}{${n(2 + c * d)}}$ = ${n(qM)} ${s.units} sold at ${eur(pM)}, because for him one more unit also lowers the price on all previous ones.`,
                hint: String.raw`Marginal cost is $MC = C'(q)$. A perfectly discriminating monopolist has no uniform price to protect, so it sells every unit whose willingness to pay covers its marginal cost: expand until $p(q) = MC$ on the inverse demand curve.`,
            };
        },
    },
    {
        id: "e1-mono-perfect-discrimination-profit",
        subject: "econ1",
        topic: "monopoly",
        difficulty: "very_hard",
        kind: "numeric",
        unit: "EUR",
        source: "TUM Economics I eTest W20/21, Q22",
        build: (rng) => {
            const s = rng.pick(E1_MONO_PERFECT_DISCRIMINATION_PROFIT_SCENARIOS);
            const c = rng.pick([1, 2]);
            const d = rng.pick([3, 4, 5]);
            const j = rng.int(1, 3);
            const k = (1 + c * d) * j;
            const qM = d * k;
            const A = qM * (2 + c * d);
            const F = rng.int(1, 10) * 10;
            const choke = A / d;
            const qTilde = d * j * (2 + c * d); // = A / (1 + c d)
            const pM = k * (1 + c * d);
            const answer = 0.5 * choke * qTilde - F;
            const single = pM * qM - (0.5 * c * qM * qM + F);
            const costTex = c === 2 ? String.raw`q^2` : String.raw`${n(c / 2)}\, q^2`;
            return {
                prompt: String.raw`${s.firm} faces the demand $q = ${n(A)} - ${co(d)}p$ ${s.units} per month, with $p$ in euros per month. Its cost function is $C(q) = ${costTex} + ${n(F)}$. It can price every household individually at exactly that household's willingness to pay. What monthly profit does it earn under this perfect price discrimination?`,
                given: {
                    Demand: String.raw`$q = ${n(A)} - ${co(d)}p$`,
                    "Cost function": String.raw`$C(q) = ${costTex} + ${n(F)}$`,
                },
                answer,
                explanation: String.raw`A perfectly discriminating monopolist captures the entire surplus: it sells up to $p(q) = MC$ and earns the whole area between inverse demand and marginal cost, $\pi = \frac{1}{2} \cdot \frac{A}{d} \cdot \tilde{q} - F$ (both lines are straight and meet at $\tilde{q}$). Here $\tilde{q} = \frac{${n(A)}}{${n(1 + c * d)}}$ = ${n(qTilde)} ${s.units} and the choke price is $\frac{${n(A)}}{${n(d)}}$ = ${eur(choke)}, so the area is ½ · ${n(choke)} · ${n(qTilde)} = ${eur(0.5 * choke * qTilde)} and profit is ${eur(0.5 * choke * qTilde)} − ${eur(F)} = ${eur(answer)}. With one uniform price it would sell only ${n(qM)} ${s.units} at ${eur(pM)} and earn ${eur(single)} - discrimination raises profit and, because output rises to the competitive level, it also removes the deadweight loss.`,
                hint: String.raw`Marginal cost is $MC = C'(q)$. Under perfect price discrimination the firm sells until $p(q) = MC$ and pockets the entire area between inverse demand and marginal cost; subtract the fixed cost to get profit.`,
            };
        },
    },
    {
        id: "e1-mono-price-linear-cost-general",
        subject: "econ1",
        topic: "monopoly",
        difficulty: "easy",
        kind: "numeric",
        unit: "EUR",
        source: "TUM Principles of Economics Exercise Exam WS20/21, P21",
        build: (rng) => {
            const s = rng.pick(E1_MONO_PRICE_LINEAR_COST_GENERAL_SCENARIOS);
            const b = rng.int(4, 14);
            const k = rng.int(3, 15); // monopoly quantity
            const A = b + 4 * k;
            // Profit at the optimum is 2k^2 - F: keep F below that so the
            // monopolist never prefers to shut down (C(0) = 0).
            const F = rng.int(1, Math.min(10, Math.floor((2 * k * k - 1) / 5))) * 5;
            const answer = A - k; // = b + 3k
            return {
                prompt: String.raw`${s.firm} faces the demand $Q = ${n(A)} - p$ in MWh per day, with $p$ in euros per MWh. For $Q > 0$ its cost function is $C(Q) = ${n(F)} + ${co(b)}Q + Q^2$. Which price does it charge at the profit maximum?`,
                given: {
                    Demand: String.raw`$Q = ${n(A)} - p$`,
                    "Cost function": String.raw`$C(Q) = ${n(F)} + ${co(b)}Q + Q^2$`,
                },
                answer,
                explanation: String.raw`Inverse demand is $p = A - Q$, so $MR = A - 2Q$, while $MC = b + 2Q$. $MR = MC$ gives $Q^M = \frac{A - b}{4}$. Here $Q^M = \frac{${n(A)} - ${n(b)}}{4}$ = ${n(k)} MWh, and the price follows from the demand curve: $p^M = ${n(A)} - ${n(k)}$ = ${eur(answer)}. The fixed cost of ${eur(F)} does not enter the first-order condition.`,
            };
        },
    },
    {
        id: "e1-mono-unit-tax-profit",
        subject: "econ1",
        topic: "monopoly",
        difficulty: "hard",
        kind: "numeric",
        unit: "EUR",
        source: "TUM Principles of Economics Exercise Exam WS20/21, P23",
        build: (rng) => {
            const s = rng.pick(E1_MONO_UNIT_TAX_PROFIT_SCENARIOS);
            const b = rng.int(4, 14);
            const t = 4 * rng.int(1, 3); // multiple of 4 keeps the taxed quantity integer
            const Qt = rng.int(3, 12); // quantity with the tax in place
            const k = Qt + t / 4; // untaxed monopoly quantity
            const A = b + 4 * k;
            const F = rng.int(1, Math.floor((Qt * Qt) / 5)) * 5; // < Q_t^2, so profit stays positive
            const pt = A - Qt;
            const answer = 2 * Qt * Qt - F;
            return {
                prompt: String.raw`${s.firm} faces the demand $Q = ${n(A)} - p$ ${s.units} per day, with $p$ in euros per ${s.one}, and has the cost function $C(Q) = ${n(F)} + ${co(b)}Q + Q^2$ for $Q > 0$. ${s.state} now levies a tax of ${eur(t)} on **every ${s.one} ${s.short} sells**. What profit does ${s.short} make per day once it has re-optimized?`,
                given: {
                    Demand: String.raw`$Q = ${n(A)} - p$`,
                    "Cost function": String.raw`$C(Q) = ${n(F)} + ${co(b)}Q + Q^2$`,
                    "Per-unit tax t": eur(t),
                },
                answer,
                explanation: String.raw`The tax raises marginal cost to $MC + t = b + t + 2Q$, so $MR = A - 2Q$ gives $Q_t = \frac{A - b - t}{4}$ and $\pi = p_t Q_t - F - b Q_t - Q_t^2 - t Q_t$. Here $Q_t = \frac{${n(A)} - ${n(b)} - ${n(t)}}{4}$ = ${n(Qt)} ${s.units} and $p_t = ${n(A)} − ${n(Qt)}$ = ${eur(pt)}. Revenue ${eur(pt * Qt)} minus production cost ${eur(F + b * Qt + Qt * Qt)} minus tax ${eur(t * Qt)} leaves ${eur(answer)}. Without the tax ${s.short} would sell ${n(k)} ${s.units} - the tax cuts output by ${n(t / 4)} ${t === 4 ? s.one : s.units}, exactly a quarter of the tax rate.`,
            };
        },
    },

    // ----------------------------------------------------------- externalities
    {
        id: "e1-ext-dwl-negative",
        subject: "econ1",
        topic: "externalities",
        difficulty: "hard",
        kind: "numeric",
        unit: "EUR",
        source: "TUM Economics I Exercise Exam WT22/23, Q28",
        build: (rng) => {
            const s = rng.pick(E1_EXT_DWL_NEGATIVE_SCENARIOS);
            const b = rng.int(1, 4); // demand slope
            const g = rng.int(1, 4); // supply slope
            const S = b + g;
            const Qs = rng.int(5, 25); // socially optimal quantity, integer
            const gap = rng.int(1, 5); // Q_m - Q_s
            const e = S * gap; // constant marginal external damage
            const c = rng.int(12, 20); // supply intercept
            const a = c + S * (Qs + gap); // demand intercept
            const Qm = Qs + gap;
            const answer = 0.5 * e * gap;
            return {
                prompt: String.raw`${s.intro}. Demand is $P = ${n(a)} - ${co(b)}Q$ and ${s.supply} is $P = ${n(c)} + ${co(g)}Q$, with $P$ in euros per ${s.one} and $Q$ in ${s.units} per day. ${s.harmPre} ${eur(e)} ${s.harmPost}. What is the deadweight loss of the unregulated market?`,
                given: {
                    Demand: String.raw`$P = ${n(a)} - ${co(b)}Q$`,
                    "Private supply": String.raw`$P = ${n(c)} + ${co(g)}Q$`,
                    [`External damage per ${s.one}`]: eur(e),
                },
                answer,
                explanation: String.raw`$DWL = \frac{1}{2}\, e \left( Q_m - Q_s \right)$: on every ${s.one} between the two quantities the social cost exceeds the willingness to pay, and the wedge grows linearly from 0 to $e$. The market ignores the damage: $${n(a)} - ${co(b)}Q = ${n(c)} + ${co(g)}Q$ gives $Q_m$ = ${n(Qm)} ${s.units}. The social optimum uses $MSC = ${n(c)} + ${n(e)} + ${co(g)}Q$: $${n(a)} - ${co(b)}Q = ${n(c + e)} + ${co(g)}Q$ gives $Q_s$ = ${n(Qs)} ${s.units}. So DWL = ½ · ${n(e)} · (${n(Qm)} − ${n(Qs)}) = ${eur(answer)}.`,
                hint: String.raw`Compare the quantity the market trades with the one that equates demand and the **social** marginal cost, private supply plus the external damage. The loss is the triangle between them: $DWL = \frac{1}{2}\, e \left( Q_m - Q_s \right)$.`,
            };
        },
    },
    {
        id: "e1-ext-pigou-tax-rising-damage",
        subject: "econ1",
        topic: "externalities",
        difficulty: "medium",
        kind: "numeric",
        unit: "EUR",
        source: "TUM Economics I eTest W20/21, Q19",
        build: (rng) => {
            const s = rng.pick(E1_EXT_PIGOU_TAX_RISING_DAMAGE_SCENARIOS);
            const b = rng.int(1, 4);
            const g = rng.int(1, 4);
            const mec = rng.int(1, 4); // slope of the marginal external cost
            const T = b + g + mec;
            const Qs = rng.int(4, 20);
            const a = T * Qs; // demand intercept, makes Q_s an integer
            const Qm = a / (b + g);
            const answer = mec * Qs;
            return {
                prompt: String.raw`${s.intro}. Demand is $P = ${n(a)} - ${co(b)}Q$ and supply is $P = ${co(g)}Q$, with $P$ in euros per ${s.one} and $Q$ in ${s.units} per day. ${s.why}, so the marginal external cost rises with output: $MEC = ${co(mec)}Q$. Which per-unit tax on producers implements the socially optimal quantity?`,
                given: {
                    Demand: String.raw`$P = ${n(a)} - ${co(b)}Q$`,
                    Supply: String.raw`$P = ${co(g)}Q$`,
                    "Marginal external cost": String.raw`$MEC = ${co(mec)}Q$`,
                },
                answer,
                explanation: String.raw`A Pigouvian tax equals the marginal external cost **at the social optimum**: $\tau = MEC(Q_s)$ with $Q_s$ from $a - b Q = (g + m) Q$, i.e. $Q_s = \frac{a}{b + g + m}$. Here $Q_s = \frac{${n(a)}}{${n(T)}}$ = ${n(Qs)} ${s.units}, against ${n(Qm)} ${s.units} in the unregulated market. The tax is $\tau = ${n(mec)} \cdot ${n(Qs)}$ = ${eur(answer)} per ${s.one}. Check: with it producers supply along $${co(g)}Q + ${n(answer)}$, and $${n(a)} - ${co(b)}Q = ${co(g)}Q + ${n(answer)}$ is solved exactly at ${n(Qs)} ${s.units}.`,
            };
        },
    },
    {
        id: "e1-ext-positive-social-quantity",
        subject: "econ1",
        topic: "externalities",
        difficulty: "medium",
        kind: "numeric",
        unit: "units",
        source: "TUM Economics I eTest W20/21, Q18; TUM Economics I Exam WS19/20, P34",
        build: (rng) => {
            const s = rng.pick(E1_EXT_POSITIVE_SOCIAL_QUANTITY_SCENARIOS);
            const b = rng.int(1, 4);
            const g = rng.int(1, 4);
            const S = b + g;
            const Qm = rng.int(5, 25); // market quantity, integer
            const gap = rng.int(1, 6);
            const e = S * gap; // constant marginal external benefit
            const c = rng.int(8, 20);
            const a = c + S * Qm;
            const answer = Qm + gap; // = (a + e - c) / (b + g)
            return {
                prompt: String.raw`${s.who}. Demand is $P = ${n(a)} - ${co(b)}Q$ and supply is $P = ${n(c)} + ${co(g)}Q$, with $P$ in euros per ${s.one} and $Q$ in ${s.units} per day. ${s.benefit} ${eur(e)}, which no buyer takes into account. How many ${s.units} per day would be socially optimal?`,
                given: {
                    Demand: String.raw`$P = ${n(a)} - ${co(b)}Q$`,
                    Supply: String.raw`$P = ${n(c)} + ${co(g)}Q$`,
                    [`External benefit per ${s.one}`]: eur(e),
                },
                answer,
                explanation: String.raw`With a positive externality the marginal social benefit lies above demand, $MSB = a + e - b Q$, and the optimum solves $MSB = MSC$, so $Q_s = \frac{a + e - c}{b + g}$. Here $${n(a + e)} - ${co(b)}Q = ${n(c)} + ${co(g)}Q$ gives $Q_s$ = ${n(answer)} ${s.units} per day. The market alone stops at $Q_m = \frac{${n(a)} - ${n(c)}}{${n(S)}}$ = ${n(Qm)} ${s.units} - ${s.noun} is **under**-provided, which is why a subsidy of ${eur(e)} ${s.subsidy} would be the efficient policy.`,
            };
        },
    },
    {
        id: "e1-ext-positive-dwl",
        subject: "econ1",
        topic: "externalities",
        difficulty: "hard",
        kind: "numeric",
        unit: "EUR",
        source: "TUM Economics I Exam WS19/20, P34",
        build: (rng) => {
            const s = rng.pick(E1_EXT_POSITIVE_DWL_SCENARIOS);
            const b = rng.int(1, 3);
            const g = rng.int(1, 3);
            const S = b + g;
            const Qm = rng.int(6, 20);
            const gap = rng.int(2, 6);
            const e = S * gap;
            const c = rng.int(10, 24);
            const a = c + S * Qm;
            const Qs = Qm + gap;
            const answer = 0.5 * e * gap;
            return {
                prompt: String.raw`${s.intro}. Demand from ${s.buyers} is $P = ${n(a)} - ${co(b)}Q$ and supply is $P = ${n(c)} + ${co(g)}Q$, with $P$ in euros ${s.per} and $Q$ in ${s.units}. ${s.benefit} ${eur(e)} per ${s.one}. What is the deadweight loss of the unregulated market?`,
                given: {
                    Demand: String.raw`$P = ${n(a)} - ${co(b)}Q$`,
                    Supply: String.raw`$P = ${n(c)} + ${co(g)}Q$`,
                    [`External benefit per ${s.one}`]: eur(e),
                },
                answer,
                explanation: String.raw`$DWL = \frac{1}{2}\, e \left( Q_s - Q_m \right)$ - the triangle between the marginal social benefit and the supply curve over the ${s.units} that are never ${s.never}. Market: $${n(a)} - ${co(b)}Q = ${n(c)} + ${co(g)}Q$ gives $Q_m$ = ${n(Qm)} ${s.units}. Social optimum with $MSB = ${n(a + e)} - ${co(b)}Q$: $${n(a + e)} - ${co(b)}Q = ${n(c)} + ${co(g)}Q$ gives $Q_s$ = ${n(Qs)} ${s.units}. DWL = ½ · ${n(e)} · (${n(Qs)} − ${n(Qm)}) = ${eur(answer)}. A subsidy of ${eur(e)} per ${s.one} would close the gap.`,
            };
        },
    },

    // ------------------------------------------------------------ public goods
    {
        id: "e1-pg-efficient-provision-identical",
        subject: "econ1",
        topic: "public_goods",
        difficulty: "medium",
        kind: "numeric",
        unit: "units",
        source: "TUM Principles of Economics Exercise Exam WS20/21, P24",
        build: (rng) => {
            const s = rng.pick(E1_PG_EFFICIENT_PROVISION_IDENTICAL_SCENARIOS);
            const households = rng.int(2, 12);
            const j = rng.int(1, 8);
            const c = households * j; // marginal cost, multiple of m
            const answer = rng.int(2, 15); // efficient quantity, integer
            const a = answer + j; // choke of each member's marginal benefit
            return {
                prompt: String.raw`The ${n(households)} ${s.members} ${s.place} jointly fund ${s.what}. Each ${s.member}'s marginal benefit from an extra ${s.one} of ${s.good} is $MB(Q) = ${n(a)} - Q$ euros, and ${s.provider} a constant ${eur(c)} per ${s.one}. How many ${s.units} of ${s.good} are socially efficient?`,
                given: {
                    [cap(s.members)]: n(households),
                    [`Marginal benefit per ${s.member}`]: String.raw`$MB(Q) = ${n(a)} - Q$`,
                    [`Marginal cost per ${s.one}`]: eur(c),
                },
                answer,
                explanation: String.raw`For a public good the Samuelson condition sums the marginal benefits **vertically**: $\sum_{i=1}^{m} MB_i(Q) = MC$, i.e. $m (a - Q) = c$, so $Q^E = a - \frac{c}{m}$. Here $${n(households)} \left( ${n(a)} - Q \right) = ${n(c)}$ gives $Q^E = ${n(a)} - \frac{${n(c)}}{${n(households)}}$ = ${n(answer)} ${s.units}. At that level each ${s.member} still values a further ${s.one} at ${eur(j)}, and ${n(households)} · ${eur(j)} = ${eur(c)} exactly covers the cost of one more ${s.one}.`,
            };
        },
    },
    {
        id: "e1-pg-efficient-provision-two-types",
        subject: "econ1",
        topic: "public_goods",
        difficulty: "hard",
        kind: "numeric",
        unit: "units",
        source: "TUM Principles of Economics Exercise Exam WS20/21, P25",
        build: (rng) => {
            const s = rng.pick(E1_PG_EFFICIENT_PROVISION_TWO_TYPES_SCENARIOS);
            const n1 = rng.int(2, 8);
            const n2 = rng.int(2, 8);
            const answer = rng.int(2, 14); // efficient quantity
            const x1 = rng.int(1, 4);
            const x2 = x1 + rng.int(1, 4); // the second type values the good more
            const a1 = answer + x1;
            const a2 = answer + x2;
            const c = n1 * x1 + n2 * x2; // = n1 a1 + n2 a2 - (n1 + n2) Q^E
            return {
                prompt: String.raw`${s.intro}. Each of the ${n(n1)} ${s.type1} has the marginal benefit $MB_1(Q) = ${n(a1)} - Q$ euros per month, each of the ${n(n2)} ${s.type2} has $MB_2(Q) = ${n(a2)} - Q$ euros per month, and one extra ${s.unitOne} costs a constant ${eur(c)} per month. ${s.asks}`,
                given: {
                    [`${cap(s.type1)} / ${s.type2}`]: `${n(n1)} / ${n(n2)}`,
                    [`Marginal benefit ${s.type1One}`]: String.raw`$MB_1(Q) = ${n(a1)} - Q$`,
                    [`Marginal benefit ${s.type2One}`]: String.raw`$MB_2(Q) = ${n(a2)} - Q$`,
                    [`Marginal cost per ${s.unitOne}`]: eur(c),
                },
                answer,
                explanation: String.raw`Marginal benefits of a public good are summed **vertically** across all users: $n_1 \left( a_1 - Q \right) + n_2 \left( a_2 - Q \right) = MC$, so $Q^E = \frac{n_1 a_1 + n_2 a_2 - c}{n_1 + n_2}$. Substituting: $\frac{${n(n1)} \cdot ${n(a1)} + ${n(n2)} \cdot ${n(a2)} - ${n(c)}}{${n(n1 + n2)}}$ = ${n(answer)} ${s.unit}. Check: at that level a ${s.type1One} still values an extra ${s.unitOne} at ${eur(x1)} and a ${s.type2One} at ${eur(x2)}, and ${n(n1)} · ${eur(x1)} + ${n(n2)} · ${eur(x2)} = ${eur(c)} - exactly the marginal cost. Every $MB$ is still positive, so nobody would want less.`,
            };
        },
    },
    {
        id: "e1-pg-underprovision-gap",
        subject: "econ1",
        topic: "public_goods",
        difficulty: "hard",
        kind: "numeric",
        unit: "units",
        source: "TUM Principles of Economics Exercise Exam WS20/21, P24",
        build: (rng) => {
            const s = rng.pick(E1_PG_UNDERPROVISION_GAP_SCENARIOS);
            const households = rng.int(2, 8);
            const j = rng.int(1, 4);
            const c = households * j; // marginal cost per hour
            const priv = rng.int(1, 6); // privately provided hours
            const a = c + priv;
            const eff = a - j; // efficient hours
            const answer = eff - priv; // = c - c/m
            return {
                prompt: String.raw`The ${n(households)} ${s.members} ${s.intro}. Each ${s.member}'s marginal benefit from an extra ${s.unit} per week is $MB(Q) = ${n(a)} - Q$ euros, and ${s.costPhrase} a constant ${eur(c)}. By how many hours per week does the socially efficient level exceed the level a single ${s.member} would buy on its own?`,
                given: {
                    [cap(s.members)]: n(households),
                    [`Marginal benefit per ${s.member}`]: String.raw`$MB(Q) = ${n(a)} - Q$`,
                    "Marginal cost per hour": eur(c),
                },
                answer,
                explanation: String.raw`Efficiency needs the **vertical** sum $\sum_{i=1}^{m} MB_i(Q) = MC$, while a ${s.member} acting alone only sets its own $MB_i(Q) = MC$. Privately: $${n(a)} - Q = ${n(c)}$ gives $Q^{priv}$ = ${n(priv)} hours. Efficiently: $${n(households)} \left( ${n(a)} - Q \right) = ${n(c)}$ gives $Q^E = ${n(a)} - \frac{${n(c)}}{${n(households)}}$ = ${n(eff)} hours. The gap is ${n(eff)} − ${n(priv)} = ${n(answer)} hours per week. Acting alone, a ${s.member} ignores the benefit its purchase confers on the other ${n(households - 1)} ${households === 2 ? s.member : s.members}, which is exactly why a public good is under-provided without collective action.`,
                hint: String.raw`A buyer acting alone stops where its **own** marginal benefit equals the cost, while efficiency sums the marginal benefits of everyone vertically: $\sum_{i=1}^{m} MB_i(Q) = MC$.`,
            };
        },
    },
];
