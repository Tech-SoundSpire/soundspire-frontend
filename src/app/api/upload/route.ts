import { NextRequest, NextResponse } from 'next/server';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

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
    const contentType = request.headers.get('content-type') || '';
    
    // Handle FormData (multiple file uploads for chat)
    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      const files = formData.getAll('files') as File[];

      if (!files || files.length === 0) {
        return NextResponse.json(
          { error: 'No files provided' },
          { status: 400 }
        );
      }

      const bucket = 'soundspirewebsiteassets';
      const uploadedUrls: string[] = [];

      for (const file of files) {
        // Sanitize filename: remove spaces and special characters
        const timestamp = Date.now();
        const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
        const key = `chat/${timestamp}-${sanitizedName}`;

        const command = new PutObjectCommand({
          Bucket: bucket,
          Key: key,
          ContentType: file.type,
        });

        // Generate presigned URL
        const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });

        // Upload file to S3
        const fileBuffer = await file.arrayBuffer();
        const uploadResponse = await fetch(uploadUrl, {
          method: 'PUT',
          body: fileBuffer,
          headers: {
            'Content-Type': file.type,
          },
        });

        if (!uploadResponse.ok) {
          throw new Error(`Failed to upload ${file.name}`);
        }

        uploadedUrls.push(key);
      }

      return NextResponse.json({
        urls: uploadedUrls,
        success: true,
      });
    }
    
    // Handle JSON (single file presigned URL for profile/cover images)
    const { fileName, fileType } = await request.json();

    if (!fileName || !fileType) {
      return NextResponse.json(
        { error: 'fileName and fileType are required' },
        { status: 400 }
      );
    }

    const bucket = 'soundspirewebsiteassets';
    const key = fileName;

    const command = new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      ContentType: fileType,
    });

    // Generate a presigned URL for uploading
    const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });

    return NextResponse.json({
      uploadUrl,
      key,
      bucket,
    });
  } catch (error) {
    console.error('Error uploading files:', error);
    return NextResponse.json(
      { error: 'Failed to upload files' },
      { status: 500 }
    );
  }
} 