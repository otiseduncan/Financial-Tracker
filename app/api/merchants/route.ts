export const dynamic = "force-dynamic"

import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const rows = await prisma.transaction.groupBy({
      by: ["merchant"],
      where: { userId: session.user.id, merchant: { not: null } },
      _count: { merchant: true },
      orderBy: { _count: { merchant: "desc" } },
      take: 50,
    })

    const merchants = rows
      .filter((r) => r.merchant)
      .map((r) => r.merchant as string)

    return NextResponse.json({ merchants })
  } catch (error) {
    console.error("Merchants error:", error)
    return NextResponse.json({ error: "Failed to fetch merchants" }, { status: 500 })
  }
}
