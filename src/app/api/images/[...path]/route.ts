import { NextRequest, NextResponse } from 'next/server';
import { S3Client, GetObjectCommand, HeadObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const s3Client = new S3Client({
  region: 'ap-south-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || process.env.BUCKET_AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || process.env.BUCKET_AWS_SECRET_ACCESS_KEY || '',
  },
});

const bucket = 'soundspirewebsiteassets';

// Paths where the key is known to start with images/ (no ambiguity, safe to redirect)
const DIRECT_REDIRECT_PREFIXES = ['images/users/', 'images/artists/', 'images/placeholder', 'users/', 'artists/', 'assets/'];

async function findKey(fullPath: string): Promise<string | null> {
  const tryKeys = fullPath.startsWith('assets/')
    ? [fullPath, `images/${fullPath}`]
    : fullPath.startsWith('images/')
    ? [fullPath]
    : [`images/${fullPath}`, fullPath];

  for (const key of tryKeys) {
    try {
      await s3Client.send(new HeadObjectCommand({ Bucket: bucket, Key: key }));
      return key;
    } catch (e: any) {
      if (e?.$metadata?.httpStatusCode === 404 || e?.name === 'NotFound') continue;
      throw e;
    }
  }
  return null;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const { path } = await params;
    const fullPath = path.join('/');

    // Fast path: known prefixes → redirect to S3 presigned URL (no proxy)
    if (DIRECT_REDIRECT_PREFIXES.some(p => fullPath.startsWith(p))) {
      const key = fullPath.startsWith('images/') || fullPath.startsWith('assets/')
        ? fullPath
        : `images/${fullPath}`;
      const command = new GetObjectCommand({ Bucket: bucket, Key: key });
      const url = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
      return new NextResponse(null, {
        status: 307,
        headers: { Location: url },
      });
    }

    // Slow path: ambiguous keys (e.g. chat/) → verify with HeadObject then proxy
    const s3Key = await findKey(fullPath);
    if (!s3Key) return new NextResponse('Image not found', { status: 404 });

    const response = await s3Client.send(new GetObjectCommand({ Bucket: bucket, Key: s3Key }));
    if (!response.Body) return new NextResponse('Image not found', { status: 404 });

    const chunks = [];
    for await (const chunk of response.Body as any) chunks.push(chunk);
    const buffer = Buffer.concat(chunks);

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': response.ContentType || 'image/jpeg',
        'Cache-Control': 'public, max-age=31536000',
      },
    });
  } catch (error) {
    return new NextResponse('Error fetching image', { status: 500 });
  }
}
