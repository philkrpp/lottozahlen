export default defineNuxtRouteMiddleware(async (to) => {
  const { useSession } = useAuth()
  const { data: session, isPending } = useSession()

  // Wait for session to load
  if (isPending.value) {
    await new Promise<void>((resolve) => {
      const unwatch = watch(isPending, (val) => {
        if (!val) {
          unwatch()
          resolve()
        }
      })
    })
  }

  if (!session.value?.user) {
    return navigateTo('/login')
  }
})
