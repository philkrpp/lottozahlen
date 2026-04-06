import { hashPassword, verifyPassword } from 'better-auth/crypto'
import mongoose from 'mongoose'

const log = useLogger('api:user')

export default defineEventHandler(async (event) => {
  const userId = event.context.user.id
  const { currentPassword, newPassword } = await readBody<{
    currentPassword: string
    newPassword: string
  }>(event)

  if (!currentPassword || !newPassword) {
    log.warn('Passwort-Änderung: fehlende Felder', { userId })
    throw createError({ statusCode: 400, message: 'Beide Passwörter sind erforderlich' })
  }

  if (newPassword.length < 8) {
    log.warn('Passwort-Änderung: zu kurz', { userId })
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
    log.warn('Passwort-Änderung: kein Passwort-Login', { userId })
    throw createError({ statusCode: 400, message: 'Kein Passwort-Login für diesen Account' })
  }

  const isValid = await verifyPassword({ hash: account.password, password: currentPassword })
  if (!isValid) {
    log.warn('Passwort-Änderung: falsches aktuelles Passwort', { userId })
    throw createError({ statusCode: 403, message: 'Aktuelles Passwort ist falsch' })
  }

  const hashedPassword = await hashPassword(newPassword)
  await db
    .collection('account')
    .updateOne({ userId, providerId: 'credential' }, { $set: { password: hashedPassword } })

  // Invalidate all other sessions (keep current)
  await db.collection('session').deleteMany({
    userId,
    _id: { $ne: event.context.session.id },
  })

  log.info('Passwort geändert, andere Sessions invalidiert', { userId })
  return { success: true }
})
