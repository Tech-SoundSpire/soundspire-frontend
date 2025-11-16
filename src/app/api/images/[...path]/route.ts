import { NextRequest, NextResponse } from 'next/server';
import { S3Client, GetObjectCommand, HeadObjectCommand } from '@aws-sdk/client-s3';

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

    // Helper function to check if key exists with better error handling
    async function keyExists(key: string): Promise<{ exists: boolean; error?: string }> {
      try {
        const headCommand = new HeadObjectCommand({ Bucket: bucket, Key: key });
        await s3Client.send(headCommand);
        return { exists: true };
      } catch (error: any) {
        // If it's a 404, the key doesn't exist (this is expected)
        if (error?.$metadata?.httpStatusCode === 404 || error?.name === 'NotFound') {
          return { exists: false };
        }
        // For other errors (like credentials), log and return error
        const errorMsg = error instanceof Error ? error.message : 'Unknown error';
        console.error(`Error checking key "${key}":`, errorMsg);
        return { exists: false, error: errorMsg };
      }
    }

    // Try multiple key patterns in order of likelihood
    const keyPatterns: string[] = [];
    
    // If path starts with assets/, try it directly first
    if (fullPath.startsWith('assets/')) {
      keyPatterns.push(fullPath); // assets/ss_logo.png
      keyPatterns.push(`images/${fullPath}`); // images/assets/ss_logo.png
    } else if (fullPath.startsWith('images/')) {
      keyPatterns.push(fullPath); // images/placeholder.jpg
      keyPatterns.push(fullPath.replace(/^images\//, '')); // placeholder.jpg
    } else {
      // Default: try images/ prefix first, then raw
      keyPatterns.push(`images/${fullPath}`); // images/something.jpg
      keyPatterns.push(fullPath); // something.jpg
    }

    let s3Key: string | null = null;
    let lastError: string | undefined;

    // Try each pattern
    for (const pattern of keyPatterns) {
      console.log(`Checking S3 key: ${pattern}`);
      const result = await keyExists(pattern);
      
      if (result.exists) {
        s3Key = pattern;
        console.log(`✅ Found S3 key: ${pattern}`);
        break;
      }
      
      if (result.error) {
        lastError = result.error;
        // If it's a credentials error, stop trying and return error
        if (result.error.includes('credentials') || result.error.includes('AccessDenied') || result.error.includes('Signature')) {
          console.error('AWS credentials error detected, stopping search');
          break;
        }
      }
    }

    // if still not found → 404
    if (!s3Key) {
      console.error("❌ S3 object not found after trying all patterns:", keyPatterns);
      if (lastError && (lastError.includes('credentials') || lastError.includes('AccessDenied') || lastError.includes('Signature'))) {
        return new NextResponse(
          JSON.stringify({ 
            error: 'AWS credentials error',
            details: 'Unable to access S3. Please check AWS credentials configuration.'
          }),
          { 
            status: 500,
            headers: { 'Content-Type': 'application/json' }
          }
        );
      }
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
    
    // Check if it's a credentials error
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    if (errorMessage.includes('credentials') || errorMessage.includes('AccessDenied')) {
      return new NextResponse(
        JSON.stringify({ 
          error: 'AWS credentials not configured',
          details: 'Please check AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY environment variables'
        }), 
        { 
          status: 500,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
    }
    
    // Return a more specific error message
    return new NextResponse(
      JSON.stringify({ 
        error: 'Error fetching image',
        details: errorMessage
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