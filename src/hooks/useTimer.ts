import { useState, useEffect, useCallback } from "react";

export function useTimer(initialTime: number, running: boolean) {
    const [timeLeft, setTimeLeft] = useState(initialTime);

    const reset = useCallback((newTime: number) => {
        setTimeLeft(newTime);
    }, []);

    useEffect(() => {
        if (!running) return;

        setTimeLeft(initialTime);
        const interval = setInterval(() => {
            setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
        }, 1000);

        return () => clearInterval(interval);
    }, [initialTime, running]);

    return { timeLeft, reset };
}