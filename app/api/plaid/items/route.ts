import { getToken } from "next-auth/jwt"
import { plaidClient } from "@/lib/plaid"
import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"

export async function GET(req: NextRequest) {
  try {
    const token = await getToken({ req })
    if (!token?.sub) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    const userId = token.sub

    const items = await prisma.plaidItem.findMany({
      where: { userId },
      select: {
        id: true,
        institutionName: true,
        institutionId: true,
        status: true,
        lastSynced: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json({ items })
  } catch (error) {
    console.error("List plaid items error:", error)
    return NextResponse.json({ error: "Failed to list connections" }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const token = await getToken({ req })
    if (!token?.sub) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    const userId = token.sub

    const { plaidItemId } = await req.json()
    const item = await prisma.plaidItem.findFirst({
      where: { id: plaidItemId, userId },
    })
    if (!item) {
      return NextResponse.json({ error: "Not found" }, { status: 404 })
    }

    try {
      await plaidClient.itemRemove({ access_token: item.accessToken })
    } catch {
    }

    await prisma.plaidItem.delete({ where: { id: item.id } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Remove plaid item error:", error)
    return NextResponse.json({ error: "Failed to remove connection" }, { status: 500 })
  }
}