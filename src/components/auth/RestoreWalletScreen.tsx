import React, { useState } from 'react';
import { ArrowLeft, KeyRound, AlertCircle, CheckCircle2, ArrowRight } from '../common/Icons';
import { BIP39_WORDLIST } from '../../config/constants';
import { TrustPayStore } from '../../services/storage';
import { useToast } from '../common/Toast';

interface RestoreWalletScreenProps {
  onRestoreSuccess: () => void;
  onBack: () => void;
}

export const RestoreWalletScreen: React.FC<RestoreWalletScreenProps> = ({
  onRestoreSuccess,
  onBack,
}) => {
  const [rawInput, setRawInput] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { showToast } = useToast();

  const words = rawInput
    .trim()
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean);

  const wordCount = words.length;

  const handlePaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    e.preventDefault();
    const pastedText = e.clipboardData.getData('text');
    setRawInput(pastedText);
    setErrorMsg('');
  };

  const handleRestore = () => {
    setErrorMsg('');

    if (words.length !== 12) {
      setErrorMsg(`Expected 12 words, found ${words.length}. Please check your phrase.`);
      return;
    }

    const invalidWords = words.filter((w) => !BIP39_WORDLIST.includes(w));
    if (invalidWords.length > 0) {
      setErrorMsg(`Unrecognized words: "${invalidWords.join(', ')}". Check for typos.`);
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      const res = TrustPayStore.restoreUser(words);
      setIsSubmitting(false);

      if (res.success) {
        showToast('Wallet restored and verified successfully!', 'success');
        onRestoreSuccess();
      } else {
        setErrorMsg(res.error || 'Failed to restore wallet.');
      }
    }, 400);
  };

  return (
    <div
      style={{
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
      }}
    >
      <div>
        {/* Header */}
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
          <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--tp-emerald)' }}>
            RESTORE WALLET
          </span>
          <div style={{ width: '36px' }} />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              background: 'rgba(0, 229, 153, 0.12)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <KeyRound size={20} color="#00E599" />
          </div>
          <h1 style={{ fontSize: '20px', fontWeight: 800, color: '#FFF' }}>
            Enter Recovery Phrase
          </h1>
        </div>

        <p style={{ color: 'var(--tp-text-secondary)', fontSize: '13.5px', marginBottom: '20px', lineHeight: 1.5 }}>
          Paste or type your 12 secret recovery words separated by single spaces.
        </p>

        {/* Input Text Area */}
        <div style={{ position: 'relative', marginBottom: '14px' }}>
          <textarea
            value={rawInput}
            onChange={(e) => {
              setRawInput(e.target.value);
              setErrorMsg('');
            }}
            onPaste={handlePaste}
            placeholder="e.g. harvest matrix elephant crystal radar timber canyon trophy ..."
            rows={5}
            className="tp-input-box"
            style={{
              resize: 'none',
              lineHeight: 1.6,
              fontFamily: 'var(--tp-font-mono)',
              fontSize: '14px',
              borderColor: errorMsg ? '#EF4444' : words.length === 12 ? '#00E599' : undefined,
            }}
          />
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginTop: '6px',
              fontSize: '12px',
              color: 'var(--tp-text-muted)',
            }}
          >
            <span>Separated by spaces</span>
            <span
              style={{
                fontWeight: 700,
                color: wordCount === 12 ? '#00E599' : 'var(--tp-text-secondary)',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              {wordCount === 12 && <CheckCircle2 size={13} color="#00E599" />}
              {wordCount} / 12 Words
            </span>
          </div>
        </div>

        {/* Error Callout */}
        {errorMsg && (
          <div
            style={{
              background: 'rgba(239, 68, 68, 0.12)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: 'var(--tp-radius-md)',
              padding: '12px',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '8px',
              marginBottom: '16px',
            }}
          >
            <AlertCircle size={18} color="#EF4444" style={{ flexShrink: 0, marginTop: '2px' }} />
            <span style={{ fontSize: '12.5px', color: '#FCA5A5' }}>{errorMsg}</span>
          </div>
        )}

        {/* Word Chips Live Preview */}
        {wordCount > 0 && wordCount <= 12 && (
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '6px',
              padding: '12px',
              background: 'rgba(255, 255, 255, 0.02)',
              border: '1px solid var(--tp-border-subtle)',
              borderRadius: 'var(--tp-radius-md)',
              marginBottom: '16px',
            }}
          >
            {words.map((w, i) => {
              const isValid = BIP39_WORDLIST.includes(w);
              return (
                <span
                  key={i}
                  style={{
                    fontSize: '12px',
                    fontWeight: 600,
                    padding: '4px 8px',
                    borderRadius: '6px',
                    background: isValid ? 'rgba(0, 229, 153, 0.1)' : 'rgba(239, 68, 68, 0.15)',
                    color: isValid ? '#00E599' : '#F87171',
                    border: `1px solid ${isValid ? 'rgba(0, 229, 153, 0.2)' : 'rgba(239, 68, 68, 0.3)'}`,
                  }}
                >
                  {i + 1}. {w}
                </span>
              );
            })}
          </div>
        )}
      </div>

      {/* Restore CTA */}
      <button
        onClick={handleRestore}
        disabled={wordCount !== 12 || isSubmitting}
        className="tp-btn-primary"
      >
        <span>{isSubmitting ? 'Verifying Phrase...' : 'Restore TrustPay Wallet'}</span>
        <ArrowRight size={18} />
      </button>
    </div>
  );
};
