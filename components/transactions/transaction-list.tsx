"use client"

import { useCallback, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowUpRight, ArrowDownRight, Pencil, Trash2, Plus, Loader2 } from "lucide-react"
import { TransactionEditSheet } from "@/components/transactions/transaction-edit-sheet"

interface Transaction {
  id: string
  amount: number
  merchant: string | null
  description: string
  direction: string
  postedAt: string
  accountId: string
  categoryId: string | null
  notes: string | null
  category: { id: string; name: string } | null
  account: { id: string; name: string }
}

export function TransactionList() {
  const router = useRouter()
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [editTx, setEditTx] = useState<Transaction | null>(null)
  const [sheetOpen, setSheetOpen] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const fetchTransactions = useCallback(async () => {
    try {
      const res = await fetch("/api/transactions")
      const data = await res.json()
      setTransactions(data.transactions || [])
    } catch (error) {
      console.error("Failed to fetch transactions:", error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchTransactions() }, [fetchTransactions])

  const handleEdit = (tx: Transaction) => {
    setEditTx(tx)
    setSheetOpen(true)
  }

  const handleNew = () => {
    setEditTx(null)
    setSheetOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this transaction?")) return
    setDeletingId(id)
    try {
      const res = await fetch(`/api/transactions/${id}`, { method: "DELETE" })
      if (res.ok) {
        setTransactions((prev) => prev.filter((t) => t.id !== id))
        router.refresh()
      }
    } catch (error) {
      console.error("Delete failed:", error)
    } finally {
      setDeletingId(null)
    }
  }

  const handleSaved = () => {
    fetchTransactions()
    router.refresh()
  }

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Transactions</h1>
          <p className="text-muted-foreground">
            {transactions.length} transaction{transactions.length !== 1 ? "s" : ""}
          </p>
        </div>
        <button
          onClick={handleNew}
          className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" />
          Add Transaction
        </button>
      </div>

      <Card>
        <CardContent className="p-0">
          {transactions.length === 0 ? (
            <p className="p-6 text-sm text-muted-foreground">
              No transactions yet. Click &quot;Add Transaction&quot; or upload a receipt.
            </p>
          ) : (
            <div className="divide-y">
              {transactions.map((tx) => (
                <div key={tx.id} className="flex items-center justify-between p-4 group hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div
                      className={`rounded-full p-2 shrink-0 ${
                        tx.direction === "income"
                          ? "bg-green-100 text-green-600"
                          : "bg-red-100 text-red-600"
                      }`}
                    >
                      {tx.direction === "income" ? (
                        <ArrowUpRight className="h-4 w-4" />
                      ) : (
                        <ArrowDownRight className="h-4 w-4" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium truncate">{tx.merchant || tx.description}</p>
                      <p className="text-xs text-muted-foreground">
                        {tx.category?.name || "Uncategorized"} &bull; {tx.account.name} &bull;{" "}
                        {new Date(tx.postedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <p
                      className={`font-semibold ${
                        tx.direction === "income" ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {tx.direction === "income" ? "+" : "-"}$
                      {tx.amount.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                    </p>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleEdit(tx)}
                        className="rounded-md p-1.5 hover:bg-accent text-muted-foreground hover:text-foreground"
                        title="Edit"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(tx.id)}
                        disabled={deletingId === tx.id}
                        className="rounded-md p-1.5 hover:bg-red-100 text-muted-foreground hover:text-red-600 disabled:opacity-50"
                        title="Delete"
                      >
                        {deletingId === tx.id ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <Trash2 className="h-3.5 w-3.5" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <TransactionEditSheet
        transaction={editTx}
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        onSaved={handleSaved}
      />
    </>
  )
}
