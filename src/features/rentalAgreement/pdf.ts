import type { AgreementDoc } from "./types";

/** PDF core fonts only cover Latin-1; such text would print as garbage. */
export function hasUnsupportedChars(text: string): boolean {
  return /[^\u0000-ÿ‘’“”–—]/.test(text);
}

const clean = (s: string) =>
  s.replace(/[‘’]/g, "'").replace(/[“”]/g, '"').replace(/[–—]/g, "-");

/**
 * Render the agreement to an A4 PDF in the browser and trigger a download.
 * jsPDF is imported on demand so it never weighs on page load.
 */
export async function downloadAgreementPdf(doc: AgreementDoc, fileName: string): Promise<void> {
  const { jsPDF } = await import("jspdf");
  const pdf = new jsPDF({ unit: "mm", format: "a4" });

  const pageW = pdf.internal.pageSize.getWidth();
  const pageH = pdf.internal.pageSize.getHeight();
  const margin = 20;
  const width = pageW - margin * 2;
  const bottom = pageH - 22;
  let y = margin;

  const ensure = (h: number) => {
    if (y + h > bottom) {
      pdf.addPage();
      y = margin;
    }
  };

  const para = (text: string, opts: { size?: number; bold?: boolean; indent?: number; gap?: number; align?: "left" | "center" | "justify" } = {}) => {
    const size = opts.size ?? 10.5;
    const indent = opts.indent ?? 0;
    pdf.setFont("helvetica", opts.bold ? "bold" : "normal");
    pdf.setFontSize(size);
    const lineH = size * 0.47;
    const lines: string[] = pdf.splitTextToSize(clean(text), width - indent);
    lines.forEach((line, i) => {
      ensure(lineH);
      const isLast = i === lines.length - 1;
      if (opts.align === "center") {
        pdf.text(line, pageW / 2, y, { align: "center" });
      } else if (opts.align === "justify" && !isLast) {
        pdf.text(line, margin + indent, y, { maxWidth: width - indent, align: "justify" });
      } else {
        pdf.text(line, margin + indent, y);
      }
      y += lineH;
    });
    y += opts.gap ?? 2.2;
  };

  // Title
  para(doc.title.toUpperCase(), { size: 16, bold: true, align: "center", gap: 1.5 });
  if (doc.subtitle) para(doc.subtitle, { size: 9.5, align: "center", gap: 1.5 });
  y += 4;

  doc.preamble.forEach((p) => para(p, { align: "justify", gap: 3 }));
  y += 1;
  para("NOW THIS AGREEMENT WITNESSES AS FOLLOWS:", { bold: true, gap: 3 });

  doc.clauses.forEach((c, i) => {
    ensure(14);
    para(`${i + 1}. ${c.heading}`, { bold: true, size: 11, gap: 1.5 });
    c.body.forEach((b, j) => para(`${i + 1}.${j + 1}  ${b}`, { indent: 4, align: "justify", gap: 2 }));
    y += 1.5;
  });

  if (doc.schedule) {
    ensure(16);
    para(doc.schedule.heading, { bold: true, size: 11, gap: 1.5 });
    doc.schedule.items.forEach((it, i) => para(`${i + 1}. ${it}`, { indent: 4, gap: 1 }));
    y += 3;
  }

  // Signatures
  ensure(20);
  para("IN WITNESS WHEREOF the parties have signed this agreement on the date first written above.", { align: "justify", gap: 6 });
  const colW = (width - 10) / 2;
  for (let i = 0; i < doc.signatures.length; i += 2) {
    ensure(26);
    [doc.signatures[i], doc.signatures[i + 1]].forEach((s, col) => {
      if (!s) return;
      const x = margin + col * (colW + 10);
      pdf.setDrawColor(120);
      pdf.line(x, y + 12, x + colW, y + 12);
      pdf.setFont("helvetica", "bold").setFontSize(10);
      pdf.text(clean(s.label), x, y + 17);
      pdf.setFont("helvetica", "normal");
      pdf.text(clean(s.name || "Name: ____________________"), x, y + 22, { maxWidth: colW });
    });
    y += 30;
  }

  if (doc.witnesses) {
    ensure(34);
    para("WITNESSES", { bold: true, gap: 4 });
    [0, 1].forEach((col) => {
      const x = margin + col * (colW + 10);
      pdf.setFont("helvetica", "normal").setFontSize(10);
      pdf.line(x, y + 10, x + colW, y + 10);
      pdf.text(`${col + 1}. Signature`, x, y + 15);
      pdf.text("Name & address: __________________", x, y + 21, { maxWidth: colW });
    });
    y += 28;
  }

  // Footer on every page: disclaimer line + page numbers.
  const pages = pdf.getNumberOfPages();
  for (let p = 1; p <= pages; p++) {
    pdf.setPage(p);
    pdf.setFont("helvetica", "normal").setFontSize(7.5).setTextColor(130);
    const foot: string[] = pdf.splitTextToSize(clean(doc.footnote), width - 22);
    pdf.text(foot.slice(0, 2), margin, pageH - 12);
    pdf.text(`Page ${p} of ${pages}`, pageW - margin, pageH - 12, { align: "right" });
    pdf.setTextColor(0);
  }

  pdf.save(fileName);
}
