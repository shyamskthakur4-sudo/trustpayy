import React, { useState } from 'react';
import { X, Lock, CheckCircle2, AlertCircle } from '../common/Icons';
import { TrustPayStore } from '../../services/storage';
import { useToast } from '../common/Toast';

interface ChangePinModalProps {
  onClose: () => void;
}

export const ChangePinModal: React.FC<ChangePinModalProps> = ({ onClose }) => {
  const [oldPin, setOldPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const { showToast } = useToast();

  const user = TrustPayStore.getUser();
  const hasExistingPin = user?.security_settings.pin_enabled;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (hasExistingPin && !TrustPayStore.verifyPin(oldPin)) {
      setErrorMsg('Current PIN is incorrect.');
      return;
    }

    if (newPin.length !== 6 || !/^\d{6}$/.test(newPin)) {
      setErrorMsg('New PIN must be exactly 6 digits.');
      return;
    }

    if (newPin !== confirmPin) {
      setErrorMsg('New PIN and confirmation do not match.');
      return;
    }

    TrustPayStore.setPin(newPin);
    showToast('App PIN changed successfully!', 'success');
    onClose();
  };

  return (
    <div className="tp-modal-backdrop" onClick={onClose}>
      <div className="tp-modal-content" onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#FFF' }}>
            {hasExistingPin ? 'Change Security PIN' : 'Set Security PIN'}
          </h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--tp-text-secondary)', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {hasExistingPin && (
            <div className="tp-input-group">
              <label className="tp-input-label">Current 6-Digit PIN</label>
              <input
                type="password"
                inputMode="numeric"
                maxLength={6}
                value={oldPin}
                onChange={(e) => setOldPin(e.target.value)}
                placeholder="••••••"
                className="tp-input-box tp-num"
                style={{ textAlign: 'center', letterSpacing: '0.25em', fontSize: '18px' }}
                autoFocus
              />
            </div>
          )}

          <div className="tp-input-group">
            <label className="tp-input-label">New 6-Digit PIN</label>
            <input
              type="password"
              inputMode="numeric"
              maxLength={6}
              value={newPin}
              onChange={(e) => setNewPin(e.target.value)}
              placeholder="••••••"
              className="tp-input-box tp-num"
              style={{ textAlign: 'center', letterSpacing: '0.25em', fontSize: '18px' }}
            />
          </div>

          <div className="tp-input-group">
            <label className="tp-input-label">Confirm New 6-Digit PIN</label>
            <input
              type="password"
              inputMode="numeric"
              maxLength={6}
              value={confirmPin}
              onChange={(e) => setConfirmPin(e.target.value)}
              placeholder="••••••"
              className="tp-input-box tp-num"
              style={{ textAlign: 'center', letterSpacing: '0.25em', fontSize: '18px' }}
            />
          </div>

          {errorMsg && (
            <div className="tp-error-text" style={{ marginBottom: '14px' }}>
              <AlertCircle size={14} />
              <span>{errorMsg}</span>
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '10px' }}>
            <button type="submit" className="tp-btn-primary">
              <span>Save PIN</span>
            </button>
            <button type="button" onClick={onClose} className="tp-btn-secondary">
              <span>Cancel</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
