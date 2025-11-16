import { NextRequest, NextResponse } from 'next/server';
import { S3Client, GetObjectCommand, HeadObjectCommand } from '@aws-sdk/client-s3';

// Create S3 client with explicit configuration
const s3Client = new S3Client({
  region: 'ap-south-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  console.log('=== IMAGES API ROUTE HIT ===');
  console.log('Request URL:', request.url);
  
  try {
    const { path } = await params;
    console.log('Path from params:', path);
    
    // Join the path array back into a string
    const fullPath = path.join('/');
    console.log('Full path:', fullPath);
    
    const bucket = 'soundspirewebsiteassets';

    //  primary key
    let s3Key = `images/${fullPath}`;
    console.log("Attempting primary S3 key:", s3Key);

    // helper function
    async function keyExists(key: string) {
      try {
        const headCommand = new HeadObjectCommand({ Bucket: bucket, Key: key });
        await s3Client.send(headCommand);
        return true;
      } catch {
        return false;
      }
    }

    // check primary key
    let exists = await keyExists(s3Key);

    // fallback to raw key
    if (!exists) {
      const fallbackKey = fullPath;
      console.log("Primary key not found, trying fallback key:", fallbackKey);

      if (await keyExists(fallbackKey)) {
        s3Key = fallbackKey;
        exists = true;
      }
    }

    // if still not found → 404
    if (!exists) {
      console.error("❌ S3 object not found:", fullPath);
      return new NextResponse('Image not found', { status: 404 });
    }

    console.log('Fetching object from S3:', { bucket, key: s3Key });
    const command = new GetObjectCommand({
      Bucket: bucket,
      Key: s3Key,
    });

    try {
      const response = await s3Client.send(command);
      console.log('GetObject response metadata:', response.$metadata);
      
      if (!response.Body) {
        console.error('No body in S3 response');
        return new NextResponse('Image not found', { status: 404 });
      }

      // Convert the readable stream to a buffer
      console.log('Converting stream to buffer');
      const chunks = [];
      for await (const chunk of response.Body as any) {
        chunks.push(chunk);
      }
      const buffer = Buffer.concat(chunks);
      console.log('Buffer created, size:', buffer.length);

      // Get the content type from the S3 response
      const contentType = response.ContentType || 'image/jpeg';
      console.log('Content type:', contentType);

      // Return the image with appropriate headers
      return new NextResponse(buffer, {
        headers: {
          'Content-Type': contentType,
          'Cache-Control': 'public, max-age=31536000', // Cache for 1 year
        },
      });
    } catch (s3Error) {
      console.error('GetObject error:', {
        error: s3Error instanceof Error ? s3Error.message : 'Unknown error',
        bucket,
        key: s3Key,
        stack: s3Error instanceof Error ? s3Error.stack : undefined,
        name: s3Error instanceof Error ? s3Error.name : 'Unknown',
        code: (s3Error as any)?.$metadata?.httpStatusCode,
      });
      throw s3Error; // Re-throw to be caught by outer try-catch
    }
  } catch (error) {
    console.error('API error:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      name: error instanceof Error ? error.name : 'Unknown',
    });
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