import { NextRequest, NextResponse } from 'next/server';
import {
  S3Client,
  CreateMultipartUploadCommand,
  UploadPartCommand,
  CompleteMultipartUploadCommand,
  AbortMultipartUploadCommand,
  ListPartsCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const s3 = new S3Client({
  region: 'ap-south-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || process.env.BUCKET_AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || process.env.BUCKET_AWS_SECRET_ACCESS_KEY || '',
  },
});

const bucket = 'soundspirewebsiteassets';

export async function POST(req: NextRequest) {
  const { action, key, fileType, uploadId, parts, partNumber } = await req.json();

  if (action === 'create') {
    // Start multipart upload
    const cmd = new CreateMultipartUploadCommand({ Bucket: bucket, Key: key, ContentType: fileType });
    const { UploadId } = await s3.send(cmd);
    return NextResponse.json({ uploadId: UploadId, key });
  }

  if (action === 'presign-part') {
    // Get presigned URL for a single part
    const cmd = new UploadPartCommand({ Bucket: bucket, Key: key, UploadId: uploadId, PartNumber: partNumber });
    const url = await getSignedUrl(s3, cmd, { expiresIn: 3600 });
    return NextResponse.json({ url });
  }

  if (action === 'complete') {
    // Fetch any missing ETags from S3 (happens when CORS doesn't expose ETag header)
    const resolvedParts = await Promise.all(
      (parts as { PartNumber: number; ETag: string }[]).map(async (part) => {
        if (part.ETag) return part;
        // ETag was empty — fetch it via ListParts
        const listed = await s3.send(new ListPartsCommand({ Bucket: bucket, Key: key, UploadId: uploadId }));
        const found = listed.Parts?.find(p => p.PartNumber === part.PartNumber);
        return { ...part, ETag: found?.ETag || '' };
      })
    );
    const cmd = new CompleteMultipartUploadCommand({
      Bucket: bucket,
      Key: key,
      UploadId: uploadId,
      MultipartUpload: { Parts: resolvedParts },
    });
    await s3.send(cmd);
    return NextResponse.json({ key });
  }

  if (action === 'abort') {
    await s3.send(new AbortMultipartUploadCommand({ Bucket: bucket, Key: key, UploadId: uploadId }));
    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
}
