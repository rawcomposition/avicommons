import connect from "lib/mongo";
import Species from "models/Species";
import { SpeciesInput } from "lib/types";
import type { NextApiRequest, NextApiResponse } from "next";
import { generateHash } from "lib/helpers";

export default async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  const { code } = req.query;
  const data: SpeciesInput = req.body;

  if (process.env.NODE_ENV !== "development") {
    return res.status(403).json({ success: false, error: "Not allowed" });
  }

  try {
    await connect();

    const current = await Species.findById(code);
    if (!current) {
      return res.status(404).json({ success: false, error: "Species not found" });
    }

    const isSameSourceId = data.sourceId === current.sourceId;

    if (isSameSourceId) {
      await Species.updateOne({ _id: code }, { $set: { ...data, isUploaded: false, isProcessed: false } });
    } else {
      const sourceKey = data.source === "inat" ? data.sourceId : generateHash(data.sourceId);
      await Species.updateOne(
        { _id: code },
        { $set: { ...data, sourceKey, isUploaded: false, isProcessed: false }, $unset: { downloadedAt: 1 } }
      );
    }

    res.status(200).json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}
