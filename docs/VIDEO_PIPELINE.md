# SoundSpire Video Upload & Playback Pipeline

## Overview

Videos uploaded by users go through a multi-stage pipeline:
1. **Upload** — directly from browser to S3 (no server bottleneck)
2. **Transcode** — AWS MediaConvert converts to HLS (adaptive streaming)
3. **Playback** — browser plays HLS via `hls.js` directly from S3

---

## Architecture

```
Browser
  │
  ├─ Multipart Upload (chunks) ──────────────────► S3 (posts/, chat/, fan-art/)
  │                                                      │
  │                                               S3 Event Notification
  │                                                      │
  │                                               Lambda Function
  │                                                      │
  │                                               MediaConvert Job
  │                                                      │
  │                                          HLS output (transcoded/)
  │                                                      │
  └─ Poll /api/video/status ◄──────────────── S3 (transcoded/ — public)
       │
       └─ hls.js plays .m3u8 directly from S3
```

---

## Components

### 1. Client Upload (`src/utils/uploadToS3.ts`)

- Files **< 10MB**: single presigned PUT directly to S3
- Files **≥ 10MB**: S3 Multipart Upload
  - Splits file into 10MB chunks
  - Uploads up to 4 chunks in parallel
  - Tracks progress per chunk
  - Completes multipart upload when all chunks done
  - Aborts on failure to clean up S3

### 2. Multipart Upload API (`src/app/api/upload/multipart/route.ts`)

Handles 4 actions:
- `create` — initiates multipart upload, returns `uploadId`
- `presign-part` — returns presigned URL for a specific part number
- `complete` — completes the multipart upload (fetches missing ETags via `ListParts` if CORS doesn't expose them)
- `abort` — aborts and cleans up a failed upload

### 3. Lambda Trigger (`lambda/mediaconvert-trigger.js`)

- Triggered by S3 `ObjectCreated` events on `posts/`, `chat/`, `fan-art/` prefixes
- Filters to video file extensions only (`.mp4`, `.mov`, `.avi`, `.mkv`, `.webm`, `.m4v`)
- Submits a MediaConvert job with 3 quality outputs:
  - **1080p** — 5 Mbps H.264, AAC 128kbps
  - **720p** — 2.5 Mbps H.264, AAC 128kbps
  - **480p** — 1 Mbps H.264, AAC 96kbps
- Output goes to `transcoded/<original-key-without-ext>/`
- HLS segment length: 6 seconds

### 4. Video Status API (`src/app/api/video/status/route.ts`)

- `GET /api/video/status?key=<s3-key>`
- Lists objects under `transcoded/<key-without-ext>/`
- If `.m3u8` found → returns `{ status: 'ready', hlsUrl: '<direct-s3-url>' }`
- If original file exists but no `.m3u8` → returns `{ status: 'processing' }`
- Otherwise → `{ status: 'not_found' }`

### 5. HLS Player (`src/components/HLSVideo.tsx`)

- Polls `/api/video/status` every 5 seconds (up to 5 minutes)
- Shows spinner with "Processing video..." while transcoding
- Once ready, loads `.m3u8` via `hls.js` (or native HLS on Safari)
- Wrapped in `React.memo` to prevent re-renders from parent polling (feed)
- Destroys `hls.js` instance on unmount

---

## AWS Infrastructure (`infra/lib/infra-stack.ts`)

Deployed via AWS CDK:

| Resource | Name | Purpose |
|----------|------|---------|
| IAM Role | `SoundSpireMediaConvertRole` | Allows MediaConvert to read/write S3 |
| IAM Role | `SoundSpireMediaConvertLambdaRole` | Allows Lambda to call MediaConvert + S3 |
| Lambda | `soundspire-mediaconvert-trigger` | Submits MediaConvert jobs on S3 upload |
| S3 Notifications | 18 rules (6 extensions × 3 prefixes) | Triggers Lambda on video upload |

### Deploy

```bash
# Install Lambda dependencies
cd lambda && npm install

# Deploy CDK stack
cd ../infra
npm install && npm run build
npx cdk bootstrap  # first time only
npx cdk deploy
```

### Post-Deploy Setup

1. Get MediaConvert endpoint:
```bash
aws mediaconvert describe-endpoints --region ap-south-1
```

2. Update Lambda env vars:
```bash
aws lambda update-function-configuration \
  --function-name soundspire-mediaconvert-trigger \
  --environment "Variables={
    MEDIACONVERT_ENDPOINT=https://YOUR_ENDPOINT.mediaconvert.ap-south-1.amazonaws.com,
    MEDIACONVERT_ROLE_ARN=arn:aws:iam::ACCOUNT_ID:role/SoundSpireMediaConvertRole
  }" \
  --region ap-south-1
```

3. Make `transcoded/` prefix publicly readable (S3 Console → Permissions):
   - Disable "Block public policy" in Block Public Access settings
   - Add bucket policy:
```json
{
  "Version": "2012-10-17",
  "Statement": [{
    "Sid": "PublicReadTranscoded",
    "Effect": "Allow",
    "Principal": "*",
    "Action": "s3:GetObject",
    "Resource": "arn:aws:s3:::soundspirewebsiteassets/transcoded/*"
  }]
}
```

4. Add `ETag` to S3 CORS exposed headers (for multipart upload):
```json
[{
  "AllowedHeaders": ["*"],
  "AllowedMethods": ["GET", "PUT", "POST", "DELETE", "HEAD"],
  "AllowedOrigins": ["*"],
  "ExposeHeaders": ["ETag"]
}]
```

---

## S3 Bucket Structure

```
soundspirewebsiteassets/
├── images/
│   ├── artists/          ← Artist profile/cover photos (private, presigned redirect)
│   ├── users/            ← User profile photos (private, presigned redirect)
│   └── placeholder.jpg
├── posts/                ← Raw video/image uploads from artist forum
├── chat/                 ← Raw media from all-chat
├── fan-art/              ← Fan art images
├── transcoded/           ← HLS output (PUBLIC — readable by anyone with URL)
│   └── posts/<community>/<timestamp>-<filename>/
│       ├── <filename>.m3u8          ← Master playlist
│       ├── <filename>_1080p.m3u8   ← 1080p sub-playlist
│       ├── <filename>_720p.m3u8    ← 720p sub-playlist
│       ├── <filename>_480p.m3u8    ← 480p sub-playlist
│       └── *.ts                    ← Video segments (6s each)
└── assets/               ← Static assets (logo, etc.)
```

---

## Security Notes

- Raw uploads (`posts/`, `chat/`, `fan-art/`) are **private** — served via `/api/images` proxy with S3 presigned redirects
- Transcoded HLS output (`transcoded/`) is **public** — URLs are unguessable (contain UUIDs + timestamps) but technically accessible to anyone with the URL
- Artist/user profile images use **presigned URL redirects** (5-minute expiry) for fast delivery without public access

---

## Limitations & Future Improvements

- **Transcoding time**: ~1-3 min for short videos, longer for large files (450MB ≈ 3 min)
- **No CloudFront CDN**: videos served directly from S3 `ap-south-1` — users far from Mumbai may experience higher latency
- **No thumbnail generation**: MediaConvert could generate poster images; currently uses canvas-based client-side thumbnail for upload preview
- **No progress for transcoding**: users see "Processing video..." with no ETA
