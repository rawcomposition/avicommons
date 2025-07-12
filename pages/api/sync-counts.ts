import connect from "lib/mongo";
import type { NextApiRequest, NextApiResponse } from "next";
import Species from "models/Species";

export default async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  if (process.env.NODE_ENV !== "development") {
    return res.status(403).json({ success: false, error: "Not allowed" });
  }

  try {
    await connect();

    const [downloadOriginalsCount, generateThumbsCount, uploadToS3Count, generateDataCount] = await Promise.all([
      Species.countDocuments({
        crop: { $exists: true },
        downloadedAt: { $exists: false },
      }),
      Species.countDocuments({
        crop: { $exists: true },
        isProcessed: false,
      }),
      Species.countDocuments({
        crop: { $exists: true },
        isUploaded: { $ne: true },
      }),
      Species.countDocuments({
        downloadedAt: { $exists: true },
      }),
    ]);

    const counts = [
      { operation: "download-originals", count: downloadOriginalsCount },
      { operation: "generate-thumbs", count: generateThumbsCount },
      { operation: "upload-to-s3", count: uploadToS3Count },
      { operation: "generate-data", count: generateDataCount },
    ];

    res.status(200).json(counts);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}
