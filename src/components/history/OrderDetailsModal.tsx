import React from 'react';
import { TransactionSummary, WalletNetwork } from '../../types';
import { X, ExternalLink, Copy, Check, CheckCircle2, Clock, AlertCircle, HelpCircle } from '../common/Icons';
import { useToast } from '../common/Toast';

interface OrderDetailsModalProps {
  transaction: TransactionSummary;
  networks: WalletNetwork[];
  onClose: () => void;
  onContactSupport: (orderId: string) => void;
}

export const OrderDetailsModal: React.FC<OrderDetailsModalProps> = ({
  transaction,
  networks,
  onClose,
  onContactSupport,
}) => {
  const [copied, setCopied] = React.useState(false);
  const { showToast } = useToast();

  const isDeposit = transaction.type === 'deposit';
  const dateObj = new Date(transaction.created_at);

  const matchedNetwork = networks.find(
    (n) => n.id === transaction.raw_deposit?.network_id || n.network_name === transaction.method_or_network
  );

  const txHash = transaction.raw_deposit?.transaction_hash || '';

  const handleCopyReference = (ref: string) => {
    navigator.clipboard.writeText(ref);
    setCopied(true);
    showToast('Copied to clipboard', 'success');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleViewExplorer = () => {
    if (!matchedNetwork || !matchedNetwork.explorer_base_url || matchedNetwork.explorer_base_url.includes('example')) {
      showToast('Blockchain explorer URL not yet configured by admin.', 'info');
      return;
    }
    const fullUrl = `${matchedNetwork.explorer_base_url}${txHash}`;
    window.open(fullUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="tp-modal-backdrop" onClick={onClose}>
      <div className="tp-modal-content" onClick={(e) => e.stopPropagation()}>
        {/* Modal Top Bar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
          <div>
            <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--tp-emerald)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Order Receipt
            </span>
            <div className="tp-num" style={{ fontSize: '18px', fontWeight: 900, color: '#FFF' }}>
              #{transaction.id}
            </div>
          </div>
          <button
            onClick={onClose}
            className="tp-pressable"
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              border: 'none',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--tp-text-secondary)',
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Amount Hero */}
        <div
          style={{
            background: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid var(--tp-border-subtle)',
            borderRadius: 'var(--tp-radius-lg)',
            padding: '18px',
            textAlign: 'center',
            marginBottom: '20px',
          }}
        >
          <div style={{ fontSize: '12px', color: 'var(--tp-text-muted)', marginBottom: '4px' }}>
            {isDeposit ? 'Deposit Amount' : 'Dispatched Payout Amount'}
          </div>
          <div className="tp-num" style={{ fontSize: '28px', fontWeight: 900, color: isDeposit ? '#00E599' : '#FFF' }}>
            {isDeposit ? `+${transaction.amount_usdt} USDT` : `₹${transaction.amount_inr.toLocaleString('en-IN')}`}
          </div>
          <div style={{ fontSize: '13px', color: 'var(--tp-text-secondary)', marginTop: '4px' }}>
            ≈ {isDeposit ? `₹${transaction.amount_inr.toLocaleString('en-IN')}` : `${transaction.amount_usdt} USDT`}
          </div>
        </div>

        {/* Detailed Key-Value Grid */}
        <div
          style={{
            background: 'var(--tp-bg-surface)',
            border: '1px solid var(--tp-border-subtle)',
            borderRadius: 'var(--tp-radius-md)',
            padding: '16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            marginBottom: '20px',
            fontSize: '12.5px',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--tp-text-secondary)' }}>Status</span>
            <span style={{ fontWeight: 700, color: '#00E599', textTransform: 'capitalize' }}>
              {transaction.status.replace(/_/g, ' ')}
            </span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--tp-text-secondary)' }}>Date & Time</span>
            <span style={{ color: '#FFF', fontWeight: 600 }}>
              {dateObj.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })} at{' '}
              {dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--tp-text-secondary)' }}>Transaction Type</span>
            <span style={{ color: '#FFF', fontWeight: 600, textTransform: 'uppercase' }}>
              {transaction.type}
            </span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--tp-text-secondary)' }}>Network / Rail</span>
            <span style={{ color: '#FFF', fontWeight: 600 }}>{transaction.method_or_network}</span>
          </div>

          {/* Blockchain TxID if deposit */}
          {isDeposit && txHash && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', paddingTop: '4px', borderTop: '1px solid var(--tp-border-subtle)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--tp-text-secondary)' }}>
                <span>Transaction Hash (TxID)</span>
                <button
                  onClick={() => handleCopyReference(txHash)}
                  style={{ background: 'none', border: 'none', color: '#00E599', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', fontWeight: 700 }}
                >
                  {copied ? <Check size={12} /> : <Copy size={12} />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
              <span className="tp-num" style={{ fontSize: '11.5px', color: '#BAE6FD', wordBreak: 'break-all' }}>
                {txHash}
              </span>
            </div>
          )}

          {/* Withdrawal UTR if applicable */}
          {!isDeposit && transaction.raw_withdrawal?.utr_number && (
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '4px', borderTop: '1px solid var(--tp-border-subtle)' }}>
              <span style={{ color: 'var(--tp-text-secondary)' }}>Bank Reference (UTR)</span>
              <span className="tp-num" style={{ color: '#00E599', fontWeight: 800 }}>
                {transaction.raw_withdrawal.utr_number}
              </span>
            </div>
          )}
        </div>

        {/* View on Blockchain Explorer CTA (Section 10 requirement) */}
        {isDeposit && txHash && (
          <button
            type="button"
            onClick={handleViewExplorer}
            className="tp-btn-secondary"
            style={{ marginBottom: '10px' }}
          >
            <ExternalLink size={16} color="#38BDF8" />
            <span>View Transaction on Blockchain Explorer</span>
          </button>
        )}

        {/* Need Help with this order CTA (Section 13 requirement) */}
        <button
          type="button"
          onClick={() => {
            onClose();
            onContactSupport(transaction.id);
          }}
          className="tp-btn-secondary"
          style={{ marginBottom: '10px' }}
        >
          <HelpCircle size={16} color="#F59E0B" />
          <span>Need Help with Order #{transaction.id}?</span>
        </button>

        <button
          type="button"
          onClick={onClose}
          className="tp-btn-primary"
        >
          <span>Close Receipt</span>
        </button>
      </div>
    </div>
  );
};
