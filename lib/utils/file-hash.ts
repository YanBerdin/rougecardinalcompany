/**
 * @file File Hash Utilities
 * @description SHA-256 hash computation for duplicate detection
 */

export interface HashProgress {
  loaded: number;
  total: number;
  percent: number;
}

export type ProgressCallback = (progress: HashProgress) => void;

/**
 * Compute SHA-256 hash of a file with progress tracking
 * 
 * @param file - File to hash
 * @param onProgress - Optional callback for progress updates (for large files)
 * @returns SHA-256 hash as 64-character hex string
 */
export async function computeFileHash(
  file: File,
  onProgress?: ProgressCallback
): Promise<string> {
  const CHUNK_SIZE = 2 * 1024 * 1024;
  const fileSize = file.size;
  
  if (fileSize <= CHUNK_SIZE) {
    const arrayBuffer = await file.arrayBuffer();
    return hashArrayBuffer(arrayBuffer);
  }

  const chunks: ArrayBuffer[] = [];
  let offset = 0;

  while (offset < fileSize) {
    const chunk = file.slice(offset, offset + CHUNK_SIZE);
    const arrayBuffer = await chunk.arrayBuffer();
    chunks.push(arrayBuffer);
    offset += CHUNK_SIZE;

    if (onProgress) {
      onProgress({
        loaded: Math.min(offset, fileSize),
        total: fileSize,
        percent: Math.min(100, Math.round((offset / fileSize) * 100)),
      });
    }
  }

  const totalLength = chunks.reduce((acc, chunk) => acc + chunk.byteLength, 0);
  const combined = new Uint8Array(totalLength);
  let position = 0;
  
  for (const chunk of chunks) {
    combined.set(new Uint8Array(chunk), position);
    position += chunk.byteLength;
  }

  return hashArrayBuffer(combined.buffer);
}

async function hashArrayBuffer(buffer: ArrayBuffer): Promise<string> {
  const hashBuffer = await crypto.subtle.digest("SHA-256", buffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

/**
 * Validate a SHA-256 hash string format
 */
export function isValidFileHash(hash: string): boolean {
  return /^[a-f0-9]{64}$/i.test(hash);
}
