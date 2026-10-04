import React, { useState } from 'react';
import { Send, AlertCircle, Info, ShieldCheck, CheckCircle2 } from '../common/Icons';
import { NetworkId, WalletNetwork } from '../../types';
import { TrustPayStore } from '../../services/storage';
import { useToast } from '../common/Toast';

interface DepositSubmitFormProps {
  network: WalletNetwork;
  userId: string;
  minimumDeposit: number;
  onDepositCreated: (orderId: string) => void;
}

export const DepositSubmitForm: React.FC<DepositSubmitFormProps> = ({
  network,
  userId,
  minimumDeposit,
  onDepositCreated,
}) => {
  const [amountStr, setAmountStr] = useState<string>('500');
  const [txHash, setTxHash] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [amountError, setAmountError] = useState('');
  const [hashError, setHashError] = useState('');
  const { showToast } = useToast();

  const parsedAmount = parseFloat(amountStr) || 0;
  const isBelowMin = parsedAmount < minimumDeposit;

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (val === '' || /^\d*\.?\d*$/.test(val)) {
      setAmountStr(val);
      const num = parseFloat(val) || 0;
      if (num < minimumDeposit) {
        setAmountError(`Minimum deposit is ${minimumDeposit} USDT. You entered ${num} USDT.`);
      } else {
        setAmountError('');
      }
    }
  };

  const handleHashChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTxHash(e.target.value);
    if (hashError) setHashError('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAmountError('');
    setHashError('');

    if (parsedAmount < minimumDeposit) {
      setAmountError(`Minimum deposit is ${minimumDeposit} USDT.`);
      return;
    }

    const cleanHash = txHash.trim();
    if (!cleanHash) {
      setHashError('Please enter the blockchain transaction hash (TxID).');
      return;
    }

    if (cleanHash.length < 12) {
      setHashError('Transaction hash format appears invalid (too short).');
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      const res = TrustPayStore.createDeposit({
        userId,
        networkId: network.id,
        networkName: `${network.network_name} (${network.network_standard})`,
        amountUsdt: parsedAmount,
        transactionHash: cleanHash,
      });

      setIsSubmitting(false);

      if (res.success && res.deposit) {
        showToast('Deposit submitted! Pending blockchain verification.', 'success');
        onDepositCreated(res.deposit.id);
      } else {
        setHashError(res.error || 'Failed to submit deposit.');
        showToast(res.error || 'Submission error', 'error');
      }
    }, 450);
  };

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        background: 'var(--tp-bg-surface)',
        border: '1px solid var(--tp-border-light)',
        borderRadius: 'var(--tp-radius-xl)',
        padding: '20px',
        boxShadow: 'var(--tp-shadow-card)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
        <Send size={18} color="#00E599" />
        <h2 style={{ fontSize: '15px', fontWeight: 800, color: '#FFF' }}>
          Submit Transfer Proof (TxID)
        </h2>
      </div>

      <p style={{ fontSize: '12.5px', color: 'var(--tp-text-secondary)', marginBottom: '16px', lineHeight: 1.45 }}>
        After transferring USDT from your external wallet, enter the exact deposit amount and blockchain transaction hash below.
      </p>

      {/* Amount Input */}
      <div className="tp-input-group">
        <label className="tp-input-label">
          <span>Deposit Amount (USDT)</span>
          <span style={{ color: isBelowMin ? '#EF4444' : '#00E599', fontWeight: 700 }}>
            Min: {minimumDeposit} USDT
          </span>
        </label>
        <div style={{ position: 'relative' }}>
          <input
            type="text"
            inputMode="decimal"
            value={amountStr}
            onChange={handleAmountChange}
            placeholder={`Minimum ${minimumDeposit} USDT`}
            className={`tp-input-box tp-num ${amountError ? 'tp-input-error' : ''}`}
            style={{ fontSize: '18px', fontWeight: 700 }}
          />
          <span
            style={{
              position: 'absolute',
              right: '16px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: '#00E599',
              fontWeight: 800,
              fontSize: '13px',
            }}
          >
            USDT
          </span>
        </div>

        {/* Inline Error Message */}
        {amountError && (
          <div className="tp-error-text">
            <AlertCircle size={13} />
            <span>{amountError}</span>
          </div>
        )}
      </div>

      {/* Preset Amount helper chips */}
      <div style={{ display: 'flex', gap: '6px', marginBottom: '16px', flexWrap: 'wrap' }}>
        {[500, 1000, 2500, 5000].map((preset) => (
          <button
            key={preset}
            type="button"
            onClick={() => {
              setAmountStr(preset.toString());
              setAmountError('');
            }}
            className="tp-pressable"
            style={{
              background: parsedAmount === preset ? 'rgba(0, 229, 153, 0.15)' : 'rgba(255, 255, 255, 0.04)',
              border: parsedAmount === preset ? '1px solid #00E599' : '1px solid var(--tp-border-subtle)',
              borderRadius: '6px',
              padding: '4px 10px',
              color: parsedAmount === preset ? '#00E599' : '#94A3B8',
              fontSize: '11px',
              fontWeight: 700,
            }}
          >
            +{preset} USDT
          </button>
        ))}
      </div>

      {/* Transaction Hash Input */}
      <div className="tp-input-group">
        <label className="tp-input-label">
          <span>Transaction Hash (TxID)</span>
          <span style={{ color: 'var(--tp-text-muted)' }}>From your wallet receipt</span>
        </label>
        <input
          type="text"
          value={txHash}
          onChange={handleHashChange}
          placeholder="e.g. 0x3e41b9... or 3e41b9e81f5c6a..."
          className={`tp-input-box tp-num ${hashError ? 'tp-input-error' : ''}`}
          style={{ fontSize: '13px' }}
        />
        {hashError && (
          <div className="tp-error-text">
            <AlertCircle size={13} />
            <span>{hashError}</span>
          </div>
        )}
      </div>

      {/* Status Workflow Notice */}
      <div
        style={{
          background: 'rgba(56, 189, 248, 0.08)',
          border: '1px solid rgba(56, 189, 248, 0.2)',
          borderRadius: 'var(--tp-radius-md)',
          padding: '10px 12px',
          marginBottom: '18px',
          display: 'flex',
          gap: '8px',
          fontSize: '11.5px',
          color: '#BAE6FD',
          lineHeight: 1.45,
        }}
      >
        <Info size={16} color="#38BDF8" style={{ flexShrink: 0, marginTop: '1px' }} />
        <div>
          <strong>Multi-Stage Verification:</strong> Submitting your TxID enters the transaction into 
          verification. Balance updates automatically once confirmations are validated by the nodes.
        </div>
      </div>

      {/* Submit CTA */}
      <button
        type="submit"
        disabled={isBelowMin || isSubmitting || !txHash.trim()}
        className="tp-btn-primary"
      >
        {isSubmitting ? (
          <span>Submitting Hash...</span>
        ) : (
          <span>Submit Deposit for Verification</span>
        )}
      </button>
    </form>
  );
};
