export type Task = {
    id: number;
    question: string;
    type: string;
    difficulty: "very_easy" | "easy" | "medium" | "hard" | "very_hard";
};