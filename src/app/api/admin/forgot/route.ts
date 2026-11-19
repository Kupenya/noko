import { NextResponse } from 'next/server'
import { randomBytes, createHash } from 'crypto'
import nodemailer from 'nodemailer'
import { query } from '@/lib/postgres'

export async function POST(req: Request) {
  const body = await req.json()
  const email = String(body.email || '').trim().toLowerCase()
  const admin = await query('select email from admins where email=$1', [email])

  if (admin.rows.length) {
    const token = randomBytes(32).toString('hex')
    const hash = createHash('sha256').update(token).digest('hex')
    await query('insert into password_reset_tokens (token_hash,email,expires_at) values ($1,$2,now()+interval \'30 minutes\')', [hash, email])

    const baseUrl = process.env.APP_URL || 'http://localhost:3001'
    const resetUrl = `${baseUrl}/admin/reset?token=${token}`

    if (process.env.SMTP_USER) {
      const port = Number(process.env.SMTP_PORT || 465)
      const transport = nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp.gmail.com', port, secure: port === 465,
        auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
      })
      await transport.sendMail({
        from: process.env.SMTP_FROM || process.env.SMTP_USER,
        to: email,
        subject: 'Reset your wedding admin password',
        text: `Reset your admin password using this link:\n\n${resetUrl}\n\nIt expires in 30 minutes.`,
      }).catch(() => {})
    } else {
      console.log('Password reset link:', resetUrl)
    }
  }

  return NextResponse.json({ ok: true })
}
