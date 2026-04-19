import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"
import { writeFile, mkdir } from "fs/promises"
import path from "path"
import { v4 as uuidv4 } from "uuid"

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const formData = await req.formData()
    const file = formData.get("file") as File | null
    const amount = formData.get("amount") as string | null
    const merchant = formData.get("merchant") as string | null
    const date = formData.get("date") as string | null
    const accountId = formData.get("accountId") as string | null

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
      return NextResponse.json({ error: "Valid amount is required" }, { status: 400 })
    }

    if (!accountId) {
      return NextResponse.json({ error: "Account is required" }, { status: 400 })
    }

    const allowed = ["image/png", "image/jpeg", "image/webp", "application/pdf"]
    if (!allowed.includes(file.type)) {
      return NextResponse.json({ error: "Allowed: JPG, PNG, WebP, PDF" }, { status: 400 })
    }

    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: "File too large. Max 10MB." }, { status: 400 })
    }

    // Verify account belongs to user
    const account = await prisma.financialAccount.findFirst({
      where: { id: accountId, userId: session.user.id },
    })
    if (!account) {
      return NextResponse.json({ error: "Invalid account" }, { status: 400 })
    }

    const receiptId = uuidv4()
    const safeName = file.name.replace(/[^a-zA-Z0-9.]/g, "")
    const fileName = `${receiptId}-${safeName}`
    const uploadDir = path.join(process.cwd(), "public", "images", "receipts")
    await mkdir(uploadDir, { recursive: true })

    const filePath = path.join(uploadDir, fileName)
    const buffer = Buffer.from(await file.arrayBuffer())
    await writeFile(filePath, buffer)

    const imageUrl = `/images/receipts/${fileName}`
    const parsedAmount = parseFloat(amount)
    const merchantName = merchant?.trim() || safeName
    const txDate = date ? new Date(date) : new Date()

    // Create receipt and transaction together
    const receipt = await prisma.receipt.create({
      data: {
        id: receiptId,
        userId: session.user.id,
        imagePath: filePath,
        imageUrl: imageUrl,
        merchantName,
        totalAmount: parsedAmount,
        transactionDate: txDate,
        status: "COMPLETED",
      },
    })

    const transaction = await prisma.transaction.create({
      data: {
        userId: session.user.id,
        accountId,
        sourceType: "receipt_only",
        postedAt: txDate,
        transactionDate: txDate,
        amount: parsedAmount,
        direction: "expense",
        merchant: merchantName,
        description: `Receipt: ${merchantName}`,
        originalRawDescription: `Receipt upload: ${file.name}`,
        receiptId: receipt.id,
        status: "reviewed",
      },
    })

    return NextResponse.json({
      success: true,
      receipt: { id: receipt.id, imageUrl, status: "COMPLETED", merchantName },
      transaction: { id: transaction.id, amount: parsedAmount },
    })
  } catch (error) {
    console.error("Upload error:", error)
    return NextResponse.json({ error: "Upload failed" }, { status: 500 })
  }
}
