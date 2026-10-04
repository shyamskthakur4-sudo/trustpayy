import React, { useState } from 'react';
import { ArrowLeft, ArrowDownLeft, ArrowUpRight, Search, Filter, ChevronRight, Calendar } from '../common/Icons';
import { TransactionSummary } from '../../types';

interface TransactionHistoryScreenProps {
  transactions: TransactionSummary[];
  onSelectTransaction: (tx: TransactionSummary) => void;
  onBack: () => void;
}

type FilterTab = 'all' | 'deposits' | 'withdrawals' | 'completed' | 'pending' | 'failed';

export const TransactionHistoryScreen: React.FC<TransactionHistoryScreenProps> = ({
  transactions,
  onSelectTransaction,
  onBack,
}) => {
  const [activeFilter, setActiveFilter] = useState<FilterTab>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filterTabs: { id: FilterTab; label: string }[] = [
    { id: 'all', label: 'All' },
    { id: 'deposits', label: 'Deposits' },
    { id: 'withdrawals', label: 'Withdrawals' },
    { id: 'completed', label: 'Completed' },
    { id: 'pending', label: 'Pending' },
    { id: 'failed', label: 'Failed' },
  ];

  const filteredTransactions = transactions.filter((tx) => {
    // Search query match
    const q = searchQuery.toLowerCase().trim();
    if (q) {
      const matchId = tx.id.toLowerCase().includes(q);
      const matchRef = tx.reference_id?.toLowerCase().includes(q);
      const matchNetwork = tx.method_or_network.toLowerCase().includes(q);
      if (!matchId && !matchRef && !matchNetwork) return false;
    }

    // Filter match
    if (activeFilter === 'deposits') return tx.type === 'deposit';
    if (activeFilter === 'withdrawals') return tx.type === 'withdrawal';
    if (activeFilter === 'completed') return ['completed', 'verified'].includes(tx.status);
    if (activeFilter === 'pending') {
      return ['pending_verification', 'submitted', 'verification', 'processing', 'payment_sent'].includes(tx.status);
    }
    if (activeFilter === 'failed') return ['failed', 'rejected', 'cancelled'].includes(tx.status);

    return true;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'verified':
      case 'completed':
        return <span className="tp-badge tp-badge-completed">Completed</span>;
      case 'pending_verification':
      case 'submitted':
      case 'verification':
      case 'processing':
        return <span className="tp-badge tp-badge-processing">{status.replace(/_/g, ' ')}</span>;
      case 'payment_sent':
        return <span className="tp-badge tp-badge-payment_sent">Payment Sent</span>;
      case 'rejected':
      case 'failed':
      case 'cancelled':
        return <span className="tp-badge tp-badge-rejected">{status}</span>;
      default:
        return <span className="tp-badge tp-badge-processing">{status}</span>;
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        padding: '16px 16px 90px',
      }}
    >
      {/* Header */}
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
          Transaction History
        </h1>
        <div style={{ width: '36px' }} />
      </div>

      {/* Search Input Bar */}
      <div
        style={{
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          background: 'var(--tp-bg-surface)',
          border: '1px solid var(--tp-border-subtle)',
          borderRadius: 'var(--tp-radius-md)',
          padding: '0 14px',
        }}
      >
        <Search size={16} color="var(--tp-text-muted)" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by Order ID or TxID..."
          style={{
            flex: 1,
            background: 'transparent',
            border: 'none',
            color: '#FFF',
            padding: '12px 10px',
            fontSize: '13px',
            outline: 'none',
          }}
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            style={{ background: 'none', border: 'none', color: 'var(--tp-text-muted)', cursor: 'pointer', fontSize: '12px' }}
          >
            Clear
          </button>
        )}
      </div>

      {/* Filter Chips Horizontal Scroller */}
      <div
        style={{
          display: 'flex',
          gap: '8px',
          overflowX: 'auto',
          paddingBottom: '4px',
        }}
      >
        {filterTabs.map((tab) => {
          const isActive = activeFilter === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveFilter(tab.id)}
              className="tp-pressable"
              style={{
                background: isActive ? 'rgba(0, 229, 153, 0.15)' : 'rgba(255, 255, 255, 0.04)',
                border: isActive ? '1px solid #00E599' : '1px solid var(--tp-border-subtle)',
                borderRadius: 'var(--tp-radius-full)',
                padding: '6px 14px',
                color: isActive ? '#00E599' : 'var(--tp-text-secondary)',
                fontSize: '12px',
                fontWeight: 700,
                whiteSpace: 'nowrap',
                cursor: 'pointer',
              }}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Transactions List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {filteredTransactions.length === 0 ? (
          <div
            style={{
              padding: '48px 24px',
              textAlign: 'center',
              background: 'var(--tp-bg-surface)',
              borderRadius: 'var(--tp-radius-lg)',
              border: '1px solid var(--tp-border-subtle)',
            }}
          >
            <Calendar size={32} color="var(--tp-text-muted)" style={{ margin: '0 auto 12px' }} />
            <div style={{ fontSize: '15px', fontWeight: 700, color: '#FFF', marginBottom: '4px' }}>
              No Transactions Found
            </div>
            <div style={{ fontSize: '12.5px', color: 'var(--tp-text-muted)' }}>
              No transactions match your current search or filter criteria.
            </div>
          </div>
        ) : (
          filteredTransactions.map((tx) => {
            const isDeposit = tx.type === 'deposit';
            const dateObj = new Date(tx.created_at);

            return (
              <div
                key={tx.id}
                onClick={() => onSelectTransaction(tx)}
                className="tp-pressable"
                style={{
                  background: 'var(--tp-bg-surface)',
                  border: '1px solid var(--tp-border-subtle)',
                  borderRadius: 'var(--tp-radius-lg)',
                  padding: '14px 16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  boxShadow: 'var(--tp-shadow-card)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '12px',
                      background: isDeposit ? 'rgba(0, 229, 153, 0.12)' : 'rgba(56, 189, 248, 0.12)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    {isDeposit ? (
                      <ArrowDownLeft size={20} color="#00E599" />
                    ) : (
                      <ArrowUpRight size={20} color="#38BDF8" />
                    )}
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ fontSize: '14px', fontWeight: 800, color: '#FFF' }}>
                        {isDeposit ? 'USDT Deposit' : 'INR Withdrawal'}
                      </span>
                      <span className="tp-num" style={{ fontSize: '11px', color: 'var(--tp-text-muted)', fontWeight: 600 }}>
                        #{tx.id}
                      </span>
                    </div>
                    <div style={{ fontSize: '11.5px', color: 'var(--tp-text-muted)', marginTop: '2px' }}>
                      {tx.method_or_network} • {dateObj.toLocaleDateString([], { month: 'short', day: 'numeric' })} at{' '}
                      {dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>

                <div style={{ textAlign: 'right', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div>
                    <div
                      className="tp-num"
                      style={{
                        fontSize: '14.5px',
                        fontWeight: 800,
                        color: isDeposit ? '#00E599' : '#FFF',
                      }}
                    >
                      {isDeposit ? `+${tx.amount_usdt} USDT` : `₹${tx.amount_inr.toLocaleString('en-IN')}`}
                    </div>
                    <div style={{ marginTop: '2px' }}>
                      {getStatusBadge(tx.status)}
                    </div>
                  </div>
                  <ChevronRight size={16} color="var(--tp-text-muted)" />
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
