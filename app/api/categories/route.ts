import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    })
    return NextResponse.json({ categories })
  } catch (error) {
    console.error("Categories error:", error)
    return NextResponse.json({ error: "Failed" }, { status: 500 })
  }
}
