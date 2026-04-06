import mongoose from 'mongoose'

const log = useO2Logger('mongodb')

let isConnected = false

export async function connectDB() {
  if (isConnected) return

  const config = useRuntimeConfig()
  const uri = config.mongodbUri

  if (!uri) {
    log.warn('Keine MONGODB_URI konfiguriert, überspringe Verbindung')
    return
  }

  try {
    await mongoose.connect(uri)
    isConnected = true
    log.info('Verbindung erfolgreich hergestellt')
  } catch (error) {
    log.error('Verbindung fehlgeschlagen', { error: String(error) })
    // Retry after 5 seconds
    setTimeout(() => {
      isConnected = false
      connectDB()
    }, 5000)
  }

  mongoose.connection.on('disconnected', () => {
    log.warn('Verbindung getrennt')
    isConnected = false
  })
}
