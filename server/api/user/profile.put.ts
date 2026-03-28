import mongoose from 'mongoose'

export default defineEventHandler(async (event) => {
  const userId = event.context.user.id
  const { name } = await readBody<{ name?: string }>(event)

  if (typeof name !== 'string' || name.length > 100) {
    throw createError({ statusCode: 400, message: 'Ungültiger Name' })
  }

  const db = mongoose.connection.db
  await db
    .collection('user')
    .updateOne({ _id: userId }, { $set: { name: name.trim(), updatedAt: new Date() } })

  return { success: true }
})
