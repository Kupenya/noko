import { NextResponse } from 'next/server'
import { readFile } from 'fs/promises'
import path from 'path'

export async function GET(_req: Request, { params }: { params: { filename: string } }) {
  try {
    const filename = path.basename(params.filename)
    const file = await readFile(path.join(process.cwd(), 'public', 'uploads', filename))
    const extension = path.extname(filename).toLowerCase()
    const contentType = extension === '.png' ? 'image/png'
      : ['.jpg','.jpeg'].includes(extension) ? 'image/jpeg'
      : extension === '.gif' ? 'image/gif'
      : extension === '.webp' ? 'image/webp'
      : extension === '.mp3' ? 'audio/mpeg'
      : extension === '.wav' ? 'audio/wav'
      : extension === '.m4a' ? 'audio/mp4'
      : 'application/octet-stream'
    return new NextResponse(file, { headers: { 'Content-Type': contentType, 'Cache-Control': 'public, max-age=86400' } })
  } catch {
    return NextResponse.json({ error: 'Media not found.' }, { status: 404 })
  }
}
