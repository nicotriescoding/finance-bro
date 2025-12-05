export function useLevel(score: number) {
    const base = 100; // Startwert erhöhen
    const multiplier = 1.5; // steigert die Schwierigkeit pro Level
    let required = base;

    let level = 1;
    let remaining = score;

    while (remaining >= required) {
        remaining -= required;
        level++;
        required = Math.floor(required * multiplier);
    }

    return {
        level,
        progress: remaining / required, // 0..1 für Progressbar
        nextRequired: required,
    };
}
