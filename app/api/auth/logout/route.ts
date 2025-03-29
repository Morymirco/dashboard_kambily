import { NextResponse } from "next/server"
import { logout } from "@/lib/auth-actions"

export async function POST() {
  const result = await logout()
  return NextResponse.json(result)
}

