export default defineNuxtPlugin(() => {
  const { umamiHost, umamiWebsiteId } = useRuntimeConfig().public
  if (!umamiHost || !umamiWebsiteId) return

  useHead({
    script: [
      {
        src: `${umamiHost}/script.js`,
        'data-website-id': umamiWebsiteId,
        async: true,
        defer: true,
      },
    ],
  })
})
