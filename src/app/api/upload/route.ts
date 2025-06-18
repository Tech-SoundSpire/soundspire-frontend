import { NextRequest, NextResponse } from 'next/server';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

// Create S3 client with explicit configuration
const s3Client = new S3Client({
  region: 'ap-south-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
});

export async function POST(request: NextRequest) {
  try {
    const { fileName, fileType } = await request.json();

    if (!fileName || !fileType) {
      return NextResponse.json(
        { error: 'fileName and fileType are required' },
        { status: 400 }
      );
    }

    const bucket = 'soundspirewebsiteassets';
    const key = `images/users/${fileName}`;

    // Log the request for debugging
    console.log('Upload request details:', {
      fileName,
      fileType,
      bucket,
      key,
      region: 'ap-south-1', // Log the actual region value
      accessKeyId: process.env.AWS_ACCESS_KEY_ID ? 'present' : 'missing',
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY ? 'present' : 'missing',
    });

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
    console.error('Error generating upload URL:', error);
    return NextResponse.json(
      { error: 'Failed to generate upload URL' },
      { status: 500 }
    );
  }
} 