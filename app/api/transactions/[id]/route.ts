export const dynamic = "force-dynamic"

import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"

// PUT /api/transactions/[id] — update
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const existing = await prisma.transaction.findFirst({
      where: { id: params.id, userId: session.user.id },
    })
    if (!existing) {
      return NextResponse.json({ error: "Not found" }, { status: 404 })
    }

    const body = await req.json()
    const { amount, merchant, description, date, accountId, categoryId, direction, notes, status } = body

    const transaction = await prisma.transaction.update({
      where: { id: params.id },
      data: {
        ...(amount !== undefined && { amount: parseFloat(amount) }),
        ...(merchant !== undefined && { merchant }),
        ...(description !== undefined && { description }),
        ...(date !== undefined && { postedAt: new Date(date), transactionDate: new Date(date) }),
        ...(accountId !== undefined && { accountId }),
        ...(categoryId !== undefined && { categoryId: categoryId || null }),
        ...(direction !== undefined && { direction }),
        ...(notes !== undefined && { notes: notes || null }),
        ...(status !== undefined && { status }),
      },
      include: { category: true, account: true },
    })

    return NextResponse.json({ transaction })
  } catch (error) {
    console.error("Update transaction error:", error)
    return NextResponse.json({ error: "Failed" }, { status: 500 })
  }
}

// DELETE /api/transactions/[id]
export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const existing = await prisma.transaction.findFirst({
      where: { id: params.id, userId: session.user.id },
    })
    if (!existing) {
      return NextResponse.json({ error: "Not found" }, { status: 404 })
    }

    await prisma.transaction.delete({ where: { id: params.id } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Delete transaction error:", error)
    return NextResponse.json({ error: "Failed" }, { status: 500 })
  }
}
