import { consola } from 'consola'
import dayjs from 'dayjs'
import customParseFormat from 'dayjs/plugin/customParseFormat.js'
import Draw from '~~/server/models/Draw'
import { fetchDrawList, fetchDrawDetails } from './fernsehlotterieApi'

dayjs.extend(customParseFormat)

export const ZIEHUNG_ART_LABELS: Record<number, string> = {
  0: 'Sonderziehung',
  1: 'Wochenziehung',
  3: 'Mega-Los',
  4: 'Traumhauslos',
  5: 'Jubilaeumsziehung',
}

export async function fetchLatestDrawResults(_anbieter: string): Promise<
  {
    externalId: string
    drawDate: Date
    drawType: string
    results: {
      winningNumbers: string[]
      gewinne: {
        anzahlGewinner: number
        gewinn: string
        gewinnArt: number
        gewinnzahl: string
        rang: number
      }[]
    }
    rawResponse: unknown
  }[]
> {
  const drawList = await fetchDrawList()
  consola.info(`[drawFetcher] Fetched ${drawList.length} draws from API`)

  // Find which draws we don't have yet
  const existingIds = await Draw.find(
    { anbieter: 'deutsche-fernsehlotterie', externalId: { $in: drawList.map((d) => d.id) } },
    { externalId: 1 },
  ).lean()
  const existingIdSet = new Set(existingIds.map((d) => d.externalId))

  const newDraws = drawList.filter((d) => !existingIdSet.has(d.id))
  consola.info(`[drawFetcher] ${newDraws.length} new draws to fetch`)

  const results = []
  for (const draw of newDraws) {
    try {
      const details = await fetchDrawDetails(draw.id)
      const drawDate = dayjs(draw.datum, 'DD.MM.YYYY').toDate()

      results.push({
        externalId: draw.id,
        drawDate,
        drawType: String(draw.ziehungArt),
        results: {
          winningNumbers: details.gewinne.map((g) => g.gewinnzahl),
          gewinne: details.gewinne,
        },
        rawResponse: details,
      })
    } catch (error) {
      consola.error(`[drawFetcher] Error fetching draw ${draw.id}:`, error)
    }
  }

  return results
}
