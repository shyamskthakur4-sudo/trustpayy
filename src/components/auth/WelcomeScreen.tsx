import React from 'react';
import { TrustPayLogo } from '../brand/TrustPayLogo';
import { ShieldCheck, Zap, Lock, ArrowRight, HelpCircle, FileText } from '../common/Icons';

interface WelcomeScreenProps {
  onCreateWallet: () => void;
  onRestoreWallet: () => void;
  onOpenLegal: (type: 'terms' | 'privacy' | 'security') => void;
  onOpenHelp: () => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({
  onCreateWallet,
  onRestoreWallet,
  onOpenLegal,
  onOpenHelp,
}) => {
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
      {/* Top Brand Hero */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '20px' }}>
        <div style={{ marginBottom: '18px' }}>
          <TrustPayLogo size="xl" layout="vertical" showWordmark={true} />
        </div>
        <p style={{ color: 'var(--tp-text-secondary)', fontSize: '14px', maxWidth: '320px', lineHeight: 1.55 }}>
          The institutional standard for USDT to INR exchange with direct bank & UPI settlement.
        </p>

        {/* Feature Highlights Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr',
            gap: '12px',
            width: '100%',
            maxWidth: '360px',
            marginTop: '32px',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '14px',
              background: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid var(--tp-border-subtle)',
              borderRadius: 'var(--tp-radius-md)',
              padding: '12px 16px',
              textAlign: 'left',
            }}
          >
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '10px',
                background: 'rgba(0, 229, 153, 0.12)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <Zap size={20} color="#00E599" />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '13.5px', color: '#FFF' }}>
                Instant INR Settlement
              </div>
              <div style={{ fontSize: '12px', color: 'var(--tp-text-secondary)' }}>
                Target ~15 min payout via UPI & IMPS rails
              </div>
            </div>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '14px',
              background: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid var(--tp-border-subtle)',
              borderRadius: 'var(--tp-radius-md)',
              padding: '12px 16px',
              textAlign: 'left',
            }}
          >
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '10px',
                background: 'rgba(56, 189, 248, 0.12)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <ShieldCheck size={20} color="#38BDF8" />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '13.5px', color: '#FFF' }}>
                Non-Custodial Architecture
              </div>
              <div style={{ fontSize: '12px', color: 'var(--tp-text-secondary)' }}>
                12-word cryptographic recovery phrase security
              </div>
            </div>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '14px',
              background: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid var(--tp-border-subtle)',
              borderRadius: 'var(--tp-radius-md)',
              padding: '12px 16px',
              textAlign: 'left',
            }}
          >
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '10px',
                background: 'rgba(168, 85, 247, 0.12)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <Lock size={20} color="#A855F7" />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '13.5px', color: '#FFF' }}>
                Multi-Network Deposit
              </div>
              <div style={{ fontSize: '12px', color: 'var(--tp-text-secondary)' }}>
                BSC, TRON, Arbitrum, Bitcoin & Solana
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons & Legal */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', width: '100%', maxWidth: '360px', margin: '32px auto 0' }}>
        <button onClick={onCreateWallet} className="tp-btn-primary">
          <span>Create New Wallet</span>
          <ArrowRight size={18} />
        </button>

        <button onClick={onRestoreWallet} className="tp-btn-secondary">
          <span>I Already Have a Wallet</span>
        </button>

        {/* Legal & Help Footer Links */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '14px',
            fontSize: '12px',
            color: 'var(--tp-text-muted)',
            marginTop: '8px',
            flexWrap: 'wrap',
          }}
        >
          <button
            onClick={() => onOpenLegal('security')}
            style={{ background: 'none', border: 'none', color: 'var(--tp-text-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
          >
            <ShieldCheck size={12} /> Security
          </button>
          <span>•</span>
          <button
            onClick={() => onOpenLegal('terms')}
            style={{ background: 'none', border: 'none', color: 'var(--tp-text-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
          >
            <FileText size={12} /> Terms
          </button>
          <span>•</span>
          <button
            onClick={() => onOpenLegal('privacy')}
            style={{ background: 'none', border: 'none', color: 'var(--tp-text-secondary)', cursor: 'pointer' }}
          >
            Privacy
          </button>
          <span>•</span>
          <button
            onClick={onOpenHelp}
            style={{ background: 'none', border: 'none', color: 'var(--tp-text-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
          >
            <HelpCircle size={12} /> Help
          </button>
        </div>
      </div>
    </div>
  );
};
