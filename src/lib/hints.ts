import type { QuestionInstance } from "./questions/types";

/**
 * The hint behind the quiz's 💡 button (payout −50%).
 *
 * Prompts read like the exam: no definitions, no "remember that sunk costs
 * do not count". That coaching lives in the question's authored `hint`
 * (see `NumericQuestion.build`). The lecture formula is still part of every
 * hint: by authoring convention (.claude/rules/questions.md) every worked
 * solution opens with the symbolic formula as its first `$…$` KaTeX segment,
 * so an authored hint without math gets that segment appended, and a
 * question without an authored hint shows the formula alone. `npm run verify`
 * asserts the resolved hint never contains the graded answer.
 */
export function extractFormulaHint(explanation: string | undefined): string | null {
    if (!explanation) return null;
    const match = explanation.match(/\$[^$]+\$/);
    return match ? match[0] : null;
}

/** Resolve the hint text for a built instance (numeric only). */
export function resolveHint(hint: string | undefined, explanation: string | undefined): string | null {
    const formula = extractFormulaHint(explanation);
    const authored = hint?.trim();
    if (!authored) return formula;
    if (authored.includes("$") || !formula) return authored;
    return `${authored} ${formula}`;
}

/**
 * Hint for a built instance. Numeric questions get the authored hint plus
 * the lecture formula; choice questions return null here - their hint is
 * the 50/50 elimination, which lives in the QuestionCard because it mutates
 * the option list.
 */
export function hintFor(instance: QuestionInstance): string | null {
    if (instance.question.kind !== "numeric") return null;
    return resolveHint(instance.hint, instance.explanation);
}
