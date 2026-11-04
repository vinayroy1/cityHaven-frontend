import type { Metadata } from "next";
import { buildCanonical } from "@/constants/seo";
import { AreaPage } from "@/components/area/AreaPage";

const title = "Area Converter: Sq Ft, Sq M, Sq Yd, Acre & Hectare";
const description =
  "Free land area converter. Convert square feet, square metres, square yards, acres, hectares, square km and more instantly, with conversion tables.";

export const metadata: Metadata = {
  title,
  description,
  keywords: [
    "area converter", "land area converter", "sq ft to sq m", "sq m to sq ft", "acre to sq ft",
    "hectare to acre", "sq yd to sq ft", "area calculator", "plot area converter", "square feet calculator",
  ],
  alternates: { canonical: buildCanonical("/area-converter") },
  openGraph: { title, description, url: buildCanonical("/area-converter"), type: "website" },
  twitter: { card: "summary", title, description },
};

const faqs = [
  { q: "How many square feet are in 1 square metre?", a: "1 square metre equals 10.7639 square feet." },
  { q: "How many square feet are in 1 acre?", a: "1 acre equals 43,560 square feet, or about 4,046.86 square metres." },
  { q: "How many acres are in 1 hectare?", a: "1 hectare equals 2.47105 acres, or 10,000 square metres." },
  { q: "How many square feet are in 1 square yard?", a: "1 square yard equals exactly 9 square feet." },
  { q: "Is carpet area measured in sq ft or sq m?", a: "In India, builders usually quote carpet and built-up area in square feet, while RERA documents often show square metres. Use this converter to compare both." },
];

export default function AreaConverterPage() {
  return (
    <AreaPage
      h1="Area Converter"
      intro="Convert property and land area between square feet, square metres, square yards, acres, hectares and more. Results update as you type."
      faqs={faqs}
      path="/area-converter"
    />
  );
}
