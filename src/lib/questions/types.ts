import type { Rng } from "./rng";

export type Difficulty = "very_easy" | "easy" | "medium" | "hard" | "very_hard";

/** What kind of number the answer is. Drives formatting AND grading tolerance. */
export type Unit = "EUR" | "percent" | "ratio" | "years" | "number" | "units";

export type SubjectId =
    | "finance"
    | "econ1"
    | "econ2"
    | "financial_accounting"
    | "cost_accounting"
    | "entrepreneurship"
    | "marketing";

export type Topic = {
    id: string;
    label: string;
};

export type Subject = {
    id: SubjectId;
    label: string;
    short: string;
    emoji: string;
    description: string;
    accent: string; // tailwind gradient classes
    topics: Topic[];
};

type BaseQuestion = {
    id: string;
    subject: SubjectId;
    /** topic id, must exist in the subject's topic list */
    topic: string;
    difficulty: Difficulty;
    /** e.g. "TUM Endterm WS23/24, A4" */
    source?: string;
    explanation?: string;
};

/** A calculation question. `build` is called with a seeded RNG. */
export type NumericQuestion = BaseQuestion & {
    kind: "numeric";
    unit: Unit;
    /** relative tolerance override (0.01 = 1%). Defaults per unit. */
    tolerance?: number;
    build: (rng: Rng) => {
        prompt: string;
        answer: number;
        /** optional given-values table rendered under the prompt */
        given?: Record<string, string>;
        /** worked solution, may reference the drawn numbers */
        explanation?: string;
        /**
         * What the 💡 button reveals (payout −50%). Definitions, the rule to
         * apply and method reminders live HERE, never in the prompt - the
         * prompt reads like the exam. When omitted the hint is the first
         * `$…$` segment of the explanation (the lecture formula); when given
         * without any `$…$`, that formula is appended automatically.
         */
        hint?: string;
    };
};

/** A multiple-choice question (TUM exam style). */
export type ChoiceQuestion = BaseQuestion & {
    kind: "choice";
    prompt: string;
    choices: string[];
    /** index (single answer) or indices (multi answer) into `choices` */
    correct: number | number[];
};

export type Question = NumericQuestion | ChoiceQuestion;

/** A question resolved against a seed - what the UI actually renders. */
export type QuestionInstance = {
    key: string;
    question: Question;
    prompt: string;
    given?: Record<string, string>;
    explanation?: string;
    /** numeric only */
    answer?: number;
    unit?: Unit;
    /** numeric only - authored hint text, see NumericQuestion.build */
    hint?: string;
    /** choice only - already shuffled, with the remapped correct indices */
    choices?: string[];
    correctIndices?: number[];
};
