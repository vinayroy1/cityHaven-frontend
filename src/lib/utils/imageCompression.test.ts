import { describe, it, expect } from "@jest/globals";
import {
  calculateTargetDimensions,
  compressImageWithStats,
} from "./imageCompression";

describe("Image Compression Utility", () => {
  describe("calculateTargetDimensions", () => {
    it("should keep dimensions unchanged if both width and height are below maxDimension", () => {
      const result = calculateTargetDimensions(1200, 800, 1920);
      expect(result).toEqual({ width: 1200, height: 800 });
    });

    it("should proportionally downscale landscape photos that exceed maxDimension", () => {
      // 4000 x 3000 (4:3 aspect ratio) -> 1920 x 1440
      const result = calculateTargetDimensions(4000, 3000, 1920);
      expect(result.width).toBe(1920);
      expect(result.height).toBe(1440);
    });

    it("should proportionally downscale portrait photos that exceed maxDimension", () => {
      // 3000 x 4000 -> 1440 x 1920
      const result = calculateTargetDimensions(3000, 4000, 1920);
      expect(result.width).toBe(1440);
      expect(result.height).toBe(1920);
    });

    it("should correctly handle square photos", () => {
      const result = calculateTargetDimensions(3200, 3200, 1920);
      expect(result).toEqual({ width: 1920, height: 1920 });
    });
  });

  describe("compressImageWithStats bypass rules", () => {
    it("should skip non-image files such as videos or PDFs", async () => {
      const dummyPdf = new File(["dummy content"], "doc.pdf", {
        type: "application/pdf",
      });
      const result = await compressImageWithStats(dummyPdf);

      expect(result.wasCompressed).toBe(false);
      expect(result.savedBytes).toBe(0);
      expect(result.file).toBe(dummyPdf);
    });

    it("should skip images already below thresholdBytes without unnecessary re-encoding", async () => {
      // 100KB file is well below the default 600KB threshold
      const smallImage = new File([new ArrayBuffer(100 * 1024)], "thumbnail.jpg", {
        type: "image/jpeg",
      });
      const result = await compressImageWithStats(smallImage, {
        thresholdBytes: 600 * 1024,
      });

      expect(result.wasCompressed).toBe(false);
      expect(result.savedBytes).toBe(0);
      expect(result.file).toBe(smallImage);
    });
  });
});
