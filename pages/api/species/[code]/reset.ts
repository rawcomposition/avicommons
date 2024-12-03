import connect from "lib/mongo";
import Species from "models/Species";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  const { code } = req.query;

  if (process.env.NODE_ENV !== "development") {
    return res.status(403).json({ success: false, error: "Not allowed" });
  }

  try {
    await connect();

    await Species.updateOne(
      { _id: code },
      {
        $unset: {
          downloadedAt: 1,
          isUploaded: 1,
          hasImg: 1,
          author: 1,
          crop: 1,
          iNatFileExt: 1,
          iNatObsId: 1,
          license: 1,
          sourceId: 1,
          source: 1,
        },
      }
    );

    res.status(200).json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}
