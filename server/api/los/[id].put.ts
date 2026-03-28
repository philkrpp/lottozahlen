import { z } from 'zod'
import Los from '~~/server/models/Los'

const updateLosSchema = z.object({
  displayName: z.string().max(50).optional(),
  isActive: z.boolean().optional(),
  losNummer: z.string().regex(/^\d{7}$/, 'Losnummer muss 7 Ziffern haben').optional(),
  losTyp: z.enum(['jahreslos', 'monatslos', 'mega-los', 'traumhauslos']).optional(),
})

export default defineEventHandler(async (event) => {
  const userId = event.context.user.id
  const losId = getRouterParam(event, 'id')

  const body = await readBody(event)
  const data = updateLosSchema.parse(body)

  const los = await Los.findOneAndUpdate(
    { _id: losId, userId },
    { $set: data },
    { new: true },
  )

  if (!los) {
    throw createError({ statusCode: 404, message: 'Los nicht gefunden' })
  }

  return los
})
