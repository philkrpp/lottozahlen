const log = useO2Logger('fernsehlotterie-api')
const BASE_URL = 'https://www.fernsehlotterie.de'

const SHARED_HEADERS: Record<string, string> = {
  Accept: '*/*',
  'Accept-Language': 'de-DE,de;q=0.9,en-US;q=0.8,en;q=0.7',
  Connection: 'keep-alive',
  'User-Agent':
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36',
  'sec-ch-ua': '"Chromium";v="146", "Not-A.Brand";v="24", "Google Chrome";v="146"',
  'sec-ch-ua-mobile': '?0',
  'sec-ch-ua-platform': '"macOS"',
  'Sec-Fetch-Dest': 'empty',
  'Sec-Fetch-Mode': 'cors',
  'Sec-Fetch-Site': 'same-origin',
}

export interface GewinnabfrageResponse {
  formData: { losnummer: string | null }
  displayData: {
    losnummer: string
    displayAsActive: boolean
    losStatusWebshop: number
    losArt: string
    ersteZiehung: {
      ziehungsarten: number[]
      ziehungen: { art: number; nummer: string | null }[]
      ziehungsdatum: string
    } | null
    letzteZiehung: {
      ziehungsarten: number[]
      ziehungen: { art: number; nummer: string | null }[]
      ziehungsdatum: string
    } | null
    naechsteZiehungen: {
      ziehungsarten: number[]
      ziehungen: { art: number; nummer: string | null }[]
      ziehungsdatum: string
    }[]
    gewinne: {
      gewinn: string
      gewinnArt: number
      gewinnzahl: string
      rang: number
      anzahlGewinner: number
    }[]
    hatGespielt: boolean
    istInBearbeitung: boolean
    kannUeberweisen: boolean
    canShowDrawings: boolean
    isJubilaeumsLos: boolean
    errors: unknown[]
    mandatories: unknown[]
    warnings: unknown[]
  }
  errors: unknown[]
  mandatories: unknown[]
  warnings: unknown[]
}

export interface ZiehungListItem {
  datum: string
  id: string
  ziehungArt: number
}

export interface ZiehungDetail {
  datum: string
  id: string
  ziehungArt: number
  maximalGewinn: number
  praefix: string
  gewinne: {
    anzahlGewinner: number
    gewinn: string
    gewinnArt: number
    gewinnzahl: string
    rang: number
  }[]
}

async function apiFetch(url: string, options: RequestInit = {}): Promise<Response> {
  const method = (options.method || 'GET').toUpperCase()
  const path = url.replace(BASE_URL, '')

  log.info(`→ ${method} ${path}`, { type: 'http-out', method, url })

  const start = Date.now()
  try {
    const res = await fetch(url, {
      ...options,
      headers: {
        ...SHARED_HEADERS,
        ...options.headers,
      },
    })

    const duration = Date.now() - start
    const contentLength = res.headers.get('content-length')
    const logFn = res.ok ? 'info' : 'error'

    log[logFn](`← ${method} ${path} ${res.status} (${duration}ms)`, {
      type: 'http-out',
      method,
      url,
      statusCode: res.status,
      duration,
      contentLength: contentLength ? Number(contentLength) : undefined,
    })

    return res
  } catch (error) {
    const duration = Date.now() - start
    log.error(`← ${method} ${path} NETWORK_ERROR (${duration}ms)`, {
      type: 'http-out',
      method,
      url,
      duration,
      error: String(error),
    })
    throw error
  }
}

export async function checkTicket(losnummer: string): Promise<GewinnabfrageResponse> {
  const res = await apiFetch(`${BASE_URL}/webshop/api/gewinnabfrage/gewinn-info`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Origin: BASE_URL,
      Referer: `${BASE_URL}/gewinnabfrage`,
    },
    body: JSON.stringify({ formData: { losnummer } }),
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Gewinnabfrage failed (${res.status}): ${text}`)
  }

  return res.json()
}

export async function fetchDrawList(): Promise<ZiehungListItem[]> {
  const res = await apiFetch(`${BASE_URL}/webshop/api/ziehung`, {
    method: 'GET',
    headers: {
      Referer: `${BASE_URL}/mitspielen-helfen/gewinnzahlen`,
    },
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Ziehungsliste failed (${res.status}): ${text}`)
  }

  return res.json()
}

export async function fetchDrawDetails(id: string): Promise<ZiehungDetail> {
  const res = await apiFetch(`${BASE_URL}/webshop/api/ziehung/${id}`, {
    method: 'GET',
    headers: {
      Referer: `${BASE_URL}/mitspielen-helfen/gewinnzahlen`,
    },
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Ziehungsdetails failed (${res.status}): ${text}`)
  }

  return res.json()
}
