import React, { useState } from 'react';
import { ArrowLeft, ArrowUpRight, Zap, Building2, Smartphone, AlertCircle, ShieldCheck, ChevronRight } from '../common/Icons';
import { ExchangeSettings, PayoutDetails, UserAccount } from '../../types';
import { TrustPayStore } from '../../services/storage';
import { useToast } from '../common/Toast';

interface WithdrawScreenProps {
  user: UserAccount;
  exchangeSettings: ExchangeSettings;
  initialAmountUsdt?: number;
  onBack: () => void;
  onWithdrawCreated: (orderId: string) => void;
}

export const WithdrawScreen: React.FC<WithdrawScreenProps> = ({
  user,
  exchangeSettings,
  initialAmountUsdt,
  onBack,
  onWithdrawCreated,
}) => {
  const [method, setMethod] = useState<'UPI' | 'IMPS'>('UPI');
  const [amountUsdt, setAmountUsdt] = useState<string>(
    initialAmountUsdt && initialAmountUsdt > 0
      ? initialAmountUsdt.toString()
      : user.balance_usdt >= 500
      ? '500'
      : ''
  );

  // UPI Fields
  const [upiHolderName, setUpiHolderName] = useState('');
  const [upiId, setUpiId] = useState('');

  // IMPS Fields
  const [impsHolderName, setImpsHolderName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [ifscCode, setIfscCode] = useState('');
  const [bankName, setBankName] = useState('');

  // Confirmation Modal
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { showToast } = useToast();
  const rate = exchangeSettings.exchange_rate;

  const parsedAmount = parseFloat(amountUsdt) || 0;
  const inrAmount = Math.round(parsedAmount * rate * 100) / 100;

  const validateForm = (): boolean => {
    setErrorMsg('');

    if (parsedAmount <= 0) {
      setErrorMsg('Please enter a valid withdrawal amount.');
      return false;
    }

    if (parsedAmount > user.balance_usdt) {
      setErrorMsg(`Insufficient USDT balance. Available: ${user.balance_usdt.toFixed(2)} USDT.`);
      return false;
    }

    if (method === 'UPI') {
      if (!upiHolderName.trim()) {
        setErrorMsg('Please enter the account holder name.');
        return false;
      }
      if (!upiId.trim() || !upiId.includes('@')) {
        setErrorMsg('Please enter a valid UPI ID (e.g. user@okhdfcbank).');
        return false;
      }
    } else {
      if (!impsHolderName.trim()) {
        setErrorMsg('Please enter the account holder name.');
        return false;
      }
      if (!accountNumber.trim() || accountNumber.length < 8) {
        setErrorMsg('Please enter a valid bank account number.');
        return false;
      }
      if (!ifscCode.trim() || ifscCode.length < 6) {
        setErrorMsg('Please enter a valid bank IFSC code.');
        return false;
      }
      if (!bankName.trim()) {
        setErrorMsg('Please specify your bank name.');
        return false;
      }
    }

    return true;
  };

  const handleReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      setShowConfirmModal(true);
    }
  };

  const handleConfirmWithdrawal = () => {
    setIsSubmitting(true);

    const payoutDetails: PayoutDetails =
      method === 'UPI'
        ? {
            type: 'UPI',
            account_holder_name: upiHolderName.trim(),
            upi_id: upiId.trim(),
          }
        : {
            type: 'IMPS',
            account_holder_name: impsHolderName.trim(),
            bank_account_number: accountNumber.trim(),
            ifsc_code: ifscCode.trim().toUpperCase(),
            bank_name: bankName.trim(),
          };

    setTimeout(() => {
      const res = TrustPayStore.createWithdrawal({
        userId: user.id,
        method,
        amountUsdt: parsedAmount,
        payoutDetails,
      });

      setIsSubmitting(false);

      if (res.success && res.withdrawal) {
        setShowConfirmModal(false);
        showToast('Withdrawal order submitted successfully!', 'success');
        onWithdrawCreated(res.withdrawal.id);
      } else {
        setErrorMsg(res.error || 'Failed to submit withdrawal.');
        showToast(res.error || 'Withdrawal failed', 'error');
      }
    }, 450);
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
        padding: '16px 16px 90px',
      }}
    >
      {/* Top Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <button
          onClick={onBack}
          className="tp-pressable"
          style={{
            background: 'rgba(255, 255, 255, 0.05)',
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
        <h1 style={{ fontSize: '17px', fontWeight: 800, color: '#FFF' }}>
          Withdraw INR
        </h1>
        <div style={{ width: '36px' }} />
      </div>

      {/* Available Balance Overview Banner */}
      <div
        style={{
          background: 'linear-gradient(135deg, rgba(56, 189, 248, 0.1) 0%, rgba(14, 23, 38, 0.95) 100%)',
          border: '1px solid rgba(56, 189, 248, 0.25)',
          borderRadius: 'var(--tp-radius-lg)',
          padding: '16px 18px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <div>
          <div style={{ fontSize: '11.5px', color: 'var(--tp-text-secondary)', textTransform: 'uppercase', fontWeight: 600 }}>
            Available for Payout
          </div>
          <div className="tp-num" style={{ fontSize: '20px', fontWeight: 800, color: '#FFF' }}>
            {user.balance_usdt.toLocaleString('en-US', { minimumFractionDigits: 2 })} USDT
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '11px', color: 'var(--tp-text-muted)' }}>Configured Rate</div>
          <div style={{ fontSize: '14px', fontWeight: 700, color: '#00E599' }}>₹{rate} / USDT</div>
        </div>
      </div>

      {/* Payout Method Toggle: UPI vs IMPS */}
      <div>
        <div style={{ fontSize: '12.5px', fontWeight: 700, color: 'var(--tp-text-secondary)', marginBottom: '8px' }}>
          Select Payout Rail
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
          <button
            type="button"
            onClick={() => setMethod('UPI')}
            className="tp-pressable"
            style={{
              background: method === 'UPI' ? 'rgba(0, 229, 153, 0.15)' : 'var(--tp-bg-surface)',
              border: method === 'UPI' ? '1px solid #00E599' : '1px solid var(--tp-border-subtle)',
              borderRadius: 'var(--tp-radius-md)',
              padding: '14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              color: method === 'UPI' ? '#00E599' : 'var(--tp-text-secondary)',
              fontWeight: 700,
              fontSize: '14px',
              cursor: 'pointer',
            }}
          >
            <Smartphone size={18} />
            <span>UPI Instant</span>
          </button>

          <button
            type="button"
            onClick={() => setMethod('IMPS')}
            className="tp-pressable"
            style={{
              background: method === 'IMPS' ? 'rgba(56, 189, 248, 0.15)' : 'var(--tp-bg-surface)',
              border: method === 'IMPS' ? '1px solid #38BDF8' : '1px solid var(--tp-border-subtle)',
              borderRadius: 'var(--tp-radius-md)',
              padding: '14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              color: method === 'IMPS' ? '#38BDF8' : 'var(--tp-text-secondary)',
              fontWeight: 700,
              fontSize: '14px',
              cursor: 'pointer',
            }}
          >
            <Building2 size={18} />
            <span>IMPS Bank Transfer</span>
          </button>
        </div>
      </div>

      {/* Main Withdrawal Form */}
      <form
        onSubmit={handleReview}
        style={{
          background: 'var(--tp-bg-surface)',
          border: '1px solid var(--tp-border-light)',
          borderRadius: 'var(--tp-radius-xl)',
          padding: '20px',
          boxShadow: 'var(--tp-shadow-card)',
        }}
      >
        {/* USDT Amount Input */}
        <div className="tp-input-group">
          <label className="tp-input-label">
            <span>USDT to Exchange</span>
            <button
              type="button"
              onClick={() => setAmountUsdt(user.balance_usdt.toString())}
              style={{ background: 'none', border: 'none', color: '#00E599', fontWeight: 700, fontSize: '11.5px', cursor: 'pointer' }}
            >
              USE MAX ({user.balance_usdt.toFixed(0)})
            </button>
          </label>
          <div style={{ position: 'relative' }}>
            <input
              type="text"
              inputMode="decimal"
              value={amountUsdt}
              onChange={(e) => {
                const val = e.target.value;
                if (val === '' || /^\d*\.?\d*$/.test(val)) setAmountUsdt(val);
              }}
              placeholder="0.00"
              className="tp-input-box tp-num"
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
        </div>

        {/* Live INR Output Card */}
        <div
          style={{
            background: 'rgba(0, 229, 153, 0.06)',
            border: '1px solid rgba(0, 229, 153, 0.25)',
            borderRadius: 'var(--tp-radius-md)',
            padding: '12px 14px',
            marginBottom: '18px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <div style={{ fontSize: '11px', color: 'var(--tp-text-secondary)', fontWeight: 600 }}>
              Calculated Payout Amount
            </div>
            <div className="tp-num" style={{ fontSize: '20px', fontWeight: 800, color: '#00E599' }}>
              ₹{inrAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </div>
          <div style={{ textAlign: 'right', fontSize: '11px', color: 'var(--tp-text-muted)' }}>
            Fee: ₹0.00
          </div>
        </div>

        {/* UPI Fields */}
        {method === 'UPI' && (
          <>
            <div className="tp-input-group">
              <label className="tp-input-label">Account Holder Name</label>
              <input
                type="text"
                value={upiHolderName}
                onChange={(e) => setUpiHolderName(e.target.value)}
                placeholder="e.g. Aditya Sharma"
                className="tp-input-box"
              />
            </div>

            <div className="tp-input-group">
              <label className="tp-input-label">UPI ID / VPA</label>
              <input
                type="text"
                value={upiId}
                onChange={(e) => setUpiId(e.target.value)}
                placeholder="e.g. aditya.sharma@okhdfcbank"
                className="tp-input-box"
              />
            </div>
          </>
        )}

        {/* IMPS Bank Fields */}
        {method === 'IMPS' && (
          <>
            <div className="tp-input-group">
              <label className="tp-input-label">Account Holder Name</label>
              <input
                type="text"
                value={impsHolderName}
                onChange={(e) => setImpsHolderName(e.target.value)}
                placeholder="e.g. Aditya Sharma"
                className="tp-input-box"
              />
            </div>

            <div className="tp-input-group">
              <label className="tp-input-label">Bank Account Number</label>
              <input
                type="text"
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
                placeholder="e.g. 50100294819201"
                className="tp-input-box tp-num"
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div className="tp-input-group">
                <label className="tp-input-label">IFSC Code</label>
                <input
                  type="text"
                  value={ifscCode}
                  onChange={(e) => setIfscCode(e.target.value.toUpperCase())}
                  placeholder="e.g. HDFC0001234"
                  className="tp-input-box"
                  style={{ textTransform: 'uppercase' }}
                />
              </div>

              <div className="tp-input-group">
                <label className="tp-input-label">Bank Name</label>
                <input
                  type="text"
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  placeholder="e.g. HDFC Bank"
                  className="tp-input-box"
                />
              </div>
            </div>
          </>
        )}

        {/* Inline Error Message */}
        {errorMsg && (
          <div className="tp-error-text" style={{ marginBottom: '14px' }}>
            <AlertCircle size={14} />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Settlement notice */}
        <div
          style={{
            background: 'rgba(255, 255, 255, 0.03)',
            borderRadius: 'var(--tp-radius-sm)',
            padding: '10px 12px',
            marginBottom: '18px',
            display: 'flex',
            gap: '8px',
            fontSize: '11px',
            color: 'var(--tp-text-muted)',
            lineHeight: 1.4,
          }}
        >
          <Zap size={15} color="#F59E0B" style={{ flexShrink: 0, marginTop: '1px' }} />
          <span>
            Target settlement is ~15 minutes. Processing depends on banking rail availability,
            network conditions, and compliance clearance.
          </span>
        </div>

        {/* Review & Continue CTA */}
        <button type="submit" className="tp-btn-primary">
          <span>Review Withdrawal Details</span>
          <ChevronRight size={18} />
        </button>
      </form>

      {/* Confirmation Modal Screen (Mandatory Section 7) */}
      {showConfirmModal && (
        <div className="tp-modal-backdrop">
          <div className="tp-modal-content">
            <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#FFF', marginBottom: '4px' }}>
              Confirm Withdrawal
            </h2>
            <p style={{ fontSize: '13px', color: 'var(--tp-text-secondary)', marginBottom: '18px' }}>
              Please carefully review your payout order before authorizing deduction.
            </p>

            {/* Breakdown Table */}
            <div
              style={{
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid var(--tp-border-subtle)',
                borderRadius: 'var(--tp-radius-md)',
                padding: '16px',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                marginBottom: '18px',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                <span style={{ color: 'var(--tp-text-secondary)' }}>Withdrawal Amount</span>
                <span className="tp-num" style={{ fontWeight: 800, color: '#00E599', fontSize: '16px' }}>
                  ₹{inrAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                <span style={{ color: 'var(--tp-text-secondary)' }}>USDT Used</span>
                <span className="tp-num" style={{ fontWeight: 700, color: '#FFF' }}>
                  {parsedAmount.toFixed(2)} USDT
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                <span style={{ color: 'var(--tp-text-secondary)' }}>Exchange Rate</span>
                <span className="tp-num" style={{ fontWeight: 600, color: '#FFF' }}>
                  ₹{rate} / USDT
                </span>
              </div>

              <div style={{ height: '1px', background: 'var(--tp-border-subtle)' }} />

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                <span style={{ color: 'var(--tp-text-secondary)' }}>Payout Method</span>
                <span style={{ fontWeight: 700, color: '#38BDF8' }}>{method}</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                <span style={{ color: 'var(--tp-text-secondary)' }}>Account Holder</span>
                <span style={{ fontWeight: 600, color: '#FFF' }}>
                  {method === 'UPI' ? upiHolderName : impsHolderName}
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                <span style={{ color: 'var(--tp-text-secondary)' }}>Destination</span>
                <span className="tp-num" style={{ fontWeight: 600, color: '#FFF' }}>
                  {method === 'UPI' ? upiId : `${bankName} (${accountNumber.slice(-4)})`}
                </span>
              </div>

              <div style={{ height: '1px', background: 'var(--tp-border-subtle)' }} />

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                <span style={{ color: '#FFF', fontWeight: 700 }}>Final INR Amount</span>
                <span className="tp-num" style={{ fontWeight: 900, color: '#00E599', fontSize: '18px' }}>
                  ₹{inrAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>

            {/* Disclaimer on processing target */}
            <div
              style={{
                fontSize: '11px',
                color: 'var(--tp-text-muted)',
                lineHeight: 1.45,
                marginBottom: '18px',
              }}
            >
              * Note: Estimated settlement target is approximately 15 minutes. Not an unconditional guarantee;
              actual settlement times depend on recipient banking rail responses, IFSC clearance, and verification.
            </div>

            {/* Modal Actions */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <button
                type="button"
                onClick={handleConfirmWithdrawal}
                disabled={isSubmitting}
                className="tp-btn-primary"
              >
                <span>{isSubmitting ? 'Submitting Order...' : 'Confirm Withdrawal'}</span>
              </button>

              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className="tp-btn-secondary"
              >
                <span>Cancel & Edit</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
