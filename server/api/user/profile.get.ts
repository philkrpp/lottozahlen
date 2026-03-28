export default defineEventHandler((event) => {
  const user = event.context.user
  return {
    name: user.name || '',
    email: user.email || '',
    createdAt: user.createdAt || null,
  }
})
