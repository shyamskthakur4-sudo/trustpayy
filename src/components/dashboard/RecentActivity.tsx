import React from 'react';
import { ArrowDownLeft, ArrowUpRight, ChevronRight, Clock } from '../common/Icons';
import { TransactionSummary } from '../../types';

interface RecentActivityProps {
  transactions: TransactionSummary[];
  onSelectTransaction: (tx: TransactionSummary) => void;
  onViewAll: () => void;
}

export const RecentActivity: React.FC<RecentActivityProps> = ({
  transactions,
  onSelectTransaction,
  onViewAll,
}) => {
  const recent = transactions.slice(0, 3);

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'verified':
      case 'completed':
        return 'tp-badge-completed';
      case 'pending_verification':
      case 'submitted':
      case 'verification':
      case 'processing':
        return 'tp-badge-processing';
      case 'payment_sent':
        return 'tp-badge-payment_sent';
      case 'rejected':
      case 'failed':
      case 'cancelled':
        return 'tp-badge-rejected';
      default:
        return 'tp-badge-processing';
    }
  };

  const formatStatus = (status: string) => {
    return status.replace(/_/g, ' ');
  };

  return (
    <div
      style={{
        background: 'var(--tp-bg-surface)',
        border: '1px solid var(--tp-border-subtle)',
        borderRadius: 'var(--tp-radius-lg)',
        padding: '18px',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Clock size={16} color="var(--tp-text-secondary)" />
          <span style={{ fontSize: '14px', fontWeight: 800, color: '#FFF' }}>
            Recent Activity
          </span>
        </div>
        <button
          onClick={onViewAll}
          className="tp-pressable"
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--tp-emerald)',
            fontSize: '12px',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '2px',
          }}
        >
          <span>View All</span>
          <ChevronRight size={14} />
        </button>
      </div>

      {recent.length === 0 ? (
        <div style={{ padding: '24px', textAlign: 'center', color: 'var(--tp-text-muted)', fontSize: '13px' }}>
          No recent activity. Deposit USDT or initiate an exchange.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {recent.map((tx) => {
            const isDeposit = tx.type === 'deposit';
            return (
              <div
                key={tx.id}
                onClick={() => onSelectTransaction(tx)}
                className="tp-pressable"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px',
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid var(--tp-border-subtle)',
                  borderRadius: 'var(--tp-radius-md)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div
                    style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '10px',
                      background: isDeposit ? 'rgba(0, 229, 153, 0.12)' : 'rgba(56, 189, 248, 0.12)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    {isDeposit ? (
                      <ArrowDownLeft size={18} color="#00E599" />
                    ) : (
                      <ArrowUpRight size={18} color="#38BDF8" />
                    )}
                  </div>
                  <div>
                    <div style={{ fontSize: '13.5px', fontWeight: 700, color: '#FFF' }}>
                      {isDeposit ? 'USDT Deposit' : 'INR Payout'}
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--tp-text-muted)' }}>
                      {tx.method_or_network} • {new Date(tx.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div
                    className="tp-num"
                    style={{
                      fontSize: '14px',
                      fontWeight: 700,
                      color: isDeposit ? '#00E599' : '#FFF',
                    }}
                  >
                    {isDeposit ? `+${tx.amount_usdt} USDT` : `₹${tx.amount_inr.toLocaleString('en-IN')}`}
                  </div>
                  <div style={{ marginTop: '2px' }}>
                    <span className={`tp-badge ${getStatusBadgeClass(tx.status)}`} style={{ fontSize: '10px', padding: '2px 6px' }}>
                      {formatStatus(tx.status)}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
