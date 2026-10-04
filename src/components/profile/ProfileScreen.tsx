import React, { useState } from 'react';
import { UserAccount } from '../../types';
import { TrustPayStore } from '../../services/storage';
import { ViewRecoveryPhraseModal } from './ViewRecoveryPhraseModal';
import { ChangePinModal } from './ChangePinModal';
import { LegalModal } from './LegalModal';
import {
  ShieldCheck,
  ShieldAlert,
  KeyRound,
  Lock,
  Fingerprint,
  Smartphone,
  FileText,
  HelpCircle,
  LogOut,
  Copy,
  Check,
  ChevronRight,
  Shield,
  Sliders,
} from '../common/Icons';
import { useToast } from '../common/Toast';

interface ProfileScreenProps {
  user: UserAccount;
  onOpenSupport: () => void;
  onOpenAdmin: () => void;
  onLockWallet: () => void;
  onLogout: () => void;
  onResetWallet?: () => void;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({
  user,
  onOpenSupport,
  onOpenAdmin,
  onLockWallet,
  onLogout,
  onResetWallet,
}) => {
  const [showPhraseModal, setShowPhraseModal] = useState(false);
  const [showPinModal, setShowPinModal] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [legalType, setLegalType] = useState<'terms' | 'privacy' | 'security' | null>(null);
  const [copied, setCopied] = useState(false);
  const { showToast } = useToast();

  const handleCopyAccountId = () => {
    navigator.clipboard.writeText(user.account_id);
    setCopied(true);
    showToast('Account ID copied', 'success');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleToggleBiometric = () => {
    const next = !user.security_settings.biometric_enabled;
    TrustPayStore.updateUser({
      security_settings: {
        ...user.security_settings,
        biometric_enabled: next,
      },
    });
    showToast(next ? 'Biometric authentication enabled' : 'Biometric unlock disabled', 'info');
  };

  const isFullyProtected = user.security_settings.pin_enabled && user.security_settings.phrase_backed_up;

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
        padding: '16px 16px 90px',
      }}
    >
      {/* Account Profile Header Card */}
      <div
        style={{
          background: 'linear-gradient(135deg, rgba(16, 27, 44, 0.95) 0%, rgba(10, 16, 28, 0.98) 100%)',
          border: '1px solid var(--tp-border-light)',
          borderRadius: 'var(--tp-radius-xl)',
          padding: '22px 20px',
          boxShadow: 'var(--tp-shadow-card)',
          position: 'relative',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '46px',
                height: '46px',
                borderRadius: '14px',
                background: 'rgba(0, 229, 153, 0.12)',
                border: '1px solid rgba(0, 229, 153, 0.25)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <ShieldCheck size={24} color="#00E599" />
            </div>
            <div>
              <div style={{ fontSize: '11px', color: 'var(--tp-text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
                Account Identifier
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="tp-num" style={{ fontSize: '18px', fontWeight: 900, color: '#FFF' }}>
                  {user.account_id}
                </span>
                <button
                  onClick={handleCopyAccountId}
                  className="tp-pressable"
                  style={{ background: 'none', border: 'none', color: '#00E599', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                >
                  {copied ? <Check size={14} /> : <Copy size={14} />}
                </button>
              </div>
            </div>
          </div>

          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              background: 'rgba(0, 229, 153, 0.1)',
              border: '1px solid rgba(0, 229, 153, 0.25)',
              borderRadius: 'var(--tp-radius-full)',
              padding: '4px 10px',
              fontSize: '11px',
              fontWeight: 700,
              color: '#00E599',
            }}
          >
            <span>Verified</span>
          </div>
        </div>

        {/* Security Health Status */}
        <div
          style={{
            background: isFullyProtected ? 'rgba(0, 229, 153, 0.08)' : 'rgba(245, 158, 11, 0.08)',
            border: `1px solid ${isFullyProtected ? 'rgba(0, 229, 153, 0.2)' : 'rgba(245, 158, 11, 0.25)'}`,
            borderRadius: 'var(--tp-radius-md)',
            padding: '12px 14px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {isFullyProtected ? (
              <ShieldCheck size={20} color="#00E599" />
            ) : (
              <ShieldAlert size={20} color="#F59E0B" />
            )}
            <div>
              <div style={{ fontSize: '13px', fontWeight: 700, color: isFullyProtected ? '#00E599' : '#FCD34D' }}>
                {isFullyProtected ? 'Security Health: Institutional Grade' : 'Security Advisory: Setup App PIN'}
              </div>
              <div style={{ fontSize: '11px', color: 'var(--tp-text-muted)' }}>
                {isFullyProtected ? 'Recovery phrase backed up • PIN protection active' : 'Protect your wallet with a 6-digit security PIN'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Security Settings Section */}
      <div>
        <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--tp-text-muted)', textTransform: 'uppercase', marginBottom: '8px', paddingLeft: '4px' }}>
          Security & Credentials
        </div>
        <div
          style={{
            background: 'var(--tp-bg-surface)',
            border: '1px solid var(--tp-border-subtle)',
            borderRadius: 'var(--tp-radius-lg)',
            overflow: 'hidden',
          }}
        >
          {/* View Recovery Phrase */}
          <div
            onClick={() => setShowPhraseModal(true)}
            className="tp-pressable"
            style={{
              padding: '14px 16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderBottom: '1px solid var(--tp-border-subtle)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(239, 68, 68, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <KeyRound size={17} color="#EF4444" />
              </div>
              <div>
                <div style={{ fontSize: '13.5px', fontWeight: 700, color: '#FFF' }}>
                  Recovery Phrase Management
                </div>
                <div style={{ fontSize: '11.5px', color: 'var(--tp-text-muted)' }}>
                  Requires PIN re-authentication to unveil
                </div>
              </div>
            </div>
            <ChevronRight size={18} color="var(--tp-text-muted)" />
          </div>

          {/* Change PIN */}
          <div
            onClick={() => setShowPinModal(true)}
            className="tp-pressable"
            style={{
              padding: '14px 16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderBottom: '1px solid var(--tp-border-subtle)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(0, 229, 153, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Lock size={17} color="#00E599" />
              </div>
              <div>
                <div style={{ fontSize: '13.5px', fontWeight: 700, color: '#FFF' }}>
                  {user.security_settings.pin_enabled ? 'Change 6-Digit App PIN' : 'Set 6-Digit App PIN'}
                </div>
                <div style={{ fontSize: '11.5px', color: 'var(--tp-text-muted)' }}>
                  {user.security_settings.pin_enabled ? 'PIN configured' : 'Not configured'}
                </div>
              </div>
            </div>
            <ChevronRight size={18} color="var(--tp-text-muted)" />
          </div>

          {/* Biometric Toggle */}
          <div
            onClick={handleToggleBiometric}
            className="tp-pressable"
            style={{
              padding: '14px 16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderBottom: '1px solid var(--tp-border-subtle)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(56, 189, 248, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Fingerprint size={17} color="#38BDF8" />
              </div>
              <div>
                <div style={{ fontSize: '13.5px', fontWeight: 700, color: '#FFF' }}>
                  Biometric / Touch Unlock
                </div>
                <div style={{ fontSize: '11.5px', color: 'var(--tp-text-muted)' }}>
                  Unlock via fingerprint or face recognition
                </div>
              </div>
            </div>
            <div
              style={{
                width: '40px',
                height: '24px',
                borderRadius: '12px',
                background: user.security_settings.biometric_enabled ? '#00E599' : 'rgba(255, 255, 255, 0.15)',
                display: 'flex',
                alignItems: 'center',
                padding: '2px',
                transition: 'background 0.2s ease',
              }}
            >
              <div
                style={{
                  width: '20px',
                  height: '20px',
                  borderRadius: '50%',
                  background: '#FFF',
                  transform: user.security_settings.biometric_enabled ? 'translateX(16px)' : 'translateX(0)',
                  transition: 'transform 0.2s cubic-bezier(0.2, 0, 0, 1)',
                }}
              />
            </div>
          </div>

          {/* Active Device Session */}
          <div
            style={{
              padding: '14px 16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(168, 85, 247, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Smartphone size={17} color="#A855F7" />
              </div>
              <div>
                <div style={{ fontSize: '13.5px', fontWeight: 700, color: '#FFF' }}>
                  Active Device Session
                </div>
                <div style={{ fontSize: '11.5px', color: 'var(--tp-text-muted)' }}>
                  Android Mobile Client • Verified Local Key
                </div>
              </div>
            </div>
            <span style={{ fontSize: '11px', color: '#00E599', fontWeight: 700 }}>Current</span>
          </div>
        </div>
      </div>

      {/* Support & Admin Shortcuts */}
      <div>
        <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--tp-text-muted)', textTransform: 'uppercase', marginBottom: '8px', paddingLeft: '4px' }}>
          Operations & Help
        </div>
        <div
          style={{
            background: 'var(--tp-bg-surface)',
            border: '1px solid var(--tp-border-subtle)',
            borderRadius: 'var(--tp-radius-lg)',
            overflow: 'hidden',
          }}
        >
          <div
            onClick={onOpenSupport}
            className="tp-pressable"
            style={{
              padding: '14px 16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderBottom: '1px solid var(--tp-border-subtle)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(245, 158, 11, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <HelpCircle size={17} color="#F59E0B" />
              </div>
              <div style={{ fontSize: '13.5px', fontWeight: 700, color: '#FFF' }}>
                Support Center & FAQ
              </div>
            </div>
            <ChevronRight size={18} color="var(--tp-text-muted)" />
          </div>

          <div
            onClick={onOpenAdmin}
            className="tp-pressable"
            style={{
              padding: '14px 16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(0, 229, 153, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Sliders size={17} color="#00E599" />
              </div>
              <div style={{ fontSize: '13.5px', fontWeight: 700, color: '#FFF' }}>
                Admin Configuration Console
              </div>
            </div>
            <span style={{ fontSize: '11px', color: '#00E599', fontWeight: 700 }}>Exchange & Wallets</span>
          </div>
        </div>
      </div>

      {/* Legal & Policies */}
      <div>
        <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--tp-text-muted)', textTransform: 'uppercase', marginBottom: '8px', paddingLeft: '4px' }}>
          Compliance & Legal
        </div>
        <div
          style={{
            background: 'var(--tp-bg-surface)',
            border: '1px solid var(--tp-border-subtle)',
            borderRadius: 'var(--tp-radius-lg)',
            overflow: 'hidden',
          }}
        >
          <div
            onClick={() => setLegalType('terms')}
            className="tp-pressable"
            style={{
              padding: '14px 16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderBottom: '1px solid var(--tp-border-subtle)',
            }}
          >
            <span style={{ fontSize: '13.5px', fontWeight: 600, color: '#FFF' }}>
              Terms & Conditions
            </span>
            <ChevronRight size={16} color="var(--tp-text-muted)" />
          </div>

          <div
            onClick={() => setLegalType('privacy')}
            className="tp-pressable"
            style={{
              padding: '14px 16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderBottom: '1px solid var(--tp-border-subtle)',
            }}
          >
            <span style={{ fontSize: '13.5px', fontWeight: 600, color: '#FFF' }}>
              Privacy Policy
            </span>
            <ChevronRight size={16} color="var(--tp-text-muted)" />
          </div>

          <div
            onClick={() => setLegalType('security')}
            className="tp-pressable"
            style={{
              padding: '14px 16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <span style={{ fontSize: '13.5px', fontWeight: 600, color: '#FFF' }}>
              Security Architecture
            </span>
            <ChevronRight size={16} color="var(--tp-text-muted)" />
          </div>
        </div>
      </div>

      {/* Session Actions (Lock & Logout) */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <button
          type="button"
          onClick={onLockWallet}
          className="tp-btn-secondary"
          style={{ width: '100%', justifyContent: 'center' }}
        >
          <Lock size={16} />
          <span>Lock Wallet Session</span>
        </button>

        <button
          type="button"
          onClick={() => setShowLogoutModal(true)}
          className="tp-pressable"
          style={{
            width: '100%',
            padding: '13px',
            background: 'rgba(239, 68, 68, 0.08)',
            border: '1px solid rgba(239, 68, 68, 0.25)',
            borderRadius: 'var(--tp-radius-md)',
            color: '#EF4444',
            fontSize: '13.5px',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            cursor: 'pointer',
            transition: 'var(--tp-transition)',
          }}
        >
          <LogOut size={16} />
          <span>Log Out Wallet</span>
        </button>
      </div>

      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <div className="tp-modal-overlay" onClick={() => setShowLogoutModal(false)}>
          <div
            className="tp-modal-content"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: '380px', textAlign: 'center', padding: '24px 20px' }}
          >
            <div
              style={{
                width: '56px',
                height: '56px',
                borderRadius: '50%',
                background: 'rgba(239, 68, 68, 0.12)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px',
                color: '#EF4444',
              }}
            >
              <LogOut size={26} />
            </div>

            <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#FFF', marginBottom: '8px' }}>
              Log Out of Wallet?
            </h3>

            {user.security_settings.phrase_backed_up ? (
              <p style={{ fontSize: '13px', color: 'var(--tp-text-secondary)', lineHeight: 1.5, marginBottom: '20px' }}>
                Your current session will end on this device. You will need your <strong>12-word recovery phrase</strong> to restore your wallet and access your account.
              </p>
            ) : (
              <div
                style={{
                  background: 'rgba(239, 68, 68, 0.1)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  borderRadius: 'var(--tp-radius-md)',
                  padding: '12px',
                  marginBottom: '20px',
                  textAlign: 'left',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#EF4444', fontWeight: 700, fontSize: '12px', marginBottom: '4px' }}>
                  <ShieldAlert size={15} />
                  <span>CRITICAL SECURITY WARNING</span>
                </div>
                <div style={{ fontSize: '12px', color: '#FCA5A5', lineHeight: 1.45 }}>
                  Your recovery phrase has <strong>NOT been backed up</strong>! If you log out without writing it down, you will permanently lose access to your wallet.
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setShowLogoutModal(false);
                    setShowPhraseModal(true);
                  }}
                  className="tp-pressable"
                  style={{
                    marginTop: '10px',
                    width: '100%',
                    padding: '8px',
                    background: 'rgba(255, 255, 255, 0.1)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: 'var(--tp-radius-sm)',
                    color: '#FFF',
                    fontSize: '12px',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  Backup Recovery Phrase Now
                </button>
              </div>
            )}

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                type="button"
                onClick={() => setShowLogoutModal(false)}
                className="tp-btn-secondary"
                style={{ flex: 1, justifyContent: 'center' }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowLogoutModal(false);
                  onLogout();
                }}
                className="tp-pressable"
                style={{
                  flex: 1,
                  padding: '12px',
                  background: '#EF4444',
                  border: 'none',
                  borderRadius: 'var(--tp-radius-md)',
                  color: '#FFF',
                  fontSize: '13.5px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  boxShadow: '0 4px 15px rgba(239, 68, 68, 0.4)',
                }}
              >
                Log Out
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      {showPhraseModal && <ViewRecoveryPhraseModal onClose={() => setShowPhraseModal(false)} />}
      {showPinModal && <ChangePinModal onClose={() => setShowPinModal(false)} />}
      {legalType && <LegalModal type={legalType} onClose={() => setLegalType(null)} />}
    </div>
  );
};
