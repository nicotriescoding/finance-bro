import { useState, useEffect, useRef } from "react";

export function useStopwatch() {
    const [elapsedMs, setElapsedMs] = useState(0);
    const [running, setRunning] = useState(false);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        if (!running) return;

        intervalRef.current = setInterval(() => {
            setElapsedMs((prev) => prev + 1000);
        }, 1000);

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
            }
        };
    }, [running]);

    const start = () => setRunning(true);

    const stop = () => {
        setRunning(false);
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
    };

    const reset = () => setElapsedMs(0);

    const resetAndStart = () => {
        reset();
        start();
    };

    return {
        elapsedMs,
        start,
        stop,
        reset,
        resetAndStart,
    };
}