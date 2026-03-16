import connect from "lib/mongo";
import { listAllObjectKeys } from "lib/s3";
import { getUploadedThumbnailVariants } from "lib/thumbnails";
import { getUploadTargets, uploadSpeciesThumbnails } from "lib/upload-thumbnails";
import type { NextApiRequest, NextApiResponse } from "next";
import Species from "models/Species";

export default async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  if (process.env.NODE_ENV !== "development") {
    return res.status(403).json({ success: false, error: "Not allowed" });
  }

  await connect();

  const uploadVariants = getUploadedThumbnailVariants();
  const existingKeys = new Set(await listAllObjectKeys());

  const species = await Species.find({ crop: { $exists: true }, sourceKey: { $exists: true } }, ["_id", "sourceKey", "isUploaded"])
    .sort({ "latestNomenclature.order": 1 })
    .lean();

  let speciesFixed = 0;
  let imagesFixed = 0;
  let uploadFailures = 0;
  let localMissingFiles = 0;

  for (const { _id, sourceKey, isUploaded } of species) {
    const targets = getUploadTargets({ id: _id, sourceKey, variants: uploadVariants });
    const missingKeys = targets.filter(({ key }) => !existingKeys.has(key));

    if (missingKeys.length === 0) {
      if (!isUploaded) {
        await Species.updateOne({ _id }, { isUploaded: true });
      }
      continue;
    }

    try {
      const result = await uploadSpeciesThumbnails({ id: _id, sourceKey, variants: uploadVariants });
      if (result.missingLocalPaths.length > 0) {
        localMissingFiles += result.missingLocalPaths.length;
        continue;
      }

      await Species.updateOne({ _id }, { isUploaded: true });
      speciesFixed++;
      imagesFixed += missingKeys.length;
      for (const { key } of missingKeys) {
        existingKeys.add(key);
      }
    } catch (error) {
      uploadFailures++;
      console.log("ERROR uploading missing S3 images:", _id, error);
    }
  }

  const message =
    speciesFixed > 0 || imagesFixed > 0
      ? `Upload Missing fixed ${speciesFixed} species and ${imagesFixed} images.`
      : "Upload Missing found no S3 gaps to fix.";

  console.log(message);
  if (localMissingFiles > 0) {
    console.log(`Upload Missing skipped ${localMissingFiles} files because they were missing locally.`);
  }
  if (uploadFailures > 0) {
    console.log(`Upload Missing encountered ${uploadFailures} species with upload errors.`);
  }

  res.status(200).json({
    success: true,
    speciesFixed,
    imagesFixed,
    localMissingFiles,
    uploadFailures,
    message,
  });
}
