import NotificationSetting from '~~/server/models/NotificationSetting'
import { sendTestNotification } from '~~/server/services/notificationService'

const log = useO2Logger('api:notifications')

export default defineEventHandler(async (event) => {
  const userId = event.context.user.id
  const body = await readBody(event)
  const type = body.type || 'email'

  const settings = await NotificationSetting.findOne({ userId })
  if (!settings) {
    log.warn('Test-Benachrichtigung: keine Einstellungen', { userId })
    throw createError({
      statusCode: 404,
      message: 'Keine Benachrichtigungs-Einstellungen gefunden',
    })
  }

  log.info('Test-Benachrichtigung gestartet', { userId, type })
  await sendTestNotification(settings, type, event.context.user)
  log.info('Test-Benachrichtigung gesendet', { userId, type })
  return {
    success: true,
    message: `Test-${type === 'email' ? 'E-Mail' : 'Slack-Nachricht'} wurde gesendet`,
  }
})
