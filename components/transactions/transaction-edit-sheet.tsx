"use client"

import { useCallback, useEffect, useState } from "react"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet"
import { Loader2, DollarSign } from "lucide-react"

interface Account {
  id: string
  name: string
}

interface Category {
  id: string
  name: string
}

interface TransactionData {
  id: string
  amount: number
  merchant: string | null
  description: string
  direction: string
  postedAt: string
  accountId: string
  categoryId: string | null
  notes: string | null
}

interface Props {
  transaction: TransactionData | null
  open: boolean
  onClose: () => void
  onSaved: () => void
}

const inputClass =
  "w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"

export function TransactionEditSheet({ transaction, open, onClose, onSaved }: Props) {
  const [accounts, setAccounts] = useState<Account[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")

  const [amount, setAmount] = useState("")
  const [merchant, setMerchant] = useState("")
  const [description, setDescription] = useState("")
  const [direction, setDirection] = useState("expense")
  const [date, setDate] = useState("")
  const [accountId, setAccountId] = useState("")
  const [categoryId, setCategoryId] = useState("")
  const [notes, setNotes] = useState("")

  const isNew = !transaction

  useEffect(() => {
    fetch("/api/accounts").then(r => r.json()).then(d => setAccounts(d.accounts || []))
    fetch("/api/categories").then(r => r.json()).then(d => setCategories(d.categories || []))
  }, [])

  useEffect(() => {
    if (transaction) {
      setAmount(transaction.amount.toString())
      setMerchant(transaction.merchant || "")
      setDescription(transaction.description)
      setDirection(transaction.direction)
      setDate(new Date(transaction.postedAt).toISOString().split("T")[0])
      setAccountId(transaction.accountId)
      setCategoryId(transaction.categoryId || "")
      setNotes(transaction.notes || "")
    } else {
      setAmount("")
      setMerchant("")
      setDescription("")
      setDirection("expense")
      setDate(new Date().toISOString().split("T")[0])
      setAccountId("")
      setCategoryId("")
      setNotes("")
    }
    setError("")
  }, [transaction, open])

  const handleSave = useCallback(async () => {
    if (!amount || !accountId) {
      setError("Amount and account are required")
      return
    }
    setSaving(true)
    setError("")
    try {
      const payload = {
        amount,
        merchant: merchant || null,
        description: description || merchant || "Transaction",
        direction,
        date,
        accountId,
        categoryId: categoryId || null,
        notes: notes || null,
      }

      const url = isNew ? "/api/transactions" : `/api/transactions/${transaction.id}`
      const method = isNew ? "POST" : "PUT"

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const data = await res.json()
        setError(data.error || "Save failed")
        return
      }

      onSaved()
      onClose()
    } catch {
      setError("Network error")
    } finally {
      setSaving(false)
    }
  }, [amount, merchant, description, direction, date, accountId, categoryId, notes, isNew, transaction, onSaved, onClose])

  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent side="right" className="overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{isNew ? "New Transaction" : "Edit Transaction"}</SheetTitle>
          <SheetDescription>
            {isNew ? "Add a manual transaction" : "Modify transaction details"}
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-4 mt-6">
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">Amount *</label>
            <div className="relative">
              <DollarSign className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <input
                type="number"
                step="0.01"
                min="0.01"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className={`${inputClass} pl-8`}
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">Type *</label>
            <select value={direction} onChange={(e) => setDirection(e.target.value)} className={inputClass}>
              <option value="expense">Expense</option>
              <option value="income">Income</option>
              <option value="transfer">Transfer</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">Merchant</label>
            <input
              type="text"
              placeholder="Store / payee name"
              value={merchant}
              onChange={(e) => setMerchant(e.target.value)}
              className={inputClass}
            />
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">Description</label>
            <input
              type="text"
              placeholder="Transaction description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className={inputClass}
            />
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className={inputClass}
            />
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">Account *</label>
            <select value={accountId} onChange={(e) => setAccountId(e.target.value)} className={inputClass}>
              <option value="">Select account</option>
              {accounts.map((a) => (
                <option key={a.id} value={a.id}>{a.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">Category</label>
            <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className={inputClass}>
              <option value="">Uncategorized</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">Notes</label>
            <textarea
              placeholder="Optional notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className={inputClass}
            />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <div className="flex gap-2 pt-2">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex-1 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {saving ? <><Loader2 className="h-4 w-4 animate-spin" /> Saving...</> : isNew ? "Create" : "Save Changes"}
            </button>
            <button
              onClick={onClose}
              className="rounded-md border border-input bg-background px-4 py-2 text-sm font-medium hover:bg-accent"
            >
              Cancel
            </button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
