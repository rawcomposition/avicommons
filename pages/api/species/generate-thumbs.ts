import connect from "lib/mongo";
import type { NextApiRequest, NextApiResponse } from "next";
import Species from "models/Species";
import { IMG_SIZES } from "lib/species";
import sharp from "sharp";
import path from "path";
import { promises as fs } from "fs";

export default async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  if (process.env.NODE_ENV !== "development") {
    return res.status(403).json({ success: false, error: "Not allowed" });
  }

  await connect();

  const species = await Species.find({ crop: { $exists: true }, downloadedAt: { $exists: false } })
    .sort({ order: 1 })
    .lean();

  for (const { sourceKey, crop, _id, flip } of species) {
    const filename = `${_id}-${sourceKey}`;
    const originalPath = path.join(process.cwd(), "originals", `${filename}.jpg`);

    let buffer: Buffer;
    try {
      buffer = await fs.readFile(originalPath);
    } catch (error) {
      console.log("ORIGINAL NOT FOUND:", `${filename}.jpg`);
      continue;
    }

    try {
      await Promise.all(
        IMG_SIZES.map(async (size) => {
          const outputPath = path.join(process.cwd(), "resized", `${filename}-${size}.jpg`);
          const image = sharp(buffer);

          await image
            .extract({
              left: crop.pixel.x,
              top: crop.pixel.y,
              width: crop.pixel.width,
              height: crop.pixel.height,
            })
            .resize(size, size, { fit: sharp.fit.inside })
            .flop(!!flip)
            .jpeg()
            .toFile(outputPath);
        })
      );

      await Species.updateOne({ _id }, { downloadedAt: new Date() });
    } catch (error) {
      console.log("ERROR:", _id, error);
    }
  }

  res.status(200).json({ success: true });
}
