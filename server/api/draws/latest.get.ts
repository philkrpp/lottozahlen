import Draw from '~~/server/models/Draw'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const anbieter = (query.anbieter as string) || 'deutsche-fernsehlotterie'

  const draw = await Draw.findOne({ anbieter }).sort({ drawDate: -1 })
  return draw
})
