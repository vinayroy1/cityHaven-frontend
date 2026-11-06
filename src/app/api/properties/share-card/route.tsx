import { NextRequest } from "next/server";
import { ImageResponse } from "next/og";
import QRCode from "qrcode";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const title = searchParams.get("title") || "Featured Property";
    const price = searchParams.get("price") || "Price on Request";
    const location = searchParams.get("location") || "Prime Location, India";
    const propertyType = searchParams.get("type") || "Residential";
    const tag = searchParams.get("tag") || "Zero Brokerage · Direct Owner";
    const imageUrl = searchParams.get("image") || "";
    const propertyUrl = searchParams.get("url") || "https://awasio.com";

    // Generate QR code as data URL
    let qrDataUrl = "";
    try {
      qrDataUrl = await QRCode.toDataURL(propertyUrl, {
        width: 180,
        margin: 1,
        color: {
          dark: "#0f172a", // slate-900
          light: "#ffffff",
        },
      });
    } catch (e) {
      console.error("QR Code generation error:", e);
    }

    return new ImageResponse(
      (
        <div
          style={{
            height: "100%",
            width: "100%",
            display: "flex",
            flexDirection: "column",
            backgroundColor: "#0f172a", // slate-900
            fontFamily: "sans-serif",
            padding: 36,
            boxSizing: "border-box",
            position: "relative",
          }}
        >
          {/* Main Card Container */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              height: "100%",
              width: "100%",
              backgroundColor: "#ffffff",
              borderRadius: 32,
              overflow: "hidden",
              position: "relative",
            }}
          >
            {/* Top Image Section (65% height) */}
            <div
              style={{
                display: "flex",
                height: 410,
                width: "100%",
                position: "relative",
                backgroundColor: "#f1f5f9",
                overflow: "hidden",
              }}
            >
              {imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={imageUrl}
                  alt={title}
                  style={{
                    height: "100%",
                    width: "100%",
                    objectFit: "cover",
                  }}
                />
              ) : (
                <div
                  style={{
                    height: "100%",
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: "#f43f5e",
                    color: "#ffffff",
                    fontSize: 48,
                    fontWeight: 800,
                  }}
                >
                  Awasio Verified Property
                </div>
              )}

              {/* Top Gradient Shadow */}
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  height: 120,
                  background: "linear-gradient(to bottom, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0) 100%)",
                  display: "flex",
                  alignItems: "flex-start",
                  justifyContent: "space-between",
                  padding: "24px 28px",
                }}
              >
                {/* Awasio Branding Badge */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    backgroundColor: "rgba(255, 255, 255, 0.95)",
                    padding: "8px 18px",
                    borderRadius: 999,
                    boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                  }}
                >
                  <span
                    style={{
                      fontSize: 22,
                      fontWeight: 900,
                      color: "#e11d48", // rose-600
                      letterSpacing: "-0.5px",
                    }}
                  >
                    Awasio
                  </span>
                  <span
                    style={{
                      marginLeft: 8,
                      fontSize: 13,
                      fontWeight: 700,
                      color: "#475569",
                      textTransform: "uppercase",
                      letterSpacing: "0.5px",
                    }}
                  >
                    Verified
                  </span>
                </div>

                {/* Property Type Badge */}
                <div
                  style={{
                    display: "flex",
                    backgroundColor: "#e11d48",
                    color: "#ffffff",
                    fontSize: 15,
                    fontWeight: 800,
                    padding: "8px 18px",
                    borderRadius: 999,
                    boxShadow: "0 4px 12px rgba(225,29,72,0.3)",
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                  }}
                >
                  {propertyType}
                </div>
              </div>

              {/* Bottom Gradient with Tag */}
              <div
                style={{
                  position: "absolute",
                  bottom: 0,
                  left: 0,
                  right: 0,
                  height: 100,
                  background: "linear-gradient(to top, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0) 100%)",
                  display: "flex",
                  alignItems: "flex-end",
                  padding: "20px 28px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    backgroundColor: "rgba(16, 185, 129, 0.95)", // emerald-500
                    color: "#ffffff",
                    fontSize: 14,
                    fontWeight: 800,
                    padding: "6px 14px",
                    borderRadius: 8,
                  }}
                >
                  ✓ {tag}
                </div>
              </div>
            </div>

            {/* Bottom Content Area (35% height) */}
            <div
              style={{
                display: "flex",
                flex: 1,
                padding: "24px 32px",
                justifyContent: "space-between",
                alignItems: "center",
                backgroundColor: "#ffffff",
              }}
            >
              {/* Left Column: Details */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  maxWidth: "68%",
                  justifyContent: "center",
                }}
              >
                <div
                  style={{
                    fontSize: 42,
                    fontWeight: 900,
                    color: "#e11d48", // rose-600
                    letterSpacing: "-1px",
                    lineHeight: 1.1,
                  }}
                >
                  {price}
                </div>

                <div
                  style={{
                    fontSize: 26,
                    fontWeight: 800,
                    color: "#0f172a", // slate-900
                    marginTop: 8,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {title}
                </div>

                <div
                  style={{
                    fontSize: 18,
                    fontWeight: 600,
                    color: "#64748b", // slate-500
                    marginTop: 6,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  📍 {location}
                </div>
              </div>

              {/* Right Column: QR Code + Scan CTA */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: "#f8fafc",
                  padding: "12px 16px",
                  borderRadius: 20,
                  border: "2px solid #e2e8f0",
                }}
              >
                {qrDataUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={qrDataUrl}
                    alt="QR Code"
                    style={{
                      height: 110,
                      width: 110,
                      borderRadius: 10,
                    }}
                  />
                ) : null}
                <div
                  style={{
                    fontSize: 12,
                    fontWeight: 800,
                    color: "#0f172a",
                    marginTop: 6,
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                  }}
                >
                  Scan for Details
                </div>
              </div>
            </div>
          </div>
        </div>
      ),
      {
        width: 1080,
        height: 600,
      }
    );
  } catch (error) {
    console.error("Error generating property share card:", error);
    return new Response("Failed to generate share card", { status: 500 });
  }
}
