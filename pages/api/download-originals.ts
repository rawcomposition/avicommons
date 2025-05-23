import connect from "lib/mongo";
import type { NextApiRequest, NextApiResponse } from "next";
import Species from "models/Species";
import { getSourceImgUrl } from "lib/species";
import path from "path";
import fs from "fs";

const LIMIT = 10000;
const DELAY = 0;

export default async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  if (process.env.NODE_ENV !== "development") {
    return res.status(403).json({ success: false, error: "Not allowed" });
  }

  await connect();

  const species = await Species.find(
    {
      crop: { $exists: true },
      downloadedAt: { $exists: false },
    },
    ["source", "sourceId", "sourceKey", "iNatFileExt"]
  )
    .sort({ order: 1 })
    .limit(LIMIT)
    .lean();

  let count = 0;

  for (const { source, sourceId, _id, sourceKey, iNatFileExt } of species) {
    try {
      const filename = `${_id}-${sourceKey}.jpg`;
      const outputPath = path.join(process.cwd(), "originals", filename);

      if (fs.existsSync(outputPath)) {
        console.log("Already exists:", filename);
        await Species.updateOne({ _id }, { downloadedAt: new Date() });
        count++;
        continue;
      }

      if (source === "flickr") {
        await new Promise((resolve) => setTimeout(resolve, DELAY));
      }

      let original = getSourceImgUrl({ source, sourceId, size: 2400, ext: iNatFileExt });
      if (!original) {
        console.log("No original for", _id);
        continue;
      }

      const originalRes = await fetch(original);
      if (!originalRes.ok) {
        console.log("FAILED:", _id, original);
        continue;
      }

      const buffer = await originalRes.arrayBuffer();
      // @ts-ignore
      fs.writeFileSync(outputPath, Buffer.from(buffer));
      await Species.updateOne({ _id }, { downloadedAt: new Date() });
      count++;
    } catch (error) {
      console.log("ERROR:", _id);
    }
  }

  res.status(200).json({ success: true, count });
}
