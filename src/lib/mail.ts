import nodemailer from 'nodemailer'

function getSmtpConfig() {
  const host = process.env.SMTP_HOST
  const port = parseInt(process.env.SMTP_PORT ?? '587', 10)
  const user = process.env.SMTP_USER
  const pass = process.env.SMTP_PASS
  const fromEmail = process.env.SMTP_FROM_EMAIL
  const fromName = process.env.SMTP_FROM_NAME ?? 'BlogNest'

  if (!host || !user || !pass || !fromEmail) {
    return null
  }

  const secure =
    process.env.SMTP_SECURE === 'true' || port === 465

  return {
    fromEmail,
    fromName,
    transport: nodemailer.createTransport({
      host,
      port,
      secure,
      auth: { user, pass },
    }),
  }
}

export async function sendNewsletterWelcomeEmail(to: string) {
  const config = getSmtpConfig()
  if (!config) {
    throw new Error('SMTP is not configured. Check your environment variables.')
  }

  const siteUrl = process.env.NEXTAUTH_URL ?? 'http://localhost:3000'

  await config.transport.sendMail({
    from: `"${config.fromName}" <${config.fromEmail}>`,
    to,
    subject: 'Welcome to the BlogNest newsletter',
    text: `Thanks for subscribing to BlogNest!\n\nYou'll receive our best stories and analysis in your inbox.\n\nVisit us: ${siteUrl}\n`,
    html: `
      <div style="font-family: system-ui, sans-serif; max-width: 560px; margin: 0 auto; padding: 24px;">
        <h1 style="color: #1e40af; margin-bottom: 8px;">Welcome to BlogNest</h1>
        <p style="color: #374151; line-height: 1.6;">Thanks for subscribing! You'll get clear, context-rich stories on technology, politics, science, and more — delivered to your inbox.</p>
        <p style="margin-top: 24px;">
          <a href="${siteUrl}" style="display: inline-block; background: linear-gradient(90deg, #2563eb, #7c3aed); color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600;">Read latest stories</a>
        </p>
        <p style="color: #9ca3af; font-size: 12px; margin-top: 32px;">You received this because you subscribed at BlogNest. Unsubscribe anytime by replying to this email.</p>
      </div>
    `,
  })
}

export function isSmtpConfigured(): boolean {
  return getSmtpConfig() !== null
}
