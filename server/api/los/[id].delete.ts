import Los from '~~/server/models/Los'

const log = useLogger('api:los')

export default defineEventHandler(async (event) => {
  const userId = event.context.user.id
  const losId = getRouterParam(event, 'id')

  const los = await Los.findOneAndUpdate(
    { _id: losId, userId },
    { $set: { isActive: false } },
    { returnDocument: 'after' },
  )

  if (!los) {
    log.warn('Los nicht gefunden bei Deaktivierung', { userId, losId })
    throw createError({ statusCode: 404, message: 'Los nicht gefunden' })
  }

  log.info('Los deaktiviert', { userId, losId, losNummer: los.losNummer })
  return los
})
