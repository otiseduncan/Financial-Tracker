import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle2 } from "lucide-react"

export default async function ReviewPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) redirect("/login")

  const needsReview = await prisma.transaction.findMany({
    where: { userId: session.user.id, status: "needs_review" },
    orderBy: { postedAt: "desc" },
    include: { category: true, account: true },
  })

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div>
        <h1 className="text-2xl font-bold">Review</h1>
        <p className="text-muted-foreground">Transactions that need your attention</p>
      </div>
      {needsReview.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <CheckCircle2 className="h-10 w-10 text-green-500 mb-4" />
            <p className="text-sm font-medium">All caught up!</p>
            <p className="text-xs text-muted-foreground mt-1">No transactions need review right now.</p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader><CardTitle>{needsReview.length} item{needsReview.length !== 1 ? "s" : ""} to review</CardTitle></CardHeader>
          <CardContent>
            <div className="divide-y">
              {needsReview.map((tx) => (
                <div key={tx.id} className="flex items-center justify-between p-4">
                  <div>
                    <p className="font-medium">{tx.merchant || tx.description}</p>
                    <p className="text-xs text-muted-foreground">{tx.category?.name || "Uncategorized"} &bull; {tx.account.name}</p>
                  </div>
                  <p className="font-semibold">${tx.amount.toLocaleString("en-US", { minimumFractionDigits: 2 })}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}