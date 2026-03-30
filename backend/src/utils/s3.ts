import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { v4 as uuidv4 } from 'uuid';

/**
 * Returns a fresh S3Client using env vars at call time, not at module load time.
 * This is necessary because TypeScript hoists all `require()` calls before any
 * code runs — so a module-level S3Client is created before dotenv populates
 * process.env, causing the region/credentials to be empty.
 */
const getS3Client = () =>
  new S3Client({
    region: process.env.AWS_REGION!,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    },
  });

/**
 * Uploads a file buffer to AWS S3 and returns the public URL.
 * @param buffer - The file buffer to upload
 * @param mimetype - The MIME type of the file (e.g., 'image/jpeg')
 * @param originalName - The original filename
 * @returns {Promise<string>} - Returns the public S3 URL of the uploaded image
 */
export const uploadBufferToS3 = async (
  buffer: Buffer,
  mimetype: string,
  originalName: string
): Promise<string> => {
  if (!process.env.AWS_S3_BUCKET) {
    throw new Error('AWS_S3_BUCKET is not defined in environment variables');
  }
  if (!process.env.AWS_REGION) {
    throw new Error('AWS_REGION is not defined in environment variables');
  }
  if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
    throw new Error('AWS credentials are not defined in environment variables');
  }

  // Create a unique file name to avoid collisions
  const extension = originalName.split('.').pop() || 'tmp';
  const fileName = `avatars/${uuidv4()}-${Date.now()}.${extension}`;

  const command = new PutObjectCommand({
    Bucket: process.env.AWS_S3_BUCKET,
    Key: fileName,
    Body: buffer,
    ContentType: mimetype,
  });

  // Client is created here (at request time) so env vars are guaranteed loaded
  await getS3Client().send(command);

  return `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileName}`;
};
