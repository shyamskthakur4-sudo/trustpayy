import React, { useState, useEffect } from 'react';
import {
  AppNotification,
  ExchangeSettings,
  TransactionSummary,
  UserAccount,
  WalletNetwork,
} from './types';
import { TrustPayStore, subscribeToStore, generateMnemonic } from './services/storage';
import { ToastProvider } from './components/common/Toast';
import { Header } from './components/common/Header';
import { BottomNav, NavTab } from './components/common/BottomNav';
import { WelcomeScreen } from './components/auth/WelcomeScreen';
import { RecoveryPhraseBackupScreen } from './components/auth/RecoveryPhraseBackupScreen';
import { RecoveryPhraseConfirmScreen } from './components/auth/RecoveryPhraseConfirmScreen';
import { RestoreWalletScreen } from './components/auth/RestoreWalletScreen';
import { PinSetupScreen } from './components/auth/PinSetupScreen';
import { AppLockScreen } from './components/auth/AppLockScreen';
import { HomeDashboard } from './components/dashboard/HomeDashboard';
import { DepositFlow } from './components/deposit/DepositFlow';
import { WithdrawScreen } from './components/withdraw/WithdrawScreen';
import { WithdrawTrackingScreen } from './components/withdraw/WithdrawTrackingScreen';
import { TransactionHistoryScreen } from './components/history/TransactionHistoryScreen';
import { OrderDetailsModal } from './components/history/OrderDetailsModal';
import { NotificationsScreen } from './components/notifications/NotificationsScreen';
import { ProfileScreen } from './components/profile/ProfileScreen';
import { SupportScreen } from './components/support/SupportScreen';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { LegalModal } from './components/profile/LegalModal';

export const AppContent: React.FC = () => {
  // Store Data States
  const [user, setUser] = useState<UserAccount | null>(TrustPayStore.getUser());
  const [exchangeSettings, setExchangeSettings] = useState<ExchangeSettings>(
    TrustPayStore.getExchangeSettings()
  );
  const [networks, setNetworks] = useState<WalletNetwork[]>(TrustPayStore.getWalletNetworks());
  const [transactions, setTransactions] = useState<TransactionSummary[]>(
    TrustPayStore.getAllTransactions()
  );
  const [notifications, setNotifications] = useState<AppNotification[]>(
    TrustPayStore.getNotifications()
  );

  // App Navigation & Modal States
  const [activeTab, setActiveTab] = useState<NavTab>('home');
  const [authView, setAuthView] = useState<
    'welcome' | 'backup_phrase' | 'confirm_phrase' | 'pin_setup' | 'restore_wallet' | null
  >(null);
  const [generatedMnemonic, setGeneratedMnemonic] = useState<string[]>([]);
  const [isLocked, setIsLocked] = useState<boolean>(TrustPayStore.isAppLocked());

  // Modal / Sub-screen overlays
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSupport, setShowSupport] = useState(false);
  const [supportOrderId, setSupportOrderId] = useState<string | undefined>(undefined);
  const [selectedTransaction, setSelectedTransaction] = useState<TransactionSummary | null>(null);
  const [trackingWithdrawalId, setTrackingWithdrawalId] = useState<string | null>(null);
  const [withdrawPreloadAmount, setWithdrawPreloadAmount] = useState<number | undefined>(undefined);
  const [showAdminConsole, setShowAdminConsole] = useState(false);
  const [legalModalType, setLegalModalType] = useState<'terms' | 'privacy' | 'security' | null>(null);

  // Subscribe to reactive store changes
  useEffect(() => {
    const unsubscribe = subscribeToStore(() => {
      setUser(TrustPayStore.getUser());
      setExchangeSettings(TrustPayStore.getExchangeSettings());
      setNetworks(TrustPayStore.getWalletNetworks());
      setTransactions(TrustPayStore.getAllTransactions());
      setNotifications(TrustPayStore.getNotifications());
      setIsLocked(TrustPayStore.isAppLocked());
    });
    return () => unsubscribe();
  }, []);

  const unreadNotificationsCount = notifications.filter((n) => !n.read).length;

  // ---------------------------------------------------------
  // AUTHENTICATION FLOW HANDLERS
  // ---------------------------------------------------------
  const handleStartCreateWallet = () => {
    // Generate fresh BIP-39 mnemonic in-memory ONLY.
    // Do NOT write to localStorage or create user until phrase is verified and MPIN is set!
    const mnemonic = generateMnemonic(12);
    setGeneratedMnemonic(mnemonic);
    setAuthView('backup_phrase');
  };

  const handlePhraseBackupProceed = () => {
    setAuthView('confirm_phrase');
  };

  const handlePhraseVerificationSuccess = () => {
    setAuthView('pin_setup');
  };

  const handlePinSetupComplete = (pin: string, enableBiometrics: boolean) => {
    // If pending mnemonic exists, finalize creation of fresh wallet
    if (generatedMnemonic && generatedMnemonic.length === 12) {
      const newUser = TrustPayStore.createWallet(generatedMnemonic, pin, enableBiometrics);
      setUser(newUser);
      setGeneratedMnemonic([]);
      setAuthView(null);
      setActiveTab('home');
    } else {
      // If setting PIN for restored wallet
      const existing = TrustPayStore.getRawUser();
      if (existing) {
        TrustPayStore.setPin(pin);
        if (enableBiometrics) {
          TrustPayStore.updateUser({
            security_settings: {
              ...existing.security_settings,
              biometric_enabled: true,
            },
          });
        }
        setUser(TrustPayStore.getUser());
      }
      setAuthView(null);
      setActiveTab('home');
    }
  };

  const handleRestoreWalletSuccess = () => {
    const rawUser = TrustPayStore.getRawUser();
    if (rawUser && !rawUser.security_settings.pin_enabled) {
      setAuthView('pin_setup');
    } else {
      setUser(TrustPayStore.getUser());
      setAuthView(null);
      setActiveTab('home');
    }
  };

  const handleLockWallet = () => {
    TrustPayStore.setAppLocked(true);
  };

  const handleResetWallet = () => {
    TrustPayStore.resetToDefaults();
    setUser(null);
    setAuthView(null);
  };

  const handleLogout = () => {
    TrustPayStore.logout();
    setUser(null);
    setAuthView('welcome');
    setActiveTab('home');
    setShowNotifications(false);
    setShowSupport(false);
    setSelectedTransaction(null);
    setTrackingWithdrawalId(null);
  };

  // ---------------------------------------------------------
  // ORDER & VIEW ROUTING
  // ---------------------------------------------------------
  const handleOpenWithdrawWithAmount = (amountUsdt: number) => {
    setWithdrawPreloadAmount(amountUsdt);
    setActiveTab('withdraw');
  };

  const handleWithdrawCreated = (orderId: string) => {
    setTrackingWithdrawalId(orderId);
  };

  const handleOpenSupportForOrder = (orderId: string) => {
    setSupportOrderId(orderId);
    setShowSupport(true);
  };

  const handleSelectTransactionFromId = (orderId: string) => {
    const tx = TrustPayStore.getTransactionById(orderId);
    if (tx) {
      setSelectedTransaction(tx);
    }
  };

  // ---------------------------------------------------------
  // 1. APP LOCKED SCREEN (FULL RESPONSIVE WEB VIEW)
  // ---------------------------------------------------------
  if (isLocked && user) {
    return (
      <div className="tp-auth-page">
        <div className="tp-auth-card">
          <AppLockScreen
            onUnlocked={() => setIsLocked(false)}
            onForgotPin={() => {
              setIsLocked(false);
              setAuthView('restore_wallet');
            }}
          />
        </div>
      </div>
    );
  }

  // ---------------------------------------------------------
  // 2. WELCOME & ONBOARDING / RESTORE SCREENS (FULL WEB VIEW)
  // ---------------------------------------------------------
  if (!user || authView) {
    return (
      <div className="tp-auth-page">
        <div className="tp-auth-card">
          {authView === 'backup_phrase' ? (
            <RecoveryPhraseBackupScreen
              mnemonic={generatedMnemonic}
              onProceedToVerification={handlePhraseBackupProceed}
              onBack={() => {
                setAuthView('welcome');
                setGeneratedMnemonic([]);
              }}
            />
          ) : authView === 'confirm_phrase' ? (
            <RecoveryPhraseConfirmScreen
              mnemonic={generatedMnemonic}
              onConfirmSuccess={handlePhraseVerificationSuccess}
              onBack={() => setAuthView('backup_phrase')}
            />
          ) : authView === 'pin_setup' ? (
            <PinSetupScreen
              onComplete={handlePinSetupComplete}
              onBack={() => {
                if (generatedMnemonic.length === 12) {
                  setAuthView('confirm_phrase');
                } else {
                  setAuthView('welcome');
                }
              }}
            />
          ) : authView === 'restore_wallet' ? (
            <RestoreWalletScreen
              onRestoreSuccess={handleRestoreWalletSuccess}
              onBack={() => setAuthView('welcome')}
            />
          ) : (
            <WelcomeScreen
              onCreateWallet={handleStartCreateWallet}
              onRestoreWallet={() => setAuthView('restore_wallet')}
              onOpenLegal={(type) => setLegalModalType(type)}
              onOpenHelp={() => setShowSupport(true)}
            />
          )}
        </div>

        {legalModalType && (
          <LegalModal type={legalModalType} onClose={() => setLegalModalType(null)} />
        )}
      </div>
    );
  }

  // ---------------------------------------------------------
  // 3. ADMIN PORTAL SCREEN (FULL WEB VIEW)
  // ---------------------------------------------------------
  if (showAdminConsole) {
    return (
      <AdminDashboard onClose={() => setShowAdminConsole(false)} />
    );
  }

  // ---------------------------------------------------------
  // 4. MAIN AUTHENTICATED WEB APPLICATION
  // ---------------------------------------------------------
  return (
    <div className="tp-web-app">
      {/* Full Top Header with Desktop Navigation & Rate */}
      <Header
        user={user}
        unreadCount={unreadNotificationsCount}
        activeTab={activeTab}
        onNavigateTab={(tab) => setActiveTab(tab)}
        exchangeRate={exchangeSettings.exchange_rate}
        onOpenNotifications={() => setShowNotifications(true)}
        onOpenSecurity={() => setActiveTab('profile')}
        onOpenAdmin={() => setShowAdminConsole(true)}
        onLogoClick={() => setActiveTab('home')}
      />

      {/* Main Responsive Web Content */}
      <main className="tp-web-main">
        {trackingWithdrawalId ? (
          <div className="tp-page-container">
            {(() => {
              const order = TrustPayStore.getWithdrawals().find((w) => w.id === trackingWithdrawalId);
              return order ? (
                <WithdrawTrackingScreen
                  order={order}
                  onBack={() => setTrackingWithdrawalId(null)}
                  onNeedHelp={handleOpenSupportForOrder}
                />
              ) : null;
            })()}
          </div>
        ) : showNotifications ? (
          <div className="tp-page-container">
            <NotificationsScreen
              notifications={notifications}
              onBack={() => setShowNotifications(false)}
              onSelectOrder={(orderId) => {
                setShowNotifications(false);
                handleSelectTransactionFromId(orderId);
              }}
            />
          </div>
        ) : showSupport ? (
          <div className="tp-page-container">
            <SupportScreen
              user={user}
              transactions={transactions}
              preselectedOrderId={supportOrderId}
              onBack={() => {
                setShowSupport(false);
                setSupportOrderId(undefined);
              }}
            />
          </div>
        ) : activeTab === 'home' ? (
          <div className="tp-dashboard-container">
            <HomeDashboard
              user={user}
              exchangeSettings={exchangeSettings}
              transactions={transactions}
              onNavigateTab={(tab) => setActiveTab(tab)}
              onSelectTransaction={(tx) => setSelectedTransaction(tx)}
              onOpenWithdrawWithAmount={handleOpenWithdrawWithAmount}
              onOpenSupport={() => setShowSupport(true)}
            />
          </div>
        ) : activeTab === 'deposit' ? (
          <div className="tp-page-container">
            <DepositFlow
              networks={networks}
              exchangeSettings={exchangeSettings}
              userId={user.id}
              onBack={() => setActiveTab('home')}
              onViewOrderDetails={handleSelectTransactionFromId}
            />
          </div>
        ) : activeTab === 'withdraw' ? (
          <div className="tp-page-container">
            <WithdrawScreen
              user={user}
              exchangeSettings={exchangeSettings}
              initialAmountUsdt={withdrawPreloadAmount}
              onBack={() => setActiveTab('home')}
              onWithdrawCreated={handleWithdrawCreated}
            />
          </div>
        ) : activeTab === 'history' ? (
          <div className="tp-page-container">
            <TransactionHistoryScreen
              transactions={transactions}
              onSelectTransaction={(tx) => setSelectedTransaction(tx)}
              onBack={() => setActiveTab('home')}
            />
          </div>
        ) : (
          <div className="tp-page-container">
            <ProfileScreen
              user={user}
              onOpenSupport={() => setShowSupport(true)}
              onOpenAdmin={() => setShowAdminConsole(true)}
              onLockWallet={handleLockWallet}
              onLogout={handleLogout}
              onResetWallet={handleResetWallet}
            />
          </div>
        )}
      </main>

      {/* Bottom Navigation for mobile screens (< 820px) */}
      {!trackingWithdrawalId && !showNotifications && !showSupport && (
        <BottomNav activeTab={activeTab} onTabChange={(tab) => setActiveTab(tab)} />
      )}

      {/* Order Details Receipt Modal */}
      {selectedTransaction && (
        <OrderDetailsModal
          transaction={selectedTransaction}
          networks={networks}
          onClose={() => setSelectedTransaction(null)}
          onContactSupport={handleOpenSupportForOrder}
        />
      )}

      {/* Legal Modal */}
      {legalModalType && (
        <LegalModal type={legalModalType} onClose={() => setLegalModalType(null)} />
      )}
    </div>
  );
};

export default function App() {
  return (
    <ToastProvider>
      <AppContent />
    </ToastProvider>
  );
}
