export const dynamic = "force-dynamic"

import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { plaidClient } from "@/lib/plaid"
import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    const userId = session.user.id

    const { plaidItemId } = await req.json()

    const plaidItem = await prisma.plaidItem.findFirst({
      where: { id: plaidItemId, userId: userId },
    })
    if (!plaidItem) {
      return NextResponse.json({ error: "Not found" }, { status: 404 })
    }

    // Use transactions sync for incremental updates
    let cursor = plaidItem.cursor || undefined
    let added: any[] = []
    let modified: any[] = []
    let removed: any[] = []
    let hasMore = true

    while (hasMore) {
      const response = await plaidClient.transactionsSync({
        access_token: plaidItem.accessToken,
        cursor,
      })
      const data = response.data
      added = added.concat(data.added)
      modified = modified.concat(data.modified)
      removed = removed.concat(data.removed)
      hasMore = data.has_more
      cursor = data.next_cursor
    }

    // Ensure a FinancialAccount exists for each Plaid account
    const plaidAccountIds = new Set<string>()
    for (const tx of [...added, ...modified]) {
      plaidAccountIds.add(tx.account_id)
    }

    const accountMap: Record<string, string> = {}
    for (const plaidAccId of plaidAccountIds) {
      // Check if we already have a financial account linked to this plaid account
      let fa = await prisma.financialAccount.findFirst({
        where: { userId: userId, externalId: plaidAccId },
      })
      if (!fa) {
        // Fetch account info from Plaid
        const accResponse = await plaidClient.accountsGet({
          access_token: plaidItem.accessToken,
        })
        const plaidAcc = accResponse.data.accounts.find((a) => a.account_id === plaidAccId)
        fa = await prisma.financialAccount.create({
          data: {
            userId: userId,
            name: plaidAcc?.name || plaidAcc?.official_name || "Plaid Account",
            type: mapAccountType(plaidAcc?.type || "other"),
            balance: 0,
            externalId: plaidAccId,
          },
        })
      }
      accountMap[plaidAccId] = fa.id
    }

    // Insert new transactions
    let created = 0
    for (const tx of added) {
      const accountId = accountMap[tx.account_id]
      if (!accountId) continue

      // Deduplicate by plaid transaction_id
      const exists = await prisma.transaction.findFirst({
        where: { userId: userId, sourceRecordId: tx.transaction_id },
      })
      if (exists) continue

      const amount = Math.abs(tx.amount)
      const direction = tx.amount < 0 ? "income" : "expense" // Plaid: negative = money in

      // Try to match category
      let categoryId: string | null = null
      if (tx.personal_finance_category?.primary) {
        const cat = await prisma.category.findFirst({
          where: {
            name: { equals: tx.personal_finance_category.primary, mode: "insensitive" },
          },
        })
        if (cat) categoryId = cat.id
      }

      await prisma.transaction.create({
        data: {
          userId: userId,
          accountId,
          sourceType: "plaid",
          sourceRecordId: tx.transaction_id,
          postedAt: new Date(tx.date),
          transactionDate: new Date(tx.authorized_date || tx.date),
          amount,
          direction,
          merchant: tx.merchant_name || null,
          description: tx.name || "",
          originalRawDescription: tx.original_description || tx.name || "",
          categoryId,
          status: "new",
        },
      })
      created++
    }

    // Handle removed transactions
    let removedCount = 0
    for (const r of removed) {
      const result = await prisma.transaction.deleteMany({
        where: { userId: userId, sourceRecordId: r.transaction_id },
      })
      removedCount += result.count
    }

    // Update cursor
    await prisma.plaidItem.update({
      where: { id: plaidItem.id },
      data: { cursor, lastSynced: new Date() },
    })

    return NextResponse.json({ created, modified: modified.length, removed: removedCount })
  } catch (error: any) {
    console.error("Plaid sync error:", error?.response?.data || error)
    return NextResponse.json({ error: "Failed to sync transactions" }, { status: 500 })
  }
}

function mapAccountType(plaidType: string): "checking" | "savings" | "credit_card" | "investment" | "loan" {
  switch (plaidType) {
    case "depository": return "checking"
    case "credit": return "credit_card"
    case "loan": return "loan"
    case "investment": return "investment"
    default: return "checking"
  }
}
