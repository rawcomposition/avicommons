import type { NextApiRequest, NextApiResponse } from "next";
import Photos from "public/latest.json";

export default async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  const family = req.query.family as string;

  if (!family) {
    res.status(200).json({ success: true, photos: [] });
    return;
  }

  const photos = Photos.filter((it) => it.family === family);

  res.status(200).json({ success: true, photos });
}
