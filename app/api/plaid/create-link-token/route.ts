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
    console.error("Plaid link token error:", error?.response?.data || error)
    return NextResponse.json({ error: "Failed to create link token" }, { status: 500 })
  }
}
