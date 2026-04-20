import { ImageResponse } from "next/og";

export const alt = "SemiAnalysis Events — Activate 2026";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #050508 0%, #0a0a14 50%, #050508 100%)",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: "-10%",
            left: "-5%",
            width: 500,
            height: 500,
            borderRadius: "50%",
            background: "radial-gradient(circle, #F7B04118 0%, transparent 70%)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "-10%",
            right: "-5%",
            width: 400,
            height: 400,
            borderRadius: "50%",
            background: "radial-gradient(circle, #0B86D112 0%, transparent 70%)",
          }}
        />

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 20,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 16,
              fontSize: 18,
              letterSpacing: "4px",
              color: "#F7B041",
              fontWeight: 700,
              textTransform: "uppercase" as const,
            }}
          >
            2026 EVENT PARTNERSHIP
          </div>

          <div
            style={{
              fontSize: 92,
              fontWeight: 900,
              color: "#E8E4DD",
              lineHeight: 1.05,
              textAlign: "center",
              letterSpacing: "-2px",
            }}
          >
            SemiAnalysis
          </div>
          <div
            style={{
              fontSize: 44,
              fontWeight: 900,
              color: "#F7B041",
              lineHeight: 1.05,
              letterSpacing: "1px",
            }}
          >
            Events
          </div>

          <div
            style={{
              fontSize: 22,
              color: "#8A8690",
              marginTop: 20,
              letterSpacing: "0.5px",
              textAlign: "center",
            }}
          >
            Nine activations. Three continents. The decision-makers who matter.
          </div>
        </div>

        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: 4,
            background: "linear-gradient(90deg, #F7B041, #0B86D1, #905CCB, #E06347)",
          }}
        />
      </div>
    ),
    { ...size }
  );
}
