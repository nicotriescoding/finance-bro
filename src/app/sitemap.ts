import type { MetadataRoute } from "next";
import { SUBJECTS } from "@/content/subjects";

const BASE = "https://www.finance-bro.de";

export default function sitemap(): MetadataRoute.Sitemap {
    const now = new Date();
    return [
        { url: BASE, lastModified: now, changeFrequency: "weekly", priority: 1 },
        { url: `${BASE}/career`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
        { url: `${BASE}/quiz`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
        ...SUBJECTS.map((s) => ({
            url: `${BASE}/career?subject=${s.id}`,
            lastModified: now,
            changeFrequency: "weekly" as const,
            priority: 0.8,
        })),
        ...SUBJECTS.map((s) => ({
            url: `${BASE}/quiz?subject=${s.id}`,
            lastModified: now,
            changeFrequency: "weekly" as const,
            priority: 0.7,
        })),
        { url: `${BASE}/products`, lastModified: now, changeFrequency: "monthly" as const, priority: 0.4 },
        { url: `${BASE}/multiplayer`, lastModified: now, changeFrequency: "monthly" as const, priority: 0.4 },
        { url: `${BASE}/library`, lastModified: now, changeFrequency: "monthly" as const, priority: 0.5 },
        { url: `${BASE}/impressum`, lastModified: now, changeFrequency: "yearly" as const, priority: 0.2 },
        { url: `${BASE}/privacy`, lastModified: now, changeFrequency: "yearly" as const, priority: 0.2 },
    ];
}
