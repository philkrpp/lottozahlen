import { hashPassword } from 'better-auth/crypto'
import mongoose from 'mongoose'

export default defineEventHandler(async (event) => {
  const session = event.context.session
  if (!session) {
    throw createError({ statusCode: 401, message: 'Nicht authentifiziert' })
  }

  // Only allow password set for fresh sessions (< 10 minutes)
  const sessionAge = Date.now() - new Date(session.createdAt).getTime()
  if (sessionAge > 10 * 60 * 1000) {
    throw createError({
      statusCode: 403,
      message: 'Session zu alt. Bitte fordere einen neuen Link an.',
    })
  }

  const { newPassword } = await readBody<{ newPassword: string }>(event)

  if (!newPassword || newPassword.length < 8) {
    throw createError({ statusCode: 400, message: 'Passwort muss mindestens 8 Zeichen lang sein' })
  }

  const hashedPassword = await hashPassword(newPassword)
  const userId = event.context.user.id

  const db = mongoose.connection.db
  await db
    .collection('account')
    .updateOne({ userId, providerId: 'credential' }, { $set: { password: hashedPassword } })

  return { success: true }
})
