import { z } from 'zod'

export const losSchema = z.object({
  losNummer: z.string().regex(/^\d{7}$/, 'Losnummer muss 7 Ziffern haben'),
  anbieter: z.enum(['deutsche-fernsehlotterie']),
  losTyp: z.enum(['jahreslos', 'monatslos', 'mega-los', 'traumhauslos']),
  displayName: z.string().max(50).optional(),
})

export const losUpdateSchema = losSchema.partial()

export const notificationSettingsSchema = z.object({
  emailEnabled: z.boolean().optional(),
  emailAddress: z.string().email().optional(),
  slackEnabled: z.boolean().optional(),
  slackWebhookUrl: z.string().url().startsWith('https://').nullable().optional(),
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
