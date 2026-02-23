import type { NextApiRequest, NextApiResponse } from "next";
import connect from "lib/mongo";
import Species from "models/Species";
import { getUrl } from "lib/species";

const sizes = ["240", "320", "480", "900"] as const;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  if (process.env.NODE_ENV !== "development") {
    return res.status(403).json({ error: "Not allowed" });
  }

  const { code } = req.query;
  const zoneId = process.env.CLOUDFLARE_ZONE_ID;
  const apiToken = process.env.CLOUDFLARE_PURGE_CACHE_API_TOKEN;

  if (!zoneId || !apiToken) {
    return res.status(500).json({ error: "Cloudflare credentials not configured" });
  }

  try {
    await connect();
    const species = await Species.findById(code);
    if (!species) {
      return res.status(404).json({ error: "Species not found" });
    }

    if (!species.sourceKey) {
      return res.status(400).json({ error: "No image to purge" });
    }

    const files = sizes.map((size) => getUrl(code as string, species.sourceKey, size));

    const response = await fetch(`https://api.cloudflare.com/client/v4/zones/${zoneId}/purge_cache`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ files }),
    });

    const result = await response.json();

    if (!result.success) {
      return res.status(500).json({ error: result.errors?.[0]?.message || "Failed to purge cache" });
    }

    res.status(200).json({ success: true, purgedFiles: files });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}
