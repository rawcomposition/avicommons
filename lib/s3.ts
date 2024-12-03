import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

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

  const uploadParams = {
    Bucket: bucket,
    Key: key,
    ACL: "public-read",
    ContentType: "image/jpeg",
    Body: file,
    CacheControl: "max-age=15552000",
  };
  // @ts-ignore
  await s3.send(new PutObjectCommand(uploadParams));
};
