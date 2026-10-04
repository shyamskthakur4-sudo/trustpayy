import React, { useState, useMemo } from 'react';
import { CheckCircle2, ArrowLeft, ArrowRight, AlertCircle } from '../common/Icons';
import { useToast } from '../common/Toast';

interface RecoveryPhraseConfirmScreenProps {
  mnemonic: string[];
  onConfirmSuccess: () => void;
  onBack: () => void;
}

export const RecoveryPhraseConfirmScreen: React.FC<RecoveryPhraseConfirmScreenProps> = ({
  mnemonic,
  onConfirmSuccess,
  onBack,
}) => {
  const { showToast } = useToast();

  // Pick 3 random distinct word indices (1-indexed: e.g. 3, 7, 11)
  const challengeIndices = useMemo(() => {
    const indices = [2, 6, 10]; // 3rd, 7th, 11th words (0-indexed)
    return indices;
  }, []);

  const [selectedWords, setSelectedWords] = useState<{ [index: number]: string }>({});

  // Generate 4 candidate chips for each challenge index (1 correct + 3 distractors)
  const candidatePools = useMemo(() => {
    const pools: { [index: number]: string[] } = {};

    challengeIndices.forEach((idx) => {
      const correctWord = mnemonic[idx];
      const otherWords = mnemonic.filter((_, i) => i !== idx);
      // Pick 3 random distractors from the remaining mnemonic words
      const shuffledOthers = [...otherWords].sort(() => 0.5 - Math.random()).slice(0, 3);
      const combined = [correctWord, ...shuffledOthers].sort();
      pools[idx] = combined;
    });

    return pools;
  }, [challengeIndices, mnemonic]);

  const handleSelectWord = (challengeIdx: number, word: string) => {
    setSelectedWords((prev) => ({
      ...prev,
      [challengeIdx]: word,
    }));
  };

  const isComplete = challengeIndices.every((idx) => selectedWords[idx] !== undefined);

  const isAllCorrect = challengeIndices.every((idx) => selectedWords[idx] === mnemonic[idx]);

  const handleVerify = () => {
    if (!isComplete) {
      showToast('Please select a word for all 3 slots.', 'error');
      return;
    }

    if (!isAllCorrect) {
      showToast('One or more selected words are incorrect. Please verify your paper backup.', 'error');
      return;
    }

    showToast('Recovery phrase verified successfully!', 'success');
    onConfirmSuccess();
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
            STEP 2 OF 3
          </span>
          <div style={{ width: '36px' }} />
        </div>

        <h1 style={{ fontSize: '22px', fontWeight: 800, color: '#FFF', marginBottom: '8px' }}>
          Verify Your Backup
        </h1>
        <p style={{ color: 'var(--tp-text-secondary)', fontSize: '13.5px', marginBottom: '24px', lineHeight: 1.5 }}>
          Select the correct word for each numbered slot to confirm that you have accurately saved your 12-word recovery phrase.
        </p>

        {/* 3 Challenge Question Cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          {challengeIndices.map((targetIdx) => {
            const slotNumber = targetIdx + 1;
            const currentSelected = selectedWords[targetIdx];
            const pool = candidatePools[targetIdx] || [];

            return (
              <div
                key={targetIdx}
                style={{
                  background: 'var(--tp-bg-surface)',
                  border: '1px solid var(--tp-border-light)',
                  borderRadius: 'var(--tp-radius-md)',
                  padding: '16px',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '12px',
                  }}
                >
                  <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--tp-text-secondary)' }}>
                    Select Word #{slotNumber}
                  </span>
                  {currentSelected && (
                    <span
                      style={{
                        fontSize: '13px',
                        fontWeight: 700,
                        color: currentSelected === mnemonic[targetIdx] ? '#00E599' : '#EF4444',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                      }}
                    >
                      {currentSelected === mnemonic[targetIdx] ? (
                        <>
                          <CheckCircle2 size={14} /> Correct
                        </>
                      ) : (
                        <>
                          <AlertCircle size={14} /> Incorrect
                        </>
                      )}
                    </span>
                  )}
                </div>

                {/* Candidate Word Chips */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
                  {pool.map((word) => {
                    const isPicked = currentSelected === word;
                    return (
                      <button
                        key={word}
                        type="button"
                        onClick={() => handleSelectWord(targetIdx, word)}
                        className="tp-pressable"
                        style={{
                          background: isPicked ? 'rgba(0, 229, 153, 0.15)' : 'rgba(255, 255, 255, 0.04)',
                          border: isPicked ? '1px solid #00E599' : '1px solid var(--tp-border-subtle)',
                          borderRadius: 'var(--tp-radius-sm)',
                          padding: '10px 12px',
                          color: isPicked ? '#00E599' : '#F8FAFC',
                          fontWeight: 600,
                          fontSize: '13.5px',
                          textAlign: 'center',
                          cursor: 'pointer',
                        }}
                      >
                        {word}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Submit Button */}
      <div style={{ marginTop: '24px' }}>
        <button
          onClick={handleVerify}
          disabled={!isComplete || !isAllCorrect}
          className="tp-btn-primary"
        >
          <span>Complete Wallet Verification</span>
          <ArrowRight size={18} />
        </button>
      </div>
    </div>
  );
};
