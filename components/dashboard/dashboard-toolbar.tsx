"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { useCallback, useState, useTransition } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, X } from "lucide-react"

export function DashboardToolbar() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()

  const [from, setFrom] = useState(searchParams.get("from") || "")
  const [to, setTo] = useState(searchParams.get("to") || "")
  const [q, setQ] = useState(searchParams.get("q") || "")

  const apply = useCallback(() => {
    const params = new URLSearchParams()
    if (from) params.set("from", from)
    if (to) params.set("to", to)
    if (q.trim()) params.set("q", q.trim())
    const qs = params.toString()
    startTransition(() => {
      router.push((`/dashboard${qs ? `?${qs}` : ""}`) as any)
    })
  }, [from, to, q, router])

  const clear = useCallback(() => {
    setFrom("")
    setTo("")
    setQ("")
    startTransition(() => {
      router.push("/dashboard" as any)
    })
  }, [router])

  const hasFilters = from || to || q

  return (
    <div className="flex flex-wrap items-end gap-3 mb-4">
      <div className="space-y-1">
        <label className="text-xs font-medium text-muted-foreground">From</label>
        <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="w-40" />
      </div>
      <div className="space-y-1">
        <label className="text-xs font-medium text-muted-foreground">To</label>
        <Input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="w-40" />
      </div>
      <div className="space-y-1">
        <label className="text-xs font-medium text-muted-foreground">Search</label>
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Merchant, description..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && apply()}
            className="pl-9 w-56"
          />
        </div>
      </div>
      <Button onClick={apply} disabled={isPending} size="sm">
        {isPending ? "Loading…" : "Apply"}
      </Button>
      {hasFilters && (
        <Button onClick={clear} variant="ghost" size="sm" className="gap-1">
          <X className="h-3 w-3" /> Clear
        </Button>
      )}
    </div>
  )
}
