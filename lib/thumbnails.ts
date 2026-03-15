import { promises as fs } from "fs";
import path from "path";
import sharp from "sharp";
import { getImageOutput, IMAGE_OUTPUTS, IMG_FORMATS, ImgFormat, ImgSize } from "lib/species";
import { Crop } from "lib/types";

export const RESIZED_DIR = path.join(process.cwd(), "resized");
export type ThumbnailVariant = {
  size: ImgSize;
  format: ImgFormat;
};

export const getAllThumbnailVariants = (): ThumbnailVariant[] =>
  IMAGE_OUTPUTS.flatMap(({ format, sizes }) => sizes.map((size) => ({ size, format })));

export const getUploadedThumbnailVariants = (): ThumbnailVariant[] =>
  IMAGE_OUTPUTS.flatMap(({ format, sizes, upload }) => (upload ? sizes.map((size) => ({ size, format })) : []));

export const getResizedFormatDir = (format: ImgFormat) => path.join(RESIZED_DIR, format);

export const getResizedFilename = (id: string, sourceKey: string, size: ImgSize, format: ImgFormat = "jpg") =>
  `${id}-${sourceKey}-${size}.${format}`;

export const getResizedRelativePath = (id: string, sourceKey: string, size: ImgSize, format: ImgFormat = "jpg") =>
  path.join(format, getResizedFilename(id, sourceKey, size, format));

export const getResizedAbsolutePath = (id: string, sourceKey: string, size: ImgSize, format: ImgFormat = "jpg") =>
  path.join(getResizedFormatDir(format), getResizedFilename(id, sourceKey, size, format));

export const getAllResizedFilenames = (id: string, sourceKey: string) =>
  getAllThumbnailVariants().map(({ size, format }) => getResizedFilename(id, sourceKey, size, format));

export const getAllResizedRelativePaths = (id: string, sourceKey: string) =>
  getAllThumbnailVariants().map(({ size, format }) => getResizedRelativePath(id, sourceKey, size, format));

export const getMissingThumbnailVariants = (existingFiles: Set<string>, id: string, sourceKey: string) => {
  return getAllThumbnailVariants().filter(
    ({ size, format }) => !existingFiles.has(getResizedRelativePath(id, sourceKey, size, format))
  );
};

export async function getExistingResizedFiles() {
  const files = await Promise.all(
    IMG_FORMATS.map(async (format) => {
      try {
        const dirFiles = await fs.readdir(getResizedFormatDir(format));
        return dirFiles.map((file) => path.join(format, file));
      } catch (error: any) {
        if (error.code === "ENOENT") {
          return [];
        }
        throw error;
      }
    })
  );

  return new Set(files.flat());
}

export async function generateThumbnailFiles({
  buffer,
  crop,
  flip,
  outputBaseName,
  variants,
}: {
  buffer: Buffer;
  crop: Crop;
  flip?: boolean;
  outputBaseName: string;
  variants: readonly ThumbnailVariant[];
}) {
  await fs.mkdir(RESIZED_DIR, { recursive: true });
  await Promise.all([...new Set(variants.map(({ format }) => format))].map((format) => fs.mkdir(getResizedFormatDir(format), { recursive: true })));

  await Promise.all(
    variants.map(async ({ size, format }) => {
      const outputPath = path.join(getResizedFormatDir(format), `${outputBaseName}-${size}.${format}`);
      const output = getImageOutput(format);
      const pipeline = sharp(buffer)
        .extract({
          left: crop.pixel.x,
          top: crop.pixel.y,
          width: crop.pixel.width,
          height: crop.pixel.height,
        })
        .resize(size, size, { fit: sharp.fit.inside })
        .flop(!!flip);

      if (format === "webp") {
        await pipeline.webp({ quality: output.quality }).toFile(outputPath);
      } else {
        await pipeline.jpeg({ quality: output.quality }).toFile(outputPath);
      }
    })
  );
}
