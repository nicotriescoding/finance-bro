"use client";
import { useEffect, useRef, useState } from "react";

/**
 * Bank-like count-up: when `target` changes, the displayed value eases to it
 * over ~500 ms (design 3a). First render shows the target immediately.
 */
export function useCountUp(target: number, durationMs = 500): number {
    const [display, setDisplay] = useState(target);
    const displayRef = useRef(display);
    displayRef.current = display;

    useEffect(() => {
        const from = displayRef.current;
        if (from === target) return;
        let raf = 0;
        const t0 = performance.now();
        const step = (now: number) => {
            const t = Math.min(1, (now - t0) / durationMs);
            const eased = 1 - (1 - t) * (1 - t); // ease-out, no overshoot
            setDisplay(Math.round(from + (target - from) * eased));
            if (t < 1) raf = requestAnimationFrame(step);
        };
        raf = requestAnimationFrame(step);
        return () => cancelAnimationFrame(raf);
    }, [target, durationMs]);

    return display;
}
