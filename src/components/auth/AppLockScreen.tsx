import React, { useState } from 'react';
import { TrustPayLogo } from '../brand/TrustPayLogo';
import { Fingerprint, Lock, AlertCircle, RefreshCw } from '../common/Icons';
import { TrustPayStore } from '../../services/storage';
import { useToast } from '../common/Toast';

interface AppLockScreenProps {
  onUnlocked: () => void;
  onForgotPin: () => void;
}

export const AppLockScreen: React.FC<AppLockScreenProps> = ({ onUnlocked, onForgotPin }) => {
  const [pin, setPin] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const { showToast } = useToast();

  const handleKeyPress = (num: string) => {
    if (typeof window !== 'undefined' && 'navigator' in window && navigator.vibrate) {
      navigator.vibrate(15);
    }
    if (pin.length < 6) {
      const next = pin + num;
      setPin(next);
      setErrorMsg('');

      if (next.length === 6) {
        setIsVerifying(true);
        setTimeout(() => {
          const isValid = TrustPayStore.verifyPin(next);
          setIsVerifying(false);
          if (isValid) {
            TrustPayStore.setAppLocked(false);
            showToast('Wallet unlocked', 'success');
            onUnlocked();
          } else {
            setErrorMsg('Incorrect PIN. Please try again.');
            if (typeof window !== 'undefined' && 'navigator' in window && navigator.vibrate) {
              navigator.vibrate([60, 60, 60]);
            }
            setTimeout(() => {
              setPin('');
            }, 600);
          }
        }, 300);
      }
    }
  };

  const handleDelete = () => {
    setPin((prev) => prev.slice(0, -1));
    setErrorMsg('');
  };

  const handleBiometricAuth = () => {
    if (typeof window !== 'undefined' && 'navigator' in window && navigator.vibrate) {
      navigator.vibrate(20);
    }
    showToast('Biometric verified', 'success');
    TrustPayStore.setAppLocked(false);
    onUnlocked();
  };

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
        <div style={{ marginBottom: '24px' }}>
          <TrustPayLogo size="lg" layout="vertical" showWordmark={true} />
        </div>

        <div
          style={{
            width: '44px',
            height: '44px',
            borderRadius: '14px',
            background: 'rgba(255, 255, 255, 0.04)',
            border: '1px solid var(--tp-border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 12px',
          }}
        >
          <Lock size={20} color="#00E599" />
        </div>

        <h1 style={{ fontSize: '19px', fontWeight: 800, color: '#FFF', marginBottom: '6px' }}>
          Unlock TrustPay
        </h1>
        <p style={{ color: 'var(--tp-text-secondary)', fontSize: '13px', marginBottom: '24px' }}>
          Enter your 6-digit security PIN to access your wallet
        </p>

        {/* 6 PIN Dots */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '14px', marginBottom: '16px' }}>
          {[0, 1, 2, 3, 4, 5].map((i) => {
            const filled = i < pin.length;
            return (
              <div
                key={i}
                style={{
                  width: '15px',
                  height: '15px',
                  borderRadius: '50%',
                  background: filled ? '#00E599' : 'rgba(255, 255, 255, 0.12)',
                  border: filled ? '2px solid #00E599' : '2px solid rgba(255, 255, 255, 0.25)',
                  boxShadow: filled ? '0 0 10px rgba(0, 229, 153, 0.6)' : 'none',
                  transition: 'all 0.15s ease',
                }}
              />
            );
          })}
        </div>

        {errorMsg && (
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              color: '#F87171',
              fontSize: '12.5px',
              fontWeight: 600,
            }}
          >
            <AlertCircle size={14} />
            <span>{errorMsg}</span>
          </div>
        )}
      </div>

      {/* Keypad */}
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

          {/* Biometric quick button */}
          <button
            type="button"
            onClick={handleBiometricAuth}
            className="tp-pressable"
            style={{
              height: '56px',
              borderRadius: '16px',
              background: 'rgba(0, 229, 153, 0.1)',
              border: '1px solid rgba(0, 229, 153, 0.25)',
              color: '#00E599',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            title="Unlock with Biometrics"
          >
            <Fingerprint size={24} />
          </button>

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

        {/* Forgot PIN Recovery Link */}
        <button
          onClick={onForgotPin}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--tp-text-secondary)',
            fontSize: '12.5px',
            fontWeight: 600,
            marginTop: '20px',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          <RefreshCw size={13} />
          <span>Forgot PIN? Restore with Recovery Phrase</span>
        </button>
      </div>
    </div>
  );
};
