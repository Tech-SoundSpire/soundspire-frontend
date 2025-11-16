import { NextRequest, NextResponse } from "next/server";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { MAX_FILE_SIZE, ALLOWED_IMAGE_TYPES } from "@/utils/fileUtils";

// Create S3 client with explicit configuration
// Support both naming conventions for AWS credentials
const getS3Client = () => {
  const accessKeyId = process.env.AWS_ACCESS_KEY_ID || process.env.BUCKET_AWS_ACCESS_KEY_ID || '';
  const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY || process.env.BUCKET_AWS_SECRET_ACCESS_KEY || '';
  
  if (!accessKeyId || !secretAccessKey) {
    console.error('Missing AWS credentials. Check AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY environment variables.');
  }
  
  return new S3Client({
    region: 'ap-south-1',
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
  });
};

const s3Client = getS3Client();

export async function POST(request: NextRequest) {
  try {
    const { fileName, fileType, fileSize } = await request.json();

    if (!fileName || !fileType) {
      return NextResponse.json(
        { error: "fileName and fileType are required" },
        { status: 400 },
      );
    }

    // Check file size limit
    if (fileSize && fileSize > MAX_FILE_SIZE) {
      return NextResponse.json(
        { 
          error: `File size exceeds the maximum limit of 5MB. Current size: ${(fileSize / (1024 * 1024)).toFixed(2)}MB` 
        },
        { status: 413 },
      );
    }

    // Validate file type (only allow images)
    if (!ALLOWED_IMAGE_TYPES.includes(fileType)) {
      return NextResponse.json(
        { error: "Only image files (JPEG, PNG, GIF, WebP) are allowed" },
        { status: 400 },
      );
    }

    const bucket = "soundspirewebsiteassets";
    const key = `images/users/${fileName}`;

    // Log the request for debugging
    const accessKeyId = process.env.AWS_ACCESS_KEY_ID || process.env.BUCKET_AWS_ACCESS_KEY_ID;
    const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY || process.env.BUCKET_AWS_SECRET_ACCESS_KEY;
    
    console.log('Upload request details:', {
      fileName,
      fileType,
      fileSize: fileSize ? `${(fileSize / (1024 * 1024)).toFixed(2)}MB` : 'unknown',
      bucket,
      key,
      region: 'ap-south-1',
      accessKeyId: accessKeyId ? 'present' : 'missing',
      secretAccessKey: secretAccessKey ? 'present' : 'missing',
    });

    const command = new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      ContentType: fileType,
    });

    // Generate a presigned URL for uploading
    const uploadUrl = await getSignedUrl(s3Client, command, {
      expiresIn: 3600,
    });

    return NextResponse.json({
      uploadUrl,
      key,
      bucket,
      maxFileSize: MAX_FILE_SIZE,
      maxFileSizeMB: MAX_FILE_SIZE / (1024 * 1024),
    });
  } catch (error) {
    console.error("Error generating upload URL:", error);
    return NextResponse.json(
      { error: "Failed to generate upload URL" },
      { status: 500 },
    );
  }
}
