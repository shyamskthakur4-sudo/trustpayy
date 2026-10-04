import React, { useState } from 'react';
import {
  DepositOrder,
  ExchangeSettings,
  NetworkId,
  UserAccount,
  WalletNetwork,
  WithdrawalOrder,
  WithdrawalStatus,
} from '../../types';
import { TrustPayStore } from '../../services/storage';
import {
  Sliders,
  DollarSign,
  Network,
  Clock,
  Users,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ExternalLink,
  ShieldAlert,
  ShieldCheck,
  ArrowLeft,
  Save,
  RotateCcw,
  Check,
  Send,
  FileText,
  Lock,
  Eye,
  EyeOff,
  LogOut,
} from '../common/Icons';
import { useToast } from '../common/Toast';

interface AdminDashboardProps {
  onClose: () => void;
}

type AdminTab = 'rates' | 'networks' | 'deposits' | 'withdrawals' | 'users' | 'audit';

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onClose }) => {
  // Authentication Gate State (ID: 12345678, Pass: 1598)
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    try {
      return sessionStorage.getItem('trustpay_admin_auth') === '12345678';
    } catch {
      return false;
    }
  });
  const [adminIdInput, setAdminIdInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  const [activeTab, setActiveTab] = useState<AdminTab>('rates');

  // Rates State
  const [exchangeSettings, setExchangeSettings] = useState<ExchangeSettings>(
    TrustPayStore.getExchangeSettings()
  );
  const [rateInput, setRateInput] = useState(exchangeSettings.exchange_rate.toString());
  const [minDepositInput, setMinDepositInput] = useState(exchangeSettings.minimum_deposit.toString());

  // Networks State
  const [networks, setNetworks] = useState<WalletNetwork[]>(TrustPayStore.getWalletNetworks());
  const [editingNetworkId, setEditingNetworkId] = useState<NetworkId | null>(null);
  const [addressInput, setAddressInput] = useState('');
  const [qrInput, setQrInput] = useState('');

  // Orders State
  const [deposits, setDeposits] = useState<DepositOrder[]>(TrustPayStore.getDeposits());
  const [withdrawals, setWithdrawals] = useState<WithdrawalOrder[]>(TrustPayStore.getWithdrawals());
  const [utrInput, setUtrInput] = useState<{ [orderId: string]: string }>({});
  const [adminNoteInput, setAdminNoteInput] = useState<{ [orderId: string]: string }>({});

  // Users & Audit
  const [users, setUsers] = useState<UserAccount[]>(TrustPayStore.getAllUsers());
  const [auditLogs, setAuditLogs] = useState(TrustPayStore.getAdminAuditLogs());

  const { showToast } = useToast();

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');

    if (!adminIdInput.trim() || !passwordInput.trim()) {
      setLoginError('Please enter both Admin ID and password.');
      return;
    }

    setIsAuthenticating(true);

    setTimeout(() => {
      if (adminIdInput.trim() === '12345678' && passwordInput.trim() === '1598') {
        sessionStorage.setItem('trustpay_admin_auth', '12345678');
        setIsAuthenticated(true);
        setLoginError('');
        TrustPayStore.logAdminAction('12345678', 'ADMIN_LOGIN', 'Administrator authenticated with master credentials');
        showToast('Admin access granted', 'success');
      } else {
        setLoginError('Invalid Admin ID or Password. Access denied.');
        showToast('Invalid credentials', 'error');
      }
      setIsAuthenticating(false);
    }, 200);
  };

  const handleAdminLogout = () => {
    sessionStorage.removeItem('trustpay_admin_auth');
    setIsAuthenticated(false);
    setAdminIdInput('');
    setPasswordInput('');
    setLoginError('');
    TrustPayStore.logAdminAction('12345678', 'ADMIN_LOGOUT', 'Administrator signed out.');
    showToast('Signed out of Admin Console', 'info');
  };

  const refreshData = () => {
    setExchangeSettings(TrustPayStore.getExchangeSettings());
    setNetworks(TrustPayStore.getWalletNetworks());
    setDeposits(TrustPayStore.getDeposits());
    setWithdrawals(TrustPayStore.getWithdrawals());
    setUsers(TrustPayStore.getAllUsers());
    setAuditLogs(TrustPayStore.getAdminAuditLogs());
  };

  // 1. Save Exchange Settings
  const handleSaveRates = (e: React.FormEvent) => {
    e.preventDefault();
    const newRate = parseFloat(rateInput);
    const newMin = parseFloat(minDepositInput);

    if (isNaN(newRate) || newRate <= 0) {
      showToast('Please enter a valid exchange rate', 'error');
      return;
    }
    if (isNaN(newMin) || newMin <= 0) {
      showToast('Please enter a valid minimum deposit', 'error');
      return;
    }

    TrustPayStore.updateExchangeSettings({
      exchange_rate: newRate,
      minimum_deposit: newMin,
    });
    refreshData();
    showToast(`Exchange rate updated: 1 USDT = ₹${newRate} INR`, 'success');
  };

  // 2. Save Wallet Network Address
  const handleStartEditNetwork = (net: WalletNetwork) => {
    setEditingNetworkId(net.id);
    setAddressInput(net.wallet_address);
    setQrInput(net.qr_code || '');
  };

  const handleSaveNetwork = (netId: NetworkId) => {
    if (!addressInput.trim()) {
      showToast('Wallet address cannot be empty', 'error');
      return;
    }

    TrustPayStore.updateWalletNetwork(netId, {
      wallet_address: addressInput.trim(),
      qr_code: qrInput.trim(),
    });
    setEditingNetworkId(null);
    refreshData();
    showToast('Network wallet configuration updated!', 'success');
  };

  // 3. Deposit Approval / Rejection
  const handleVerifyDeposit = (depositId: string, approve: boolean) => {
    const notes = adminNoteInput[depositId] || (approve ? 'Verified by Admin Console' : 'Hash not found on chain');
    const res = TrustPayStore.verifyDeposit(depositId, approve, notes);
    if (res.success) {
      showToast(approve ? 'Deposit verified & balance credited!' : 'Deposit marked as rejected', 'success');
      refreshData();
    } else {
      showToast(res.error || 'Failed to update deposit', 'error');
    }
  };

  // 4. Withdrawal Status Advancement
  const handleUpdateWithdrawalStatus = (
    orderId: string,
    status: WithdrawalStatus
  ) => {
    const utr = utrInput[orderId];
    const notes = adminNoteInput[orderId];

    if (status === 'completed' && !utr) {
      showToast('Please enter the bank UTR reference number before completing.', 'error');
      return;
    }

    const res = TrustPayStore.updateWithdrawalStatus(orderId, status, {
      utrNumber: utr,
      adminNotes: notes,
      reason: status === 'rejected' ? (notes || 'Bank account invalid') : undefined,
    });

    if (res.success) {
      showToast(`Withdrawal updated to ${status.toUpperCase()}`, 'success');
      refreshData();
    } else {
      showToast(res.error || 'Status update failed', 'error');
    }
  };

  if (!isAuthenticated) {
    return (
      <div
        style={{
          minHeight: '100vh',
          background: 'radial-gradient(circle at 50% 10%, rgba(0, 229, 153, 0.08) 0%, #070A10 70%)',
          color: '#FFF',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Top Navbar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '16px 20px',
            background: 'rgba(15, 23, 38, 0.95)',
            borderBottom: '1px solid rgba(0, 229, 153, 0.25)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button
              onClick={onClose}
              className="tp-pressable"
              style={{
                background: 'rgba(255, 255, 255, 0.06)',
                border: '1px solid var(--tp-border-subtle)',
                borderRadius: '50%',
                width: '36px',
                height: '36px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#FFF',
                cursor: 'pointer',
              }}
              title="Return to user app"
            >
              <ArrowLeft size={18} />
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '16px', fontWeight: 900, color: '#FFF' }}>TrustPay</span>
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: 800,
                  background: 'rgba(0, 229, 153, 0.2)',
                  color: '#00E599',
                  padding: '2px 8px',
                  borderRadius: '4px',
                  border: '1px solid rgba(0, 229, 153, 0.3)',
                }}
              >
                ADMIN GATEWAY
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="tp-btn-secondary"
            style={{ width: 'auto', padding: '6px 14px', fontSize: '12.5px' }}
          >
            Exit
          </button>
        </div>

        {/* Center Card */}
        <div
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px 16px',
          }}
        >
          <div
            style={{
              width: '100%',
              maxWidth: '400px',
              background: 'linear-gradient(135deg, rgba(16, 27, 44, 0.95) 0%, rgba(10, 16, 28, 0.98) 100%)',
              border: '1px solid rgba(0, 229, 153, 0.3)',
              borderRadius: 'var(--tp-radius-xl)',
              padding: '32px 24px',
              boxShadow: '0 20px 40px -15px rgba(0, 0, 0, 0.8), 0 0 35px -5px rgba(0, 229, 153, 0.15)',
              textAlign: 'center',
            }}
          >
            {/* Security Badge Icon */}
            <div
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '20px',
                background: 'rgba(0, 229, 153, 0.12)',
                border: '1px solid rgba(0, 229, 153, 0.35)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 20px',
                color: '#00E599',
                boxShadow: '0 0 25px rgba(0, 229, 153, 0.25)',
              }}
            >
              <Lock size={30} />
            </div>

            <h2 style={{ fontSize: '20px', fontWeight: 900, color: '#FFF', marginBottom: '8px', letterSpacing: '-0.02em' }}>
              Admin Authentication
            </h2>
            <p style={{ fontSize: '13px', color: 'var(--tp-text-secondary)', lineHeight: 1.5, marginBottom: '24px' }}>
              Authorized operations portal. Enter administrative credentials to manage rates, addresses, and order queues.
            </p>

            {/* Error Notification */}
            {loginError && (
              <div
                style={{
                  background: 'rgba(239, 68, 68, 0.12)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  borderRadius: 'var(--tp-radius-md)',
                  padding: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  color: '#EF4444',
                  fontSize: '12.5px',
                  fontWeight: 600,
                  marginBottom: '20px',
                  textAlign: 'left',
                }}
              >
                <AlertCircle size={18} style={{ flexShrink: 0 }} />
                <span>{loginError}</span>
              </div>
            )}

            <form onSubmit={handleAdminLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px', textAlign: 'left' }}>
              {/* Admin ID Field */}
              <div className="tp-input-group">
                <label className="tp-input-label">
                  <span>Admin ID</span>
                </label>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <div style={{ position: 'absolute', left: '14px', color: 'var(--tp-text-muted)', display: 'flex', alignItems: 'center' }}>
                    <Users size={18} />
                  </div>
                  <input
                    type="text"
                    value={adminIdInput}
                    onChange={(e) => setAdminIdInput(e.target.value)}
                    placeholder="Enter Admin ID"
                    autoFocus
                    className="tp-input-box tp-num"
                    style={{ paddingLeft: '42px', fontSize: '15px' }}
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="tp-input-group">
                <label className="tp-input-label">
                  <span>Password</span>
                </label>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <div style={{ position: 'absolute', left: '14px', color: 'var(--tp-text-muted)', display: 'flex', alignItems: 'center' }}>
                    <Lock size={18} />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    placeholder="Enter Password"
                    className="tp-input-box tp-num"
                    style={{ paddingLeft: '42px', paddingRight: '44px', fontSize: '15px' }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: 'absolute',
                      right: '12px',
                      background: 'none',
                      border: 'none',
                      color: 'var(--tp-text-muted)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                    }}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* Credentials reminder */}
              <div
                style={{
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid var(--tp-border-subtle)',
                  borderRadius: 'var(--tp-radius-sm)',
                  padding: '8px 12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  fontSize: '11px',
                  color: 'var(--tp-text-muted)',
                }}
              >
                <span>Configured ID:</span>
                <span className="tp-num" style={{ color: 'var(--tp-emerald)', fontWeight: 700 }}>
                  12345678 • Pass: 1598
                </span>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isAuthenticating}
                className="tp-btn-primary"
                style={{
                  width: '100%',
                  justifyContent: 'center',
                  padding: '14px',
                  fontSize: '14.5px',
                  fontWeight: 800,
                  marginTop: '6px',
                }}
              >
                {isAuthenticating ? (
                  <span>Verifying Credentials...</span>
                ) : (
                  <>
                    <ShieldCheck size={18} />
                    <span>Access Admin Console</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={onClose}
                className="tp-btn-secondary"
                style={{ width: '100%', justifyContent: 'center' }}
              >
                Cancel & Return
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#070A10',
        color: '#FFF',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Admin Navbar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '16px 20px',
          background: 'rgba(15, 23, 38, 0.95)',
          borderBottom: '1px solid rgba(0, 229, 153, 0.25)',
          position: 'sticky',
          top: 0,
          zIndex: 100,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            onClick={onClose}
            className="tp-pressable"
            style={{
              background: 'rgba(255, 255, 255, 0.06)',
              border: '1px solid var(--tp-border-subtle)',
              borderRadius: '50%',
              width: '36px',
              height: '36px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#FFF',
            }}
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '16px', fontWeight: 900, color: '#FFF' }}>TrustPay</span>
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: 800,
                  background: 'rgba(0, 229, 153, 0.2)',
                  color: '#00E599',
                  padding: '2px 8px',
                  borderRadius: '4px',
                  border: '1px solid rgba(0, 229, 153, 0.3)',
                }}
              >
                ADMIN CONSOLE
              </span>
            </div>
            <div style={{ fontSize: '11px', color: 'var(--tp-text-muted)' }}>
              Operational Settlement & Network Control
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            onClick={handleAdminLogout}
            className="tp-pressable"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              background: 'rgba(239, 68, 68, 0.12)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: 'var(--tp-radius-md)',
              color: '#EF4444',
              fontSize: '12px',
              fontWeight: 700,
              cursor: 'pointer',
            }}
            title="Sign out of Admin Console"
          >
            <LogOut size={14} />
            <span>Sign Out</span>
          </button>

          <button
            onClick={onClose}
            className="tp-btn-secondary"
            style={{ width: 'auto', padding: '6px 14px', fontSize: '12.5px' }}
          >
            Exit Admin
          </button>
        </div>
      </div>

      {/* Admin Navigation Tabs */}
      <div
        style={{
          display: 'flex',
          gap: '8px',
          padding: '12px 18px',
          background: 'rgba(10, 15, 26, 0.8)',
          borderBottom: '1px solid var(--tp-border-subtle)',
          overflowX: 'auto',
        }}
      >
        {[
          { id: 'rates' as AdminTab, label: 'Exchange & Rates', icon: DollarSign },
          { id: 'networks' as AdminTab, label: 'Wallet Networks (5)', icon: Network },
          { id: 'deposits' as AdminTab, label: `Deposits (${deposits.filter(d => d.status === 'pending_verification').length} Pending)`, icon: Clock },
          { id: 'withdrawals' as AdminTab, label: `Withdrawals (${withdrawals.filter(w => !['completed', 'rejected', 'failed'].includes(w.status)).length})`, icon: Send },
          { id: 'users' as AdminTab, label: 'Users', icon: Users },
          { id: 'audit' as AdminTab, label: 'Audit Logs', icon: FileText },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="tp-pressable"
              style={{
                background: isActive ? 'rgba(0, 229, 153, 0.15)' : 'transparent',
                border: isActive ? '1px solid #00E599' : '1px solid transparent',
                borderRadius: 'var(--tp-radius-md)',
                padding: '8px 14px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                color: isActive ? '#00E599' : 'var(--tp-text-secondary)',
                fontWeight: 700,
                fontSize: '12.5px',
                whiteSpace: 'nowrap',
                cursor: 'pointer',
              }}
            >
              <Icon size={16} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Main Tab Content */}
      <div style={{ flex: 1, padding: '20px', maxWidth: '800px', margin: '0 auto', width: '100%' }}>
        {/* ========================================================
            TAB 1: EXCHANGE SETTINGS & RATES
            ======================================================== */}
        {activeTab === 'rates' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div className="tp-card">
              <h2 style={{ fontSize: '17px', fontWeight: 800, marginBottom: '6px' }}>
                Exchange Settings
              </h2>
              <p style={{ fontSize: '13px', color: 'var(--tp-text-secondary)', marginBottom: '20px' }}>
                Manage live USDT to INR exchange rates and minimum deposit thresholds. Changes reflect across all user screens instantly.
              </p>

              <form onSubmit={handleSaveRates}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
                  <div className="tp-input-group" style={{ marginBottom: 0 }}>
                    <label className="tp-input-label">
                      <span>Exchange Rate (INR per 1 USDT)</span>
                      <span style={{ color: '#00E599', fontWeight: 800 }}>Live: ₹{exchangeSettings.exchange_rate}</span>
                    </label>
                    <div style={{ position: 'relative' }}>
                      <input
                        type="text"
                        value={rateInput}
                        onChange={(e) => setRateInput(e.target.value)}
                        className="tp-input-box tp-num"
                        style={{ fontSize: '18px', fontWeight: 800 }}
                      />
                      <span style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--tp-text-muted)', fontSize: '12px' }}>
                        INR / USDT
                      </span>
                    </div>
                  </div>

                  <div className="tp-input-group" style={{ marginBottom: 0 }}>
                    <label className="tp-input-label">
                      <span>Minimum Deposit (USDT)</span>
                      <span style={{ color: '#F59E0B', fontWeight: 800 }}>Live: {exchangeSettings.minimum_deposit}</span>
                    </label>
                    <div style={{ position: 'relative' }}>
                      <input
                        type="text"
                        value={minDepositInput}
                        onChange={(e) => setMinDepositInput(e.target.value)}
                        className="tp-input-box tp-num"
                        style={{ fontSize: '18px', fontWeight: 800 }}
                      />
                      <span style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--tp-text-muted)', fontSize: '12px' }}>
                        USDT
                      </span>
                    </div>
                  </div>
                </div>

                <div
                  style={{
                    background: 'rgba(255, 255, 255, 0.03)',
                    borderRadius: 'var(--tp-radius-md)',
                    padding: '12px 14px',
                    marginBottom: '20px',
                    fontSize: '12px',
                    color: 'var(--tp-text-secondary)',
                  }}
                >
                  Last updated at: {new Date(exchangeSettings.updated_at).toLocaleString()}
                </div>

                <button type="submit" className="tp-btn-primary" style={{ width: 'auto', padding: '12px 24px' }}>
                  <Save size={16} />
                  <span>Update Exchange Settings</span>
                </button>
              </form>
            </div>
          </div>
        )}

        {/* ========================================================
            TAB 2: WALLET NETWORKS CONFIGURATION (Section 14 & 19)
            ======================================================== */}
        {activeTab === 'networks' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <div>
                <h2 style={{ fontSize: '17px', fontWeight: 800 }}>Wallet Network Addresses & QR</h2>
                <p style={{ fontSize: '12.5px', color: 'var(--tp-text-secondary)' }}>
                  Configure incoming deposit addresses and QR codes for the 5 blockchain rails.
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {networks.map((net) => {
                const isEditing = editingNetworkId === net.id;
                return (
                  <div
                    key={net.id}
                    style={{
                      background: 'var(--tp-bg-surface)',
                      border: isEditing ? '1px solid #00E599' : '1px solid var(--tp-border-subtle)',
                      borderRadius: 'var(--tp-radius-lg)',
                      padding: '16px',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '15px', fontWeight: 800, color: '#FFF' }}>
                          {net.network_name}
                        </span>
                        <span style={{ fontSize: '11px', fontWeight: 700, background: 'rgba(0, 229, 153, 0.1)', color: '#00E599', padding: '2px 8px', borderRadius: '4px' }}>
                          {net.network_standard}
                        </span>
                      </div>

                      {!isEditing && (
                        <button
                          type="button"
                          onClick={() => handleStartEditNetwork(net)}
                          className="tp-btn-outline"
                          style={{ padding: '6px 12px', fontSize: '12px' }}
                        >
                          Edit Configuration
                        </button>
                      )}
                    </div>

                    {isEditing ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        <div className="tp-input-group" style={{ marginBottom: 0 }}>
                          <label className="tp-input-label">Deposit Wallet Address</label>
                          <input
                            type="text"
                            value={addressInput}
                            onChange={(e) => setAddressInput(e.target.value)}
                            placeholder="Enter valid wallet address"
                            className="tp-input-box tp-num"
                            style={{ fontSize: '13px' }}
                          />
                        </div>

                        <div className="tp-input-group" style={{ marginBottom: 0 }}>
                          <label className="tp-input-label">QR Code Data / Custom Image URL (Optional)</label>
                          <input
                            type="text"
                            value={qrInput}
                            onChange={(e) => setQrInput(e.target.value)}
                            placeholder="Leave empty to auto-generate QR from address"
                            className="tp-input-box"
                            style={{ fontSize: '13px' }}
                          />
                        </div>

                        <div style={{ display: 'flex', gap: '10px', marginTop: '6px' }}>
                          <button
                            type="button"
                            onClick={() => handleSaveNetwork(net.id)}
                            className="tp-btn-primary"
                            style={{ width: 'auto', padding: '8px 18px', fontSize: '12px' }}
                          >
                            <Save size={14} /> Save
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingNetworkId(null)}
                            className="tp-btn-secondary"
                            style={{ width: 'auto', padding: '8px 18px', fontSize: '12px' }}
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <div style={{ fontSize: '11px', color: 'var(--tp-text-muted)', marginBottom: '2px' }}>
                          Current Address:
                        </div>
                        <div
                          className="tp-num"
                          style={{
                            fontSize: '12.5px',
                            color: net.wallet_address.includes('PendingAdminConfig') ? '#FCD34D' : '#FFF',
                            background: 'rgba(0, 0, 0, 0.3)',
                            padding: '8px 12px',
                            borderRadius: '6px',
                            wordBreak: 'break-all',
                          }}
                        >
                          {net.wallet_address}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ========================================================
            TAB 3: DEPOSITS MANAGEMENT
            ======================================================== */}
        {activeTab === 'deposits' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <h2 style={{ fontSize: '17px', fontWeight: 800 }}>Manage Deposits</h2>

            {deposits.length === 0 ? (
              <div style={{ padding: '36px', textAlign: 'center', color: 'var(--tp-text-muted)' }}>
                No deposits submitted yet.
              </div>
            ) : (
              deposits.map((dep) => (
                <div
                  key={dep.id}
                  style={{
                    background: 'var(--tp-bg-surface)',
                    border: '1px solid var(--tp-border-subtle)',
                    borderRadius: 'var(--tp-radius-lg)',
                    padding: '18px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                      <span className="tp-num" style={{ fontSize: '14px', fontWeight: 800, color: '#FFF' }}>
                        #{dep.id}
                      </span>
                      <span style={{ fontSize: '12px', color: 'var(--tp-text-muted)', marginLeft: '8px' }}>
                        {dep.network_name}
                      </span>
                    </div>
                    <span className={`tp-badge ${dep.status === 'verified' ? 'tp-badge-completed' : dep.status === 'rejected' ? 'tp-badge-rejected' : 'tp-badge-processing'}`}>
                      {dep.status.replace(/_/g, ' ')}
                    </span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                    <div className="tp-num" style={{ fontSize: '20px', fontWeight: 800, color: '#00E599' }}>
                      +{dep.amount_usdt} USDT
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--tp-text-secondary)' }}>
                      ₹{dep.amount_inr_equivalent.toLocaleString('en-IN')} INR
                    </div>
                  </div>

                  <div>
                    <div style={{ fontSize: '11px', color: 'var(--tp-text-muted)' }}>Transaction Hash (TxID):</div>
                    <div className="tp-num" style={{ fontSize: '12px', color: '#BAE6FD', wordBreak: 'break-all' }}>
                      {dep.transaction_hash}
                    </div>
                  </div>

                  {dep.status === 'pending_verification' && (
                    <div style={{ display: 'flex', gap: '10px', marginTop: '6px' }}>
                      <button
                        type="button"
                        onClick={() => handleVerifyDeposit(dep.id, true)}
                        className="tp-btn-primary"
                        style={{ padding: '8px 16px', fontSize: '12.5px' }}
                      >
                        <CheckCircle2 size={16} />
                        <span>Verify & Credit Balance</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleVerifyDeposit(dep.id, false)}
                        className="tp-btn-secondary"
                        style={{ padding: '8px 16px', fontSize: '12.5px', color: '#F87171' }}
                      >
                        <XCircle size={16} />
                        <span>Reject Deposit</span>
                      </button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {/* ========================================================
            TAB 4: WITHDRAWALS MANAGEMENT
            ======================================================== */}
        {activeTab === 'withdrawals' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <h2 style={{ fontSize: '17px', fontWeight: 800 }}>Manage Withdrawals</h2>

            {withdrawals.length === 0 ? (
              <div style={{ padding: '36px', textAlign: 'center', color: 'var(--tp-text-muted)' }}>
                No withdrawals logged yet.
              </div>
            ) : (
              withdrawals.map((w) => (
                <div
                  key={w.id}
                  style={{
                    background: 'var(--tp-bg-surface)',
                    border: '1px solid var(--tp-border-subtle)',
                    borderRadius: 'var(--tp-radius-lg)',
                    padding: '18px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                      <span className="tp-num" style={{ fontSize: '14px', fontWeight: 800, color: '#FFF' }}>
                        #{w.id}
                      </span>
                      <span style={{ fontSize: '12px', color: 'var(--tp-text-muted)', marginLeft: '8px' }}>
                        {w.method}
                      </span>
                    </div>
                    <span className={`tp-badge ${w.status === 'completed' ? 'tp-badge-completed' : ['failed', 'rejected'].includes(w.status) ? 'tp-badge-rejected' : 'tp-badge-processing'}`}>
                      {w.status.replace(/_/g, ' ')}
                    </span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                    <div className="tp-num" style={{ fontSize: '20px', fontWeight: 800, color: '#FFF' }}>
                      ₹{w.amount_inr.toLocaleString('en-IN')}
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--tp-text-secondary)' }}>
                      Used: {w.amount_usdt} USDT (₹{w.exchange_rate}/USDT)
                    </div>
                  </div>

                  <div style={{ fontSize: '12px', color: 'var(--tp-text-secondary)', background: 'rgba(0, 0, 0, 0.25)', padding: '10px', borderRadius: '8px' }}>
                    <div>Account Holder: <strong>{w.payout_details.account_holder_name}</strong></div>
                    {w.payout_details.type === 'UPI' ? (
                      <div>UPI ID: <strong>{w.payout_details.upi_id}</strong></div>
                    ) : w.payout_details.type === 'CDM' ? (
                      <div>CDM Bank: <strong>{w.payout_details.bank_name}</strong> • A/C: <strong>{w.payout_details.bank_account_number}</strong> • Mobile: <strong>{w.payout_details.mobile_number}</strong>{w.payout_details.branch_city ? ` • City: ${w.payout_details.branch_city}` : ''}</div>
                    ) : (
                      <div>Bank: <strong>{w.payout_details.bank_name}</strong> • A/C: <strong>{w.payout_details.bank_account_number}</strong> • IFSC: <strong>{w.payout_details.ifsc_code}</strong></div>
                    )}
                    {w.utr_number && <div style={{ color: '#00E599', marginTop: '4px' }}>UTR / CDM Slip: {w.utr_number}</div>}
                  </div>

                  {/* Workflow Advancement Controls */}
                  {!['completed', 'rejected', 'failed', 'cancelled'].includes(w.status) && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '6px' }}>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <input
                          type="text"
                          value={utrInput[w.id] || ''}
                          onChange={(e) => setUtrInput({ ...utrInput, [w.id]: e.target.value })}
                          placeholder="Enter Bank UTR (e.g. UTR84920184)"
                          className="tp-input-box tp-num"
                          style={{ flex: 1, padding: '8px 12px', fontSize: '12.5px' }}
                        />
                      </div>

                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        {w.status === 'submitted' && (
                          <button
                            type="button"
                            onClick={() => handleUpdateWithdrawalStatus(w.id, 'verification')}
                            className="tp-btn-secondary"
                            style={{ width: 'auto', padding: '6px 14px', fontSize: '12px' }}
                          >
                            Mark Verification Passed
                          </button>
                        )}

                        {['submitted', 'verification'].includes(w.status) && (
                          <button
                            type="button"
                            onClick={() => handleUpdateWithdrawalStatus(w.id, 'processing')}
                            className="tp-btn-secondary"
                            style={{ width: 'auto', padding: '6px 14px', fontSize: '12px' }}
                          >
                            Mark Processing
                          </button>
                        )}

                        {['submitted', 'verification', 'processing'].includes(w.status) && (
                          <button
                            type="button"
                            onClick={() => handleUpdateWithdrawalStatus(w.id, 'payment_sent')}
                            className="tp-btn-secondary"
                            style={{ width: 'auto', padding: '6px 14px', fontSize: '12px', color: '#38BDF8' }}
                          >
                            Mark Payment Sent
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => handleUpdateWithdrawalStatus(w.id, 'completed')}
                          className="tp-btn-primary"
                          style={{ width: 'auto', padding: '6px 14px', fontSize: '12px' }}
                        >
                          <Check size={14} /> Mark Completed
                        </button>

                        <button
                          type="button"
                          onClick={() => handleUpdateWithdrawalStatus(w.id, 'rejected')}
                          className="tp-btn-secondary"
                          style={{ width: 'auto', padding: '6px 14px', fontSize: '12px', color: '#F87171' }}
                        >
                          Reject & Refund USDT
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {/* ========================================================
            TAB 5: USERS (Section 14: Never expose recovery phrases!)
            ======================================================== */}
        {activeTab === 'users' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <h2 style={{ fontSize: '17px', fontWeight: 800 }}>Registered Users</h2>

            <div
              style={{
                background: 'rgba(56, 189, 248, 0.08)',
                border: '1px solid rgba(56, 189, 248, 0.25)',
                borderRadius: 'var(--tp-radius-md)',
                padding: '12px',
                fontSize: '12px',
                color: '#BAE6FD',
              }}
            >
              <strong>Security Protocol:</strong> Per Section 14 regulations, users' 12-word recovery phrases are
              strictly non-custodial and are never displayed or stored in administrator consoles.
            </div>

            {users.map((u) => (
              <div
                key={u.id}
                style={{
                  background: 'var(--tp-bg-surface)',
                  border: '1px solid var(--tp-border-subtle)',
                  borderRadius: 'var(--tp-radius-lg)',
                  padding: '16px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div>
                  <div style={{ fontSize: '14px', fontWeight: 800, color: '#FFF' }}>
                    {u.account_id}
                  </div>
                  <div style={{ fontSize: '11.5px', color: 'var(--tp-text-muted)' }}>
                    Joined: {new Date(u.created_at).toLocaleDateString()} • PIN Active: {u.security_settings.pin_enabled ? 'Yes' : 'No'}
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div className="tp-num" style={{ fontSize: '15px', fontWeight: 800, color: '#00E599' }}>
                    {u.balance_usdt.toFixed(2)} USDT
                  </div>
                  <span className="tp-badge tp-badge-completed" style={{ fontSize: '10px' }}>
                    {u.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ========================================================
            TAB 6: AUDIT LOGS
            ======================================================== */}
        {activeTab === 'audit' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <h2 style={{ fontSize: '17px', fontWeight: 800 }}>Admin Security Audit Logs</h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {auditLogs.map((log) => (
                <div
                  key={log.id}
                  style={{
                    background: 'var(--tp-bg-surface)',
                    border: '1px solid var(--tp-border-subtle)',
                    borderRadius: 'var(--tp-radius-md)',
                    padding: '12px 14px',
                    fontSize: '12px',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span style={{ fontWeight: 700, color: '#00E599' }}>{log.action}</span>
                    <span style={{ color: 'var(--tp-text-muted)' }}>
                      {new Date(log.created_at).toLocaleTimeString()}
                    </span>
                  </div>
                  <div style={{ color: 'var(--tp-text-secondary)' }}>{log.details}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
