/**
 * drawType-Werte aus der Fernsehlotterie-API:
 *   "0" = Sonderziehung
 *   "1" = Wochenziehung
 *   "3" = Mega-Los
 *   "4" = Traumhauslos
 *   "5" = Jubilaeumsziehung
 */
const DRAW_TYPE_COMPATIBLE_LOS_TYPES: Record<string, string[]> = {
  '0': ['jahreslos', 'dauerlos', 'einzellos'],
  '1': ['jahreslos', 'dauerlos', 'einzellos'],
  '3': ['mega-los'],
  '4': ['jahreslos', 'dauerlos', 'einzellos'],
  '5': ['jahreslos', 'dauerlos', 'einzellos'],
}

export function getCompatibleLosTypesForDraw(drawType: string): string[] {
  return DRAW_TYPE_COMPATIBLE_LOS_TYPES[drawType] ?? []
}
