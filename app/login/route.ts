import { NextRequest, NextResponse } from "next/server"

const LOGIN_URL = process.env.LOGIN_URL ?? ""

export async function GET(req: NextRequest) {
  const referer = req.nextUrl.searchParams.get("referer") ?? "/"
  const target = new URL(LOGIN_URL)
  target.searchParams.set("redirect", referer)

  return NextResponse.redirect(target.href, {
    headers: { Referer: referer },
  })
}
