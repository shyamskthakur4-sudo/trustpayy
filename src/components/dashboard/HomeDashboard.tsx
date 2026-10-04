import React from 'react';
import { BalanceCard } from './BalanceCard';
import { ConverterCalculator } from './ConverterCalculator';
import { RecentActivity } from './RecentActivity';
import { ExchangeSettings, TransactionSummary, UserAccount } from '../../types';
import { ArrowDownLeft, ArrowUpRight, History, HelpCircle, ShieldCheck } from '../common/Icons';

interface HomeDashboardProps {
  user: UserAccount;
  exchangeSettings: ExchangeSettings;
  transactions: TransactionSummary[];
  onNavigateTab: (tab: 'home' | 'deposit' | 'withdraw' | 'history' | 'profile') => void;
  onSelectTransaction: (tx: TransactionSummary) => void;
  onOpenWithdrawWithAmount: (amountUsdt: number) => void;
  onOpenSupport: () => void;
}

export const HomeDashboard: React.FC<HomeDashboardProps> = ({
  user,
  exchangeSettings,
  transactions,
  onNavigateTab,
  onSelectTransaction,
  onOpenWithdrawWithAmount,
  onOpenSupport,
}) => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
        padding: '16px 16px 88px', // extra bottom space for bottom nav
      }}
    >
      {/* 1. Main Balance Card */}
      <BalanceCard
        balanceUsdt={user.balance_usdt}
        exchangeSettings={exchangeSettings}
        onDepositClick={() => onNavigateTab('deposit')}
        onWithdrawClick={() => onNavigateTab('withdraw')}
      />

      {/* 2. Quick Action Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
        <button
          onClick={() => onNavigateTab('deposit')}
          className="tp-pressable"
          style={{
            background: 'var(--tp-bg-surface)',
            border: '1px solid var(--tp-border-subtle)',
            borderRadius: 'var(--tp-radius-md)',
            padding: '12px 6px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '6px',
            color: '#FFF',
            cursor: 'pointer',
          }}
        >
          <div
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '10px',
              background: 'rgba(0, 229, 153, 0.12)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <ArrowDownLeft size={20} color="#00E599" />
          </div>
          <span style={{ fontSize: '11.5px', fontWeight: 700 }}>Deposit</span>
        </button>

        <button
          onClick={() => onNavigateTab('withdraw')}
          className="tp-pressable"
          style={{
            background: 'var(--tp-bg-surface)',
            border: '1px solid var(--tp-border-subtle)',
            borderRadius: 'var(--tp-radius-md)',
            padding: '12px 6px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '6px',
            color: '#FFF',
            cursor: 'pointer',
          }}
        >
          <div
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '10px',
              background: 'rgba(56, 189, 248, 0.12)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <ArrowUpRight size={20} color="#38BDF8" />
          </div>
          <span style={{ fontSize: '11.5px', fontWeight: 700 }}>Withdraw</span>
        </button>

        <button
          onClick={() => onNavigateTab('history')}
          className="tp-pressable"
          style={{
            background: 'var(--tp-bg-surface)',
            border: '1px solid var(--tp-border-subtle)',
            borderRadius: 'var(--tp-radius-md)',
            padding: '12px 6px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '6px',
            color: '#FFF',
            cursor: 'pointer',
          }}
        >
          <div
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '10px',
              background: 'rgba(168, 85, 247, 0.12)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <History size={20} color="#A855F7" />
          </div>
          <span style={{ fontSize: '11.5px', fontWeight: 700 }}>Orders</span>
        </button>

        <button
          onClick={onOpenSupport}
          className="tp-pressable"
          style={{
            background: 'var(--tp-bg-surface)',
            border: '1px solid var(--tp-border-subtle)',
            borderRadius: 'var(--tp-radius-md)',
            padding: '12px 6px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '6px',
            color: '#FFF',
            cursor: 'pointer',
          }}
        >
          <div
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '10px',
              background: 'rgba(245, 158, 11, 0.12)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <HelpCircle size={20} color="#F59E0B" />
          </div>
          <span style={{ fontSize: '11.5px', fontWeight: 700 }}>Support</span>
        </button>
      </div>

      {/* 3. Live Instant Converter Calculator */}
      <ConverterCalculator
        exchangeSettings={exchangeSettings}
        userBalance={user.balance_usdt}
        onProceedWithdraw={onOpenWithdrawWithAmount}
      />

      {/* 4. Recent Activity */}
      <RecentActivity
        transactions={transactions}
        onSelectTransaction={onSelectTransaction}
        onViewAll={() => onNavigateTab('history')}
      />

      {/* 5. Security & Trust Assurance Card */}
      <div
        style={{
          background: 'rgba(0, 229, 153, 0.05)',
          border: '1px solid rgba(0, 229, 153, 0.2)',
          borderRadius: 'var(--tp-radius-lg)',
          padding: '14px 16px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
        }}
      >
        <ShieldCheck size={26} color="#00E599" style={{ flexShrink: 0 }} />
        <div style={{ fontSize: '12px', color: 'var(--tp-text-secondary)', lineHeight: 1.45 }}>
          <strong style={{ color: '#FFF' }}>TrustPay Settlement Guarantee:</strong> Real-time automated verification.
          Payouts processed directly through RBI-regulated UPI/IMPS rails.
        </div>
      </div>
    </div>
  );
};
