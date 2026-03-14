import { NextRequest, NextResponse } from 'next/server';
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const s3Client = new S3Client({
  region: 'ap-south-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || process.env.BUCKET_AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || process.env.BUCKET_AWS_SECRET_ACCESS_KEY || '',
  },
});

const bucket = 'soundspirewebsiteassets';

// Artist images get redirected to S3 presigned URL for speed (large cover photos)
const REDIRECT_PREFIXES = ['images/artists/'];

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const { path } = await params;
    const fullPath = path.join('/');

    const tryKeys = fullPath.startsWith('assets/')
      ? [fullPath, `images/${fullPath}`]
      : fullPath.startsWith('images/')
      ? [fullPath]
      : [`images/${fullPath}`, fullPath];

    for (const key of tryKeys) {
      try {
        const command = new GetObjectCommand({ Bucket: bucket, Key: key });

        // For large images, redirect to presigned URL (faster)
        if (REDIRECT_PREFIXES.some(p => key.startsWith(p))) {
          const url = await getSignedUrl(s3Client, command, { expiresIn: 300 });
          return NextResponse.redirect(url);
        }

        // For other files, proxy through server
        const response = await s3Client.send(command);
        if (!response.Body) continue;

        const chunks = [];
        for await (const chunk of response.Body as any) chunks.push(chunk);
        const buffer = Buffer.concat(chunks);

        return new NextResponse(buffer, {
          headers: {
            'Content-Type': response.ContentType || 'image/jpeg',
            'Cache-Control': 'no-cache, no-store, must-revalidate',
          },
        });
      } catch (e: any) {
        if (e?.$metadata?.httpStatusCode === 404 || e?.name === 'NoSuchKey') continue;
        throw e;
      }
    }

    return new NextResponse('Image not found', { status: 404 });
  } catch (error) {
    return new NextResponse('Error fetching image', { status: 500 });
  }
}
