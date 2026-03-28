import { consola } from 'consola'
import Los from '~~/server/models/Los'
import CheckResult from '~~/server/models/CheckResult'
import { checkLosAgainstDraw } from '~~/server/services/losChecker'
import { notifyUser } from '~~/server/services/notificationService'

export async function notifyUsersForDraw(draw: any): Promise<void> {
  consola.info(`[Cron] Notifying users for draw ${draw.anbieter} - ${draw.drawDate}`)

  // Find all active Lose for this anbieter
  const lose = await Los.find({ anbieter: draw.anbieter, isActive: true })

  for (const los of lose) {
    try {
      const result = await checkLosAgainstDraw(los.losNummer, los.anbieter, los.losTyp, draw)

      // Save CheckResult
      const checkResult = await CheckResult.create({
        userId: los.userId,
        losId: los._id,
        drawId: draw._id,
        ...result,
        checkType: 'automatic',
      })

      // Update Los
      los.lastCheckedAt = new Date()
      los.lastCheckResult = {
        hasWon: result.hasWon,
        prize: result.prize,
        drawDate: draw.drawDate,
        checkedAt: new Date(),
      }
      await los.save()

      // Send notification
      const sent = await notifyUser({
        userId: los.userId.toString(),
        type: result.hasWon ? 'gewinn' : 'kein-gewinn',
        losNummer: los.losNummer,
        prize: result.prize || undefined,
        drawDate: draw.drawDate,
      })

      if (sent) {
        checkResult.notificationSent = true
        checkResult.notificationSentAt = new Date()
        await checkResult.save()
      }
    } catch (error) {
      consola.error(`[Cron] Error processing los ${los._id}:`, error)
    }
  }
}
