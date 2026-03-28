import Los from '~~/server/models/Los'
import Draw from '~~/server/models/Draw'
import CheckResult from '~~/server/models/CheckResult'
import { checkLosAgainstDraw } from '~~/server/services/losChecker'

export default defineEventHandler(async (event) => {
  const userId = event.context.user.id
  const losId = getRouterParam(event, 'id')

  const los = await Los.findOne({ _id: losId, userId })
  if (!los) throw createError({ statusCode: 404, message: 'Los nicht gefunden' })

  const draws = await Draw.find({ anbieter: los.anbieter }).sort({ drawDate: -1 }).limit(10)

  const results = []
  for (const draw of draws) {
    const result = await checkLosAgainstDraw(los.losNummer, los.anbieter, los.losTyp, draw)
    const checkResult = await CheckResult.create({
      userId,
      losId: los._id,
      drawId: draw._id,
      ...result,
      checkType: 'manual',
    })
    results.push(checkResult)
  }

  // Update Los with latest result
  if (results.length > 0) {
    const latest = results[0]
    los.lastCheckedAt = new Date()
    los.lastCheckResult = {
      hasWon: latest.hasWon,
      prize: latest.prize,
      drawDate: draws[0].drawDate,
      checkedAt: new Date(),
    }
    await los.save()
  }

  return { los, results }
})
