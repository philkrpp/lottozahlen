import { getAuth } from '~~/server/utils/auth'

const log = useO2Logger('auth')

export default defineEventHandler(async (event) => {
  const url = getRequestURL(event)

  // Skip auth routes and health check
  if (url.pathname.startsWith('/api/auth') || url.pathname === '/api/health') {
    return
  }

  // Only protect API routes
  if (!url.pathname.startsWith('/api/')) {
    return
  }

  const session = await getAuth().api.getSession({ headers: event.headers })

  if (!session) {
    const ip = getHeader(event, 'x-forwarded-for') || getHeader(event, 'x-real-ip') || ''
    log.warn('Auth fehlgeschlagen', { path: url.pathname, ip })
    throw createError({ statusCode: 401, message: 'Nicht authentifiziert' })
  }

  event.context.user = session.user
  event.context.session = session.session
  log.debug('Auth erfolgreich', { userId: session.user.id, path: url.pathname })
})
