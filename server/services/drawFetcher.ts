export async function fetchLatestDrawResults(anbieter: string): Promise<
  {
    drawDate: Date
    drawType: string
    results: { winningNumbers: string[]; additionalData: any }
    rawResponse: any
  }[]
> {
  // ============================================
  // TODO: API-Call-Logik hier einfuegen
  // ============================================

  console.warn('[drawFetcher] Placeholder – API-Call noch nicht implementiert')
  return []
}
