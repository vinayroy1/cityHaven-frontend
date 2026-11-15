import { amountInWords } from "@/features/rentalAgreement/numberToWords";

/** Rent receipts for India (HRA claims): one input, a list of receipts, compliance hints. */

export type Frequency = "MONTHLY" | "QUARTERLY" | "HALF_YEARLY" | "YEARLY";
export type PayMode = "UPI" | "BANK" | "CASH" | "CHEQUE";

export interface ReceiptInput {
  tenantName: string;
  landlordName: string;
  landlordPan: string;
  propertyAddress: string;
  monthlyRent: number;
  /** First and last month covered, "yyyy-mm". */
  fromMonth: string;
  toMonth: string;
  frequency: Frequency;
  payMode: PayMode;
  /** UPI ref / cheque no. — printed when given. */
  payRef: string;
  /** Day of the month the rent is paid (receipt date). */
  payDay: number;
}

export interface Receipt {
  no: string;
  periodLabel: string;
  months: number;
  amount: number;
  amountWords: string;
  date: string; // dd Mon yyyy
}

export const FREQ_MONTHS: Record<Frequency, number> = { MONTHLY: 1, QUARTERLY: 3, HALF_YEARLY: 6, YEARLY: 12 };
export const FREQ_LABEL: Record<Frequency, string> = {
  MONTHLY: "Monthly",
  QUARTERLY: "Quarterly",
  HALF_YEARLY: "Half-yearly",
  YEARLY: "Yearly",
};
export const PAY_LABEL: Record<PayMode, string> = { UPI: "UPI", BANK: "Bank transfer", CASH: "Cash", CHEQUE: "Cheque" };

/** Annual rent above this needs the landlord's PAN for the HRA claim (CBDT). */
export const PAN_THRESHOLD = 100_000;
/** Cash receipts above this need a ₹1 revenue stamp (Indian Stamp Act). */
export const STAMP_THRESHOLD = 5_000;
export const MAX_RECEIPTS = 24;

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const FULL_MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

const parseMonth = (s: string) => {
  const m = /^(\d{4})-(\d{2})$/.exec(s || "");
  return m ? { y: Number(m[1]), m: Number(m[2]) - 1 } : null;
};
const idx = (p: { y: number; m: number }) => p.y * 12 + p.m;
const fromIdx = (i: number) => ({ y: Math.floor(i / 12), m: i % 12 });
const lastDay = (y: number, m: number) => new Date(y, m + 1, 0).getDate();

export const formatINR = (n: number) => `₹${Math.round(n).toLocaleString("en-IN")}`;

/** Indian financial year that contains `date`: Apr–Mar. */
export function financialYear(date = new Date()) {
  const y = date.getMonth() >= 3 ? date.getFullYear() : date.getFullYear() - 1;
  return { from: `${y}-04`, to: `${y + 1}-03`, label: `FY ${y}-${String((y + 1) % 100).padStart(2, "0")}` };
}

export function monthCount(input: Pick<ReceiptInput, "fromMonth" | "toMonth">): number {
  const a = parseMonth(input.fromMonth);
  const b = parseMonth(input.toMonth);
  if (!a || !b) return 0;
  return Math.max(0, idx(b) - idx(a) + 1);
}

/** Split the period into receipts of `frequency` months (the last one may be shorter). */
export function buildReceipts(input: ReceiptInput): Receipt[] {
  const a = parseMonth(input.fromMonth);
  const b = parseMonth(input.toMonth);
  if (!a || !b || idx(b) < idx(a) || !(input.monthlyRent > 0)) return [];
  const step = FREQ_MONTHS[input.frequency];
  const out: Receipt[] = [];
  const prefix = `RR-${a.y}${String(a.m + 1).padStart(2, "0")}`;
  for (let i = idx(a), n = 1; i <= idx(b) && out.length < MAX_RECEIPTS; i += step, n++) {
    const start = fromIdx(i);
    const end = fromIdx(Math.min(i + step - 1, idx(b)));
    const months = idx(end) - idx(start) + 1;
    const amount = Math.round(input.monthlyRent * months);
    const day = Math.min(Math.max(1, input.payDay || 1), lastDay(start.y, start.m));
    out.push({
      no: `${prefix}-${String(n).padStart(2, "0")}`,
      periodLabel:
        months === 1
          ? `${FULL_MONTHS[start.m]} ${start.y}`
          : `${MONTHS[start.m]} ${start.y} – ${MONTHS[end.m]} ${end.y}`,
      months,
      amount,
      amountWords: `Rupees ${amountInWords(amount, true)} Only`,
      date: `${String(day).padStart(2, "0")} ${MONTHS[start.m]} ${start.y}`,
    });
  }
  return out;
}

export const isValidPan = (pan: string) => /^[A-Z]{5}[0-9]{4}[A-Z]$/.test(pan.trim().toUpperCase());

export type Hint = { tone: "warn" | "info" | "ok"; text: string };

/** HRA / stamp compliance hints shown next to the form. */
export function receiptHints(input: ReceiptInput): Hint[] {
  const hints: Hint[] = [];
  const annual = input.monthlyRent * 12;
  const pan = input.landlordPan.trim();
  if (annual > PAN_THRESHOLD) {
    if (!pan) hints.push({ tone: "warn", text: `Annual rent is above ${formatINR(PAN_THRESHOLD)}, so your employer will ask for the landlord's PAN.` });
    else if (!isValidPan(pan)) hints.push({ tone: "warn", text: "Landlord PAN looks incorrect. Format: 5 letters, 4 digits, 1 letter (e.g. ABCDE1234F)." });
    else hints.push({ tone: "ok", text: "Landlord PAN added: required because annual rent is above ₹1 lakh." });
  }
  const perReceipt = input.monthlyRent * FREQ_MONTHS[input.frequency];
  if (input.payMode === "CASH" && perReceipt > STAMP_THRESHOLD) {
    hints.push({ tone: "info", text: `Cash receipts above ${formatINR(STAMP_THRESHOLD)} need a ₹1 revenue stamp signed by the landlord. A stamp box is printed on each receipt.` });
  }
  if (input.monthlyRent > 0 && input.monthlyRent * 12 > 0 && monthCount(input) > MAX_RECEIPTS * FREQ_MONTHS[input.frequency]) {
    hints.push({ tone: "warn", text: `Only the first ${MAX_RECEIPTS} receipts are created. Shorten the period or pick a longer frequency.` });
  }
  return hints;
}

export const needsStamp = (input: ReceiptInput, r: Receipt) => input.payMode === "CASH" && r.amount > STAMP_THRESHOLD;

/** HRA exemption under section 10(13A), old tax regime: the least of the three limits. */
export function hraExemption(p: { basic: number; hra: number; rentPaid: number; metro: boolean }) {
  const a = Math.max(0, p.hra);
  const b = Math.max(0, p.rentPaid - 0.1 * p.basic);
  const c = (p.metro ? 0.5 : 0.4) * Math.max(0, p.basic);
  const exempt = Math.max(0, Math.min(a, b, c));
  return { exempt, taxable: Math.max(0, a - exempt), limits: { a, b, c } };
}
