// app/api/create-chat/route.ts
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { file_key, file_name } = body
    console.log('Received in API:', file_key, file_name)

    return NextResponse.json({ message: "success" })
  } catch (err) {
    console.error('API error:', err)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}
