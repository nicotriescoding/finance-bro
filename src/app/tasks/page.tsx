// src/app/tasks/page.tsx
"use client";
import { useState, useEffect, useRef } from "react";
import { useGame } from "@/hooks/useGame";
import { useScore } from "@/hooks/useScore";
import { useTaskFlow } from "@/hooks/useTaskFlow";
import { useStopwatch } from "@/hooks/useStopwatch";
import { difficultyTimes } from "@/lib/scoring";

import GameLayout from "@/components/layout/GameLayout";
import TaskCard from "@/components/TaskCard";
import Scoreboard from "@/components/Scoreboard/Scoreboard";
import AdSlot from "@/components/AdSlot";
import Button from "@/components/ui/Button";

export default function TasksPage() {
    const { tasks, currentTaskIndex, setCurrentTaskIndex, variables, currentTask, correctAnswer } = useGame();
    const { score, addScore } = useScore();

    const [started, setStarted] = useState(false);

    // ⏱ Stoppuhr steuert sich über "started"
    const { elapsedMs, reset, stop } = useStopwatch(started);

    // Ref, damit wir beim Callback immer die aktuellste Zeit lesen (keine stale closures)
    const elapsedRef = useRef<number>(0);
    useEffect(() => {
        elapsedRef.current = elapsedMs;
    }, [elapsedMs]);

    const flow = useTaskFlow({
        correctAnswer: correctAnswer ?? "",
        // onCorrect wird *ohne* Parameter aufgerufen von useTaskFlow.
        // Wir lesen die aktuelle Zeit aus elapsedRef, stoppen die Uhr und addScore.
        onCorrect: () => {
            // Stoppe die Uhr sofort beim Abgeben
            stop();

            // Zeit in Sekunden (ganzzahlig)
            const timeSpentSec = Math.round(elapsedRef.current / 1000);

            const diff = (currentTask?.difficulty as keyof typeof difficultyTimes) ?? "easy";
            const target = difficultyTimes[diff] ?? 120;

            addScore(diff, timeSpentSec, target);
        },
        onNext: () => {
            // Index vorwärts
            setCurrentTaskIndex((prev) => (prev + 1 < tasks.length ? prev + 1 : 0));
            // neue Aufgabe -> Uhr zurücksetzen (läuft weiter, falls started=true)
            reset();
        },
    });

    if (!currentTask || !variables) {
        return <p className="p-4">Loading...</p>;
    }

// Wenn Formel fehlt, gib lieber eine Debug-Meldung statt endlos zu laden
    if (!correctAnswer) {
        return (
            <div className="p-4 text-red-600">
                ⚠️ Unbekannter Aufgabentyp: {currentTask?.type}
            </div>
        );
    }

    return (
        <GameLayout
            ads={
                <>
                    <AdSlot />
                    <AdSlot
                        title="Finanztools"
                        imgUrl="https://via.placeholder.com/200x100.png?text=Finanz+Ad"
                        linkUrl="https://example.com"
                    />
                </>
            }
            task={
                !started ? (
                    <div className="flex flex-col items-center justify-center h-full gap-6">
                        <h1 className="text-2xl font-bold">🚀 Bereit für die Aufgaben?</h1>
                        <Button
                            onClick={() => {
                                setStarted(true);
                                reset(); // sicherstellen: Uhr startet bei 0
                            }}
                            variant="primary"
                        >
                            Start
                        </Button>
                    </div>
                ) : (
                    <TaskCard task={currentTask} variables={variables} {...flow} />
                )
            }
            scoreboard={

                <Scoreboard score={score} level={Math.floor(score / 100) + 1} elapsedMs={elapsedMs} />
            }
        />
    );
}