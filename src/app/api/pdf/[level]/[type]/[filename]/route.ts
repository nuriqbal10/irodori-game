import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const pdfDirs: Record<string, Record<string, string>> = {
  'a1': {
    'modul': 'Modul IRODORI 入門 B.Indonesia (Pdf)',
    'latihan': 'Latihan Soal 入門'
  },
  'a2-1': {
    'modul': 'Modul IRODORI 初級1 B.Indonesia (Pdf)',
    'latihan': 'Latihan Soal 初級1'
  },
  'a2-2': {
    'modul': 'Modul IRODORI 初級2 B.Indonesia (Pdf)',
    'latihan': 'Latihan Soal 初級2'
  }
};

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ level: string; type: string; filename: string }> }
) {
  const { level, type, filename } = await params;
  const decodedFilename = decodeURIComponent(filename);

  const folderName = pdfDirs[level]?.[type];
  if (!folderName) {
    return new NextResponse('PDF category not found', { status: 404 });
  }

  let filePath = path.resolve(/*turbopackIgnore: true*/ process.cwd(), '..', folderName, decodedFilename);
  if (!fs.existsSync(/*turbopackIgnore: true*/ filePath)) {
    filePath = path.resolve(/*turbopackIgnore: true*/ process.cwd(), folderName, decodedFilename);
    if (!fs.existsSync(/*turbopackIgnore: true*/ filePath)) {
      return new NextResponse('PDF file not found: ' + decodedFilename, { status: 404 });
    }
  }

  const stat = fs.statSync(filePath);
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
      'Content-Type': 'application/pdf',
      'Content-Disposition': `inline; filename="${encodeURIComponent(decodedFilename)}"`,
      'Cache-Control': 'public, max-age=604800'
    }
  });
}
