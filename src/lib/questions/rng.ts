// Seeded, deterministic RNG.
// Every question instance is built from one seed, so the numbers shown in the
// prompt and the numbers used for the answer can never drift apart.

export type Rng = {
    int: (min: number, max: number) => number;
    float: (min: number, max: number, decimals?: number) => number;
    pick: <T>(items: readonly T[]) => T;
    shuffle: <T>(items: readonly T[]) => T[];
    next: () => number;
};

/** mulberry32 - small, fast, good enough for quiz variation */
function mulberry32(seed: number) {
    let a = seed >>> 0;
    return function () {
        a |= 0;
        a = (a + 0x6d2b79f5) | 0;
        let t = Math.imul(a ^ (a >>> 15), 1 | a);
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}

export function createRng(seed: number): Rng {
    const next = mulberry32(seed);

    const int = (min: number, max: number) =>
        Math.floor(next() * (max - min + 1)) + min;

    const float = (min: number, max: number, decimals = 2) => {
        const raw = next() * (max - min) + min;
        const f = 10 ** decimals;
        return Math.round(raw * f) / f;
    };

    const pick = <T,>(items: readonly T[]): T => items[int(0, items.length - 1)];

    const shuffle = <T,>(items: readonly T[]): T[] => {
        const out = [...items];
        for (let i = out.length - 1; i > 0; i--) {
            const j = int(0, i);
            [out[i], out[j]] = [out[j], out[i]];
        }
        return out;
    };

    return { int, float, pick, shuffle, next };
}

export function randomSeed() {
    return Math.floor(Math.random() * 2_147_483_647);
}
