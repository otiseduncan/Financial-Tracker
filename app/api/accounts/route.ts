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

    const accounts = await prisma.financialAccount.findMany({
      where: { userId: session.user.id, status: "active" },
      select: { id: true, name: true, type: true },
      orderBy: { name: "asc" },
    })

    return NextResponse.json({ accounts })
  } catch (error) {
    console.error("Accounts list error:", error)
    return NextResponse.json({ error: "Failed to fetch accounts" }, { status: 500 })
  }
}
