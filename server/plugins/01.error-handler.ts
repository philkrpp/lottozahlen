export default defineNitroPlugin((nitroApp) => {
  const log = useLogger('nitro')

  // --- Unhandled Errors in Nitro ---
  nitroApp.hooks.hook('error', (error, { event }) => {
    const url = event ? getRequestURL(event).pathname : 'unknown'
    const method = event ? getMethod(event) : 'unknown'

    log.error(`Server Error: ${error.message}`, {
      path: url,
      method,
      stack: error.stack || '',
      name: error.name,
      type: 'unhandled_error',
    })
  })

  // --- Process-Level Errors ---
  process.on('unhandledRejection', (reason: any) => {
    log.fatal(`Unhandled Rejection: ${reason?.message || reason}`, {
      stack: reason?.stack || '',
      type: 'unhandled_rejection',
    })
  })

  process.on('uncaughtException', (error) => {
    log.fatal(`Uncaught Exception: ${error.message}`, {
      stack: error.stack || '',
      type: 'uncaught_exception',
    })
  })

  // --- Graceful Shutdown: Logs flushen vor dem Beenden ---
  nitroApp.hooks.hook('close', async () => {
    log.info('Server wird heruntergefahren — Logs werden geflusht.')
    await flushLogs()
  })
})
