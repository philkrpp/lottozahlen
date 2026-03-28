import { z } from 'zod'

export const losSchema = z.object({
  losNummer: z.string().regex(/^\d{7,12}$/, 'Losnummer muss 7-12 Ziffern haben'),
  anbieter: z.enum(['deutsche-fernsehlotterie']),
  displayName: z.string().max(50).optional(),
})

export const losUpdateSchema = losSchema.partial()

export const notificationSettingsSchema = z.object({
  emailEnabled: z.boolean().optional(),
  emailAddress: z.string().email().optional(),
  slackEnabled: z.boolean().optional(),
  slackWebhookUrl: z
    .string()
    .regex(
      /^(https:\/\/hooks\.slack\.com\/services\/[A-Za-z0-9]+\/[A-Za-z0-9]+\/[A-Za-z0-9]+|slack:\/\/[A-Za-z0-9]+\/[A-Za-z0-9]+\/[A-Za-z0-9]+)$/,
      'Ungültiges Format. Erlaubt: https://hooks.slack.com/services/XXX/XXX/XXX oder slack://XXX/XXX/XXX',
    )
    .nullable()
    .optional(),
  notifyOnWin: z.boolean().optional(),
  notifyOnNoWin: z.boolean().optional(),
  notifyOnNewDraw: z.boolean().optional(),
})

export const preferencesSchema = z.object({
  theme: z.enum(['light', 'dark', 'system']).optional(),
  dashboardLayout: z.enum(['grid', 'list']).optional(),
  showInactiveLose: z.boolean().optional(),
  defaultAnbieter: z.string().nullable().optional(),
  language: z.string().optional(),
})
