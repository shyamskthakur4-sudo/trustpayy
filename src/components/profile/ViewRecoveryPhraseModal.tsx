import React, { useState } from 'react';
import { X, Lock, Eye, EyeOff, Copy, ShieldAlert, Check } from '../common/Icons';
import { TrustPayStore } from '../../services/storage';
import { useToast } from '../common/Toast';

interface ViewRecoveryPhraseModalProps {
  onClose: () => void;
}

export const ViewRecoveryPhraseModal: React.FC<ViewRecoveryPhraseModalProps> = ({ onClose }) => {
  const [pinInput, setPinInput] = useState('');
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [isRevealed, setIsRevealed] = useState(false);
  const [pinError, setPinError] = useState('');
  const [copied, setCopied] = useState(false);
  const { showToast } = useToast();

  const user = TrustPayStore.getUser();
  const phrase = user?.security_settings.recovery_phrase || [];

  const handleVerifyPin = (e: React.FormEvent) => {
    e.preventDefault();
    setPinError('');

    // If no PIN is configured, allow direct unlock
    if (!user?.security_settings.pin_enabled) {
      setIsUnlocked(true);
      return;
    }

    if (TrustPayStore.verifyPin(pinInput)) {
      setIsUnlocked(true);
      showToast('PIN verified. Phrase unlocked.', 'success');
    } else {
      setPinError('Incorrect security PIN. Access denied.');
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(phrase.join(' '));
    setCopied(true);
    showToast('Recovery phrase copied. Keep offline!', 'info');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="tp-modal-backdrop" onClick={onClose}>
      <div className="tp-modal-content" onClick={(e) => e.stopPropagation()}>
        {/* Top Bar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#FFF' }}>
            Recovery Phrase
          </h2>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', color: 'var(--tp-text-secondary)', cursor: 'pointer' }}
          >
            <X size={20} />
          </button>
        </div>

        {!isUnlocked ? (
          /* Step 1: Mandatory PIN Re-Authentication */
          <form onSubmit={handleVerifyPin}>
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '14px',
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.25)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 14px',
              }}
            >
              <Lock size={22} color="#EF4444" />
            </div>

            <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#FFF', textAlign: 'center', marginBottom: '6px' }}>
              Security Re-Authentication Required
            </h3>
            <p style={{ fontSize: '12.5px', color: 'var(--tp-text-secondary)', textAlign: 'center', marginBottom: '20px' }}>
              Enter your 6-digit security PIN to view your 12-word recovery credentials.
            </p>

            {user?.security_settings.pin_enabled ? (
              <div className="tp-input-group">
                <input
                  type="password"
                  inputMode="numeric"
                  maxLength={6}
                  value={pinInput}
                  onChange={(e) => setPinInput(e.target.value)}
                  placeholder="Enter 6-digit PIN"
                  className="tp-input-box tp-num"
                  style={{ textAlign: 'center', letterSpacing: '0.3em', fontSize: '20px' }}
                  autoFocus
                />
                {pinError && <div className="tp-error-text" style={{ justifyContent: 'center' }}>{pinError}</div>}
              </div>
            ) : (
              <p style={{ fontSize: '12px', color: 'var(--tp-emerald)', textAlign: 'center', marginBottom: '16px' }}>
                No PIN configured. Click unlock below to view.
              </p>
            )}

            <button type="submit" className="tp-btn-primary" style={{ marginTop: '10px' }}>
              <span>Unlock Secret Phrase</span>
            </button>
          </form>
        ) : (
          /* Step 2: Display 12 Words with Privacy Shield */
          <div>
            <div
              style={{
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.25)',
                borderRadius: 'var(--tp-radius-md)',
                padding: '12px',
                marginBottom: '16px',
                display: 'flex',
                gap: '10px',
              }}
            >
              <ShieldAlert size={18} color="#EF4444" style={{ flexShrink: 0 }} />
              <span style={{ fontSize: '11.5px', color: '#FCA5A5', lineHeight: 1.45 }}>
                Do not allow anyone to look at your screen. Anyone with this phrase has full access to your funds.
              </span>
            </div>

            <div
              style={{
                position: 'relative',
                background: 'rgba(0, 0, 0, 0.3)',
                border: '1px solid var(--tp-border-light)',
                borderRadius: 'var(--tp-radius-lg)',
                padding: '16px',
                marginBottom: '16px',
              }}
            >
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: '8px',
                  filter: isRevealed ? 'none' : 'blur(7px)',
                  transition: 'filter 0.2s ease',
                  userSelect: isRevealed ? 'text' : 'none',
                }}
              >
                {phrase.map((w, idx) => (
                  <div
                    key={idx}
                    style={{
                      background: 'rgba(255, 255, 255, 0.05)',
                      borderRadius: 'var(--tp-radius-sm)',
                      padding: '6px 8px',
                      display: 'flex',
                      gap: '6px',
                      fontSize: '12.5px',
                    }}
                  >
                    <span style={{ color: 'var(--tp-text-muted)', fontSize: '10.5px' }}>{idx + 1}.</span>
                    <span style={{ color: '#FFF', fontWeight: 600 }}>{w}</span>
                  </div>
                ))}
              </div>

              {!isRevealed && (
                <div
                  onClick={() => setIsRevealed(true)}
                  style={{
                    position: 'absolute',
                    inset: 0,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'rgba(10, 15, 26, 0.85)',
                    borderRadius: 'var(--tp-radius-lg)',
                    cursor: 'pointer',
                    gap: '4px',
                  }}
                >
                  <Eye size={20} color="#00E599" />
                  <span style={{ fontSize: '13px', fontWeight: 700, color: '#FFF' }}>
                    Tap to Unmask
                  </span>
                </div>
              )}
            </div>

            <div style={{ display: 'flex', gap: '10px', marginBottom: '16px' }}>
              <button
                type="button"
                onClick={() => setIsRevealed(!isRevealed)}
                className="tp-btn-secondary"
                style={{ flex: 1, padding: '10px' }}
              >
                {isRevealed ? <EyeOff size={15} /> : <Eye size={15} />}
                <span>{isRevealed ? 'Hide' : 'Reveal'}</span>
              </button>

              <button
                type="button"
                onClick={handleCopy}
                className="tp-btn-secondary"
                style={{ flex: 1, padding: '10px' }}
              >
                {copied ? <Check size={15} color="#00E599" /> : <Copy size={15} />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>

            <button type="button" onClick={onClose} className="tp-btn-primary">
              <span>Done</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
