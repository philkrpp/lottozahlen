import { hashPassword, verifyPassword } from 'better-auth/crypto'
import mongoose from 'mongoose'

export default defineEventHandler(async (event) => {
  const userId = event.context.user.id
  const { currentPassword, newPassword } = await readBody<{
    currentPassword: string
    newPassword: string
  }>(event)

  if (!currentPassword || !newPassword) {
    throw createError({ statusCode: 400, message: 'Beide Passwörter sind erforderlich' })
  }

  if (newPassword.length < 8) {
    throw createError({
      statusCode: 400,
      message: 'Neues Passwort muss mindestens 8 Zeichen lang sein',
    })
  }

  const db = mongoose.connection.db
  const account = await db.collection('account').findOne({
    userId,
    providerId: 'credential',
  })

  if (!account?.password) {
    throw createError({ statusCode: 400, message: 'Kein Passwort-Login für diesen Account' })
  }

  const isValid = await verifyPassword({ hash: account.password, password: currentPassword })
  if (!isValid) {
    throw createError({ statusCode: 403, message: 'Aktuelles Passwort ist falsch' })
  }

  const hashedPassword = await hashPassword(newPassword)
  await db
    .collection('account')
    .updateOne({ userId, providerId: 'credential' }, { $set: { password: hashedPassword } })

  return { success: true }
})
