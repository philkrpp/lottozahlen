export default defineNuxtRouteMiddleware(async (_to) => {
  // Skip during SSR to avoid self-request deadlock
  if (import.meta.server) return

  const { data: session } = await useAuth().getSession()

  if (!session?.user) {
    return navigateTo('/login')
  }

  if (!session.user.emailVerified) {
    return navigateTo({ path: '/verify-email', query: { email: session.user.email } })
  }
})
