"use client"

import { useCallback, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Upload, Loader2, CheckCircle, AlertCircle, DollarSign } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface Account {
  id: string
  name: string
  type: string
}

export function ReceiptUploader() {
  const router = useRouter()
  const [accounts, setAccounts] = useState<Account[]>([])
  const [merchants, setMerchants] = useState<string[]>([])
  const [file, setFile] = useState<File | null>(null)
  const [dragOver, setDragOver] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [status, setStatus] = useState<{ type: "success" | "error"; message: string } | null>(null)

  // Form fields
  const [amount, setAmount] = useState("")
  const [merchant, setMerchant] = useState("")
  const [date, setDate] = useState(new Date().toISOString().split("T")[0])
  const [accountId, setAccountId] = useState("")

  useEffect(() => {
    fetch("/api/accounts")
      .then((r) => r.json())
      .then((data) => {
        setAccounts(data.accounts || [])
        if (data.accounts?.length) setAccountId(data.accounts[0].id)
      })
      .catch(console.error)
    fetch("/api/merchants")
      .then((r) => r.json())
      .then((data) => setMerchants(data.merchants || []))
      .catch(console.error)
  }, [])

  const handleFile = useCallback((f: File) => {
    setFile(f)
    setStatus(null)
    // Pre-fill merchant from filename (strip extension)
    const nameWithoutExt = f.name.replace(/\.[^.]+$/, "").replace(/[^a-zA-Z0-9 ]/g, " ").trim()
    if (!merchant) setMerchant(nameWithoutExt)
  }, [merchant])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const f = e.dataTransfer.files?.[0]
    if (f) handleFile(f)
  }, [handleFile])

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (f) handleFile(f)
    e.target.value = ""
  }, [handleFile])

  const handleSubmit = useCallback(async () => {
    if (!file || !amount || !accountId) return
    setUploading(true)
    setStatus(null)
    try {
      const formData = new FormData()
      formData.append("file", file)
      formData.append("amount", amount)
      formData.append("merchant", merchant)
      formData.append("date", date)
      formData.append("accountId", accountId)
      const res = await fetch("/api/receipts/upload", { method: "POST", body: formData })
      const data = await res.json()
      if (!res.ok) {
        setStatus({ type: "error", message: data.error || "Upload failed" })
      } else {
        setStatus({ type: "success", message: `Receipt uploaded & transaction created ($${parseFloat(amount).toFixed(2)})` })
        setFile(null)
        setAmount("")
        setMerchant("")
        setDate(new Date().toISOString().split("T")[0])
        router.refresh()
      }
    } catch {
      setStatus({ type: "error", message: "Network error" })
    } finally {
      setUploading(false)
    }
  }, [file, amount, merchant, date, accountId, router])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upload Receipt</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Drop zone */}
        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          className={`relative flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-6 transition-colors cursor-pointer ${
            dragOver ? "border-primary bg-primary/5" : file ? "border-green-500 bg-green-500/5" : "border-muted-foreground/25 hover:border-muted-foreground/50"
          }`}
          onClick={() => document.getElementById("receipt-file-input")?.click()}
        >
          <input
            id="receipt-file-input"
            type="file"
            accept="image/png,image/jpeg,image/webp,application/pdf"
            className="hidden"
            onChange={handleChange}
          />
          {file ? (
            <div className="text-center">
              <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
              <p className="text-sm font-medium">{file.name}</p>
              <p className="text-xs text-muted-foreground mt-1">Click to change file</p>
            </div>
          ) : (
            <div className="text-center">
              <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm font-medium">
                {dragOver ? "Drop receipt here" : "Drag & drop or click to select"}
              </p>
              <p className="text-xs text-muted-foreground mt-1">JPG, PNG, WebP, PDF &middot; max 10MB</p>
            </div>
          )}
        </div>

        {/* Form fields — show after file is selected */}
        {file && (
          <div className="grid gap-3 sm:grid-cols-2">
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
                  className="w-full rounded-md border border-input bg-background px-3 py-2 pl-8 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Merchant</label>
              <input
                type="text"
                list="merchant-list"
                placeholder="Type or select merchant"
                value={merchant}
                onChange={(e) => setMerchant(e.target.value)}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
              <datalist id="merchant-list">
                {merchants.map((m) => (
                  <option key={m} value={m} />
                ))}
              </datalist>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Date</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Account *</label>
              <select
                value={accountId}
                onChange={(e) => setAccountId(e.target.value)}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {accounts.map((a) => (
                  <option key={a.id} value={a.id}>{a.name}</option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* Submit button */}
        {file && (
          <button
            onClick={handleSubmit}
            disabled={uploading || !amount || !accountId}
            className="w-full rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {uploading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Uploading...
              </>
            ) : (
              "Upload & Create Transaction"
            )}
          </button>
        )}

        {/* Status message */}
        {status && (
          <div className={`flex items-center gap-2 text-sm ${status.type === "success" ? "text-green-600" : "text-red-600"}`}>
            {status.type === "success" ? <CheckCircle className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
            {status.message}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
