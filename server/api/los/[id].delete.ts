import Los from '~~/server/models/Los'

export default defineEventHandler(async (event) => {
  const userId = event.context.user.id
  const losId = getRouterParam(event, 'id')

  const los = await Los.findOneAndUpdate(
    { _id: losId, userId },
    { $set: { isActive: false } },
    { new: true },
  )

  if (!los) {
    throw createError({ statusCode: 404, message: 'Los nicht gefunden' })
  }

  return los
})
