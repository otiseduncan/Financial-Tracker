import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  // Create admin user (your login)
  const adminPassword = await bcrypt.hash("O3n1_j1O4#!", 12)
  const admin = await prisma.user.upsert({
    where: { email: "otiseduncan@gmail.com" },
    update: {},
    create: {
      email: "otiseduncan@gmail.com",
      name: "Otis Duncan",
      hashedPassword: adminPassword,
    },
  })
  console.log(`Admin user ready: ${admin.email}`)

  // Create default categories
  const categories = [
    { name: 'Income', color: '#10b981' },
    { name: 'Auto & Gas', color: '#f59e0b' },
    { name: 'Auto/Tools', color: '#f59e0b' },
    { name: 'Bills', color: '#ef4444' },
    { name: 'Business & Tech', color: '#3b82f6' },
    { name: 'Cash', color: '#22c55e' },
    { name: 'Debt', color: '#dc2626' },
    { name: 'Dining', color: '#f97316' },
    { name: 'Dining - Family', color: '#f97316' },
    { name: 'Dining - Lunch', color: '#f97316' },
    { name: 'Doctor', color: '#ec4899' },
    { name: 'Education', color: '#8b5cf6' },
    { name: 'Entertainment', color: '#06b6d4' },
    { name: 'Fees', color: '#64748b' },
    { name: 'Groceries', color: '#84cc16' },
    { name: 'Home Repair', color: '#eab308' },
    { name: 'Medicine', color: '#ec4899' },
    { name: 'Needs Review', color: '#6b7280' },
    { name: 'Pets & Outdoors', color: '#16a34a' },
    { name: 'Services', color: '#6366f1' },
    { name: 'Amazon', color: '#f97316' },
    { name: 'Tobacco/Vape/CBD', color: '#92400e' },
    { name: 'Transfers', color: '#64748b' },
    { name: 'Tri-County EMC', color: '#fbbf24' },
    { name: 'Tri-Co-Go', color: '#fbbf24' },
    { name: 'Taxes', color: '#7c3aed' },
    { name: 'Cell Phones', color: '#3b82f6' },
    { name: 'Car Insurance', color: '#f59e0b' },
    { name: 'Yoder', color: '#84cc16' },
    { name: 'Farmers', color: '#f59e0b' },
    { name: 'RAC', color: '#f59e0b' },
    { name: 'Wal-Mart', color: '#f97316' },
    { name: 'Shopping', color: '#f97316' },
    { name: 'Storage', color: '#64748b' },
    { name: 'Van\'s', color: '#f97316' },
    { name: 'Reimbursement In', color: '#10b981' },
    { name: 'Reimbursement Out', color: '#dc2626' },
    { name: 'Family/Friends Support', color: '#f97316' },
    { name: 'Transfer - Internal', color: '#64748b' },
    { name: 'Transfer - Round Up', color: '#64748b' },
    { name: 'Transfer - Savings Bucket', color: '#64748b' },
    { name: 'Borrowed Money / Advance', color: '#dc2626' },
    { name: 'Debt Repayment', color: '#dc2626' },
    { name: 'Bank / Advance Fees', color: '#64748b' },
  ]

  for (const cat of categories) {
    await prisma.category.upsert({
      where: { name: cat.name },
      update: {},
      create: cat,
    })
  }

  // Create subcategories
  const subcategories = [
    { categoryName: 'Dining', name: 'Family' },
    { categoryName: 'Dining', name: 'Lunch' },
  ]

  for (const sub of subcategories) {
    const category = await prisma.category.findUnique({ where: { name: sub.categoryName } })
    if (category) {
      await prisma.subcategory.upsert({
        where: { categoryId_name: { name: sub.name, categoryId: category.id } },
        update: {},
        create: { name: sub.name, categoryId: category.id },
      })
    }
  }

  // Create sample user (for demo)
  const user = await prisma.user.upsert({
    where: { email: 'demo@example.com' },
    update: {},
    create: {
      email: 'demo@example.com',
      name: 'Demo User',
    },
  })

  // Create sample account
  const account = await prisma.financialAccount.upsert({
    where: { id: 'demo-account' },
    update: {},
    create: {
      id: 'demo-account',
      userId: user.id,
      name: 'Demo Checking',
      type: 'checking',
      balance: 5000.00,
    },
  })

  // Create sample transactions
  const incomeCat = await prisma.category.findUnique({ where: { name: 'Income' } })
  const groceriesCat = await prisma.category.findUnique({ where: { name: 'Groceries' } })
  const diningCat = await prisma.category.findUnique({ where: { name: 'Dining' } })

  const transactions = [
    {
      userId: user.id,
      accountId: account.id,
      sourceType: 'manual' as const,
      postedAt: new Date('2024-01-01'),
      transactionDate: new Date('2024-01-01'),
      amount: 3000.00,
      direction: 'income' as const,
      merchant: 'Employer',
      description: 'Salary',
      originalRawDescription: 'Salary from Employer',
      categoryId: incomeCat?.id,
      status: 'reviewed' as const,
    },
    {
      userId: user.id,
      accountId: account.id,
      sourceType: 'manual' as const,
      postedAt: new Date('2024-01-02'),
      transactionDate: new Date('2024-01-02'),
      amount: -85.50,
      direction: 'expense' as const,
      merchant: 'Whole Foods',
      description: 'Groceries',
      originalRawDescription: 'Whole Foods Market',
      categoryId: groceriesCat?.id,
      status: 'reviewed' as const,
    },
    {
      userId: user.id,
      accountId: account.id,
      sourceType: 'manual' as const,
      postedAt: new Date('2024-01-03'),
      transactionDate: new Date('2024-01-03'),
      amount: -45.00,
      direction: 'expense' as const,
      merchant: 'Local Restaurant',
      description: 'Dinner',
      originalRawDescription: 'Local Restaurant',
      categoryId: diningCat?.id,
      status: 'reviewed' as const,
    },
  ]

  for (const tx of transactions) {
    await prisma.transaction.create({ data: tx })
  }

  console.log('Seed data created successfully')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })