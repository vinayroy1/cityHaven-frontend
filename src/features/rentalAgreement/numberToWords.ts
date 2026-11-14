const ONES = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten", "Eleven", "Twelve",
  "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"];
const TENS = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];

function belowThousand(n: number): string {
  const parts: string[] = [];
  if (n >= 100) {
    parts.push(`${ONES[Math.floor(n / 100)]} Hundred`);
    n %= 100;
  }
  if (n >= 20) {
    parts.push(TENS[Math.floor(n / 10)] + (n % 10 ? ` ${ONES[n % 10]}` : ""));
  } else if (n > 0) {
    parts.push(ONES[n]);
  }
  return parts.join(" ");
}

/**
 * Whole amount in words. `indian` uses lakh/crore (India, Nepal, Bangladesh);
 * otherwise thousand/million/billion.
 */
export function amountInWords(value: number, indian: boolean): string {
  let n = Math.floor(Math.abs(value));
  if (n === 0) return "Zero";
  const units: [number, string][] = indian
    ? [[10_000_000, "Crore"], [100_000, "Lakh"], [1_000, "Thousand"]]
    : [[1_000_000_000, "Billion"], [1_000_000, "Million"], [1_000, "Thousand"]];
  const parts: string[] = [];
  for (const [size, label] of units) {
    if (n >= size) {
      const chunk = Math.floor(n / size);
      // Crore can exceed 999 (e.g. 1,500 crore); lakh/thousand chunks are < 100 / < 1000.
      parts.push(`${chunk >= 1000 ? amountInWords(chunk, indian) : belowThousand(chunk)} ${label}`);
      n %= size;
    }
  }
  if (n > 0) parts.push(belowThousand(n));
  return parts.join(" ");
}
