import NotificationSetting from '~~/server/models/NotificationSetting'
import { sendTestNotification } from '~~/server/services/notificationService'

export default defineEventHandler(async (event) => {
  const userId = event.context.user.id
  const body = await readBody(event)
  const type = body.type || 'email'

  const settings = await NotificationSetting.findOne({ userId })
  if (!settings)
    throw createError({
      statusCode: 404,
      message: 'Keine Benachrichtigungs-Einstellungen gefunden',
    })

  await sendTestNotification(settings, type, event.context.user)
  return {
    success: true,
    message: `Test-${type === 'email' ? 'E-Mail' : 'Slack-Nachricht'} wurde gesendet`,
  }
})
