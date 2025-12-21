import { put } from "@vercel/blob";

/**
 * Uploads a file to Vercel Blob storage.
 * 
 * @param path - The path/filename in the blob storage (e.g., 'articles/hello.txt')
 * @param content - String, Buffer, Blob, or ReadableStream content
 * @returns The resulting blob object including the URL
 */
export async function uploadToBlob(path: string, content: string | Buffer | Blob | ReadableStream) {
  try {
    const blob = await put(path, content, {
      access: 'public',
      token: process.env.BLOB_READ_WRITE_TOKEN,
    });
    return blob;
  } catch (error) {
    console.error("Error uploading to Vercel Blob:", error);
    throw error;
  }
}
