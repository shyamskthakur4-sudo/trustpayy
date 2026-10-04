# TrustPay — Premium USDT to INR Exchange

TrustPay is a production-grade, Android-first fintech application for instant USDT to INR settlement with direct bank (IMPS) and UPI payout rails.

---

## 🚀 Key Features

### 1. Brand Identity & Visual System
- **Brand Logo:** Original geometric vector emblem incorporating an isometric security vault and dynamic exchange flow.
- **Fintech Theme:** Obsidian Dark (`#06090F`) with Electric Emerald accents (`#00E599`), glassmorphism card surfaces, and monospaced tabular typography for financial figures.
- **Dual Viewport Experience:** Built Android-first with a native device frame (notch, status bar, bottom navigation) and a fluid full-width web responsive mode.

### 2. Non-Custodial Cryptographic Security
- **12-Word Recovery Phrase:** Generated on-device using cryptographically secure BIP-39 wordlist entropy (`window.crypto.getRandomValues`).
- **Interactive Verification Challenge:** Users must verify randomized word positions (e.g. #3, #7, #11) before activating their wallet.
- **Privacy Shield & Re-Authentication:** Recovery phrases start masked and require 6-digit PIN re-authentication before being unveiled in the Profile center.
- **Zero-Knowledge Architecture:** Recovery phrases are never sent to backend logs, telemetry, or admin portals.

### 3. Live Dashboard & Real-Time Converter
- **Main Balance Card:** Displays available USDT balance (e.g. `1,250.00 USDT`) with live INR conversion and exchange rate pill (`1 USDT = ₹107 INR`).
- **Real-Time Calculator:** Live computation of receivable INR with preset chips (`500`, `1,000`, `2,000`, `MAX`), platform fee breakdown (0% free), and direct routing to withdrawal.

### 4. Multi-Network Deposit Hub (5 Networks)
1. **BNB Smart Chain (BEP20)**
2. **TRON (TRC20)**
3. **Arbitrum One (ARB)**
4. **Bitcoin (Omni / Native)**
5. **Solana (SPL)**
- **Dynamic QR Code:** Canvas-rendered QR codes generated dynamically for each network.
- **Strict 500 USDT Minimum:** Inline validation blocks submissions below 500 USDT.
- **Verification Workflow:** Deposits require transaction hash (TxID) input and transition to `Pending Verification`. Balances update only after confirmation validation.

### 5. Instant INR Payout & Order Tracking
- **Dual Payout Rails:** 
  - **UPI:** Instant settlement to user VPA / UPI ID.
  - **IMPS:** Direct bank account payout (Account Number, IFSC, Bank Name).
- **Confirmation Review Modal:** Comprehensive pre-submission review of USDT used, rate, and final INR received.
- **Order Tracking Screen:** Prominently displays Order ID (`#TP-WTH-XXXXX`), status badge, settlement disclaimer, and a 5-stage progress timeline:
  `Submitted` ➔ `Verification` ➔ `Processing` ➔ `Payment Sent` ➔ `Completed`.

### 6. Order Details & In-App Notification Center
- **Receipt Modal:** Full transaction receipt with direct link to blockchain explorers and copyable TxIDs / UTRs.
- **Notification Feed:** Instant alerts for deposits, payouts, security events, and rate changes.

### 7. Support & FAQ Center
- Categorized FAQ accordions.
- **Order-Specific Inquiries:** Dropdown allows linking support tickets directly to active or past orders (e.g., *Need help with Order #TP-000123?*).

### 8. Admin Configuration Console
Accessible via the `ADMIN` button in the top header:
- **Exchange Rate Management:** Live update of the USDT-to-INR rate (default: ₹107).
- **Minimum Deposit Management:** Live update of the deposit threshold (default: 500 USDT).
- **Wallet Network Management:** Update wallet addresses and QR code data for all 5 networks without code changes.
- **Order Workflow Desk:**
  - Verify and approve deposits (automatically credits user balance).
  - Advance withdrawal statuses (`Processing` ➔ `Payment Sent` ➔ `Completed` with bank UTR number) or reject with automatic USDT refund.
- **Users Overview:** View active accounts and KYC verification states (strictly without access to user recovery phrases).
- **Security Audit Logs:** Full audit history of administrative changes.

### 9. Production Database Schema
- Included in `src/supabase_schema.sql` with PostgreSQL tables, foreign keys, row-level security (RLS) policies, indexes, and triggers.

---

## 🛠️ Tech Stack
- **Framework:** React 19 + TypeScript + Vite 8
- **Styling:** Vanilla CSS design system with custom properties (`src/index.css`)
- **QR Code Engine:** `qrcode` canvas renderer
- **Icons:** Custom high-performance SVG vector icons (`src/components/common/Icons.tsx`)
- **State Management:** Reactive local storage store (`src/services/storage.ts`) with Supabase connector readiness (`src/services/supabaseClient.ts`)

---

## 🏃‍♂️ How to Run Locally

```bash
# 1. Install dependencies
npm install

# 2. Start development server
npm run dev

# 3. Build for production
npm run build
```

---

## 🔐 Security Principles
- Non-custodial 12-word mnemonic generated with cryptographic entropy.
- Recovery phrases are never logged or displayed without explicit PIN re-authentication.
- Dual-confirmation workflows for all fund movements.
- Realistic disclaimer that the ~15-minute settlement target depends on banking rail and network conditions.
