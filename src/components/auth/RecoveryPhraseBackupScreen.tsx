import React, { useState } from 'react';
import { ShieldAlert, Copy, Eye, EyeOff, ArrowRight, ArrowLeft } from '../common/Icons';
import { useToast } from '../common/Toast';

interface RecoveryPhraseBackupScreenProps {
  mnemonic: string[];
  onProceedToVerification: () => void;
  onBack: () => void;
}

export const RecoveryPhraseBackupScreen: React.FC<RecoveryPhraseBackupScreenProps> = ({
  mnemonic,
  onProceedToVerification,
  onBack,
}) => {
  const [isRevealed, setIsRevealed] = useState(false);
  const { showToast } = useToast();

  const handleCopy = () => {
    navigator.clipboard.writeText(mnemonic.join(' '));
    showToast('Recovery phrase copied. Store offline securely!', 'info');
  };

  return (
    <div
      style={{
        minHeight: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '24px',
        background: 'var(--tp-bg-app)',
      }}
    >
      <div>
        {/* Top Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
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
          <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--tp-emerald)', letterSpacing: '0.05em' }}>
            STEP 1 OF 2
          </span>
          <div style={{ width: '36px' }} />
        </div>

        <h1 style={{ fontSize: '22px', fontWeight: 800, color: '#FFF', marginBottom: '8px' }}>
          Your 12-Word Recovery Phrase
        </h1>
        <p style={{ color: 'var(--tp-text-secondary)', fontSize: '13.5px', marginBottom: '20px', lineHeight: 1.5 }}>
          Write down these 12 words in sequential order on paper. This is the <strong>only way</strong> to recover your TrustPay wallet.
        </p>

        {/* Security Alert Banner */}
        <div
          style={{
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.25)',
            borderRadius: 'var(--tp-radius-md)',
            padding: '12px 14px',
            marginBottom: '20px',
            display: 'flex',
            gap: '12px',
          }}
        >
          <ShieldAlert size={20} color="#EF4444" style={{ flexShrink: 0, marginTop: '2px' }} />
          <div style={{ fontSize: '12px', color: '#FCA5A5', lineHeight: 1.45 }}>
            <strong>DO NOT SHARE:</strong> Anyone with these 12 words can withdraw your funds. TrustPay support will NEVER ask for this phrase.
          </div>
        </div>

        {/* 12 Words Grid with Blur Shield */}
        <div
          style={{
            position: 'relative',
            background: 'var(--tp-bg-surface)',
            border: '1px solid var(--tp-border-light)',
            borderRadius: 'var(--tp-radius-lg)',
            padding: '18px',
            marginBottom: '16px',
          }}
        >
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '10px',
              filter: isRevealed ? 'none' : 'blur(7px)',
              transition: 'filter 0.25s ease',
              userSelect: isRevealed ? 'text' : 'none',
            }}
          >
            {mnemonic.map((word, idx) => (
              <div
                key={idx}
                style={{
                  background: 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid var(--tp-border-subtle)',
                  borderRadius: 'var(--tp-radius-sm)',
                  padding: '8px 10px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <span
                  style={{
                    fontSize: '11px',
                    fontWeight: 700,
                    color: 'var(--tp-text-muted)',
                    width: '18px',
                  }}
                >
                  {idx + 1}.
                </span>
                <span
                  style={{
                    fontSize: '13.5px',
                    fontWeight: 600,
                    color: '#FFF',
                    letterSpacing: '0.02em',
                  }}
                >
                  {word}
                </span>
              </div>
            ))}
          </div>

          {/* Privacy Overlay if not revealed */}
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
                background: 'rgba(12, 18, 29, 0.85)',
                borderRadius: 'var(--tp-radius-lg)',
                cursor: 'pointer',
                gap: '8px',
              }}
            >
              <Eye size={24} color="#00E599" />
              <span style={{ fontSize: '13.5px', fontWeight: 700, color: '#FFF' }}>
                Tap to Reveal Recovery Words
              </span>
              <span style={{ fontSize: '11.5px', color: 'var(--tp-text-secondary)' }}>
                Ensure no one is looking at your screen
              </span>
            </div>
          )}
        </div>

        {/* Visibility & Copy Toolbar */}
        <div style={{ display: 'flex', gap: '10px', marginBottom: '24px' }}>
          <button
            onClick={() => setIsRevealed(!isRevealed)}
            className="tp-btn-secondary"
            style={{ flex: 1, padding: '10px' }}
          >
            {isRevealed ? <EyeOff size={16} /> : <Eye size={16} />}
            <span>{isRevealed ? 'Hide Words' : 'Reveal Words'}</span>
          </button>

          <button
            onClick={handleCopy}
            className="tp-btn-secondary"
            style={{ flex: 1, padding: '10px' }}
          >
            <Copy size={16} />
            <span>Copy Phrase</span>
          </button>
        </div>
      </div>

      {/* Confirmation CTA */}
      <button onClick={onProceedToVerification} className="tp-btn-primary">
        <span>I Have Saved My Phrase</span>
        <ArrowRight size={18} />
      </button>
    </div>
  );
};
