# Carbon Ledger Trust

A full-stack application for transparent carbon credit management: companies submit emission reports, regulators approve or reject them, and approved reports result in on-chain carbon credits that can be transferred or retired. Built with React (frontend), Express + MongoDB (backend), and Hardhat + Solidity (blockchain).

---

## Prerequisites

- **Node.js** (v18 or later) and **npm**
- **MongoDB** – either [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) (cloud) or a local MongoDB instance
- **MetaMask** (or any Ethereum wallet) – for connecting wallet, transferring, and retiring credits on the local chain

---

## Project structure

```
carbon-ledger-trust/
├── src/                    # Frontend (React + Vite)
├── public/
├── index.html
├── package.json            # Frontend dependencies & scripts
├── backend/                # Backend + blockchain
│   ├── src/                # Express API, controllers, models, services
│   ├── contracts/         # Solidity (CarbonCreditToken, CarbonCreditRegistry)
│   ├── scripts/           # Hardhat deploy script
│   ├── hardhat.config.cjs
│   └── package.json       # Backend + Hardhat dependencies
└── README.md
```

---

## Setup

### 1. Open the project

Open a terminal and navigate to the project root (the folder that contains `package.json` and the `backend` folder).

### 2. Install frontend dependencies

From the **project root** (same folder as `package.json` for the React app):

```bash
npm install
```

If you see peer dependency conflicts, you can use:

```bash
npm install --legacy-peer-deps
```

### 3. Install backend dependencies (use `--legacy-peer-deps`)

Hardhat and related packages often need `--legacy-peer-deps`. From the project root:

```bash
cd backend
npm install --legacy-peer-deps
cd ..
```

### 4. Configure backend environment variables

In the `backend` folder, create a `.env` file (copy from `.env.example` if present, or create one with):

```env
# Required: MongoDB connection string (Atlas or local)
MONGODB_URI=mongodb://localhost:27017/carbon-ledger
# Or MongoDB Atlas: mongodb+srv://<user>:<password>@<cluster>.mongodb.net

# Required for issuing credits on-chain (set after deploying contracts)
REGULATOR_WALLET_PRIVATE_KEY=0x...
CARBON_CREDIT_TOKEN_ADDRESS=0x...
CARBON_CREDIT_REGISTRY_ADDRESS=0x...

# Optional
JWT_SECRET=your-secret-key
JWT_EXPIRE=7d
PORT=3000
BLOCKCHAIN_RPC_URL=http://localhost:8545
UPLOAD_DIR=./uploads
```

You will fill `REGULATOR_WALLET_PRIVATE_KEY` and the two contract addresses in **Step 6** after deploying.

### 5. Start the local blockchain (Hardhat node)

Open a **first terminal**, go to the backend folder, and run:

```bash
cd backend
npm run node
```

Leave this running. It starts a local Ethereum node at `http://localhost:8545` (chainId `31337`) and prints a list of accounts with private keys. You will use **account #0** (or any account) as the regulator wallet in the next step.

### 6. Deploy contracts and update `.env`

Open a **second terminal** (keep the Hardhat node running in the first):

```bash
cd backend
npm run deploy:local
```

The script will print two addresses, for example:

- `CarbonCreditToken: 0x...`
- `CarbonCreditRegistry: 0x...`

Copy the **private key** of the deployer account (e.g. account #0 from the Hardhat node output) and the two **contract addresses** into `backend/.env`:

```env
REGULATOR_WALLET_PRIVATE_KEY=0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
CARBON_CREDIT_TOKEN_ADDRESS=0x5FbDB2315678afecb367f032d93F642f64180aa3
CARBON_CREDIT_REGISTRY_ADDRESS=0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512
```

(Use the values printed by your own `npm run node` and `npm run deploy:local`.)

### 7. Start the backend API

From the project root or from `backend`:

```bash
cd backend
npm run dev
```

The API will run at `http://localhost:3000`. Keep this terminal open.

### 8. Start the frontend

Open a **third terminal** from the project root:

```bash
npm run dev
```

The app will run at `http://localhost:8080` (or the port Vite prints). Open that URL in your browser.

### 9. (Optional) Point frontend to a different API URL

If your API is not at `http://localhost:3000`, create a `.env` in the **project root** (next to the frontend `package.json`):

```env
VITE_API_URL=http://localhost:3000/api
```

Then restart the frontend (`npm run dev`).

---

## MetaMask wallet setup (step-by-step for beginners)

The app uses MetaMask to connect your browser to the **local blockchain** (Hardhat). You need to install MetaMask, add the local network, and use an account that has test ETH on that network. Follow these steps in order.

### Step 1: Install MetaMask

1. Go to [metamask.io](https://metamask.io/) and click **Download**.
2. Install the browser extension for Chrome, Firefox, Edge, or Brave.
3. Open MetaMask. Either **Create a new wallet** (set a password, save the secret recovery phrase somewhere safe) or **Import an existing wallet** if you already have one. You can use a fresh wallet for local testing.

### Step 2: Add the “Local” network (Hardhat)

The app talks to a blockchain running on your machine, not the real Ethereum network. You must add this network in MetaMask.

1. Open the MetaMask extension and click the **network dropdown** at the top (it usually says “Ethereum Mainnet” or “Default”).
2. Click **“Add network”** or **“Add a network manually”**.
3. Fill in **only** these fields (leave others blank or default):

   | Field            | Value                  |
   |------------------|------------------------|
   | **Network name** | `Local` (or “Hardhat”)  |
   | **RPC URL**      | `http://localhost:8545` |
   | **Chain ID**     | `31337`                |
   | **Currency symbol** | `ETH` (optional)   |

4. Click **Save**. Your MetaMask should now show “Local” (or the name you chose) as the selected network.

**Important:** Keep the Hardhat node running (`npm run node` in the backend folder). If the node is stopped, MetaMask will show “Could not connect” on this network.

### Step 3: Get a private key from the Hardhat node

When you run `npm run node` in the backend folder, the terminal prints a list of **accounts** and their **private keys**. You need one of these so MetaMask can “be” that account and spend its test ETH.

1. In the terminal where **Hardhat is running** (where you ran `npm run node`), scroll to the list that looks like:

   ```
   Account #0: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
   Private Key: 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
   ```

2. Copy the **Private Key** of **Account #0** (or any account). It always starts with `0x` and is 66 characters long. Keep it secret; only use it for this local test network.

### Step 4: Import that account into MetaMask

So that MetaMask can use the test ETH that Hardhat gave to Account #0:

1. In MetaMask, click the **account icon** (circle) at the top right.
2. Click **“Add account or hardware wallet”** (or **“Import account”**).
3. Choose **“Import a private key”**.
4. Paste the private key you copied from the Hardhat terminal and click **Import**.
5. MetaMask will switch to this new account. Make sure the **network** is still **Local** (dropdown at the top). You should see a balance of **10,000 ETH** (or close to it). That’s test ETH only for this local chain.

You can repeat Step 3–4 with another Hardhat account (e.g. Account #1) if you want a second wallet (e.g. to test transfers between two users).

### Step 5: Use the wallet in the Carbon Ledger app

1. Open the app in your browser (e.g. `http://localhost:8080`).
2. **Sign up** as **Company** or **Regulator** (email + password). Then **log in**.
3. In the dashboard you’ll see options to **“Connect wallet”** or **“Link wallet”**. Click that.
4. MetaMask will pop up asking to **connect** or **add the site**. Approve it.
5. After connecting, the app will link your MetaMask address to your account. You can then:
   - **As Company:** receive issued credits, **transfer** credits to another address, or **retire** credits (all require signing in MetaMask).
   - **As Regulator:** the backend uses its own wallet to mint credits; you don’t need to send transactions from MetaMask for approving reports.

**Tip:** For transfers and retirements, the MetaMask account must be the one that **owns** the credits. Use the same account you linked in the app.

---

## Quick reference: run order

| Order | Terminal | Command              | Purpose                    |
|-------|----------|----------------------|----------------------------|
| 1     | 1        | `cd backend && npm run node`        | Start local blockchain     |
| 2     | 2        | `cd backend && npm run deploy:local`| Deploy contracts (one-time)|
| 3     | 2        | Update `backend/.env` with addresses & regulator key | Configure backend   |
| 4     | 2        | `cd backend && npm run dev`         | Start API                  |
| 5     | 3        | `npm run dev` (from root)            | Start frontend             |

---

## Scripts summary

**Frontend (root):**

- `npm run dev` – start dev server
- `npm run build` – production build
- `npm run preview` – preview production build

**Backend (`backend/`):**

- `npm run dev` – start API with hot reload
- `npm run node` – start Hardhat local node
- `npm run compile` – compile Solidity contracts
- `npm run deploy:local` – deploy contracts to local node (run after `npm run node`)

---

## Troubleshooting

- **`npm install` fails in backend**  
  Use: `npm install --legacy-peer-deps` (Hardhat-related dependencies often require this).

- **“Report not found” / “Credit not found”**  
  Ensure the backend is running and `MONGODB_URI` in `backend/.env` is correct.

- **Minting or transfer fails on-chain**  
  Ensure the Hardhat node is running, contracts are deployed, and `backend/.env` has the correct `REGULATOR_WALLET_PRIVATE_KEY`, `CARBON_CREDIT_TOKEN_ADDRESS`, and `CARBON_CREDIT_REGISTRY_ADDRESS`.

- **Frontend can’t reach API**  
  Check that the API is at `http://localhost:3000` or set `VITE_API_URL` in the root `.env` and restart the frontend.

- **MetaMask shows 0 ETH / transaction fails**  
  Use an account imported from the Hardhat node (e.g. account #0) so it has test ETH for gas on the local chain. See **MetaMask wallet setup** above.

- **MetaMask says “Could not connect” or “Wrong network”**  
  Ensure the Hardhat node is running (`npm run node` in `backend`). In MetaMask, select the **Local** network and confirm RPC URL is `http://localhost:8545` and Chain ID is `31337`.

---

## Tech stack

- **Frontend:** React 18, Vite, TypeScript, Tailwind CSS, shadcn/ui, React Query, React Router, ethers.js, MetaMask
- **Backend:** Express, MongoDB (Mongoose), JWT auth, Multer (uploads)
- **Blockchain:** Hardhat, Solidity (CarbonCreditToken ERC-721, CarbonCreditRegistry), ethers.js
