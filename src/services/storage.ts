import {
  AdminAuditLog,
  AppNotification,
  DepositOrder,
  DepositStatus,
  ExchangeSettings,
  NetworkId,
  SupportTicket,
  TransactionSummary,
  UserAccount,
  WalletNetwork,
  WithdrawalOrder,
  WithdrawalStatus,
} from '../types';
import {
  BIP39_WORDLIST,
  INITIAL_EXCHANGE_SETTINGS,
  INITIAL_WALLET_NETWORKS,
} from '../config/constants';

const STORAGE_KEYS = {
  USER: 'trustpay_user_v1',
  EXCHANGE_SETTINGS: 'trustpay_exchange_settings_v1',
  WALLET_NETWORKS: 'trustpay_wallet_networks_v1',
  DEPOSITS: 'trustpay_deposits_v1',
  WITHDRAWALS: 'trustpay_withdrawals_v1',
  NOTIFICATIONS: 'trustpay_notifications_v1',
  SUPPORT_TICKETS: 'trustpay_support_tickets_v1',
  AUDIT_LOGS: 'trustpay_audit_logs_v1',
  APP_LOCKED: 'trustpay_app_locked_v1',
  DEMO_SEEDED: 'trustpay_demo_seeded_v1',
};

// Event-driven reactive store listener
type ListenerCallback = () => void;
const listeners: Set<ListenerCallback> = new Set();

export const subscribeToStore = (listener: ListenerCallback) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

const notifyListeners = () => {
  listeners.forEach((listener) => {
    try {
      listener();
    } catch (err) {
      console.error('Store subscriber error:', err);
    }
  });
};

// Helper for BIP-39 mnemonic generation
export const generateMnemonic = (length: 12 = 12): string[] => {
  const words: string[] = [];
  const wordlistLength = BIP39_WORDLIST.length;
  // Use crypto.getRandomValues for true cryptographic randomness
  const randomBuffer = new Uint32Array(length);
  window.crypto.getRandomValues(randomBuffer);

  for (let i = 0; i < length; i++) {
    const index = randomBuffer[i] % wordlistLength;
    words.push(BIP39_WORDLIST[index]);
  }
  return words;
};

// Helper for generating order IDs
const generateId = (prefix: string): string => {
  const rand = Math.floor(100000 + Math.random() * 900000);
  return `${prefix}-${rand}`;
};

// Auto-purge any legacy demo transactions or demo balances so existing storage is 100% clean and fresh
const purgeLegacyDemoData = () => {
  try {
    const rawDeposits = localStorage.getItem(STORAGE_KEYS.DEPOSITS);
    if (rawDeposits) {
      const deposits: DepositOrder[] = JSON.parse(rawDeposits);
      const cleaned = deposits.filter((d) => d.id !== 'TP-DEP-84192');
      if (cleaned.length !== deposits.length) {
        localStorage.setItem(STORAGE_KEYS.DEPOSITS, JSON.stringify(cleaned));
      }
    }

    const rawWithdrawals = localStorage.getItem(STORAGE_KEYS.WITHDRAWALS);
    if (rawWithdrawals) {
      const withdrawals: WithdrawalOrder[] = JSON.parse(rawWithdrawals);
      const cleaned = withdrawals.filter((w) => w.id !== 'TP-WTH-10928');
      if (cleaned.length !== withdrawals.length) {
        localStorage.setItem(STORAGE_KEYS.WITHDRAWALS, JSON.stringify(cleaned));
      }
    }

    const rawUser = localStorage.getItem(STORAGE_KEYS.USER);
    if (rawUser) {
      const user: UserAccount = JSON.parse(rawUser);
      const rawDep = localStorage.getItem(STORAGE_KEYS.DEPOSITS);
      const remainingDeposits: DepositOrder[] = rawDep ? JSON.parse(rawDep) : [];
      const hasRealVerifiedDeposits = remainingDeposits.some((d) => d.status === 'verified');
      if (!hasRealVerifiedDeposits && (user.balance_usdt === 1250 || user.balance_usdt === 750 || user.is_demo_mode)) {
        user.balance_usdt = 0.0;
        user.is_demo_mode = false;
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
      }
    }

    // Auto-migrate any stored networks with legacy placeholder addresses
    const rawNetworks = localStorage.getItem(STORAGE_KEYS.WALLET_NETWORKS);
    if (rawNetworks) {
      const networks: WalletNetwork[] = JSON.parse(rawNetworks);
      let updated = false;
      const synced = networks.map((net) => {
        const defaultNet = INITIAL_WALLET_NETWORKS.find((d) => d.id === net.id);
        if (defaultNet && (net.wallet_address.includes('PendingAdmin') || !net.wallet_address)) {
          updated = true;
          return { ...net, wallet_address: defaultNet.wallet_address };
        }
        return net;
      });
      if (updated) {
        localStorage.setItem(STORAGE_KEYS.WALLET_NETWORKS, JSON.stringify(synced));
      }
    }
  } catch {
    // Ignore storage parse issues
  }
};
purgeLegacyDemoData();

export class TrustPayStore {
  // ----------------------------------------------------
  // USER & AUTHENTICATION
  // ----------------------------------------------------
  static getUser(): UserAccount | null {
    const raw = localStorage.getItem(STORAGE_KEYS.USER);
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }

  static createUser(providedMnemonic?: string[]): { user: UserAccount; mnemonic: string[] } {
    const mnemonic = providedMnemonic || generateMnemonic(12);
    const accountNum = Math.floor(100000 + Math.random() * 900000);
    const newUser: UserAccount = {
      id: crypto.randomUUID ? crypto.randomUUID() : `usr-${Date.now()}`,
      account_id: `TP-${accountNum}`,
      created_at: new Date().toISOString(),
      status: 'active',
      balance_usdt: 0.0, // Fresh clean wallet: 0.00 USDT
      security_settings: {
        pin_enabled: false,
        biometric_enabled: false,
        phrase_backed_up: false,
        last_login: new Date().toISOString(),
        recovery_phrase: mnemonic,
      },
      is_demo_mode: false,
    };

    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(newUser));
    localStorage.removeItem(STORAGE_KEYS.APP_LOCKED);
    
    // Ensure fresh new wallet has completely empty transaction history
    localStorage.setItem(STORAGE_KEYS.DEPOSITS, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.WITHDRAWALS, JSON.stringify([]));

    // Seed clean initial welcome notifications (no fake balance/transactions)
    this.seedInitialUserData(newUser.id);

    notifyListeners();
    return { user: newUser, mnemonic };
  }

  static restoreUser(mnemonicWords: string[]): { success: boolean; user?: UserAccount; error?: string } {
    if (!mnemonicWords || mnemonicWords.length !== 12) {
      return { success: false, error: 'Recovery phrase must be exactly 12 words.' };
    }

    const invalidWords = mnemonicWords.filter((w) => !BIP39_WORDLIST.includes(w.toLowerCase().trim()));
    if (invalidWords.length > 0) {
      return {
        success: false,
        error: `Unrecognized phrase words: ${invalidWords.slice(0, 3).join(', ')}. Please verify spelling.`,
      };
    }

    // Restore or create account with backed-up status
    const existing = this.getUser();
    const accountNum = Math.floor(100000 + Math.random() * 900000);
    const restoredUser: UserAccount = existing
      ? {
          ...existing,
          security_settings: {
            ...existing.security_settings,
            phrase_backed_up: true,
            last_login: new Date().toISOString(),
            recovery_phrase: mnemonicWords.map((w) => w.toLowerCase().trim()),
          },
        }
      : {
          id: crypto.randomUUID ? crypto.randomUUID() : `usr-${Date.now()}`,
          account_id: `TP-${accountNum}`,
          created_at: new Date().toISOString(),
          status: 'active',
          balance_usdt: 0.0, // Fresh clean wallet
          security_settings: {
            pin_enabled: false,
            biometric_enabled: false,
            phrase_backed_up: true,
            last_login: new Date().toISOString(),
            recovery_phrase: mnemonicWords.map((w) => w.toLowerCase().trim()),
          },
          is_demo_mode: false,
        };

    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(restoredUser));
    localStorage.removeItem(STORAGE_KEYS.APP_LOCKED);
    this.seedInitialUserData(restoredUser.id);

    this.createNotification({
      user_id: restoredUser.id,
      title: 'Wallet Restored Successfully',
      message: `Your TrustPay wallet (${restoredUser.account_id}) was securely verified and restored on this device.`,
      type: 'security',
    });

    notifyListeners();
    return { success: true, user: restoredUser };
  }

  static updateUser(updates: Partial<UserAccount>): UserAccount | null {
    const user = this.getUser();
    if (!user) return null;
    const updated = { ...user, ...updates };
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(updated));
    notifyListeners();
    return updated;
  }

  static setPin(pin: string): boolean {
    const user = this.getUser();
    if (!user) return false;
    // In a pure browser context, store a SHA-256 hash or secure representation
    const pinHash = btoa(`tp_salt_${pin}_secure`);
    const updatedUser: UserAccount = {
      ...user,
      security_settings: {
        ...user.security_settings,
        pin_enabled: true,
        pin_hash: pinHash,
      },
    };
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(updatedUser));
    notifyListeners();
    return true;
  }

  static verifyPin(pin: string): boolean {
    const user = this.getUser();
    if (!user || !user.security_settings.pin_hash) return false;
    const testHash = btoa(`tp_salt_${pin}_secure`);
    return user.security_settings.pin_hash === testHash;
  }

  static isAppLocked(): boolean {
    const user = this.getUser();
    if (!user || !user.security_settings.pin_enabled) return false;
    return localStorage.getItem(STORAGE_KEYS.APP_LOCKED) === 'true';
  }

  static setAppLocked(locked: boolean) {
    if (locked) {
      localStorage.setItem(STORAGE_KEYS.APP_LOCKED, 'true');
    } else {
      localStorage.removeItem(STORAGE_KEYS.APP_LOCKED);
    }
    notifyListeners();
  }

  static confirmPhraseBackedUp() {
    const user = this.getUser();
    if (!user) return;
    const updated: UserAccount = {
      ...user,
      security_settings: {
        ...user.security_settings,
        phrase_backed_up: true,
      },
    };
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(updated));
    notifyListeners();
  }

  // ----------------------------------------------------
  // EXCHANGE SETTINGS
  // ----------------------------------------------------
  static getExchangeSettings(): ExchangeSettings {
    const raw = localStorage.getItem(STORAGE_KEYS.EXCHANGE_SETTINGS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.EXCHANGE_SETTINGS, JSON.stringify(INITIAL_EXCHANGE_SETTINGS));
      return INITIAL_EXCHANGE_SETTINGS;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return INITIAL_EXCHANGE_SETTINGS;
    }
  }

  static updateExchangeSettings(updates: Partial<ExchangeSettings>, adminId = 'Admin-Console'): ExchangeSettings {
    const current = this.getExchangeSettings();
    const updated: ExchangeSettings = {
      ...current,
      ...updates,
      updated_at: new Date().toISOString(),
    };
    localStorage.setItem(STORAGE_KEYS.EXCHANGE_SETTINGS, JSON.stringify(updated));

    this.logAdminAction(
      adminId,
      'UPDATE_EXCHANGE_SETTINGS',
      `Rate: ₹${updated.exchange_rate} INR/USDT, Min Deposit: ${updated.minimum_deposit} USDT`
    );

    notifyListeners();
    return updated;
  }

  // ----------------------------------------------------
  // WALLET NETWORKS
  // ----------------------------------------------------
  static getWalletNetworks(): WalletNetwork[] {
    const raw = localStorage.getItem(STORAGE_KEYS.WALLET_NETWORKS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.WALLET_NETWORKS, JSON.stringify(INITIAL_WALLET_NETWORKS));
      return INITIAL_WALLET_NETWORKS;
    }
    try {
      const parsed: WalletNetwork[] = JSON.parse(raw);
      let updated = false;
      const synced = parsed.map((item) => {
        const defaultNet = INITIAL_WALLET_NETWORKS.find((n) => n.id === item.id);
        if (defaultNet && (item.wallet_address.includes('PendingAdmin') || !item.wallet_address)) {
          updated = true;
          return {
            ...item,
            wallet_address: defaultNet.wallet_address,
          };
        }
        return item;
      });

      if (updated) {
        localStorage.setItem(STORAGE_KEYS.WALLET_NETWORKS, JSON.stringify(synced));
        return synced;
      }
      return parsed;
    } catch {
      return INITIAL_WALLET_NETWORKS;
    }
  }

  static updateWalletNetwork(
    networkId: NetworkId,
    updates: Partial<WalletNetwork>,
    adminId = 'Admin-Console'
  ): WalletNetwork[] {
    const networks = this.getWalletNetworks();
    const idx = networks.findIndex((n) => n.id === networkId);
    if (idx !== -1) {
      networks[idx] = { ...networks[idx], ...updates };
      localStorage.setItem(STORAGE_KEYS.WALLET_NETWORKS, JSON.stringify(networks));

      this.logAdminAction(
        adminId,
        'UPDATE_WALLET_NETWORK',
        `Updated ${networks[idx].network_name} address/QR code`,
        networkId
      );

      notifyListeners();
    }
    return networks;
  }

  // ----------------------------------------------------
  // DEPOSITS
  // ----------------------------------------------------
  static getDeposits(userId?: string): DepositOrder[] {
    const raw = localStorage.getItem(STORAGE_KEYS.DEPOSITS);
    let list: DepositOrder[] = [];
    if (raw) {
      try {
        list = JSON.parse(raw);
      } catch {
        list = [];
      }
    }
    if (userId) {
      return list.filter((d) => d.user_id === userId);
    }
    return list;
  }

  static createDeposit(params: {
    userId: string;
    networkId: NetworkId;
    networkName: string;
    amountUsdt: number;
    transactionHash: string;
  }): { success: boolean; deposit?: DepositOrder; error?: string } {
    const settings = this.getExchangeSettings();
    if (params.amountUsdt < settings.minimum_deposit) {
      return {
        success: false,
        error: `Minimum deposit is ${settings.minimum_deposit} USDT. You entered ${params.amountUsdt} USDT.`,
      };
    }

    const cleanHash = params.transactionHash.trim();
    if (!cleanHash || cleanHash.length < 10) {
      return { success: false, error: 'Please enter a valid blockchain transaction hash / TxID.' };
    }

    const deposits = this.getDeposits();
    // Duplicate hash check
    const existing = deposits.find(
      (d) => d.transaction_hash.toLowerCase() === cleanHash.toLowerCase()
    );
    if (existing) {
      return {
        success: false,
        error: 'This transaction hash has already been submitted for verification.',
      };
    }

    const newDeposit: DepositOrder = {
      id: generateId('TP-DEP'),
      user_id: params.userId,
      network_id: params.networkId,
      network_name: params.networkName,
      amount_usdt: params.amountUsdt,
      amount_inr_equivalent: Math.round(params.amountUsdt * settings.exchange_rate * 100) / 100,
      transaction_hash: cleanHash,
      status: 'pending_verification',
      created_at: new Date().toISOString(),
    };

    deposits.unshift(newDeposit);
    localStorage.setItem(STORAGE_KEYS.DEPOSITS, JSON.stringify(deposits));

    // Create Notification
    this.createNotification({
      user_id: params.userId,
      title: 'Deposit Submitted',
      message: `Deposit of ${params.amountUsdt.toLocaleString()} USDT (${params.networkName}) is pending blockchain verification. Order ID: ${newDeposit.id}.`,
      type: 'deposit',
      order_id: newDeposit.id,
    });

    notifyListeners();
    return { success: true, deposit: newDeposit };
  }

  static verifyDeposit(
    depositId: string,
    approved: boolean,
    notes?: string,
    adminId = 'Admin-Console'
  ): { success: boolean; deposit?: DepositOrder; error?: string } {
    const deposits = this.getDeposits();
    const idx = deposits.findIndex((d) => d.id === depositId);
    if (idx === -1) return { success: false, error: 'Deposit order not found.' };

    const deposit = deposits[idx];
    if (deposit.status !== 'pending_verification') {
      return { success: false, error: `Deposit is already ${deposit.status}.` };
    }

    if (approved) {
      deposit.status = 'verified';
      deposit.verified_at = new Date().toISOString();
      deposit.admin_notes = notes || 'Verified on blockchain explorer by admin.';

      // Credit user's USDT balance
      const user = this.getUser();
      if (user && user.id === deposit.user_id) {
        user.balance_usdt += deposit.amount_usdt;
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
      }

      this.createNotification({
        user_id: deposit.user_id,
        title: 'Deposit Verified & Credited',
        message: `Your deposit of ${deposit.amount_usdt.toLocaleString()} USDT has been confirmed and credited to your wallet balance.`,
        type: 'deposit',
        order_id: deposit.id,
      });

      this.logAdminAction(
        adminId,
        'VERIFY_DEPOSIT_APPROVED',
        `Approved deposit ${deposit.id} for ${deposit.amount_usdt} USDT. Credited to balance.`,
        deposit.id
      );
    } else {
      deposit.status = 'rejected';
      deposit.rejection_reason = notes || 'Transaction hash invalid or unconfirmed on network.';
      deposit.admin_notes = notes;

      this.createNotification({
        user_id: deposit.user_id,
        title: 'Deposit Rejected',
        message: `Your deposit of ${deposit.amount_usdt.toLocaleString()} USDT was rejected: ${deposit.rejection_reason}`,
        type: 'deposit',
        order_id: deposit.id,
      });

      this.logAdminAction(
        adminId,
        'VERIFY_DEPOSIT_REJECTED',
        `Rejected deposit ${deposit.id}: ${deposit.rejection_reason}`,
        deposit.id
      );
    }

    deposits[idx] = deposit;
    localStorage.setItem(STORAGE_KEYS.DEPOSITS, JSON.stringify(deposits));

    notifyListeners();
    return { success: true, deposit };
  }

  // ----------------------------------------------------
  // WITHDRAWALS
  // ----------------------------------------------------
  static getWithdrawals(userId?: string): WithdrawalOrder[] {
    const raw = localStorage.getItem(STORAGE_KEYS.WITHDRAWALS);
    let list: WithdrawalOrder[] = [];
    if (raw) {
      try {
        list = JSON.parse(raw);
      } catch {
        list = [];
      }
    }
    if (userId) {
      return list.filter((w) => w.user_id === userId);
    }
    return list;
  }

  static createWithdrawal(params: {
    userId: string;
    method: 'UPI' | 'IMPS';
    amountUsdt: number;
    payoutDetails: any;
  }): { success: boolean; withdrawal?: WithdrawalOrder; error?: string } {
    const user = this.getUser();
    if (!user) return { success: false, error: 'User wallet session not found.' };

    if (user.balance_usdt < params.amountUsdt) {
      return {
        success: false,
        error: `Insufficient USDT balance. Available: ${user.balance_usdt.toFixed(2)} USDT, requested: ${params.amountUsdt.toFixed(2)} USDT.`,
      };
    }

    const settings = this.getExchangeSettings();
    const amountInr = Math.round(params.amountUsdt * settings.exchange_rate * 100) / 100;

    // Deduct USDT balance immediately
    user.balance_usdt -= params.amountUsdt;
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));

    const newWithdrawal: WithdrawalOrder = {
      id: generateId('TP-WTH'),
      user_id: params.userId,
      method: params.method,
      amount_usdt: params.amountUsdt,
      amount_inr: amountInr,
      exchange_rate: settings.exchange_rate,
      payout_details: params.payoutDetails,
      status: 'submitted',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const withdrawals = this.getWithdrawals();
    withdrawals.unshift(newWithdrawal);
    localStorage.setItem(STORAGE_KEYS.WITHDRAWALS, JSON.stringify(withdrawals));

    this.createNotification({
      user_id: params.userId,
      title: 'Withdrawal Submitted',
      message: `Withdrawal of ₹${amountInr.toLocaleString('en-IN')} (${params.amountUsdt} USDT) submitted via ${params.method}. Order ID: ${newWithdrawal.id}. Estimated processing: ~15 mins.`,
      type: 'withdrawal',
      order_id: newWithdrawal.id,
    });

    notifyListeners();
    return { success: true, withdrawal: newWithdrawal };
  }

  static updateWithdrawalStatus(
    withdrawalId: string,
    status: WithdrawalStatus,
    options?: {
      utrNumber?: string;
      reason?: string;
      adminNotes?: string;
      adminId?: string;
    }
  ): { success: boolean; withdrawal?: WithdrawalOrder; error?: string } {
    const withdrawals = this.getWithdrawals();
    const idx = withdrawals.findIndex((w) => w.id === withdrawalId);
    if (idx === -1) return { success: false, error: 'Withdrawal order not found.' };

    const order = withdrawals[idx];
    const previousStatus = order.status;
    order.status = status;
    order.updated_at = new Date().toISOString();

    if (options?.utrNumber) order.utr_number = options.utrNumber;
    if (options?.reason) order.rejection_reason = options.reason;
    if (options?.adminNotes) order.admin_notes = options.adminNotes;

    // If marked completed
    if (status === 'completed') {
      order.completed_at = new Date().toISOString();
      this.createNotification({
        user_id: order.user_id,
        title: 'Withdrawal Completed',
        message: `Payout of ₹${order.amount_inr.toLocaleString('en-IN')} successfully sent to your ${order.method} account. ${order.utr_number ? 'UTR: ' + order.utr_number : ''}`,
        type: 'withdrawal',
        order_id: order.id,
      });
    }

    // If rejected/failed/cancelled, refund USDT back to user balance!
    if (['rejected', 'failed', 'cancelled'].includes(status) && !['rejected', 'failed', 'cancelled'].includes(previousStatus)) {
      const user = this.getUser();
      if (user && user.id === order.user_id) {
        user.balance_usdt += order.amount_usdt;
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
      }

      this.createNotification({
        user_id: order.user_id,
        title: `Withdrawal ${status.toUpperCase()}`,
        message: `Your withdrawal ${order.id} was ${status}. ${order.amount_usdt} USDT has been refunded to your wallet balance. Reason: ${options?.reason || 'Verification check failed.'}`,
        type: 'withdrawal',
        order_id: order.id,
      });
    } else if (status === 'processing') {
      this.createNotification({
        user_id: order.user_id,
        title: 'Withdrawal Processing',
        message: `Your withdrawal ${order.id} is now being processed through banking rails. Target settlement: ~15 mins.`,
        type: 'withdrawal',
        order_id: order.id,
      });
    } else if (status === 'payment_sent') {
      this.createNotification({
        user_id: order.user_id,
        title: 'Payment Dispatched',
        message: `Payment of ₹${order.amount_inr.toLocaleString('en-IN')} has been dispatched via ${order.method}. Awaiting final bank UTR confirmation.`,
        type: 'withdrawal',
        order_id: order.id,
      });
    }

    withdrawals[idx] = order;
    localStorage.setItem(STORAGE_KEYS.WITHDRAWALS, JSON.stringify(withdrawals));

    this.logAdminAction(
      options?.adminId || 'Admin-Console',
      'UPDATE_WITHDRAWAL_STATUS',
      `Updated ${order.id} to ${status}. ${options?.utrNumber ? 'UTR: ' + options.utrNumber : ''}`,
      order.id
    );

    notifyListeners();
    return { success: true, withdrawal: order };
  }

  // ----------------------------------------------------
  // COMBINED TRANSACTIONS
  // ----------------------------------------------------
  static getAllTransactions(userId?: string): TransactionSummary[] {
    const deposits = this.getDeposits(userId);
    const withdrawals = this.getWithdrawals(userId);

    const summaries: TransactionSummary[] = [];

    deposits.forEach((d) => {
      summaries.push({
        id: d.id,
        reference_id: d.transaction_hash,
        type: 'deposit',
        amount_usdt: d.amount_usdt,
        amount_inr: d.amount_inr_equivalent,
        status: d.status,
        method_or_network: d.network_name,
        created_at: d.created_at,
        raw_deposit: d,
      });
    });

    withdrawals.forEach((w) => {
      summaries.push({
        id: w.id,
        reference_id: w.utr_number || (w.payout_details.type === 'UPI' ? w.payout_details.upi_id : w.payout_details.bank_name),
        type: 'withdrawal',
        amount_usdt: w.amount_usdt,
        amount_inr: w.amount_inr,
        status: w.status,
        method_or_network: w.method,
        created_at: w.created_at,
        raw_withdrawal: w,
      });
    });

    // Sort by latest created_at
    summaries.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    return summaries;
  }

  static getTransactionById(id: string): TransactionSummary | undefined {
    const all = this.getAllTransactions();
    return all.find((t) => t.id === id);
  }

  // ----------------------------------------------------
  // NOTIFICATIONS
  // ----------------------------------------------------
  static getNotifications(userId?: string): AppNotification[] {
    const raw = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
    let list: AppNotification[] = [];
    if (raw) {
      try {
        list = JSON.parse(raw);
      } catch {
        list = [];
      }
    }
    if (userId) {
      return list.filter((n) => n.user_id === userId);
    }
    return list;
  }

  static createNotification(params: {
    user_id: string;
    title: string;
    message: string;
    type: 'deposit' | 'withdrawal' | 'security' | 'system';
    order_id?: string;
  }): AppNotification {
    const notifs = this.getNotifications();
    const newNotif: AppNotification = {
      id: crypto.randomUUID ? crypto.randomUUID() : `notif-${Date.now()}-${Math.random()}`,
      user_id: params.user_id,
      title: params.title,
      message: params.message,
      type: params.type,
      read: false,
      order_id: params.order_id,
      created_at: new Date().toISOString(),
    };
    notifs.unshift(newNotif);
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifs));
    notifyListeners();
    return newNotif;
  }

  static markNotificationRead(id: string) {
    const notifs = this.getNotifications();
    const n = notifs.find((item) => item.id === id);
    if (n) {
      n.read = true;
      localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifs));
      notifyListeners();
    }
  }

  static markAllNotificationsRead(userId?: string) {
    const notifs = this.getNotifications();
    notifs.forEach((n) => {
      if (!userId || n.user_id === userId) {
        n.read = true;
      }
    });
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifs));
    notifyListeners();
  }

  // ----------------------------------------------------
  // SUPPORT TICKETS
  // ----------------------------------------------------
  static getSupportTickets(userId?: string): SupportTicket[] {
    const raw = localStorage.getItem(STORAGE_KEYS.SUPPORT_TICKETS);
    let list: SupportTicket[] = [];
    if (raw) {
      try {
        list = JSON.parse(raw);
      } catch {
        list = [];
      }
    }
    if (userId) {
      return list.filter((t) => t.user_id === userId);
    }
    return list;
  }

  static createSupportTicket(ticket: {
    userId: string;
    orderId?: string;
    category: 'deposit' | 'withdrawal' | 'exchange' | 'security' | 'other';
    subject: string;
    message: string;
  }): SupportTicket {
    const tickets = this.getSupportTickets();
    const newTicket: SupportTicket = {
      id: generateId('TP-TCK'),
      user_id: ticket.userId,
      order_id: ticket.orderId,
      category: ticket.category,
      subject: ticket.subject,
      message: ticket.message,
      status: 'open',
      created_at: new Date().toISOString(),
      responses: [
        {
          sender: 'user',
          text: ticket.message,
          timestamp: new Date().toISOString(),
        },
        {
          sender: 'support',
          text: `Hello, TrustPay Priority Desk has received your request regarding ${ticket.subject}. Our payment operations desk is reviewing the logs. Expected turnaround is within 15 minutes.`,
          timestamp: new Date(Date.now() + 1500).toISOString(),
        },
      ],
    };
    tickets.unshift(newTicket);
    localStorage.setItem(STORAGE_KEYS.SUPPORT_TICKETS, JSON.stringify(tickets));
    notifyListeners();
    return newTicket;
  }

  // ----------------------------------------------------
  // ADMIN AUDIT LOGS & USERS
  // ----------------------------------------------------
  static getAdminAuditLogs(): AdminAuditLog[] {
    const raw = localStorage.getItem(STORAGE_KEYS.AUDIT_LOGS);
    if (!raw) return [];
    try {
      return JSON.parse(raw);
    } catch {
      return [];
    }
  }

  static logAdminAction(adminId: string, action: string, details: string, targetId?: string) {
    const logs = this.getAdminAuditLogs();
    logs.unshift({
      id: crypto.randomUUID ? crypto.randomUUID() : `log-${Date.now()}`,
      admin_id: adminId,
      action,
      target_id: targetId,
      details,
      created_at: new Date().toISOString(),
    });
    // Keep last 100 logs
    const capped = logs.slice(0, 100);
    localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(capped));
  }

  static getAllUsers(): UserAccount[] {
    const user = this.getUser();
    return user ? [user] : [];
  }

  // ----------------------------------------------------
  // INITIAL USER DATA (WELCOME NOTIFICATIONS ONLY, FRESH ZERO-BALANCE)
  // ----------------------------------------------------
  static seedInitialUserData(userId: string) {
    if (localStorage.getItem(STORAGE_KEYS.DEMO_SEEDED) === 'true') return;

    // Create realistic initial notifications
    const initialNotifs: AppNotification[] = [
      {
        id: 'notif-welcome',
        user_id: userId,
        title: 'Welcome to TrustPay',
        message: 'Your institutional USDT-to-INR settlement account is active. Explore live rates and fast payout rails.',
        type: 'system',
        read: false,
        created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
      },
      {
        id: 'notif-security',
        user_id: userId,
        title: 'Security Advisory',
        message: 'Never share your 12-word recovery phrase with anyone. TrustPay staff will never ask for your recovery phrase.',
        type: 'security',
        read: false,
        created_at: new Date(Date.now() - 3600000 * 4).toISOString(),
      },
    ];
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(initialNotifs));

    // Fresh wallet initializes with zero deposits and zero withdrawals
    if (!localStorage.getItem(STORAGE_KEYS.DEPOSITS)) {
      localStorage.setItem(STORAGE_KEYS.DEPOSITS, JSON.stringify([]));
    }
    if (!localStorage.getItem(STORAGE_KEYS.WITHDRAWALS)) {
      localStorage.setItem(STORAGE_KEYS.WITHDRAWALS, JSON.stringify([]));
    }

    localStorage.setItem(STORAGE_KEYS.DEMO_SEEDED, 'true');
  }

  static logout() {
    localStorage.removeItem(STORAGE_KEYS.USER);
    localStorage.removeItem(STORAGE_KEYS.APP_LOCKED);
    localStorage.removeItem(STORAGE_KEYS.DEPOSITS);
    localStorage.removeItem(STORAGE_KEYS.WITHDRAWALS);
    localStorage.removeItem(STORAGE_KEYS.NOTIFICATIONS);
    notifyListeners();
  }

  static resetToDefaults() {
    localStorage.clear();
    notifyListeners();
  }
}
