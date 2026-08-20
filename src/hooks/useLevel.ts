export function useLevel(score: number) {
    const base = 100; // points needed for level 2
    const multiplier = 1.5; // each level costs 50% more than the last
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
        progress: remaining / required, // 0..1, drives the progress bar
        nextRequired: required,
    };
}
