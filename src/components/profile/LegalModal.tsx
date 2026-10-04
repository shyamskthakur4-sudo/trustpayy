import React from 'react';
import { X, ShieldCheck, FileText, Lock } from '../common/Icons';

interface LegalModalProps {
  type: 'terms' | 'privacy' | 'security';
  onClose: () => void;
}

export const LegalModal: React.FC<LegalModalProps> = ({ type, onClose }) => {
  const titles = {
    terms: 'Terms & Conditions',
    privacy: 'Privacy & Data Protection Policy',
    security: 'Security Architecture & Advisory',
  };

  return (
    <div className="tp-modal-backdrop" onClick={onClose}>
      <div className="tp-modal-content" onClick={(e) => e.stopPropagation()} style={{ maxHeight: '85vh' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {type === 'terms' && <FileText size={18} color="#00E599" />}
            {type === 'privacy' && <Lock size={18} color="#38BDF8" />}
            {type === 'security' && <ShieldCheck size={18} color="#A855F7" />}
            <h2 style={{ fontSize: '17px', fontWeight: 800, color: '#FFF' }}>
              {titles[type]}
            </h2>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', color: 'var(--tp-text-secondary)', cursor: 'pointer' }}
          >
            <X size={20} />
          </button>
        </div>

        <div style={{ fontSize: '12.5px', color: 'var(--tp-text-secondary)', lineHeight: 1.6, overflowY: 'auto' }}>
          {type === 'terms' && (
            <>
              <p style={{ marginBottom: '12px' }}>
                <strong>1. Acceptance of Terms:</strong> By creating an account or initiating an exchange on TrustPay,
                you agree to these Terms. TrustPay provides an over-the-counter digital asset settlement protocol
                converting USDT to Indian Rupee (INR).
              </p>
              <p style={{ marginBottom: '12px' }}>
                <strong>2. Minimum Threshold:</strong> All deposits must meet or exceed the active minimum deposit threshold (500 USDT).
                Transfers below this minimum are non-recoverable or subject to administrative hold.
              </p>
              <p style={{ marginBottom: '12px' }}>
                <strong>3. Non-Custodial Key Responsibility:</strong> Your 12-word recovery phrase is your cryptographic key.
                TrustPay does not hold copies of your private phrase. Loss of the recovery phrase will result in permanent inability
                to access funds.
              </p>
              <p style={{ marginBottom: '12px' }}>
                <strong>4. Settlement Processing:</strong> While the target settlement duration is approximately 15 minutes,
                bank delays, NEFT/RTGS downtime, network congestion, or AML audits may extend settlement intervals.
              </p>
            </>
          )}

          {type === 'privacy' && (
            <>
              <p style={{ marginBottom: '12px' }}>
                <strong>1. Privacy-First Philosophy:</strong> TrustPay enforces a zero-knowledge architecture regarding your
                recovery credentials. We never log, transmit, or analyze your 12-word recovery phrase on any centralized telemetry server.
              </p>
              <p style={{ marginBottom: '12px' }}>
                <strong>2. Payout Data:</strong> Bank accounts and UPI identifiers are solely used to direct requested payout
                disbursements and comply with regulatory financial recordkeeping requirements.
              </p>
              <p style={{ marginBottom: '12px' }}>
                <strong>3. Local Security:</strong> Encryption keys and app unlock states are maintained within client secure
                storage containers.
              </p>
            </>
          )}

          {type === 'security' && (
            <>
              <p style={{ marginBottom: '12px' }}>
                <strong>1. Non-Custodial Architecture:</strong> Client account authorization leverages cryptographic BIP-39
                entropy. No centralized administrator has the ability to view your backup phrase.
              </p>
              <p style={{ marginBottom: '12px' }}>
                <strong>2. Multi-Network Isolation:</strong> Each blockchain asset corridor (BSC, TRON, Arbitrum, Bitcoin, Solana)
                operates with strict network validation rules. Always verify the destination network before sending assets.
              </p>
              <p style={{ marginBottom: '12px' }}>
                <strong>3. Anti-Phishing Advisory:</strong> TrustPay personnel will NEVER contact you requesting your recovery
                phrase, PIN, or one-time password.
              </p>
            </>
          )}
        </div>

        <button type="button" onClick={onClose} className="tp-btn-primary" style={{ marginTop: '20px' }}>
          <span>I Understand & Agree</span>
        </button>
      </div>
    </div>
  );
};
