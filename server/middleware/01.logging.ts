export default defineEventHandler((event) => {
  const log = useO2Logger('http')
  const startTime = Date.now()
  const method = getMethod(event)
  const url = getRequestURL(event)

  // Nur API-Requests loggen, keine Assets
  if (url.pathname.startsWith('/_nuxt') || url.pathname.startsWith('/__nuxt')) return

  log.info(`→ ${method} ${url.pathname}`, {
    method,
    path: url.pathname,
    query: url.search || '',
    userAgent: getHeader(event, 'user-agent') || '',
    ip: getHeader(event, 'x-forwarded-for') || getHeader(event, 'x-real-ip') || '',
    type: 'request',
  })

  event.node.res.on('finish', () => {
    const duration = Date.now() - startTime
    const statusCode = event.node.res.statusCode
    const logFn = statusCode >= 500 ? 'error' : statusCode >= 400 ? 'warn' : 'info'

    log[logFn](`← ${method} ${url.pathname} ${statusCode} (${duration}ms)`, {
      method,
      path: url.pathname,
      statusCode,
      duration,
      type: 'response',
    })
  })
})
