import { FREQ_LABEL, PAY_LABEL, needsStamp, type Receipt, type ReceiptInput } from "./receipts";

/** jsPDF core fonts are Latin-1: replace ₹ and smart punctuation. */
const clean = (s: string) =>
  s.replace(/₹/g, "Rs. ").replace(/[‘’]/g, "'").replace(/[“”]/g, '"').replace(/[–—]/g, "-");
const rs = (n: number) => `Rs. ${Math.round(n).toLocaleString("en-IN")}`;

/**
 * All receipts in one A4 PDF, two per page with a cut line, the way HR teams expect them.
 * jsPDF loads on demand so it never weighs on the page.
 */
export async function downloadReceiptsPdf(input: ReceiptInput, receipts: Receipt[], fileName: string) {
  const { jsPDF } = await import("jspdf");
  const pdf = new jsPDF({ unit: "mm", format: "a4" });
  const pageW = pdf.internal.pageSize.getWidth();
  const pageH = pdf.internal.pageSize.getHeight();
  const m = 14;
  const boxW = pageW - m * 2;
  const boxH = (pageH - m * 2 - 10) / 2;

  const drawReceipt = (r: Receipt, top: number) => {
    const x = m;
    pdf.setDrawColor(203, 213, 225);
    pdf.setLineWidth(0.3);
    pdf.roundedRect(x, top, boxW, boxH, 3, 3);

    // Header band
    pdf.setFillColor(225, 29, 72);
    pdf.roundedRect(x, top, boxW, 14, 3, 3, "F");
    pdf.rect(x, top + 8, boxW, 6, "F");
    pdf.setTextColor(255, 255, 255);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(13);
    pdf.text("RENT RECEIPT", x + 6, top + 9.3);
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(9);
    pdf.text(clean(`No. ${r.no}   |   Date: ${r.date}`), x + boxW - 6, top + 9.3, { align: "right" });

    pdf.setTextColor(30, 41, 59);
    let y = top + 24;
    pdf.setFontSize(10.5);
    const body =
      `Received with thanks from ${input.tenantName || "________________"} a sum of ${rs(r.amount)} ` +
      `(${r.amountWords}) towards rent for the period ${r.periodLabel}, for the property at ` +
      `${input.propertyAddress || "________________"}.`;
    const lines: string[] = pdf.splitTextToSize(clean(body), boxW - 12);
    pdf.text(lines, x + 6, y, { lineHeightFactor: 1.5 });
    y += lines.length * 5.6 + 4;

    // Facts grid
    const facts: [string, string][] = [
      ["Rent period", r.periodLabel],
      ["Amount", rs(r.amount)],
      ["Paid by", PAY_LABEL[input.payMode] + (input.payRef ? ` (Ref: ${input.payRef})` : "")],
      ["Frequency", FREQ_LABEL[input.frequency]],
      ["Landlord", input.landlordName || "-"],
      ["Landlord PAN", input.landlordPan ? input.landlordPan.toUpperCase() : "-"],
    ];
    const colW = (boxW - 12) / 2;
    facts.forEach(([k, v], i) => {
      const cx = x + 6 + (i % 2) * colW;
      const cy = y + Math.floor(i / 2) * 11;
      pdf.setFontSize(8);
      pdf.setTextColor(100, 116, 139);
      pdf.text(k.toUpperCase(), cx, cy);
      pdf.setFontSize(10.5);
      pdf.setTextColor(15, 23, 42);
      pdf.setFont("helvetica", "bold");
      pdf.text(clean(pdf.splitTextToSize(v, colW - 4)[0] ?? ""), cx, cy + 5);
      pdf.setFont("helvetica", "normal");
    });

    // Signature + stamp
    const sy = top + boxH - 14;
    if (needsStamp(input, r)) {
      pdf.setDrawColor(148, 163, 184);
      pdf.setLineDashPattern([1, 1], 0);
      pdf.rect(x + boxW - 92, sy - 18, 22, 22);
      pdf.setLineDashPattern([], 0);
      pdf.setFontSize(7);
      pdf.setTextColor(100, 116, 139);
      pdf.text(["Revenue", "stamp Re. 1"], x + boxW - 81, sy - 9, { align: "center" });
    }
    pdf.setDrawColor(100, 116, 139);
    pdf.line(x + boxW - 62, sy, x + boxW - 6, sy);
    pdf.setFontSize(9);
    pdf.setTextColor(51, 65, 85);
    pdf.text(clean(`${input.landlordName || "Landlord"} (Landlord)`), x + boxW - 34, sy + 5, { align: "center" });
    pdf.setFontSize(7.5);
    pdf.setTextColor(148, 163, 184);
    pdf.text("Signature", x + boxW - 34, sy + 9, { align: "center" });
    pdf.text("Generated free at awasio.com/rent-receipt", x + 6, top + boxH - 5);
  };

  receipts.forEach((r, i) => {
    const slot = i % 2;
    if (i > 0 && slot === 0) pdf.addPage();
    const top = m + slot * (boxH + 10);
    drawReceipt(r, top);
    if (slot === 0 && i + 1 < receipts.length) {
      // Cut line between the two receipts.
      const cy = top + boxH + 5;
      pdf.setDrawColor(203, 213, 225);
      pdf.setLineDashPattern([2, 2], 0);
      pdf.line(m, cy, pageW - m, cy);
      pdf.setLineDashPattern([], 0);
    }
  });

  pdf.save(fileName);
}
