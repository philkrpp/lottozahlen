import dayjs from 'dayjs'
import NotificationSetting from '~~/server/models/NotificationSetting'

const log = useO2Logger('notifications')
import { sendEmail, gewinnTemplate, keinGewinnTemplate, neueZiehungTemplate } from './emailService'
import {
  sendSlackNotification,
  gewinnBlocks,
  keinGewinnBlocks,
  neueZiehungBlocks,
} from './slackService'

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
  log.info('Benachrichtigung prüfen', { userId: params.userId, type: params.type, losNummer: params.losNummer })

  const settings = await NotificationSetting.findOne({ userId: params.userId })
  if (!settings) {
    log.debug('Keine Benachrichtigungs-Einstellungen gefunden', { userId: params.userId })
    return false
  }

  const dateStr = formatDate(params.drawDate)
  let emailSent = false
  let slackSent = false

  // Check notification preferences
  if (params.type === 'gewinn' && !settings.notifyOnWin) {
    log.debug('Benachrichtigung übersprungen: Gewinn-Benachrichtigung deaktiviert', { userId: params.userId })
    return false
  }
  if (params.type === 'kein-gewinn' && !settings.notifyOnNoWin) {
    log.debug('Benachrichtigung übersprungen: Kein-Gewinn-Benachrichtigung deaktiviert', { userId: params.userId })
    return false
  }
  if (params.type === 'neue-ziehung' && !settings.notifyOnNewDraw) {
    log.debug('Benachrichtigung übersprungen: Neue-Ziehung-Benachrichtigung deaktiviert', { userId: params.userId })
    return false
  }

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
    log.info('E-Mail-Benachrichtigung', { userId: params.userId, type: params.type, sent: emailSent })
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
    log.info('Slack-Benachrichtigung', { userId: params.userId, type: params.type, sent: slackSent })
  }

  log.info('Benachrichtigung abgeschlossen', { userId: params.userId, type: params.type, emailSent, slackSent })
  return emailSent || slackSent
}

export async function sendTestNotification(
  settings: {
    emailEnabled: boolean
    emailAddress: string
    slackEnabled: boolean
    slackWebhookUrl: string | null
  },
  type: 'email' | 'slack',
  _user: { email: string; name?: string },
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
