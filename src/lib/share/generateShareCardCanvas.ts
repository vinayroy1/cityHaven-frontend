import QRCode from "qrcode";

export type ShareCardCanvasInput = {
  title: string;
  price: string;
  location: string;
  propertyType: string;
  tag?: string;
  imageUrl?: string;
  propertyUrl: string;
};

/**
 * Generates a high-resolution, branded property share card image using HTML5 Canvas.
 * Can be downloaded as PNG or shared directly via navigator.share as a File.
 */
export async function generatePropertyShareCardBlob(
  data: ShareCardCanvasInput
): Promise<Blob> {
  const width = 1080;
  const height = 1350; // Instagram / WhatsApp 4:5 portrait ratio (or 1080x1080 / 1080x600)
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");

  if (!ctx) {
    throw new Error("Could not initialize canvas context");
  }

  // 1. Background fill
  ctx.fillStyle = "#0f172a"; // slate-900 outer border/frame
  ctx.fillRect(0, 0, width, height);

  // 2. Inner card container with rounded corners
  const cardMargin = 30;
  const cardX = cardMargin;
  const cardY = cardMargin;
  const cardW = width - cardMargin * 2;
  const cardH = height - cardMargin * 2;
  const cardRadius = 36;

  ctx.save();
  ctx.beginPath();
  ctx.roundRect(cardX, cardY, cardW, cardH, cardRadius);
  ctx.clip();

  // White inner background
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(cardX, cardY, cardW, cardH);

  // 3. Draw Property Image (Top section: 800px)
  const imgHeight = 840;
  if (data.imageUrl) {
    try {
      const img = await loadImage(data.imageUrl);
      drawCoverImage(ctx, img, cardX, cardY, cardW, imgHeight);
    } catch {
      drawFallbackImage(ctx, cardX, cardY, cardW, imgHeight);
    }
  } else {
    drawFallbackImage(ctx, cardX, cardY, cardW, imgHeight);
  }

  // Top Dark Gradient for badges
  const topGrad = ctx.createLinearGradient(0, cardY, 0, cardY + 160);
  topGrad.addColorStop(0, "rgba(0,0,0,0.7)");
  topGrad.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = topGrad;
  ctx.fillRect(cardX, cardY, cardW, 160);

  // Bottom Image Dark Gradient for tag
  const bottomImgGrad = ctx.createLinearGradient(0, cardY + imgHeight - 160, 0, cardY + imgHeight);
  bottomImgGrad.addColorStop(0, "rgba(0,0,0,0)");
  bottomImgGrad.addColorStop(1, "rgba(0,0,0,0.85)");
  ctx.fillStyle = bottomImgGrad;
  ctx.fillRect(cardX, cardY + imgHeight - 160, cardW, 160);

  // 4. Badges on Image
  // Brand Pill: "Awasio Verified"
  const brandX = cardX + 36;
  const brandY = cardY + 36;
  ctx.save();
  ctx.fillStyle = "rgba(255, 255, 255, 0.98)";
  ctx.beginPath();
  ctx.roundRect(brandX, brandY, 210, 52, 26);
  ctx.fill();

  ctx.font = "900 24px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
  ctx.fillStyle = "#e11d48"; // rose-600
  ctx.fillText("Awasio", brandX + 22, brandY + 35);

  ctx.font = "bold 13px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
  ctx.fillStyle = "#475569";
  ctx.fillText("VERIFIED", brandX + 115, brandY + 34);
  ctx.restore();

  // Property Type Badge
  const typeText = (data.propertyType || "RESIDENTIAL").toUpperCase();
  ctx.save();
  ctx.font = "800 15px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
  const typeTextWidth = ctx.measureText(typeText).width;
  const typeBadgeW = typeTextWidth + 36;
  const typeBadgeX = cardX + cardW - typeBadgeW - 36;
  const typeBadgeY = cardY + 36;

  ctx.fillStyle = "#e11d48"; // rose-600
  ctx.beginPath();
  ctx.roundRect(typeBadgeX, typeBadgeY, typeBadgeW, 52, 26);
  ctx.fill();

  ctx.fillStyle = "#ffffff";
  ctx.fillText(typeText, typeBadgeX + 18, typeBadgeY + 33);
  ctx.restore();

  // Trust Tag on bottom of image: e.g. "Zero Brokerage · Direct Owner"
  const tagText = `✓ ${data.tag || "Zero Brokerage · Direct Owner"}`;
  ctx.save();
  ctx.font = "bold 18px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
  const tagW = ctx.measureText(tagText).width + 32;
  const tagX = cardX + 36;
  const tagY = cardY + imgHeight - 65;

  ctx.fillStyle = "rgba(16, 185, 129, 0.95)"; // emerald-500
  ctx.beginPath();
  ctx.roundRect(tagX, tagY, tagW, 42, 10);
  ctx.fill();

  ctx.fillStyle = "#ffffff";
  ctx.fillText(tagText, tagX + 16, tagY + 28);
  ctx.restore();

  // 5. Bottom Card Section: Pricing, Title, Location & QR Code
  const detailsY = cardY + imgHeight + 48;

  // Price
  ctx.font = "900 52px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
  ctx.fillStyle = "#e11d48"; // rose-600
  ctx.fillText(data.price, cardX + 44, detailsY + 20);

  // Title (Truncated if too long)
  ctx.font = "bold 32px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
  ctx.fillStyle = "#0f172a";
  const titleMaxWidth = cardW - 320;
  const displayTitle = truncateText(ctx, data.title, titleMaxWidth);
  ctx.fillText(displayTitle, cardX + 44, detailsY + 80);

  // Location
  ctx.font = "600 24px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
  ctx.fillStyle = "#64748b";
  const displayLoc = truncateText(ctx, `📍 ${data.location}`, titleMaxWidth);
  ctx.fillText(displayLoc, cardX + 44, detailsY + 130);

  // Footer Tagline
  ctx.font = "bold 16px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
  ctx.fillStyle = "#94a3b8";
  ctx.fillText("Discover verified homes without brokerage on awasio.com", cardX + 44, detailsY + 185);

  // 6. Generate & Draw QR Code on bottom right
  try {
    const qrDataUrl = await QRCode.toDataURL(data.propertyUrl, {
      width: 200,
      margin: 1,
      color: {
        dark: "#0f172a",
        light: "#ffffff",
      },
    });

    const qrImg = await loadImage(qrDataUrl);
    const qrSize = 160;
    const qrX = cardX + cardW - qrSize - 44;
    const qrY = detailsY - 10;

    // QR Container box
    ctx.save();
    ctx.fillStyle = "#f8fafc";
    ctx.strokeStyle = "#e2e8f0";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(qrX - 14, qrY - 14, qrSize + 28, qrSize + 60, 20);
    ctx.fill();
    ctx.stroke();

    ctx.drawImage(qrImg, qrX, qrY, qrSize, qrSize);

    // "SCAN FOR DETAILS"
    ctx.font = "800 12px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
    ctx.fillStyle = "#0f172a";
    ctx.textAlign = "center";
    ctx.fillText("SCAN FOR FULL DETAILS", qrX + qrSize / 2, qrY + qrSize + 28);
    ctx.restore();
  } catch (e) {
    console.error("QR Code canvas error:", e);
  }

  ctx.restore(); // Restore outer clip

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error("Canvas blob conversion failed"));
      },
      "image/png",
      0.95
    );
  });
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = (e) => reject(e);
    img.src = src;
  });
}

function drawCoverImage(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  x: number,
  y: number,
  w: number,
  h: number
) {
  const imgRatio = img.width / img.height;
  const targetRatio = w / h;
  let sWidth = img.width;
  let sHeight = img.height;
  let sx = 0;
  let sy = 0;

  if (imgRatio > targetRatio) {
    sWidth = img.height * targetRatio;
    sx = (img.width - sWidth) / 2;
  } else {
    sHeight = img.width / targetRatio;
    sy = (img.height - sHeight) / 2;
  }

  ctx.drawImage(img, sx, sy, sWidth, sHeight, x, y, w, h);
}

function drawFallbackImage(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number
) {
  const grad = ctx.createLinearGradient(x, y, x + w, y + h);
  grad.addColorStop(0, "#e11d48");
  grad.addColorStop(1, "#be123c");
  ctx.fillStyle = grad;
  ctx.fillRect(x, y, w, h);

  ctx.font = "900 48px -apple-system, BlinkMacSystemFont, sans-serif";
  ctx.fillStyle = "#ffffff";
  ctx.textAlign = "center";
  ctx.fillText("Awasio Verified Property", x + w / 2, y + h / 2);
  ctx.textAlign = "start";
}

function truncateText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number
): string {
  if (ctx.measureText(text).width <= maxWidth) return text;
  let truncated = text;
  while (truncated.length > 0 && ctx.measureText(`${truncated}…`).width > maxWidth) {
    truncated = truncated.slice(0, -1);
  }
  return `${truncated}…`;
}

