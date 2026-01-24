# Carbon Ledger Backend

Backend API for Carbon Ledger Trust - Company-Regulator Flow

## Setup Instructions

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Environment Variables

Copy `.env.example` to `.env` and fill in the values:

```bash
cp .env.example .env
```

Required environment variables:
- `MONGODB_URI` - MongoDB connection string
- `JWT_SECRET` - Secret key for JWT tokens
- `REGULATOR_WALLET_PRIVATE_KEY` - Private key for server wallet (for issuing credits)
- `CARBON_CREDIT_TOKEN_ADDRESS` - Deployed token contract address
- `CARBON_CREDIT_REGISTRY_ADDRESS` - Deployed registry contract address

### 3. Start MongoDB

Make sure MongoDB is running locally or update `MONGODB_URI` to your MongoDB instance.

### 4. Start Hardhat Local Node

In a separate terminal:

```bash
cd backend
npm run node
```

This starts a local Hardhat node on `http://localhost:8545`

### 5. Deploy Smart Contracts

In another terminal:

```bash
cd backend
npm run compile
npm run deploy:local
```

Copy the deployed contract addresses to your `.env` file:
- `CARBON_CREDIT_TOKEN_ADDRESS`
- `CARBON_CREDIT_REGISTRY_ADDRESS`

### 6. Start Backend Server

```bash
cd backend
npm run dev
```

Server will start on `http://localhost:3000`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user
- `POST /api/auth/link-wallet` - Link wallet address

### Reports (Company)
- `POST /api/reports` - Submit emission report
- `GET /api/reports` - Get all reports
- `GET /api/reports/:id` - Get report by ID
- `POST /api/reports/:id/documents` - Upload documents

### Reviews (Regulator)
- `GET /api/reviews/pending` - Get pending reviews
- `GET /api/reviews/:id` - Get review details
- `POST /api/reviews/:id/approve` - Approve report (issues credits)
- `POST /api/reviews/:id/reject` - Reject report
- `GET /api/reviews/approved` - Get approved reports

### Credits (Company)
- `GET /api/credits` - Get user's credits
- `GET /api/credits/:id` - Get credit details
- `GET /api/credits/wallet` - Get wallet balance

### Transactions (Company)
- `GET /api/transactions` - Get transaction history
- `GET /api/transactions/:id` - Get transaction details

### Audit Log (Regulator)
- `GET /api/audit` - Get audit logs
- `GET /api/audit/stats` - Get audit statistics

## Workflow

1. **Company Registration**: Company registers and links wallet
2. **Report Submission**: Company submits emission report with documents
3. **Regulator Review**: Regulator reviews pending reports
4. **Approval**: Regulator approves → Credits issued on blockchain
5. **Credit Management**: Company views credits in wallet

## Testing

Use the Hardhat local node accounts for testing:
- Account 0: Default deployer (has ISSUER_ROLE)
- Account 1-19: Test accounts

## Notes

- All file uploads are stored locally in `backend/uploads/`
- Blockchain transactions use the server wallet (REGULATOR_WALLET_PRIVATE_KEY)
- Make sure Hardhat node is running before starting the backend
