/**
 * Sanity check for the whole question bank.
 * Run: npm run verify
 *
 * Builds every question against many seeds and fails on NaN / Infinity,
 * unfilled placeholders, unknown topics, or broken choice definitions.
 */
import katex from "katex";
import { ALL_QUESTIONS } from "../src/content/questions";
import { buildInstance } from "../src/lib/questions/engine";
import { SUBJECT_MAP } from "../src/content/subjects";
import { formatAnswer, isWithinTolerance, parseNumericInput } from "../src/lib/questions/grading";

const SEEDS = 200;
const errors: string[] = [];
const warnings: string[] = [];
const seenIds = new Set<string>();

/** Remove `$...$` math segments, so text-level checks don't trip over TeX. */
const stripMath = (text: string) => text.replace(/\$[^$]+\$/g, " ");

/**
 * Compile every `$...$` segment with KaTeX. Invalid TeX or an odd number of
 * `$` delimiters is a build error - RichText would render it broken.
 */
function checkMath(id: string, where: string, text: string | undefined) {
    if (!text) return;
    const dollars = (text.match(/\$/g) ?? []).length;
    if (dollars % 2 !== 0) {
        errors.push(`${id}: unbalanced $ in ${where}: "${text.slice(0, 80)}"`);
        return;
    }
    for (const seg of text.match(/\$[^$]+\$/g) ?? []) {
        try {
            katex.renderToString(seg.slice(1, -1), { throwOnError: true, strict: false });
        } catch (e) {
            errors.push(`${id}: invalid TeX in ${where}: ${seg} - ${(e as Error).message}`);
        }
    }
}

/** Run the math check over every text field of a built instance. */
function checkInstanceMath(id: string, inst: ReturnType<typeof buildInstance>) {
    checkMath(id, "prompt", inst.prompt);
    checkMath(id, "explanation", inst.explanation);
    for (const c of inst.choices ?? []) checkMath(id, "choice", c);
    for (const [k, v] of Object.entries(inst.given ?? {})) {
        checkMath(id, `given key "${k}"`, k);
        checkMath(id, `given value of "${k}"`, v);
    }
}

for (const q of ALL_QUESTIONS) {
    if (seenIds.has(q.id)) errors.push(`${q.id}: duplicate question id`);
    seenIds.add(q.id);

    const subject = SUBJECT_MAP[q.subject];
    if (!subject) {
        errors.push(`${q.id}: unknown subject "${q.subject}"`);
        continue;
    }
    if (!subject.topics.some((t) => t.id === q.topic)) {
        errors.push(`${q.id}: topic "${q.topic}" is not defined for subject ${q.subject}`);
    }

    if (q.kind === "choice") {
        const idx = Array.isArray(q.correct) ? q.correct : [q.correct];
        if (idx.some((i) => i < 0 || i >= q.choices.length)) {
            errors.push(`${q.id}: correct index out of range`);
        }
        if (new Set(q.choices).size !== q.choices.length) {
            errors.push(`${q.id}: duplicate answer options`);
        }
        if (q.choices.length < 2) errors.push(`${q.id}: needs at least 2 options`);
        const inst = buildInstance(q, 1);
        if ((inst.correctIndices?.length ?? 0) !== idx.length) {
            errors.push(`${q.id}: shuffling lost a correct option`);
        }
        checkInstanceMath(q.id, inst);
        continue;
    }

    for (let seed = 1; seed <= SEEDS; seed++) {
        let inst;
        try {
            inst = buildInstance(q, seed * 7919);
        } catch (e) {
            errors.push(`${q.id} (seed ${seed}): threw ${(e as Error).message}`);
            break;
        }
        const a = inst.answer;
        if (a === undefined || !Number.isFinite(a)) {
            errors.push(`${q.id} (seed ${seed}): answer is ${a}`);
            break;
        }
        if (Math.abs(a) > 1e12) {
            warnings.push(`${q.id} (seed ${seed}): implausibly large answer ${a}`);
        }
        // TeX braces like q^{10} are legitimate - strip math before this check.
        if (/\{[A-Za-z_]\w*\}/.test(stripMath(inst.prompt))) {
            errors.push(`${q.id} (seed ${seed}): unfilled placeholder in prompt`);
            break;
        }
        if (/(NaN|Infinity|undefined)/.test(inst.prompt + (inst.explanation ?? ""))) {
            errors.push(`${q.id} (seed ${seed}): NaN/Infinity/undefined leaked into text`);
            break;
        }
        // The TeX skeleton is identical across seeds - compiling a few is enough.
        if (seed <= 3) checkInstanceMath(q.id, inst);
    }
}

// ---------------------------------------------------------------- input parsing
// The display locale is en-US, the students are German. Both conventions have to
// parse, and above all a student who retypes the number the app just showed them
// must be marked correct - "1,234" read as 1.234 silently failed correct answers.
const PARSE_CASES: [string, number | null][] = [
    ["1,234", 1234],          // en-US thousands, the format the app displays
    ["12,345,678", 12345678],
    ["1,234.56", 1234.56],
    ["1.234,56", 1234.56],    // German
    ["1.234.567", 1234567],
    ["1234.56", 1234.56],
    ["1234,56", 1234.56],
    ["8,24", 8.24],           // German decimal comma, not thousands
    ["0,5", 0.5],
    ["1.234", 1.234],         // lone dot stays decimal
    ["12.5 %", 12.5],
    ["€1,200", 1200],
    ["-1.234,56", -1234.56],
    ["−7.19", -7.19],         // U+2212, what the prompts render
    ["3.50 years", 3.5],
    ["", null],
    ["abc", null],
];
for (const [input, expected] of PARSE_CASES) {
    const got = parseNumericInput(input);
    if (got !== expected) errors.push(`parseNumericInput("${input}") = ${got}, expected ${expected}`);
}

// Round trip: whatever we print as the correct answer must grade as correct when
// typed back verbatim. This is what catches a display/parse locale mismatch.
for (const q of ALL_QUESTIONS) {
    if (q.kind !== "numeric") continue;
    for (const seed of [1, 2, 3, 5, 8, 13, 21, 34]) {
        const inst = buildInstance(q, seed * 7919);
        if (inst.answer === undefined || !Number.isFinite(inst.answer)) continue;
        const shown = formatAnswer(inst.answer, q.unit);
        const reparsed = parseNumericInput(shown);
        if (reparsed === null || !isWithinTolerance(reparsed, inst.answer, q.unit, q.tolerance)) {
            errors.push(`${q.id} (seed ${seed}): shows "${shown}" but retyping it grades wrong`);
            break;
        }
    }
}

const bySubject = ALL_QUESTIONS.reduce<Record<string, number>>((acc, q) => {
    acc[q.subject] = (acc[q.subject] ?? 0) + 1;
    return acc;
}, {});

console.log(`Questions: ${ALL_QUESTIONS.length}`);
for (const [s, c] of Object.entries(bySubject)) console.log(`  ${s.padEnd(22)} ${c}`);
console.log(`Seeds per numeric question: ${SEEDS}`);

if (warnings.length) {
    console.log(`\n${warnings.length} warning(s):`);
    warnings.slice(0, 15).forEach((w) => console.log("  ! " + w));
}
if (errors.length) {
    console.error(`\n${errors.length} ERROR(S):`);
    errors.slice(0, 40).forEach((e) => console.error("  x " + e));
    process.exit(1);
}
console.log("\nAll questions build cleanly.");
