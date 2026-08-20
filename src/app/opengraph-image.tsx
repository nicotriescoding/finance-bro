import { ImageResponse } from "next/og";

export const alt = "finance-bro — exam training for business administration";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// satori (used by ImageResponse) requires an explicit display value on every
// element that has more than one child - keep each node single-child or flex.
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
                    background: "linear-gradient(135deg, #0f172a 0%, #065f46 100%)",
                    color: "white",
                    fontFamily: "sans-serif",
                }}
            >
                <div style={{ display: "flex", fontSize: 30, opacity: 0.75, marginBottom: 20 }}>
                    finance-bro.de
                </div>
                <div style={{ display: "flex", fontSize: 88, fontWeight: 700 }}>Exam training</div>
                <div style={{ display: "flex", fontSize: 88, fontWeight: 700 }}>for business 💸</div>
                <div
                    style={{
                        display: "flex",
                        fontSize: 30,
                        opacity: 0.85,
                        marginTop: 32,
                        maxWidth: 950,
                        lineHeight: 1.4,
                    }}
                >
                    {"Finance · Econ 1 & 2 · Financial Accounting · Cost Accounting · Entrepreneurship · Marketing"}
                </div>
            </div>
        ),
        size
    );
}
