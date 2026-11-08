import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const levelDirs: Record<string, string> = {
  'a1': 'Audio 入門',
  'a2-1': 'Audio 初級1',
  'a2-2': 'Audio 初級2'
};

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ level: string; filename: string }> }
) {
  const { level, filename } = await params;
  const decodedFilename = decodeURIComponent(filename);

  const folderName = levelDirs[level];
  if (!folderName) {
    return new NextResponse('Level audio not found', { status: 404 });
  }

  // Base directory is D:\Project IRODORI
  const filePath = path.resolve(/*turbopackIgnore: true*/ process.cwd(), '..', folderName, decodedFilename);

  if (!fs.existsSync(/*turbopackIgnore: true*/ filePath)) {
    const fallbackPath = path.resolve(/*turbopackIgnore: true*/ process.cwd(), folderName, decodedFilename);
    if (!fs.existsSync(/*turbopackIgnore: true*/ fallbackPath)) {
      return new NextResponse('Audio file not found: ' + decodedFilename, { status: 404 });
    }
  }

  const targetPath = fs.existsSync(/*turbopackIgnore: true*/ filePath) ? filePath : path.resolve(/*turbopackIgnore: true*/ process.cwd(), folderName, decodedFilename);
  const stat = fs.statSync(targetPath);
  const fileSize = stat.size;
  const range = request.headers.get('range');

  if (range) {
    const parts = range.replace(/bytes=/, '').split('-');
    const start = parseInt(parts[0], 10);
    const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
    const chunksize = end - start + 1;

    const stream = fs.createReadStream(targetPath, { start, end });
    const readable = new ReadableStream({
      start(controller) {
        stream.on('data', chunk => controller.enqueue(chunk));
        stream.on('end', () => controller.close());
        stream.on('error', err => controller.error(err));
      }
    });

    return new NextResponse(readable, {
      status: 206,
      headers: {
        'Content-Range': `bytes ${start}-${end}/${fileSize}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunksize.toString(),
        'Content-Type': 'audio/mpeg',
        'Cache-Control': 'public, max-age=31536000, immutable'
      }
    });
  }

  const stream = fs.createReadStream(targetPath);
  const readable = new ReadableStream({
    start(controller) {
      stream.on('data', chunk => controller.enqueue(chunk));
      stream.on('end', () => controller.close());
      stream.on('error', err => controller.error(err));
    }
  });

  return new NextResponse(readable, {
    status: 200,
    headers: {
      'Content-Length': fileSize.toString(),
      'Content-Type': 'audio/mpeg',
      'Accept-Ranges': 'bytes',
      'Cache-Control': 'public, max-age=31536000, immutable'
    }
  });
}
