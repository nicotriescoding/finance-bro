import type { MetadataRoute } from "next";
import { SUBJECTS } from "@/content/subjects";
import { CITY_PATH, SITE_URL as BASE, SUBJECT_SLUG } from "@/lib/seo";

// /career?subject=x is a setup variant that canonicalises to /career (2026-09-11) -
// the per-subject entries are the /quiz subject pages.

export default function sitemap(): MetadataRoute.Sitemap {
    const now = new Date();
    return [
        { url: BASE, lastModified: now, changeFrequency: "weekly", priority: 1 },
        { url: `${BASE}/career`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
        { url: `${BASE}/quiz`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
        { url: `${BASE}${CITY_PATH}`, lastModified: now, changeFrequency: "monthly" as const, priority: 0.8 },
        ...SUBJECTS.map((s) => ({
            url: `${BASE}/${SUBJECT_SLUG[s.id]}`,
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
        { url: `${BASE}/leaderboard`, lastModified: now, changeFrequency: "daily" as const, priority: 0.4 },
        { url: `${BASE}/library`, lastModified: now, changeFrequency: "monthly" as const, priority: 0.5 },
        { url: `${BASE}/impressum`, lastModified: now, changeFrequency: "yearly" as const, priority: 0.2 },
        { url: `${BASE}/privacy`, lastModified: now, changeFrequency: "yearly" as const, priority: 0.2 },
        { url: `${BASE}/terms`, lastModified: now, changeFrequency: "yearly" as const, priority: 0.2 },
    ];
}
