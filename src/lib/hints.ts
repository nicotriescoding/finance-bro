import type { QuestionInstance } from "./questions/types";

/**
 * The formula hint behind the quiz's 💡 button (payout −50%).
 *
 * By authoring convention (.claude/rules/questions.md) every worked solution
 * opens with the symbolic lecture formula as its first `$…$` KaTeX segment,
 * before any drawn numbers are substituted. So the hint is exactly that first
 * math segment - no per-question authoring needed. `npm run verify` asserts
 * the extracted segment never contains the graded answer.
 */
export function extractFormulaHint(explanation: string | undefined): string | null {
    if (!explanation) return null;
    const match = explanation.match(/\$[^$]+\$/);
    return match ? match[0] : null;
}

/**
 * Hint for a built instance. Numeric questions get the lecture formula;
 * choice questions return null here - their hint is the 50/50 elimination,
 * which lives in the QuestionCard because it mutates the option list.
 */
export function hintFor(instance: QuestionInstance): string | null {
    if (instance.question.kind !== "numeric") return null;
    return extractFormulaHint(instance.explanation);
}
