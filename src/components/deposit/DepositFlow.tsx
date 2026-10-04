import React, { useState } from 'react';
import { NetworkId, WalletNetwork, ExchangeSettings } from '../../types';
import { DepositAddressCard } from './DepositAddressCard';
import { DepositSubmitForm } from './DepositSubmitForm';
import { ArrowLeft, Clock, ShieldCheck, CheckCircle2, ChevronRight, ExternalLink } from '../common/Icons';

interface DepositFlowProps {
  networks: WalletNetwork[];
  exchangeSettings: ExchangeSettings;
  userId: string;
  onBack: () => void;
  onViewOrderDetails: (orderId: string) => void;
}

export const DepositFlow: React.FC<DepositFlowProps> = ({
  networks,
  exchangeSettings,
  userId,
  onBack,
  onViewOrderDetails,
}) => {
  const [selectedNetworkId, setSelectedNetworkId] = useState<NetworkId>('tron');
  const [createdOrderId, setCreatedOrderId] = useState<string | null>(null);

  const selectedNetwork = networks.find((n) => n.id === selectedNetworkId) || networks[0];

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
        padding: '16px 16px 90px',
      }}
    >
      {/* Top Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
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
        <h1 style={{ fontSize: '17px', fontWeight: 800, color: '#FFF' }}>
          Deposit USDT
        </h1>
        <div style={{ width: '36px' }} />
      </div>

      {/* Network Selection Horizontal Pills */}
      <div>
        <div style={{ fontSize: '12.5px', fontWeight: 700, color: 'var(--tp-text-secondary)', marginBottom: '8px' }}>
          Select Deposit Network (5 Available)
        </div>
        <div
          style={{
            display: 'flex',
            gap: '8px',
            overflowX: 'auto',
            paddingBottom: '6px',
          }}
        >
          {networks.map((net) => {
            const isSelected = net.id === selectedNetworkId;
            return (
              <button
                key={net.id}
                type="button"
                onClick={() => setSelectedNetworkId(net.id)}
                className="tp-pressable"
                style={{
                  background: isSelected ? 'rgba(0, 229, 153, 0.15)' : 'var(--tp-bg-surface)',
                  border: isSelected ? '1px solid #00E599' : '1px solid var(--tp-border-subtle)',
                  borderRadius: 'var(--tp-radius-md)',
                  padding: '8px 14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  color: isSelected ? '#00E599' : 'var(--tp-text-secondary)',
                  fontWeight: 700,
                  fontSize: '12.5px',
                  whiteSpace: 'nowrap',
                  cursor: 'pointer',
                  flexShrink: 0,
                }}
              >
                <span
                  style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    background: isSelected ? '#00E599' : 'var(--tp-text-muted)',
                  }}
                />
                <span>{net.network_name}</span>
                <span
                  style={{
                    fontSize: '10px',
                    background: 'rgba(255, 255, 255, 0.08)',
                    borderRadius: '4px',
                    padding: '1px 5px',
                    color: '#FFF',
                  }}
                >
                  {net.network_standard}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Wallet Address & QR Code Card */}
      <DepositAddressCard
        network={selectedNetwork}
        minimumDeposit={exchangeSettings.minimum_deposit}
      />

      {/* Deposit Submission Form */}
      <DepositSubmitForm
        network={selectedNetwork}
        userId={userId}
        minimumDeposit={exchangeSettings.minimum_deposit}
        onDepositCreated={(orderId) => setCreatedOrderId(orderId)}
      />

      {/* Success Modal after Submission */}
      {createdOrderId && (
        <div className="tp-modal-backdrop">
          <div className="tp-modal-content">
            <div style={{ textAlign: 'center', marginBottom: '18px' }}>
              <div
                style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '50%',
                  background: 'rgba(0, 229, 153, 0.15)',
                  border: '2px solid #00E599',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 12px',
                  boxShadow: '0 0 20px rgba(0, 229, 153, 0.4)',
                }}
              >
                <CheckCircle2 size={32} color="#00E599" />
              </div>

              <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#FFF', marginBottom: '4px' }}>
                Deposit Submitted
              </h3>
              <p style={{ fontSize: '13px', color: 'var(--tp-text-secondary)', lineHeight: 1.45 }}>
                Your deposit order <strong>{createdOrderId}</strong> has been logged and is pending network verification.
              </p>
            </div>

            {/* Stepper Status Preview */}
            <div
              style={{
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid var(--tp-border-subtle)',
                borderRadius: 'var(--tp-radius-md)',
                padding: '14px',
                marginBottom: '20px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <Clock size={16} color="#F59E0B" />
                <span style={{ fontSize: '13px', fontWeight: 700, color: '#F59E0B' }}>
                  Status: Pending Verification
                </span>
              </div>
              <p style={{ fontSize: '11.5px', color: 'var(--tp-text-secondary)', lineHeight: 1.45 }}>
                TrustPay verification engine verifies blockchain confirmations before updating your balance. You can track status live in Order History.
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <button
                onClick={() => {
                  const id = createdOrderId;
                  setCreatedOrderId(null);
                  onViewOrderDetails(id);
                }}
                className="tp-btn-primary"
              >
                <span>Track Order in History</span>
                <ChevronRight size={18} />
              </button>

              <button
                onClick={() => setCreatedOrderId(null)}
                className="tp-btn-secondary"
              >
                <span>Deposit More</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
