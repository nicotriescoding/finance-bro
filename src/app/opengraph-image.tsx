import { ImageResponse } from "next/og";

export const alt = "finance-bro - exam training for business administration";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// satori (used by ImageResponse) requires an explicit display value on every
// element that has more than one child - keep each node single-child or flex.
// Palette matches design 3a: navy chrome, one banking green, mint accents.
export default function OpengraphImage() {
    return new ImageResponse(
        (
            <div
                style={{
                    width: "100%",
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    padding: "80px",
                    background: "#0f2137",
                    color: "white",
                    fontFamily: "sans-serif",
                }}
            >
                <div
                    style={{
                        display: "flex",
                        fontSize: 26,
                        color: "#8ba3bd",
                        marginBottom: 24,
                        letterSpacing: 4,
                    }}
                >
                    FINANCE-BRO.DE · PRIVATE CLIENT
                </div>
                <div style={{ display: "flex", fontSize: 88, fontWeight: 700 }}>Exam training</div>
                <div style={{ display: "flex", fontSize: 88, fontWeight: 700 }}>for business 💸</div>
                <div
                    style={{
                        display: "flex",
                        fontSize: 30,
                        color: "#c3d3e3",
                        marginTop: 32,
                        maxWidth: 950,
                        lineHeight: 1.4,
                    }}
                >
                    {"Finance · Econ 1 & 2 · Financial Accounting · Cost Accounting · Entrepreneurship · Marketing"}
                </div>
                <div
                    style={{
                        display: "flex",
                        marginTop: 40,
                        background: "#1c6b45",
                        color: "white",
                        fontSize: 28,
                        fontWeight: 700,
                        padding: "16px 32px",
                        borderRadius: 999,
                        alignSelf: "flex-start",
                    }}
                >
                    Start earning 💸
                </div>
            </div>
        ),
        size
    );
}
