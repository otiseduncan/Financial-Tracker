"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Loader2, FileText, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { format } from "date-fns"

interface Receipt {
  id: string
  imageUrl: string | null
  status: string
  merchantName: string | null
  totalAmount: string | null
  transactionDate: string | null
  transaction: {
    id: string
    amount: number
    account: { id: string; name: string }
  } | null
  createdAt: string
}

export function ReceiptsList() {
  const [receipts, setReceipts] = useState<Receipt[]>([])
  const [loading, setLoading] = useState(true)

  const [deleting, setDeleting] = useState<string | null>(null)

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this receipt?")) return
    setDeleting(id)
    try {
      const res = await fetch(`/api/receipts/${id}`, { method: "DELETE" })
      if (res.ok) setReceipts((prev) => prev.filter((r) => r.id !== id))
    } catch (error) {
      console.error("Failed to delete receipt:", error)
    } finally {
      setDeleting(null)
    }
  }

  const fetchReceipts = async () => {
    try {
      const res = await fetch("/api/receipts/list")
      const data = await res.json()
      setReceipts(data.receipts || [])
    } catch (error) {
      console.error("Failed to fetch receipts:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchReceipts()
    const interval = setInterval(fetchReceipts, 5000)
    return () => clearInterval(interval)
  }, [])

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (receipts.length === 0) {
    return <p className="text-sm text-muted-foreground">No receipts uploaded yet.</p>
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {receipts.map((receipt) => (
        <Card key={receipt.id}>
          <CardContent className="pt-4">
            {receipt.imageUrl && (
              <div className="aspect-video bg-muted rounded-md mb-3 overflow-hidden flex items-center justify-center">
                {receipt.imageUrl.endsWith(".pdf") ? (
                  <a href={receipt.imageUrl} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center gap-2 text-muted-foreground hover:text-primary transition-colors">
                    <FileText className="h-12 w-12" />
                    <span className="text-xs">View PDF</span>
                  </a>
                ) : (
                  <img
                    src={receipt.imageUrl}
                    alt="Receipt"
                    className="w-full h-full object-cover"
                  />
                )}
              </div>
            )}
            <div className="flex justify-between items-start mb-2">
              <p className="text-sm font-medium truncate">
                {receipt.merchantName || "Processing..."}
              </p>
              <span
                className={`text-xs rounded-full px-2 py-0.5 ${
                  receipt.status === "COMPLETED"
                    ? "bg-green-100 text-green-700"
                    : receipt.status === "FAILED"
                    ? "bg-red-100 text-red-700"
                    : "bg-yellow-100 text-yellow-700"
                }`}
              >
                {receipt.status.toLowerCase()}
              </span>
            </div>

            {receipt.totalAmount && (
              <p className="text-lg font-bold">
                ${parseFloat(receipt.totalAmount).toFixed(2)}
              </p>
            )}

            {receipt.transactionDate && (
              <p className="text-xs text-muted-foreground">
                {format(new Date(receipt.transactionDate), "PPP")}
              </p>
            )}

            <p className="text-xs text-muted-foreground mt-1">
              Uploaded {format(new Date(receipt.createdAt), "PPP")}
            </p>

            <div className="flex items-center justify-between mt-2">
              <div>
                {receipt.transaction ? (
                  <div>
                    <p className="text-xs text-green-600">✓ Linked to transaction</p>
                    <p className="text-xs text-muted-foreground">{receipt.transaction.account.name}</p>
                  </div>
                ) : receipt.status === "COMPLETED" ? (
                  <p className="text-xs text-orange-600">⚠️ Not linked to transaction</p>
                ) : null}
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0 text-muted-foreground hover:text-red-600"
                onClick={() => handleDelete(receipt.id)}
                disabled={deleting === receipt.id}
              >
                {deleting === receipt.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
