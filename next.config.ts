import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    turbopack: {
        rules: {
            // Strip the internal `source` provenance from the question banks
            // before they are bundled - see scripts/strip-question-source-loader.mjs.
            "./src/content/questions/*.ts": {
                loaders: ["./scripts/strip-question-source-loader.mjs"],
            },
        },
    },
};

export default nextConfig;
