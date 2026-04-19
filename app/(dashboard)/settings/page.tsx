import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default async function SettingsPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) redirect("/login")

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-muted-foreground">Manage your account</p>
      </div>
      <Card>
        <CardHeader><CardTitle>Profile</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Name</span>
            <span className="text-sm font-medium">{session.user.name || "Not set"}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Email</span>
            <span className="text-sm font-medium">{session.user.email}</span>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle>Linked Accounts</CardTitle></CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Connect your bank accounts via Plaid to sync transactions automatically.</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle>Data</CardTitle></CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Import/export features coming soon.</p>
        </CardContent>
      </Card>
    </div>
  )
}