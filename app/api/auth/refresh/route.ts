import { type NextRequest, NextResponse } from "next/server"
import { refreshToken } from "@/lib/auth-actions"

export async function POST(request: NextRequest) {
  const { token } = await request.json()
  const result = await refreshToken(token)

  return NextResponse.json(result)
}

