"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { signOut } from "next-auth/react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import {
  Home,
  CreditCard,
  Receipt,
  BarChart3,
  Settings,
  Menu,
  Plus,
  Building2,
  LogOut,
} from "lucide-react"

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: Home },
  { name: "Transactions", href: "/transactions", icon: CreditCard },
  { name: "Banks", href: "/banks", icon: Building2 },
  { name: "Receipts", href: "/receipts", icon: Receipt },
  { name: "Budgets", href: "/budgets", icon: BarChart3 },
  { name: "Settings", href: "/settings", icon: Settings },
]

interface AppLayoutProps {
  children: React.ReactNode
}

export function AppLayout({ children }: AppLayoutProps) {
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <div className="min-h-screen bg-background">
      {/* Desktop Sidebar */}
      <div className="hidden md:fixed md:inset-y-0 md:flex md:w-64 md:flex-col">
        <div className="flex flex-col flex-grow bg-card border-r">
          <div className="flex items-center h-16 px-4 border-b">
            <h1 className="text-xl font-bold">Duncan Finance</h1>
          </div>
          <nav className="flex-1 px-4 py-4 space-y-2">
            {navigation.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href as any}
                  className={cn(
                    "flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                  )}
                >
                  <item.icon className="mr-3 h-5 w-5" />
                  {item.name}
                </Link>
              )
            })}
          </nav>
          <div className="px-4 py-4 border-t">
            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="flex items-center w-full px-3 py-2 text-sm font-medium rounded-md text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
            >
              <LogOut className="mr-3 h-5 w-5" />
              Sign Out
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Bottom Nav */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-card border-t z-50">
        <nav className="flex justify-around py-2">
          {navigation.slice(0, 4).map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.name}
                href={item.href as any}
                className={cn(
                  "flex flex-col items-center p-2 text-xs font-medium transition-colors",
                  isActive
                    ? "text-primary"
                    : "text-muted-foreground"
                )}
              >
                <item.icon className="h-5 w-5 mb-1" />
                {item.name}
              </Link>
            )
          })}
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="sm" className="flex flex-col items-center p-2 text-xs">
                <Menu className="h-5 w-5 mb-1" />
                More
              </Button>
            </SheetTrigger>
            <SheetContent side="bottom" className="h-64">
              <nav className="space-y-4">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href as any}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center px-3 py-2 text-sm font-medium rounded-md hover:bg-accent"
                  >
                    <item.icon className="mr-3 h-5 w-5" />
                    {item.name}
                  </Link>
                ))}
                <button
                  onClick={() => signOut({ callbackUrl: "/login" })}
                  className="flex items-center w-full px-3 py-2 text-sm font-medium rounded-md text-red-400 hover:bg-accent"
                >
                  <LogOut className="mr-3 h-5 w-5" />
                  Sign Out
                </button>
              </nav>
            </SheetContent>
          </Sheet>
        </nav>
      </div>

      {/* Main Content */}
      <div className="md:pl-64">
        <main className="pb-16 md:pb-0">
          {children}
        </main>
      </div>

      {/* Floating Action Button for Mobile */}
      <div className="md:hidden fixed bottom-20 right-4">
        <Button size="icon" className="rounded-full h-14 w-14 shadow-lg">
          <Plus className="h-6 w-6" />
        </Button>
      </div>
    </div>
  )
}