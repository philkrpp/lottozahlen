import { Cron } from 'croner'
import { checkDrawResults } from './checkDrawResults'

const log = useO2Logger('cron')

export function registerCronJobs(): void {
  // Check draw results every Sunday at 20:15 (after both 18:00 and 20:00 draws)
  new Cron('15 20 * * 0', { timezone: 'Europe/Berlin' }, async () => {
    log.info('Sonntags-Cron ausgelöst')
    await checkDrawResults()
  })

  log.info('Cron-Jobs registriert: Sonntag 20:15 (Europe/Berlin)')
}
