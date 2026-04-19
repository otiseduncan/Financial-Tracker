import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

// GET /api/transactions — list transactions
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const transactions = await prisma.transaction.findMany({
      where: { userId: session.user.id },
      orderBy: { postedAt: "desc" },
      include: { category: true, account: true },
    })

    return NextResponse.json({ transactions })
  } catch (error) {
    console.error("List transactions error:", error)
    return NextResponse.json({ error: "Failed" }, { status: 500 })
  }
}

// POST /api/transactions — create a transaction
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const { amount, merchant, description, date, accountId, categoryId, direction, notes } = body

    if (!amount || !accountId || !direction) {
      return NextResponse.json({ error: "Amount, account, and direction are required" }, { status: 400 })
    }

    const account = await prisma.financialAccount.findFirst({
      where: { id: accountId, userId: session.user.id },
    })
    if (!account) {
      return NextResponse.json({ error: "Invalid account" }, { status: 400 })
    }

    const txDate = date ? new Date(date) : new Date()

    const transaction = await prisma.transaction.create({
      data: {
        userId: session.user.id,
        accountId,
        sourceType: "manual",
        postedAt: txDate,
        transactionDate: txDate,
        amount: parseFloat(amount),
        direction,
        merchant: merchant || null,
        description: description || merchant || "Manual transaction",
        originalRawDescription: description || merchant || "Manual transaction",
        categoryId: categoryId || null,
        notes: notes || null,
        status: "reviewed",
      },
      include: { category: true, account: true },
    })

    return NextResponse.json({ transaction }, { status: 201 })
  } catch (error) {
    console.error("Create transaction error:", error)
    return NextResponse.json({ error: "Failed" }, { status: 500 })
  }
}
