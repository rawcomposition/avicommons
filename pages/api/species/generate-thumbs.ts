import connect from "lib/mongo";
import type { NextApiRequest, NextApiResponse } from "next";
import Species from "models/Species";
import { IMG_SIZES, getSourceImgUrl } from "lib/species";
import sharp from "sharp";
import path from "path";

const LIMIT = 2;

export default async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  if (process.env.NODE_ENV !== "development") {
    return res.status(403).json({ success: false, error: "Not allowed" });
  }

  await connect();

  const species = await Species.find({}).sort({ order: 1 }).limit(LIMIT).lean();

  for (const { source, sourceId, sourceKey, crop, _id, iNatFileExt, flip } of species) {
    const filename = `${_id}-${sourceKey}`;
    const fs = require("fs").promises;
    const originalPath = path.join(process.cwd(), "originals", `${filename}.jpg`);

    let buffer;
    try {
      buffer = await fs.readFile(originalPath);
    } catch (error) {
      console.log("ORIGINAL NOT FOUND:", _id);
      continue;
    }

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
  }

  res.status(200).json({ success: true });
}
