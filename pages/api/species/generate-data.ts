import connect from "lib/mongo";
import type { NextApiRequest, NextApiResponse } from "next";
import Species from "models/Species";
import { ImgSourceLabel, LicenseLabel, type Stats } from "lib/types";
import path from "path";
import fs from "fs";

export default async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  if (process.env.NODE_ENV !== "development") {
    return res.status(403).json({ success: false, error: "Not allowed" });
  }

  await connect();

  const [species, recentlyDownloaded, totalSpecies] = await Promise.all([
    Species.find({ downloadedAt: { $exists: true } }, [
      "source",
      "license",
      "licenseVer",
      "taxonVersions",
      "author",
      "iNatUserId",
      "iNatObsId",
      "sourceId",
      "sourceKey",
      "name",
      "sciName",
      "downloadedAt",
    ])
      .sort({ order: 1 })
      .lean(),
    Species.find({ downloadedAt: { $exists: true } }, [
      "_id",
      "name",
      "sciName",
      "sourceKey",
      "license",
      "licenseVer",
      "author",
    ])
      .sort({ downloadedAt: -1 })
      .limit(8)
      .lean(),
    Species.countDocuments({}),
  ]);

  const withImg = species.filter((s) => s.downloadedAt).length;
  const percentWithImg = ((withImg / totalSpecies) * 100).toFixed(1) + "%";

  const licenseStats = species.reduce((acc, { license }) => {
    const licenseEntry = acc.find((l) => l.id === license);
    if (licenseEntry) {
      licenseEntry.count += 1;
    } else {
      acc.push({ id: license, label: LicenseLabel[license] || license, count: 1, percent: "0%" });
    }
    return acc;
  }, [] as Stats["license"]);

  licenseStats
    .sort((a, b) => a.label.length - b.label.length)
    .forEach((l) => {
      l.percent = ((l.count / totalSpecies) * 100).toFixed(1) + "%";
    });

  const sourceStats = species.reduce((acc, { source }) => {
    const sourceEntry = acc.find((s) => s.id === source);
    if (sourceEntry) {
      sourceEntry.count += 1;
    } else {
      acc.push({ id: source, label: ImgSourceLabel[source] || source, count: 1, percent: "0%" });
    }
    return acc;
  }, [] as Stats["source"]);

  sourceStats.forEach((s) => {
    s.percent = ((s.count / totalSpecies) * 100).toFixed(1) + "%";
  });

  const taxonVersions = Array.from(new Set(species.flatMap((s) => s.taxonVersions)));

  const stats: Stats = {
    total: totalSpecies,
    withImg,
    percent: percentWithImg,
    license: licenseStats,
    source: sourceStats,
    taxonVersions,
  };

  fs.writeFileSync(path.join(process.cwd(), "data", "stats.json"), JSON.stringify(stats, null, 2));

  const data = species
    .filter((s) => s.downloadedAt)
    .map((it) => ({
      code: it._id,
      name: it.name,
      sciName: it.sciName,
      license: it.licenseVer ? `${LicenseLabel[it.license] || it.license} ${it.licenseVer}` : it.license,
      key: it.sourceKey,
      author: it.author,
    }));

  const dataLite = data.map((it) => ({
    code: it.code,
    key: it.key,
    author: it.author,
  }));

  fs.writeFileSync(path.join(process.cwd(), "data", "data.json"), JSON.stringify(data, null, 2));
  fs.writeFileSync(path.join(process.cwd(), "data", "data-lite.json"), JSON.stringify(dataLite, null, 2));

  const recentlyDownloadedFormatted = recentlyDownloaded.map((it) => ({
    code: it._id,
    name: it.name,
    sciName: it.sciName,
    license: it.licenseVer ? `${LicenseLabel[it.license] || it.license} ${it.licenseVer}` : it.license,
    key: it.sourceKey,
    author: it.author,
  }));

  fs.writeFileSync(
    path.join(process.cwd(), "data", "recently-downloaded.json"),
    JSON.stringify(recentlyDownloadedFormatted, null, 2)
  );

  res.status(200).json({ success: true });
}
