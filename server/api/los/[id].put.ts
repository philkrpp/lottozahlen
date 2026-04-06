import { z } from 'zod'
import Los from '~~/server/models/Los'
import { detectLosTypFromNummer } from '~~/server/utils/losTypDetector'

const log = useLogger('api:los')

const updateLosSchema = z.object({
  displayName: z.string().max(50).optional(),
  isActive: z.boolean().optional(),
  losNummer: z
    .string()
    .regex(/^\d{7,12}$/, 'Losnummer muss 7-12 Ziffern haben')
    .optional(),
})

export default defineEventHandler(async (event) => {
  const userId = event.context.user.id
  const losId = getRouterParam(event, 'id')

  const body = await readBody(event)
  const data = updateLosSchema.parse(body)

  const updateData: Record<string, unknown> = { ...data }
  if (data.losNummer) {
    try {
      updateData.losTyp = detectLosTypFromNummer(data.losNummer)
    } catch {
      log.warn('Los-Typ nicht erkannt bei Update', { userId, losId, losNummer: data.losNummer })
      throw createError({
        statusCode: 422,
        message: 'Los-Typ konnte nicht erkannt werden. Bitte prüfe die Losnummer.',
      })
    }
  }

  const los = await Los.findOneAndUpdate(
    { _id: losId, userId },
    { $set: updateData },
    { returnDocument: 'after' },
  )

  if (!los) {
    log.warn('Los nicht gefunden bei Update', { userId, losId })
    throw createError({ statusCode: 404, message: 'Los nicht gefunden' })
  }

  log.info('Los aktualisiert', { userId, losId, fields: Object.keys(data) })
  return los
})
