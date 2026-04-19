import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DollarSign, TrendingDown, TrendingUp, CreditCard, Gauge, ArrowUpRight, ArrowDownRight, GripVertical } from "lucide-react"
import { ExpensePieChart } from "@/components/charts/expense-pie-chart"
import { VarianceBarChart } from "@/components/charts/variance-bar-chart"
import { DashboardGrid } from "@/components/dashboard/dashboard-grid"
import { DashboardToolbar } from "@/components/dashboard/dashboard-toolbar"
import { Suspense } from "react"

const defaultLayouts = {  lg: [
    { i: "kpi-balance", x: 0, y: 0, w: 3, h: 3, minW: 2, minH: 2 },
    { i: "kpi-income", x: 3, y: 0, w: 3, h: 3, minW: 2, minH: 2 },
    { i: "kpi-expenses", x: 6, y: 0, w: 3, h: 3, minW: 2, minH: 2 },
    { i: "kpi-budget", x: 9, y: 0, w: 3, h: 3, minW: 2, minH: 2 },
    { i: "kpi-netflow", x: 0, y: 3, w: 3, h: 3, minW: 2, minH: 2 },
    { i: "accounts", x: 0, y: 3, w: 6, h: 5, minW: 4, minH: 3 },
    { i: "budget-summary", x: 6, y: 3, w: 6, h: 10, minW: 4, minH: 5 },
    { i: "pie-chart", x: 0, y: 8, w: 6, h: 9, minW: 4, minH: 7 },
    { i: "variance-chart", x: 0, y: 20, w: 6, h: 7, minW: 4, minH: 5 },
    { i: "expense-bars", x: 6, y: 20, w: 6, h: 8, minW: 4, minH: 4 },
    { i: "recent-tx", x: 0, y: 27, w: 6, h: 8, minW: 4, minH: 4 },
  ],
  md: [
    { i: "kpi-balance", x: 0, y: 0, w: 5, h: 3, minW: 2, minH: 2 },
    { i: "kpi-income", x: 5, y: 0, w: 5, h: 3, minW: 2, minH: 2 },
    { i: "kpi-expenses", x: 0, y: 3, w: 5, h: 3, minW: 2, minH: 2 },
    { i: "kpi-budget", x: 5, y: 3, w: 5, h: 3, minW: 2, minH: 2 },
    { i: "kpi-netflow", x: 0, y: 6, w: 5, h: 3, minW: 2, minH: 2 },
    { i: "accounts", x: 0, y: 6, w: 10, h: 5, minW: 4, minH: 3 },
    { i: "budget-summary", x: 0, y: 11, w: 10, h: 10, minW: 4, minH: 5 },
    { i: "pie-chart", x: 0, y: 21, w: 10, h: 9, minW: 6, minH: 7 },
    { i: "variance-chart", x: 0, y: 33, w: 10, h: 7, minW: 4, minH: 5 },
    { i: "expense-bars", x: 0, y: 28, w: 10, h: 8, minW: 4, minH: 4 },
    { i: "recent-tx", x: 0, y: 36, w: 10, h: 8, minW: 4, minH: 4 },
  ],
  sm: [
    { i: "kpi-balance", x: 0, y: 0, w: 3, h: 3, minW: 2, minH: 2 },
    { i: "kpi-income", x: 3, y: 0, w: 3, h: 3, minW: 2, minH: 2 },
    { i: "kpi-expenses", x: 0, y: 3, w: 3, h: 3, minW: 2, minH: 2 },
    { i: "kpi-budget", x: 3, y: 3, w: 3, h: 3, minW: 2, minH: 2 },
    { i: "kpi-netflow", x: 0, y: 6, w: 3, h: 3, minW: 2, minH: 2 },
    { i: "accounts", x: 0, y: 6, w: 6, h: 5, minW: 3, minH: 3 },
    { i: "budget-summary", x: 0, y: 11, w: 6, h: 12, minW: 3, minH: 5 },
    { i: "pie-chart", x: 0, y: 23, w: 6, h: 9, minW: 3, minH: 7 },
    { i: "variance-chart", x: 0, y: 30, w: 6, h: 7, minW: 3, minH: 5 },
    { i: "expense-bars", x: 0, y: 37, w: 6, h: 8, minW: 3, minH: 4 },
    { i: "recent-tx", x: 0, y: 45, w: 6, h: 8, minW: 3, minH: 4 },
  ],
  xs: [
    { i: "kpi-balance", x: 0, y: 0, w: 4, h: 3, minW: 2, minH: 2 },
    { i: "kpi-income", x: 0, y: 3, w: 4, h: 3, minW: 2, minH: 2 },
    { i: "kpi-expenses", x: 0, y: 6, w: 4, h: 3, minW: 2, minH: 2 },
    { i: "kpi-budget", x: 0, y: 9, w: 4, h: 3, minW: 2, minH: 2 },
    { i: "kpi-netflow", x: 0, y: 12, w: 4, h: 3, minW: 2, minH: 2 },
    { i: "accounts", x: 0, y: 12, w: 4, h: 5, minW: 2, minH: 3 },
    { i: "budget-summary", x: 0, y: 17, w: 4, h: 12, minW: 2, minH: 5 },
    { i: "pie-chart", x: 0, y: 29, w: 4, h: 9, minW: 2, minH: 7 },
    { i: "variance-chart", x: 0, y: 36, w: 4, h: 7, minW: 2, minH: 5 },
    { i: "expense-bars", x: 0, y: 43, w: 4, h: 8, minW: 2, minH: 4 },
    { i: "recent-tx", x: 0, y: 51, w: 4, h: 8, minW: 2, minH: 4 },
  ],
}

const itemKeys = [
  "kpi-balance", "kpi-income", "kpi-expenses", "kpi-budget", "kpi-netflow",
  "accounts", "budget-summary", "pie-chart", "variance-chart",
  "expense-bars", "recent-tx",
]

export default async function DashboardPage({ searchParams }: { searchParams: { from?: string; to?: string; q?: string } }) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) redirect("/login")
  const userId = session.user.id

  // Determine date range from searchParams or fall back to most recent transaction month
  const latestTx = await prisma.transaction.findFirst({ where: { userId }, orderBy: { postedAt: "desc" }, select: { postedAt: true } })
  const refDate = latestTx?.postedAt ?? new Date()

  let startOfMonth: Date
  let endOfMonth: Date
  let monthLabel: string

  if (searchParams.from || searchParams.to) {
    startOfMonth = searchParams.from ? new Date(searchParams.from + "T00:00:00") : new Date(refDate.getFullYear(), refDate.getMonth(), 1)
    endOfMonth = searchParams.to ? new Date(searchParams.to + "T23:59:59.999") : new Date(refDate.getFullYear(), refDate.getMonth() + 1, 1)
    const fmtOpts: Intl.DateTimeFormatOptions = { month: "short", day: "numeric", year: "numeric" }
    monthLabel = `${startOfMonth.toLocaleDateString("en-US", fmtOpts)} - ${endOfMonth.toLocaleDateString("en-US", fmtOpts)}`
  } else {
    startOfMonth = new Date(refDate.getFullYear(), refDate.getMonth(), 1)
    endOfMonth = new Date(refDate.getFullYear(), refDate.getMonth() + 1, 1)
    monthLabel = refDate.toLocaleString("en-US", { month: "long", year: "numeric" })
  }

  const searchQuery = searchParams.q?.trim() || ""

  const [accounts, recentTransactions, monthlyStats, expenseByCategoryRaw] = await Promise.all([
    prisma.financialAccount.findMany({ where: { userId }, select: { id: true, name: true, type: true, balance: true } }),
    prisma.transaction.findMany({
      where: {
        userId,
        postedAt: { gte: startOfMonth, lte: endOfMonth },
        ...(searchQuery ? { OR: [
          { merchant: { contains: searchQuery, mode: "insensitive" as const } },
          { description: { contains: searchQuery, mode: "insensitive" as const } },
        ] } : {}),
      },
      orderBy: { postedAt: "desc" },
      take: 20,
      include: { category: true, account: true },
    }),
    prisma.transaction.groupBy({
      by: ["direction"],
      where: {
        userId,
        postedAt: { gte: startOfMonth, lte: endOfMonth },
        ...(searchQuery ? { OR: [
          { merchant: { contains: searchQuery, mode: "insensitive" as const } },
          { description: { contains: searchQuery, mode: "insensitive" as const } },
        ] } : {}),
      },
      _sum: { amount: true },
    }),
    prisma.transaction.groupBy({
      by: ["categoryId"],
      where: {
        userId,
        direction: "expense",
        postedAt: { gte: startOfMonth, lte: endOfMonth },
        categoryId: { not: null },
        ...(searchQuery ? { OR: [
          { merchant: { contains: searchQuery, mode: "insensitive" as const } },
          { description: { contains: searchQuery, mode: "insensitive" as const } },
        ] } : {}),
      },
      _sum: { amount: true },
      orderBy: { _sum: { amount: "desc" } },
    }),
  ])

  // Resolve category names for expense breakdown
  const catIds = expenseByCategoryRaw.map((r) => r.categoryId).filter(Boolean) as string[]
  const categories = catIds.length > 0 ? await prisma.category.findMany({ where: { id: { in: catIds } } }) : []
  const catNameMap: Record<string, string> = {}
  for (const c of categories) catNameMap[c.id] = c.name
  const expenseByCategory = expenseByCategoryRaw
    .filter((r) => r.categoryId && r._sum.amount)
    .map((r) => ({ name: catNameMap[r.categoryId!] || "Unknown", amount: r._sum.amount! }))
  const maxExpense = expenseByCategory.length > 0 ? Math.max(...expenseByCategory.map((e) => e.amount)) : 1

  // Budget variance data � collect all months in the selected range
  const rangeMonths: { month: number; year: number }[] = []
  {
    const cur = new Date(startOfMonth)
    while (cur < endOfMonth) {
      rangeMonths.push({ month: cur.getMonth() + 1, year: cur.getFullYear() })
      cur.setMonth(cur.getMonth() + 1)
    }
  }
  const budgetLines = await prisma.budgetLine.findMany({
    where: {
      budget: { userId },
      OR: rangeMonths.map((rm) => ({ month: rm.month, year: rm.year })),
    },
    include: { category: true },
  })
  const budgetMap: Record<string, number> = {}
  for (const bl of budgetLines) {
    budgetMap[bl.category.name] = (budgetMap[bl.category.name] || 0) + bl.amount
  }

  const actualMap: Record<string, number> = {}
  for (const r of expenseByCategoryRaw) {
    if (r.categoryId && r._sum.amount) actualMap[catNameMap[r.categoryId] || ""] = r._sum.amount
  }

  const allBudgetCategories = Object.keys(budgetMap).filter((n) => n !== "Income" && budgetMap[n] !== 0)
  const varianceData = allBudgetCategories.map((name) => {
    const budgeted = budgetMap[name] || 0
    const actual = actualMap[name] || 0
    const actualSigned = -actual
    const variance = actualSigned - budgeted
    return { name, variance: Math.round(variance * 100) / 100 }
  }).sort((a, b) => a.variance - b.variance)

  // Budget summary
  const budgetSummary = allBudgetCategories.map((name) => {
    const budgeted = Math.abs(budgetMap[name] || 0)
    const actual = actualMap[name] || 0
    const diff = actual - budgeted
    const pct = budgeted > 0 ? (actual / budgeted) * 100 : 0
    return { name, budgeted, actual, diff, pct }
  }).sort((a, b) => b.pct - a.pct)

  const totalBudgeted = budgetSummary.reduce((s, r) => s + r.budgeted, 0)
  const totalActual = budgetSummary.reduce((s, r) => s + r.actual, 0)
  const totalDiff = totalActual - totalBudgeted
  const totalPct = totalBudgeted > 0 ? (totalActual / totalBudgeted) * 100 : 0
  const numMonths = rangeMonths.length || 1
  const annualBudget = totalBudgeted * (12 / numMonths)
  const projectedAnnual = totalActual * (12 / numMonths)
  const onTrack = totalActual <= totalBudgeted

  // Compute balances from transactions per account
  const accountBalances = await prisma.transaction.groupBy({
    by: ["accountId", "direction"],
    where: { userId },
    _sum: { amount: true },
  })
  const balanceMap: Record<string, number> = {}
  for (const row of accountBalances) {
    if (!balanceMap[row.accountId]) balanceMap[row.accountId] = 0
    const amt = row._sum.amount || 0
    if (row.direction === "income") balanceMap[row.accountId] += amt
    else if (row.direction === "expense") balanceMap[row.accountId] -= amt
  }

  const totalBalance = Object.values(balanceMap).reduce((s, v) => s + v, 0)
  const income = monthlyStats.find((s) => s.direction === "income")?._sum.amount || 0
  const expenses = monthlyStats.find((s) => s.direction === "expense")?._sum.amount || 0
  const netFlow = income - expenses

  return (
    <div className="p-4 md:p-6">
      <div className="mb-4">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Welcome back, {session.user.name || session.user.email}</p>
      </div>
      <Suspense fallback={null}>
        <DashboardToolbar />
      </Suspense>
      <DashboardGrid itemKeys={itemKeys} defaultLayouts={defaultLayouts}>
        {/* KPI: Total Balance */}
        <Card className="h-full flex flex-col">
          <CardHeader className="drag-handle cursor-grab active:cursor-grabbing flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Balance</CardTitle>
            <div className="flex items-center gap-1">
              <DollarSign className="h-4 w-4 text-muted-foreground" />
              <GripVertical className="h-3 w-3 text-muted-foreground/50" />
            </div>
          </CardHeader>
          <CardContent className="flex-1">
            <div className="text-2xl font-bold">${totalBalance.toLocaleString("en-US", { minimumFractionDigits: 2 })}</div>
            <p className="text-xs text-muted-foreground">Across {accounts.length} account{accounts.length !== 1 ? "s" : ""} &middot; {monthLabel}</p>
          </CardContent>
        </Card>

        {/* KPI: Monthly Income */}
        <Card className="h-full flex flex-col">
          <CardHeader className="drag-handle cursor-grab active:cursor-grabbing flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Monthly Income</CardTitle>
            <div className="flex items-center gap-1">
              <TrendingUp className="h-4 w-4 text-green-500" />
              <GripVertical className="h-3 w-3 text-muted-foreground/50" />
            </div>
          </CardHeader>
          <CardContent className="flex-1">
            <div className="text-2xl font-bold text-green-600">+${income.toLocaleString("en-US", { minimumFractionDigits: 2 })}</div>
            <p className="text-xs text-muted-foreground">{monthLabel}</p>
          </CardContent>
        </Card>

        {/* KPI: Monthly Expenses */}
        <Card className="h-full flex flex-col">
          <CardHeader className="drag-handle cursor-grab active:cursor-grabbing flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Monthly Expenses</CardTitle>
            <div className="flex items-center gap-1">
              <TrendingDown className="h-4 w-4 text-red-500" />
              <GripVertical className="h-3 w-3 text-muted-foreground/50" />
            </div>
          </CardHeader>
          <CardContent className="flex-1">
            <div className="text-2xl font-bold text-red-600">-${expenses.toLocaleString("en-US", { minimumFractionDigits: 2 })}</div>
            <p className="text-xs text-muted-foreground">{monthLabel}</p>
          </CardContent>
        </Card>

        {/* KPI: Budget Used */}
        <Card className={`h-full flex flex-col border-l-4 ${totalPct > 100 ? "border-l-red-500" : totalPct >= 75 ? "border-l-yellow-500" : "border-l-green-500"}`}>
          <CardHeader className="drag-handle cursor-grab active:cursor-grabbing flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Budget Used</CardTitle>
            <div className="flex items-center gap-1">
              <Gauge className={`h-4 w-4 ${totalPct > 100 ? "text-red-500" : totalPct >= 75 ? "text-yellow-500" : "text-green-500"}`} />
              <GripVertical className="h-3 w-3 text-muted-foreground/50" />
            </div>
          </CardHeader>
          <CardContent className="flex-1">
            <div className={`text-2xl font-bold ${totalPct > 100 ? "text-red-600" : totalPct >= 75 ? "text-yellow-600" : "text-green-600"}`}>{totalPct.toFixed(0)}%</div>
            <div className="mt-1 h-2 w-full rounded-full bg-muted">
              <div
                className={`h-2 rounded-full ${totalPct > 100 ? "bg-red-500" : totalPct >= 75 ? "bg-yellow-500" : "bg-green-500"}`}
                style={{ width: `${Math.min(totalPct, 100)}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground mt-1">${totalActual.toLocaleString("en-US", { minimumFractionDigits: 0 })} / ${totalBudgeted.toLocaleString("en-US", { minimumFractionDigits: 0 })}</p>
          </CardContent>
        </Card>

        {/* KPI: Net Flow */}
        <Card className="h-full flex flex-col">
          <CardHeader className="drag-handle cursor-grab active:cursor-grabbing flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Net Flow</CardTitle>
            <div className="flex items-center gap-1">
              <CreditCard className="h-4 w-4 text-muted-foreground" />
              <GripVertical className="h-3 w-3 text-muted-foreground/50" />
            </div>
          </CardHeader>
          <CardContent className="flex-1">
            <div className={`text-2xl font-bold ${netFlow >= 0 ? "text-green-600" : "text-red-600"}`}>
              {netFlow >= 0 ? "+" : ""}${netFlow.toLocaleString("en-US", { minimumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-muted-foreground">{monthLabel}</p>
          </CardContent>
        </Card>

        {/* Accounts */}
        <Card className="h-full flex flex-col">
          <CardHeader className="drag-handle cursor-grab active:cursor-grabbing">
            <div className="flex items-center justify-between">
              <CardTitle>Accounts</CardTitle>
              <GripVertical className="h-4 w-4 text-muted-foreground/50" />
            </div>
          </CardHeader>
          <CardContent className="flex-1 overflow-auto">
            {accounts.length === 0 ? (
              <p className="text-sm text-muted-foreground">No accounts yet. Add one in Settings.</p>
            ) : (
              <div className="space-y-3">
                {accounts.map((a) => (
                  <div key={a.id} className="flex items-center justify-between rounded-lg border p-3">
                    <div>
                      <p className="font-medium">{a.name}</p>
                      <p className="text-xs capitalize text-muted-foreground">{a.type.replace("_", " ")}</p>
                    </div>
                    <p className="font-semibold">${(balanceMap[a.id] || 0).toLocaleString("en-US", { minimumFractionDigits: 2 })}</p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Budget Summary */}
        <Card className="h-full flex flex-col">
          <CardHeader className="drag-handle cursor-grab active:cursor-grabbing">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Budget Summary</CardTitle>
                <p className="text-xs text-muted-foreground">{monthLabel}</p>
              </div>
              <GripVertical className="h-4 w-4 text-muted-foreground/50" />
            </div>
          </CardHeader>
          <CardContent className="flex-1 overflow-auto space-y-6">
            <div className="rounded-lg border p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Total Monthly Budget</span>
                <span className={`text-sm font-bold ${totalDiff > 0 ? "text-red-600" : "text-green-600"}`}>
                  {totalDiff > 0 ? "Over" : "Under"} by ${Math.abs(totalDiff).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Spent: ${totalActual.toLocaleString("en-US", { minimumFractionDigits: 2 })}</span>
                <span>Budget: ${totalBudgeted.toLocaleString("en-US", { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="h-3 w-full rounded-full bg-muted">
                <div
                  className={`h-3 rounded-full ${totalPct > 100 ? "bg-red-500" : totalPct > 85 ? "bg-yellow-500" : "bg-green-500"}`}
                  style={{ width: `${Math.min(totalPct, 100)}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground text-center">{totalPct.toFixed(0)}% of monthly budget used</p>
            </div>

            <div className="rounded-lg border p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Yearly Projection</span>
                <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${onTrack ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                  {onTrack ? "On Track" : "Over Budget"}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <p className="text-lg font-bold">${projectedAnnual.toLocaleString("en-US", { maximumFractionDigits: 0 })}</p>
                  <p className="text-xs text-muted-foreground">Projected Annual Spend</p>
                </div>
                <div>
                  <p className="text-lg font-bold">${annualBudget.toLocaleString("en-US", { maximumFractionDigits: 0 })}</p>
                  <p className="text-xs text-muted-foreground">Annual Budget</p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <p className="text-sm font-medium">Category Breakdown</p>
              {budgetSummary.slice(0, 15).map((row) => (
                <div key={row.name} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium truncate max-w-[40%]">{row.name}</span>
                    <span className="text-muted-foreground">
                      ${row.actual.toLocaleString("en-US", { minimumFractionDigits: 2 })} / ${row.budgeted.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                      <span className={`ml-2 font-semibold ${row.diff > 0 ? "text-red-600" : "text-green-600"}`}>
                        ({row.diff > 0 ? "+" : ""}{row.diff.toLocaleString("en-US", { minimumFractionDigits: 2 })})
                      </span>
                    </span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-muted">
                    <div
                      className={`h-2 rounded-full ${row.pct > 100 ? "bg-red-500" : row.pct > 85 ? "bg-yellow-500" : "bg-green-500"}`}
                      style={{ width: `${Math.min(row.pct, 100)}%` }}
                    />
                  </div>
                </div>
              ))}
              {budgetSummary.length > 15 && (
                <p className="text-xs text-muted-foreground text-center">+ {budgetSummary.length - 15} more categories</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Pie Chart */}
        <Card className="h-full flex flex-col">
          <CardHeader className="drag-handle cursor-grab active:cursor-grabbing">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Expenses by Category</CardTitle>
                <p className="text-xs text-muted-foreground">{monthLabel}</p>
              </div>
              <GripVertical className="h-4 w-4 text-muted-foreground/50" />
            </div>
          </CardHeader>
          <CardContent className="flex-1 overflow-hidden">
            {expenseByCategory.length === 0 ? (
              <p className="text-sm text-muted-foreground">No expenses this month.</p>
            ) : (
              <ExpensePieChart data={expenseByCategory} />
            )}
          </CardContent>
        </Card>

        {/* Variance Chart */}
        <Card className="h-full flex flex-col">
          <CardHeader className="drag-handle cursor-grab active:cursor-grabbing">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Variance (Actual vs Budget)</CardTitle>
                <p className="text-xs text-muted-foreground">{monthLabel}</p>
              </div>
              <GripVertical className="h-4 w-4 text-muted-foreground/50" />
            </div>
          </CardHeader>
          <CardContent className="flex-1 overflow-hidden">
            {varianceData.length === 0 ? (
              <p className="text-sm text-muted-foreground">No budget data.</p>
            ) : (
              <VarianceBarChart data={varianceData} />
            )}
          </CardContent>
        </Card>

        {/* Expense Bars */}
        <Card className="h-full flex flex-col">
          <CardHeader className="drag-handle cursor-grab active:cursor-grabbing">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Expenses by Category</CardTitle>
                <p className="text-xs text-muted-foreground">{monthLabel}</p>
              </div>
              <GripVertical className="h-4 w-4 text-muted-foreground/50" />
            </div>
          </CardHeader>
          <CardContent className="flex-1 overflow-auto">
            {expenseByCategory.length === 0 ? (
              <p className="text-sm text-muted-foreground">No expenses this month.</p>
            ) : (
              <div className="space-y-3">
                {expenseByCategory.map((cat) => (
                  <div key={cat.name}>
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">{cat.name}</span>
                      <span className="text-muted-foreground">${cat.amount.toLocaleString("en-US", { minimumFractionDigits: 2 })}</span>
                    </div>
                    <div className="mt-1 h-2 w-full rounded-full bg-muted">
                      <div
                        className="h-2 rounded-full bg-red-500"
                        style={{ width: `${(cat.amount / maxExpense) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Transactions */}
        <Card className="h-full flex flex-col">
          <CardHeader className="drag-handle cursor-grab active:cursor-grabbing">
            <div className="flex items-center justify-between">
              <CardTitle>Recent Transactions</CardTitle>
              <div className="flex items-center gap-2">
                <a href="/transactions" className="text-sm text-primary hover:underline">View all</a>
                <GripVertical className="h-4 w-4 text-muted-foreground/50" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="flex-1 overflow-auto">
            {recentTransactions.length === 0 ? (
              <p className="text-sm text-muted-foreground">No transactions yet.</p>
            ) : (
              <div className="space-y-3">
                {recentTransactions.map((tx) => (
                  <div key={tx.id} className="flex items-center justify-between rounded-lg border p-3">
                    <div className="flex items-center gap-3">
                      <div className={`rounded-full p-2 ${tx.direction === "income" ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"}`}>
                        {tx.direction === "income" ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
                      </div>
                      <div>
                        <p className="font-medium">{tx.merchant || tx.description}</p>
                        <p className="text-xs text-muted-foreground">{tx.category?.name || "Uncategorized"} &bull; {tx.account.name}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-semibold ${tx.direction === "income" ? "text-green-600" : "text-red-600"}`}>
                        {tx.direction === "income" ? "+" : "-"}${tx.amount.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                      </p>
                      <p className="text-xs text-muted-foreground">{new Date(tx.postedAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </DashboardGrid>
    </div>
  )
}