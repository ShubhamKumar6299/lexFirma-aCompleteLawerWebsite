import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { v4 as uuidv4 } from 'uuid';

// Check if credentials exist strictly for init safety (they usually do if the SDK is used)
const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
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
    throw new Error('AWS_S3_BUCKET is not defined in the environment variables');
  }

  // Create a unique file name to avoid collisions
  const extension = originalName.split('.').pop() || 'tmp';
  const fileName = `avatars/${uuidv4()}-${Date.now()}.${extension}`;

  const command = new PutObjectCommand({
    Bucket: process.env.AWS_S3_BUCKET,
    Key: fileName,
    Body: buffer,
    ContentType: mimetype,
    // Note: Assuming the bucket has a public read policy, no need for explicit ACL.
    // If bucket allows ACLs, we could add: ACL: 'public-read'
  });

  await s3Client.send(command);

  // Construct the public URL for the uploaded object
  return `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION || 'us-east-1'}.amazonaws.com/${fileName}`;
};
