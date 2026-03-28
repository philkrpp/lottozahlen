import { z } from 'zod'
import Los from '~~/server/models/Los'
import { detectLosTypFromNummer } from '~~/server/utils/losTypDetector'

const createLosSchema = z.object({
  losNummer: z.string().regex(/^\d{7,12}$/, 'Losnummer muss 7-12 Ziffern haben'),
  anbieter: z.enum(['deutsche-fernsehlotterie']),
  displayName: z.string().max(50).optional(),
})

export default defineEventHandler(async (event) => {
  const userId = event.context.user.id
  const body = await readBody(event)
  const data = createLosSchema.parse(body)

  let losTyp: string
  try {
    losTyp = detectLosTypFromNummer(data.losNummer)
  } catch {
    throw createError({
      statusCode: 422,
      message: 'Los-Typ konnte nicht erkannt werden. Bitte prüfe die Losnummer.',
    })
  }

  const los = await Los.create({ ...data, losTyp, userId })
  return los
})
