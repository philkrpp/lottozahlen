import { consola } from 'consola'
import Los from '~~/server/models/Los'
import CheckResult from '~~/server/models/CheckResult'
import { notifyUser } from '~~/server/services/notificationService'
import type { IDraw } from '~~/server/models/Draw'
import { getCompatibleLosTypesForDraw } from '~~/server/utils/drawCompatibility'

function parseGewinnBetrag(gewinnStr: string): number | null {
  const match = gewinnStr.match(/([\d.]+),(\d{2})\s*Euro/)
  if (!match?.[1] || !match[2]) return null
  const integerPart = match[1].replace(/\./g, '')
  const decimalPart = match[2]
  return parseFloat(`${integerPart}.${decimalPart}`)
}

export async function notifyUsersForDraw(draw: IDraw): Promise<void> {
  consola.info(
    `[Cron] Matching users for draw ${draw.anbieter} - ${draw.drawDate} (type ${draw.drawType})`,
  )

  const gewinne = draw.results?.gewinne ?? []
  if (gewinne.length === 0) {
    consola.info('[Cron] No winning numbers in this draw, skipping')
    return
  }

  // Build a map of winning numbers for fast lookup
  const gewinnMap = new Map(gewinne.map((g) => [g.gewinnzahl, g]))

  // Find active Lose whose losTyp is compatible with this draw's drawType
  const compatibleLosTypes = getCompatibleLosTypesForDraw(draw.drawType)
  if (compatibleLosTypes.length === 0) {
    consola.info(`[Cron] No compatible losTypes for drawType ${draw.drawType}, skipping`)
    return
  }
  const lose = await Los.find({
    anbieter: draw.anbieter,
    isActive: true,
    losTyp: { $in: compatibleLosTypes },
  })
  consola.info(`[Cron] ${lose.length} compatible Lose for drawType ${draw.drawType}`)

  for (const los of lose) {
    try {
      // Match last 7 digits of 12-digit Losnummer against 7-digit Gewinnzahl
      const losEndziffern = los.losNummer.slice(-7)
      const matchingGewinn = gewinnMap.get(losEndziffern)

      const hasWon = !!matchingGewinn
      const prize = matchingGewinn?.gewinn ?? null
      const prizeAmount = matchingGewinn ? parseGewinnBetrag(matchingGewinn.gewinn) : null

      // Save CheckResult
      const checkResult = await CheckResult.create({
        userId: los.userId,
        losId: los._id,
        drawId: draw._id,
        hasWon,
        prize,
        prizeAmount,
        checkType: 'automatic',
      })

      // Update Los
      los.lastCheckedAt = new Date()
      los.lastCheckResult = {
        hasWon,
        prize,
        drawDate: draw.drawDate,
        checkedAt: new Date(),
      }
      await los.save()

      // Send notification
      const sent = await notifyUser({
        userId: los.userId.toString(),
        type: hasWon ? 'gewinn' : 'kein-gewinn',
        losNummer: los.losNummer,
        prize: prize || undefined,
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
