import nodemailer from 'nodemailer'

// Two Gmail modes, chosen automatically by which env vars are set:
//  A) App Password (default, easiest): SMTP_USER + SMTP_PASS
//  B) OAuth2 (no password stored): SMTP_USER + GMAIL_CLIENT_ID + GMAIL_CLIENT_SECRET + GMAIL_REFRESH_TOKEN
function makeTransport() {
  const user = process.env.SMTP_USER
  if (process.env.GMAIL_REFRESH_TOKEN) {
    return nodemailer.createTransport({
      host: 'smtp.gmail.com', port: 465, secure: true,
      auth: { type: 'OAuth2', user, clientId: process.env.GMAIL_CLIENT_ID, clientSecret: process.env.GMAIL_CLIENT_SECRET, refreshToken: process.env.GMAIL_REFRESH_TOKEN },
    })
  }
  const port = Number(process.env.SMTP_PORT || 465) // 465 = SSL, 587 = STARTTLS
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com', port, secure: port === 465,
    auth: { user, pass: process.env.SMTP_PASS },
  })
}

export async function sendThanks(to: string, name: string, attending: boolean, couple: string) {
  const subject = attending ? `Thank you, ${name}! We can't wait to celebrate with you` : `Thank you for letting us know, ${name}`
  const text = attending
    ? `Dear ${name},\n\nThank you for your RSVP. We are so happy you will be there. Event details are on our website.\n\nWith love,\n${couple}`
    : `Dear ${name},\n\nThank you for letting us know. We will miss you and are grateful for your love.\n\nWith love,\n${couple}`
  try {
    await makeTransport().sendMail({ from: process.env.SMTP_FROM || process.env.SMTP_USER, to, subject, text })
    return true
  } catch (e) { console.error('Email failed:', e); return false }
}
