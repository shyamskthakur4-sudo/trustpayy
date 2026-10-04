-- ==========================================================
-- TrustPay Production PostgreSQL & Supabase Database Schema
-- Version: 1.0.0
-- ==========================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Users Table
CREATE TABLE IF NOT EXISTS public.trustpay_users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    account_id VARCHAR(32) UNIQUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'pending', 'suspended')),
    balance_usdt NUMERIC(18, 4) DEFAULT 0.0000 NOT NULL CHECK (balance_usdt >= 0),
    security_settings JSONB DEFAULT '{"pin_enabled": false, "biometric_enabled": false, "phrase_backed_up": true}'::jsonb NOT NULL,
    is_demo_mode BOOLEAN DEFAULT FALSE NOT NULL
);

-- 2. Wallet Networks Configuration Table
CREATE TABLE IF NOT EXISTS public.trustpay_wallet_networks (
    id VARCHAR(32) PRIMARY KEY,
    network_name VARCHAR(100) NOT NULL,
    network_standard VARCHAR(50) NOT NULL,
    asset VARCHAR(20) DEFAULT 'USDT' NOT NULL,
    wallet_address TEXT NOT NULL,
    qr_code TEXT,
    active BOOLEAN DEFAULT TRUE NOT NULL,
    explorer_base_url TEXT NOT NULL,
    confirmations_required INT DEFAULT 12 NOT NULL,
    icon_name VARCHAR(50) DEFAULT 'crypto' NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 3. Exchange Settings Table
CREATE TABLE IF NOT EXISTS public.trustpay_exchange_settings (
    id INT PRIMARY KEY DEFAULT 1 CHECK (id = 1),
    exchange_rate NUMERIC(10, 2) DEFAULT 107.00 NOT NULL,
    minimum_deposit NUMERIC(18, 4) DEFAULT 500.0000 NOT NULL,
    processing_target VARCHAR(100) DEFAULT 'Approximately 15 minutes' NOT NULL,
    platform_fee_percent NUMERIC(5, 2) DEFAULT 0.00 NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 4. Deposits Table
CREATE TABLE IF NOT EXISTS public.trustpay_deposits (
    id VARCHAR(64) PRIMARY KEY, -- e.g. TP-DEP-000123
    user_id UUID NOT NULL REFERENCES public.trustpay_users(id) ON DELETE CASCADE,
    network_id VARCHAR(32) NOT NULL REFERENCES public.trustpay_wallet_networks(id),
    network_name VARCHAR(100) NOT NULL,
    amount_usdt NUMERIC(18, 4) NOT NULL CHECK (amount_usdt >= 500),
    amount_inr_equivalent NUMERIC(18, 2) NOT NULL,
    transaction_hash VARCHAR(256) NOT NULL UNIQUE,
    status VARCHAR(30) DEFAULT 'pending_verification' CHECK (status IN ('pending_verification', 'verified', 'rejected')),
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    verified_at TIMESTAMPTZ,
    rejection_reason TEXT,
    admin_notes TEXT
);

-- 5. Withdrawals Table
CREATE TABLE IF NOT EXISTS public.trustpay_withdrawals (
    id VARCHAR(64) PRIMARY KEY, -- e.g. TP-WTH-000456
    user_id UUID NOT NULL REFERENCES public.trustpay_users(id) ON DELETE CASCADE,
    method VARCHAR(20) NOT NULL CHECK (method IN ('UPI', 'IMPS')),
    amount_usdt NUMERIC(18, 4) NOT NULL CHECK (amount_usdt > 0),
    amount_inr NUMERIC(18, 2) NOT NULL CHECK (amount_inr > 0),
    exchange_rate NUMERIC(10, 2) NOT NULL,
    payout_details JSONB NOT NULL,
    status VARCHAR(50) DEFAULT 'submitted' CHECK (status IN (
        'submitted',
        'verification',
        'processing',
        'payment_sent',
        'completed',
        'failed',
        'rejected',
        'cancelled',
        'additional_verification_required'
    )),
    utr_number VARCHAR(100),
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    completed_at TIMESTAMPTZ,
    rejection_reason TEXT,
    admin_notes TEXT
);

-- 6. Transactions Ledger Table
CREATE TABLE IF NOT EXISTS public.trustpay_transactions (
    id VARCHAR(64) PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.trustpay_users(id) ON DELETE CASCADE,
    type VARCHAR(20) NOT NULL CHECK (type IN ('deposit', 'withdrawal')),
    amount_usdt NUMERIC(18, 4) NOT NULL,
    amount_inr NUMERIC(18, 2) NOT NULL,
    status VARCHAR(50) NOT NULL,
    reference_id VARCHAR(64) NOT NULL,
    method_or_network VARCHAR(100) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 7. In-App Notifications Table
CREATE TABLE IF NOT EXISTS public.trustpay_notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.trustpay_users(id) ON DELETE CASCADE,
    title VARCHAR(150) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(30) DEFAULT 'system' CHECK (type IN ('deposit', 'withdrawal', 'security', 'system')),
    read BOOLEAN DEFAULT FALSE NOT NULL,
    order_id VARCHAR(64),
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 8. Admin Audit Logs
CREATE TABLE IF NOT EXISTS public.trustpay_audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    admin_id VARCHAR(64) NOT NULL,
    action VARCHAR(100) NOT NULL,
    target_id VARCHAR(64),
    details TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ==========================================================
-- Indexes for High Performance Queries
-- ==========================================================
CREATE INDEX IF NOT EXISTS idx_trustpay_deposits_user_id ON public.trustpay_deposits(user_id);
CREATE INDEX IF NOT EXISTS idx_trustpay_deposits_status ON public.trustpay_deposits(status);
CREATE INDEX IF NOT EXISTS idx_trustpay_withdrawals_user_id ON public.trustpay_withdrawals(user_id);
CREATE INDEX IF NOT EXISTS idx_trustpay_withdrawals_status ON public.trustpay_withdrawals(status);
CREATE INDEX IF NOT EXISTS idx_trustpay_tx_user_id ON public.trustpay_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_trustpay_notif_user_id ON public.trustpay_notifications(user_id);

-- ==========================================================
-- Initial Data Seeding
-- ==========================================================
INSERT INTO public.trustpay_exchange_settings (id, exchange_rate, minimum_deposit, processing_target, platform_fee_percent, updated_at)
VALUES (1, 107.00, 500.00, 'Approximately 15 minutes', 0.00, NOW())
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.trustpay_wallet_networks (id, network_name, network_standard, asset, wallet_address, active, explorer_base_url, confirmations_required, icon_name)
VALUES
('bsc', 'BNB Smart Chain', 'BEP20', 'USDT', '0xdc114586391B39216c8CD17B3bdDb02dF3CC5F0A', true, 'https://bscscan.com/tx/', 15, 'bnb'),
('tron', 'TRON', 'TRC20', 'USDT', 'TMVhrv1qfySpPfsuUghb19TuZvjzXukD9K', true, 'https://tronscan.org/#/transaction/', 19, 'tron'),
('arbitrum', 'Arbitrum One', 'Arbitrum', 'USDT', '0xdc114586391B39216c8CD17B3bdDb02dF3CC5F0A', true, 'https://arbiscan.io/tx/', 20, 'arbitrum'),
('btc', 'Bitcoin', 'Omni / Native', 'USDT', 'bc1qxny7h6hpkuw47sgmqn228m46k2zmvhexpcns0h', true, 'https://mempool.space/tx/', 3, 'btc'),
('solana', 'Solana', 'SPL', 'USDT', '7rV7Bkz4sjxYDZmhCQPR6WpueXYnZYw35NUFkj6mfGde', true, 'https://solscan.io/tx/', 32, 'solana')
ON CONFLICT (id) DO UPDATE SET wallet_address = EXCLUDED.wallet_address;
