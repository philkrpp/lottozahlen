import { z } from 'zod'
import Los from '~~/server/models/Los'

const createLosSchema = z.object({
  losNummer: z.string().regex(/^\d{7}$/, 'Losnummer muss 7 Ziffern haben'),
  anbieter: z.enum(['deutsche-fernsehlotterie']),
  losTyp: z.enum(['jahreslos', 'monatslos', 'mega-los', 'traumhauslos']),
  displayName: z.string().max(50).optional(),
})

export default defineEventHandler(async (event) => {
  const userId = event.context.user.id
  const body = await readBody(event)
  const data = createLosSchema.parse(body)

  const los = await Los.create({ ...data, userId })
  return los
})
