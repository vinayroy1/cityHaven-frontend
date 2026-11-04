/** Shared 1200x630 social card for the area converter pages. */
import { ImageResponse } from "next/og";

export const ogSize = { width: 1200, height: 630 };

export function areaOgImage(title: string, line: string) {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 72,
          background: "linear-gradient(135deg, #059669 0%, #0d9488 100%)",
          color: "white",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", fontSize: 30, fontWeight: 700, opacity: 0.9 }}>Awasio · Free Area Converter</div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", fontSize: 68, fontWeight: 800, lineHeight: 1.1 }}>{title}</div>
          <div style={{ display: "flex", marginTop: 28, fontSize: 44, fontWeight: 700, background: "rgba(255,255,255,0.16)", borderRadius: 24, padding: "18px 30px", alignSelf: "flex-start" }}>
            {line}
          </div>
        </div>
        <div style={{ display: "flex", fontSize: 26, opacity: 0.85 }}>sq ft · sq m · sq yd · acre · hectare · sq km</div>
      </div>
    ),
    ogSize,
  );
}
