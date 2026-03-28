import mongoose from 'mongoose'

export default defineEventHandler(() => {
  const mongoState = mongoose.connection.readyState
  // 0 = disconnected, 1 = connected, 2 = connecting, 3 = disconnecting
  const isMongoHealthy = mongoState === 1

  if (!isMongoHealthy) {
    throw createError({
      statusCode: 503,
      statusMessage: 'Service Unavailable',
      data: {
        status: 'unhealthy',
        mongo: mongoState === 2 ? 'connecting' : 'disconnected',
        timestamp: new Date().toISOString(),
      },
    })
  }

  return {
    status: 'healthy',
    mongo: 'connected',
    timestamp: new Date().toISOString(),
  }
})
