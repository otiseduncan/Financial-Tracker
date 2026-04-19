export const dynamic = "force-dynamic"

import { getToken } from "next-auth/jwt"
import { plaidClient } from "@/lib/plaid"
import { NextRequest, NextResponse } from "next/server"
import { Products, CountryCode } from "plaid"

export async function POST(req: NextRequest) {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })
    if (!token?.sub) {
      return NextResponse.json({ error: "Unauthorized", debug: { hasSecret: !!process.env.NEXTAUTH_SECRET, url: process.env.NEXTAUTH_URL } }, { status: 401 })
    }

    const response = await plaidClient.linkTokenCreate({
      user: { client_user_id: token.sub },
      client_name: "Duncan Finance",
      products: [Products.Transactions],
      country_codes: [CountryCode.Us],
      language: "en",
    })

    return NextResponse.json({ link_token: response.data.link_token })
  } catch (error: any) {
    console.error("Plaid link token error:", error?.response?.data || error)
    return NextResponse.json({ error: "Failed to create link token" }, { status: 500 })
  }
}
