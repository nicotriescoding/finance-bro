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
    const {
        tasks,
        currentTaskIndex,
        setCurrentTaskIndex,
        variables,
        currentTask,
        correctAnswer,
    } = useGame();

    const { score, addScore } = useScore();

    const [started, setStarted] = useState(false);

    // ⏱️ Stopwatch (neues API)
    const { elapsedMs, start, stop, reset } = useStopwatch();

    // Immer aktuelle Zeit für Callbacks
    const elapsedRef = useRef<number>(0);
    useEffect(() => {
        elapsedRef.current = elapsedMs;
    }, [elapsedMs]);

    const flow = useTaskFlow({
        correctAnswer: correctAnswer ?? "",
        onCorrect: () => {
            stop();

            const timeSpentSec = Math.round(elapsedRef.current / 1000);
            const diff =
                (currentTask?.difficulty as keyof typeof difficultyTimes) ??
                "easy";
            const target = difficultyTimes[diff] ?? 120;

            addScore(diff, timeSpentSec, target);
        },
        onNext: () => {
            setCurrentTaskIndex((prev) =>
                prev + 1 < tasks.length ? prev + 1 : 0
            );
            reset();
            start();
        },
    });

    if (!currentTask || !variables) {
        return <p className="p-4">Loading...</p>;
    }

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
                        <h1 className="text-2xl font-bold">
                            🚀 Bereit für die Aufgaben?
                        </h1>
                        <Button
                            onClick={() => {
                                reset();
                                start();
                                setStarted(true);
                            }}
                            variant="primary"
                        >
                            Start
                        </Button>
                    </div>
                ) : (
                    <TaskCard
                        task={currentTask}
                        variables={variables}
                        {...flow}
                    />
                )
            }
            scoreboard={<Scoreboard score={score} />}
        />
    );
}