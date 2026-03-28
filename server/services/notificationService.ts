import dayjs from 'dayjs'
import { consola } from 'consola'
import NotificationSetting from '~~/server/models/NotificationSetting'
import { sendEmail, gewinnTemplate, keinGewinnTemplate, neueZiehungTemplate } from './emailService'
import { sendSlackNotification, gewinnBlocks, keinGewinnBlocks, neueZiehungBlocks } from './slackService'

function formatDate(date: Date): string {
  return dayjs(date).format('DD.MM.YYYY')
}

interface NotifyParams {
  userId: string
  type: 'gewinn' | 'kein-gewinn' | 'neue-ziehung'
  losNummer?: string
  prize?: string
  anbieter?: string
  drawDate: Date
}

export async function notifyUser(params: NotifyParams): Promise<boolean> {
  const settings = await NotificationSetting.findOne({ userId: params.userId })
  if (!settings) return false

  const dateStr = formatDate(params.drawDate)
  let emailSent = false
  let slackSent = false

  // Check notification preferences
  if (params.type === 'gewinn' && !settings.notifyOnWin) return false
  if (params.type === 'kein-gewinn' && !settings.notifyOnNoWin) return false
  if (params.type === 'neue-ziehung' && !settings.notifyOnNewDraw) return false

  // Send email
  if (settings.emailEnabled && settings.emailAddress) {
    let subject = ''
    let html = ''

    switch (params.type) {
      case 'gewinn':
        subject = `🎉 Dein Los ${params.losNummer} hat gewonnen!`
        html = gewinnTemplate(params.losNummer!, params.prize!, dateStr)
        break
      case 'kein-gewinn':
        subject = `Ziehungsergebnis für Los ${params.losNummer}`
        html = keinGewinnTemplate(params.losNummer!, dateStr)
        break
      case 'neue-ziehung':
        subject = `Neue Ziehungsergebnisse – ${params.anbieter}`
        html = neueZiehungTemplate(params.anbieter!, dateStr)
        break
    }

    emailSent = await sendEmail(settings.emailAddress, subject, html)
  }

  // Send Slack
  if (settings.slackEnabled && settings.slackWebhookUrl) {
    let blocks
    switch (params.type) {
      case 'gewinn':
        blocks = gewinnBlocks(params.losNummer!, params.prize!, dateStr)
        break
      case 'kein-gewinn':
        blocks = keinGewinnBlocks(params.losNummer!, dateStr)
        break
      case 'neue-ziehung':
        blocks = neueZiehungBlocks(params.anbieter!, dateStr)
        break
    }
    slackSent = await sendSlackNotification(settings.slackWebhookUrl, blocks)
  }

  return emailSent || slackSent
}

export async function sendTestNotification(
  settings: any,
  type: 'email' | 'slack',
  user: { email: string; name?: string },
): Promise<void> {
  if (type === 'email' && settings.emailEnabled && settings.emailAddress) {
    const html = gewinnTemplate('1234567', '1.000 €', formatDate(new Date()))
    await sendEmail(settings.emailAddress, '🧪 Test-Benachrichtigung von Lottozahlen', html)
  }

  if (type === 'slack' && settings.slackEnabled && settings.slackWebhookUrl) {
    const blocks = gewinnBlocks('1234567', '1.000 € (Test)', formatDate(new Date()))
    await sendSlackNotification(settings.slackWebhookUrl, blocks)
  }
}
