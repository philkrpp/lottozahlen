import type { Document } from 'mongoose'

export async function checkLosAgainstDraw(
  losNummer: string,
  anbieter: string,
  losTyp: string,
  draw: Document & { drawDate: Date; results: { winningNumbers: string[]; additionalData: any } },
): Promise<{
  hasWon: boolean
  prize: string | null
  prizeAmount: number | null
}> {
  // ============================================
  // TODO: API-Call-Logik hier einfuegen
  //
  // Erwartetes Verhalten:
  // 1. API-Request an den Anbieter mit losNummer + Ziehungsdatum
  // 2. Response parsen
  // 3. Gewinn-Status zurueckgeben
  // ============================================

  console.warn('[losChecker] Placeholder – API-Call noch nicht implementiert')
  return { hasWon: false, prize: null, prizeAmount: null }
}
