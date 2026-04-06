import Los from '~~/server/models/Los'
import CheckResult from '~~/server/models/CheckResult'
import { checkLosAgainstDraw } from '~~/server/services/losChecker'
import { shouldCallApi } from '~~/server/utils/quickCheckThrottle'

const log = useO2Logger('api:los')

export default defineEventHandler(async (event) => {
  const userId = event.context.user.id
  const losId = getRouterParam(event, 'id')

  const los = await Los.findOne({ _id: losId, userId })
  if (!los) {
    log.warn('Los nicht gefunden bei manuellem Check', { userId, losId })
    throw createError({ statusCode: 404, message: 'Los nicht gefunden' })
  }

  // Rate-limit: max 1 API call per 24h, reset on Sundays at 18:00 and 20:00 Berlin
  if (!shouldCallApi(los.lastManualCheckAt)) {
    log.debug('Rate-Limit: gecachtes Ergebnis zurückgeben', { userId, losId, losNummer: los.losNummer })
    return { los, result: los.lastCheckResult }
  }

  log.info('Manueller Los-Check gestartet', { userId, losId, losNummer: los.losNummer })
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

  log.info('Manueller Los-Check abgeschlossen', { userId, losId, losNummer: los.losNummer, hasWon: result.hasWon, prize: result.prize })
  return { los, result: checkResult }
})
