const FIRST_DIGIT_TO_LOS_TYP: Record<string, string> = {
  '7': 'mega-los',
  '8': 'jahreslos',
  '9': 'dauerlos',
  '6': 'einzellos',
}

export function detectLosTypFromNummer(losNummer: string): string {
  const losTyp = FIRST_DIGIT_TO_LOS_TYP[losNummer[0]]
  if (!losTyp) {
    throw new Error(
      `Unbekannter Los-Typ für Losnummer "${losNummer}". Erste Ziffer "${losNummer[0]}" ist keinem Typ zugeordnet.`,
    )
  }
  return losTyp
}
