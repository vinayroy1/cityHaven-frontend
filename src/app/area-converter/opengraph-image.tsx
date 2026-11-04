import { areaOgImage, ogSize } from "@/components/area/ogImage";

export const alt = "Area Converter: sq ft, sq m, acre, hectare";
export const size = ogSize;
export const contentType = "image/png";

export default function Image() {
  return areaOgImage("Area Converter", "1 acre = 43,560 sq ft");
}
