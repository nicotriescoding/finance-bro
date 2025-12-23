"use client";
import React from "react";

type TaskCardProps = {
    task: {
        question: string;
    };
    variables: Record<string, string | number>;
    userAnswer: string;
    setUserAnswer: (val: string) => void;
    feedback: string | null;
    answered: boolean;
    handleCheck: () => void;
    handleNext: () => void;
};

export default function TaskCard({
                                     task,
                                     variables,
                                     userAnswer,
                                     setUserAnswer,
                                     feedback,
                                     answered,
                                     handleCheck,
                                     handleNext,
                                 }: TaskCardProps) {
    return (
        <div className="bg-white shadow-lg rounded-2xl p-6 border border-gray-200">
            {/* Titel */}
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
                Aufgabe
            </h2>

            {/* Frage */}
            <p className="text-gray-700 mb-6 text-base leading-relaxed">
                {task.question.replace(
                    /\{(\w+)\}/g,
                    (_match: string, key: string) =>
                        variables[key] !== undefined
                            ? String(variables[key])
                            : `{${key}}`
                )}
            </p>

            {/* Eingabe */}
            <input
                type="text"
                placeholder="Deine Antwort..."
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                onKeyDown={(e) => {
                    if (e.key === "Enter") {
                        if (!answered) handleCheck();
                        else handleNext();
                    }
                }}
                disabled={answered}
                className={`w-full px-4 py-2 rounded-lg border ${
                    answered
                        ? "bg-gray-100 text-gray-500"
                        : "bg-white text-black"
                } border-gray-300 focus:ring-2 focus:ring-blue-500 focus:outline-none`}
            />

            {/* Buttons */}
            <div className="mt-4 flex justify-end">
                {!answered ? (
                    <button
                        onClick={handleCheck}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg shadow-md transition"
                    >
                        Prüfen
                    </button>
                ) : (
                    <button
                        onClick={handleNext}
                        className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg shadow-md transition"
                    >
                        Nächste Aufgabe →
                    </button>
                )}
            </div>

            {/* Feedback */}
            {feedback && (
                <div
                    className={`mt-4 p-3 rounded-lg font-medium ${
                        feedback.includes("✅")
                            ? "bg-green-100 text-green-800 border border-green-300"
                            : "bg-red-100 text-red-800 border border-red-300"
                    }`}
                >
                    {feedback}
                </div>
            )}
        </div>
    );
}