import { getToken } from "next-auth/jwt"
import { plaidClient } from "@/lib/plaid"
import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
  try {
    const token = await getToken({ req })
    if (!token?.sub) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    const userId = token.sub

    const { public_token, institution } = await req.json()

    const exchangeResponse = await plaidClient.itemPublicTokenExchange({
      public_token,
    })

    const { access_token, item_id } = exchangeResponse.data

    await prisma.plaidItem.create({
      data: {
        userId,
        accessToken: access_token,
        itemId: item_id,
        institutionId: institution?.institution_id || null,
        institutionName: institution?.name || null,
      },
    })

    return NextResponse.json({ success: true, institutionName: institution?.name })
  } catch (error: any) {
    console.error("Plaid exchange error:", error?.response?.data || error)
    return NextResponse.json({ error: "Failed to exchange token" }, { status: 500 })
  }
}
