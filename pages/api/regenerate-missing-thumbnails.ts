import connect from "lib/mongo";
import {
  getExistingResizedFiles,
  generateThumbnailFiles,
  getMissingThumbnailVariants,
  getResizedRelativePath,
} from "lib/thumbnails";
import type { NextApiRequest, NextApiResponse } from "next";
import Species from "models/Species";
import path from "path";
import { promises as fs } from "fs";

export default async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  if (process.env.NODE_ENV !== "development") {
    return res.status(403).json({ success: false, error: "Not allowed" });
  }

  await connect();

  const species = await Species.find(
    { crop: { $exists: true }, sourceKey: { $exists: true } },
    ["_id", "sourceKey", "crop", "flip"]
  )
    .sort({ "latestNomenclature.order": 1 })
    .lean();

  const existingFiles = await getExistingResizedFiles();
  let speciesCount = 0;
  let fileCount = 0;

  for (const { sourceKey, crop, _id, flip } of species) {
    const missingVariants = getMissingThumbnailVariants(existingFiles, _id, sourceKey);
    if (missingVariants.length === 0) continue;

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
      await generateThumbnailFiles({
        buffer,
        crop,
        flip,
        outputBaseName: filename,
        variants: missingVariants,
      });

      for (const { size, format } of missingVariants) {
        existingFiles.add(getResizedRelativePath(_id, sourceKey, size, format));
      }

      speciesCount++;
      fileCount += missingVariants.length;
    } catch (error) {
      console.log("ERROR:", _id, error);
    }
  }

  res.status(200).json({ success: true, speciesCount, fileCount });
}
