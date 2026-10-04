import React, { useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import { Copy, AlertTriangle, Check, ShieldCheck, ExternalLink } from '../common/Icons';
import { WalletNetwork } from '../../types';
import { useToast } from '../common/Toast';

interface DepositAddressCardProps {
  network: WalletNetwork;
  minimumDeposit: number;
}

export const DepositAddressCard: React.FC<DepositAddressCardProps> = ({
  network,
  minimumDeposit,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [copied, setCopied] = React.useState(false);
  const { showToast } = useToast();

  const isPendingConfig = network.wallet_address.includes('PendingAdminConfig');

  // Render QR Code dynamically onto canvas
  useEffect(() => {
    if (canvasRef.current) {
      const qrData = network.qr_code || network.wallet_address;
      QRCode.toCanvas(
        canvasRef.current,
        qrData,
        {
          width: 180,
          margin: 1.5,
          color: {
            dark: '#06090F',
            light: '#FFFFFF',
          },
        },
        (error: any) => {
          if (error) console.error('QR generation error:', error);
        }
      );
    }
  }, [network.wallet_address, network.qr_code]);

  const handleCopy = () => {
    navigator.clipboard.writeText(network.wallet_address);
    setCopied(true);
    showToast(`${network.network_name} address copied to clipboard`, 'success');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      style={{
        background: 'var(--tp-bg-surface)',
        border: '1px solid var(--tp-border-light)',
        borderRadius: 'var(--tp-radius-xl)',
        padding: '20px',
        boxShadow: 'var(--tp-shadow-card)',
      }}
    >
      {/* Network Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '16px',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '16px', fontWeight: 800, color: '#FFF' }}>
              {network.network_name}
            </span>
            <span
              style={{
                fontSize: '11px',
                fontWeight: 700,
                color: '#00E599',
                background: 'rgba(0, 229, 153, 0.12)',
                border: '1px solid rgba(0, 229, 153, 0.25)',
                borderRadius: '6px',
                padding: '2px 6px',
              }}
            >
              {network.network_standard}
            </span>
          </div>
          <div style={{ fontSize: '11.5px', color: 'var(--tp-text-muted)', marginTop: '2px' }}>
            Asset: USDT ({network.asset}) • {network.confirmations_required} Block Confirmations
          </div>
        </div>

        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            background: 'rgba(0, 229, 153, 0.1)',
            borderRadius: 'var(--tp-radius-full)',
            padding: '3px 8px',
            fontSize: '11px',
            fontWeight: 700,
            color: '#00E599',
          }}
        >
          <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#00E599' }} />
          <span>Active</span>
        </div>
      </div>

      {/* QR Code Canvas Container */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'rgba(255, 255, 255, 0.03)',
          border: '1px solid var(--tp-border-subtle)',
          borderRadius: 'var(--tp-radius-lg)',
          padding: '16px',
          marginBottom: '18px',
        }}
      >
        <div
          style={{
            background: '#FFFFFF',
            borderRadius: '14px',
            padding: '10px',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.5)',
          }}
        >
          <canvas ref={canvasRef} style={{ display: 'block', borderRadius: '8px' }} />
        </div>
        <span style={{ fontSize: '11px', color: 'var(--tp-text-secondary)', marginTop: '10px' }}>
          Scan QR code with your external wallet app
        </span>
      </div>

      {/* Wallet Address & Copy Button */}
      <div style={{ marginBottom: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
          <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--tp-text-secondary)' }}>
            Deposit Wallet Address ({network.network_standard})
          </span>
          {isPendingConfig && (
            <span style={{ fontSize: '10.5px', color: '#F59E0B', fontWeight: 700 }}>
              (Admin Config Area)
            </span>
          )}
        </div>

        <div
          style={{
            background: 'rgba(10, 15, 26, 0.9)',
            border: '1px solid var(--tp-border-light)',
            borderRadius: 'var(--tp-radius-md)',
            padding: '12px 14px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '10px',
          }}
        >
          <span
            className="tp-num"
            style={{
              fontSize: '12.5px',
              color: isPendingConfig ? '#FCD34D' : '#FFF',
              fontWeight: 600,
              wordBreak: 'break-all',
              lineHeight: 1.4,
            }}
          >
            {network.wallet_address}
          </span>

          <button
            onClick={handleCopy}
            className="tp-pressable"
            style={{
              background: copied ? 'rgba(0, 229, 153, 0.2)' : 'rgba(255, 255, 255, 0.08)',
              border: `1px solid ${copied ? '#00E599' : 'var(--tp-border-light)'}`,
              borderRadius: 'var(--tp-radius-sm)',
              padding: '8px 12px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              color: copied ? '#00E599' : '#FFF',
              fontSize: '12px',
              fontWeight: 700,
              cursor: 'pointer',
              flexShrink: 0,
            }}
          >
            {copied ? <Check size={14} /> : <Copy size={14} />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>
        </div>
      </div>

      {/* Minimum Deposit Callout */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'rgba(245, 158, 11, 0.08)',
          border: '1px solid rgba(245, 158, 11, 0.25)',
          borderRadius: 'var(--tp-radius-md)',
          padding: '10px 14px',
          marginBottom: '14px',
          fontSize: '12.5px',
        }}
      >
        <span style={{ color: '#FCD34D', fontWeight: 600 }}>Minimum Deposit:</span>
        <span className="tp-num" style={{ color: '#FFF', fontWeight: 800 }}>
          {minimumDeposit} USDT
        </span>
      </div>

      {/* Prominent Mandatory Warning */}
      <div
        style={{
          background: 'rgba(239, 68, 68, 0.08)',
          border: '1px solid rgba(239, 68, 68, 0.25)',
          borderRadius: 'var(--tp-radius-md)',
          padding: '12px 14px',
          display: 'flex',
          alignItems: 'flex-start',
          gap: '10px',
        }}
      >
        <AlertTriangle size={18} color="#EF4444" style={{ flexShrink: 0, marginTop: '2px' }} />
        <div style={{ fontSize: '11.5px', color: '#FCA5A5', lineHeight: 1.45 }}>
          <strong>Critical Warning:</strong> Only send USDT using the selected{' '}
          <strong>{network.network_name} ({network.network_standard})</strong> network.
          Sending assets through the wrong network may result in irreversible loss of funds.
        </div>
      </div>
    </div>
  );
};
