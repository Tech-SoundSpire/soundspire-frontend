import { NextRequest, NextResponse } from 'next/server';
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';

const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'ap-south-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string }> }
) {
  try {
    const { path } = await params;
    const bucket = 'soundspirewebsiteassets';

    // Log the request for debugging
    console.log('Fetching image from S3:', {
      bucket,
      key: `images/${path}`,
      region: process.env.AWS_REGION,
    });

    const command = new GetObjectCommand({
      Bucket: bucket,
      Key: `images/${path}`,
    });

    const response = await s3Client.send(command);
    
    if (!response.Body) {
      console.error('No body in S3 response');
      return new NextResponse('Image not found', { status: 404 });
    }

    // Convert the readable stream to a buffer
    const chunks = [];
    for await (const chunk of response.Body as any) {
      chunks.push(chunk);
    }
    const buffer = Buffer.concat(chunks);

    // Get the content type from the S3 response
    const contentType = response.ContentType || 'image/jpeg';

    // Return the image with appropriate headers
    return new NextResponse(buffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000', // Cache for 1 year
      },
    });
  } catch (error) {
    console.error('Error fetching image from S3:', error);
    // Return a more specific error message
    return new NextResponse(
      JSON.stringify({ 
        error: 'Error fetching image',
        details: error instanceof Error ? error.message : 'Unknown error'
      }), 
      { 
        status: 500,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
  }
} 