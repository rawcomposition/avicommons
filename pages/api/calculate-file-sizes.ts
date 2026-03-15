import { promises as fs } from "fs";
import { IMG_FORMATS, IMG_SIZES, ImgFormat, ImgSize } from "lib/species";
import { getExistingResizedFiles, RESIZED_DIR } from "lib/thumbnails";
import type { NextApiRequest, NextApiResponse } from "next";
import path from "path";

const formatBytes = (bytes: number) => {
  if (bytes === 0) return "0 B";

  const units = ["B", "KB", "MB", "GB", "TB"];
  const unitIndex = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  const value = bytes / Math.pow(1024, unitIndex);

  return `${value.toFixed(value >= 100 || unitIndex === 0 ? 0 : 1)} ${units[unitIndex]}`;
};

const buildEmptyResponse = () => ({
  success: true,
  totalBytes: 0,
  totalFormatted: "0 B",
  formatTotals: IMG_FORMATS.map((format) => ({
    format,
    bytes: 0,
    formatted: "0 B",
  })),
  buckets: IMG_SIZES.map((size) => ({
    size,
    totalBytes: 0,
    totalFormatted: "0 B",
    formatTotals: IMG_FORMATS.map((format) => ({
      format,
      bytes: 0,
      formatted: "0 B",
    })),
  })),
});

export default async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  if (process.env.NODE_ENV !== "development") {
    return res.status(403).json({ success: false, error: "Not allowed" });
  }

  try {
    const entries = [...(await getExistingResizedFiles())];
    const formatTotals = new Map<string, number>(IMG_FORMATS.map((format) => [format, 0]));
    const bucketTotals = new Map(
      IMG_SIZES.map((size) => [size, new Map<string, number>(IMG_FORMATS.map((format) => [format, 0]))])
    );
    let totalBytes = 0;

    for (const entry of entries) {
      const match = entry.match(/-(\d+)\.([^.]+)$/);
      if (!match) continue;

      const size = Number(match[1]) as ImgSize;
      const format = match[2] as ImgFormat;
      const bucket = bucketTotals.get(size);
      if (!bucket || !IMG_FORMATS.includes(format) || !formatTotals.has(format)) continue;

      const stats = await fs.stat(path.join(RESIZED_DIR, entry));
      bucket.set(format, (bucket.get(format) || 0) + stats.size);
      formatTotals.set(format, (formatTotals.get(format) || 0) + stats.size);
      totalBytes += stats.size;
    }

    res.status(200).json({
      success: true,
      totalBytes,
      totalFormatted: formatBytes(totalBytes),
      formatTotals: IMG_FORMATS.map((format) => {
        const bytes = formatTotals.get(format) || 0;
        return {
          format,
          bytes,
          formatted: formatBytes(bytes),
        };
      }),
      buckets: IMG_SIZES.map((size) => {
        const bucket = bucketTotals.get(size);
        const bucketBytes = IMG_FORMATS.reduce((sum, format) => sum + (bucket?.get(format) || 0), 0);

        return {
          size,
          totalBytes: bucketBytes,
          totalFormatted: formatBytes(bucketBytes),
          formatTotals: IMG_FORMATS.map((format) => {
            const bytes = bucket?.get(format) || 0;
            return {
              format,
              bytes,
              formatted: formatBytes(bytes),
            };
          }),
        };
      }),
    });
  } catch (error: any) {
    if (error.code === "ENOENT") {
      return res.status(200).json(buildEmptyResponse());
    }

    res.status(500).json({ error: error.message });
  }
}
