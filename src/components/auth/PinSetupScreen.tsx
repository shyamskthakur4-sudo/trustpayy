import React, { useState } from 'react';
import { Lock, Check, Fingerprint, ArrowRight, ArrowLeft } from '../common/Icons';
import { TrustPayStore } from '../../services/storage';
import { useToast } from '../common/Toast';

interface PinSetupScreenProps {
  onComplete: (pin: string, enableBiometrics: boolean) => void;
  onBack?: () => void;
  onSkip?: () => void;
}

export const PinSetupScreen: React.FC<PinSetupScreenProps> = ({ onComplete, onBack, onSkip }) => {
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [step, setStep] = useState<'create' | 'confirm'>('create');
  const [enableBiometrics, setEnableBiometrics] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const { showToast } = useToast();

  const handleKeyPress = (num: string) => {
    if (typeof window !== 'undefined' && 'navigator' in window && navigator.vibrate) {
      navigator.vibrate(15);
    }
    setErrorMsg('');

    if (step === 'create') {
      if (pin.length < 6) {
        const next = pin + num;
        setPin(next);
        if (next.length === 6) {
          setTimeout(() => {
            setStep('confirm');
          }, 200);
        }
      }
    } else {
      if (confirmPin.length < 6) {
        const next = confirmPin + num;
        setConfirmPin(next);
        if (next.length === 6) {
          if (next === pin) {
            const rawUser = TrustPayStore.getRawUser();
            if (rawUser) {
              TrustPayStore.setPin(pin);
              if (enableBiometrics) {
                TrustPayStore.updateUser({
                  security_settings: {
                    ...rawUser.security_settings,
                    biometric_enabled: true,
                  },
                });
              }
            }
            showToast('Security PIN successfully configured!', 'success');
            onComplete(pin, enableBiometrics);
          } else {
            setErrorMsg('PINs do not match. Please try again.');
            setTimeout(() => {
              setPin('');
              setConfirmPin('');
              setStep('create');
            }, 800);
          }
        }
      }
    }
  };

  const handleDelete = () => {
    if (step === 'create') {
      setPin((prev) => prev.slice(0, -1));
    } else {
      setConfirmPin((prev) => prev.slice(0, -1));
    }
    setErrorMsg('');
  };

  const currentLength = step === 'create' ? pin.length : confirmPin.length;

  return (
    <div
      style={{
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        textAlign: 'center',
      }}
    >
      <div>
        {onBack && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <button
              type="button"
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
              STEP 3 OF 3
            </span>
            <div style={{ width: '36px' }} />
          </div>
        )}

        <div
          style={{
            width: '52px',
            height: '52px',
            borderRadius: '16px',
            background: 'rgba(0, 229, 153, 0.12)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px',
            border: '1px solid rgba(0, 229, 153, 0.25)',
          }}
        >
          <Lock size={26} color="#00E599" />
        </div>

        <h1 style={{ fontSize: '22px', fontWeight: 800, color: '#FFF', marginBottom: '8px' }}>
          {step === 'create' ? 'Set 6-Digit App PIN' : 'Confirm Your 6-Digit PIN'}
        </h1>
        <p style={{ color: 'var(--tp-text-secondary)', fontSize: '13.5px', marginBottom: '24px' }}>
          {step === 'create'
            ? 'This PIN will be required to open TrustPay and approve withdrawals.'
            : 'Enter the exact same 6 digits to verify.'}
        </p>

        {/* 6 Dots Indicator */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '14px', marginBottom: '16px' }}>
          {[0, 1, 2, 3, 4, 5].map((i) => {
            const filled = i < currentLength;
            return (
              <div
                key={i}
                style={{
                  width: '16px',
                  height: '16px',
                  borderRadius: '50%',
                  background: filled ? '#00E599' : 'rgba(255, 255, 255, 0.1)',
                  border: filled ? '2px solid #00E599' : '2px solid rgba(255, 255, 255, 0.2)',
                  boxShadow: filled ? '0 0 12px rgba(0, 229, 153, 0.6)' : 'none',
                  transition: 'all 0.18s ease',
                }}
              />
            );
          })}
        </div>

        {errorMsg && (
          <p style={{ color: '#F87171', fontSize: '13px', fontWeight: 600, marginTop: '8px' }}>
            {errorMsg}
          </p>
        )}

        {/* Biometrics Toggle (shown on step 1) */}
        {step === 'create' && (
          <div
            onClick={() => setEnableBiometrics(!enableBiometrics)}
            className="tp-pressable"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '10px',
              background: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid var(--tp-border-subtle)',
              borderRadius: 'var(--tp-radius-full)',
              padding: '6px 14px',
              marginTop: '12px',
              fontSize: '12.5px',
              color: 'var(--tp-text-secondary)',
            }}
          >
            <Fingerprint size={16} color={enableBiometrics ? '#00E599' : '#94A3B8'} />
            <span>Enable Biometric / Fingerprint Unlock</span>
            <div
              style={{
                width: '18px',
                height: '18px',
                borderRadius: '50%',
                background: enableBiometrics ? '#00E599' : 'rgba(255, 255, 255, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {enableBiometrics && <Check size={12} color="#06090F" strokeWidth={3} />}
            </div>
          </div>
        )}
      </div>

      {/* Numerical Keypad */}
      <div style={{ maxWidth: '300px', margin: '0 auto', width: '100%' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px' }}>
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
            <button
              key={digit}
              type="button"
              onClick={() => handleKeyPress(digit)}
              className="tp-pressable"
              style={{
                height: '56px',
                borderRadius: '16px',
                background: 'rgba(255, 255, 255, 0.06)',
                border: '1px solid var(--tp-border-subtle)',
                color: '#FFF',
                fontSize: '22px',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {digit}
            </button>
          ))}
          <div />
          <button
            type="button"
            onClick={() => handleKeyPress('0')}
            className="tp-pressable"
            style={{
              height: '56px',
              borderRadius: '16px',
              background: 'rgba(255, 255, 255, 0.06)',
              border: '1px solid var(--tp-border-subtle)',
              color: '#FFF',
              fontSize: '22px',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            0
          </button>
          <button
            type="button"
            onClick={handleDelete}
            className="tp-pressable"
            style={{
              height: '56px',
              borderRadius: '16px',
              background: 'transparent',
              border: 'none',
              color: 'var(--tp-text-secondary)',
              fontSize: '13px',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            Delete
          </button>
        </div>

        {onSkip && (
          <button
            onClick={onSkip}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--tp-text-muted)',
              fontSize: '12.5px',
              fontWeight: 600,
              marginTop: '18px',
              cursor: 'pointer',
            }}
          >
            Set up later in Settings
          </button>
        )}
      </div>
    </div>
  );
};
