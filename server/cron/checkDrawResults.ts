import { consola } from 'consola'
import Draw from '~~/server/models/Draw'
import { fetchLatestDrawResults } from '~~/server/services/drawFetcher'
import { notifyUsersForDraw } from './notifyUsers'

const ANBIETER_LIST = ['deutsche-fernsehlotterie']

export async function checkDrawResults(): Promise<void> {
  consola.info('[Cron] Checking draw results...')

  for (const anbieter of ANBIETER_LIST) {
    try {
      const results = await fetchLatestDrawResults(anbieter)

      for (const result of results) {
        // Check for duplicates
        const existing = await Draw.findOne({
          anbieter,
          drawDate: result.drawDate,
        })

        if (existing) continue

        // Save new draw
        const draw = await Draw.create({
          anbieter,
          ...result,
          fetchedAt: new Date(),
        })

        consola.success(`[Cron] New draw saved: ${anbieter} - ${result.drawDate}`)

        // Trigger user notifications
        await notifyUsersForDraw(draw)
      }
    } catch (error) {
      consola.error(`[Cron] Error checking ${anbieter}:`, error)
    }
  }
}
