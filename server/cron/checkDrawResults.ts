import { consola } from 'consola'
import Draw from '~~/server/models/Draw'
import Los from '~~/server/models/Los'
import CheckResult from '~~/server/models/CheckResult'
import { fetchLatestDrawResults } from '~~/server/services/drawFetcher'
import { checkLosAgainstDraw } from '~~/server/services/losChecker'
import { notifyUser } from '~~/server/services/notificationService'
import { notifyUsersForDraw } from './notifyUsers'

const ANBIETER_LIST = ['deutsche-fernsehlotterie']

export async function checkDrawResults(): Promise<void> {
  consola.info('[Cron] Checking draw results...')

  // --- Part 1: Fetch new draws and match locally ---
  for (const anbieter of ANBIETER_LIST) {
    try {
      const results = await fetchLatestDrawResults(anbieter)

      for (const result of results) {
        // Check for duplicates by externalId
        const existing = await Draw.findOne({
          anbieter,
          externalId: result.externalId,
        })

        if (existing) continue

        // Save new draw
        const draw = await Draw.create({
          anbieter,
          ...result,
          fetchedAt: new Date(),
        })

        consola.success(
          `[Cron] New draw saved: ${anbieter} - ${result.drawDate} (${result.drawType})`,
        )

        // Trigger local matching for this draw
        await notifyUsersForDraw(draw)
      }
    } catch (error) {
      consola.error(`[Cron] Error fetching draws for ${anbieter}:`, error)
    }
  }

  // --- Part 2: Direct per-ticket API check ---
  consola.info('[Cron] Running direct ticket checks...')
  const activeLose = await Los.find({ isActive: true })

  for (const los of activeLose) {
    try {
      const result = await checkLosAgainstDraw(los.losNummer, los.anbieter, los.losTyp)

      // Save CheckResult (no drawId for direct checks)
      const checkResult = await CheckResult.create({
        userId: los.userId,
        losId: los._id,
        ...result,
        checkType: 'automatic',
      })

      // Update Los
      los.lastCheckedAt = new Date()
      los.lastCheckResult = {
        hasWon: result.hasWon,
        prize: result.prize,
        drawDate: new Date(),
        checkedAt: new Date(),
      }
      await los.save()

      // Send notification
      const sent = await notifyUser({
        userId: los.userId.toString(),
        type: result.hasWon ? 'gewinn' : 'kein-gewinn',
        losNummer: los.losNummer,
        prize: result.prize || undefined,
        drawDate: new Date(),
      })

      if (sent) {
        checkResult.notificationSent = true
        checkResult.notificationSentAt = new Date()
        await checkResult.save()
      }
    } catch (error) {
      consola.error(`[Cron] Error checking los ${los._id}:`, error)
    }
  }

  consola.success('[Cron] Draw results check completed')
}
