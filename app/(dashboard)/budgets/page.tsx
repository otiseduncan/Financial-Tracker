import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart3 } from "lucide-react"

export default async function BudgetsPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) redirect("/login")

  const budgets = await prisma.budget.findMany({
    where: { userId: session.user.id },
    include: { lines: { include: { category: true } } },
    orderBy: { createdAt: "desc" },
  })

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div>
        <h1 className="text-2xl font-bold">Budgets</h1>
        <p className="text-muted-foreground">Track spending against your budget</p>
      </div>
      {budgets.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <BarChart3 className="h-10 w-10 text-muted-foreground mb-4" />
            <p className="text-sm font-medium">No budgets yet</p>
            <p className="text-xs text-muted-foreground mt-1">Create your first budget to start tracking spending.</p>
          </CardContent>
        </Card>
      ) : (
        budgets.map((budget) => (
          <Card key={budget.id}>
            <CardHeader>
              <CardTitle>{budget.name}</CardTitle>
              <p className="text-xs text-muted-foreground">{budget.isActive ? "Active" : "Inactive"}</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {budget.lines.map((line) => (
                  <div key={line.id} className="flex justify-between text-sm">
                    <span>{line.category.name}</span>
                    <span className="font-medium">${line.amount.toFixed(2)} / mo</span>
                  </div>
                ))}
                {budget.lines.length === 0 && (
                  <p className="text-sm text-muted-foreground">No budget lines configured.</p>
                )}
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  )
}