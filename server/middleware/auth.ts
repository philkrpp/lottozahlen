import { auth } from '~~/server/utils/auth'

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

  const session = await auth.api.getSession({ headers: event.headers })

  if (!session) {
    throw createError({ statusCode: 401, message: 'Nicht authentifiziert' })
  }

  event.context.user = session.user
  event.context.session = session.session
})
