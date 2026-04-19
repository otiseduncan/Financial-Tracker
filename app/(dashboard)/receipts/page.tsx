import { ReceiptUploader } from "@/components/receipts/receipt-uploader"
import { ReceiptsList } from "@/components/receipts/receipts-list"

export default function ReceiptsPage() {
  return (
    <div className="space-y-6 p-4 md:p-6">
      <div>
        <h1 className="text-2xl font-bold">Receipts</h1>
        <p className="text-muted-foreground">Upload and manage receipts</p>
      </div>

      <ReceiptUploader />

      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Recent Receipts</h2>
        <ReceiptsList />
      </div>
    </div>
  )
}