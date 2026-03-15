import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getImageOutput, IMG_FORMATS, ImgFormat } from "lib/species";

export const endpoint = "https://4d77687da34421941e1bbffa894936e5.r2.cloudflarestorage.com";
export const bucket = "avicommons";

export const upload = async (file: Buffer, key: string) => {
  const s3 = new S3Client({
    credentials: {
      accessKeyId: process.env.S3_KEY_ID || "",
      secretAccessKey: process.env.S3_SECRET || "",
    },
    endpoint,
    region: "auto",
  });

  const ext = key.split(".").pop();
  const contentType =
    ext && IMG_FORMATS.includes(ext as ImgFormat) ? getImageOutput(ext as ImgFormat).contentType : "application/octet-stream";

  const uploadParams = {
    Bucket: bucket,
    Key: key,
    ACL: "public-read",
    ContentType: contentType,
    Body: file,
    CacheControl: "max-age=15552000",
  };
  // @ts-ignore
  await s3.send(new PutObjectCommand(uploadParams));
};
