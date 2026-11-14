import { COUNTRIES } from "@/config/countries";
import { getJurisdiction } from "./jurisdictions";
import { amountInWords } from "./numberToWords";
import type { AgreementDoc, AgreementInput, AgreementParty } from "./types";

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

function parseDate(iso: string): Date | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso || "");
  return m ? new Date(Date.UTC(+m[1], +m[2] - 1, +m[3])) : null;
}

export function formatDate(iso: string): string {
  const d = parseDate(iso);
  return d ? `${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()}` : "____________";
}

/** Last day of the term: start + N months − 1 day. */
export function endDate(startIso: string, months: number): string {
  const d = parseDate(startIso);
  if (!d || !months) return "";
  const end = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + months, d.getUTCDate() - 1));
  return end.toISOString().slice(0, 10);
}

function ordinal(n: number): string {
  const s = n % 100 >= 11 && n % 100 <= 13 ? "th" : ({ 1: "st", 2: "nd", 3: "rd" } as Record<number, string>)[n % 10] ?? "th";
  return `${n}${s}`;
}

function plural(n: number, word: string) {
  return `${n} ${word}${n === 1 ? "" : "s"}`;
}

const blank = (v: string | undefined, width = 20) => (v && v.trim() ? v.trim() : "_".repeat(width));

export function buildAgreement(input: AgreementInput): AgreementDoc {
  const pack = getJurisdiction(input.country);
  const country = COUNTRIES[input.country] ?? COUNTRIES.IN;
  const fmt = new Intl.NumberFormat(country.locale, { maximumFractionDigits: 0 });
  // Not filled in yet: leave a blank to write in, rather than printing "0 (Zero only)".
  const money = (n: number) => (n > 0 ? `${pack.money} ${fmt.format(Math.round(n))}/-` : `${pack.money} __________/-`);
  const moneyWords = (n: number) =>
    n > 0 ? `${money(n)} (${pack.money === "Rs." ? "Rupees" : pack.money} ${amountInWords(n, pack.indianWords)} only)` : money(0);

  const place = [input.city, input.region, country.name].filter((v) => v && v.trim()).join(", ");
  const isCommercial = input.use === "COMMERCIAL";
  const lessor = isCommercial ? "Lessor" : "Landlord";
  const lessee = isCommercial ? "Lessee" : "Tenant";
  const premises = isCommercial ? "the Premises" : "the Property";

  const describeParty = (p: AgreementParty, i: number, many: boolean) => {
    const bits = [`${blank(p.name, 24)}`];
    if (p.relation?.trim()) bits.push(p.relation.trim());
    bits.push(`${isCommercial ? "having its office / residing at" : "residing at"} ${blank(p.address, 30)}`);
    if (p.idNumber?.trim()) bits.push(`${pack.idLabel.replace(/\s*\(optional\)/i, "")}: ${p.idNumber.trim()}`);
    return `${many ? `(${i + 1}) ` : ""}${bits.join(", ")}`;
  };
  const partyBlock = (list: AgreementParty[]) => list.map((p, i) => describeParty(p, i, list.length > 1)).join("; ");

  const start = formatDate(input.startDate);
  const end = formatDate(endDate(input.startDate, input.durationMonths));
  const propertyLine = [input.configuration, input.propertyType === "ROOM" ? "room" : input.propertyType.toLowerCase(),
    input.areaSqft ? `admeasuring approximately ${input.areaSqft} sq. ft.` : ""].filter(Boolean).join(" ");
  const furnishing = { UNFURNISHED: "unfurnished", SEMI: "semi-furnished", FULL: "fully furnished" }[input.furnishing];

  const official = pack.mode === "official";
  const title = official
    ? `${isCommercial ? "Lease" : "Tenancy"} Terms Addendum`
    : isCommercial ? "Lease Agreement" : "Rental Agreement";

  const preamble = [
    `This ${title} is made and executed at ${place || "____________"} on ${formatDate(input.agreementDate)}.`,
    `BETWEEN ${partyBlock(input.landlords)}, hereinafter called the "${lessor}" (which expression shall include heirs, legal representatives and assigns);`,
    `AND ${partyBlock(input.tenants)}, hereinafter called the "${lessee}" (which expression shall include heirs, legal representatives and permitted assigns).`,
    `WHEREAS the ${lessor} is the lawful owner of, or otherwise entitled to let, the ${furnishing} ${propertyLine} situated at ${blank(input.propertyAddress, 40)}${input.parking ? ", together with parking" : ""} (hereinafter "${premises.replace("the ", "")}"), and has agreed to let ${premises} to the ${lessee} on the terms below.`,
  ];
  if (official) {
    preamble.push(
      `This document records additional terms agreed between the parties and is intended to be read together with the official tenancy contract/form required in ${country.name}. Where they conflict, the official contract and applicable law prevail.`,
    );
  }

  const clauses: AgreementDoc["clauses"] = [];
  const add = (heading: string, ...body: (string | false | undefined)[]) =>
    clauses.push({ heading, body: body.filter(Boolean) as string[] });

  add("Term",
    `The tenancy shall be for a period of ${plural(input.durationMonths, "month")}, commencing on ${start} and ending on ${end}, unless terminated earlier as provided herein.`,
    `The term may be renewed by mutual written consent of both parties on terms agreed at the time of renewal.`);

  add("Rent",
    `The ${lessee} shall pay a monthly rent of ${moneyWords(input.rent)}, payable in advance on or before the ${ordinal(input.rentDueDay || 1)} day of each month.`,
    {
      BANK: "Rent shall be paid by bank transfer to the account nominated by the " + lessor + ".",
      UPI: "Rent shall be paid by UPI/online transfer to the account nominated by the " + lessor + ".",
      CHEQUE: "Rent shall be paid by cheque in favour of the " + lessor + ".",
      CASH: "Rent may be paid in cash, against a signed receipt from the " + lessor + " for every payment.",
      ANY: "Rent may be paid by any mode agreed between the parties; the " + lessor + " shall issue a receipt on request.",
    }[input.paymentMethod],
    input.escalationPct > 0 &&
      `On renewal, the rent shall be increased by ${input.escalationPct}% over the last paid rent, unless otherwise agreed in writing${official ? " and subject to any legal cap" : ""}.`);

  add("Security Deposit",
    `The ${lessee} has paid / shall pay an interest-free refundable security deposit of ${moneyWords(input.deposit)}.`,
    `The deposit shall be refunded at the end of the tenancy upon the ${lessee} handing over vacant and peaceful possession, after deducting any unpaid rent, utility dues and the cost of repairing damage beyond normal wear and tear.`,
    input.country === "GB" && "The deposit shall be protected in a government-approved tenancy deposit scheme as required by law.",
    (input.country === "AU" || input.country === "NZ") && "The deposit (bond) shall be lodged with the relevant government bond authority as required by law.");

  add("Maintenance Charges and Utilities",
    {
      INCLUDED: "Society/building maintenance charges are included in the rent and shall be paid by the " + lessor + ".",
      TENANT: `Society/building maintenance charges${input.maintenanceAmount ? ` of approximately ${money(input.maintenanceAmount)} per month` : ""} shall be paid by the ${lessee} in addition to the rent.`,
      NONE: "No separate maintenance charges apply to " + premises + ".",
    }[input.maintenance],
    {
      TENANT: `Electricity, water, gas, internet and other utility charges for the tenancy period shall be paid by the ${lessee} as per actual consumption.`,
      LANDLORD: `Electricity, water and other utility charges are included in the rent and shall be paid by the ${lessor}.`,
      SHARED: `Utility charges shall be shared between the parties as mutually agreed in writing.`,
    }[input.utilities]);

  add("Use of " + (isCommercial ? "the Premises" : "the Property"),
    isCommercial
      ? `The ${lessee} shall use the Premises only for lawful commercial purposes and shall obtain any licences required for its business.`
      : `The ${lessee} shall use the Property only for residential purposes for the ${lessee} and family/occupants, and not for any illegal or commercial activity.`,
    input.sublettingAllowed
      ? `The ${lessee} may sublet or share ${premises} only with the prior written consent of the ${lessor}.`
      : `The ${lessee} shall not sublet, assign or part with possession of ${premises} or any part of it.`,
    !isCommercial && (input.petsAllowed ? "Pets are permitted, provided they do not cause nuisance or damage." : "Pets shall not be kept without the prior written consent of the " + lessor + "."),
    !isCommercial && !input.smokingAllowed && "Smoking is not permitted inside " + premises + ".");

  add("Maintenance and Repairs",
    `The ${lessee} shall keep ${premises} and its fittings in good and clean condition and shall be responsible for minor day-to-day repairs.`,
    `Major and structural repairs, and repairs due to normal wear and tear, shall be the responsibility of the ${lessor}.`,
    `The ${lessee} shall not make any structural alteration or addition without the prior written consent of the ${lessor}.`,
    `The ${lessor} or an authorised person may inspect ${premises} at a reasonable time after giving prior notice to the ${lessee}.`);

  add("Lock-in and Termination",
    input.lockInMonths > 0 &&
      `Neither party shall terminate this agreement during the first ${plural(input.lockInMonths, "month")} (lock-in period), except for breach of its terms.`,
    `Either party may terminate this agreement${input.lockInMonths > 0 ? " after the lock-in period" : ""} by giving ${plural(input.noticeMonths || 1, "month")}' written notice to the other party.`,
    `If the ${lessee} fails to pay rent for two consecutive months or breaches any material term, the ${lessor} may terminate this agreement by written notice, in accordance with applicable law.`,
    `On expiry or termination, the ${lessee} shall hand over ${premises} in the same condition as received, subject to normal wear and tear.`);

  add("General",
    `The ${lessor} confirms that ${premises} is free from disputes and that the ${lessee} shall enjoy peaceful possession during the term upon paying rent and observing these terms.`,
    `The ${lessee} shall comply with the rules of the building/society and with all applicable laws.`,
    `Any notice under this agreement shall be given in writing to the addresses mentioned above, or by email/messaging to the contact details shared by the parties.`,
    `This agreement shall be governed by the laws of ${input.region ? `${input.region}, ` : ""}${country.name}.`);

  input.extraClauses.filter((c) => c.trim()).forEach((c, i) => {
    if (i === 0) clauses.push({ heading: "Additional Terms", body: [] });
    clauses[clauses.length - 1].body.push(c.trim());
  });

  const fixtures = input.fixtures.filter((f) => f.trim());
  const schedule = fixtures.length
    ? { heading: "Schedule: Fixtures and Furnishings provided", items: fixtures }
    : undefined;

  const signatures = [
    ...input.landlords.map((p) => ({ label: lessor, name: p.name })),
    ...input.tenants.map((p) => ({ label: lessee, name: p.name })),
  ];

  return {
    title,
    subtitle: official ? `To be read with the official tenancy contract in ${country.name}` : undefined,
    preamble,
    clauses,
    schedule,
    signatures,
    witnesses: input.witnesses,
    footnote:
      "Draft prepared with the free Awasio rental agreement tool (awasio.com/rental-agreement). It is a general template, not legal advice. " +
      "Review it and complete stamping, notarisation or registration as required by local law.",
  };
}
