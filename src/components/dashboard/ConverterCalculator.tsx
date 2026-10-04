import React, { useState } from 'react';
import { Calculator, ArrowRight, Zap, RefreshCw } from '../common/Icons';
import { ExchangeSettings } from '../../types';

interface ConverterCalculatorProps {
  exchangeSettings: ExchangeSettings;
  userBalance: number;
  onProceedWithdraw: (amountUsdt: number) => void;
}

export const ConverterCalculator: React.FC<ConverterCalculatorProps> = ({
  exchangeSettings,
  userBalance,
  onProceedWithdraw,
}) => {
  const [usdtInput, setUsdtInput] = useState<string>('500');
  const rate = exchangeSettings.exchange_rate;

  const parsedAmount = parseFloat(usdtInput) || 0;
  const inrAmount = Math.round(parsedAmount * rate * 100) / 100;
  const platformFee = 0; // 0% configured
  const finalReceivableInr = inrAmount - platformFee;

  const presetAmounts = [500, 1000, 2000];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    // Allow numbers and decimal
    if (val === '' || /^\d*\.?\d*$/.test(val)) {
      setUsdtInput(val);
    }
  };

  return (
    <div
      style={{
        background: 'var(--tp-bg-surface)',
        border: '1px solid var(--tp-border-light)',
        borderRadius: 'var(--tp-radius-lg)',
        padding: '20px',
        boxShadow: 'var(--tp-shadow-card)',
      }}
    >
      {/* Title Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              background: 'rgba(0, 229, 153, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Calculator size={18} color="#00E599" />
          </div>
          <span style={{ fontSize: '15px', fontWeight: 800, color: '#FFF' }}>
            Instant USDT → INR Calculator
          </span>
        </div>

        <div style={{ fontSize: '11.5px', color: 'var(--tp-text-secondary)', fontWeight: 600 }}>
          Rate: <strong style={{ color: '#00E599' }}>₹{rate}</strong> / USDT
        </div>
      </div>

      {/* Preset Amount Chips */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '14px', flexWrap: 'wrap' }}>
        {presetAmounts.map((amt) => (
          <button
            key={amt}
            type="button"
            onClick={() => setUsdtInput(amt.toString())}
            className="tp-pressable"
            style={{
              background: parsedAmount === amt ? 'rgba(0, 229, 153, 0.15)' : 'rgba(255, 255, 255, 0.05)',
              border: parsedAmount === amt ? '1px solid #00E599' : '1px solid var(--tp-border-subtle)',
              borderRadius: 'var(--tp-radius-sm)',
              padding: '6px 12px',
              color: parsedAmount === amt ? '#00E599' : '#F8FAFC',
              fontSize: '12px',
              fontWeight: 700,
            }}
          >
            {amt.toLocaleString()} USDT
          </button>
        ))}

        {userBalance > 0 && (
          <button
            type="button"
            onClick={() => setUsdtInput(userBalance.toString())}
            className="tp-pressable"
            style={{
              background: 'rgba(56, 189, 248, 0.1)',
              border: '1px solid rgba(56, 189, 248, 0.3)',
              borderRadius: 'var(--tp-radius-sm)',
              padding: '6px 12px',
              color: '#38BDF8',
              fontSize: '12px',
              fontWeight: 700,
            }}
          >
            MAX ({userBalance.toFixed(0)})
          </button>
        )}
      </div>

      {/* USDT Input Field */}
      <div style={{ marginBottom: '12px' }}>
        <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--tp-text-secondary)', marginBottom: '6px' }}>
          You Pay (USDT)
        </div>
        <div
          style={{
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            background: 'rgba(10, 15, 26, 0.85)',
            border: '1px solid var(--tp-border-light)',
            borderRadius: 'var(--tp-radius-md)',
            padding: '4px 16px',
          }}
        >
          <input
            type="text"
            inputMode="decimal"
            value={usdtInput}
            onChange={handleInputChange}
            placeholder="0.00"
            className="tp-num"
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              color: '#FFF',
              fontSize: '22px',
              fontWeight: 800,
              outline: 'none',
              padding: '10px 0',
            }}
          />
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#00E599', fontWeight: 800, fontSize: '14px' }}>
            <span>USDT</span>
          </div>
        </div>
      </div>

      {/* Exchange Conversion Indicator */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '4px 0 10px' }}>
        <div
          style={{
            background: 'rgba(255, 255, 255, 0.05)',
            borderRadius: '50%',
            width: '28px',
            height: '28px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '1px solid var(--tp-border-subtle)',
          }}
        >
          <RefreshCw size={14} color="#94A3B8" />
        </div>
      </div>

      {/* INR Output Display */}
      <div style={{ marginBottom: '16px' }}>
        <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--tp-text-secondary)', marginBottom: '6px' }}>
          You Receive (INR Estimated)
        </div>
        <div
          style={{
            background: 'rgba(0, 229, 153, 0.06)',
            border: '1px solid rgba(0, 229, 153, 0.25)',
            borderRadius: 'var(--tp-radius-md)',
            padding: '14px 16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <span className="tp-num" style={{ fontSize: '24px', fontWeight: 900, color: '#00E599' }}>
            ₹{finalReceivableInr.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
          <span style={{ fontSize: '14px', fontWeight: 800, color: '#00E599' }}>
            INR
          </span>
        </div>
      </div>

      {/* Fee & Rate Summary Breakdown */}
      <div
        style={{
          background: 'rgba(255, 255, 255, 0.03)',
          borderRadius: 'var(--tp-radius-sm)',
          padding: '12px 14px',
          marginBottom: '16px',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          fontSize: '12px',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--tp-text-secondary)' }}>
          <span>Exchange Rate</span>
          <span className="tp-num" style={{ color: '#FFF', fontWeight: 600 }}>
            1 USDT = ₹{rate} INR
          </span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--tp-text-secondary)' }}>
          <span>Platform Exchange Fee</span>
          <span style={{ color: '#00E599', fontWeight: 700 }}>₹0.00 (0% Free)</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--tp-text-secondary)' }}>
          <span>Payout Rail</span>
          <span style={{ color: '#FFF', fontWeight: 600 }}>Direct UPI / IMPS Instant Rail</span>
        </div>
      </div>

      {/* Action Button */}
      <button
        onClick={() => onProceedWithdraw(parsedAmount)}
        disabled={parsedAmount <= 0}
        className="tp-btn-primary"
      >
        <span>Proceed to Withdraw ₹{finalReceivableInr.toLocaleString('en-IN')}</span>
        <ArrowRight size={18} />
      </button>
    </div>
  );
};
