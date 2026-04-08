import { NextRequest, NextResponse } from "next/server"

type LogLevel = "error" | "warn" | "info"

export async function POST(req: NextRequest) {
  const { level, message } = (await req.json()) as { level: LogLevel; message: string }

  const validLevels: LogLevel[] = ["error", "warn", "info"]
  if (!validLevels.includes(level)) {
    return NextResponse.json({ message: "Invalid log level" }, { status: 400 })
  }

  // Log to stdout in JSON format for NAIS log collection
  const logEntry = JSON.stringify({ level, message, timestamp: new Date().toISOString() })
  console.log(logEntry)

  return new NextResponse(null, { status: 204 })
}
