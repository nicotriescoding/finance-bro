import type { Question } from "@/lib/questions/types";
import type { Rng } from "@/lib/questions/rng";
import { eur, n, n2, pct } from "./_helpers";

/**
 * Cost Accounting (Prof. Friedl, TUM).
 *
 * Built from real TUM Cost Accounting exams under the copyright-redesign
 * policy: Summer 2015, Winter 2016/17, Summer 2017, Winter 2017/18,
 * Summer 2018, Winter 2018/19 and the Mock Exam (answer key from the
 * SS2021 exam-prep deck). Every question keeps only the tested competency
 * and the standard formula; scenarios, company names, wording and all
 * numbers are new (numeric questions draw every number from the seeded rng).
 * Recurring tasks across exam years are merged into one variant family;
 * `source` cites all occurrences.
 */

// ---------------------------------------------------------------- helpers

/** Inventory movement scenario shared by the material-valuation family. */
type StockScenario = {
    begin: number; p0: number;
    c1: number;
    buy1: number; p1: number;
    buy2: number; p2: number;
    c2: number;
    buy3: number; p3: number;
};

function drawStock(rng: Rng): StockScenario {
    // Quantities in whole 100 kg so every FIFO/LIFO layer walk stays clean.
    // c1 < begin and c2 < begin - c1 + buy1 + buy2 hold for every draw:
    // begin >= 1,000, c1 <= 800, stock before c2 >= 1,000 > 900 >= c2.
    const p0 = rng.int(12, 20) * 0.25; // 3.00 .. 5.00 EUR/kg
    const begin = rng.int(10, 20) * 100;
    const c1 = rng.int(4, 8) * 100;
    const buy1 = rng.int(4, 8) * 100;
    const p1 = p0 + rng.pick([-0.5, -0.25, 0.25, 0.5]);
    const buy2 = rng.int(4, 8) * 100;
    const p2 = p0 + rng.pick([-0.5, -0.25, 0.25, 0.5]);
    const c2 = rng.int(4, 9) * 100;
    const buy3 = rng.int(3, 6) * 100;
    const p3 = p0 + rng.pick([-0.25, 0.25]);
    return { begin, p0, c1, buy1, p1, buy2, p2, c2, buy3, p3 };
}

/** Consumes `qty` from price layers front-to-back; returns cost + breakdown. */
function walkLayers(layers: Array<[number, number]>, qty: number) {
    let remaining = qty;
    let cost = 0;
    const parts: string[] = [];
    for (const [amount, price] of layers) {
        if (remaining <= 0) break;
        const take = Math.min(amount, remaining);
        cost += take * price;
        parts.push(`${n(take)} kg × ${eur(price)}`);
        remaining -= take;
    }
    return { cost, parts };
}

/**
 * Second inventory scenario (coffee-roastery family): begin, two purchases,
 * two issues, one late purchase. Structurally different from drawStock so the
 * two material-valuation families read as different exams.
 * Guards: c1 <= b0 + q1 (min 1,100 vs max 1,000) and
 * c1 + c2 <= b0 + q1 + q2 - 100 (max 1,300 vs min 1,400), so no draw can
 * run the stock negative. Prices stay >= 5.25 EUR/kg.
 */
type Stock2 = {
    b0: number; p0: number;
    q1: number; p1: number;
    q2: number; p2: number;
    c1: number; c2: number;
    q3: number; p3: number;
};

function drawStock2(rng: Rng): Stock2 {
    const p0 = rng.int(24, 36) * 0.25; // 6.00 .. 9.00 EUR/kg
    const b0 = rng.int(6, 12) * 100;
    const q1 = rng.int(5, 9) * 100;
    const p1 = p0 + rng.pick([-0.75, -0.5, 0.5, 0.75]);
    const q2 = rng.int(3, 6) * 100;
    const p2 = p0 + rng.pick([-0.25, 0.25, 0.5]);
    const c1 = rng.int(6, 10) * 100;
    const c2 = rng.int(1, 3) * 100;
    const q3 = rng.int(3, 6) * 100;
    const p3 = p0 + rng.pick([-0.5, -0.25, 0.25]);
    return { b0, p0, q1, p1, q2, p2, c1, c2, q3, p3 };
}

/** Perpetual-LIFO layer stack after both issues of the Stock2 scenario. */
function lifoLayersAfterIssues(s: Stock2): Array<[number, number]> {
    const stack: Array<[number, number]> = [
        [s.b0, s.p0],
        [s.q1, s.p1],
        [s.q2, s.p2],
    ];
    for (const issue of [s.c1, s.c2]) {
        let remaining = issue;
        while (remaining > 0) {
            const top = stack[stack.length - 1];
            const take = Math.min(top[0], remaining);
            top[0] -= take;
            remaining -= take;
            if (top[0] === 0) stack.pop();
        }
    }
    return stack;
}

// ---------------------------------------------------------------------------
// Story-line variants (2026-09). Every question draws one scenario FIRST
// inside build, so the same concept shows up dressed differently from seed to
// seed. Scenarios hold strings only - every number still comes from the rng;
// cost drivers, cost pools and formulas never change, only the names around
// them (firm, product, department, unit word).

/** "heat" -> "Heat" for a scenario word at the start of a label. */
const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

/** Material-valuation family 1 (drawStock): firm and raw material. */
const CA_MAT_STOCK_SCENARIOS = [
    { firm: "Nordwind Brew Co.", mat: "barley malt" },
    { firm: "Aurelia Bakery", mat: "rye flour" },
    { firm: "Kastell Foundry", mat: "copper scrap" },
    { firm: "Halden Paper Mill", mat: "wood pulp" },
    { firm: "Bavaria Chocolate", mat: "sugar" },
] as const;

/** Material-valuation family 2 (drawStock2): firm, material and the process the issues go to. */
const CA_MAT_STOCK2_SCENARIOS = [
    { firmIntro: "Vesuvio Roastery in Naples", firm: "Vesuvio Roastery", mat: "green coffee beans", matShort: "green coffee", use: "roasting" },
    { firmIntro: "Cacao Lumiere in Paris", firm: "Cacao Lumiere", mat: "cocoa beans", matShort: "cocoa", use: "grinding" },
    { firmIntro: "Teehaus Brandt in Hamburg", firm: "Teehaus Brandt", mat: "loose-leaf tea", matShort: "tea", use: "blending" },
    { firmIntro: "Molino Sereno in Rome", firm: "Molino Sereno", mat: "wheat", matShort: "wheat", use: "milling" },
    { firmIntro: "Olivar Real in Seville", firm: "Olivar Real", mat: "olives", matShort: "olives", use: "pressing" },
] as const;

const CA_DEP_STRAIGHT_LINE_SCENARIOS = [
    { firm: "A beverage producer", asset: "a bottling line" },
    { firm: "A dairy", asset: "a pasteurizer" },
    { firm: "A print shop", asset: "a printing press" },
    { firm: "A sawmill", asset: "a sawing line" },
    { firm: "A bakery chain", asset: "an industrial oven" },
] as const;

const CA_DEP_DECLINING_RATE_SCENARIOS = [
    { asset: "A packaging machine" },
    { asset: "A delivery truck" },
    { asset: "A plastic molding machine" },
    { asset: "A milling machine" },
] as const;

const CA_DEP_UNITS_OF_PRODUCTION_SCENARIOS = [
    { asset: "A labeling machine", units: "bottles", done: "labeled" },
    { asset: "A stamping press", units: "parts", done: "stamped" },
    { asset: "A printing press", units: "sheets", done: "printed" },
    { asset: "An embroidery machine", units: "T-shirts", done: "embroidered" },
] as const;

const CA_DEP_ARITHMETIC_DEGRESSIVE_SCENARIOS = [
    { asset: "A conveyor system" },
    { asset: "A forklift fleet" },
    { asset: "A paint booth" },
    { asset: "A packaging robot" },
] as const;

/** Depreciation family 2 (one firm, three assets). */
const CA_DEP_FIRM_SCENARIOS = [
    { firmIntro: "Cicloval, a bicycle manufacturer in Lisbon", firm: "Cicloval", asset1: "a frame-welding robot", units: "frames", asset2: "a laser cutter", asset3: "paint line" },
    { firmIntro: "Bruma Kayaks, a kayak builder in Barcelona", firm: "Bruma Kayaks", asset1: "a molding machine", units: "hulls", asset2: "a cutting machine", asset3: "drying oven" },
    { firmIntro: "Ostwerk Drones, a drone maker in Dresden", firm: "Ostwerk Drones", asset1: "a circuit-board assembly machine", units: "circuit boards", asset2: "a soldering oven", asset3: "test bench" },
    { firmIntro: "Lumo Lighting, a lamp maker in Stockholm", firm: "Lumo Lighting", asset1: "a metal press", units: "lamp shades", asset2: "a laser engraver", asset3: "polishing line" },
] as const;

/** Cost-allocation family 1: two indirect centers (first delivers svc1 in unit u1, second delivers hours), two direct centers. */
const CA_ALLOC_OAKLINE_SCENARIOS = [
    { firm: "Oakline Furniture", ic1: "Boiler House", ic2: "Tool Shop", dc1: "Assembly", dc2: "Finishing", svc1: "heat", u1: "MWh" },
    { firm: "Brixham Boatworks", ic1: "Power Plant", ic2: "Maintenance", dc1: "Hull Shop", dc2: "Interior", svc1: "electricity", u1: "MWh" },
    { firm: "Solano Textiles", ic1: "Steam Plant", ic2: "Repair Shop", dc1: "Weaving", dc2: "Dyeing", svc1: "steam", u1: "t" },
    { firm: "Kemper Dairy", ic1: "Water Works", ic2: "Workshop", dc1: "Bottling", dc2: "Cheesemaking", svc1: "water", u1: "m³" },
    { firm: "Aldan Glassworks", ic1: "Furnace House", ic2: "Mold Shop", dc1: "Pressing", dc2: "Decorating", svc1: "heat", u1: "MWh" },
] as const;

/** Step-ladder with a total handed on by the second center. */
const CA_ALLOC_STEPLADDER_TOTAL_SCENARIOS = [
    { firm: "Ferrovia Metalworks in Turin", ic1: "Steam Plant", ic2: "IT Services", dc1: "Milling", dc2: "Assembly", svc: "steam", u: "t" },
    { firm: "Nordlicht Shipyard in Kiel", ic1: "Power House", ic2: "Facility Services", dc1: "Welding", dc2: "Outfitting", svc: "electricity", u: "MWh" },
    { firm: "Casa Verde Ceramics in Barcelona", ic1: "Kiln House", ic2: "Maintenance", dc1: "Glazing", dc2: "Packing", svc: "heat", u: "MWh" },
    { firm: "Arlo Brewery in London", ic1: "Boiler House", ic2: "Logistics", dc1: "Brewing", dc2: "Bottling", svc: "steam", u: "t" },
] as const;

/** Step-ladder on floor area (m² stays the driver) and the levy question of the same firm. */
const CA_ALLOC_PRESSURA_SCENARIOS = [
    { firm: "Pressura Print in Hamburg", firmShort: "Pressura Print", ic1: "Facility Services", ic2: "Power House", dc1: "Layout", dc2: "Press" },
    { firm: "Bellmore Bindery in Dublin", firmShort: "Bellmore Bindery", ic1: "Building Services", ic2: "Boiler House", dc1: "Cutting", dc2: "Binding" },
    { firm: "Ravel Optics in Zurich", firmShort: "Ravel Optics", ic1: "Site Services", ic2: "Compressor Station", dc1: "Grinding", dc2: "Coating" },
    { firm: "Madeleine Bakery in Paris", firmShort: "Madeleine Bakery", ic1: "Cleaning", ic2: "Cold Store", dc1: "Dough Shop", dc2: "Ovens" },
] as const;

/** Reciprocal / credits-and-debits family around one metalworks-style firm. */
const CA_ALLOC_FERROVIA_SCENARIOS = [
    { firm: "Ferrovia Metalworks", ic1: "Steam Plant", ic2: "Repair Bay", dc1: "Milling", dc2: "Assembly", svc: "steam", u: "t", uLong: "tonne of steam", hour: "repair hour" },
    { firm: "Halvard Shipfitters", ic1: "Power House", ic2: "Maintenance Crew", dc1: "Welding", dc2: "Outfitting", svc: "electricity", u: "MWh", uLong: "MWh of electricity", hour: "maintenance hour" },
    { firm: "Brenner Foundry", ic1: "Water Works", ic2: "Tool Room", dc1: "Casting", dc2: "Grinding", svc: "water", u: "m³", uLong: "cubic meter of water", hour: "tool-room hour" },
    { firm: "Corvina Cannery", ic1: "Refrigeration", ic2: "Cleaning Crew", dc1: "Filleting", dc2: "Packing", svc: "cooling", u: "MWh", uLong: "MWh of cooling", hour: "cleaning hour" },
] as const;

const CA_ALLOC_RECIPROCAL_TOTAL_SCENARIOS = [
    { firm: "Nordkap Fish Cannery", ic1: "Power House", ic2: "Cleaning Crew", dc1: "Filleting", dc2: "Packing", svc: "power", u: "MWh" },
    { firm: "Milano Spinning Mills", ic1: "Steam Plant", ic2: "Maintenance Crew", dc1: "Spinning", dc2: "Winding", svc: "steam", u: "t" },
    { firm: "Berlin Brickworks", ic1: "Kiln House", ic2: "Repair Crew", dc1: "Molding", dc2: "Firing", svc: "heat", u: "MWh" },
    { firm: "Meadowbrook Creamery", ic1: "Refrigeration", ic2: "Sanitation Crew", dc1: "Churning", dc2: "Packaging", svc: "cooling", u: "MWh" },
] as const;

const CA_ALLOC_RECIPROCAL_SUM_SCENARIOS = [
    { firm: "Hamburg Shipfittings", ic1: "Power", ic2: "Workshop", dc1: "Fabrication", dc2: "Administration", u: "MWh" },
    { firm: "Ambra Furniture", ic1: "Boiler House", ic2: "Tool Shop", dc1: "Joinery", dc2: "Sales", u: "MWh" },
    { firm: "Lyra Electronics", ic1: "Compressor Station", ic2: "Test Lab", dc1: "Assembly", dc2: "Administration", u: "m³" },
    { firm: "Corvus Printing", ic1: "Steam Plant", ic2: "Maintenance", dc1: "Press Room", dc2: "Sales", u: "t" },
] as const;

const CA_ALLOC_KNOWN_TP_SCENARIOS = [
    { firm: "Hotel Bergblick", ic: "Laundry", verb: "washes", out: "kg of linen", units: "kg", unit: "kg" },
    { firm: "Seaview Resort", ic: "Kitchen", verb: "prepares", out: "meals", units: "meals", unit: "meal" },
    { firm: "Lakeside Clinic", ic: "Sterilization Unit", verb: "processes", out: "instrument trays", units: "trays", unit: "tray" },
    { firm: "Alpina Spa", ic: "Cleaning Crew", verb: "cleans", out: "m² of floor space", units: "m²", unit: "m²" },
] as const;

const CA_ALLOC_LEVY_TOTAL_SCENARIOS = [
    { firm: "Ferrovia Metalworks", ic1: "Steam Plant", ic2: "IT Services", ic3: "Vehicle Pool", dc1: "Milling", dc2: "Assembly", svc: "steam", u: "t", hour: "IT hour" },
    { firm: "Nordlicht Shipyard", ic1: "Power House", ic2: "Facility Services", ic3: "Canteen", dc1: "Welding", dc2: "Outfitting", svc: "electricity", u: "MWh", hour: "facility hour" },
    { firm: "Arlo Brewery", ic1: "Boiler House", ic2: "Logistics", ic3: "Laboratory", dc1: "Brewing", dc2: "Bottling", svc: "steam", u: "t", hour: "logistics hour" },
] as const;

/** Product costing family 1: two products, second one is the one asked about. */
const CA_PC_VELOTTA_SCENARIOS = [
    { firm: "Velotta Components", a: "saddle", as: "saddles", b: "handlebar", bs: "handlebars" },
    { firm: "Orsa Kitchenware", a: "pot", as: "pots", b: "frying pan", bs: "frying pans" },
    { firm: "Pinecrest Toys", a: "puzzle", as: "puzzles", b: "rocking horse", bs: "rocking horses" },
    { firm: "Fennel Cosmetics", a: "lip balm", as: "lip balms", b: "face cream", bs: "face creams" },
] as const;

const CA_PC_TARGET_MARGIN_SCENARIOS = [
    { item: "A gearbox" },
    { item: "A garden bench" },
    { item: "An e-bike battery" },
    { item: "A coffee grinder" },
    { item: "A pair of hiking boots" },
] as const;

const CA_PC_EQUIVALENCE_NUMBER_SCENARIOS = [
    { firm: "A brick works", unit: "brick", a: "Standard", b: "Jumbo" },
    { firm: "A paving-stone plant", unit: "stone", a: "Classic", b: "Grande" },
    { firm: "A cheese dairy", unit: "wheel", a: "Petit", b: "Grand" },
    { firm: "A concrete-block plant", unit: "block", a: "Compact", b: "Maxi" },
] as const;

const CA_PC_MULTISTAGE_SCENARIOS = [
    { firm: "A pottery", items: "ceramic mugs", itemsShort: "mugs", item: "mug", st1: "molding", st2: "glazing and firing", st3: "packaging", verb3: "packs" },
    { firm: "A glassworks", items: "glass bottles", itemsShort: "bottles", item: "bottle", st1: "blowing", st2: "cooling", st3: "labeling", verb3: "labels" },
    { firm: "A candle factory", items: "pillar candles", itemsShort: "candles", item: "candle", st1: "pouring", st2: "trimming", st3: "packaging", verb3: "packs" },
    { firm: "A tile factory", items: "floor tiles", itemsShort: "tiles", item: "tile", st1: "pressing", st2: "glazing and firing", st3: "packaging", verb3: "packs" },
] as const;

/** Process costing family 1 (anonymous firm). */
const CA_PROC_KAYAK_SCENARIOS = [
    { firm: "A kayak manufacturer", firmL: "a kayak manufacturer", dept: "assembly department", items: "kayaks" },
    { firm: "A tent maker", firmL: "a tent maker", dept: "sewing department", items: "tents" },
    { firm: "A guitar workshop", firmL: "a guitar workshop", dept: "finishing department", items: "guitars" },
    { firm: "An e-bike assembler", firmL: "an e-bike assembler", dept: "assembly department", items: "e-bikes" },
    { firm: "A surfboard maker", firmL: "a surfboard maker", dept: "coating department", items: "surfboards" },
] as const;

/** Process costing family 2 (named firm, possessive). */
const CA_PROC_AURORA_SCENARIOS = [
    { firmPoss: "Aurora Scooters'", dept: "assembly department", items: "e-scooters", itemsShort: "scooters" },
    { firmPoss: "Helix Vacuums'", dept: "assembly department", items: "vacuum cleaners", itemsShort: "vacuums" },
    { firmPoss: "Marrow Drums'", dept: "finishing department", items: "drum kits", itemsShort: "kits" },
    { firmPoss: "Solvik Heaters'", dept: "assembly department", items: "heat pumps", itemsShort: "units" },
] as const;

/** ABC family 1: named firm with two product lines. */
const CA_ABC_LUMEN_SCENARIOS = [
    { firm: "Lumen Candle Works", line1: "Aroma", line2: "Deco", item: "candle", items: "candles" },
    { firm: "Brightwater Soaps", line1: "Herbal", line2: "Marine", item: "bar", items: "bars" },
    { firm: "Terrazza Tiles", line1: "Rustic", line2: "Glossy", item: "tile", items: "tiles" },
    { firm: "Nordpine Pencils", line1: "Sketch", line2: "Studio", item: "pencil", items: "pencils" },
] as const;

/** ABC family 2: named firm with three product lines. */
const CA_ABC_RHEIN_SCENARIOS = [
    { firm: "Rhein Paintworks", lines: ["Wall", "Lagoon", "Metallic"], item: "can", items: "cans", kind: "paint" },
    { firm: "Donau Beverages", lines: ["Citrus", "Berry", "Cola"], item: "bottle", items: "bottles", kind: "soda" },
    { firm: "Isar Cereals", lines: ["Crunchy", "Choco", "Fruity"], item: "box", items: "boxes", kind: "cereal" },
    { firm: "Elbe Coatings", lines: ["Primer", "Gloss", "Matte"], item: "tin", items: "tins", kind: "coating" },
] as const;

/** Income statements family 1: two models. */
const CA_PL_CARGOLINE_SCENARIOS = [
    { firm: "Cargoline", what: "bike trailers", a: "City", b: "Cargo", unit: "trailer" },
    { firm: "Voltaro", what: "e-bikes", a: "Urban", b: "Trail", unit: "bike" },
    { firm: "Kestrel Kites", what: "kites", a: "Breeze", b: "Storm", unit: "kite" },
    { firm: "Pinewood Sleds", what: "sleds", a: "Junior", b: "Racer", unit: "sled" },
] as const;

/** Income statements family 2: two models, possessive firm. */
const CA_PL_TORRINO_SCENARIOS = [
    { firm: "Torrino Espresso Machines", a: "Uno", b: "Duo", items: "machines" },
    { firm: "Kettleworth Appliances", a: "Basic", b: "Pro", items: "kettles" },
    { firm: "Brandt Grills", a: "Compact", b: "Family", items: "grills" },
    { firm: "Velo Rossa Bikes", a: "Sprint", b: "Tour", items: "bikes" },
] as const;

const CA_CVP_BE_QTY_SCENARIOS = [
    { firm: "Lakeside Outfitters", items: "camping stoves", item: "stove" },
    { firm: "Ridgeway Gear", items: "headlamps", item: "headlamp" },
    { firm: "Tidewater Supply", items: "dry bags", item: "dry bag" },
    { firm: "Alpenrose Sports", items: "sleeping pads", item: "sleeping pad" },
] as const;

const CA_CVP_BE_REVENUE_SCENARIOS = [
    { firm: "Lakeside Outfitters", items: "camping lanterns" },
    { firm: "Ridgeway Gear", items: "trekking poles" },
    { firm: "Tidewater Supply", items: "life vests" },
    { firm: "Alpenrose Sports", items: "climbing helmets" },
] as const;

const CA_CVP_AFTER_TAX_SCENARIOS = [
    { firm: "Lakeside Outfitters", items: "cook sets" },
    { firm: "Ridgeway Gear", items: "backpacks" },
    { firm: "Tidewater Supply", items: "hammocks" },
    { firm: "Alpenrose Sports", items: "snowshoes" },
] as const;

const CA_CVP_TARGET_ROS_SCENARIOS = [
    { firm: "Lakeside Outfitters", items: "trekking tents", itemsShort: "tents" },
    { firm: "Ridgeway Gear", items: "ski jackets", itemsShort: "jackets" },
    { firm: "Tidewater Supply", items: "inflatable kayaks", itemsShort: "kayaks" },
    { firm: "Alpenrose Sports", items: "mountain bikes", itemsShort: "bikes" },
] as const;

const CA_CVP_MOS_SCENARIOS = [
    { firm: "Lakeside Outfitters", items: "insulated bottles", item: "bottle" },
    { firm: "Ridgeway Gear", items: "rain ponchos", item: "poncho" },
    { firm: "Tidewater Supply", items: "camp chairs", item: "chair" },
    { firm: "Alpenrose Sports", items: "fleece blankets", item: "blanket" },
] as const;

const CA_CVP_SALES_MIX_SCENARIOS = [
    { firm: "Lakeside Outfitters", As: "gas cartridges", as: "cartridges", a: "cartridge", Bs: "camping stoves", b: "stove" },
    { firm: "Ridgeway Gear", As: "spare tubes", as: "tubes", a: "tube", Bs: "bike pumps", b: "pump" },
    { firm: "Tidewater Supply", As: "fishing lures", as: "lures", a: "lure", Bs: "fishing rods", b: "rod" },
    { firm: "Alpenrose Sports", As: "climbing ropes", as: "ropes", a: "rope", Bs: "harnesses", b: "harness" },
] as const;

const CA_CVP_ROS_AT_VOLUME_SCENARIOS = [
    { intro: "Fjordlys, a Norwegian outdoor-lamp maker", item: "storm lantern", items: "lanterns" },
    { intro: "Solbrand, a Danish grill maker", item: "table grill", items: "grills" },
    { intro: "Kaltberg, an Austrian ski-gear maker", item: "ski helmet", items: "helmets" },
    { intro: "Marisol, a Portuguese beachwear maker", item: "beach tent", items: "tents" },
] as const;

const CA_CVP_FIXED_COST_REDUCTION_SCENARIOS = [
    { firm: "Fjordlys", items: "camping heaters", itemsShort: "heaters" },
    { firm: "Solbrand", items: "charcoal grills", itemsShort: "grills" },
    { firm: "Kaltberg", items: "ski goggles", itemsShort: "goggles" },
    { firm: "Marisol", items: "beach umbrellas", itemsShort: "umbrellas" },
] as const;

const CA_CVP_TAX_TRAP_SCENARIOS = [
    { firm: "Fjordlys", item: "trekking stove", itemShort: "stove" },
    { firm: "Solbrand", item: "smoker grill", itemShort: "grill" },
    { firm: "Kaltberg", item: "sled", itemShort: "sled" },
    { firm: "Marisol", item: "snorkel set", itemShort: "set" },
] as const;

const CA_CVP_CAMPAIGN_SCENARIOS = [
    { firm: "Fjordlys", items: "solar lanterns", itemsShort: "lanterns" },
    { firm: "Solbrand", items: "pizza ovens", itemsShort: "ovens" },
    { firm: "Kaltberg", items: "ski poles", itemsShort: "poles" },
    { firm: "Marisol", items: "paddle boards", itemsShort: "boards" },
] as const;

const CA_CVP_BUNDLE_SCENARIOS = [
    { firm: "Fjordlys", a: "camping lantern", aShort: "lantern", b: "power bank", bShort: "power bank" },
    { firm: "Solbrand", a: "table grill", aShort: "grill", b: "grill cover", bShort: "cover" },
    { firm: "Kaltberg", a: "ski helmet", aShort: "helmet", b: "visor", bShort: "visor" },
    { firm: "Marisol", a: "beach chair", aShort: "chair", b: "parasol", bShort: "parasol" },
] as const;

const CA_CVP_PRETAX_ROS_SCENARIOS = [
    { firm: "Fjordlys", items: "thermo mugs", itemsShort: "mugs" },
    { firm: "Solbrand", items: "grill spatulas", itemsShort: "spatulas" },
    { firm: "Kaltberg", items: "hand warmers", itemsShort: "warmers" },
    { firm: "Marisol", items: "beach towels", itemsShort: "towels" },
] as const;

const CA_PROG_RELATIVE_CM_SCENARIOS = [
    { item: "A workshop desk", itemShort: "desk", machine: "the CNC machine" },
    { item: "A cast-iron skillet", itemShort: "skillet", machine: "the casting line" },
    { item: "A leather satchel", itemShort: "satchel", machine: "the stitching machine" },
    { item: "A ceramic vase", itemShort: "vase", machine: "the kiln" },
] as const;

/** Two products on one bottleneck machine (a is the better-ranked product). */
const CA_PROG_TWO_PRODUCTS_SCENARIOS = [
    { firm: "A furniture maker", a: "desk", as: "desks", b: "shelf", bs: "shelves", machine: "CNC machine" },
    { firm: "A metal workshop", a: "gate", as: "gates", b: "railing", bs: "railings", machine: "laser cutter" },
    { firm: "A leather workshop", a: "satchel", as: "satchels", b: "belt", bs: "belts", machine: "stitching machine" },
    { firm: "A glass studio", a: "vase", as: "vases", b: "bowl", bs: "bowls", machine: "furnace" },
] as const;

const CA_PROG_OUTSOURCING_SCENARIOS = [
    { firm: "A stationery producer", item: "notebook", items: "notebooks" },
    { firm: "A tea merchant", item: "tin", items: "tins" },
    { firm: "A sock manufacturer", item: "pair", items: "pairs" },
    { firm: "A candle maker", item: "candle", items: "candles" },
] as const;

/** Full-capacity displacement: xs is the better product, ys the displaced one, os the order. */
const CA_PROG_PRICE_FLOOR_SCENARIOS = [
    { firm: "A furniture maker", machine: "CNC machine", xs: "desks", ys: "shelves", os: "sideboards", o: "sideboard" },
    { firm: "A metal workshop", machine: "laser cutter", xs: "gates", ys: "railings", os: "balcony frames", o: "frame" },
    { firm: "A leather workshop", machine: "stitching machine", xs: "satchels", ys: "belts", os: "saddle bags", o: "saddle bag" },
    { firm: "A print shop", machine: "press", xs: "posters", ys: "flyers", os: "brochures", o: "brochure" },
] as const;

/** Joinery-style firm with one bottleneck machine, used by three production-program items. */
const CA_PROG_LINDQVIST_SCENARIOS = [
    { firm: "Lindqvist Joinery", firmIntro: "Lindqvist Joinery in Stockholm", machine: "cutting machine", machineShort: "machine", machineProg: "cutting-machine", A: "cutting boards", a: "cutting board", as: "boards", B: "serving trays", b: "tray", bs: "trays", customer: "A hotel chain", order: "custom coat racks", orderOne: "coat rack", extra: "spice rack" },
    { firm: "Tovar Ceramics", firmIntro: "Tovar Ceramics in Valencia", machine: "kiln", machineShort: "kiln", machineProg: "kiln", A: "mugs", a: "mug", as: "mugs", B: "bowls", b: "bowl", bs: "bowls", customer: "A cafe chain", order: "custom espresso cups", orderOne: "cup", extra: "butter dish" },
    { firm: "Marra Knitwear", firmIntro: "Marra Knitwear in Bologna", machine: "knitting machine", machineShort: "machine", machineProg: "knitting-machine", A: "scarves", a: "scarf", as: "scarves", B: "beanies", b: "beanie", bs: "beanies", customer: "A gym chain", order: "branded headbands", orderOne: "headband", extra: "wrist warmer" },
    { firm: "Heron Leathercraft", firmIntro: "Heron Leathercraft in London", machine: "stitching machine", machineShort: "machine", machineProg: "stitching-machine", A: "wallets", a: "wallet", as: "wallets", B: "belts", b: "belt", bs: "belts", customer: "An airline", order: "embossed luggage tags", orderOne: "tag", extra: "key fob" },
] as const;

const CA_PROG_FORGONE_CM_SCENARIOS = [
    { intro: "Vela Marine, a boatyard in Venice", line: "laminating line", xs: "rowing boats", xsShort: "boats", ys: "paddle boards", customer: "A marina chain", os: "kayaks" },
    { intro: "Ferro Forge, a smithy in Prague", line: "forging line", xs: "axe heads", xsShort: "axes", ys: "horseshoes", customer: "A riding-school chain", os: "gate hinges" },
    { intro: "Nubia Textiles, a weaving mill in Milan", line: "loom line", xs: "wool blankets", xsShort: "blankets", ys: "scarves", customer: "A hotel chain", os: "table runners" },
    { intro: "Kite Loft, a tent maker in Dublin", line: "sewing line", xs: "camping tents", xsShort: "tents", ys: "sun shades", customer: "A festival organizer", os: "party tents" },
] as const;

/** Product costing family 2: one firm, two main products (a, b), a side product (c) and its raw material. */
const CA_PC_MARLIN_SCENARIOS = [
    { firm: "Marlin Surfboards", firmIntro: "Marlin Surfboards in Lisbon", a: "shortboard", as: "shortboards", b: "longboard", bs: "longboards", mat: "foam", matShort: "foam", verb: "Shaping", c: "paddle", cs: "paddles", unit: "board" },
    { firm: "Alder Skis", firmIntro: "Alder Skis in Innsbruck", a: "touring ski", as: "touring skis", b: "freeride ski", bs: "freeride skis", mat: "ash wood", matShort: "wood", verb: "Pressing", c: "pole", cs: "poles", unit: "ski" },
    { firm: "Brava Guitars", firmIntro: "Brava Guitars in Madrid", a: "classical guitar", as: "classical guitars", b: "flamenco guitar", bs: "flamenco guitars", mat: "cedar wood", matShort: "wood", verb: "Carving", c: "strap", cs: "straps", unit: "guitar" },
    { firm: "Kolva Kayaks", firmIntro: "Kolva Kayaks in Oslo", a: "sea kayak", as: "sea kayaks", b: "river kayak", bs: "river kayaks", mat: "plastic pellets", matShort: "pellets", verb: "Molding", c: "paddle", cs: "paddles", unit: "kayak" },
] as const;

const CA_PC_EQUIVALENCE_LINE_SCENARIOS = [
    { intro: "Savonne, a Marseille soap maker", units: "bars", a: "Classic", b: "Grand", weight: "bar weight" },
    { intro: "Dolce Vita, a Turin chocolatier", units: "chocolate bars", a: "Mini", b: "Maxi", weight: "bar weight" },
    { intro: "Nordbrot, an Oslo bakery", units: "loaves", a: "Half", b: "Whole", weight: "loaf weight" },
    { intro: "Alba Wax, a Lisbon candle maker", units: "candles", a: "Slim", b: "Pillar", weight: "candle weight" },
] as const;

const CA_PC_EQUIVALENCE_VARIABLE_SCENARIOS = [
    { firm: "Terra Ceramica", items: "planters", item: "planter", a: "Small", b: "Large", process: "molding process" },
    { firm: "Ferrum Cookware", items: "casserole pots", item: "pot", a: "Compact", b: "Family", process: "casting process" },
    { firm: "Bergstein Stoneworks", items: "stone vases", item: "vase", a: "Mini", b: "Grande", process: "carving process" },
    { firm: "Verdant Pots", items: "planter boxes", item: "box", a: "Short", b: "Long", process: "pressing process" },
] as const;

const CA_PC_MULTISTAGE2_SCENARIOS = [
    { firm: "Alpenglas", items: "drinking glasses", itemsShort: "glasses", item: "glass", st1: "forming", st2: "cooling", loss: "breakage" },
    { firm: "Rondo Ceramics", items: "dinner plates", itemsShort: "plates", item: "plate", st1: "pressing", st2: "firing", loss: "breakage" },
    { firm: "Fjell Knives", items: "knife blades", itemsShort: "blades", item: "blade", st1: "forging", st2: "hardening", loss: "rejects" },
    { firm: "Bel Cuoio", items: "leather wallets", itemsShort: "wallets", item: "wallet", st1: "cutting", st2: "stitching", loss: "rejects" },
] as const;

// ---------------------------------------------------------------- questions

export const costAccountingQuestions: Question[] = [
    // -------------------------------------------------- material valuation
    {
        id: "ca-mat-fifo-issue",
        subject: "cost_accounting",
        topic: "material_valuation",
        difficulty: "medium",
        kind: "numeric",
        unit: "EUR",
        source: "TUM Cost Accounting SS2015 Q16; WS17/18 Q19",
        build: (rng) => {
            const sc = rng.pick(CA_MAT_STOCK_SCENARIOS);
            const s = drawStock(rng);
            const afterC1 = s.begin - s.c1;
            const layers: Array<[number, number]> = [
                [afterC1, s.p0],
                [s.buy1, s.p1],
                [s.buy2, s.p2],
            ];
            const { cost, parts } = walkLayers(layers, s.c2);
            return {
                prompt: `${sc.firm} tracks its main raw material, ${sc.mat}, in March. The opening stock is ${n(s.begin)} kg at ${eur(s.p0)} per kg. On Mar 4, ${n(s.c1)} kg are issued to production. Then ${n(s.buy1)} kg are bought at ${eur(s.p1)} per kg (Mar 9) and ${n(s.buy2)} kg at ${eur(s.p2)} per kg (Mar 14). What is the cost of the material issue of ${n(s.c2)} kg on Mar 20 under the FIFO method?`,
                given: {
                    "Opening stock": `${n(s.begin)} kg at ${eur(s.p0)}/kg`,
                    "Issue Mar 4": `${n(s.c1)} kg`,
                    "Purchase Mar 9": `${n(s.buy1)} kg at ${eur(s.p1)}/kg`,
                    "Purchase Mar 14": `${n(s.buy2)} kg at ${eur(s.p2)}/kg`,
                    "Issue Mar 20": `${n(s.c2)} kg`,
                },
                answer: cost,
                explanation: String.raw`Under $FIFO$ (first in, first out) an issue is valued from the oldest layers still on stock. After the Mar 4 issue, ${n(afterC1)} kg of the opening layer remain, then the two purchase layers follow. The Mar 20 issue takes ${parts.join(", then ")}, so the material cost is ${eur(cost)}.`,
            };
        },
    },
    {
        id: "ca-mat-lifo-issue",
        subject: "cost_accounting",
        topic: "material_valuation",
        difficulty: "medium",
        kind: "numeric",
        unit: "EUR",
        source: "TUM Cost Accounting SS2015 Q17; WS17/18 Q18",
        build: (rng) => {
            const sc = rng.pick(CA_MAT_STOCK_SCENARIOS);
            const s = drawStock(rng);
            const afterC1 = s.begin - s.c1;
            // LIFO consumes newest layers first.
            const layers: Array<[number, number]> = [
                [s.buy2, s.p2],
                [s.buy1, s.p1],
                [afterC1, s.p0],
            ];
            const { cost, parts } = walkLayers(layers, s.c2);
            return {
                prompt: `${sc.firm} values ${sc.mat} with a perpetual LIFO system. Opening stock in March: ${n(s.begin)} kg at ${eur(s.p0)} per kg. Movements: issue of ${n(s.c1)} kg (Mar 4), purchase of ${n(s.buy1)} kg at ${eur(s.p1)} per kg (Mar 9), purchase of ${n(s.buy2)} kg at ${eur(s.p2)} per kg (Mar 14). What is the cost of the issue of ${n(s.c2)} kg on Mar 20?`,
                given: {
                    "Opening stock": `${n(s.begin)} kg at ${eur(s.p0)}/kg`,
                    "Issue Mar 4": `${n(s.c1)} kg`,
                    "Purchase Mar 9": `${n(s.buy1)} kg at ${eur(s.p1)}/kg`,
                    "Purchase Mar 14": `${n(s.buy2)} kg at ${eur(s.p2)}/kg`,
                    "Issue Mar 20": `${n(s.c2)} kg`,
                },
                answer: cost,
                explanation: String.raw`Under $LIFO$ (last in, first out) an issue is valued from the newest layers on stock at that date. On Mar 20 the newest layer is the Mar 14 purchase, then the Mar 9 purchase, then the opening stock. The issue takes ${parts.join(", then ")}, so the material cost is ${eur(cost)}.`,
            };
        },
    },
    {
        id: "ca-mat-moving-average",
        subject: "cost_accounting",
        topic: "material_valuation",
        difficulty: "medium",
        kind: "numeric",
        unit: "EUR",
        source: "TUM Cost Accounting SS2015, Q18",
        build: (rng) => {
            const sc = rng.pick(CA_MAT_STOCK_SCENARIOS);
            const s = drawStock(rng);
            const afterC1 = s.begin - s.c1;
            const qty = afterC1 + s.buy1 + s.buy2;
            const value = afterC1 * s.p0 + s.buy1 * s.p1 + s.buy2 * s.p2;
            const avg = value / qty;
            const answer = s.c2 * avg;
            return {
                prompt: `${sc.firm} values ${sc.mat} with moving average prices. Opening stock in March: ${n(s.begin)} kg at ${eur(s.p0)} per kg. Movements before the issue in question: issue of ${n(s.c1)} kg (Mar 4), purchase of ${n(s.buy1)} kg at ${eur(s.p1)} per kg (Mar 9), purchase of ${n(s.buy2)} kg at ${eur(s.p2)} per kg (Mar 14). What is the cost of the issue of ${n(s.c2)} kg on Mar 20?`,
                given: {
                    "Opening stock": `${n(s.begin)} kg at ${eur(s.p0)}/kg`,
                    "Issue Mar 4": `${n(s.c1)} kg`,
                    "Purchase Mar 9": `${n(s.buy1)} kg at ${eur(s.p1)}/kg`,
                    "Purchase Mar 14": `${n(s.buy2)} kg at ${eur(s.p2)}/kg`,
                    "Issue Mar 20": `${n(s.c2)} kg`,
                },
                answer,
                explanation: String.raw`The moving average is recomputed after every purchase: $\bar{p} = \frac{\text{stock value}}{\text{stock quantity}}$. Before Mar 20 the stock is ${n(afterC1)} kg × ${eur(s.p0)} + ${n(s.buy1)} kg × ${eur(s.p1)} + ${n(s.buy2)} kg × ${eur(s.p2)} = ${eur(value)} over ${n(qty)} kg, so the average price is ${eur(avg)}/kg. The issue costs ${n(s.c2)} kg × ${eur(avg)} = ${eur(answer)}.`,
            };
        },
    },
    {
        id: "ca-mat-expost-ending-value",
        subject: "cost_accounting",
        topic: "material_valuation",
        difficulty: "medium",
        kind: "numeric",
        unit: "EUR",
        source: "TUM Cost Accounting SS2015 Q19; SS2015 Q21",
        build: (rng) => {
            const sc = rng.pick(CA_MAT_STOCK_SCENARIOS);
            const s = drawStock(rng);
            const totalQty = s.begin + s.buy1 + s.buy2 + s.buy3;
            const totalValue = s.begin * s.p0 + s.buy1 * s.p1 + s.buy2 * s.p2 + s.buy3 * s.p3;
            const avg = totalValue / totalQty;
            const endQty = totalQty - s.c1 - s.c2;
            const answer = endQty * avg;
            return {
                prompt: `${sc.firm} values ${sc.mat} with ex-post (periodic) average prices. In March, the opening stock is ${n(s.begin)} kg at ${eur(s.p0)} per kg. Purchases: ${n(s.buy1)} kg at ${eur(s.p1)}, ${n(s.buy2)} kg at ${eur(s.p2)}, and ${n(s.buy3)} kg at ${eur(s.p3)} per kg. Issues to production: ${n(s.c1)} kg and ${n(s.c2)} kg. What is the value of the ending inventory?`,
                given: {
                    "Opening stock": `${n(s.begin)} kg at ${eur(s.p0)}/kg`,
                    "Purchases": `${n(s.buy1)} kg at ${eur(s.p1)}; ${n(s.buy2)} kg at ${eur(s.p2)}; ${n(s.buy3)} kg at ${eur(s.p3)}`,
                    "Issues": `${n(s.c1)} kg and ${n(s.c2)} kg`,
                },
                answer,
                explanation: String.raw`The ex-post average prices the whole period at one rate: $\bar{p} = \frac{\text{opening value} + \text{purchase value}}{\text{opening quantity} + \text{purchase quantity}}$. Here $\bar{p}$ = ${eur(totalValue)} / ${n(totalQty)} kg = ${eur(avg)}/kg. The ending quantity is ${n(totalQty)} − ${n(s.c1)} − ${n(s.c2)} = ${n(endQty)} kg, valued at ${n(endQty)} kg × ${eur(avg)} = ${eur(answer)}.`,
            };
        },
    },
    {
        id: "ca-mat-ending-quantity",
        subject: "cost_accounting",
        topic: "material_valuation",
        difficulty: "very_easy",
        kind: "numeric",
        unit: "units",
        source: "TUM Cost Accounting SS2015 Q20; WS17/18 Q17",
        build: (rng) => {
            const sc = rng.pick(CA_MAT_STOCK_SCENARIOS);
            const s = drawStock(rng);
            const answer = s.begin + s.buy1 + s.buy2 + s.buy3 - s.c1 - s.c2;
            return {
                prompt: `${sc.firm} records the following ${sc.mat} movements in March: opening stock ${n(s.begin)} kg, purchases of ${n(s.buy1)} kg, ${n(s.buy2)} kg and ${n(s.buy3)} kg, issues to production of ${n(s.c1)} kg and ${n(s.c2)} kg. How many kilograms of ${sc.mat} are on stock at the end of March?`,
                given: {
                    "Opening stock": `${n(s.begin)} kg`,
                    "Purchases": `${n(s.buy1)} kg, ${n(s.buy2)} kg, ${n(s.buy3)} kg`,
                    "Issues": `${n(s.c1)} kg, ${n(s.c2)} kg`,
                },
                answer,
                explanation: String.raw`$\text{ending stock} = \text{opening stock} + \sum \text{purchases} - \sum \text{issues}$: ${n(s.begin)} + ${n(s.buy1)} + ${n(s.buy2)} + ${n(s.buy3)} − ${n(s.c1)} − ${n(s.c2)} = ${n(answer)} kg. The quantity on stock is the same under every valuation method - only the value differs.`,
            };
        },
    },

    // -------------------------------------------------------- depreciation
    {
        id: "ca-dep-straight-line",
        subject: "cost_accounting",
        topic: "depreciation",
        difficulty: "very_easy",
        kind: "numeric",
        unit: "EUR",
        source: "TUM Cost Accounting SS2015, Q23",
        build: (rng) => {
            const sc = rng.pick(CA_DEP_STRAIGHT_LINE_SCENARIOS);
            const A = rng.int(4, 12) * 100000;
            const R = rng.int(1, 3) * 100000;
            const N = rng.int(4, 6);
            const answer = (A - R) / N;
            return {
                prompt: `${sc.firm} buys ${sc.asset} for ${eur(A)}. After a useful life of ${N} years it is expected to be sold at a residual value of ${eur(R)}. What is the yearly depreciation amount under the straight-line method?`,
                given: { "Acquisition cost": eur(A), "Residual value": eur(R), "Useful life": `${N} years` },
                answer,
                explanation: String.raw`$D = \frac{A_0 - RV}{N}$ - the depreciable base is acquisition cost minus residual value, spread evenly: (${eur(A)} − ${eur(R)}) / ${N} = ${eur(answer)} per year.`,
            };
        },
    },
    {
        id: "ca-dep-declining-rate",
        subject: "cost_accounting",
        topic: "depreciation",
        difficulty: "hard",
        kind: "numeric",
        unit: "percent",
        source: "TUM Cost Accounting SS2015, Q24",
        build: (rng) => {
            const sc = rng.pick(CA_DEP_DECLINING_RATE_SCENARIOS);
            const A = rng.int(4, 12) * 100000;
            const R = rng.int(1, 3) * 100000;
            const N = rng.int(4, 6);
            const rate = 1 - (R / A) ** (1 / N);
            const answer = rate * 100;
            return {
                prompt: `${sc.asset} is bought for ${eur(A)} and should be written down to its residual value of ${eur(R)} over ${N} years using declining-balance (geometric-degressive) depreciation. What constant yearly depreciation rate is required?`,
                given: { "Acquisition cost": eur(A), "Residual value": eur(R), "Useful life": `${N} years` },
                answer,
                explanation: String.raw`Under declining-balance depreciation the book value after $N$ years is $A_0 \cdot (1-r)^N = RV$, so $r = 1 - \sqrt[N]{\frac{RV}{A_0}}$. Here $r$ = 1 − (${eur(R)} / ${eur(A)})^(1/${N}) = ${pct(answer)}.`,
            };
        },
    },
    {
        id: "ca-dep-units-of-production",
        subject: "cost_accounting",
        topic: "depreciation",
        difficulty: "easy",
        kind: "numeric",
        unit: "EUR",
        source: "TUM Cost Accounting SS2015 Q22; WS17/18 Q23",
        build: (rng) => {
            const sc = rng.pick(CA_DEP_UNITS_OF_PRODUCTION_SCENARIOS);
            const A = rng.int(4, 12) * 100000;
            const R = rng.int(1, 3) * 100000;
            const capacity = rng.int(2, 5) * 100000;
            const output = rng.int(2, 9) * 1000;
            const perUnit = (A - R) / capacity;
            const answer = perUnit * output;
            return {
                prompt: `${sc.asset} costs ${eur(A)}, has a residual value of ${eur(R)} and a total lifetime capacity of ${n(capacity)} ${sc.units}. In April, ${n(output)} ${sc.units} are ${sc.done}. What is the depreciation amount for April under the units-of-production method?`,
                given: {
                    "Acquisition cost": eur(A),
                    "Residual value": eur(R),
                    "Lifetime capacity": `${n(capacity)} ${sc.units}`,
                    "Output in April": `${n(output)} ${sc.units}`,
                },
                answer,
                explanation: String.raw`$D = \frac{A_0 - RV}{\text{lifetime capacity}} \cdot \text{output of the period}$. The depreciation per unit is (${eur(A)} − ${eur(R)}) / ${n(capacity)} = ${eur(perUnit)}; for ${n(output)} ${sc.units} that is ${eur(answer)}.`,
            };
        },
    },
    {
        id: "ca-dep-arithmetic-degressive",
        subject: "cost_accounting",
        topic: "depreciation",
        difficulty: "medium",
        kind: "numeric",
        unit: "EUR",
        source: "TUM Cost Accounting WS17/18, Q24",
        build: (rng) => {
            const sc = rng.pick(CA_DEP_ARITHMETIC_DEGRESSIVE_SCENARIOS);
            const N = rng.int(4, 6);
            const dStep = rng.int(2, 12) * 1000;
            const base = (dStep * N * (N + 1)) / 2;
            const R = rng.int(1, 5) * 10000;
            const A = base + R;
            const t = rng.int(2, N);
            const answer = (N - t + 1) * dStep;
            return {
                prompt: `${sc.asset} is bought for ${eur(A)} and depreciated over ${N} years to a residual value of ${eur(R)} using arithmetic-degressive depreciation, the final year's amount equal to the yearly decrease. What is the depreciation amount in year ${t}?`,
                given: { "Acquisition cost": eur(A), "Residual value": eur(R), "Useful life": `${N} years`, "Year": String(t) },
                answer,
                explanation: String.raw`With arithmetic-degressive depreciation the yearly amounts are $N \cdot d, (N-1) \cdot d, \ldots, d$, so their sum is $d \cdot \frac{N (N+1)}{2} = A_0 - RV$. Here $d$ = (${eur(A)} − ${eur(R)}) / ${n((N * (N + 1)) / 2)} = ${eur(dStep)}. Year ${t} depreciates $(N - t + 1) \cdot d$ = ${n(N - t + 1)} × ${eur(dStep)} = ${eur(answer)}.`,
                hint: String.raw`Arithmetic-degressive depreciation falls by the same amount $d$ every year and depreciates exactly $d$ in the final year, so the schedule is $N \cdot d, (N-1) \cdot d, \ldots, d$ and year $t$ carries $(N - t + 1) \cdot d$. The whole schedule sums to $A_0 - RV$.`,
            };
        },
    },

    // ----------------------------------------------------- cost allocation
    {
        id: "ca-alloc-direct-transfer-price",
        subject: "cost_accounting",
        topic: "cost_allocation",
        difficulty: "easy",
        kind: "numeric",
        unit: "EUR",
        source: "TUM Cost Accounting SS2015 Q34; WS16/17 Q21; SS2017 Q17; WS17/18 Q20; Mock Exam Q34",
        build: (rng) => {
            const sc = rng.pick(CA_ALLOC_OAKLINE_SCENARIOS);
            const O2 = rng.int(40, 120) * 1000;
            const s21 = rng.int(4, 12) * 10;
            const h1 = rng.int(5, 20) * 10;
            const h2 = rng.int(5, 20) * 10;
            const answer = O2 / (h1 + h2);
            return {
                prompt: `${sc.firm} runs the indirect cost centers ${sc.ic1} and ${sc.ic2} and the direct cost centers ${sc.dc1} and ${sc.dc2}. The ${sc.ic2} has primary overheads of ${eur(O2)} and works ${n(s21)} hours for the ${sc.ic1}, ${n(h1)} hours for ${sc.dc1} and ${n(h2)} hours for ${sc.dc2}. What is the transfer price per ${sc.ic2} hour under the direct method?`,
                given: {
                    [`Primary overheads ${sc.ic2}`]: eur(O2),
                    [`Hours for ${sc.ic1}`]: `${n(s21)} h`,
                    [`Hours for ${sc.dc1}`]: `${n(h1)} h`,
                    [`Hours for ${sc.dc2}`]: `${n(h2)} h`,
                },
                answer,
                explanation: String.raw`The direct method ignores services delivered to other indirect cost centers: $tp = \frac{\text{primary overheads}}{\text{output to direct cost centers only}}$. So tp = ${eur(O2)} / (${n(h1)} h + ${n(h2)} h) = ${eur(answer)} per hour - the ${n(s21)} hours for the ${sc.ic1} drop out of the denominator.`,
            };
        },
    },
    {
        id: "ca-alloc-direct-amount",
        subject: "cost_accounting",
        topic: "cost_allocation",
        difficulty: "easy",
        kind: "numeric",
        unit: "EUR",
        source: "TUM Cost Accounting SS2015 Q33; WS17/18 Q21; SS2017 Q18; SS2018 Q34; WS18/19 Q34",
        build: (rng) => {
            const sc = rng.pick(CA_ALLOC_OAKLINE_SCENARIOS);
            const O1 = rng.int(20, 60) * 1000;
            const s12 = rng.int(20, 80) * 10;
            const d11 = rng.int(10, 30) * 100;
            const d12 = rng.int(10, 30) * 100;
            const tp = O1 / (d11 + d12);
            const answer = tp * d11;
            return {
                prompt: `${sc.firm}'s ${sc.ic1} (an indirect cost center) has primary overheads of ${eur(O1)}. It delivers ${n(s12)} ${sc.u1} of ${sc.svc1} to the ${sc.ic2} (another indirect cost center), ${n(d11)} ${sc.u1} to ${sc.dc1} and ${n(d12)} ${sc.u1} to ${sc.dc2} (the direct cost centers). Which costs are allocated from the ${sc.ic1} to ${sc.dc1} under the direct method?`,
                given: {
                    [`Primary overheads ${sc.ic1}`]: eur(O1),
                    [`${cap(sc.svc1)} to ${sc.ic2}`]: `${n(s12)} ${sc.u1}`,
                    [`${cap(sc.svc1)} to ${sc.dc1}`]: `${n(d11)} ${sc.u1}`,
                    [`${cap(sc.svc1)} to ${sc.dc2}`]: `${n(d12)} ${sc.u1}`,
                },
                answer,
                explanation: String.raw`Under the direct method, $tp = \frac{\text{primary overheads}}{\text{output to direct cost centers}}$ and the allocation is $tp \cdot \text{quantity received}$. Here tp = ${eur(O1)} / (${n(d11)} + ${n(d12)}) ${sc.u1} = ${eur(tp)}/${sc.u1}, so ${sc.dc1} is debited ${n(d11)} ${sc.u1} × ${eur(tp)} = ${eur(answer)}.`,
            };
        },
    },
    {
        id: "ca-alloc-stepladder-transfer-price",
        subject: "cost_accounting",
        topic: "cost_allocation",
        difficulty: "medium",
        kind: "numeric",
        unit: "EUR",
        source: "TUM Cost Accounting SS2015 Q35; SS2017 Q19; WS17/18 Q22; SS2018 Q36; Mock Exam Q36",
        build: (rng) => {
            const sc = rng.pick(CA_ALLOC_OAKLINE_SCENARIOS);
            const O1 = rng.int(20, 60) * 1000;
            const O2 = rng.int(40, 120) * 1000;
            const s12 = rng.int(20, 80) * 10;
            const d11 = rng.int(10, 30) * 100;
            const d12 = rng.int(10, 30) * 100;
            const s21 = rng.int(4, 12) * 10;
            const h1 = rng.int(5, 20) * 10;
            const h2 = rng.int(5, 20) * 10;
            const tp1 = O1 / (s12 + d11 + d12);
            const secondary = s12 * tp1;
            const answer = (O2 + secondary) / (h1 + h2);
            return {
                prompt: `${sc.firm} allocates support costs with the step-ladder method (German: Stufenleiterverfahren) in the sequence ${sc.ic1} → ${sc.ic2}. The ${sc.ic1} (primary overheads ${eur(O1)}) delivers ${n(s12)} ${sc.u1} to the ${sc.ic2}, ${n(d11)} ${sc.u1} to ${sc.dc1} and ${n(d12)} ${sc.u1} to ${sc.dc2}. The ${sc.ic2} (primary overheads ${eur(O2)}) works ${n(s21)} hours for the ${sc.ic1}, ${n(h1)} hours for ${sc.dc1} and ${n(h2)} hours for ${sc.dc2}. What is the transfer price per ${sc.ic2} hour?`,
                given: {
                    [`Primary overheads ${sc.ic1} / ${sc.ic2}`]: `${eur(O1)} / ${eur(O2)}`,
                    [`${sc.ic1} output`]: `${n(s12)} ${sc.u1} to ${sc.ic2}, ${n(d11)} ${sc.u1} to ${sc.dc1}, ${n(d12)} ${sc.u1} to ${sc.dc2}`,
                    [`${sc.ic2} output`]: `${n(s21)} h to ${sc.ic1}, ${n(h1)} h to ${sc.dc1}, ${n(h2)} h to ${sc.dc2}`,
                },
                answer,
                explanation: String.raw`In the step-ladder sequence, the first center allocates to all later centers, and back-deliveries are ignored: $tp_2 = \frac{\text{primary overheads}_2 + \text{costs received from center 1}}{\text{output to later centers}}$. The ${sc.ic1} rate is ${eur(O1)} / ${n(s12 + d11 + d12)} ${sc.u1} = ${eur(tp1)}/${sc.u1}, so the ${sc.ic2} receives ${n(s12)} ${sc.u1} × ${eur(tp1)} = ${eur(secondary)}. Its transfer price is (${eur(O2)} + ${eur(secondary)}) / (${n(h1)} + ${n(h2)}) h = ${eur(answer)} per hour - the ${n(s21)} hours delivered back to the ${sc.ic1} are not in the denominator.`,
            };
        },
    },
    {
        id: "ca-alloc-credits-debits-total",
        subject: "cost_accounting",
        topic: "cost_allocation",
        difficulty: "medium",
        kind: "numeric",
        unit: "EUR",
        source: "TUM Cost Accounting SS2015 Q36; SS2017 Q21; Mock Exam Q39; Mock Exam Q40",
        build: (rng) => {
            const sc = rng.pick(CA_ALLOC_OAKLINE_SCENARIOS);
            const P1 = rng.int(40, 120) * 1000;
            const t1 = rng.pick([1, 1.2, 1.5, 2]);
            const t2 = rng.int(20, 60);
            const d11 = rng.int(10, 30) * 100;
            const h1 = rng.int(5, 20) * 10;
            const answer = P1 + t1 * d11 + t2 * h1;
            return {
                prompt: `${sc.firm} applies the method of credits and debits (German: Kostenstellenausgleichsverfahren) with preset transfer prices: ${sc.svc1} from the ${sc.ic1} at ${eur(t1)} per ${sc.u1} and ${sc.ic2} work at ${eur(t2)} per hour. The direct cost center ${sc.dc1} has primary overheads of ${eur(P1)} and receives ${n(d11)} ${sc.u1} of ${sc.svc1} and ${n(h1)} ${sc.ic2} hours. What are ${sc.dc1}'s total overheads after the allocation (before any levy for cost coverage)?`,
                given: {
                    [`Primary overheads ${sc.dc1}`]: eur(P1),
                    [`Transfer price ${sc.svc1}`]: `${eur(t1)} per ${sc.u1}`,
                    [`Transfer price ${sc.ic2}`]: `${eur(t2)} per hour`,
                    [`${cap(sc.svc1)} received`]: `${n(d11)} ${sc.u1}`,
                    [`${sc.ic2} hours received`]: `${n(h1)} h`,
                },
                answer,
                explanation: String.raw`Under the method of credits and debits every service is priced at its preset transfer price: $\text{total overheads} = \text{primary overheads} + \sum tp_i \cdot x_i$. ${sc.dc1} is debited ${eur(P1)} + ${n(d11)} × ${eur(t1)} + ${n(h1)} × ${eur(t2)} = ${eur(answer)}. Because the preset prices need not clear the indirect centers' balances, a levy for cost coverage may follow.`,
            };
        },
    },
    {
        id: "ca-alloc-reciprocal-amount",
        subject: "cost_accounting",
        topic: "cost_allocation",
        difficulty: "hard",
        kind: "numeric",
        unit: "EUR",
        source: "TUM Cost Accounting SS2015 Q39; WS16/17 Q16; SS2018 Q39; WS18/19 Q39; Mock Exam Q38",
        build: (rng) => {
            const sc = rng.pick(CA_ALLOC_OAKLINE_SCENARIOS);
            const O1 = rng.int(20, 60) * 1000;
            const O2 = rng.int(40, 120) * 1000;
            const s12 = rng.int(20, 80) * 10;
            const d11 = rng.int(10, 30) * 100;
            const d12 = rng.int(10, 30) * 100;
            const s21 = rng.int(4, 12) * 10;
            const h1 = rng.int(5, 20) * 10;
            const h2 = rng.int(5, 20) * 10;
            const S1 = s12 + d11 + d12;
            const S2 = s21 + h1 + h2;
            // S1*c1 = O1 + s21*c2 ; S2*c2 = O2 + s12*c1
            const c2 = (O2 * S1 + s12 * O1) / (S1 * S2 - s12 * s21);
            const c1 = (O1 + s21 * c2) / S1;
            const answer = c2 * h1;
            return {
                prompt: `${sc.firm} allocates support costs with the reciprocal method based on equations. The ${sc.ic1} (primary overheads ${eur(O1)}) delivers ${n(s12)} ${sc.u1} to the ${sc.ic2}, ${n(d11)} ${sc.u1} to ${sc.dc1} and ${n(d12)} ${sc.u1} to ${sc.dc2}. The ${sc.ic2} (primary overheads ${eur(O2)}) works ${n(s21)} hours for the ${sc.ic1}, ${n(h1)} hours for ${sc.dc1} and ${n(h2)} hours for ${sc.dc2}. Which costs are allocated from the ${sc.ic2} to ${sc.dc1}?`,
                given: {
                    [`Primary overheads ${sc.ic1} / ${sc.ic2}`]: `${eur(O1)} / ${eur(O2)}`,
                    [`${sc.ic1} output`]: `${n(s12)} ${sc.u1} to ${sc.ic2}, ${n(d11)} ${sc.u1} to ${sc.dc1}, ${n(d12)} ${sc.u1} to ${sc.dc2}`,
                    [`${sc.ic2} output`]: `${n(s21)} h to ${sc.ic1}, ${n(h1)} h to ${sc.dc1}, ${n(h2)} h to ${sc.dc2}`,
                },
                answer,
                explanation: String.raw`The reciprocal method values each center's total output at its transfer price: $S_1 \cdot c_1 = O_1 + s_{21} \cdot c_2$ and $S_2 \cdot c_2 = O_2 + s_{12} \cdot c_1$. With total outputs $S_1$ = ${n(S1)} ${sc.u1} and $S_2$ = ${n(S2)} h, solving the two equations gives $c_1$ = ${eur(c1)}/${sc.u1} and $c_2$ = ${eur(c2)}/h. ${sc.dc1} is therefore debited ${n(h1)} h × ${eur(c2)} = ${eur(answer)} by the ${sc.ic2}.`,
            };
        },
    },

    // ----------------------------------------------------- product costing
    {
        id: "ca-pc-variable-mfg-cost",
        subject: "cost_accounting",
        topic: "product_costing",
        difficulty: "medium",
        kind: "numeric",
        unit: "EUR",
        source: "TUM Cost Accounting SS2015 Q29; SS2017 Q26",
        build: (rng) => {
            const sc = rng.pick(CA_PC_VELOTTA_SCENARIOS);
            const q1 = rng.int(4, 12) * 100;
            const q2 = rng.int(4, 12) * 100;
            const t1 = rng.int(2, 6);
            const t2 = rng.int(3, 8);
            const rate = rng.pick([0.5, 1, 1.5, 2]);
            const V = rate * (q1 * t1 + q2 * t2);
            const m2 = rng.int(2, 9);
            const l2 = rng.int(2, 9);
            const answer = m2 + l2 + rate * t2;
            return {
                prompt: `${sc.firm} makes ${sc.as} and ${sc.bs}. This period it produces ${n(q1)} ${sc.as} (${n(t1)} min each) and ${n(q2)} ${sc.bs} (${n(t2)} min each). Variable production overheads of ${eur(V)} are allocated on production time. A ${sc.b} carries direct material of ${eur(m2)} and direct labor of ${eur(l2)}. What are the variable manufacturing costs per unit of a ${sc.b}?`,
                given: {
                    [`Produced: ${sc.as} / ${sc.bs}`]: `${n(q1)} / ${n(q2)} units`,
                    [`Production time: ${sc.a} / ${sc.b}`]: `${n(t1)} / ${n(t2)} min per unit`,
                    "Variable production overheads": eur(V),
                    [`${cap(sc.b)} direct material / labor`]: `${eur(m2)} / ${eur(l2)} per unit`,
                },
                answer,
                explanation: String.raw`$k_{var} = \text{direct material} + \text{direct labor} + \text{variable overhead rate} \cdot t$. The overhead rate is ${eur(V)} / (${n(q1)} × ${n(t1)} + ${n(q2)} × ${n(t2)}) min = ${eur(rate)} per minute. A ${sc.b} takes ${n(t2)} min, so its variable manufacturing costs are ${eur(m2)} + ${eur(l2)} + ${n(t2)} × ${eur(rate)} = ${eur(answer)}.`,
            };
        },
    },
    {
        id: "ca-pc-total-cost-surcharge",
        subject: "cost_accounting",
        topic: "product_costing",
        difficulty: "hard",
        kind: "numeric",
        unit: "EUR",
        source: "TUM Cost Accounting SS2015 Q28; WS16/17 Q27; WS17/18 Q28",
        build: (rng) => {
            const sc = rng.pick(CA_PC_VELOTTA_SCENARIOS);
            const mfg1 = rng.int(15, 40);
            const mfg2 = rng.int(20, 60);
            const sold1 = rng.int(4, 12) * 100;
            const sold2 = rng.int(4, 12) * 100;
            const rate = rng.pick([0.05, 0.08, 0.1, 0.12, 0.2]);
            const base = mfg1 * sold1 + mfg2 * sold2;
            const sga = rate * base;
            const answer = mfg1 * (1 + rate);
            return {
                prompt: `${sc.firm} sells ${n(sold1)} ${sc.as} (full manufacturing costs ${eur(mfg1)} per unit) and ${n(sold2)} ${sc.bs} (full manufacturing costs ${eur(mfg2)} per unit). Administration and selling overheads of ${eur(sga)} are allocated as a surcharge on the manufacturing costs of the quantity sold. What is the total cost per unit of a ${sc.a}?`,
                given: {
                    [`Full manufacturing costs ${sc.a} / ${sc.b}`]: `${eur(mfg1)} / ${eur(mfg2)} per unit`,
                    [`Sold quantity ${sc.a} / ${sc.b}`]: `${n(sold1)} / ${n(sold2)} units`,
                    "Administration and selling overheads": eur(sga),
                },
                answer,
                explanation: String.raw`$k_{total} = k_{mfg} \cdot (1 + z)$ where $z = \frac{\text{admin and selling overheads}}{\text{manufacturing costs of quantity sold}}$. The base is ${n(sold1)} × ${eur(mfg1)} + ${n(sold2)} × ${eur(mfg2)} = ${eur(base)}, so z = ${eur(sga)} / ${eur(base)} = ${pct(rate * 100)}. Total cost per ${sc.a}: ${eur(mfg1)} × ${n(1 + rate)} = ${eur(answer)}.`,
            };
        },
    },
    {
        id: "ca-pc-target-margin-price",
        subject: "cost_accounting",
        topic: "product_costing",
        difficulty: "easy",
        kind: "numeric",
        unit: "EUR",
        source: "TUM Cost Accounting WS16/17, Q28",
        build: (rng) => {
            const sc = rng.pick(CA_PC_TARGET_MARGIN_SCENARIOS);
            const C = rng.int(40, 120);
            const m = rng.pick([10, 20, 25]);
            const answer = C / (1 - m / 100);
            return {
                prompt: `${sc.item} has total costs of ${eur(C)} per unit under absorption costing. At which price must it be sold to achieve a profit margin of ${pct(m)} of the sales price?`,
                given: { "Total cost per unit": eur(C), "Target profit margin (on sales)": pct(m) },
                answer,
                explanation: String.raw`With a margin on the sales price, $p \cdot (1 - m) = k_{total}$, so $p = \frac{k_{total}}{1 - m}$ = ${eur(C)} / ${n(1 - m / 100)} = ${eur(answer)}. Adding ${pct(m)} on top of cost instead would be the classic trap - that gives a smaller margin on the final price.`,
            };
        },
    },
    {
        id: "ca-pc-equivalence-number",
        subject: "cost_accounting",
        topic: "product_costing",
        difficulty: "medium",
        kind: "numeric",
        unit: "EUR",
        source: "TUM Cost Accounting Mock Exam Q25; Mock Exam Q26",
        build: (rng) => {
            const sc = rng.pick(CA_PC_EQUIVALENCE_NUMBER_SCENARIOS);
            const w1 = rng.pick([2, 3, 4]);
            const mult = rng.pick([1.5, 2, 2.5]);
            const w2 = w1 * mult;
            const q1 = rng.int(8, 20) * 100;
            const q2 = rng.int(8, 20) * 100;
            const k = rng.pick([2, 3, 4, 5]);
            const units = q1 + q2 * mult;
            const F = k * units;
            const answer = k * mult;
            return {
                prompt: `${sc.firm} produces the formats ${sc.a} (${n(w1)} kg per ${sc.unit}, ${n(q1)} units) and ${sc.b} (${n(w2)} kg per ${sc.unit}, ${n(q2)} units) in one process. Production overheads of ${eur(F)} are allocated with the equivalence number method (German: Äquivalenzziffernkalkulation), using product weight as the basis and ${sc.a} as the reference product (equivalence number 1). What are the production overheads per unit of ${sc.b}?`,
                given: {
                    [`Weight ${sc.a} / ${sc.b}`]: `${n(w1)} kg / ${n(w2)} kg`,
                    [`Produced ${sc.a} / ${sc.b}`]: `${n(q1)} / ${n(q2)} units`,
                    "Production overheads": eur(F),
                },
                answer,
                explanation: String.raw`Equivalence numbers scale each product to the reference: $e_{${sc.b}} = \frac{w_{${sc.b}}}{w_{${sc.a}}}$ = ${n(w2)} / ${n(w1)} = ${n(mult)}. The equivalent units are ${n(q1)} × 1 + ${n(q2)} × ${n(mult)} = ${n(units)}, so the cost per equivalent unit is ${eur(F)} / ${n(units)} = ${eur(k)}. A ${sc.b} ${sc.unit} carries ${n(mult)} × ${eur(k)} = ${eur(answer)}.`,
            };
        },
    },
    {
        id: "ca-pc-multistage-process",
        subject: "cost_accounting",
        topic: "product_costing",
        difficulty: "hard",
        kind: "numeric",
        unit: "EUR",
        source: "TUM Cost Accounting SS2017, Q33",
        build: (rng) => {
            const sc = rng.pick(CA_PC_MULTISTAGE_SCENARIOS);
            const u1 = rng.int(4, 10);
            const x1 = rng.int(8, 15) * 1000;
            const K1 = u1 * x1;
            const i2 = x1 - rng.int(0, 3) * 500;
            const r = rng.int(2, 8) * 100;
            const o2 = i2 - r;
            const K2 = rng.int(30, 90) * 1000;
            const o3 = o2 - rng.int(0, 4) * 500;
            const K3 = rng.int(10, 40) * 1000;
            const u2 = (K2 + i2 * u1) / o2;
            const answer = (K3 + o3 * u2) / o3;
            return {
                prompt: `${sc.firm} produces ${sc.items} in three stages and applies multi-stage process costing. Stage 1 (${sc.st1}) incurs ${eur(K1)} and outputs ${n(x1)} ${sc.itemsShort}. Stage 2 (${sc.st2}) incurs ${eur(K2)}, takes in ${n(i2)} ${sc.itemsShort}, loses ${n(r)} ${sc.itemsShort} as rejects and outputs ${n(o2)} ${sc.itemsShort}. Stage 3 (${sc.st3}) incurs ${eur(K3)} and ${sc.verb3} ${n(o3)} ${sc.itemsShort}. What are the total costs per finished ${sc.item} after stage 3?`,
                given: {
                    "Stage 1: costs / output": `${eur(K1)} / ${n(x1)} units`,
                    "Stage 2: costs / input / rejects / output": `${eur(K2)} / ${n(i2)} / ${n(r)} / ${n(o2)} units`,
                    "Stage 3: costs / input = output": `${eur(K3)} / ${n(o3)} units`,
                },
                answer,
                explanation: String.raw`Each stage divides its own costs plus the cost of the units it takes in by its output: $u_s = \frac{K_s + x_{in} \cdot u_{s-1}}{x_{out}}$. Stage 1: ${eur(K1)} / ${n(x1)} = ${eur(u1)}. Stage 2: (${eur(K2)} + ${n(i2)} × ${eur(u1)}) / ${n(o2)} = ${eur(u2)} - the rejects make the surviving units more expensive. Stage 3: (${eur(K3)} + ${n(o3)} × ${eur(u2)}) / ${n(o3)} = ${eur(answer)} per finished ${sc.item}.`,
            };
        },
    },

    // ----------------------------------------------------- process costing
    {
        id: "ca-proc-fifo-equivalent-units",
        subject: "cost_accounting",
        topic: "process_costing",
        difficulty: "medium",
        kind: "numeric",
        unit: "units",
        source: "TUM Cost Accounting SS2018 Q26; WS18/19 Q26",
        build: (rng) => {
            const sc = rng.pick(CA_PROC_KAYAK_SCENARIOS);
            const b = rng.int(2, 8) * 1000;
            const cb = rng.pick([0.2, 0.4, 0.6, 0.8]);
            const s = rng.int(20, 50) * 1000;
            const e = rng.int(2, 8) * 1000;
            const ce = rng.pick([0.2, 0.4, 0.6, 0.8]);
            const startedCompleted = s - e;
            const answer = b * (1 - cb) + startedCompleted + e * ce;
            return {
                prompt: `${sc.firm}'s ${sc.dept} starts July with ${n(b)} ${sc.items} in beginning work-in-process inventory, ${pct(cb * 100)} complete with respect to conversion costs. During July, ${n(s)} ${sc.items} are started; ending work-in-process inventory is ${n(e)} ${sc.items}, ${pct(ce * 100)} complete. Conversion costs are added evenly. Under the FIFO method, what are the equivalent units of work done in July for conversion costs?`,
                given: {
                    "Beginning WIP": `${n(b)} units, ${pct(cb * 100)} complete`,
                    "Started in July": `${n(s)} units`,
                    "Ending WIP": `${n(e)} units, ${pct(ce * 100)} complete`,
                },
                answer,
                explanation: String.raw`$EU_{FIFO} = x_{begin} \cdot (1 - c_{begin}) + x_{started \& completed} + x_{end} \cdot c_{end}$ - FIFO counts only the work done this period. Started and completed: ${n(s)} − ${n(e)} = ${n(startedCompleted)} units. So EU = ${n(b)} × ${n(1 - cb)} + ${n(startedCompleted)} + ${n(e)} × ${n(ce)} = ${n(answer)} equivalent units.`,
            };
        },
    },
    {
        id: "ca-proc-fifo-dm-started-completed",
        subject: "cost_accounting",
        topic: "process_costing",
        difficulty: "hard",
        kind: "numeric",
        unit: "EUR",
        source: "TUM Cost Accounting SS2018 Q27; WS18/19 Q27",
        build: (rng) => {
            const sc = rng.pick(CA_PROC_KAYAK_SCENARIOS);
            const b = rng.int(2, 8) * 1000;
            const s = rng.int(20, 50) * 1000;
            const e = rng.int(2, 8) * 1000;
            const dmRate = rng.int(20, 60) * 10;
            const D = dmRate * s;
            const startedCompleted = s - e;
            const answer = startedCompleted * dmRate;
            return {
                prompt: `${sc.firm} adds all direct materials at the beginning of the process in its ${sc.dept}. In July, ${n(s)} ${sc.items} are started and direct material costs of ${eur(D)} are added; beginning work-in-process inventory is ${n(b)} ${sc.items} and ending work-in-process inventory is ${n(e)} ${sc.items}. Under the FIFO method, what direct material costs are assigned to the units started and completed in July?`,
                given: {
                    "Started in July": `${n(s)} units`,
                    "Direct material costs added in July": eur(D),
                    "Beginning WIP": `${n(b)} units`,
                    "Ending WIP": `${n(e)} units`,
                },
                answer,
                explanation: String.raw`Because materials enter at the start, every unit started this period is complete for materials: $EU_{DM} = x_{started}$ and the cost per equivalent unit is $\frac{K_{DM}}{x_{started}}$ = ${eur(D)} / ${n(s)} = ${eur(dmRate)}. Units started and completed: ${n(s)} − ${n(e)} = ${n(startedCompleted)}, so they carry ${n(startedCompleted)} × ${eur(dmRate)} = ${eur(answer)}. The beginning WIP units get no July material costs under FIFO.`,
                hint: String.raw`When materials enter at the start of the process, every unit started in the period is already complete for materials, so the material cost per equivalent unit divides the period's material costs by the units started. Under FIFO the units started and completed are the units started minus the ending inventory.`,
            };
        },
    },
    {
        id: "ca-proc-wa-equivalent-units",
        subject: "cost_accounting",
        topic: "process_costing",
        difficulty: "medium",
        kind: "numeric",
        unit: "units",
        source: "TUM Cost Accounting SS2018 Q29; WS18/19 Q29",
        build: (rng) => {
            const sc = rng.pick(CA_PROC_KAYAK_SCENARIOS);
            const b = rng.int(2, 8) * 1000;
            const s = rng.int(20, 50) * 1000;
            const e = rng.int(2, 8) * 1000;
            const ce = rng.pick([0.2, 0.4, 0.6, 0.8]);
            const completed = b + s - e;
            const answer = completed + e * ce;
            return {
                prompt: `${sc.firm}'s ${sc.dept} has ${n(b)} ${sc.items} in beginning work-in-process inventory, starts ${n(s)} ${sc.items} in July and ends with ${n(e)} ${sc.items} in ending work-in-process inventory, ${pct(ce * 100)} complete with respect to conversion costs. Under the weighted-average method, what are the equivalent units of work done to date for conversion costs?`,
                given: {
                    "Beginning WIP": `${n(b)} units`,
                    "Started in July": `${n(s)} units`,
                    "Ending WIP": `${n(e)} units, ${pct(ce * 100)} complete`,
                },
                answer,
                explanation: String.raw`$EU_{WA} = x_{completed} + x_{end} \cdot c_{end}$ - the weighted-average method counts all work ever done on the units, so the beginning inventory's degree of completion is irrelevant. Completed and transferred out: ${n(b)} + ${n(s)} − ${n(e)} = ${n(completed)} units. EU = ${n(completed)} + ${n(e)} × ${n(ce)} = ${n(answer)} equivalent units.`,
            };
        },
    },
    {
        id: "ca-proc-wa-ending-wip",
        subject: "cost_accounting",
        topic: "process_costing",
        difficulty: "easy",
        kind: "numeric",
        unit: "EUR",
        source: "TUM Cost Accounting SS2018 Q28; SS2018 Q31; WS18/19 Q31",
        build: (rng) => {
            const sc = rng.pick(CA_PROC_KAYAK_SCENARIOS);
            const e = rng.int(2, 8) * 1000;
            const ce = rng.pick([0.2, 0.4, 0.6, 0.8]);
            const cw = rng.int(20, 70) * 10;
            const answer = e * ce * cw;
            return {
                prompt: `In the ${sc.dept} of ${sc.firmL}, ending work-in-process inventory is ${n(e)} ${sc.items}, ${pct(ce * 100)} complete with respect to conversion costs. The cost per equivalent unit for conversion costs is ${eur(cw)}. What amount of conversion costs is assigned to the ending work-in-process inventory?`,
                given: {
                    "Ending WIP": `${n(e)} units, ${pct(ce * 100)} complete`,
                    "Conversion cost per equivalent unit": eur(cw),
                },
                answer,
                explanation: String.raw`$K_{end} = x_{end} \cdot c_{end} \cdot k_{EU}$ - ending WIP absorbs conversion costs only for the fraction actually done: ${n(e)} × ${n(ce)} = ${n(e * ce)} equivalent units × ${eur(cw)} = ${eur(answer)}.`,
            };
        },
    },

    // --------------------------------------------- activity-based costing
    {
        id: "ca-abc-plantwide-rate",
        subject: "cost_accounting",
        topic: "activity_based_costing",
        difficulty: "easy",
        kind: "numeric",
        unit: "EUR",
        source: "TUM Cost Accounting WS18/19, Q17",
        build: (rng) => {
            const sc = rng.pick(CA_ABC_LUMEN_SCENARIOS);
            const S = rng.int(300, 900) * 1000;
            const I = rng.int(300, 900) * 1000;
            const mh = rng.int(15, 40) * 100;
            const answer = (S + I) / mh;
            return {
                prompt: `${sc.firm} budgets manufacturing overheads of ${eur(S)} for setups and ${eur(I)} for quality inspections, and ${n(mh)} machine hours for the year. Under a traditional costing system that allocates all manufacturing overheads on machine hours, what is the overhead rate per machine hour?`,
                given: {
                    "Setup overheads": eur(S),
                    "Inspection overheads": eur(I),
                    "Budgeted machine hours": `${n(mh)} h`,
                },
                answer,
                explanation: String.raw`$r = \frac{\text{total manufacturing overheads}}{\text{machine hours}}$ - traditional costing pools everything onto one base: (${eur(S)} + ${eur(I)}) / ${n(mh)} h = ${eur(answer)} per machine hour.`,
            };
        },
    },
    {
        id: "ca-abc-setup-cost-per-unit",
        subject: "cost_accounting",
        topic: "activity_based_costing",
        difficulty: "medium",
        kind: "numeric",
        unit: "EUR",
        source: "TUM Cost Accounting WS18/19, Q21",
        build: (rng) => {
            const sc = rng.pick(CA_ABC_LUMEN_SCENARIOS);
            const batch = 5000;
            const nBatches = rng.int(20, 50);
            const q = nBatches * batch;
            const sh = rng.pick([0.5, 1, 1.5, 2]);
            const otherSh = rng.int(40, 120);
            const totalSh = nBatches * sh + otherSh;
            const setupRate = rng.int(2, 9) * 1000;
            const S = setupRate * totalSh;
            const answer = (sh * setupRate) / batch;
            return {
                prompt: `${sc.firm} produces its ${sc.line1} ${sc.item} line in batches of ${n(batch)} units and budgets ${n(q)} ${sc.line1} ${sc.items} (${n(nBatches)} batches) for the year. Each ${sc.line1} batch requires ${n(sh)} setup hour${sh === 1 ? "" : "s"}. Total budgeted setup costs are ${eur(S)} for ${n(totalSh)} setup hours across all product lines. Under activity-based costing with setup hours as the cost driver, what are the setup overheads per ${sc.line1} ${sc.item}?`,
                given: {
                    "Batch size": `${n(batch)} units`,
                    [`${sc.line1} output`]: `${n(q)} units = ${n(nBatches)} batches`,
                    [`Setup hours per ${sc.line1} batch`]: `${n(sh)} h`,
                    "Total setup costs / total setup hours": `${eur(S)} / ${n(totalSh)} h`,
                },
                answer,
                explanation: String.raw`$k_{setup} = \frac{\text{setup rate} \cdot \text{setup hours per batch}}{\text{batch size}}$ with $\text{setup rate} = \frac{\text{total setup costs}}{\text{total setup hours}}$ = ${eur(S)} / ${n(totalSh)} h = ${eur(setupRate)} per setup hour. Per batch: ${n(sh)} h × ${eur(setupRate)} = ${eur(sh * setupRate)}; per ${sc.item}: ${eur(sh * setupRate)} / ${n(batch)} = ${eur(answer)}.`,
            };
        },
    },
    {
        id: "ca-abc-profit-per-unit",
        subject: "cost_accounting",
        topic: "activity_based_costing",
        difficulty: "hard",
        kind: "numeric",
        unit: "EUR",
        source: "TUM Cost Accounting WS18/19, Q22",
        build: (rng) => {
            const sc = rng.pick(CA_ABC_LUMEN_SCENARIOS);
            const batch = 5000;
            const nBatches = rng.int(20, 50);
            const p = rng.int(10, 16) * 0.5;
            const dm = rng.int(4, 16) * 0.05;
            const dl = rng.int(4, 16) * 0.05;
            const sh = rng.pick([0.5, 1, 1.5, 2]);
            const setupRate = rng.int(10, 30) * 100;
            const otherSh = rng.int(40, 120);
            const totalSh = nBatches * sh + otherSh;
            const S = setupRate * totalSh;
            const ih = rng.int(10, 20);
            const inspRate = rng.int(1, 3) * 100;
            const otherIh = rng.int(500, 2000);
            const totalIh = nBatches * ih + otherIh;
            const I = inspRate * totalIh;
            const ohPerUnit = (sh * setupRate + ih * inspRate) / batch;
            const answer = p - dm - dl - ohPerUnit;
            return {
                prompt: `${sc.firm} sells its ${sc.line2} ${sc.item} at ${eur(p)} per unit, with direct material of ${eur(dm)} and direct labor of ${eur(dl)} per unit. ${sc.line2} is made in batches of ${n(batch)} units (${n(nBatches)} batches budgeted). Each ${sc.line2} batch needs ${n(sh)} setup hour${sh === 1 ? "" : "s"} and ${n(ih)} inspection hours. Budgeted setup costs are ${eur(S)} for ${n(totalSh)} setup hours in total; budgeted inspection costs are ${eur(I)} for ${n(totalIh)} inspection hours in total. Under activity-based costing (cost drivers: setup hours, inspection hours), what is the operating profit per ${sc.line2} ${sc.item}?`,
                given: {
                    "Price / direct material / direct labor": `${eur(p)} / ${eur(dm)} / ${eur(dl)} per unit`,
                    [`Batch size / ${sc.line2} batches`]: `${n(batch)} units / ${n(nBatches)}`,
                    [`Per ${sc.line2} batch: setup / inspection hours`]: `${n(sh)} h / ${n(ih)} h`,
                    "Setup pool: costs / hours": `${eur(S)} / ${n(totalSh)} h`,
                    "Inspection pool: costs / hours": `${eur(I)} / ${n(totalIh)} h`,
                },
                answer,
                explanation: String.raw`$\pi = p - k_{DM} - k_{DL} - \frac{sh \cdot r_{setup} + ih \cdot r_{insp}}{\text{batch size}}$. The pool rates are ${eur(S)} / ${n(totalSh)} h = ${eur(setupRate)} per setup hour and ${eur(I)} / ${n(totalIh)} h = ${eur(inspRate)} per inspection hour. Overheads per batch: ${n(sh)} × ${eur(setupRate)} + ${n(ih)} × ${eur(inspRate)} = ${eur(sh * setupRate + ih * inspRate)}, i.e. ${eur(ohPerUnit)} per ${sc.item}. Profit per ${sc.item}: ${eur(p)} − ${eur(dm)} − ${eur(dl)} − ${eur(ohPerUnit)} = ${eur(answer)}.`,
            };
        },
    },

    // --------------------------------------------------- income statements
    {
        id: "ca-pl-noe-absorption-profit",
        subject: "cost_accounting",
        topic: "income_statements",
        difficulty: "very_hard",
        kind: "numeric",
        unit: "EUR",
        source: "TUM Cost Accounting SS2015 Q30; WS16/17 Q29",
        build: (rng) => {
            const sc = rng.pick(CA_PL_CARGOLINE_SCENARIOS);
            const m1 = rng.int(20, 60);
            const m2 = rng.int(20, 60);
            const q1p = rng.int(8, 15) * 1000;
            const q2p = rng.int(8, 15) * 1000;
            const d1 = rng.int(1, 3) * 1000; // product 1: inventory decrease
            const i2 = rng.int(1, 4) * 1000; // product 2: inventory increase
            const s1 = q1p + d1;
            const s2 = q2p - i2;
            const p1 = m1 + rng.int(10, 40);
            const p2 = m2 + rng.int(10, 40);
            const G = rng.int(20, 60) * 10000;
            const M1 = m1 * q1p;
            const M2 = m2 * q2p;
            const revenue = p1 * s1 + p2 * s2;
            const answer = revenue - M1 - M2 - G + i2 * m2 - d1 * m1;
            return {
                prompt: `${sc.firm} builds ${sc.what}. The ${sc.a} ${sc.unit} sells at ${eur(p1)}: ${n(q1p)} units are produced and ${n(s1)} are sold. The ${sc.b} ${sc.unit} sells at ${eur(p2)}: ${n(q2p)} units are produced and ${n(s2)} are sold. Full manufacturing costs of the quantity produced are ${eur(M1)} for ${sc.a} (${eur(m1)} per unit) and ${eur(M2)} for ${sc.b} (${eur(m2)} per unit). Opening stock of ${sc.a} is valued at the same unit manufacturing cost as this period's output. Administration and selling costs of the period are ${eur(G)}. What is the profit according to the nature of expense method under absorption costing (Gesamtkostenverfahren)?`,
                given: {
                    [`Price ${sc.a} / ${sc.b}`]: `${eur(p1)} / ${eur(p2)}`,
                    [`Produced ${sc.a} / ${sc.b}`]: `${n(q1p)} / ${n(q2p)} units`,
                    [`Sold ${sc.a} / ${sc.b}`]: `${n(s1)} / ${n(s2)} units`,
                    [`Manufacturing costs of production (${sc.a} / ${sc.b})`]: `${eur(M1)} / ${eur(M2)}`,
                    [`Unit manufacturing costs (${sc.a} / ${sc.b})`]: `${eur(m1)} / ${eur(m2)}`,
                    "Administration and selling costs": eur(G),
                },
                answer,
                explanation: String.raw`$\pi = \text{revenues} + \Delta \text{inventory increase} - \Delta \text{inventory decrease} - \text{total costs of the period}$, with inventory changes valued at full manufacturing costs. Revenues: ${n(s1)} × ${eur(p1)} + ${n(s2)} × ${eur(p2)} = ${eur(revenue)}. Total costs: ${eur(M1)} + ${eur(M2)} + ${eur(G)}. The ${sc.b} build-up adds ${n(i2)} × ${eur(m2)} = ${eur(i2 * m2)}; the ${sc.a} draw-down subtracts ${n(d1)} × ${eur(m1)} = ${eur(d1 * m1)}. Profit: ${eur(answer)}.`,
                hint: String.raw`The nature of expense method sets the period's total costs against revenues corrected for inventory changes: $\pi = R + \Delta \text{Inventory} - K_{period}$, where a stock build-up counts as positive and a draw-down as negative. Under absorption costing the inventory change is valued at full manufacturing costs per unit.`,
            };
        },
    },
    {
        id: "ca-pl-cos-variable-profit",
        subject: "cost_accounting",
        topic: "income_statements",
        difficulty: "medium",
        kind: "numeric",
        unit: "EUR",
        source: "TUM Cost Accounting WS16/17 Q32; WS17/18 Q29; Mock Exam Q30",
        build: (rng) => {
            const sc = rng.pick(CA_PL_CARGOLINE_SCENARIOS);
            const v1 = rng.int(10, 40);
            const v2 = rng.int(15, 60);
            const p1 = v1 + rng.int(5, 25);
            const p2 = v2 + rng.int(5, 25);
            const s1 = rng.int(4, 12) * 100;
            const s2 = rng.int(4, 12) * 100;
            const F = rng.int(5, 30) * 1000;
            const answer = (p1 - v1) * s1 + (p2 - v2) * s2 - F;
            return {
                prompt: `${sc.firm} sells ${n(s1)} ${sc.a} ${sc.unit}s (price ${eur(p1)}, variable costs ${eur(v1)} per unit) and ${n(s2)} ${sc.b} ${sc.unit}s (price ${eur(p2)}, variable costs ${eur(v2)} per unit). Total fixed costs of the period are ${eur(F)}. What is the profit according to the cost-of-sales method under variable costing (Umsatzkostenverfahren)?`,
                given: {
                    [`Price ${sc.a} / ${sc.b}`]: `${eur(p1)} / ${eur(p2)}`,
                    [`Variable costs ${sc.a} / ${sc.b}`]: `${eur(v1)} / ${eur(v2)} per unit`,
                    [`Sold ${sc.a} / ${sc.b}`]: `${n(s1)} / ${n(s2)} units`,
                    "Fixed costs of the period": eur(F),
                },
                answer,
                explanation: String.raw`$\pi = \sum_i (p_i - k_{var,i}) \cdot x_i - K_{fix}$ - under variable costing all fixed costs are period costs, and only the sold quantity matters. Contribution margins: ${n(s1)} × (${eur(p1)} − ${eur(v1)}) = ${eur((p1 - v1) * s1)} and ${n(s2)} × (${eur(p2)} − ${eur(v2)}) = ${eur((p2 - v2) * s2)}. Profit: ${eur((p1 - v1) * s1)} + ${eur((p2 - v2) * s2)} − ${eur(F)} = ${eur(answer)}.`,
            };
        },
    },
    {
        id: "ca-pl-inventory-decrease-value",
        subject: "cost_accounting",
        topic: "income_statements",
        difficulty: "easy",
        kind: "numeric",
        unit: "EUR",
        source: "TUM Cost Accounting WS17/18, Q30",
        build: (rng) => {
            const sc = rng.pick(CA_PL_CARGOLINE_SCENARIOS);
            const m1 = rng.int(4, 12);
            const m2 = rng.int(6, 15);
            const dec1 = rng.int(2, 8) * 100;
            const dec2 = rng.int(2, 8) * 100;
            const answer = dec1 * m1 + dec2 * m2;
            return {
                prompt: `${sc.firm}'s inventory of the ${sc.a} ${sc.unit} falls by ${n(dec1)} units and its inventory of the ${sc.b} ${sc.unit} falls by ${n(dec2)} units during the period. Full manufacturing costs are ${eur(m1)} per ${sc.a} and ${eur(m2)} per ${sc.b} ${sc.unit}. What is the value of the total inventory decrease in the income statement under the nature of expense method under absorption costing?`,
                given: {
                    [`Inventory decrease ${sc.a} / ${sc.b}`]: `${n(dec1)} / ${n(dec2)} units`,
                    [`Full manufacturing costs ${sc.a} / ${sc.b}`]: `${eur(m1)} / ${eur(m2)} per unit`,
                },
                answer,
                explanation: String.raw`$\Delta = \sum_i \Delta x_i \cdot k_{mfg,i}$ - under absorption costing, inventory changes are valued at full manufacturing costs: ${n(dec1)} × ${eur(m1)} + ${n(dec2)} × ${eur(m2)} = ${eur(answer)}. Administration and selling costs never enter inventory values.`,
            };
        },
    },

    // ----------------------------------------------------------------- CVP
    {
        id: "ca-cvp-breakeven-quantity",
        subject: "cost_accounting",
        topic: "cvp",
        difficulty: "very_easy",
        kind: "numeric",
        unit: "units",
        source: "TUM Cost Accounting WS16/17 Q33; SS2017 Q34; Mock Exam Q16",
        build: (rng) => {
            const sc = rng.pick(CA_CVP_BE_QTY_SCENARIOS);
            const a = rng.int(2, 8);
            const b = rng.int(2, 8);
            const c = rng.int(1, 4);
            const cm = rng.int(4, 20);
            const p = a + b + c + cm;
            const qStar = rng.int(5, 40) * 100;
            const F = qStar * cm;
            return {
                prompt: `${sc.firm} sells ${sc.items} at ${eur(p)} each. Variable costs per ${sc.item}: ${eur(a)} material, ${eur(b)} production, ${eur(c)} selling and shipping. Yearly fixed costs are ${eur(F)}. What is the break-even quantity?`,
                given: {
                    "Price": eur(p),
                    "Variable material / production / selling costs": `${eur(a)} / ${eur(b)} / ${eur(c)} per unit`,
                    "Fixed costs": eur(F),
                },
                answer: qStar,
                explanation: String.raw`$x_{BE} = \frac{K_{fix}}{p - k_{var}}$ - the contribution margin per ${sc.item} is ${eur(p)} − ${eur(a)} − ${eur(b)} − ${eur(c)} = ${eur(cm)}, so the break-even quantity is ${eur(F)} / ${eur(cm)} = ${n(qStar)} units.`,
            };
        },
    },
    {
        id: "ca-cvp-breakeven-revenue",
        subject: "cost_accounting",
        topic: "cvp",
        difficulty: "easy",
        kind: "numeric",
        unit: "EUR",
        source: "TUM Cost Accounting WS16/17 Q34; SS2017 Q35; WS17/18 Q34; SS2018 Q17; Mock Exam Q17",
        build: (rng) => {
            const sc = rng.pick(CA_CVP_BE_REVENUE_SCENARIOS);
            const a = rng.int(4, 15);
            const b = rng.int(3, 12);
            const cm = rng.int(5, 25);
            const p = a + b + cm;
            const qStar = rng.int(5, 40) * 100;
            const F = qStar * cm;
            const answer = qStar * p;
            return {
                prompt: `${sc.firm} sells ${sc.items} at ${eur(p)} each with variable costs of ${eur(a + b)} per unit (${eur(a)} material, ${eur(b)} production and selling). Yearly fixed costs are ${eur(F)}. What is the break-even revenue?`,
                given: {
                    "Price": eur(p),
                    "Variable costs": `${eur(a + b)} per unit`,
                    "Fixed costs": eur(F),
                },
                answer,
                explanation: String.raw`$R_{BE} = x_{BE} \cdot p = \frac{K_{fix}}{p - k_{var}} \cdot p$. The contribution margin is ${eur(p)} − ${eur(a + b)} = ${eur(cm)}, so $x_{BE}$ = ${eur(F)} / ${eur(cm)} = ${n(qStar)} units and the break-even revenue is ${n(qStar)} × ${eur(p)} = ${eur(answer)}.`,
            };
        },
    },
    {
        id: "ca-cvp-after-tax-target",
        subject: "cost_accounting",
        topic: "cvp",
        difficulty: "medium",
        kind: "numeric",
        unit: "units",
        source: "TUM Cost Accounting SS2017 Q37; SS2018 Q20",
        build: (rng) => {
            const sc = rng.pick(CA_CVP_AFTER_TAX_SCENARIOS);
            const cm = rng.pick([10, 20, 25, 50]);
            const v = rng.int(10, 60);
            const p = v + cm;
            const F = rng.int(2, 8) * 10000;
            const pre = rng.int(5, 20) * 10000;
            const tau = rng.pick([20, 25, 40]);
            const T = pre * (1 - tau / 100);
            const answer = (F + pre) / cm;
            return {
                prompt: `${sc.firm} sells ${sc.items} at ${eur(p)} each with variable costs of ${eur(v)} per unit and yearly fixed costs of ${eur(F)}. The profit tax rate is ${pct(tau)}. How many ${sc.items} must be sold to earn an after-tax profit of ${eur(T)}?`,
                given: {
                    "Price / variable costs": `${eur(p)} / ${eur(v)} per unit`,
                    "Fixed costs": eur(F),
                    "Tax rate": pct(tau),
                    "Target profit after tax": eur(T),
                },
                answer,
                explanation: String.raw`$x = \frac{K_{fix} + \frac{\pi_{target}}{1 - \tau}}{p - k_{var}}$ - the after-tax target must first be grossed up to a pre-tax profit: ${eur(T)} / ${n(1 - tau / 100)} = ${eur(pre)}. Then x = (${eur(F)} + ${eur(pre)}) / ${eur(cm)} = ${n(answer)} units.`,
            };
        },
    },
    {
        id: "ca-cvp-target-ros",
        subject: "cost_accounting",
        topic: "cvp",
        difficulty: "hard",
        kind: "numeric",
        unit: "units",
        source: "TUM Cost Accounting WS16/17 Q35; WS17/18 Q36; Mock Exam Q18",
        build: (rng) => {
            const sc = rng.pick(CA_CVP_TARGET_ROS_SCENARIOS);
            const p = rng.int(8, 15) * 10;
            const cm = p * rng.pick([0.4, 0.5, 0.6]);
            const v = p - cm;
            const F = rng.int(10, 50) * 1000;
            const tau = rng.pick([20, 25, 37]);
            const r = rng.pick([10, 15]);
            const denom = cm - ((r / 100) / (1 - tau / 100)) * p;
            const answer = Math.ceil(F / denom);
            return {
                prompt: `${sc.firm} sells ${sc.items} at ${eur(p)} each with variable costs of ${eur(v)} per unit and yearly fixed costs of ${eur(F)}. The profit tax rate is ${pct(tau)}. What is the minimum whole number of ${sc.itemsShort} that must be produced and sold to achieve an after-tax return on sales of at least ${pct(r)}?`,
                given: {
                    "Price / variable costs": `${eur(p)} / ${eur(v)} per unit`,
                    "Fixed costs": eur(F),
                    "Tax rate": pct(tau),
                    "Target after-tax return on sales": pct(r),
                },
                answer,
                explanation: String.raw`The condition is $(cm \cdot x - K_{fix}) \cdot (1 - \tau) \geq s \cdot p \cdot x$, which solves to $x \geq \frac{K_{fix}}{cm - \frac{s}{1-\tau} \cdot p}$. The contribution margin is ${eur(cm)}; the denominator is ${eur(cm)} − (${n(r / 100)} / ${n(1 - tau / 100)}) × ${eur(p)} = ${eur(denom)}. So x ≥ ${eur(F)} / ${eur(denom)} = ${n2(F / denom)}, i.e. at least ${n(answer)} ${sc.itemsShort}.`,
            };
        },
    },
    {
        id: "ca-cvp-margin-of-safety",
        subject: "cost_accounting",
        topic: "cvp",
        difficulty: "easy",
        kind: "numeric",
        unit: "percent",
        source: "TUM Cost Accounting SS2018, Q22",
        build: (rng) => {
            const sc = rng.pick(CA_CVP_MOS_SCENARIOS);
            const cm = rng.int(5, 20);
            const v = rng.int(5, 30);
            const p = v + cm;
            const qStar = rng.int(5, 30) * 100;
            const F = qStar * cm;
            const factor = rng.pick([1.25, 1.5, 2, 3]);
            const q = qStar * factor;
            const answer = ((q - qStar) / q) * 100;
            return {
                prompt: `${sc.firm} sells ${n(q)} ${sc.items} at ${eur(p)} each. Variable costs are ${eur(v)} per ${sc.item} and fixed costs are ${eur(F)}. What is the margin of safety percentage at this sales volume?`,
                given: {
                    "Price / variable costs": `${eur(p)} / ${eur(v)} per unit`,
                    "Fixed costs": eur(F),
                    "Sales volume": `${n(q)} units`,
                },
                answer,
                explanation: String.raw`$MoS\% = \frac{x - x_{BE}}{x}$ - the share of current sales that can be lost before hitting break-even. With cm = ${eur(cm)}, $x_{BE}$ = ${eur(F)} / ${eur(cm)} = ${n(qStar)} units, so MoS = (${n(q)} − ${n(qStar)}) / ${n(q)} = ${pct(answer)}.`,
            };
        },
    },
    {
        id: "ca-cvp-sales-mix-target",
        subject: "cost_accounting",
        topic: "cvp",
        difficulty: "medium",
        kind: "numeric",
        unit: "units",
        source: "TUM Cost Accounting SS2017 Q39; WS17/18 Q37; SS2018 Q23",
        build: (rng) => {
            const sc = rng.pick(CA_CVP_SALES_MIX_SCENARIOS);
            const k = rng.int(2, 4);
            const cmA = rng.int(3, 10);
            const cmB = rng.int(8, 25);
            const bcm = k * cmA + cmB;
            const bundles = rng.int(5, 40) * 100;
            const total = bundles * bcm;
            const F = Math.round((total * 0.3) / 1000) * 1000;
            const T = total - F;
            const answer = k * bundles;
            return {
                prompt: `${sc.firm} sells ${sc.As} (contribution margin ${eur(cmA)} per unit) and ${sc.Bs} (contribution margin ${eur(cmB)} per unit) in a constant sales mix of ${n(k)} ${sc.as} per ${sc.b}. Total fixed costs are ${eur(F)} and the target profit is ${eur(T)}. How many ${sc.As} are sold when the target is exactly reached?`,
                given: {
                    [`Contribution margin ${sc.a} / ${sc.b}`]: `${eur(cmA)} / ${eur(cmB)}`,
                    "Sales mix": `${n(k)} ${sc.as} : 1 ${sc.b}`,
                    "Fixed costs": eur(F),
                    "Target profit": eur(T),
                },
                answer,
                explanation: String.raw`Form a bundle of ${n(k)} ${sc.as} + 1 ${sc.b}: $cm_{bundle} = k \cdot cm_A + cm_B$ = ${n(k)} × ${eur(cmA)} + ${eur(cmB)} = ${eur(bcm)}. Required bundles: $\frac{K_{fix} + \pi_{target}}{cm_{bundle}}$ = (${eur(F)} + ${eur(T)}) / ${eur(bcm)} = ${n(bundles)}. That corresponds to ${n(k)} × ${n(bundles)} = ${n(answer)} ${sc.as}.`,
            };
        },
    },

    // -------------------------------------------------- production program
    {
        id: "ca-prog-relative-cm",
        subject: "cost_accounting",
        topic: "production_program",
        difficulty: "easy",
        kind: "numeric",
        unit: "EUR",
        source: "TUM Cost Accounting Mock Exam, Q22",
        build: (rng) => {
            const sc = rng.pick(CA_PROG_RELATIVE_CM_SCENARIOS);
            const v = rng.int(10, 40);
            const cm = rng.int(5, 25);
            const p = v + cm;
            const m = rng.pick([10, 12, 15, 20, 30]);
            const answer = (cm / m) * 60;
            return {
                prompt: `${sc.item} sells at ${eur(p)} with variable costs of ${eur(v)} per unit and occupies ${sc.machine} - the bottleneck - for ${n(m)} minutes per unit. What is the relative contribution margin of the ${sc.itemShort} per machine hour?`,
                given: {
                    "Price / variable costs": `${eur(p)} / ${eur(v)} per unit`,
                    "Machine time": `${n(m)} min per unit`,
                },
                answer,
                explanation: String.raw`$cm_{rel} = \frac{p - k_{var}}{\text{capacity required}}$ - contribution margin per unit of the scarce resource. Per unit: ${eur(p)} − ${eur(v)} = ${eur(cm)} over ${n(m)} min, i.e. ${eur(cm)} / ${n(m)} × 60 = ${eur(answer)} per machine hour. Ranking by relative contribution margin decides the production program under one binding constraint.`,
            };
        },
    },
    {
        id: "ca-prog-optimal-quantity",
        subject: "cost_accounting",
        topic: "production_program",
        difficulty: "hard",
        kind: "numeric",
        unit: "units",
        source: "TUM Cost Accounting WS16/17 Q38; WS16/17 Q39; Mock Exam Q20; Mock Exam Q21",
        build: (rng) => {
            const sc = rng.pick(CA_PROG_TWO_PRODUCTS_SCENARIOS);
            const tA = rng.pick([0.1, 0.2]);
            const tB = rng.pick([0.25, 0.5]);
            const cmA = tA * rng.int(30, 60);
            const cmB = tB * rng.int(10, 25);
            const maxA = rng.int(2, 6) * 1000;
            const partB = rng.int(2, 8) * 100;
            const H = tA * maxA + tB * partB;
            const maxB = partB + rng.int(2, 6) * 100;
            return {
                prompt: `${sc.firm} produces ${sc.as} and ${sc.bs} on one ${sc.machine} with a yearly capacity of ${n(H)} hours. A ${sc.a} takes ${n(tA)} hours and earns a contribution margin of ${eur(cmA)}; a ${sc.b} takes ${n(tB)} hours and earns ${eur(cmB)}. Maximum yearly sales are ${n(maxA)} ${sc.as} and ${n(maxB)} ${sc.bs}. Fixed costs are incurred either way. How many ${sc.bs} are produced in the profit-maximizing production program?`,
                given: {
                    "Machine capacity": `${n(H)} hours`,
                    [`Machine time ${sc.a} / ${sc.b}`]: `${n(tA)} / ${n(tB)} h per unit`,
                    [`Contribution margin ${sc.a} / ${sc.b}`]: `${eur(cmA)} / ${eur(cmB)}`,
                    [`Max sales ${sc.a} / ${sc.b}`]: `${n(maxA)} / ${n(maxB)} units`,
                },
                answer: partB,
                explanation: String.raw`With one binding constraint, rank by $cm_{rel} = \frac{cm}{t}$: ${sc.as} earn ${eur(cmA / tA)} per hour, ${sc.bs} ${eur(cmB / tB)} per hour - ${sc.as} first. ${cap(sc.as)} use ${n(maxA)} × ${n(tA)} = ${n(tA * maxA)} h, leaving ${n(H)} − ${n(tA * maxA)} = ${n(H - tA * maxA)} h. That funds ${n(H - tA * maxA)} / ${n(tB)} = ${n(partB)} ${sc.bs} (below their sales cap of ${n(maxB)}).`,
            };
        },
    },
    {
        id: "ca-prog-outsourcing-threshold",
        subject: "cost_accounting",
        topic: "production_program",
        difficulty: "medium",
        kind: "numeric",
        unit: "units",
        source: "TUM Cost Accounting SS2017 Q38; Mock Exam Q19",
        build: (rng) => {
            const sc = rng.pick(CA_PROG_OUTSOURCING_SCENARIOS);
            const vs = rng.pick([0.5, 1, 2, 2.5]);
            const q = rng.int(5, 40) * 100;
            const F = q * vs;
            return {
                prompt: `${sc.firm} currently pays variable selling costs of ${eur(vs)} per ${sc.item} sold. A distribution partner offers to take over all selling activities for a fixed fee of ${eur(F)} per year, eliminating the variable selling costs entirely. From what yearly sales volume onward is the outsourcing offer worthwhile?`,
                given: {
                    "Variable selling costs (in-house)": `${eur(vs)} per unit`,
                    "Fixed fee of the partner": `${eur(F)} per year`,
                },
                answer: q,
                explanation: String.raw`At the indifference volume the saved variable costs equal the new fixed fee: $x \cdot k_{var,sell} = F$, so $x = \frac{F}{k_{var,sell}}$ = ${eur(F)} / ${eur(vs)} = ${n(q)} ${sc.items}. Above ${n(q)} units the fixed fee is cheaper than the variable costs it replaces.`,
            };
        },
    },
    {
        id: "ca-prog-price-floor",
        subject: "cost_accounting",
        topic: "production_program",
        difficulty: "very_hard",
        kind: "numeric",
        unit: "EUR",
        source: "TUM Cost Accounting WS16/17, Q40",
        build: (rng) => {
            const sc = rng.pick(CA_PROG_PRICE_FLOOR_SCENARIOS);
            const tX = rng.pick([30, 40]);
            const tY = 2 * tX;
            const Q = rng.int(10, 25) * 100;
            const qY = Q - rng.int(2, 8) * 100;
            const dX = 2 * (Q - qY);
            const qX = dX + rng.int(5, 15) * 100;
            const cmY = rng.int(20, 60);
            const cmX = Math.ceil(cmY / 2) + rng.int(5, 40);
            const vO = rng.int(40, 90);
            const opp = qY * cmY + dX * cmX;
            const answer = vO + opp / Q;
            return {
                prompt: `${sc.firm}'s ${sc.machine} is fully utilized producing ${n(qX)} ${sc.xs} (${n(tX)} min each, contribution margin ${eur(cmX)}) and ${n(qY)} ${sc.ys} (${n(tY)} min each, contribution margin ${eur(cmY)}). A retailer asks it to produce ${n(Q)} ${sc.os}, each taking ${n(tY)} min on the machine and causing variable costs of ${eur(vO)}. What is the lower price limit per ${sc.o} at which the order is worth accepting?`,
                given: {
                    "Current program": `${n(qX)} ${sc.xs} (${n(tX)} min, cm ${eur(cmX)}), ${n(qY)} ${sc.ys} (${n(tY)} min, cm ${eur(cmY)})`,
                    "Order": `${n(Q)} ${sc.os}, ${n(tY)} min each`,
                    [`Variable costs per ${sc.o}`]: eur(vO),
                    "Capacity": "fully utilized",
                },
                answer,
                explanation: String.raw`$p_{min} = k_{var} + \frac{\text{forgone contribution margins}}{\text{order quantity}}$ - displace the product with the lowest relative contribution margin first. ${cap(sc.ys)} earn ${eur((cmY / tY) * 60)} per hour vs. ${eur((cmX / tX) * 60)} for ${sc.xs}, so all ${n(qY)} ${sc.ys} go (freeing ${n(qY)} × ${n(tY)} min), and the remaining time comes from ${n(dX)} ${sc.xs}. Opportunity costs: ${n(qY)} × ${eur(cmY)} + ${n(dX)} × ${eur(cmX)} = ${eur(opp)}, i.e. ${eur(opp / Q)} per ${sc.o}. Lower price limit: ${eur(vO)} + ${eur(opp / Q)} = ${eur(answer)}.`,
                hint: `A lower price limit has to cover the order's own variable costs plus the contribution margins given up per ordered unit. On a machine that is already fully booked, free the needed minutes from the product with the lowest contribution margin per machine hour first.`,
            };
        },
    },

    // ---------------------------------- material valuation (second family)
    {
        id: "ca-mat-fifo-ending-value",
        subject: "cost_accounting",
        topic: "material_valuation",
        difficulty: "medium",
        kind: "numeric",
        unit: "EUR",
        source: "TUM Cost Accounting WS17/18, Q19",
        build: (rng) => {
            const sc = rng.pick(CA_MAT_STOCK2_SCENARIOS);
            const s = drawStock2(rng);
            const endQty = s.b0 + s.q1 + s.q2 + s.q3 - s.c1 - s.c2;
            const layers: Array<[number, number]> = [
                [s.q3, s.p3],
                [s.q2, s.p2],
                [s.q1, s.p1],
                [s.b0, s.p0],
            ];
            const { cost, parts } = walkLayers(layers, endQty);
            return {
                prompt: `${sc.firmIntro} stocks ${sc.mat}. September opens with ${n(s.b0)} kg at ${eur(s.p0)} per kg. It buys ${n(s.q1)} kg at ${eur(s.p1)} per kg (Sep 3) and ${n(s.q2)} kg at ${eur(s.p2)} per kg (Sep 8), issues ${n(s.c1)} kg (Sep 12) and ${n(s.c2)} kg (Sep 18) to ${sc.use}, and buys another ${n(s.q3)} kg at ${eur(s.p3)} per kg (Sep 24). What is the value of the ending inventory at the end of September under the FIFO method?`,
                given: {
                    "Opening stock": `${n(s.b0)} kg at ${eur(s.p0)}/kg`,
                    "Purchase Sep 3": `${n(s.q1)} kg at ${eur(s.p1)}/kg`,
                    "Purchase Sep 8": `${n(s.q2)} kg at ${eur(s.p2)}/kg`,
                    "Issue Sep 12 / Sep 18": `${n(s.c1)} kg / ${n(s.c2)} kg`,
                    "Purchase Sep 24": `${n(s.q3)} kg at ${eur(s.p3)}/kg`,
                },
                answer: cost,
                explanation: String.raw`Under $FIFO$ (first in, first out) issues consume the oldest layers, so the ending inventory consists of the newest purchases still on stock. The ending quantity is ${n(s.b0)} + ${n(s.q1)} + ${n(s.q2)} + ${n(s.q3)} − ${n(s.c1)} − ${n(s.c2)} = ${n(endQty)} kg, valued newest-first: ${parts.join(" + ")} = ${eur(cost)}.`,
            };
        },
    },
    {
        id: "ca-mat-lifo-ending-value",
        subject: "cost_accounting",
        topic: "material_valuation",
        difficulty: "hard",
        kind: "numeric",
        unit: "EUR",
        source: "TUM Cost Accounting WS17/18, Q18",
        build: (rng) => {
            const sc = rng.pick(CA_MAT_STOCK2_SCENARIOS);
            const s = drawStock2(rng);
            const stack = lifoLayersAfterIssues(s);
            stack.push([s.q3, s.p3]);
            const value = stack.reduce((sum, [q, p]) => sum + q * p, 0);
            const parts = stack.map(([q, p]) => `${n(q)} kg × ${eur(p)}`);
            return {
                prompt: `${sc.firm} values ${sc.mat} with a perpetual LIFO system. September opens with ${n(s.b0)} kg at ${eur(s.p0)} per kg. Purchases: ${n(s.q1)} kg at ${eur(s.p1)} per kg (Sep 3), ${n(s.q2)} kg at ${eur(s.p2)} per kg (Sep 8). Issues to ${sc.use}: ${n(s.c1)} kg (Sep 12), ${n(s.c2)} kg (Sep 18). A final purchase of ${n(s.q3)} kg at ${eur(s.p3)} per kg arrives on Sep 24. What is the value of the ending inventory at the end of September?`,
                given: {
                    "Opening stock": `${n(s.b0)} kg at ${eur(s.p0)}/kg`,
                    "Purchase Sep 3": `${n(s.q1)} kg at ${eur(s.p1)}/kg`,
                    "Purchase Sep 8": `${n(s.q2)} kg at ${eur(s.p2)}/kg`,
                    "Issue Sep 12 / Sep 18": `${n(s.c1)} kg / ${n(s.c2)} kg`,
                    "Purchase Sep 24": `${n(s.q3)} kg at ${eur(s.p3)}/kg`,
                },
                answer: value,
                explanation: String.raw`Under perpetual $LIFO$ (last in, first out) each issue consumes the newest layers on stock at that date, so the two September issues eat the Sep 8 and Sep 3 purchases from the top before touching the opening layer. What remains afterwards, plus the untouched Sep 24 purchase, is the ending inventory: ${parts.join(" + ")} = ${eur(value)}.`,
            };
        },
    },
    {
        id: "ca-mat-expost-issue-cost",
        subject: "cost_accounting",
        topic: "material_valuation",
        difficulty: "easy",
        kind: "numeric",
        unit: "EUR",
        source: "TUM Cost Accounting SS2015, Q19",
        build: (rng) => {
            const sc = rng.pick(CA_MAT_STOCK2_SCENARIOS);
            const s = drawStock2(rng);
            const totalQty = s.b0 + s.q1 + s.q2 + s.q3;
            const totalValue = s.b0 * s.p0 + s.q1 * s.p1 + s.q2 * s.p2 + s.q3 * s.p3;
            const avg = totalValue / totalQty;
            const answer = s.c1 * avg;
            return {
                prompt: `${sc.firm} values ${sc.mat} with ex-post (periodic) average prices. September opens with ${n(s.b0)} kg at ${eur(s.p0)} per kg; purchases during the month are ${n(s.q1)} kg at ${eur(s.p1)}, ${n(s.q2)} kg at ${eur(s.p2)} and ${n(s.q3)} kg at ${eur(s.p3)} per kg (the last one on Sep 24). What is the cost of material for the issue of ${n(s.c1)} kg on Sep 12?`,
                given: {
                    "Opening stock": `${n(s.b0)} kg at ${eur(s.p0)}/kg`,
                    "Purchases": `${n(s.q1)} kg at ${eur(s.p1)}; ${n(s.q2)} kg at ${eur(s.p2)}; ${n(s.q3)} kg at ${eur(s.p3)}`,
                    "Issue Sep 12": `${n(s.c1)} kg`,
                },
                answer,
                explanation: String.raw`$\bar{p} = \frac{\text{opening value} + \text{purchase value}}{\text{opening quantity} + \text{purchase quantity}}$ - the ex-post average is computed over the whole period, so even the Sep 24 purchase (after the issue) enters it. Here $\bar{p}$ = ${eur(totalValue)} / ${n(totalQty)} kg = ${eur(avg)}/kg, and the Sep 12 issue costs ${n(s.c1)} kg × ${eur(avg)} = ${eur(answer)}.`,
            };
        },
    },
    {
        id: "ca-mat-stock-on-date",
        subject: "cost_accounting",
        topic: "material_valuation",
        difficulty: "very_easy",
        kind: "numeric",
        unit: "units",
        source: "TUM Cost Accounting SS2015, Q20",
        build: (rng) => {
            const sc = rng.pick(CA_MAT_STOCK2_SCENARIOS);
            const s = drawStock2(rng);
            const answer = s.b0 + s.q1 + s.q2 - s.c1 - s.c2;
            return {
                prompt: `${sc.firm} records the following ${sc.matShort} movements in September: opening stock ${n(s.b0)} kg; purchases of ${n(s.q1)} kg (Sep 3), ${n(s.q2)} kg (Sep 8) and ${n(s.q3)} kg (Sep 24); issues to ${sc.use} of ${n(s.c1)} kg (Sep 12) and ${n(s.c2)} kg (Sep 18). How many kilograms of ${sc.matShort} are on stock on Sep 20?`,
                given: {
                    "Opening stock": `${n(s.b0)} kg`,
                    "Purchases": `${n(s.q1)} kg (Sep 3), ${n(s.q2)} kg (Sep 8), ${n(s.q3)} kg (Sep 24)`,
                    "Issues": `${n(s.c1)} kg (Sep 12), ${n(s.c2)} kg (Sep 18)`,
                },
                answer,
                explanation: String.raw`$\text{stock on date} = \text{opening stock} + \sum \text{purchases to date} - \sum \text{issues to date}$ - only movements up to Sep 20 count, so the Sep 24 purchase is excluded: ${n(s.b0)} + ${n(s.q1)} + ${n(s.q2)} − ${n(s.c1)} − ${n(s.c2)} = ${n(answer)} kg.`,
            };
        },
    },
    {
        id: "ca-mat-moving-average-price",
        subject: "cost_accounting",
        topic: "material_valuation",
        difficulty: "easy",
        kind: "numeric",
        unit: "EUR",
        source: "TUM Cost Accounting SS2015, Q18",
        build: (rng) => {
            const sc = rng.pick(CA_MAT_STOCK2_SCENARIOS);
            const s = drawStock2(rng);
            const qty = s.b0 + s.q1 + s.q2;
            const value = s.b0 * s.p0 + s.q1 * s.p1 + s.q2 * s.p2;
            const answer = value / qty;
            return {
                prompt: `${sc.firm} values ${sc.mat} with moving average prices. September opens with ${n(s.b0)} kg at ${eur(s.p0)} per kg; ${sc.firm} then buys ${n(s.q1)} kg at ${eur(s.p1)} per kg (Sep 3) and ${n(s.q2)} kg at ${eur(s.p2)} per kg (Sep 8). Nothing is issued before Sep 9. What is the moving average price per kilogram after the Sep 8 purchase?`,
                given: {
                    "Opening stock": `${n(s.b0)} kg at ${eur(s.p0)}/kg`,
                    "Purchase Sep 3": `${n(s.q1)} kg at ${eur(s.p1)}/kg`,
                    "Purchase Sep 8": `${n(s.q2)} kg at ${eur(s.p2)}/kg`,
                },
                answer,
                explanation: String.raw`$\bar{p} = \frac{\text{stock value}}{\text{stock quantity}}$ - after each purchase the average blends the old stock with the new layer. Stock value: ${n(s.b0)} × ${eur(s.p0)} + ${n(s.q1)} × ${eur(s.p1)} + ${n(s.q2)} × ${eur(s.p2)} = ${eur(value)} over ${n(qty)} kg, so $\bar{p}$ = ${eur(answer)} per kg.`,
                hint: `The moving average price is recomputed after every purchase, blending the stock already held with the new layer.`,
            };
        },
    },
    {
        id: "ca-mat-expost-average-price",
        subject: "cost_accounting",
        topic: "material_valuation",
        difficulty: "easy",
        kind: "numeric",
        unit: "EUR",
        source: "TUM Cost Accounting SS2015 Q19; SS2015 Q21",
        build: (rng) => {
            const sc = rng.pick(CA_MAT_STOCK2_SCENARIOS);
            const s = drawStock2(rng);
            const totalQty = s.b0 + s.q1 + s.q2 + s.q3;
            const totalValue = s.b0 * s.p0 + s.q1 * s.p1 + s.q2 * s.p2 + s.q3 * s.p3;
            const answer = totalValue / totalQty;
            return {
                prompt: `At the end of September, ${sc.firm}'s controller computes the ex-post average price for ${sc.matShort} to value the month's consumption. The month opened with ${n(s.b0)} kg at ${eur(s.p0)} per kg; purchases were ${n(s.q1)} kg at ${eur(s.p1)}, ${n(s.q2)} kg at ${eur(s.p2)} and ${n(s.q3)} kg at ${eur(s.p3)} per kg. Issues to ${sc.use} were ${n(s.c1)} kg and ${n(s.c2)} kg. What is the ex-post average price per kilogram?`,
                given: {
                    "Opening stock": `${n(s.b0)} kg at ${eur(s.p0)}/kg`,
                    "Purchases": `${n(s.q1)} kg at ${eur(s.p1)}; ${n(s.q2)} kg at ${eur(s.p2)}; ${n(s.q3)} kg at ${eur(s.p3)}`,
                    "Issues": `${n(s.c1)} kg and ${n(s.c2)} kg`,
                },
                answer,
                explanation: String.raw`$\bar{p} = \frac{\text{opening value} + \text{purchase value}}{\text{opening quantity} + \text{purchase quantity}}$ - one price for the whole period; the issues do not enter the average. Value: ${eur(totalValue)} over ${n(totalQty)} kg, so $\bar{p}$ = ${eur(answer)} per kg.`,
            };
        },
    },

    // ------------------------------------------ depreciation (second family)
    {
        id: "ca-dep-uop-accumulated",
        subject: "cost_accounting",
        topic: "depreciation",
        difficulty: "medium",
        kind: "numeric",
        unit: "EUR",
        source: "TUM Cost Accounting WS17/18, Q23",
        build: (rng) => {
            const sc = rng.pick(CA_DEP_FIRM_SCENARIOS);
            const y1 = rng.int(10, 25) * 100;
            const y2 = rng.int(10, 25) * 100;
            const y3 = rng.int(10, 25) * 100;
            const y4 = rng.int(10, 25) * 100;
            const capacity = y1 + y2 + y3 + y4;
            const rate = rng.pick([15, 20, 25, 30]);
            const R = rng.int(2, 8) * 1000;
            const A = R + rate * capacity;
            const cum = y1 + y2 + y3;
            const answer = rate * cum;
            return {
                prompt: `${sc.firmIntro}, buys ${sc.asset1} for ${eur(A)}. After four years it should be sold at a residual value of ${eur(R)}. Its lifetime output equals the planned production: ${n(y1)} ${sc.units} in year 1, ${n(y2)} in year 2, ${n(y3)} in year 3 and ${n(y4)} in year 4. What is the expected accumulated depreciation at the end of year 3 under the units-of-production method?`,
                given: {
                    "Acquisition cost": eur(A),
                    "Residual value": eur(R),
                    "Planned output years 1-4": `${n(y1)} / ${n(y2)} / ${n(y3)} / ${n(y4)} ${sc.units}`,
                },
                answer,
                explanation: String.raw`$D_{acc} = \frac{A_0 - RV}{\text{lifetime capacity}} \cdot \sum_{t=1}^{3} x_t$ - depreciation follows usage, so three years accumulate the output of three years. Per unit: (${eur(A)} − ${eur(R)}) / ${n(capacity)} = ${eur(rate)}; accumulated: ${eur(rate)} × (${n(y1)} + ${n(y2)} + ${n(y3)}) = ${eur(rate)} × ${n(cum)} = ${eur(answer)}.`,
            };
        },
    },
    {
        id: "ca-dep-declining-year1-amount",
        subject: "cost_accounting",
        topic: "depreciation",
        difficulty: "hard",
        kind: "numeric",
        unit: "EUR",
        source: "TUM Cost Accounting SS2015, Q24",
        build: (rng) => {
            const sc = rng.pick(CA_DEP_FIRM_SCENARIOS);
            const A = rng.int(5, 20) * 20000;
            const R = rng.int(1, 4) * 10000;
            const N = rng.int(4, 6);
            const r = 1 - (R / A) ** (1 / N);
            const answer = r * A;
            return {
                prompt: `${sc.firm} buys ${sc.asset2} for ${eur(A)} and wants to write it down to its residual value of ${eur(R)} over ${N} years using declining-balance (geometric-degressive) depreciation with a constant rate. What is the depreciation amount in the first year?`,
                given: { "Acquisition cost": eur(A), "Residual value": eur(R), "Useful life": `${N} years` },
                answer,
                explanation: String.raw`$r = 1 - \sqrt[N]{\frac{RV}{A_0}}$ is the constant rate that reaches the residual value after $N$ years, and the first-year amount is $D_1 = r \cdot A_0$. Here r = 1 − (${eur(R)} / ${eur(A)})^(1/${N}) = ${pct(r * 100)}, so $D_1$ = ${pct(r * 100)} × ${eur(A)} = ${eur(answer)} - the largest amount of the whole schedule, since the rate is applied to a shrinking book value.`,
            };
        },
    },
    {
        id: "ca-dep-arith-degressive-step",
        subject: "cost_accounting",
        topic: "depreciation",
        difficulty: "easy",
        kind: "numeric",
        unit: "EUR",
        source: "TUM Cost Accounting WS17/18, Q24",
        build: (rng) => {
            const sc = rng.pick(CA_DEP_FIRM_SCENARIOS);
            const N = rng.int(4, 6);
            const d = rng.int(3, 15) * 1000;
            const R = rng.int(1, 5) * 10000;
            const A = (d * N * (N + 1)) / 2 + R;
            return {
                prompt: `${sc.firm}'s ${sc.asset3} costs ${eur(A)} and is depreciated over ${N} years down to a residual value of ${eur(R)} using arithmetic-degressive depreciation, the final year's amount equal to the yearly decrease. By what amount does the yearly depreciation decrease from one year to the next?`,
                given: { "Acquisition cost": eur(A), "Residual value": eur(R), "Useful life": `${N} years` },
                answer: d,
                explanation: String.raw`With yearly amounts $N \cdot d, (N-1) \cdot d, \ldots, d$ the total is $d \cdot \frac{N(N+1)}{2} = A_0 - RV$, so $d = \frac{A_0 - RV}{N(N+1)/2}$ = (${eur(A)} − ${eur(R)}) / ${n((N * (N + 1)) / 2)} = ${eur(d)} - the step between two consecutive years and at the same time the final year's amount.`,
                hint: String.raw`Arithmetic-degressive depreciation falls by the same step $d$ every year and depreciates exactly $d$ in the final year, so the schedule is $N \cdot d, (N-1) \cdot d, \ldots, d$ and the whole schedule sums to $A_0 - RV$.`,
            };
        },
    },

    // -------------------------------------- cost allocation (second batch)
    {
        id: "ca-alloc-stepladder-total-to-direct",
        subject: "cost_accounting",
        topic: "cost_allocation",
        difficulty: "medium",
        kind: "numeric",
        unit: "EUR",
        source: "TUM Cost Accounting SS2018 Q37; WS18/19 Q37",
        build: (rng) => {
            const sc = rng.pick(CA_ALLOC_STEPLADDER_TOTAL_SCENARIOS);
            const tp1 = rng.pick([0.5, 1, 1.25, 1.5, 2]);
            const s12 = rng.int(20, 80) * 10;
            const d11 = rng.int(10, 30) * 100;
            const d12 = rng.int(10, 30) * 100;
            const O1 = tp1 * (s12 + d11 + d12);
            const O2 = rng.int(40, 120) * 1000;
            const s21 = rng.int(4, 12) * 10;
            const received = tp1 * s12;
            const answer = O2 + received;
            return {
                prompt: `${sc.firm} allocates support costs with the step-ladder method in the sequence ${sc.ic1} → ${sc.ic2}. The ${sc.ic1} (primary overheads ${eur(O1)}) delivers ${n(s12)} ${sc.u} of ${sc.svc} to ${sc.ic2}, ${n(d11)} ${sc.u} to ${sc.dc1} and ${n(d12)} ${sc.u} to ${sc.dc2}. ${sc.ic2} (primary overheads ${eur(O2)}) works ${n(s21)} hours for the ${sc.ic1} and the rest for the direct cost centers. What total amount is allocated from ${sc.ic2} to the two direct cost centers ${sc.dc1} and ${sc.dc2} together?`,
                given: {
                    [`Primary overheads ${sc.ic1} / ${sc.ic2}`]: `${eur(O1)} / ${eur(O2)}`,
                    [`${cap(sc.svc)} output`]: `${n(s12)} ${sc.u} to ${sc.ic2}, ${n(d11)} ${sc.u} to ${sc.dc1}, ${n(d12)} ${sc.u} to ${sc.dc2}`,
                    [`${sc.ic2} hours for ${sc.ic1}`]: `${n(s21)} h`,
                },
                answer,
                explanation: String.raw`$\text{total}_2 = O_2 + tp_1 \cdot s_{1 \to 2}$ - the last center in the ladder passes on everything it carries: its own primary overheads plus what it received. The ${sc.ic1}'s rate is $tp_1 = \frac{O_1}{\text{output to later centers}}$ = ${eur(O1)} / ${n(s12 + d11 + d12)} ${sc.u} = ${eur(tp1)}/${sc.u}, so ${sc.ic2} receives ${n(s12)} ${sc.u} × ${eur(tp1)} = ${eur(received)} and allocates ${eur(O2)} + ${eur(received)} = ${eur(answer)} to ${sc.dc1} and ${sc.dc2}. The ${n(s21)} hours delivered back are ignored by the step-ladder method.`,
                hint: `In the step-ladder sequence each center allocates only to the centers that come after it; deliveries back to an earlier center are left out. The last center in the ladder passes on its own primary overheads plus everything it received.`,
            };
        },
    },
    {
        id: "ca-alloc-stepdown-between",
        subject: "cost_accounting",
        topic: "cost_allocation",
        difficulty: "easy",
        kind: "numeric",
        unit: "EUR",
        source: "TUM Cost Accounting SS2018 Q36; WS18/19 Q36",
        build: (rng) => {
            const sc = rng.pick(CA_ALLOC_PRESSURA_SCENARIOS);
            const rate = rng.pick([5, 8, 10, 12, 20]);
            const s12 = rng.int(2, 8) * 100;
            const d11 = rng.int(4, 15) * 100;
            const d12 = rng.int(4, 15) * 100;
            const O1 = rate * (s12 + d11 + d12);
            const answer = rate * s12;
            return {
                prompt: `${sc.firm} uses the step-ladder method in the sequence ${sc.ic1} → ${sc.ic2}. ${sc.ic1} has primary overheads of ${eur(O1)} and maintains ${n(s12)} m² for the ${sc.ic2}, ${n(d11)} m² for ${sc.dc1} and ${n(d12)} m² for ${sc.dc2} (the direct cost centers). Which costs are allocated from ${sc.ic1} to the ${sc.ic2}?`,
                given: {
                    [`Primary overheads ${sc.ic1}`]: eur(O1),
                    [`Area ${sc.ic2}`]: `${n(s12)} m²`,
                    [`Area ${sc.dc1} / ${sc.dc2}`]: `${n(d11)} m² / ${n(d12)} m²`,
                },
                answer,
                explanation: String.raw`$tp_1 = \frac{O_1}{\text{output to all later centers}}$ - the first center in the ladder allocates to every center after it, including the other indirect one. Rate: ${eur(O1)} / ${n(s12 + d11 + d12)} m² = ${eur(rate)}/m²; the ${sc.ic2} is debited ${n(s12)} m² × ${eur(rate)} = ${eur(answer)}.`,
            };
        },
    },
    {
        id: "ca-alloc-reciprocal-tp",
        subject: "cost_accounting",
        topic: "cost_allocation",
        difficulty: "hard",
        kind: "numeric",
        unit: "EUR",
        source: "TUM Cost Accounting WS16/17 Q16; Mock Exam Q37",
        build: (rng) => {
            const sc = rng.pick(CA_ALLOC_FERROVIA_SCENARIOS);
            const O1 = rng.int(20, 60) * 1000;
            const O2 = rng.int(40, 120) * 1000;
            const s12 = rng.int(20, 80) * 10;
            const d11 = rng.int(10, 30) * 100;
            const d12 = rng.int(10, 30) * 100;
            const s21 = rng.int(4, 12) * 10;
            const h1 = rng.int(5, 20) * 10;
            const h2 = rng.int(5, 20) * 10;
            const S1 = s12 + d11 + d12;
            const S2 = s21 + h1 + h2;
            const c1 = (O1 * S2 + s21 * O2) / (S1 * S2 - s12 * s21);
            const c2 = (O2 + s12 * c1) / S2;
            return {
                prompt: `${sc.firm} applies the reciprocal method based on equations. The ${sc.ic1} (primary overheads ${eur(O1)}) delivers ${n(s12)} ${sc.u} of ${sc.svc} to the ${sc.ic2}, ${n(d11)} ${sc.u} to ${sc.dc1} and ${n(d12)} ${sc.u} to ${sc.dc2}. The ${sc.ic2} (primary overheads ${eur(O2)}) works ${n(s21)} hours for the ${sc.ic1}, ${n(h1)} hours for ${sc.dc1} and ${n(h2)} hours for ${sc.dc2}. What is the transfer price per ${sc.uLong}?`,
                given: {
                    [`Primary overheads ${sc.ic1} / ${sc.ic2}`]: `${eur(O1)} / ${eur(O2)}`,
                    [`${cap(sc.svc)} output`]: `${n(s12)} ${sc.u} to ${sc.ic2}, ${n(d11)} ${sc.u} to ${sc.dc1}, ${n(d12)} ${sc.u} to ${sc.dc2}`,
                    [`${sc.ic2} output`]: `${n(s21)} h to ${sc.ic1}, ${n(h1)} h to ${sc.dc1}, ${n(h2)} h to ${sc.dc2}`,
                },
                answer: c1,
                explanation: String.raw`$S_1 \cdot c_1 = O_1 + s_{21} \cdot c_2 \;$ and $\; S_2 \cdot c_2 = O_2 + s_{12} \cdot c_1$ - each center's total output, valued at its transfer price, must cover its primary overheads plus the services it received. With $S_1$ = ${n(S1)} ${sc.u} and $S_2$ = ${n(S2)} h, solving the two equations gives $c_1$ = ${eur(c1)} per ${sc.uLong} (and $c_2$ = ${eur(c2)} per ${sc.hour}).`,
            };
        },
    },
    {
        id: "ca-alloc-reciprocal-total-output",
        subject: "cost_accounting",
        topic: "cost_allocation",
        difficulty: "hard",
        kind: "numeric",
        unit: "EUR",
        source: "TUM Cost Accounting WS16/17, Q17",
        build: (rng) => {
            const sc = rng.pick(CA_ALLOC_RECIPROCAL_TOTAL_SCENARIOS);
            const O1 = rng.int(20, 60) * 1000;
            const O2 = rng.int(20, 80) * 1000;
            const s12 = rng.int(20, 80) * 10;
            const d11 = rng.int(10, 30) * 100;
            const d12 = rng.int(10, 30) * 100;
            const s21 = rng.int(4, 12) * 10;
            const h1 = rng.int(5, 20) * 10;
            const h2 = rng.int(5, 20) * 10;
            const S1 = s12 + d11 + d12;
            const S2 = s21 + h1 + h2;
            const c1 = (O1 * S2 + s21 * O2) / (S1 * S2 - s12 * s21);
            const c2 = (O2 + s12 * c1) / S2;
            const answer = S2 * c2;
            return {
                prompt: `${sc.firm} runs the indirect cost centers ${sc.ic1} and ${sc.ic2} and the direct cost centers ${sc.dc1} and ${sc.dc2}. The ${sc.ic1} (primary overheads ${eur(O1)}) delivers ${n(s12)} ${sc.u} to the ${sc.ic2}, ${n(d11)} ${sc.u} to ${sc.dc1} and ${n(d12)} ${sc.u} to ${sc.dc2}. The ${sc.ic2} (primary overheads ${eur(O2)}) works ${n(s21)} hours for the ${sc.ic1}, ${n(h1)} hours for ${sc.dc1} and ${n(h2)} hours for ${sc.dc2}. Under the reciprocal method based on equations, what are the total costs allocated from the ${sc.ic2} to the other cost centers?`,
                given: {
                    [`Primary overheads ${sc.ic1} / ${sc.ic2}`]: `${eur(O1)} / ${eur(O2)}`,
                    [`${cap(sc.svc)} output`]: `${n(s12)} ${sc.u} to ${sc.ic2}, ${n(d11)} ${sc.u} to ${sc.dc1}, ${n(d12)} ${sc.u} to ${sc.dc2}`,
                    [`${sc.ic2} output`]: `${n(s21)} h to ${sc.ic1}, ${n(h1)} h to ${sc.dc1}, ${n(h2)} h to ${sc.dc2}`,
                },
                answer,
                explanation: String.raw`$S_2 \cdot c_2 = O_2 + s_{12} \cdot c_1$ - under the reciprocal method a center allocates its entire valued output, which equals its primary overheads plus the services received. Solving the pair of equations ($S_1 \cdot c_1 = O_1 + s_{21} \cdot c_2$) with $S_1$ = ${n(S1)} ${sc.u}, $S_2$ = ${n(S2)} h gives $c_1$ = ${eur(c1)}/${sc.u} and $c_2$ = ${eur(c2)}/h. The ${sc.ic2} therefore allocates ${n(S2)} h × ${eur(c2)} = ${eur(answer)} - more than its primary overheads, because the received ${sc.svc} is passed on too.`,
            };
        },
    },
    {
        id: "ca-alloc-reciprocal-direct-sum",
        subject: "cost_accounting",
        topic: "cost_allocation",
        difficulty: "medium",
        kind: "numeric",
        unit: "EUR",
        source: "TUM Cost Accounting SS2015 Q39; Mock Exam Q38; SS2018 Q40",
        build: (rng) => {
            const sc = rng.pick(CA_ALLOC_RECIPROCAL_SUM_SCENARIOS);
            const O1 = rng.int(20, 60) * 1000;
            const O2 = rng.int(40, 120) * 1000;
            const P1 = rng.int(60, 150) * 1000;
            const P2 = rng.int(80, 200) * 1000;
            const s12 = rng.int(20, 80) * 10;
            const d11 = rng.int(10, 30) * 100;
            const d12 = rng.int(10, 30) * 100;
            const s21 = rng.int(4, 12) * 10;
            const h1 = rng.int(5, 20) * 10;
            const h2 = rng.int(5, 20) * 10;
            const answer = O1 + O2 + P1 + P2;
            return {
                prompt: `${sc.firm} is divided into the indirect cost centers ${sc.ic1} and ${sc.ic2} and the direct cost centers ${sc.dc1} and ${sc.dc2}, with primary overheads of ${eur(O1)}, ${eur(O2)}, ${eur(P1)} and ${eur(P2)} respectively. ${sc.ic1} delivers ${n(s12)} ${sc.u} to the ${sc.ic2}, ${n(d11)} ${sc.u} to ${sc.dc1} and ${n(d12)} ${sc.u} to ${sc.dc2}; the ${sc.ic2} works ${n(s21)} hours for the ${sc.ic1}, ${n(h1)} hours for ${sc.dc1} and ${n(h2)} hours for ${sc.dc2}. What is the sum of the total overheads of ${sc.dc1} and ${sc.dc2} after the allocation according to the reciprocal method based on equations?`,
                given: {
                    [`Primary overheads ${sc.ic1} / ${sc.ic2}`]: `${eur(O1)} / ${eur(O2)}`,
                    [`Primary overheads ${sc.dc1} / ${sc.dc2}`]: `${eur(P1)} / ${eur(P2)}`,
                    [`${sc.ic1} output`]: `${n(s12)} ${sc.u} to ${sc.ic2}, ${n(d11)} ${sc.u} to ${sc.dc1}, ${n(d12)} ${sc.u} to ${sc.dc2}`,
                    [`${sc.ic2} output`]: `${n(s21)} h to ${sc.ic1}, ${n(h1)} h to ${sc.dc1}, ${n(h2)} h to ${sc.dc2}`,
                },
                answer,
                explanation: String.raw`$\sum \text{OH}_{direct}^{after} = \sum_{\text{all centers}} O_i$ - the reciprocal method clears both indirect centers completely, so every euro of primary overhead ends up at the direct cost centers. No equations are needed: ${eur(O1)} + ${eur(O2)} + ${eur(P1)} + ${eur(P2)} = ${eur(answer)}. The service-exchange table only determines how the total is split between ${sc.dc1} and ${sc.dc2}.`,
            };
        },
    },
    {
        id: "ca-alloc-reciprocal-known-tp",
        subject: "cost_accounting",
        topic: "cost_allocation",
        difficulty: "medium",
        kind: "numeric",
        unit: "EUR",
        source: "TUM Cost Accounting SS2015, Q40",
        build: (rng) => {
            const sc = rng.pick(CA_ALLOC_KNOWN_TP_SCENARIOS);
            const K = rng.int(8, 30) * 1000;
            const M = rng.int(2, 6) * 1000;
            const E = rng.int(4, 15) * 1000;
            const c1 = rng.int(50, 150) * 0.01;
            const answer = (K + E * c1) / M;
            return {
                prompt: `${sc.firm} runs an in-house ${sc.ic} as an indirect cost center. The ${sc.ic} incurs overhead costs of ${eur(K)} and ${sc.verb} a total of ${n(M)} ${sc.out} for the direct cost centers. It also uses ${n(E)} kWh from the Power cost center, whose exact transfer price has already been calculated as ${eur(c1)} per kWh. What is the exact transfer price per ${sc.unit} for the ${sc.ic} according to the reciprocal method based on equations?`,
                given: {
                    [`${sc.ic} overheads`]: eur(K),
                    [`${sc.ic} output`]: `${n(M)} ${sc.out}`,
                    "Power used": `${n(E)} kWh at ${eur(c1)}/kWh (exact transfer price)`,
                },
                answer,
                explanation: String.raw`$x_{out} \cdot tp = K + x_{kWh} \cdot c_1$ - the ${sc.ic}'s valued output must cover its own overheads plus the power it consumed. So tp = (${eur(K)} + ${n(E)} × ${eur(c1)}) / ${n(M)} ${sc.units} = ${eur(K + E * c1)} / ${n(M)} = ${eur(answer)} per ${sc.unit}.`,
            };
        },
    },
    {
        id: "ca-alloc-cd-received-amount",
        subject: "cost_accounting",
        topic: "cost_allocation",
        difficulty: "easy",
        kind: "numeric",
        unit: "EUR",
        source: "TUM Cost Accounting Mock Exam Q40; SS2017 Q21; WS16/17 Q20",
        build: (rng) => {
            const sc = rng.pick(CA_ALLOC_FERROVIA_SCENARIOS);
            const tp = rng.pick([0.8, 1.2, 1.5, 1.6, 2.5]);
            const qty = rng.int(10, 40) * 100;
            const O2 = rng.int(20, 80) * 1000;
            const answer = tp * qty;
            return {
                prompt: `${sc.firm} applies the method of credits and debits with a preset transfer price of ${eur(tp)} per ${sc.uLong}. The ${sc.ic1} delivers ${n(qty)} ${sc.u} of ${sc.svc} to the ${sc.ic2} - another indirect cost center with primary overheads of ${eur(O2)}. What amount is allocated from the ${sc.ic1} to the ${sc.ic2} (before any levy for cost coverage)?`,
                given: {
                    [`Preset transfer price ${sc.svc}`]: `${eur(tp)} per ${sc.u}`,
                    [`${cap(sc.svc)} delivered to ${sc.ic2}`]: `${n(qty)} ${sc.u}`,
                    [`Primary overheads ${sc.ic2}`]: eur(O2),
                },
                answer,
                explanation: String.raw`$\text{debit} = tp \cdot x$ - unlike the direct method, the method of credits and debits also prices deliveries between indirect cost centers: ${n(qty)} ${sc.u} × ${eur(tp)} = ${eur(answer)}. The ${sc.ic2}'s own primary overheads play no role in this debit.`,
                hint: `The method of credits and debits prices every service at its preset transfer price, deliveries between two indirect cost centers included, and the receiving center's own overheads never enter that debit.`,
            };
        },
    },
    {
        id: "ca-alloc-cd-infer-tp",
        subject: "cost_accounting",
        topic: "cost_allocation",
        difficulty: "easy",
        kind: "numeric",
        unit: "EUR",
        source: "TUM Cost Accounting WS16/17, Q19",
        build: (rng) => {
            const sc = rng.pick(CA_ALLOC_FERROVIA_SCENARIOS);
            const tp = rng.pick([12, 18, 22, 24, 25, 30, 35]);
            const q = rng.int(3, 12) * 10;
            const X = tp * q;
            return {
                prompt: `An excerpt from the method of credits and debits at ${sc.firm} shows that ${eur(X)} of the ${sc.ic2}'s costs are allocated to the ${sc.ic1} for the ${n(q)} ${sc.hour}s it worked there. Which transfer price per ${sc.hour} did the company apply?`,
                given: {
                    [`Amount allocated ${sc.ic2} → ${sc.ic1}`]: eur(X),
                    [`${cap(sc.hour)}s worked for ${sc.ic1}`]: `${n(q)} h`,
                },
                answer: tp,
                explanation: String.raw`$tp = \frac{\text{allocated amount}}{\text{quantity delivered}}$ - under the method of credits and debits every delivery is priced at the preset transfer price, so it can be read off any allocation line: ${eur(X)} / ${n(q)} h = ${eur(tp)} per hour.`,
            };
        },
    },
    {
        id: "ca-alloc-levy-share",
        subject: "cost_accounting",
        topic: "cost_allocation",
        difficulty: "hard",
        kind: "numeric",
        unit: "EUR",
        source: "TUM Cost Accounting SS2017, Q23",
        build: (rng) => {
            const sc = rng.pick(CA_ALLOC_PRESSURA_SCENARIOS);
            // Off the round-thousands grid so SS2017 Q23's (5,000 / 40k / 60k) is undrawable.
            const B = rng.int(12, 40) * 500;
            const D1 = rng.int(2, 8) * 10000;
            const D2 = rng.int(2, 8) * 10000;
            const answer = (B * D1) / (D1 + D2);
            return {
                prompt: `After the allocation steps of the method of credits and debits, the balances of ${sc.firmShort}'s indirect cost centers sum to +${eur(B)}. This remainder is charged to the direct cost centers as a levy for cost coverage. The primary and secondary overheads the direct cost centers carry so far are ${eur(D1)} for ${sc.dc1} and ${eur(D2)} for ${sc.dc2}. What amount is debited to ${sc.dc1}?`,
                given: {
                    "Uncovered balance of the indirect centers": eur(B),
                    [`Overheads so far ${sc.dc1} / ${sc.dc2}`]: `${eur(D1)} / ${eur(D2)}`,
                },
                answer,
                explanation: String.raw`$\text{levy}_i = B \cdot \frac{\text{OH}_i}{\sum_j \text{OH}_j}$ - the levy distributes the uncovered balance over the direct cost centers by their overheads to date. ${sc.dc1} carries ${eur(D1)} of ${eur(D1 + D2)}, so it is debited ${eur(B)} × ${n2(D1 / (D1 + D2))} = ${eur(answer)}.`,
                hint: `The levy for cost coverage spreads the indirect centers' uncovered balance over the direct cost centers in proportion to the overheads each of them carries at that point.`,
            };
        },
    },
    {
        id: "ca-alloc-cd-levy-total",
        subject: "cost_accounting",
        topic: "cost_allocation",
        difficulty: "medium",
        kind: "numeric",
        unit: "EUR",
        source: "TUM Cost Accounting SS2017, Q22",
        build: (rng) => {
            const sc = rng.pick(CA_ALLOC_LEVY_TOTAL_SCENARIOS);
            const O1 = rng.int(8, 30) * 1000;
            const O2 = rng.int(8, 30) * 1000;
            const O3 = rng.int(8, 30) * 1000;
            const tp1 = rng.pick([0.3, 0.5, 1.2]);
            const tp2 = rng.pick([15, 20, 25]);
            const answer = O1 + O2 + O3;
            return {
                prompt: `${sc.firm} runs three indirect cost centers - ${sc.ic1} (primary overheads ${eur(O1)}), ${sc.ic2} (${eur(O2)}) and ${sc.ic3} (${eur(O3)}) - and the two direct cost centers ${sc.dc1} and ${sc.dc2}. It allocates with the method of credits and debits with a levy for cost coverage, using preset transfer prices of ${eur(tp1)} per ${sc.u} of ${sc.svc} and ${eur(tp2)} per ${sc.hour}. What total amount is debited to the two direct cost centers by the indirect cost centers?`,
                given: {
                    [`Primary overheads ${sc.ic1} / ${sc.ic2} / ${sc.ic3}`]: `${eur(O1)} / ${eur(O2)} / ${eur(O3)}`,
                    "Preset transfer prices": `${eur(tp1)} per ${sc.u} ${sc.svc}, ${eur(tp2)} per ${sc.hour}`,
                },
                answer,
                explanation: String.raw`$\text{total debit} = \sum_i O_i$ over the indirect cost centers - the levy for cost coverage clears every indirect center's balance, so in the end their entire primary overheads land at the direct cost centers, no matter which preset transfer prices were used along the way: ${eur(O1)} + ${eur(O2)} + ${eur(O3)} = ${eur(answer)}.`,
            };
        },
    },

    // -------------------------------------- product costing (second batch)
    {
        id: "ca-pc-direct-material-per-unit",
        subject: "cost_accounting",
        topic: "product_costing",
        difficulty: "very_easy",
        kind: "numeric",
        unit: "EUR",
        source: "TUM Cost Accounting WS16/17, Q23",
        build: (rng) => {
            const sc = rng.pick(CA_PC_MARLIN_SCENARIOS);
            const pKg = rng.int(5, 14);
            const w = rng.pick([1.5, 2, 2.5, 4, 5]);
            const answer = pKg * w;
            return {
                prompt: `${sc.firmIntro} buys ${sc.mat} at ${eur(pKg)} per kg. One ${sc.b} requires ${n(w)} kg of ${sc.matShort}. What is the direct material cost per ${sc.b}?`,
                given: {
                    "Material price": `${eur(pKg)} per kg`,
                    [`Material per ${sc.unit}`]: `${n(w)} kg`,
                },
                answer,
                explanation: String.raw`$k_{DM} = p_{material} \cdot w$ - direct material per unit is the material price times the quantity built into one unit: ${eur(pKg)} × ${n(w)} kg = ${eur(answer)}.`,
            };
        },
    },
    {
        id: "ca-pc-direct-labor-per-unit",
        subject: "cost_accounting",
        topic: "product_costing",
        difficulty: "very_easy",
        kind: "numeric",
        unit: "EUR",
        source: "TUM Cost Accounting WS16/17 Q24; SS2017 Q24",
        build: (rng) => {
            const sc = rng.pick(CA_PC_MARLIN_SCENARIOS);
            const wage = rng.int(15, 45);
            const t = rng.pick([0.25, 0.5, 0.75, 1.5]);
            const answer = wage * t;
            return {
                prompt: `${sc.verb} a ${sc.a} at ${sc.firm} takes ${n(t)} hours of manufacturing time, paid at a direct labor rate of ${eur(wage)} per hour. What is the direct labor cost per ${sc.a}?`,
                given: {
                    "Direct labor rate": `${eur(wage)} per hour`,
                    "Manufacturing time": `${n(t)} h per ${sc.unit}`,
                },
                answer,
                explanation: String.raw`$k_{DL} = w \cdot t$ - the wage rate times the manufacturing time per unit: ${eur(wage)} × ${n(t)} h = ${eur(answer)}.`,
            };
        },
    },
    {
        id: "ca-pc-material-oh-per-unit",
        subject: "cost_accounting",
        topic: "product_costing",
        difficulty: "medium",
        kind: "numeric",
        unit: "EUR",
        source: "TUM Cost Accounting SS2015 Q31; Mock Exam Q27",
        build: (rng) => {
            const sc = rng.pick(CA_PC_MARLIN_SCENARIOS);
            const dmA = rng.int(3, 12);
            const dmB = rng.int(5, 20);
            const qA = rng.int(4, 15) * 100;
            const qB = rng.int(4, 15) * 100;
            const rate = rng.pick([0.2, 0.25, 0.3, 0.4, 0.5]);
            const base = dmA * qA + dmB * qB;
            const M = rate * base;
            const answer = dmA * (1 + rate);
            return {
                prompt: `${sc.firm} produces ${n(qA)} ${sc.as} (direct material ${eur(dmA)} per unit) and ${n(qB)} ${sc.bs} (direct material ${eur(dmB)} per unit). Material overheads of ${eur(M)} are allocated as a surcharge on direct material. What are the total material costs per ${sc.a}?`,
                given: {
                    [`Direct material ${sc.a} / ${sc.b}`]: `${eur(dmA)} / ${eur(dmB)} per unit`,
                    [`Produced ${sc.as} / ${sc.bs}`]: `${n(qA)} / ${n(qB)} units`,
                    "Material overheads": eur(M),
                },
                answer,
                explanation: String.raw`$k_{mat} = k_{DM} \cdot (1 + z_{mat})$ with $z_{mat} = \frac{\text{material overheads}}{\text{total direct material}}$. The base is ${n(qA)} × ${eur(dmA)} + ${n(qB)} × ${eur(dmB)} = ${eur(base)}, so z = ${eur(M)} / ${eur(base)} = ${pct(rate * 100)}. Per ${sc.a}: ${eur(dmA)} + ${pct(rate * 100)} × ${eur(dmA)} = ${eur(answer)}.`,
                hint: String.raw`Total material costs per unit are the direct material plus the material overhead surcharge on it: $k_{mat} = k_{DM} \cdot (1 + z_{mat})$, where the surcharge rate $z_{mat}$ is the material overheads over the total direct material of all products.`,
            };
        },
    },
    {
        id: "ca-pc-oh-share-percent",
        subject: "cost_accounting",
        topic: "product_costing",
        difficulty: "easy",
        kind: "numeric",
        unit: "percent",
        source: "TUM Cost Accounting WS16/17 Q26; SS2017 Q25",
        build: (rng) => {
            const sc = rng.pick(CA_PC_MARLIN_SCENARIOS);
            const qA = rng.int(4, 15) * 100;
            const qB = rng.int(4, 15) * 100;
            const tA = rng.int(2, 8);
            const tB = rng.int(2, 8);
            const baseA = qA * tA;
            const baseB = qB * tB;
            const answer = (baseB / (baseA + baseB)) * 100;
            return {
                prompt: `${sc.firm} allocates its production overheads on production time. This period it produces ${n(qA)} ${sc.as} (${n(tA)} machine minutes each) and ${n(qB)} ${sc.bs} (${n(tB)} machine minutes each). What percentage of the production overheads is allocated to the ${sc.bs}?`,
                given: {
                    [`Produced ${sc.as} / ${sc.bs}`]: `${n(qA)} / ${n(qB)} units`,
                    [`Production time ${sc.a} / ${sc.b}`]: `${n(tA)} / ${n(tB)} min per unit`,
                },
                answer,
                explanation: String.raw`$\text{share}_B = \frac{x_B \cdot t_B}{x_A \cdot t_A + x_B \cdot t_B}$ - with a single allocation base, each product's share of the pool equals its share of the base. ${cap(sc.bs)} use ${n(qB)} × ${n(tB)} = ${n(baseB)} of ${n(baseA + baseB)} total minutes, i.e. ${pct(answer)}.`,
            };
        },
    },
    {
        id: "ca-pc-production-oh-per-unit",
        subject: "cost_accounting",
        topic: "product_costing",
        difficulty: "easy",
        kind: "numeric",
        unit: "EUR",
        source: "TUM Cost Accounting SS2015 Q27; WS16/17 Q25",
        build: (rng) => {
            const sc = rng.pick(CA_PC_MARLIN_SCENARIOS);
            const qA = rng.int(4, 15) * 100;
            const qB = rng.int(4, 15) * 100;
            const tA = rng.int(2, 8);
            const tB = rng.int(2, 8);
            const rate = rng.pick([0.5, 1, 1.5, 2]);
            const P = rate * (qA * tA + qB * tB);
            const answer = rate * tB;
            return {
                prompt: `${sc.firm} incurs variable production overheads of ${eur(P)}, allocated on production time. It produces ${n(qA)} ${sc.as} taking ${n(tA)} minutes each and ${n(qB)} ${sc.bs} taking ${n(tB)} minutes each. What is the variable production overhead per ${sc.b}?`,
                given: {
                    "Variable production overheads": eur(P),
                    [`Produced ${sc.as} / ${sc.bs}`]: `${n(qA)} / ${n(qB)} units`,
                    [`Production time ${sc.a} / ${sc.b}`]: `${n(tA)} / ${n(tB)} min per unit`,
                },
                answer,
                explanation: String.raw`$k_{PO} = \frac{\text{production overheads}}{\text{total production time}} \cdot t$ - first the rate per minute: ${eur(P)} / (${n(qA)} × ${n(tA)} + ${n(qB)} × ${n(tB)}) min = ${eur(rate)} per minute; a ${sc.b} takes ${n(tB)} min, so it carries ${n(tB)} × ${eur(rate)} = ${eur(answer)}.`,
            };
        },
    },
    {
        id: "ca-pc-equivalence-line-total",
        subject: "cost_accounting",
        topic: "product_costing",
        difficulty: "medium",
        kind: "numeric",
        unit: "EUR",
        source: "TUM Cost Accounting Mock Exam, Q26",
        build: (rng) => {
            const sc = rng.pick(CA_PC_EQUIVALENCE_LINE_SCENARIOS);
            const w1 = rng.pick([100, 120, 150]);
            const mult = rng.pick([1.5, 2, 2.5]);
            const w2 = w1 * mult;
            const q1 = rng.int(8, 20) * 100;
            const q2 = rng.int(8, 20) * 100;
            const k = rng.pick([2, 3, 4, 5]);
            const units = q1 + q2 * mult;
            const F = k * units;
            const answer = k * mult * q2;
            return {
                prompt: `${sc.intro}, produces the ${sc.units} ${sc.a} (${n(w1)} g, ${n(q1)} units) and ${sc.b} (${n(w2)} g, ${n(q2)} units) in one process. Production overheads of ${eur(F)} are allocated with the equivalence number method using ${sc.weight}, with ${sc.a} as the reference product (equivalence number 1). What are the production overheads allocated to the entire ${sc.b} production?`,
                given: {
                    [`Weight ${sc.a} / ${sc.b}`]: `${n(w1)} g / ${n(w2)} g`,
                    [`Produced ${sc.a} / ${sc.b}`]: `${n(q1)} / ${n(q2)} units`,
                    "Production overheads": eur(F),
                },
                answer,
                explanation: String.raw`$e_{${sc.b}} = \frac{w_{${sc.b}}}{w_{${sc.a}}}$ = ${n(w2)} / ${n(w1)} = ${n(mult)}. Equivalent units: ${n(q1)} × 1 + ${n(q2)} × ${n(mult)} = ${n(units)}, so the cost per equivalent unit is ${eur(F)} / ${n(units)} = ${eur(k)}. The ${sc.b} line carries ${eur(k)} × ${n(mult)} × ${n(q2)} = ${eur(answer)}.`,
            };
        },
    },
    {
        id: "ca-pc-equivalence-variable-unit",
        subject: "cost_accounting",
        topic: "product_costing",
        difficulty: "medium",
        kind: "numeric",
        unit: "EUR",
        source: "TUM Cost Accounting WS17/18, Q26",
        build: (rng) => {
            const sc = rng.pick(CA_PC_EQUIVALENCE_VARIABLE_SCENARIOS);
            const w1 = rng.pick([2, 4]);
            const mult = rng.pick([1.25, 1.5, 1.75, 2.5]);
            const w2 = w1 * mult;
            const q1 = rng.int(8, 20) * 100;
            const q2 = rng.int(8, 20) * 100;
            const kEU = rng.pick([1.5, 2, 2.5, 3]);
            const eu = q1 + mult * q2;
            const V = kEU * eu;
            const answer = kEU * mult;
            return {
                prompt: `${sc.firm} produces the ${sc.items} ${sc.a} (${n(w1)} kg) and ${sc.b} (${n(w2)} kg) in one ${sc.process}. Costs are proportional to product weight; the equivalence number method is applied with ${sc.a} as the reference product. This period, ${n(q1)} ${sc.a} and ${n(q2)} ${sc.b} ${sc.items} are produced and variable manufacturing costs of ${eur(V)} are incurred. What are the variable manufacturing costs per ${sc.b} ${sc.item}?`,
                given: {
                    [`Weight ${sc.a} / ${sc.b}`]: `${n(w1)} kg / ${n(w2)} kg`,
                    [`Produced ${sc.a} / ${sc.b}`]: `${n(q1)} / ${n(q2)} units`,
                    "Variable manufacturing costs": eur(V),
                },
                answer,
                explanation: String.raw`$e_{${sc.b}} = \frac{w_{${sc.b}}}{w_{${sc.a}}}$ = ${n(w2)} / ${n(w1)} = ${n(mult)}. Equivalent units: ${n(q1)} + ${n(q2)} × ${n(mult)} = ${n(eu)}; cost per equivalent unit: ${eur(V)} / ${n(eu)} = ${eur(kEU)}. A ${sc.b} ${sc.item} counts as ${n(mult)} equivalent units, so it carries ${n(mult)} × ${eur(kEU)} = ${eur(answer)}.`,
            };
        },
    },
    {
        id: "ca-pc-mfg-cost-produced",
        subject: "cost_accounting",
        topic: "product_costing",
        difficulty: "very_easy",
        kind: "numeric",
        unit: "EUR",
        source: "TUM Cost Accounting SS2017 Q27; WS17/18 Q27",
        build: (rng) => {
            const sc = rng.pick(CA_PC_MARLIN_SCENARIOS);
            const m = rng.int(5, 25);
            const q = rng.int(8, 30) * 100;
            const s = q + rng.pick([-4, -3, 3, 4]) * 100;
            const answer = m * q;
            return {
                prompt: `${sc.firm}' full manufacturing costs per ${sc.c} are ${eur(m)}. This period, ${n(q)} ${sc.cs} are produced and ${n(s)} ${sc.cs} are sold. What are the full manufacturing costs of the quantity produced?`,
                given: {
                    "Full manufacturing costs per unit": eur(m),
                    "Produced quantity": `${n(q)} units`,
                    "Sold quantity": `${n(s)} units`,
                },
                answer,
                explanation: String.raw`$K_{mfg} = k_{mfg} \cdot x_{produced}$ - manufacturing costs of the quantity produced follow the production volume, not the sales volume: ${eur(m)} × ${n(q)} = ${eur(answer)}.`,
            };
        },
    },
    {
        id: "ca-pc-sga-rate",
        subject: "cost_accounting",
        topic: "product_costing",
        difficulty: "medium",
        kind: "numeric",
        unit: "percent",
        source: "TUM Cost Accounting WS17/18 Q28; SS2015 Q28",
        build: (rng) => {
            const sc = rng.pick(CA_PC_MARLIN_SCENARIOS);
            const m1 = rng.int(5, 20);
            const m2 = rng.int(10, 40);
            const s1 = rng.int(6, 20) * 100;
            const s2 = rng.int(6, 20) * 100;
            const q1 = s1 + rng.pick([-2, 2, 3]) * 100;
            const q2 = s2 + rng.pick([-2, 2, 3]) * 100;
            const rate = rng.pick([5, 8, 10, 12, 20, 25]);
            const base = m1 * s1 + m2 * s2;
            const G = (rate / 100) * base;
            return {
                prompt: `${sc.firm} sells ${n(s1)} ${sc.as} and ${n(s2)} ${sc.bs} (having produced ${n(q1)} and ${n(q2)}); full manufacturing costs are ${eur(m1)} per ${sc.a} and ${eur(m2)} per ${sc.b}. Administrative, selling and shipping overheads of ${eur(G)} are allocated as a surcharge on the manufacturing costs of the quantity sold. What is the overhead rate for administrative, selling and shipping costs?`,
                given: {
                    [`Sold ${sc.as} / ${sc.bs}`]: `${n(s1)} / ${n(s2)} units`,
                    [`Produced ${sc.as} / ${sc.bs}`]: `${n(q1)} / ${n(q2)} units`,
                    "Full manufacturing costs": `${eur(m1)} / ${eur(m2)} per unit`,
                    "Admin, selling and shipping overheads": eur(G),
                },
                answer: rate,
                explanation: String.raw`$z_{SGA} = \frac{\text{admin, selling and shipping overheads}}{\text{manufacturing costs of quantity sold}}$ - the base uses the sold quantities: ${n(s1)} × ${eur(m1)} + ${n(s2)} × ${eur(m2)} = ${eur(base)}. So z = ${eur(G)} / ${eur(base)} = ${pct(rate)}. The produced quantities are a distractor.`,
            };
        },
    },
    {
        id: "ca-pc-multistage-stage2",
        subject: "cost_accounting",
        topic: "product_costing",
        difficulty: "medium",
        kind: "numeric",
        unit: "EUR",
        source: "TUM Cost Accounting SS2017, Q33",
        build: (rng) => {
            const sc = rng.pick(CA_PC_MULTISTAGE2_SCENARIOS);
            const u1 = rng.int(3, 9);
            const x1 = rng.int(8, 15) * 1000;
            const K1 = u1 * x1;
            const i2 = x1 - rng.int(0, 3) * 500;
            const r = rng.int(2, 8) * 100;
            const o2 = i2 - r;
            const K2 = rng.int(30, 90) * 1000;
            const answer = (K2 + i2 * u1) / o2;
            return {
                prompt: `${sc.firm} produces ${sc.items} in two stages and applies multi-stage process costing. Stage 1 (${sc.st1}) incurs ${eur(K1)} and outputs ${n(x1)} ${sc.itemsShort}. Stage 2 (${sc.st2}) incurs ${eur(K2)}, takes in ${n(i2)} ${sc.itemsShort}, loses ${n(r)} ${sc.itemsShort} as ${sc.loss} and outputs ${n(o2)} good ${sc.itemsShort}. What are the costs per ${sc.item} after stage 2?`,
                given: {
                    "Stage 1: costs / output": `${eur(K1)} / ${n(x1)} units`,
                    [`Stage 2: costs / input / ${sc.loss} / output`]: `${eur(K2)} / ${n(i2)} / ${n(r)} / ${n(o2)} units`,
                },
                answer,
                explanation: String.raw`$u_2 = \frac{K_2 + x_{in} \cdot u_1}{x_{out}}$ - the stage divides its own costs plus the value of the units taken in by the good output, so the lost units burden the surviving ${sc.itemsShort}. Stage 1: ${eur(K1)} / ${n(x1)} = ${eur(u1)}. Stage 2: (${eur(K2)} + ${n(i2)} × ${eur(u1)}) / ${n(o2)} = ${eur(answer)}.`,
            };
        },
    },
    {
        id: "ca-pc-revenue-minus-direct",
        subject: "cost_accounting",
        topic: "product_costing",
        difficulty: "medium",
        kind: "numeric",
        unit: "EUR",
        source: "TUM Cost Accounting SS2015, Q25",
        build: (rng) => {
            const sc = rng.pick(CA_PC_MARLIN_SCENARIOS);
            const s = rng.int(4, 12) * 100;
            const q = s + rng.pick([-3, -2, 2, 3]) * 100;
            const p = rng.int(20, 60);
            const dm = rng.int(3, 10);
            const dl = rng.int(3, 10);
            const answer = p * s - (dm + dl) * q;
            return {
                prompt: `${sc.firm} sells ${n(s)} ${sc.bs} at ${eur(p)} each; ${n(q)} ${sc.bs} were produced this period. Direct material is ${eur(dm)} and direct labor ${eur(dl)} per ${sc.unit}. What is the revenue for ${sc.bs} minus the direct costs actually incurred for ${sc.bs} this period?`,
                given: {
                    "Sold / produced": `${n(s)} / ${n(q)} units`,
                    "Price": eur(p),
                    "Direct material / direct labor": `${eur(dm)} / ${eur(dl)} per unit`,
                },
                answer,
                explanation: String.raw`$R - K_{direct} = p \cdot x_{sold} - (k_{DM} + k_{DL}) \cdot x_{produced}$ - revenue follows the sold quantity, but direct costs are incurred for the produced quantity. Revenue: ${n(s)} × ${eur(p)} = ${eur(p * s)}; direct costs: ${n(q)} × ${eur(dm + dl)} = ${eur((dm + dl) * q)}; difference: ${eur(answer)}.`,
            };
        },
    },

    // -------------------------------------- process costing (second batch)
    {
        id: "ca-proc-started-and-completed",
        subject: "cost_accounting",
        topic: "process_costing",
        difficulty: "very_easy",
        kind: "numeric",
        unit: "units",
        source: "TUM Cost Accounting SS2018 Q25; WS18/19 Q25",
        build: (rng) => {
            const sc = rng.pick(CA_PROC_AURORA_SCENARIOS);
            const b = rng.int(2, 8) * 1000;
            const s = rng.int(20, 50) * 1000;
            const e = rng.int(2, 8) * 1000;
            const answer = s - e;
            return {
                prompt: `${sc.firmPoss} ${sc.dept} starts July with ${n(b)} ${sc.items} in beginning work-in-process inventory. During July, ${n(s)} ${sc.itemsShort} are started; ending work-in-process inventory is ${n(e)} ${sc.itemsShort}. Under the FIFO method, how many of the ${sc.itemsShort} started in July were also completed in July?`,
                given: {
                    "Beginning WIP": `${n(b)} units`,
                    "Started in July": `${n(s)} units`,
                    "Ending WIP": `${n(e)} units`,
                },
                answer,
                explanation: String.raw`$x_{started \& completed} = x_{started} - x_{end}$ - under FIFO the ending work-in-process inventory consists of the units started last, so of the ${n(s)} ${sc.itemsShort} started, all but the ${n(e)} still in process were finished: ${n(s)} − ${n(e)} = ${n(answer)} units. The beginning WIP units were started last period and do not count here.`,
            };
        },
    },
    {
        id: "ca-proc-wa-dm-cost-per-eu",
        subject: "cost_accounting",
        topic: "process_costing",
        difficulty: "hard",
        kind: "numeric",
        unit: "EUR",
        source: "TUM Cost Accounting SS2018 Q30; WS18/19 Q30",
        build: (rng) => {
            const sc = rng.pick(CA_PROC_AURORA_SCENARIOS);
            const b = rng.int(2, 8) * 1000;
            const s = rng.int(20, 50) * 1000;
            const e = rng.int(2, 8) * 1000;
            const rb = rng.int(15, 55) * 10;
            const rs = rng.int(15, 55) * 10;
            const Cb = b * rb;
            const D = s * rs;
            const completed = b + s - e;
            const answer = (Cb + D) / (b + s);
            return {
                prompt: `In ${sc.firmPoss} ${sc.dept}, all direct materials are added at the beginning of the process. July opens with ${n(b)} ${sc.itemsShort} in beginning work-in-process inventory carrying direct material costs of ${eur(Cb)}; during July, ${n(s)} ${sc.itemsShort} are started and direct material costs of ${eur(D)} are added. Ending work-in-process inventory is ${n(e)} ${sc.itemsShort}. Under the weighted-average method, what is the cost per equivalent unit of "work done to date" for direct materials?`,
                given: {
                    "Beginning WIP": `${n(b)} units with ${eur(Cb)} direct material costs`,
                    "Started in July": `${n(s)} units`,
                    "Direct material costs added in July": eur(D),
                    "Ending WIP": `${n(e)} units`,
                },
                answer,
                explanation: String.raw`$k_{EU} = \frac{K_{begin} + K_{added}}{EU_{DM}}$ - the weighted-average method pools the beginning inventory's costs with the period's costs. Because materials enter at the start, every unit is complete for materials: $EU_{DM} = x_{completed} + x_{end}$ = ${n(completed)} + ${n(e)} = ${n(b + s)}. So $k_{EU}$ = (${eur(Cb)} + ${eur(D)}) / ${n(b + s)} = ${eur(answer)}.`,
            };
        },
    },
    {
        id: "ca-proc-total-costs-to-account",
        subject: "cost_accounting",
        topic: "process_costing",
        difficulty: "medium",
        kind: "numeric",
        unit: "EUR",
        source: "TUM Cost Accounting SS2018 Q32; WS18/19 Q32",
        build: (rng) => {
            const sc = rng.pick(CA_PROC_AURORA_SCENARIOS);
            const Wb = rng.int(30, 90) * 10000;
            const D = rng.int(80, 200) * 10000;
            const C = rng.int(80, 200) * 10000;
            const b = rng.int(2, 8) * 1000;
            const cb = rng.pick([0.4, 0.6]);
            const answer = Wb + D + C;
            return {
                prompt: `${sc.firmPoss} ${sc.dept} opens July with ${n(b)} ${sc.itemsShort} in beginning work-in-process inventory (${pct(cb * 100)} complete for conversion costs), which carry total costs of ${eur(Wb)}. During July, direct material costs of ${eur(D)} and conversion costs of ${eur(C)} are added. Under the weighted-average method, what are the total costs assigned to units completed and transferred out plus ending work-in-process inventory together in July?`,
                given: {
                    "Costs in beginning WIP": eur(Wb),
                    "Beginning WIP": `${n(b)} units, ${pct(cb * 100)} complete`,
                    "Direct material costs added": eur(D),
                    "Conversion costs added": eur(C),
                },
                answer,
                explanation: String.raw`$K_{total} = K_{begin} + K_{DM} + K_{conv}$ - every euro to account for ends up either in the units transferred out or in the ending inventory, so the two together always equal all costs: ${eur(Wb)} + ${eur(D)} + ${eur(C)} = ${eur(answer)}. The degree of completion only shifts costs between the two groups.`,
            };
        },
    },
    {
        id: "ca-proc-wa-completed-costs",
        subject: "cost_accounting",
        topic: "process_costing",
        difficulty: "easy",
        kind: "numeric",
        unit: "EUR",
        source: "TUM Cost Accounting SS2018 Q31; WS18/19 Q31",
        build: (rng) => {
            const sc = rng.pick(CA_PROC_AURORA_SCENARIOS);
            const c = rng.int(20, 50) * 1000;
            const k = rng.int(20, 70) * 10;
            const e = rng.int(2, 8) * 1000;
            const ce = rng.pick([0.2, 0.4, 0.6, 0.8]);
            const answer = c * k;
            return {
                prompt: `In July, ${sc.firmPoss} ${sc.dept} completes and transfers out ${n(c)} ${sc.items}; ending work-in-process inventory is ${n(e)} ${sc.itemsShort}, ${pct(ce * 100)} complete with respect to conversion costs. The weighted-average cost per equivalent unit for conversion costs is ${eur(k)}. What amount of conversion costs is assigned to the units completed and transferred out?`,
                given: {
                    "Completed and transferred out": `${n(c)} units`,
                    "Ending WIP": `${n(e)} units, ${pct(ce * 100)} complete`,
                    "Conversion cost per equivalent unit": eur(k),
                },
                answer,
                explanation: String.raw`$K_{completed} = x_{completed} \cdot k_{EU}$ - completed units are 100 % done, so each carries one full equivalent unit of conversion costs: ${n(c)} × ${eur(k)} = ${eur(answer)}. Only the ending inventory is weighted with its degree of completion.`,
            };
        },
    },

    // --------------------------------- activity-based costing (second batch)
    {
        id: "ca-abc-dlh-oh-per-unit",
        subject: "cost_accounting",
        topic: "activity_based_costing",
        difficulty: "medium",
        kind: "numeric",
        unit: "EUR",
        source: "TUM Cost Accounting WS18/19, Q19",
        build: (rng) => {
            const sc = rng.pick(CA_ABC_RHEIN_SCENARIOS);
            const batch = 2000;
            const nB = rng.int(20, 60);
            const h = rng.int(2, 8);
            const otherH = rng.int(10, 30) * 100;
            const H = nB * h + otherH;
            const rate = rng.pick([200, 250, 300, 400, 500]);
            const T = rate * H;
            const answer = (h * rate) / batch;
            return {
                prompt: `${sc.firm} produces its ${sc.lines[0]} ${sc.kind} line in batches of ${n(batch)} ${sc.items} and budgets ${n(nB)} ${sc.lines[0]} batches for the year, each requiring ${n(h)} direct labor hours. Total budgeted manufacturing overheads are ${eur(T)} for ${n(H)} direct labor hours across all product lines. Under a traditional costing system using direct labor hours as the allocation base, what is the overhead cost per ${sc.lines[0]} ${sc.item}?`,
                given: {
                    "Batch size": `${n(batch)} ${sc.items}`,
                    [`${sc.lines[0]} batches / DLH per batch`]: `${n(nB)} / ${n(h)} h`,
                    "Total manufacturing overheads": eur(T),
                    "Total direct labor hours": `${n(H)} h`,
                },
                answer,
                explanation: String.raw`$k_{OH} = \frac{r \cdot h_{batch}}{\text{batch size}}$ with $r = \frac{\text{total overheads}}{\text{total DLH}}$ = ${eur(T)} / ${n(H)} h = ${eur(rate)} per hour. A ${sc.lines[0]} batch absorbs ${n(h)} × ${eur(rate)} = ${eur(h * rate)}, i.e. ${eur(answer)} per ${sc.item}.`,
            };
        },
    },
    {
        id: "ca-abc-dlh-profit-per-unit",
        subject: "cost_accounting",
        topic: "activity_based_costing",
        difficulty: "hard",
        kind: "numeric",
        unit: "EUR",
        source: "TUM Cost Accounting WS18/19, Q20",
        build: (rng) => {
            const sc = rng.pick(CA_ABC_RHEIN_SCENARIOS);
            const batch = 2000;
            const nB = rng.int(20, 60);
            const h = rng.int(2, 8);
            const otherH = rng.int(10, 30) * 100;
            const H = nB * h + otherH;
            const rate = rng.pick([200, 250, 300, 400, 500]);
            const T = rate * H;
            const dm = rng.int(4, 16) * 0.05;
            const dl = rng.int(4, 16) * 0.05;
            const ohu = (h * rate) / batch;
            const margin = rng.int(5, 20) * 0.1;
            const p = Math.round((dm + dl + ohu + margin) * 100) / 100;
            const answer = p - dm - dl - ohu;
            return {
                prompt: `${sc.firm} sells its ${sc.lines[1]} ${sc.kind} at ${eur(p)} per ${sc.item}, with direct material of ${eur(dm)} and direct labor of ${eur(dl)} per ${sc.item}. ${sc.lines[1]} is made in batches of ${n(batch)} ${sc.items} (${n(nB)} batches budgeted), each batch requiring ${n(h)} direct labor hours. Total budgeted manufacturing overheads are ${eur(T)} for ${n(H)} direct labor hours in total. Under a traditional costing system with direct labor hours as the allocation base, what is the operating profit per ${sc.lines[1]} ${sc.item}?`,
                given: {
                    "Price / direct material / direct labor": `${eur(p)} / ${eur(dm)} / ${eur(dl)} per ${sc.item}`,
                    [`Batch size / ${sc.lines[1]} batches / DLH per batch`]: `${n(batch)} ${sc.items} / ${n(nB)} / ${n(h)} h`,
                    "Total overheads / total DLH": `${eur(T)} / ${n(H)} h`,
                },
                answer,
                explanation: String.raw`$\pi = p - k_{DM} - k_{DL} - \frac{r \cdot h_{batch}}{\text{batch size}}$ with the plantwide rate $r$ = ${eur(T)} / ${n(H)} h = ${eur(rate)} per hour. Overheads per ${sc.item}: ${n(h)} × ${eur(rate)} / ${n(batch)} = ${eur(ohu)}. Profit per ${sc.item}: ${eur(p)} − ${eur(dm)} − ${eur(dl)} − ${eur(ohu)} = ${eur(answer)}.`,
            };
        },
    },
    {
        id: "ca-abc-overall-profit",
        subject: "cost_accounting",
        topic: "activity_based_costing",
        difficulty: "hard",
        kind: "numeric",
        unit: "EUR",
        source: "TUM Cost Accounting WS18/19 Q18; WS18/19 Q23",
        build: (rng) => {
            const sc = rng.pick(CA_ABC_RHEIN_SCENARIOS);
            const names = sc.lines;
            const dm: number[] = [];
            const dl: number[] = [];
            const p: number[] = [];
            const q: number[] = [];
            let gross = 0;
            for (let i = 0; i < 3; i++) {
                const dmi = rng.int(4, 16) * 0.05;
                const dli = rng.int(4, 16) * 0.05;
                const mi = rng.int(10, 30) * 0.1;
                const qi = rng.int(1, 5) * 100000;
                dm.push(dmi);
                dl.push(dli);
                p.push(Math.round((dmi + dli + mi) * 100) / 100);
                q.push(qi);
                gross += (p[i] - dmi - dli) * qi;
            }
            const T = Math.round((gross * rng.pick([0.4, 0.5, 0.6])) / 1000) * 1000;
            const S = Math.round(T * 0.6);
            const I = T - S;
            const answer = gross - T;
            const line = (i: number) =>
                `${names[i]}: ${n(q[i])} ${sc.items} at ${eur(p[i])}, direct material ${eur(dm[i])}, direct labor ${eur(dl[i])}`;
            return {
                prompt: `${sc.firm} budgets three ${sc.kind} lines for next year - ${line(0)}; ${line(1)}; ${line(2)}. Total budgeted manufacturing overheads are ${eur(T)} (${eur(S)} setup costs allocated on setup hours, ${eur(I)} inspection costs allocated on inspection hours). What is the overall budgeted operating profit of the company under the activity-based costing system?`,
                given: {
                    [`${names[0]}: quantity / price / DM / DL`]: `${n(q[0])} / ${eur(p[0])} / ${eur(dm[0])} / ${eur(dl[0])}`,
                    [`${names[1]}: quantity / price / DM / DL`]: `${n(q[1])} / ${eur(p[1])} / ${eur(dm[1])} / ${eur(dl[1])}`,
                    [`${names[2]}: quantity / price / DM / DL`]: `${n(q[2])} / ${eur(p[2])} / ${eur(dm[2])} / ${eur(dl[2])}`,
                    "Total overheads (setup + inspection)": `${eur(T)} (${eur(S)} + ${eur(I)})`,
                },
                answer,
                explanation: String.raw`$\pi = \sum_i x_i \cdot (p_i - k_{DM,i} - k_{DL,i}) - K_{OH}$ - the overall profit is independent of how the overhead pools are allocated among products; allocation only shifts profit between lines. Gross margin over direct costs: ${eur(gross)}; minus total overheads ${eur(T)} gives ${eur(answer)} - the same figure a traditional costing system would report.`,
            };
        },
    },

    // ------------------------------------ income statements (second batch)
    {
        id: "ca-pl-cos-absorption-profit",
        subject: "cost_accounting",
        topic: "income_statements",
        difficulty: "medium",
        kind: "numeric",
        unit: "EUR",
        source: "TUM Cost Accounting SS2017, Q28",
        build: (rng) => {
            const sc = rng.pick(CA_PL_TORRINO_SCENARIOS);
            const k1 = rng.int(40, 90);
            const k2 = rng.int(90, 180);
            const p1 = k1 + rng.int(5, 25);
            const p2 = k2 + rng.int(10, 40);
            const s1 = rng.int(4, 15) * 100;
            const s2 = rng.int(4, 15) * 100;
            const q1 = s1 + rng.pick([-2, 2, 3]) * 100;
            const q2 = s2 + rng.pick([-2, 2, 3]) * 100;
            const answer = (p1 - k1) * s1 + (p2 - k2) * s2;
            return {
                prompt: `${sc.firm} sells ${n(s1)} units of the model ${sc.a} at ${eur(p1)} and ${n(s2)} units of the model ${sc.b} at ${eur(p2)} (production this period: ${n(q1)} ${sc.a}, ${n(q2)} ${sc.b}). The full total costs per unit are ${eur(k1)} for ${sc.a} and ${eur(k2)} for ${sc.b}. What is the profit according to the cost-of-sales method under absorption costing?`,
                given: {
                    [`Price ${sc.a} / ${sc.b}`]: `${eur(p1)} / ${eur(p2)}`,
                    [`Sold ${sc.a} / ${sc.b}`]: `${n(s1)} / ${n(s2)} units`,
                    [`Produced ${sc.a} / ${sc.b}`]: `${n(q1)} / ${n(q2)} units`,
                    [`Full total costs per unit ${sc.a} / ${sc.b}`]: `${eur(k1)} / ${eur(k2)}`,
                },
                answer,
                explanation: String.raw`$\pi = \sum_i (p_i - k_{total,i}) \cdot x_{sold,i}$ - the cost-of-sales method matches the full costs of the quantity sold against revenue; the produced quantities do not enter. ${sc.a}: ${n(s1)} × (${eur(p1)} − ${eur(k1)}) = ${eur((p1 - k1) * s1)}; ${sc.b}: ${n(s2)} × (${eur(p2)} − ${eur(k2)}) = ${eur((p2 - k2) * s2)}; profit: ${eur(answer)}.`,
                hint: String.raw`Full total costs per unit already contain the manufacturing costs and the administrative and selling costs. The cost-of-sales method matches them against the units sold only: $\pi = \sum_i (p_i - k_{total,i}) \cdot x_{sold,i}$.`,
            };
        },
    },
    {
        id: "ca-pl-fixed-costs-variable-costing",
        subject: "cost_accounting",
        topic: "income_statements",
        difficulty: "easy",
        kind: "numeric",
        unit: "EUR",
        source: "TUM Cost Accounting WS16/17, Q30",
        build: (rng) => {
            const sc = rng.pick(CA_PL_TORRINO_SCENARIOS);
            const M = rng.int(10, 40) * 10000;
            const P = rng.int(30, 90) * 10000;
            const S = rng.int(10, 40) * 10000;
            const inc = rng.int(2, 8) * 100;
            const answer = M + P;
            return {
                prompt: `${sc.firm}' overheads this period are all fixed: material overheads of ${eur(M)}, production overheads of ${eur(P)}, and administrative and selling overheads of ${eur(S)}. Inventory increases by ${n(inc)} ${sc.items} during the period. What fixed manufacturing costs are shown in the income statement according to the nature of expense method under variable costing?`,
                given: {
                    "Material overheads (fixed)": eur(M),
                    "Production overheads (fixed)": eur(P),
                    "Admin and selling overheads (fixed)": eur(S),
                    "Inventory increase": `${n(inc)} units`,
                },
                answer,
                explanation: String.raw`$K_{fix}^{mfg} = K_{mat} + K_{prod}$ - under variable costing all fixed costs are period costs, shown in full in the period they are incurred; none of them is carried into inventory, so the inventory increase changes nothing. Fixed manufacturing costs: ${eur(M)} + ${eur(P)} = ${eur(answer)} (the ${eur(S)} admin and selling overheads are not manufacturing costs).`,
            };
        },
    },
    {
        id: "ca-pl-variable-cost-of-sales",
        subject: "cost_accounting",
        topic: "income_statements",
        difficulty: "easy",
        kind: "numeric",
        unit: "EUR",
        source: "TUM Cost Accounting WS16/17, Q31",
        build: (rng) => {
            const sc = rng.pick(CA_PL_TORRINO_SCENARIOS);
            const v1 = rng.int(20, 60);
            const v2 = rng.int(40, 120);
            const s1 = rng.int(4, 15) * 100;
            const s2 = rng.int(4, 15) * 100;
            const q1 = s1 + rng.pick([-2, 2, 3]) * 100;
            const q2 = s2 + rng.pick([-2, 2, 3]) * 100;
            const answer = v1 * s1 + v2 * s2;
            return {
                prompt: `${sc.firm} sells ${n(s1)} units of the model ${sc.a} (variable costs ${eur(v1)} per unit) and ${n(s2)} units of the model ${sc.b} (variable costs ${eur(v2)} per unit); production this period is ${n(q1)} and ${n(q2)} units respectively. What are the total variable costs of the sold quantities according to the cost-of-sales method under variable costing?`,
                given: {
                    [`Variable costs ${sc.a} / ${sc.b}`]: `${eur(v1)} / ${eur(v2)} per unit`,
                    [`Sold ${sc.a} / ${sc.b}`]: `${n(s1)} / ${n(s2)} units`,
                    [`Produced ${sc.a} / ${sc.b}`]: `${n(q1)} / ${n(q2)} units`,
                },
                answer,
                explanation: String.raw`$K_{var}^{sold} = \sum_i k_{var,i} \cdot x_{sold,i}$ - the cost-of-sales method matches costs to the quantity sold: ${n(s1)} × ${eur(v1)} + ${n(s2)} × ${eur(v2)} = ${eur(answer)}. The produced quantities are only relevant for inventory valuation, not for this line.`,
            };
        },
    },
    {
        id: "ca-pl-cm-per-unit",
        subject: "cost_accounting",
        topic: "income_statements",
        difficulty: "very_easy",
        kind: "numeric",
        unit: "EUR",
        source: "TUM Cost Accounting SS2015 Q26; SS2017 Q29; WS17/18 Q31; Mock Exam Q32",
        build: (rng) => {
            const sc = rng.pick(CA_PL_TORRINO_SCENARIOS);
            const cm = rng.int(5, 30);
            const v = rng.int(10, 60);
            const p = v + cm;
            return {
                prompt: `${sc.firm} sells the model ${sc.a} at ${eur(p)} per unit. The variable total costs are ${eur(v)} per unit. What is the contribution margin per unit?`,
                given: {
                    "Price": eur(p),
                    "Variable total costs per unit": eur(v),
                },
                answer: cm,
                explanation: String.raw`$cm = p - k_{var}$ - the contribution margin per unit is the price minus all variable costs per unit: ${eur(p)} − ${eur(v)} = ${eur(cm)}. It states what each sold unit contributes to covering fixed costs and profit.`,
                hint: String.raw`The contribution margin per unit is the price minus all variable costs per unit, manufacturing and selling alike: $cm = p - k_{var}$.`,
            };
        },
    },
    {
        id: "ca-pl-mfg-cost-sold",
        subject: "cost_accounting",
        topic: "income_statements",
        difficulty: "easy",
        kind: "numeric",
        unit: "EUR",
        source: "TUM Cost Accounting WS17/18 Q28; SS2015 Q28",
        build: (rng) => {
            const sc = rng.pick(CA_PL_TORRINO_SCENARIOS);
            const m1 = rng.int(5, 20);
            const m2 = rng.int(10, 40);
            const s1 = rng.int(6, 20) * 100;
            const s2 = rng.int(6, 20) * 100;
            const q1 = s1 + rng.pick([-2, 2, 3]) * 100;
            const q2 = s2 + rng.pick([-2, 2, 3]) * 100;
            const answer = m1 * s1 + m2 * s2;
            return {
                prompt: `${sc.firm}' full manufacturing costs are ${eur(m1)} per unit of the model ${sc.a} and ${eur(m2)} per unit of the model ${sc.b}. This period it produces ${n(q1)} ${sc.a} and ${n(q2)} ${sc.b} ${sc.items} and sells ${n(s1)} and ${n(s2)} respectively. What are the manufacturing costs of the quantity sold?`,
                given: {
                    [`Full manufacturing costs ${sc.a} / ${sc.b}`]: `${eur(m1)} / ${eur(m2)} per unit`,
                    [`Sold ${sc.a} / ${sc.b}`]: `${n(s1)} / ${n(s2)} units`,
                    [`Produced ${sc.a} / ${sc.b}`]: `${n(q1)} / ${n(q2)} units`,
                },
                answer,
                explanation: String.raw`$K_{mfg}^{sold} = \sum_i k_{mfg,i} \cdot x_{sold,i}$ - the surcharge base follows the quantity sold, not the quantity produced: ${n(s1)} × ${eur(m1)} + ${n(s2)} × ${eur(m2)} = ${eur(answer)}.`,
                hint: `Value each model's sold units at its full manufacturing costs per unit and add the two up - this figure is the base for the administrative and selling overhead surcharge, so the produced quantities stay out of it.`,
            };
        },
    },

    // ------------------------------------------------- CVP (second batch)
    {
        id: "ca-cvp-after-tax-ros-at-volume",
        subject: "cost_accounting",
        topic: "cvp",
        difficulty: "medium",
        kind: "numeric",
        unit: "percent",
        source: "TUM Cost Accounting WS16/17, Q36",
        build: (rng) => {
            const sc = rng.pick(CA_CVP_ROS_AT_VOLUME_SCENARIOS);
            const v = rng.int(20, 80);
            const cm = rng.int(30, 90);
            const p = v + cm;
            const x = rng.int(2, 6) * 1000;
            const F = rng.int(1, 4) * 10000;
            const tau = rng.pick([20, 25, 30, 40]);
            const pre = cm * x - F;
            const post = pre * (1 - tau / 100);
            const answer = (post / (p * x)) * 100;
            return {
                prompt: `${sc.intro}, sells its ${sc.item} at ${eur(p)} per unit with variable costs of ${eur(v)} per unit and yearly fixed costs of ${eur(F)}. The profit tax rate is ${pct(tau)}. What is the after-tax return on sales at a production and sales volume of ${n(x)} ${sc.items}?`,
                given: {
                    "Price / variable costs": `${eur(p)} / ${eur(v)} per unit`,
                    "Fixed costs": eur(F),
                    "Tax rate": pct(tau),
                    "Sales volume": `${n(x)} units`,
                },
                answer,
                explanation: String.raw`$ROS_{after tax} = \frac{(cm \cdot x - K_{fix}) \cdot (1 - \tau)}{p \cdot x}$ - after-tax profit over revenue. Pre-tax profit: ${eur(cm)} × ${n(x)} − ${eur(F)} = ${eur(pre)}; after tax: ${eur(pre)} × ${n(1 - tau / 100)} = ${eur(post)}. Revenue: ${n(x)} × ${eur(p)} = ${eur(p * x)}, so ROS = ${pct(answer)}.`,
            };
        },
    },
    {
        id: "ca-cvp-fixed-cost-reduction",
        subject: "cost_accounting",
        topic: "cvp",
        difficulty: "medium",
        kind: "numeric",
        unit: "EUR",
        source: "TUM Cost Accounting SS2017, Q36",
        build: (rng) => {
            const sc = rng.pick(CA_CVP_FIXED_COST_REDUCTION_SCENARIOS);
            const p = rng.int(4, 12) * 5;
            const cm = p * rng.pick([0.4, 0.6]);
            const v = p - cm;
            const r = rng.pick([10, 15, 20, 25]);
            const x = rng.int(5, 20) * 100;
            const target = (r / 100) * p * x;
            const answer = cm * x - target;
            const F0 = Math.ceil(answer / 1000) * 1000 + rng.int(2, 10) * 1000;
            return {
                prompt: `${sc.firm} expects to sell ${n(x)} ${sc.items} at ${eur(p)} each (variable costs ${eur(v)} per unit) and currently carries fixed costs of ${eur(F0)} for this product. It wants to cut the fixed costs far enough to achieve a return on sales of ${pct(r)} with the ${sc.itemsShort}. To what amount must the fixed costs be reduced?`,
                given: {
                    "Price / variable costs": `${eur(p)} / ${eur(v)} per unit`,
                    "Expected sales": `${n(x)} units`,
                    "Current fixed costs": eur(F0),
                    "Target return on sales": pct(r),
                },
                answer,
                explanation: String.raw`$K_{fix}^{new} = cm \cdot x - s \cdot p \cdot x$ - the required profit is $s \cdot p \cdot x$ = ${pct(r)} × ${eur(p)} × ${n(x)} = ${eur(target)}, and whatever the total contribution margin of ${eur(cm)} × ${n(x)} = ${eur(cm * x)} exceeds it by may remain as fixed costs: ${eur(cm * x)} − ${eur(target)} = ${eur(answer)}.`,
            };
        },
    },
    {
        id: "ca-cvp-be-with-tax-trap",
        subject: "cost_accounting",
        topic: "cvp",
        difficulty: "easy",
        kind: "numeric",
        unit: "units",
        source: "TUM Cost Accounting WS17/18, Q35",
        build: (rng) => {
            const sc = rng.pick(CA_CVP_TAX_TRAP_SCENARIOS);
            const cm = rng.int(5, 25);
            const qStar = rng.int(5, 40) * 100;
            const F = qStar * cm;
            const v = rng.int(10, 60);
            const p = v + cm;
            const tau = rng.pick([20, 25, 30]);
            return {
                prompt: `${sc.firm} sells its ${sc.item} at ${eur(p)} per unit with variable costs of ${eur(v)} per unit and yearly fixed costs of ${eur(F)}. A profit tax of ${pct(tau)} is deducted from any profit. What is the break-even quantity of the ${sc.itemShort}?`,
                given: {
                    "Price / variable costs": `${eur(p)} / ${eur(v)} per unit`,
                    "Fixed costs": eur(F),
                    "Profit tax rate": pct(tau),
                },
                answer: qStar,
                explanation: String.raw`$x_{BE} = \frac{K_{fix}}{p - k_{var}}$ - the tax rate is a trap: taxes scale the profit, and a profit of zero stays zero after any tax, so the break-even point is unchanged. With cm = ${eur(p)} − ${eur(v)} = ${eur(cm)}: ${eur(F)} / ${eur(cm)} = ${n(qStar)} units.`,
            };
        },
    },
    {
        id: "ca-cvp-campaign-extra-volume",
        subject: "cost_accounting",
        topic: "cvp",
        difficulty: "hard",
        kind: "numeric",
        unit: "units",
        source: "TUM Cost Accounting WS16/17, Q37",
        build: (rng) => {
            const sc = rng.pick(CA_CVP_CAMPAIGN_SCENARIOS);
            const p = rng.int(15, 30) * 10;
            const cm = p * 0.5;
            const v = p - cm;
            const tau = rng.pick([20, 37, 40]);
            const r = rng.pick([10, 12, 15]);
            const F = rng.int(10, 40) * 10000;
            const dF = rng.int(2, 8) * 10000;
            const denom = cm - ((r / 100) / (1 - tau / 100)) * p;
            const qReq = (F + dF) / denom;
            const x0 = Math.max(500, Math.floor((qReq * rng.pick([0.5, 0.6, 0.7])) / 100) * 100);
            const qMin = Math.ceil(qReq - 1e-7);
            const answer = qMin - x0;
            return {
                prompt: `${sc.firm} usually sells ${n(x0)} ${sc.items} per year at ${eur(p)} each (variable costs ${eur(v)} per unit, fixed costs ${eur(F)}). A planned social-media campaign would raise the fixed costs by ${eur(dF)} per year. By how many ${sc.itemsShort} must the campaign increase the usual sales volume at least so that ${sc.firm} still achieves an after-tax return on sales of ${pct(r)} (tax rate ${pct(tau)})?`,
                given: {
                    "Price / variable costs": `${eur(p)} / ${eur(v)} per unit`,
                    "Fixed costs / campaign add-on": `${eur(F)} / ${eur(dF)}`,
                    "Usual sales volume": `${n(x0)} units`,
                    "Target after-tax return on sales": pct(r),
                    "Tax rate": pct(tau),
                },
                answer,
                explanation: String.raw`$(cm \cdot x - K_{fix}^{new}) \cdot (1-\tau) \geq s \cdot p \cdot x \;\Rightarrow\; x \geq \frac{K_{fix}^{new}}{cm - \frac{s}{1-\tau} \cdot p}$. With $K_{fix}^{new}$ = ${eur(F + dF)} and the denominator ${eur(cm)} − (${n(r / 100)} / ${n(1 - tau / 100)}) × ${eur(p)} = ${eur(denom)}, the required volume is ${n2(qReq)}, i.e. at least ${n(qMin)} ${sc.itemsShort}. The campaign must add ${n(qMin)} − ${n(x0)} = ${n(answer)} units.`,
            };
        },
    },
    {
        id: "ca-cvp-bundle-price-target",
        subject: "cost_accounting",
        topic: "cvp",
        difficulty: "medium",
        kind: "numeric",
        unit: "units",
        source: "TUM Cost Accounting WS17/18, Q37",
        build: (rng) => {
            const sc = rng.pick(CA_CVP_BUNDLE_SCENARIOS);
            const bcm = rng.int(4, 12) * 10;
            const v1 = rng.int(10, 40);
            const v2 = rng.int(20, 60);
            const Pb = v1 + v2 + bcm;
            const bundles = rng.int(5, 40) * 100;
            const total = bundles * bcm;
            const F = Math.round((total * rng.pick([0.3, 0.4, 0.5])) / 1000) * 1000;
            const T = total - F;
            return {
                prompt: `${sc.firm} sells its ${sc.a} and a matching ${sc.b} only as a set at ${eur(Pb)} per set. The variable costs are ${eur(v1)} per ${sc.aShort} and ${eur(v2)} per ${sc.bShort}; the combined yearly fixed costs of both products are ${eur(F)}. How many sets must be sold to reach a target profit of ${eur(T)}?`,
                given: {
                    "Set price": eur(Pb),
                    [`Variable costs ${sc.aShort} / ${sc.bShort}`]: `${eur(v1)} / ${eur(v2)}`,
                    "Fixed costs": eur(F),
                    "Target profit": eur(T),
                },
                answer: bundles,
                explanation: String.raw`$x = \frac{K_{fix} + \pi_{target}}{p_{set} - k_{var,1} - k_{var,2}}$ - the set's contribution margin is ${eur(Pb)} − ${eur(v1)} − ${eur(v2)} = ${eur(bcm)}, so x = (${eur(F)} + ${eur(T)}) / ${eur(bcm)} = ${n(bundles)} sets.`,
            };
        },
    },
    {
        id: "ca-cvp-pretax-ros-volume",
        subject: "cost_accounting",
        topic: "cvp",
        difficulty: "easy",
        kind: "numeric",
        unit: "units",
        source: "TUM Cost Accounting Mock Exam, Q18",
        build: (rng) => {
            const sc = rng.pick(CA_CVP_PRETAX_ROS_SCENARIOS);
            const p = rng.int(10, 30);
            const cm = rng.int(Math.ceil(p * 0.3), Math.ceil(p * 0.6));
            const v = p - cm;
            const r = rng.pick([5, 10, 15]);
            const F = rng.int(2, 10) * 1000;
            const denom = cm - (r * p) / 100;
            const answer = Math.ceil(F / denom - 1e-7);
            return {
                prompt: `${sc.firm} sells ${sc.items} at ${eur(p)} each with variable costs of ${eur(v)} per unit and yearly fixed costs of ${eur(F)}. What is the minimum production and sales volume needed to achieve a return on sales of at least ${pct(r)} (no taxes)?`,
                given: {
                    "Price / variable costs": `${eur(p)} / ${eur(v)} per unit`,
                    "Fixed costs": eur(F),
                    "Target return on sales": pct(r),
                },
                answer,
                explanation: String.raw`$cm \cdot x - K_{fix} \geq s \cdot p \cdot x \;\Rightarrow\; x \geq \frac{K_{fix}}{cm - s \cdot p}$ - the profit must be at least ${pct(r)} of revenue. The denominator is ${eur(cm)} − ${pct(r)} × ${eur(p)} = ${eur(denom)}, so x ≥ ${eur(F)} / ${eur(denom)} = ${n2(F / denom)}, i.e. at least ${n(answer)} ${sc.itemsShort}.`,
            };
        },
    },

    // -------------------------------------- production program (2nd batch)
    {
        id: "ca-prog-first-product-quantity",
        subject: "cost_accounting",
        topic: "production_program",
        difficulty: "easy",
        kind: "numeric",
        unit: "units",
        source: "TUM Cost Accounting Mock Exam Q20; WS16/17 Q39",
        build: (rng) => {
            const sc = rng.pick(CA_PROG_LINDQVIST_SCENARIOS);
            const tA = rng.pick([0.1, 0.2, 0.25]);
            const tB = rng.pick([0.5, 1]);
            const relA = rng.int(30, 60);
            const relB = rng.int(10, 25);
            const cmA = relA * tA;
            const cmB = relB * tB;
            const maxA = rng.int(2, 8) * 1000;
            const leftB = rng.int(2, 6) * 100;
            const H = tA * maxA + tB * leftB;
            const maxB = leftB + rng.int(2, 6) * 100;
            return {
                prompt: `${sc.firmIntro} produces ${sc.A} and ${sc.B} on one ${sc.machine} with a yearly capacity of ${n(H)} hours. A ${sc.a} takes ${n(tA)} hours and earns a contribution margin of ${eur(cmA)}; a ${sc.b} takes ${n(tB)} hours and earns ${eur(cmB)}. Maximum yearly sales are ${n(maxA)} ${sc.as} and ${n(maxB)} ${sc.bs}. How many ${sc.A} are produced in the profit-maximizing production program?`,
                given: {
                    [`${cap(sc.machineShort)} capacity`]: `${n(H)} hours`,
                    [`Time ${sc.a} / ${sc.b}`]: `${n(tA)} / ${n(tB)} h per unit`,
                    [`Contribution margin ${sc.a} / ${sc.b}`]: `${eur(cmA)} / ${eur(cmB)}`,
                    [`Max sales ${sc.a} / ${sc.b}`]: `${n(maxA)} / ${n(maxB)} units`,
                },
                answer: maxA,
                explanation: String.raw`$cm_{rel} = \frac{cm}{t}$ ranks the products: ${sc.as} earn ${eur(relA)} per hour, ${sc.bs} ${eur(relB)} per hour, so ${sc.as} come first. Their full sales potential needs ${n(maxA)} × ${n(tA)} = ${n(tA * maxA)} h of the ${n(H)} h available - it fits, so all ${n(maxA)} ${sc.as} are produced and the remaining ${n(H - tA * maxA)} h go to ${sc.bs}.`,
            };
        },
    },
    {
        id: "ca-prog-price-floor-free-capacity",
        subject: "cost_accounting",
        topic: "production_program",
        difficulty: "easy",
        kind: "numeric",
        unit: "EUR",
        source: "TUM Cost Accounting WS16/17 Q40; SS2018 Q21",
        build: (rng) => {
            const sc = rng.pick(CA_PROG_LINDQVIST_SCENARIOS);
            const free = rng.int(5, 15) * 100;
            const tO = rng.pick([0.5, 1]);
            const qMaxH = Math.min(8, Math.floor(free / tO / 100));
            const Q = rng.int(2, qMaxH) * 100;
            const vm = rng.int(10, 30);
            const vp = rng.int(5, 20);
            const vs = rng.int(1, 8);
            const F = rng.int(20, 80) * 1000;
            const answer = vm + vp + vs;
            return {
                prompt: `${sc.customer} asks ${sc.firm} to produce ${n(Q)} ${sc.order}, each taking ${n(tO)} hour${tO === 1 ? "" : "s"} on the ${sc.machine}. The ${sc.machineShort} still has ${n(free)} unused hours this year. Each ${sc.orderOne} causes variable material costs of ${eur(vm)}, variable production costs of ${eur(vp)} and variable shipping costs of ${eur(vs)}; yearly fixed costs of ${eur(F)} are incurred anyway. What is the lower price limit per ${sc.orderOne}?`,
                given: {
                    "Order": `${n(Q)} units, ${n(tO)} h each`,
                    "Free capacity": `${n(free)} h`,
                    "Variable material / production / shipping costs": `${eur(vm)} / ${eur(vp)} / ${eur(vs)} per unit`,
                    "Fixed costs": eur(F),
                },
                answer,
                explanation: String.raw`$p_{min} = k_{var}$ - with enough idle capacity no contribution margin is displaced, so the short-term lower price limit is just the variable costs per unit: ${eur(vm)} + ${eur(vp)} + ${eur(vs)} = ${eur(answer)}. The fixed costs are incurred either way and are irrelevant; opportunity costs are zero.`,
                hint: `The short-term lower price limit is the variable cost per unit plus the contribution margin displaced elsewhere. Check first whether the free capacity covers the order - if nothing has to give way, no contribution margin is lost, and fixed costs that run either way do not raise the limit.`,
            };
        },
    },
    {
        id: "ca-prog-forgone-cm",
        subject: "cost_accounting",
        topic: "production_program",
        difficulty: "hard",
        kind: "numeric",
        unit: "EUR",
        source: "TUM Cost Accounting WS16/17, Q40",
        build: (rng) => {
            const sc = rng.pick(CA_PROG_FORGONE_CM_SCENARIOS);
            const tX = rng.pick([20, 30]);
            const tY = 2 * tX;
            const Q = rng.int(10, 25) * 100;
            const qY = Q - rng.int(2, 8) * 100;
            const dX = 2 * (Q - qY);
            const qX = dX + rng.int(5, 15) * 100;
            const cmX = rng.int(20, 50);
            const cmY = rng.int(10, 2 * cmX - 5);
            const answer = qY * cmY + dX * cmX;
            return {
                prompt: `${sc.intro}, runs its ${sc.line} at full capacity producing ${n(qX)} ${sc.xs} (${n(tX)} min each, contribution margin ${eur(cmX)}) and ${n(qY)} ${sc.ys} (${n(tY)} min each, contribution margin ${eur(cmY)}). ${sc.customer} orders ${n(Q)} ${sc.os}, each taking ${n(tY)} min on the line. What are the total opportunity costs of accepting the order?`,
                given: {
                    "Current program": `${n(qX)} ${sc.xsShort} (${n(tX)} min, cm ${eur(cmX)}), ${n(qY)} ${sc.ys} (${n(tY)} min, cm ${eur(cmY)})`,
                    "Order": `${n(Q)} ${sc.os}, ${n(tY)} min each`,
                    "Capacity": "fully utilized",
                },
                answer,
                explanation: String.raw`$K_{opp} = \sum \text{displaced units} \cdot cm$ - displace the product with the lowest relative contribution margin first. ${cap(sc.ys)} earn ${eur((cmY / tY) * 60)} per hour vs. ${eur((cmX / tX) * 60)} for ${sc.xsShort}, so all ${n(qY)} ${sc.ys} go (freeing ${n(qY * tY)} min) and the remaining ${n(Q * tY - qY * tY)} min come from ${n(dX)} ${sc.xsShort}. Opportunity costs: ${n(qY)} × ${eur(cmY)} + ${n(dX)} × ${eur(cmX)} = ${eur(answer)}.`,
                hint: `The opportunity costs of an order are the contribution margins of the own production that has to make room for it. On a line running at full capacity, free the needed minutes from the product with the lowest contribution margin per hour first.`,
            };
        },
    },
    {
        id: "ca-prog-relcm-hours",
        subject: "cost_accounting",
        topic: "production_program",
        difficulty: "very_easy",
        kind: "numeric",
        unit: "EUR",
        source: "TUM Cost Accounting Mock Exam, Q22",
        build: (rng) => {
            const sc = rng.pick(CA_PROG_LINDQVIST_SCENARIOS);
            const v = rng.int(3, 20);
            const cm = rng.int(2, 12);
            const p = v + cm;
            const t = rng.pick([0.25, 0.4, 0.5]);
            const answer = cm / t;
            return {
                prompt: `${sc.firm} considers adding a third product, a ${sc.extra}, to its ${sc.machineProg} program. The ${sc.extra} would sell at ${eur(p)} with variable costs of ${eur(v)} per unit and occupy the ${sc.machineShort} for ${n(t)} hours per unit. What is the relative contribution margin of the ${sc.extra} per ${sc.machineShort} hour?`,
                given: {
                    "Price / variable costs": `${eur(p)} / ${eur(v)} per unit`,
                    [`${cap(sc.machineShort)} time`]: `${n(t)} h per unit`,
                },
                answer,
                explanation: String.raw`$cm_{rel} = \frac{p - k_{var}}{t}$ - contribution margin per unit of the scarce ${sc.machineShort} time: (${eur(p)} − ${eur(v)}) / ${n(t)} h = ${eur(cm)} / ${n(t)} = ${eur(answer)} per hour. This is the figure that decides the ${sc.extra}'s rank in the production program.`,
            };
        },
    },
];
