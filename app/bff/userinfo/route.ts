import * as oasis from "@navikt/oasis"
import { headers } from "next/headers"
import { NextRequest, NextResponse } from "next/server"

const MILJO = process.env.MILJO ?? "local"

export async function GET(_req: NextRequest) {
  if (MILJO === "local") {
    return new NextResponse(null, { status: 204 })
  }

  const headersList = await headers()
  const authorization = headersList.get("authorization")
  const token = authorization?.startsWith("Bearer ") ? authorization.slice(7) : null

  if (!token) {
    return NextResponse.json({ message: "No token found" }, { status: 401 })
  }

  const result = oasis.parseAzureUserToken(token)
  if (!result.ok) {
    return NextResponse.json({ message: "Unable to parse user token" }, { status: 500 })
  }

  if (!result.name || !result.name.includes(", ")) {
    return NextResponse.json({ message: "Invalid name in supplied token" }, { status: 500 })
  }

  const [lastName, firstName] = result.name.split(", ")
  return NextResponse.json({
    fullnameInverted: result.name,
    fullname: `${firstName} ${lastName}`,
    firstName,
    lastName,
    email: result.preferred_username,
  })
}
