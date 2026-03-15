import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getImageOutput, IMG_FORMATS, ImgFormat } from "lib/species";

export const endpoint = "https://4d77687da34421941e1bbffa894936e5.r2.cloudflarestorage.com";
export const bucket = "avicommons";
const MAX_UPLOAD_ATTEMPTS = 3;
const RETRY_BASE_DELAY_MS = 500;

const createClient = () =>
  new S3Client({
    credentials: {
      accessKeyId: process.env.S3_KEY_ID || "",
      secretAccessKey: process.env.S3_SECRET || "",
    },
    endpoint,
    region: "auto",
  });

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const upload = async (file: Buffer, key: string) => {
  const s3 = createClient();

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

  for (let attempt = 1; attempt <= MAX_UPLOAD_ATTEMPTS; attempt++) {
    try {
      // @ts-ignore
      await s3.send(new PutObjectCommand(uploadParams));
      return;
    } catch (error: any) {
      if (attempt >= MAX_UPLOAD_ATTEMPTS) {
        throw error;
      }
      await sleep(RETRY_BASE_DELAY_MS * 2 ** (attempt - 1));
    }
  }
};
