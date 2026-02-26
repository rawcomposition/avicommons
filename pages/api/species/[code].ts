import connect from "lib/mongo";
import Species from "models/Species";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  const { code } = req.query;

  if (!code || typeof code !== "string") {
    return res.status(400).json({ success: false, error: "Missing code" });
  }

  try {
    await connect();
    const species = await Species.findById(code).lean();

    if (!species) {
      return res.status(404).json({ success: false, error: "Species not found" });
    }

    res.status(200).json({ success: true, species });
  } catch (error) {
    res.status(500).json({ success: false, error: "Internal server error" });
  }
}
