import cron from 'node-cron'
import { consola } from 'consola'
import { checkDrawResults } from './checkDrawResults'

export function registerCronJobs(): void {
  // Check draw results daily at 08:00
  cron.schedule('0 8 * * *', async () => {
    consola.info('[Cron] Running daily draw check...')
    await checkDrawResults()
  })

  consola.success('[Cron] Jobs registered: daily draw check at 08:00')
}
