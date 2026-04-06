import mongoose from 'mongoose'
import Los from '~~/server/models/Los'
import CheckResult from '~~/server/models/CheckResult'
import NotificationSetting from '~~/server/models/NotificationSetting'
import UserPreference from '~~/server/models/UserPreference'

const log = useO2Logger('api:user')

export default defineEventHandler(async (event) => {
  const userId = event.context.user.id

  log.warn('Account-Löschung gestartet', { userId })

  // Delete all user data
  await Promise.all([
    Los.deleteMany({ userId }),
    CheckResult.deleteMany({ userId }),
    NotificationSetting.deleteMany({ userId }),
    UserPreference.deleteMany({ userId }),
  ])

  // Delete better-auth records
  const db = mongoose.connection.db
  await Promise.all([
    db.collection('user').deleteOne({ _id: userId }),
    db.collection('account').deleteMany({ userId }),
    db.collection('session').deleteMany({ userId }),
  ])

  log.warn('Account gelöscht', { userId })
  return { success: true }
})
