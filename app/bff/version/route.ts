import { NextResponse } from "next/server"

const GIT_COMMIT = process.env.GIT_COMMIT ?? "?"

export async function GET() {
  return NextResponse.json({ version: GIT_COMMIT })
}
