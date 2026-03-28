import Los from '~~/server/models/Los'
import CheckResult from '~~/server/models/CheckResult'
import { checkLosAgainstDraw } from '~~/server/services/losChecker'
import { shouldCallApi } from '~~/server/utils/quickCheckThrottle'

export default defineEventHandler(async (event) => {
  const userId = event.context.user.id
  const losId = getRouterParam(event, 'id')

  const los = await Los.findOne({ _id: losId, userId })
  if (!los) throw createError({ statusCode: 404, message: 'Los nicht gefunden' })

  // Rate-limit: max 1 API call per 24h, reset on Sundays at 18:00 and 20:00 Berlin
  if (!shouldCallApi(los.lastManualCheckAt)) {
    return { los, result: los.lastCheckResult }
  }

  const result = await checkLosAgainstDraw(los.losNummer, los.anbieter, los.losTyp)

  const checkResult = await CheckResult.create({
    userId,
    losId: los._id,
    ...result,
    checkType: 'manual',
  })

  // Update Los with latest result
  const now = new Date()
  los.lastCheckedAt = now
  los.lastManualCheckAt = now
  los.lastCheckResult = {
    hasWon: result.hasWon,
    prize: result.prize,
    drawDate: now,
    checkedAt: now,
  }
  await los.save()

  return { los, result: checkResult }
})
