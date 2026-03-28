import { consola } from 'consola'
import { checkTicket } from './fernsehlotterieApi'

function parseGewinnBetrag(gewinnStr: string): number | null {
  // "5.000,00 Euro" -> 5000
  const match = gewinnStr.match(/([\d.]+),(\d{2})\s*Euro/)
  if (!match?.[1] || !match[2]) return null
  const integerPart = match[1].replace(/\./g, '')
  const decimalPart = match[2]
  return parseFloat(`${integerPart}.${decimalPart}`)
}

export async function checkLosAgainstDraw(
  losNummer: string,
  _anbieter: string,
  _losTyp: string,
  _draw?: unknown,
): Promise<{
  hasWon: boolean
  prize: string | null
  prizeAmount: number | null
  rawApiResponse?: unknown
}> {
  try {
    const response = await checkTicket(losNummer)

    const gewinne = response.displayData?.gewinne ?? []
    if (gewinne.length === 0) {
      return { hasWon: false, prize: null, prizeAmount: null, rawApiResponse: response }
    }

    // Aggregate all wins
    const prizes = gewinne.map((g) => g.gewinn)
    const totalAmount = gewinne.reduce((sum, g) => {
      const amount = parseGewinnBetrag(g.gewinn)
      return sum + (amount ?? 0)
    }, 0)

    return {
      hasWon: true,
      prize: prizes.join(', '),
      prizeAmount: totalAmount > 0 ? totalAmount : null,
      rawApiResponse: response,
    }
  } catch (error) {
    consola.error(`[losChecker] Error checking ${losNummer}:`, error)
    throw error
  }
}
