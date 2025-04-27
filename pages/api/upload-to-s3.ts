import connect from "lib/mongo";
import type { NextApiRequest, NextApiResponse } from "next";
import Species from "models/Species";
import { IMG_SIZES } from "lib/species";
import path from "path";
import { upload } from "lib/s3";
import { promises as fs } from "fs";

const LIMIT = 10000;

export default async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  if (process.env.NODE_ENV !== "development") {
    return res.status(403).json({ success: false, error: "Not allowed" });
  }

  await connect();

  const species = await Species.find({ crop: { $exists: true }, isUploaded: { $ne: true } }, ["_id", "sourceKey"])
    .sort({ order: 1 })
    .limit(LIMIT)
    .lean();

  let count = 0;

  for (const { sourceKey, _id } of species) {
    try {
      await Promise.all(
        IMG_SIZES.map(async (size) => {
          const filename = `${_id}-${sourceKey}-${size}.jpg`;
          const imgPath = path.join(process.cwd(), "resized", filename);
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
