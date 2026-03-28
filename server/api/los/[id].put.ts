import { z } from 'zod'
import Los from '~~/server/models/Los'
import { detectLosTypFromNummer } from '~~/server/utils/losTypDetector'

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
    throw createError({ statusCode: 404, message: 'Los nicht gefunden' })
  }

  return los
})
