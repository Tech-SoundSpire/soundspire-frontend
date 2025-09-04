import { NextRequest, NextResponse } from "next/server";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { MAX_FILE_SIZE, ALLOWED_IMAGE_TYPES } from "@/utils/fileUtils";
import { getDataFromToken } from '@/utils/getDataFromToken';
import { User } from '@/models/User';
// Import models index to ensure associations are registered
import '@/models/index';

// Create S3 client with explicit configuration
const s3Client = new S3Client({
  region: "ap-south-1", // Use the same region as the working upload route
  credentials: {
    accessKeyId: process.env.BUCKET_AWS_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.BUCKET_AWS_SECRET_ACCESS_KEY || "",
  },
});

// Validate S3 client configuration
const validateS3Config = () => {
  if (!process.env.BUCKET_AWS_ACCESS_KEY_ID || !process.env.BUCKET_AWS_SECRET_ACCESS_KEY) {
    console.error("Missing AWS credentials in environment variables");
    return false;
  }
  return true;
};

export async function POST(request: NextRequest) {
  try {
    // Validate S3 configuration
    if (!validateS3Config()) {
      return NextResponse.json(
        { error: "Server configuration error: Missing AWS credentials" },
        { status: 500 }
      );
    }

    // Get user ID from token
    const userId = await getDataFromToken(request);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user from database to verify
    const user = await User.findOne({ where: { user_id: userId } });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if user has @soundspire.online email domain
    if (!user.email || !user.email.endsWith('@soundspire.online')) {
      return NextResponse.json(
        { error: 'Only users with @soundspire.online email domain can upload review images' },
        { status: 403 }
      );
    }

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
          error: `File size exceeds the maximum limit of ${MAX_FILE_SIZE / (1024 * 1024)}MB. Current size: ${(fileSize / (1024 * 1024)).toFixed(2)}MB` 
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
    const key = `images/reviews/${fileName}`;

    // Log the request for debugging
    console.log("Review image upload request details:", {
      fileName,
      fileType,
      fileSize: fileSize ? `${(fileSize / (1024 * 1024)).toFixed(2)}MB` : 'unknown',
      bucket,
      key,
      region: "ap-south-1",
      userId: userId,
      userEmail: user.email,
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

    // Convert S3 path to API URL format
    const s3Path = `s3://${bucket}/${key}`;
    // Extract the path after 'images/' since the API route already includes 'images/'
    const apiPath = key.replace(/^images\//, '');
    const imageUrl = `/api/images/${apiPath}`;

    return NextResponse.json({
      uploadUrl,
      key,
      bucket,
      s3Path,
      imageUrl, // Add a ready-to-use image URL
      maxFileSize: MAX_FILE_SIZE,
      maxFileSizeMB: MAX_FILE_SIZE / (1024 * 1024),
    });
  } catch (error) {
    console.error("Error generating review image upload URL:", error);
    return NextResponse.json(
      { error: "Failed to generate upload URL" },
      { status: 500 },
    );
  }
}
