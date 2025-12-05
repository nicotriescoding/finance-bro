// src/hooks/useStopwatch.ts
import { useState, useEffect, useRef } from "react";

export function useStopwatch(running: boolean) {
    const [elapsedMs, setElapsedMs] = useState(0);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        if (running) {
            intervalRef.current = setInterval(() => {
                setElapsedMs((prev) => prev + 1000);
            }, 1000);
        } else if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }

        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, [running]);

    const reset = () => setElapsedMs(0);
    const stop = () => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
    };

    return { elapsedMs, reset, stop };
}