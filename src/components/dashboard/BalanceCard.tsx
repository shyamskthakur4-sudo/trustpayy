import React, { useState } from 'react';
import { Eye, EyeOff, TrendingUp, Zap, ArrowDownLeft, ArrowUpRight } from '../common/Icons';
import { ExchangeSettings } from '../../types';

interface BalanceCardProps {
  balanceUsdt: number;
  exchangeSettings: ExchangeSettings;
  onDepositClick: () => void;
  onWithdrawClick: () => void;
}

export const BalanceCard: React.FC<BalanceCardProps> = ({
  balanceUsdt,
  exchangeSettings,
  onDepositClick,
  onWithdrawClick,
}) => {
  const [hideBalance, setHideBalance] = useState(false);
  const rate = exchangeSettings.exchange_rate;
  const inrEquivalent = balanceUsdt * rate;

  return (
    <div
      style={{
        background: 'linear-gradient(135deg, rgba(16, 27, 44, 0.95) 0%, rgba(10, 16, 28, 0.98) 100%)',
        border: '1px solid rgba(0, 229, 153, 0.28)',
        borderRadius: 'var(--tp-radius-xl)',
        padding: '22px 20px',
        boxShadow: '0 20px 40px -15px rgba(0, 0, 0, 0.8), 0 0 30px -5px rgba(0, 229, 153, 0.18)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Background Decorative Mesh Glow */}
      <div
        style={{
          position: 'absolute',
          top: '-40px',
          right: '-40px',
          width: '140px',
          height: '140px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(0, 229, 153, 0.18) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />

      {/* Top Card Info Row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--tp-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Available USDT Balance
          </span>
          <button
            onClick={() => setHideBalance(!hideBalance)}
            className="tp-pressable"
            style={{ background: 'none', border: 'none', color: 'var(--tp-text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
            aria-label="Toggle balance visibility"
          >
            {hideBalance ? <EyeOff size={15} /> : <Eye size={15} />}
          </button>
        </div>

        {/* Live Exchange Rate Pill */}
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '5px',
            background: 'rgba(0, 229, 153, 0.12)',
            border: '1px solid rgba(0, 229, 153, 0.3)',
            borderRadius: 'var(--tp-radius-full)',
            padding: '4px 10px',
            fontSize: '11.5px',
            fontWeight: 700,
            color: '#00E599',
          }}
        >
          <TrendingUp size={13} />
          <span>1 USDT = ₹{rate} INR</span>
        </div>
      </div>

      {/* Main USDT Figure */}
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '4px' }}>
        <span
          className="tp-num"
          style={{
            fontSize: '34px',
            fontWeight: 800,
            color: '#FFFFFF',
            letterSpacing: '-0.03em',
            lineHeight: 1.1,
          }}
        >
          {hideBalance ? '••••••' : balanceUsdt.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </span>
        <span style={{ fontSize: '17px', fontWeight: 700, color: '#00E599' }}>
          USDT
        </span>
      </div>

      {/* Converted INR Balance */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '18px' }}>
        <span style={{ fontSize: '13.5px', color: 'var(--tp-text-secondary)' }}>
          ≈
        </span>
        <span
          className="tp-num"
          style={{
            fontSize: '16px',
            fontWeight: 700,
            color: 'var(--tp-text-secondary)',
          }}
        >
          {hideBalance ? '₹••••••••' : `₹${inrEquivalent.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
        </span>
        <span style={{ fontSize: '12px', color: 'var(--tp-text-muted)', fontWeight: 600 }}>
          INR Equivalent
        </span>
      </div>

      {/* Settlement Target Banner */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          background: 'rgba(255, 255, 255, 0.04)',
          borderRadius: 'var(--tp-radius-sm)',
          padding: '6px 10px',
          fontSize: '11px',
          color: 'var(--tp-text-secondary)',
          marginBottom: '18px',
        }}
      >
        <Zap size={13} color="#F59E0B" />
        <span>Target settlement: ~15 mins via IMPS / UPI (operational conditions apply)</span>
      </div>

      {/* Quick Deposit / Withdraw CTA Split Buttons */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
        <button
          onClick={onDepositClick}
          className="tp-btn-primary"
          style={{ padding: '12px 14px', fontSize: '14px' }}
        >
          <ArrowDownLeft size={18} strokeWidth={2.5} />
          <span>Deposit USDT</span>
        </button>

        <button
          onClick={onWithdrawClick}
          className="tp-btn-secondary"
          style={{
            padding: '12px 14px',
            fontSize: '14px',
            background: 'rgba(255, 255, 255, 0.08)',
            borderColor: 'rgba(255, 255, 255, 0.16)',
          }}
        >
          <ArrowUpRight size={18} strokeWidth={2.5} color="#38BDF8" />
          <span>Withdraw INR</span>
        </button>
      </div>
    </div>
  );
};
