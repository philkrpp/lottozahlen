import mongoose from 'mongoose'
import { consola } from 'consola'

let isConnected = false

export async function connectDB() {
  if (isConnected) return

  const config = useRuntimeConfig()
  const uri = config.mongodbUri

  if (!uri) {
    consola.warn('[MongoDB] No MONGODB_URI configured, skipping connection')
    return
  }

  try {
    await mongoose.connect(uri)
    isConnected = true
    consola.success('[MongoDB] Connected successfully')
  } catch (error) {
    consola.error('[MongoDB] Connection failed:', error)
    // Retry after 5 seconds
    setTimeout(() => {
      isConnected = false
      connectDB()
    }, 5000)
  }

  mongoose.connection.on('disconnected', () => {
    consola.warn('[MongoDB] Disconnected')
    isConnected = false
  })
}
