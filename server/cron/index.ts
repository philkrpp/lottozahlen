import { Cron } from 'croner'
import { consola } from 'consola'
import { checkDrawResults } from './checkDrawResults'

export function registerCronJobs(): void {
  // Check draw results every Sunday at 20:15 (after both 18:00 and 20:00 draws)
  new Cron('15 20 * * 0', { timezone: 'Europe/Berlin' }, async () => {
    consola.info('[Cron] Running Sunday draw check...')
    await checkDrawResults()
  })

  consola.success('[Cron] Jobs registered: Sunday draw check at 20:15 (Europe/Berlin)')
}
