import UserPreference from '~~/server/models/UserPreference'

export default defineEventHandler(async (event) => {
  const userId = event.context.user.id

  let prefs = await UserPreference.findOne({ userId })
  if (!prefs) {
    prefs = await UserPreference.create({ userId })
  }
  return prefs
})
