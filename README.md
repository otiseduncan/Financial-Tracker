# Duncan Finance

A production-style, mobile-first personal finance web app built with Next.js, TypeScript, Tailwind CSS, shadcn/ui, Prisma, and PostgreSQL.

## Features

- **Mobile-first responsive design** optimized for phone use
- **PWA behavior** for app-like mobile experience
- **Modern dark UI** with clean, elegant design
- **Bank account connections** with Plaid integration (stubbed for local dev)
- **Transaction ingestion** from synced accounts, manual entry, and CSV import
- **Receipt capture** with mobile camera and OCR processing
- **Rule-based categorization** with merchant, keyword, and amount patterns
- **Budget management** with monthly tracking and vs actuals
- **Transfer detection** and handling
- **Review workflows** for uncategorized transactions and low-confidence OCR
- **Comprehensive dashboard** with charts, filters, and KPIs

## Tech Stack

- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Next.js API routes, Prisma ORM, PostgreSQL
- **Authentication**: NextAuth.js with email/password
- **Charts**: Recharts
- **Validation**: Zod
- **Forms**: React Hook Form
- **OCR**: Tesseract.js (local) + Google Document AI (optional)
- **Banking**: Plaid API (production) + mocks (development)

## Architecture

### Folder Structure

```
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Auth pages (login)
│   ├── (dashboard)/              # Protected pages with layout
│   │   ├── dashboard/            # Dashboard page
│   │   ├── transactions/         # Transaction management
│   │   ├── receipts/             # Receipt management
│   │   ├── budgets/              # Budget management
│   │   └── settings/             # User settings
│   ├── api/                      # API routes
│   │   ├── auth/                 # NextAuth routes
│   │   ├── banking/              # Banking integration
│   │   └── receipts/             # Receipt processing
│   └── globals.css               # Global styles
├── components/                   # Reusable UI components
│   ├── ui/                       # shadcn/ui components
│   ├── layout/                   # Layout components
│   ├── dashboard/                # Dashboard-specific components
│   └── providers/                # Context providers
├── lib/                          # Utility libraries
│   ├── auth.ts                   # NextAuth configuration
│   ├── prisma.ts                 # Prisma client
│   ├── banking/                  # Banking providers
│   │   └── providers/            # PlaidProvider, etc.
│   └── ocr/                      # OCR services
├── prisma/                       # Database schema and migrations
│   ├── schema.prisma             # Prisma schema
│   └── seed.ts                   # Seed script
└── public/                       # Static assets
    └── images/
        └── receipts/             # Receipt images
```

### Database Schema

The app uses a normalized PostgreSQL database with the following key models:

- **User**: User accounts
- **Institution**: Connected financial institutions
- **FinancialAccount**: Bank accounts
- **Transaction**: Financial transactions with categorization
- **Category/Subcategory**: Transaction categories
- **Receipt**: Captured receipts with OCR data
- **Budget**: User budgets
- **TransactionRule**: Auto-categorization rules
- **AuditLog**: Change tracking

## Environment Variables

Create a `.env.local` file with:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/duncan_finance"

# NextAuth
NEXTAUTH_SECRET="your-random-secret-key"
NEXTAUTH_URL="http://localhost:3000"

# Email (for NextAuth email provider)
EMAIL_SERVER_HOST="smtp.gmail.com"
EMAIL_SERVER_PORT="587"
EMAIL_SERVER_USER="your-email@gmail.com"
EMAIL_SERVER_PASSWORD="your-app-password"
EMAIL_FROM="your-email@gmail.com"

# Plaid (optional for local dev)
PLAID_CLIENT_ID=""
PLAID_SECRET=""
PLAID_ENV="sandbox"

# OCR (optional)
GOOGLE_DOCUMENT_AI_ENDPOINT=""
GOOGLE_APPLICATION_CREDENTIALS=""
```

## Local Development Setup

### Option 1: Local Setup

1. **Clone and install dependencies**:
   ```bash
   git clone <repo-url>
   cd duncan-finance
   npm install
   ```

2. **Set up PostgreSQL database**:
   ```bash
   createdb duncan_finance
   ```

3. **Configure environment**:
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your values
   ```

4. **Run database migrations**:
   ```bash
   npx prisma migrate dev
   ```

5. **Seed the database**:
   ```bash
   npx prisma db seed
   ```

6. **Start the development server**:
   ```bash
   npm run dev
   ```

### Option 2: Docker Setup

1. **Clone the repository**:
   ```bash
   git clone <repo-url>
   cd duncan-finance
   ```

2. **Start PostgreSQL with Docker Compose**:
   ```bash
   docker-compose up -d
   ```

3. **Configure environment**:
   ```bash
   cp .env.example .env.local
   # DATABASE_URL is already set for Docker
   # Set other required variables
   ```

4. **Install dependencies and run migrations**:
   ```bash
   npm install
   npx prisma migrate dev
   npx prisma db seed
   ```

5. **Start the development server**:
   ```bash
   npm run dev
   ```

The app will be available at `http://localhost:3000` with PostgreSQL running in Docker.

## Switching to Real Plaid Integration

1. Sign up for a Plaid account at [plaid.com](https://plaid.com)
2. Get your client ID and secret from the Plaid dashboard
3. Update `.env.local` with real Plaid credentials
4. Replace `PlaidProvider` stub in `lib/banking/providers/plaid.ts` with real implementation
5. Update API routes in `app/api/banking/` to use real Plaid calls

## Enabling Local Tesseract OCR

1. Install Tesseract on your system:
   ```bash
   # macOS
   brew install tesseract

   # Ubuntu
   sudo apt-get install tesseract-ocr

   # Windows
   # Download from https://github.com/UB-Mannheim/tesseract/wiki
   ```

2. The app will automatically detect and use Tesseract for local OCR processing

## Adding Google Document AI

1. Enable Document AI API in Google Cloud Console
2. Create a service account and download credentials JSON
3. Set `GOOGLE_APPLICATION_CREDENTIALS` to the path of the JSON file
4. Update `lib/ocr/google-document-ai.ts` with your processor details
5. Set `GOOGLE_DOCUMENT_AI_ENDPOINT` in environment

## Common Troubleshooting

### Database Connection Issues
- Ensure PostgreSQL is running
- Check `DATABASE_URL` format
- Run `npx prisma db push` if migrations fail

### Authentication Problems
- Verify `NEXTAUTH_SECRET` is set
- Check email server configuration
- Ensure `NEXTAUTH_URL` matches your dev URL

### Build Errors
- Run `npx prisma generate` after schema changes
- Clear Next.js cache: `rm -rf .next`
- Reinstall dependencies: `rm -rf node_modules && npm install`

### OCR Issues
- For Tesseract: Ensure it's installed and in PATH
- For Google Document AI: Verify credentials and endpoint
- Check file permissions for receipt uploads

## API Routes

- `GET/POST /api/auth/[...nextauth]` - Authentication
- `POST /api/banking/link-token` - Create Plaid link token
- `POST /api/banking/exchange-token` - Exchange public token
- `POST /api/banking/sync` - Sync transactions
- `POST /api/receipts/capture` - Upload receipt
- `POST /api/receipts/ocr` - Process OCR

## Deployment

The app is designed for deployment on Vercel, Netlify, or similar platforms:

1. Set environment variables in your hosting platform
2. Ensure PostgreSQL database is accessible
3. Run `npm run build` for production build
4. Configure domain for PWA manifest

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## License

MIT License - see LICENSE file for details