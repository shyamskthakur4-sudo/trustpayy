export type NetworkId = 'bsc' | 'tron' | 'arbitrum' | 'btc' | 'solana';

export interface WalletNetwork {
  id: NetworkId;
  network_name: string;
  network_standard: string;
  asset: 'USDT';
  wallet_address: string;
  qr_code?: string;
  active: boolean;
  explorer_base_url: string;
  confirmations_required: number;
  icon_name: string;
}

export interface ExchangeSettings {
  exchange_rate: number; // e.g. 107 INR per USDT
  minimum_deposit: number; // e.g. 500 USDT
  processing_target: string; // "Approximately 15 minutes"
  platform_fee_percent: number; // 0
  updated_at: string;
}

export interface UserSecuritySettings {
  pin_enabled: boolean;
  pin_hash?: string;
  biometric_enabled: boolean;
  phrase_backed_up: boolean;
  last_login: string;
  recovery_phrase?: string[]; // stored in secure client storage for restore/backup, never logged
}

export interface UserAccount {
  id: string;
  account_id: string; // e.g. TP-948201
  created_at: string;
  status: 'active' | 'pending' | 'suspended';
  balance_usdt: number;
  security_settings: UserSecuritySettings;
  is_demo_mode: boolean;
}

export type DepositStatus = 'pending_verification' | 'verified' | 'rejected';

export interface DepositOrder {
  id: string; // TP-DEP-XXXXX
  user_id: string;
  network_id: NetworkId;
  network_name: string;
  amount_usdt: number;
  amount_inr_equivalent: number;
  transaction_hash: string;
  status: DepositStatus;
  created_at: string;
  verified_at?: string;
  rejection_reason?: string;
  admin_notes?: string;
}

export type WithdrawalStatus =
  | 'submitted'
  | 'verification'
  | 'processing'
  | 'payment_sent'
  | 'completed'
  | 'failed'
  | 'rejected'
  | 'cancelled'
  | 'additional_verification_required';

export interface UpiPayoutDetails {
  type: 'UPI';
  account_holder_name: string;
  upi_id: string;
}

export interface ImpsPayoutDetails {
  type: 'IMPS';
  account_holder_name: string;
  bank_account_number: string;
  ifsc_code: string;
  bank_name: string;
}

export type PayoutDetails = UpiPayoutDetails | ImpsPayoutDetails;

export interface WithdrawalOrder {
  id: string; // TP-WTH-XXXXX
  user_id: string;
  method: 'UPI' | 'IMPS';
  amount_usdt: number;
  amount_inr: number;
  exchange_rate: number;
  payout_details: PayoutDetails;
  status: WithdrawalStatus;
  utr_number?: string;
  created_at: string;
  updated_at: string;
  completed_at?: string;
  rejection_reason?: string;
  admin_notes?: string;
}

export type TransactionType = 'deposit' | 'withdrawal';

export interface TransactionSummary {
  id: string;
  reference_id: string;
  type: TransactionType;
  amount_usdt: number;
  amount_inr: number;
  status: DepositStatus | WithdrawalStatus;
  method_or_network: string;
  created_at: string;
  raw_deposit?: DepositOrder;
  raw_withdrawal?: WithdrawalOrder;
}

export interface AppNotification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'deposit' | 'withdrawal' | 'security' | 'system';
  read: boolean;
  order_id?: string;
  created_at: string;
}

export interface AdminAuditLog {
  id: string;
  admin_id: string;
  action: string;
  target_id?: string;
  details: string;
  created_at: string;
}

export interface SupportTicket {
  id: string;
  user_id: string;
  order_id?: string;
  category: 'deposit' | 'withdrawal' | 'exchange' | 'security' | 'other';
  subject: string;
  message: string;
  status: 'open' | 'in_progress' | 'resolved';
  created_at: string;
  responses: Array<{
    sender: 'user' | 'support';
    text: string;
    timestamp: string;
  }>;
}
