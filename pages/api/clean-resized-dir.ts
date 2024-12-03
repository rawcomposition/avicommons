import connect from "lib/mongo";
import type { NextApiRequest, NextApiResponse } from "next";
import Species from "models/Species";
import { IMG_SIZES } from "lib/species";
import fs from "fs";
import path from "path";

const DRY_RUN = true;

export default async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  if (process.env.NODE_ENV !== "development") {
    return res.status(403).json({ success: false, error: "Not allowed" });
  }

  await connect();

  const species = await Species.find({ crop: { $exists: true } }, ["sourceKey"]);
  const expectedResizedFiles = species.flatMap(({ _id, sourceKey }) =>
    IMG_SIZES.map((size) => `${_id}-${sourceKey}-${size}.jpg`)
  );

  const resizedDir = path.join(process.cwd(), "resized");
  const existingFiles = await fs.promises.readdir(resizedDir);

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
      await fs.promises.unlink(path.join(resizedDir, file));
    }
    console.log("Deleted", extraFiles.length, "extra files");
    console.log("Deleted", missingFiles.length, "missing files");
  }

  res.status(200).json({ success: true, extraFiles, missingFiles });
}
