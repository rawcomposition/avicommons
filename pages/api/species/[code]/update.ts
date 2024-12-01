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

    const sourceKey = data.source === "inat" ? data.sourceId : generateHash(data.sourceId);

    await Species.updateOne({ _id: code }, { $set: { ...data, sourceKey, hasImg: true }, $unset: { downloadedAt: 1 } });

    res.status(200).json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}
