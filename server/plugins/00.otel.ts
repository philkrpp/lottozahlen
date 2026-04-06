import { initOtel, shutdownOtel } from '../utils/otel'

// OTEL SDK muss vor allen anderen Plugins initialisiert werden
initOtel()

export default defineNitroPlugin((nitroApp) => {
  nitroApp.hooks.hook('close', async () => {
    await shutdownOtel()
  })
})
