import { NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'
import { randomUUID } from 'crypto'
import { getAdminEmail } from '@/lib/auth'
import { v2 as cloudinary } from 'cloudinary'

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
})

export async function POST(req: Request) {
  if (!getAdminEmail()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const form = await req.formData()
  const file = form.get('file')
  if (!(file instanceof File)) return NextResponse.json({ error: 'No image or audio selected.' }, { status: 400 })
  const isImage = file.type.startsWith('image/')
  const isAudio = file.type.startsWith('audio/')
  if (!isImage && !isAudio) return NextResponse.json({ error: 'Choose an image or audio file.' }, { status: 400 })

  const maxBytes = isAudio ? 30 * 1024 * 1024 : 4 * 1024 * 1024
  if (file.size > maxBytes) return NextResponse.json({ error: isAudio ? 'Audio files must be 30 MB or smaller.' : 'Images must be 4 MB or smaller.' }, { status: 400 })

  if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET) {
    try {
      const bytes = Buffer.from(await file.arrayBuffer())
      const result = await new Promise<any>((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            folder: process.env.CLOUDINARY_FOLDER || 'wedding-site',
            resource_type: isAudio ? 'video' : 'image',
            overwrite: false,
            unique_filename: true,
          },
          (error, uploaded) => (error ? reject(error) : resolve(uploaded))
        )
        stream.end(bytes)
      })
      return NextResponse.json({ url: result.secure_url })
    } catch (error: any) {
      return NextResponse.json({ error: error?.message || 'Cloudinary upload failed.' }, { status: 500 })
    }
  }

  const directory = path.join(process.cwd(), 'public', 'uploads')
  await mkdir(directory, { recursive: true })
  const extension = path.extname(file.name || '') || (isAudio ? '.mp3' : '.jpg')
  const filename = `${randomUUID()}${extension}`
  await writeFile(path.join(directory, filename), Buffer.from(await file.arrayBuffer()))
  return NextResponse.json({ url: `/api/media/${encodeURIComponent(filename)}` })
}
