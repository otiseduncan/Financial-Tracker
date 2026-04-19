import { BankConnections } from "@/components/plaid/bank-connections"

export default function BanksPage() {
  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Bank Connections</h1>
        <p className="text-muted-foreground">Connect your bank accounts to automatically import transactions</p>
      </div>
      <BankConnections />
    </div>
  )
}
