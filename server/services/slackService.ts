const log = useLogger('slack')

interface SlackBlock {
  type: string
  text?: { type: string; text: string; emoji?: boolean }
  elements?: { type: string; text: string }[]
  fields?: { type: string; text: string }[]
}

function resolveWebhookUrl(url: string): string {
  if (url.startsWith('slack://')) {
    const path = url.replace('slack://', '')
    return `https://hooks.slack.com/services/${path}`
  }
  return url
}

export async function sendSlackNotification(
  webhookUrl: string,
  blocks: SlackBlock[],
): Promise<boolean> {
  const resolvedUrl = resolveWebhookUrl(webhookUrl)
  log.info('→ POST Slack-Webhook', { type: 'http-out', method: 'POST' })

  const start = Date.now()
  try {
    const response = await fetch(resolvedUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ blocks }),
    })

    const duration = Date.now() - start

    if (!response.ok) {
      log.error(`← POST Slack-Webhook ${response.status} (${duration}ms)`, { type: 'http-out', method: 'POST', statusCode: response.status, duration })
      return false
    }

    log.info(`← POST Slack-Webhook ${response.status} (${duration}ms)`, { type: 'http-out', method: 'POST', statusCode: response.status, duration })
    return true
  } catch (error) {
    const duration = Date.now() - start
    log.error(`← POST Slack-Webhook NETWORK_ERROR (${duration}ms)`, { type: 'http-out', method: 'POST', duration, error: String(error) })
    return false
  }
}

export function gewinnBlocks(losNummer: string, prize: string, drawDate: string): SlackBlock[] {
  const appUrl = process.env.NUXT_PUBLIC_APP_URL || 'http://localhost:3000'
  return [
    {
      type: 'header',
      text: { type: 'plain_text', text: '🎉 Gewinn-Benachrichtigung!', emoji: true },
    },
    {
      type: 'section',
      fields: [
        { type: 'mrkdwn', text: `*Losnummer:*\n\`${losNummer}\`` },
        { type: 'mrkdwn', text: `*Gewinn:*\n${prize}` },
      ],
    },
    { type: 'section', text: { type: 'mrkdwn', text: `Ziehung vom *${drawDate}*` } },
    { type: 'divider' },
    {
      type: 'context',
      elements: [{ type: 'mrkdwn', text: `📊 <${appUrl}/dashboard|Zum Dashboard>` }],
    },
  ]
}

export function keinGewinnBlocks(losNummer: string, drawDate: string): SlackBlock[] {
  return [
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `Dein Los \`${losNummer}\` hat bei der Ziehung vom *${drawDate}* leider nicht gewonnen. 🍀 Nächstes Mal!`,
      },
    },
  ]
}

export function neueZiehungBlocks(anbieter: string, drawDate: string): SlackBlock[] {
  const appUrl = process.env.NUXT_PUBLIC_APP_URL || 'http://localhost:3000'
  return [
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `📢 Neue Ziehungsergebnisse für *${anbieter}* vom *${drawDate}* verfügbar!`,
      },
    },
    {
      type: 'context',
      elements: [{ type: 'mrkdwn', text: `📊 <${appUrl}/dashboard/ziehungen|Ergebnisse ansehen>` }],
    },
  ]
}
