import nextCoreWebVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";

// eslint-config-next 16 ships flat configs directly - no FlatCompat needed.
// `npm run lint` is advisory, not part of the gate (`npm run check`).
const eslintConfig = [
  ...nextCoreWebVitals,
  ...nextTypescript,
  {
    // The React Compiler rules flag two long-standing patterns: syncing
    // browser-only state (localStorage, window) into React state inside an
    // effect, and the classic usePrevious / useCountUp refs. Warnings, not
    // errors, until those hooks are rewritten (tracked in BACKLOG.md).
    rules: {
      "react-hooks/set-state-in-effect": "warn",
      "react-hooks/refs": "warn",
    },
  },
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "out/**",
      "build/**",
      "next-env.d.ts",
      "worker/node_modules/**",
      "worker/.wrangler/**",
    ],
  },
];

export default eslintConfig;
