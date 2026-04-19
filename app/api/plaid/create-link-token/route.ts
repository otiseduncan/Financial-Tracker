export const dynamic = "force-dynamic"

import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { plaidClient } from "@/lib/plaid"
import { NextRequest, NextResponse } from "next/server"
import { Products, CountryCode } from "plaid"

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const response = await plaidClient.linkTokenCreate({
      user: { client_user_id: session.user.id },
      client_name: "Duncan Finance",
      products: [Products.Transactions],
      country_codes: [CountryCode.Us],
      language: "en",
    })

    return NextResponse.json({ link_token: response.data.link_token })
  } catch (error: any) {
    const plaidError = error?.response?.data
    console.error("Plaid link token error:", plaidError || error)
    return NextResponse.json({ 
      error: plaidError?.error_message || error?.message || "Failed to create link token",
      code: plaidError?.error_code || "UNKNOWN",
      type: plaidError?.error_type || "UNKNOWN"
    }, { status: 500 })
  }
}
