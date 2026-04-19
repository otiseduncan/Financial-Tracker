"use client"

import { useCallback, useEffect, useState } from "react"
import { usePlaidLink } from "react-plaid-link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2, Plus, RefreshCw, Trash2, Building2, CheckCircle2 } from "lucide-react"
import { formatDistanceToNow } from "date-fns"

interface PlaidItemInfo {
  id: string
  institutionName: string | null
  status: string
  lastSynced: string | null
  createdAt: string
}

function ConnectButton({ onSuccess }: { onSuccess: () => void }) {
  const [linkToken, setLinkToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch("/api/plaid/create-link-token", { method: "POST" })
      .then((r) => r.json())
      .then((data) => {
        if (data.link_token) {
          setLinkToken(data.link_token)
        } else {
          setError(data.error || "Failed to initialize Plaid")
        }
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <Button disabled className="gap-2">
        <Loader2 className="h-4 w-4 animate-spin" />
        Initializing...
      </Button>
    )
  }

  if (error || !linkToken) {
    return (
      <Button disabled variant="destructive" className="gap-2">
        <Plus className="h-4 w-4" />
        {error || "Plaid unavailable"}
      </Button>
    )
  }

  return <ConnectButtonReady linkToken={linkToken} onSuccess={onSuccess} />
}

function ConnectButtonReady({ linkToken, onSuccess }: { linkToken: string; onSuccess: () => void }) {
  const { open, ready } = usePlaidLink({
    token: linkToken,
    onSuccess: async (public_token, metadata) => {
      await fetch("/api/plaid/exchange-token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          public_token,
          institution: metadata.institution,
        }),
      })
      onSuccess()
    },
  })

  return (
    <Button onClick={() => open()} disabled={!ready} className="gap-2">
      <Plus className="h-4 w-4" />
      Connect a Bank
    </Button>
  )
}

export function BankConnections() {
  const [items, setItems] = useState<PlaidItemInfo[]>([])
  const [loading, setLoading] = useState(true)
  const [syncing, setSyncing] = useState<string | null>(null)
  const [removing, setRemoving] = useState<string | null>(null)
  const [syncResult, setSyncResult] = useState<{ id: string; msg: string } | null>(null)

  const fetchItems = useCallback(async () => {
    try {
      const res = await fetch("/api/plaid/items")
      const data = await res.json()
      setItems(data.items || [])
    } catch (error) {
      console.error("Failed to fetch items:", error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchItems() }, [fetchItems])

  const handleSync = async (id: string) => {
    setSyncing(id)
    setSyncResult(null)
    try {
      const res = await fetch("/api/plaid/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plaidItemId: id }),
      })
      const data = await res.json()
      if (res.ok) {
        setSyncResult({ id, msg: `${data.created} new, ${data.removed} removed` })
        fetchItems()
      } else {
        setSyncResult({ id, msg: data.error || "Sync failed" })
      }
    } catch {
      setSyncResult({ id, msg: "Network error" })
    } finally {
      setSyncing(null)
    }
  }

  const handleRemove = async (id: string) => {
    if (!confirm("Disconnect this bank? Existing transactions will be kept.")) return
    setRemoving(id)
    try {
      await fetch("/api/plaid/items", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plaidItemId: id }),
      })
      setItems((prev) => prev.filter((i) => i.id !== id))
    } catch {
      console.error("Failed to remove")
    } finally {
      setRemoving(null)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Connected Banks</h2>
          <p className="text-sm text-muted-foreground">Link your bank accounts to automatically import transactions</p>
        </div>
        <ConnectButton onSuccess={fetchItems} />
      </div>

      {loading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : items.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Building2 className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-sm text-muted-foreground mb-2">No banks connected yet</p>
            <p className="text-xs text-muted-foreground">Click &quot;Connect a Bank&quot; to link your first account</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {items.map((item) => (
            <Card key={item.id}>
              <CardContent className="flex items-center justify-between py-4">
                <div className="flex items-center gap-4">
                  <div className="rounded-full bg-primary/10 p-3">
                    <Building2 className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">{item.institutionName || "Unknown Bank"}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <CheckCircle2 className="h-3 w-3 text-green-500" />
                      <span>Connected {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}</span>
                      {item.lastSynced && (
                        <span>&middot; Last synced {formatDistanceToNow(new Date(item.lastSynced), { addSuffix: true })}</span>
                      )}
                    </div>
                    {syncResult?.id === item.id && (
                      <p className="text-xs text-primary mt-1">{syncResult.msg}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleSync(item.id)}
                    disabled={syncing === item.id}
                    className="gap-1"
                  >
                    {syncing === item.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
                    Sync
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemove(item.id)}
                    disabled={removing === item.id}
                    className="text-muted-foreground hover:text-red-600"
                  >
                    {removing === item.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
