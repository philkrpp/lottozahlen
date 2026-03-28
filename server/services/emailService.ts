import nodemailer from 'nodemailer'
import type { Transporter } from 'nodemailer'
import { consola } from 'consola'

let transporter: Transporter | null = null

function getTransporter(): Transporter {
  if (transporter) return transporter

  const config = useRuntimeConfig()

  transporter = nodemailer.createTransport({
    host: config.smtp.host,
    port: config.smtp.port,
    secure: config.smtp.port === 465,
    auth: {
      user: config.smtp.user,
      pass: config.smtp.pass,
    },
  })

  return transporter
}

export async function sendEmail(to: string, subject: string, html: string): Promise<boolean> {
  try {
    const config = useRuntimeConfig()
    const transport = getTransporter()

    await transport.sendMail({
      from: `"${config.public.appName}" <${config.smtp.from}>`,
      to,
      subject,
      html,
    })

    consola.success(`[Email] Sent to ${to}: ${subject}`)
    return true
  } catch (error) {
    consola.error('[Email] Failed to send:', error)
    return false
  }
}

// Email Templates
function baseTemplate(content: string): string {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: 'Plus Jakarta Sans', -apple-system, sans-serif; margin: 0; padding: 0; background: #FAFBFC; }
    .container { max-width: 600px; margin: 0 auto; padding: 40px 20px; }
    .card { background: white; border-radius: 16px; padding: 40px; box-shadow: 0 1px 3px rgba(0,0,0,0.08); }
    .header { text-align: center; margin-bottom: 32px; }
    .logo { font-size: 24px; font-weight: 800; color: #0D9488; }
    .content { color: #0F172A; line-height: 1.6; }
    .btn { display: inline-block; background: #0D9488; color: white; padding: 12px 24px; border-radius: 12px; text-decoration: none; font-weight: 600; margin: 16px 0; }
    .footer { text-align: center; margin-top: 32px; color: #64748B; font-size: 13px; }
    .highlight { color: #D4A017; font-weight: 700; }
    .los-nummer { font-family: monospace; font-size: 18px; font-weight: 600; letter-spacing: 0.05em; background: #F1F5F9; padding: 8px 16px; border-radius: 8px; display: inline-block; }
  </style>
</head>
<body>
  <div class="container">
    <div class="card">
      <div class="header"><div class="logo">Lottozahlen</div></div>
      <div class="content">${content}</div>
    </div>
    <div class="footer">&copy; ${new Date().getFullYear()} Lottozahlen. Alle Rechte vorbehalten.</div>
  </div>
</body>
</html>`
}

export function gewinnTemplate(losNummer: string, prize: string, drawDate: string): string {
  return baseTemplate(`
    <h2 style="text-align:center;">&#127881; Herzlichen Glueckwunsch!</h2>
    <p>Dein Los <span class="los-nummer">${losNummer}</span> hat bei der Ziehung vom <strong>${drawDate}</strong> gewonnen!</p>
    <p style="text-align:center; font-size: 24px;" class="highlight">${prize}</p>
    <p style="text-align:center;"><a href="${process.env.NUXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard" class="btn">Zum Dashboard</a></p>
  `)
}

export function keinGewinnTemplate(losNummer: string, drawDate: string): string {
  return baseTemplate(`
    <h2>Ziehungsergebnis</h2>
    <p>Dein Los <span class="los-nummer">${losNummer}</span> hat bei der Ziehung vom <strong>${drawDate}</strong> leider nicht gewonnen.</p>
    <p>Kopf hoch – beim naechsten Mal klappt's bestimmt! &#127808;</p>
    <p style="text-align:center;"><a href="${process.env.NUXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard" class="btn">Zum Dashboard</a></p>
  `)
}

export function neueZiehungTemplate(anbieter: string, drawDate: string): string {
  return baseTemplate(`
    <h2>Neue Ziehungsergebnisse</h2>
    <p>Es gibt neue Ziehungsergebnisse fuer <strong>${anbieter}</strong> vom <strong>${drawDate}</strong>.</p>
    <p>Schau dir die Ergebnisse in deinem Dashboard an!</p>
    <p style="text-align:center;"><a href="${process.env.NUXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard/ziehungen" class="btn">Ergebnisse ansehen</a></p>
  `)
}

export function willkommenTemplate(name: string): string {
  return baseTemplate(`
    <h2 style="text-align:center;">Willkommen bei Lottozahlen! &#127920;</h2>
    <p>Hallo <strong>${name}</strong>,</p>
    <p>schoen, dass du dabei bist! Mit Lottozahlen kannst du deine Losnummern hinterlegen und wirst automatisch benachrichtigt, wenn du gewonnen hast.</p>
    <h3>So geht's los:</h3>
    <ol>
      <li>Trage deine Losnummer ein</li>
      <li>Waehle deinen Anbieter und Los-Typ</li>
      <li>Lehne dich zurueck – wir benachrichtigen dich!</li>
    </ol>
    <p style="text-align:center;"><a href="${process.env.NUXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard" class="btn">Jetzt loslegen</a></p>
  `)
}
