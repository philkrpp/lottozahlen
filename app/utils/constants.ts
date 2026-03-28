export const ANBIETER = {
  'deutsche-fernsehlotterie': {
    name: 'Deutsche Fernsehlotterie',
    slug: 'deutsche-fernsehlotterie',
    logo: '/images/anbieter/deutsche-fernsehlotterie.svg',
    losTypen: [
      { value: 'mega-los', label: 'Mega-Los', nummerFormat: /^\d{7,12}$/ },
      { value: 'jahreslos', label: 'Jahreslos', nummerFormat: /^\d{7,12}$/ },
      { value: 'dauerlos', label: 'Dauerlos', nummerFormat: /^\d{7,12}$/ },
      { value: 'einzellos', label: 'Einzellos', nummerFormat: /^\d{7,12}$/ },
    ],
    ziehungsTermine: {
      beschreibung: 'Ziehungen finden an festgelegten Terminen statt (siehe Website)',
    },
  },
} as const

export type AnbieterSlug = keyof typeof ANBIETER
export type LosTypValue = (typeof ANBIETER)[AnbieterSlug]['losTypen'][number]['value']

export const ANBIETER_LIST = Object.values(ANBIETER)
export const ANBIETER_SLUGS = Object.keys(ANBIETER) as AnbieterSlug[]
