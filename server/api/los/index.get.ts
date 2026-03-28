import Los from '~~/server/models/Los'

export default defineEventHandler(async (event) => {
  const userId = event.context.user.id
  const lose = await Los.find({ userId }).sort({ createdAt: -1 })
  return lose
})
