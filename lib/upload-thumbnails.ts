import { promises as fs } from "fs";
import { upload } from "lib/s3";
import { getResizedAbsolutePath, getResizedFilename, getUploadedThumbnailVariants, ThumbnailVariant } from "lib/thumbnails";

type UploadSpeciesParams = {
  id: string;
  sourceKey: string;
  variants?: readonly ThumbnailVariant[];
};

type UploadTarget = {
  key: string;
  path: string;
  variant: ThumbnailVariant;
};

export type UploadSpeciesThumbnailsResult = {
  attemptedImageCount: number;
  uploadedImageCount: number;
  missingLocalPaths: string[];
};

export const getUploadTargets = ({
  id,
  sourceKey,
  variants = getUploadedThumbnailVariants(),
}: UploadSpeciesParams): UploadTarget[] =>
  variants.map((variant) => ({
    key: getResizedFilename(id, sourceKey, variant.size, variant.format),
    path: getResizedAbsolutePath(id, sourceKey, variant.size, variant.format),
    variant,
  }));

export async function uploadSpeciesThumbnails({
  id,
  sourceKey,
  variants = getUploadedThumbnailVariants(),
}: UploadSpeciesParams): Promise<UploadSpeciesThumbnailsResult> {
  const targets = getUploadTargets({ id, sourceKey, variants });
  const filesToUpload: { key: string; buffer: Buffer }[] = [];
  const missingLocalPaths: string[] = [];

  for (const target of targets) {
    try {
      const buffer = await fs.readFile(target.path);
      filesToUpload.push({ key: target.key, buffer });
    } catch (error: any) {
      if (error.code === "ENOENT") {
        console.log(`Missing local file for upload: ${target.path}`);
        missingLocalPaths.push(target.path);
        continue;
      }
      throw error;
    }
  }

  if (missingLocalPaths.length > 0) {
    return {
      attemptedImageCount: targets.length,
      uploadedImageCount: 0,
      missingLocalPaths,
    };
  }

  await Promise.all(filesToUpload.map(({ buffer, key }) => upload(buffer, key)));

  return {
    attemptedImageCount: targets.length,
    uploadedImageCount: filesToUpload.length,
    missingLocalPaths,
  };
}
