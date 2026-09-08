/// <reference types="react" />

/** Globals installed by Google's AdSense loader and its consent dialog. */
interface Window {
    adsbygoogle?: unknown[];
    /** Consent Mode v2 shim installed by the head bootstrap in `lib/ads`. */
    gtag?: (command: "consent", action: "default" | "update", params: Record<string, string | number>) => void;
    dataLayer?: unknown[];
    googlefc?: {
        callbackQueue?: Array<Record<string, () => void>>;
        showRevocationMessage?: () => void;
    };
    __tcfapi?: (
        command: string,
        version: number,
        callback: (data: TcfData, success: boolean) => void,
        parameter?: unknown
    ) => void;
}

/** The subset of the IAB TCF 2.2 TCData object the consent bridge reads. */
interface TcfData {
    eventStatus?: "tcloaded" | "cmpuishown" | "useractioncomplete";
    gdprApplies?: boolean;
    listenerId?: number;
    purpose?: { consents?: Record<string, boolean> };
}
