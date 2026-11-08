import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const levelDirs: Record<string, string> = {
  'a1': 'Ilustrasi 入門',
  'a2-1': 'Ilustrasi 初級1',
  'a2-2': 'Ilustrasi 初級2'
};

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ level: string; lesson: string; filename: string }> }
) {
  const { level, lesson, filename } = await params;
  const decodedLesson = decodeURIComponent(lesson);
  const decodedFilename = decodeURIComponent(filename);

  const folderName = levelDirs[level];
  if (!folderName) {
    return new NextResponse('Level illustration not found', { status: 404 });
  }

  // Base directory is D:\Project IRODORI
  let filePath = path.resolve(/*turbopackIgnore: true*/ process.cwd(), '..', folderName, decodedLesson, decodedFilename);

  if (!fs.existsSync(/*turbopackIgnore: true*/ filePath)) {
    filePath = path.resolve(/*turbopackIgnore: true*/ process.cwd(), folderName, decodedLesson, decodedFilename);
    if (!fs.existsSync(/*turbopackIgnore: true*/ filePath)) {
      return new NextResponse('Image not found: ' + decodedFilename, { status: 404 });
    }
  }

  const stat = fs.statSync(filePath);
  const ext = path.extname(decodedFilename).toLowerCase();
  let contentType = 'image/png';
  if (ext === '.jpg' || ext === '.jpeg') contentType = 'image/jpeg';
  else if (ext === '.webp') contentType = 'image/webp';
  else if (ext === '.svg') contentType = 'image/svg+xml';

  const stream = fs.createReadStream(filePath);
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
      'Content-Length': stat.size.toString(),
      'Content-Type': contentType,
      'Cache-Control': 'public, max-age=604800, stale-while-revalidate=86400'
    }
  });
}
