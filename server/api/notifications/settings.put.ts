import { z } from 'zod'
import NotificationSetting from '~~/server/models/NotificationSetting'

const updateNotificationSettingsSchema = z.object({
  emailEnabled: z.boolean().optional(),
  emailAddress: z.string().email('Ungueltige E-Mail-Adresse').optional(),
  slackEnabled: z.boolean().optional(),
  slackWebhookUrl: z.string().url('Ungueltige Webhook-URL').nullable().optional(),
  notifyOnWin: z.boolean().optional(),
  notifyOnNoWin: z.boolean().optional(),
  notifyOnNewDraw: z.boolean().optional(),
})

export default defineEventHandler(async (event) => {
  const userId = event.context.user.id
  const body = await readBody(event)
  const data = updateNotificationSettingsSchema.parse(body)

  const settings = await NotificationSetting.findOneAndUpdate(
    { userId },
    { $set: data },
    { new: true, upsert: true },
  )

  return settings
})
