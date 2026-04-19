import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Building2 } from "lucide-react"

export default async function AccountsPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) redirect("/login")

  const accounts = await prisma.financialAccount.findMany({
    where: { userId: session.user.id },
    include: { institution: true },
    orderBy: { name: "asc" },
  })

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div>
        <h1 className="text-2xl font-bold">Accounts</h1>
        <p className="text-muted-foreground">Your financial accounts</p>
      </div>
      {accounts.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Building2 className="h-10 w-10 text-muted-foreground mb-4" />
            <p className="text-sm font-medium">No accounts connected</p>
            <p className="text-xs text-muted-foreground mt-1">Link a bank or add a manual account to get started.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {accounts.map((account) => (
            <Card key={account.id}>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">{account.name}</CardTitle>
                <p className="text-xs capitalize text-muted-foreground">{account.type.replace("_", " ")}{account.institution ? ` - ${account.institution.name}` : ""}</p>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">${(account.balance || 0).toLocaleString("en-US", { minimumFractionDigits: 2 })}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}