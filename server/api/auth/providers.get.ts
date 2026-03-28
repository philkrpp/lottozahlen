import { getEnabledProviders } from '~~/server/utils/auth'

export default defineEventHandler(() => {
  return getEnabledProviders()
})
