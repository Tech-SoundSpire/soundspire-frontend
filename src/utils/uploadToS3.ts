const MULTIPART_THRESHOLD = 10 * 1024 * 1024; // 10MB — use multipart above this
const CHUNK_SIZE = 10 * 1024 * 1024; // 10MB per part (S3 minimum is 5MB)
const MAX_PARALLEL_PARTS = 4;

/**
 * Upload a file directly to S3 with progress tracking.
 * Uses multipart upload for files > 10MB, single presigned PUT for smaller files.
 * Returns the S3 key on success.
 */
export async function uploadToS3(
    file: File,
    key: string,
    onProgress?: (percent: number) => void
): Promise<string> {
    if (file.size <= MULTIPART_THRESHOLD) {
        return singleUpload(file, key, onProgress);
    }
    return multipartUpload(file, key, onProgress);
}

async function singleUpload(file: File, key: string, onProgress?: (percent: number) => void): Promise<string> {
    const res = await fetch("/api/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileName: key, fileType: file.type }),
    });
    if (!res.ok) throw new Error("Failed to get upload URL");
    const { uploadUrl } = await res.json();

    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open("PUT", uploadUrl);
        xhr.setRequestHeader("Content-Type", file.type);
        if (onProgress) {
            xhr.upload.onprogress = (e) => {
                if (e.lengthComputable) onProgress(Math.round((e.loaded / e.total) * 100));
            };
        }
        xhr.onload = () => xhr.status >= 200 && xhr.status < 300 ? resolve(key) : reject(new Error(`Upload failed: ${xhr.status}`));
        xhr.onerror = () => reject(new Error("Upload network error"));
        xhr.send(file);
    });
}

async function multipartUpload(file: File, key: string, onProgress?: (percent: number) => void): Promise<string> {
    // 1. Create multipart upload
    const createRes = await fetch("/api/upload/multipart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "create", key, fileType: file.type }),
    });
    if (!createRes.ok) throw new Error("Failed to create multipart upload");
    const { uploadId } = await createRes.json();

    const totalParts = Math.ceil(file.size / CHUNK_SIZE);
    const uploadedBytes = new Array(totalParts).fill(0);
    const completedParts: { PartNumber: number; ETag: string }[] = [];

    const updateProgress = () => {
        if (!onProgress) return;
        const total = uploadedBytes.reduce((a, b) => a + b, 0);
        onProgress(Math.round((total / file.size) * 100));
    };

    // 2. Upload parts in parallel batches
    try {
        for (let batch = 0; batch < totalParts; batch += MAX_PARALLEL_PARTS) {
            const batchParts = Array.from(
                { length: Math.min(MAX_PARALLEL_PARTS, totalParts - batch) },
                (_, i) => batch + i + 1 // part numbers are 1-indexed
            );

            await Promise.all(batchParts.map(async (partNumber) => {
                const start = (partNumber - 1) * CHUNK_SIZE;
                const end = Math.min(start + CHUNK_SIZE, file.size);
                const chunk = file.slice(start, end);

                // Get presigned URL for this part
                const presignRes = await fetch("/api/upload/multipart", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ action: "presign-part", key, uploadId, partNumber }),
                });
                if (!presignRes.ok) throw new Error(`Failed to presign part ${partNumber}`);
                const { url } = await presignRes.json();

                // Upload part with progress
                const etag = await new Promise<string>((resolve, reject) => {
                    const xhr = new XMLHttpRequest();
                    xhr.open("PUT", url);
                    xhr.upload.onprogress = (e) => {
                        uploadedBytes[partNumber - 1] = e.loaded;
                        updateProgress();
                    };
                    xhr.onload = () => {
                        if (xhr.status >= 200 && xhr.status < 300) {
                            uploadedBytes[partNumber - 1] = chunk.size;
                            updateProgress();
                            // ETag may be wrapped in quotes — normalize it
                            const rawEtag = xhr.getResponseHeader("ETag") || xhr.getResponseHeader("etag") || "";
                            resolve(rawEtag.replace(/"/g, ""));
                        } else {
                            reject(new Error(`Part ${partNumber} upload failed: ${xhr.status}`));
                        }
                    };
                    xhr.onerror = () => reject(new Error(`Part ${partNumber} network error`));
                    xhr.send(chunk);
                });

                completedParts.push({ PartNumber: partNumber, ETag: etag });
            }));
        }

        // 3. Complete multipart upload
        completedParts.sort((a, b) => a.PartNumber - b.PartNumber);
        const completeRes = await fetch("/api/upload/multipart", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ action: "complete", key, uploadId, parts: completedParts }),
        });
        if (!completeRes.ok) throw new Error("Failed to complete multipart upload");

        onProgress?.(100);
        return key;
    } catch (err) {
        // Abort on failure to clean up S3
        fetch("/api/upload/multipart", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ action: "abort", key, uploadId }),
        }).catch(() => {});
        throw err;
    }
}
