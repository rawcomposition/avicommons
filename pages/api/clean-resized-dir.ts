import connect from "lib/mongo";
import type { NextApiRequest, NextApiResponse } from "next";
import Species from "models/Species";
import { getAllResizedRelativePaths, getExistingResizedFiles, RESIZED_DIR } from "lib/thumbnails";
import fs from "fs";
import path from "path";

const DRY_RUN = true;

export default async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  if (process.env.NODE_ENV !== "development") {
    return res.status(403).json({ success: false, error: "Not allowed" });
  }

  await connect();

  const species = await Species.find({ crop: { $exists: true }, sourceKey: { $exists: true } }, ["sourceKey"]);
  const expectedResizedFiles = species.flatMap(({ _id, sourceKey }) => getAllResizedRelativePaths(_id, sourceKey));
  const existingFiles = [...(await getExistingResizedFiles())];

  const extraFiles = existingFiles.filter((file) => !expectedResizedFiles.includes(file));
  const missingFiles = expectedResizedFiles.filter((file) => !existingFiles.includes(file));

  if (extraFiles.length > 500) {
    throw new Error("Too many extra files");
  }

  if (DRY_RUN) {
    console.log("Unused files:");
    extraFiles.forEach((file) => console.log(file));
    console.log("Missing files:");
    missingFiles.forEach((file) => console.log(file));
  } else {
    for (const file of extraFiles) {
      await fs.promises.unlink(path.join(RESIZED_DIR, file));
    }
    console.log("Deleted", extraFiles.length, "extra files");
    console.log("Deleted", missingFiles.length, "missing files");
  }

  res.status(200).json({ success: true, extraFiles, missingFiles });
}
