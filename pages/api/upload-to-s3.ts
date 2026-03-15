import connect from "lib/mongo";
import type { NextApiRequest, NextApiResponse } from "next";
import Species from "models/Species";
import { getResizedAbsolutePath, getResizedFilename, getUploadedThumbnailVariants } from "lib/thumbnails";
import { upload } from "lib/s3";
import { promises as fs } from "fs";

export default async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  if (process.env.NODE_ENV !== "development") {
    return res.status(403).json({ success: false, error: "Not allowed" });
  }

  await connect();

  const uploadVariants = getUploadedThumbnailVariants();

  const species = await Species.find(
    { crop: { $exists: true }, sourceKey: { $exists: true }, isUploaded: { $ne: true } },
    ["_id", "sourceKey"]
  )
    .sort({ "latestNomenclature.order": 1 })
    .lean();

  let count = 0;

  for (const { sourceKey, _id } of species) {
    try {
      await Promise.all(
        uploadVariants.map(async ({ size, format }) => {
          const filename = getResizedFilename(_id, sourceKey, size, format);
          const imgPath = getResizedAbsolutePath(_id, sourceKey, size, format);
          const buffer = await fs.readFile(imgPath);
          await upload(buffer, filename);
        })
      );

      await Species.updateOne({ _id }, { isUploaded: true });
      count++;
    } catch (error) {
      console.log("ERROR:", _id, error);
    }
  }

  res.status(200).json({ success: true, count });
}
