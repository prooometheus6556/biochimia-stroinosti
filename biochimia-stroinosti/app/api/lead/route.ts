import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { name, telegram, email, goal } = await request.json()

    const botToken = process.env.TELEGRAM_BOT_TOKEN
    const chatId = process.env.TELEGRAM_CHAT_ID

    console.log('=== LEAD API ===')
    console.log('botToken:', botToken ? 'SET' : 'NOT SET')
    console.log('chatId:', chatId ? 'SET' : 'NOT SET')
    console.log('================')

    if (!botToken || !chatId) {
      return NextResponse.json(
        { error: 'Telegram not configured', botToken: !!botToken, chatId: !!chatId },
        { status: 500 }
      )
    }

    const goalLabels: Record<string, string> = {
      weight_loss: 'Похудение',
      energy: 'Повышение энергии',
      nutrition: 'Здоровое питание',
      health: 'Общее здоровье',
    }

    const message = `🔥 Новая заявка

👤 Имя: ${name}
📱 Telegram: ${telegram}
📧 Email: ${email || 'не указан'}
🎯 Цель: ${goalLabels[goal] || goal}

⏰ ${new Date().toLocaleString('ru-RU', { timeZone: 'Europe/Moscow' })}`

    const response = await fetch(
      `https://api.telegram.org/bot${botToken}/sendMessage`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text: message,
          parse_mode: 'HTML',
        }),
      }
    )

    const result = await response.json()

    if (!result.ok) {
      console.error('Telegram error:', result)
      return NextResponse.json(
        { error: 'Failed to send message' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Lead API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
