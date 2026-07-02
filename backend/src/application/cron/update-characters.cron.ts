import cron from 'node-cron'
import { CharacterUseCase } from '../../domain/character/character.use-case'

// Runs every 12 hours: minute 0, every 12 hours, any day/month/weekday
const EVERY_12_HOURS = '0 */12 * * *'

export function startCron(useCase: CharacterUseCase): void {
  cron.schedule(EVERY_12_HOURS, async () => {
    console.log('[Cron] Starting character sync from Rick & Morty API...')
    try {
      await useCase.syncFromApi()
      console.log('[Cron] Character sync completed successfully')
    } catch (error) {
      console.error('[Cron] Character sync failed:', error)
    }
  })

  console.log('[Cron] Character sync scheduled — runs every 12 hours')
}
