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

    const receipts = await prisma.receipt.findMany({
      where: { userId: session.user.id },
      include: { transaction: { include: { account: true } } },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json({ receipts })
  } catch (error) {
    console.error("List receipts error:", error)
    return NextResponse.json({ error: "Failed to fetch receipts" }, { status: 500 })
  }
}
