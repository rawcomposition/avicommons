import connect from "lib/mongo";
import type { NextApiRequest, NextApiResponse } from "next";
import Species from "models/Species";
import { uploadSpeciesThumbnails } from "lib/upload-thumbnails";

export default async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  if (process.env.NODE_ENV !== "development") {
    return res.status(403).json({ success: false, error: "Not allowed" });
  }

  await connect();

  const species = await Species.find(
    { crop: { $exists: true }, sourceKey: { $exists: true }, isUploaded: { $ne: true } },
    ["_id", "sourceKey"]
  )
    .sort({ "latestNomenclature.order": 1 })
    .lean();

  let count = 0;

  for (const { sourceKey, _id } of species) {
    try {
      const result = await uploadSpeciesThumbnails({ id: _id, sourceKey });
      if (result.missingLocalPaths.length > 0) {
        continue;
      }

      await Species.updateOne({ _id }, { isUploaded: true });
      count++;
    } catch (error) {
      console.log("ERROR:", _id, error);
    }
  }

  res.status(200).json({ success: true, count });
}
