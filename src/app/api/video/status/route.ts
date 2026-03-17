import { NextRequest, NextResponse } from 'next/server';
import { S3Client, HeadObjectCommand, ListObjectsV2Command } from '@aws-sdk/client-s3';

const s3 = new S3Client({
  region: 'ap-south-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
});

const bucket = 'soundspirewebsiteassets';
const region = 'ap-south-1';

export async function GET(req: NextRequest) {
  const key = req.nextUrl.searchParams.get('key');
  if (!key) return NextResponse.json({ error: 'key required' }, { status: 400 });

  const keyWithoutExt = key.substring(0, key.lastIndexOf('.'));
  const outputPrefix = `transcoded/${keyWithoutExt}/`;

  try {
    const list = await s3.send(new ListObjectsV2Command({ Bucket: bucket, Prefix: outputPrefix }));
    const m3u8Obj = list.Contents?.find(obj => obj.Key?.endsWith('.m3u8'));

    if (m3u8Obj?.Key) {
      // Direct public S3 URL — transcoded/ prefix is publicly readable
      const hlsUrl = `https://${bucket}.s3.${region}.amazonaws.com/${m3u8Obj.Key}`;
      return NextResponse.json({ status: 'ready', hlsUrl });
    }

    // Not transcoded yet — check if original exists
    try {
      await s3.send(new HeadObjectCommand({ Bucket: bucket, Key: key }));
      return NextResponse.json({ status: 'processing' });
    } catch {
      return NextResponse.json({ status: 'not_found' });
    }
  } catch (e: any) {
    console.error('Video status error:', e);
    return NextResponse.json({ status: 'error' }, { status: 500 });
  }
}
