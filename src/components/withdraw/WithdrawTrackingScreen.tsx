import React from 'react';
import { WithdrawalOrder, WithdrawalStatus } from '../../types';
import { ArrowLeft, CheckCircle2, Clock, AlertCircle, HelpCircle, RefreshCw, ExternalLink, ShieldCheck, Zap } from '../common/Icons';

interface WithdrawTrackingScreenProps {
  order: WithdrawalOrder;
  onBack: () => void;
  onNeedHelp: (orderId: string) => void;
}

export const WithdrawTrackingScreen: React.FC<WithdrawTrackingScreenProps> = ({
  order,
  onBack,
  onNeedHelp,
}) => {
  // Stepper workflow definitions
  const steps: { key: WithdrawalStatus; label: string; desc: string }[] = [
    { key: 'submitted', label: 'Submitted', desc: 'Order received and logged in queue' },
    { key: 'verification', label: 'Verification', desc: 'Balance & KYC security clearance' },
    { key: 'processing', label: 'Processing', desc: 'Dispatched to banking payout gateway' },
    { key: 'payment_sent', label: 'Payment Sent', desc: 'Dispatched via UPI / IMPS rail' },
    { key: 'completed', label: 'Completed', desc: 'Funds credited to recipient bank account' },
  ];

  const getStepIndex = (status: WithdrawalStatus): number => {
    switch (status) {
      case 'submitted':
        return 0;
      case 'verification':
        return 1;
      case 'processing':
        return 2;
      case 'payment_sent':
        return 3;
      case 'completed':
        return 4;
      default:
        return 1;
    }
  };

  const isFailedOrRejected = ['failed', 'rejected', 'cancelled'].includes(order.status);
  const currentStepIdx = isFailedOrRejected ? 1 : getStepIndex(order.status);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
        padding: '16px 16px 90px',
      }}
    >
      {/* Top Header */}
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
        <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--tp-emerald)', letterSpacing: '0.05em' }}>
          ORDER TRACKING
        </span>
        <div style={{ width: '36px' }} />
      </div>

      {/* Prominent Order Card */}
      <div
        style={{
          background: 'linear-gradient(135deg, rgba(16, 26, 42, 0.95) 0%, rgba(9, 14, 25, 0.98) 100%)',
          border: '1px solid var(--tp-border-light)',
          borderRadius: 'var(--tp-radius-xl)',
          padding: '24px 20px',
          boxShadow: 'var(--tp-shadow-card)',
          textAlign: 'center',
        }}
      >
        <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--tp-text-muted)', textTransform: 'uppercase', marginBottom: '4px' }}>
          Withdrawal Order ID
        </div>
        <div className="tp-num" style={{ fontSize: '24px', fontWeight: 900, color: '#FFF', letterSpacing: '-0.02em', marginBottom: '12px' }}>
          #{order.id}
        </div>

        {/* Payout Amount Highlight */}
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: '6px', marginBottom: '8px' }}>
          <span className="tp-num" style={{ fontSize: '32px', fontWeight: 900, color: '#00E599' }}>
            ₹{order.amount_inr.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </span>
          <span style={{ fontSize: '15px', fontWeight: 700, color: '#00E599' }}>INR</span>
        </div>
        <div style={{ fontSize: '12.5px', color: 'var(--tp-text-secondary)', marginBottom: '16px' }}>
          Deducted: <strong>{order.amount_usdt.toFixed(2)} USDT</strong> at ₹{order.exchange_rate}/USDT
        </div>

        {/* Status Pill */}
        <div style={{ display: 'inline-block' }}>
          <span
            className={`tp-badge ${
              order.status === 'completed'
                ? 'tp-badge-completed'
                : isFailedOrRejected
                ? 'tp-badge-rejected'
                : 'tp-badge-processing'
            }`}
            style={{ fontSize: '13px', padding: '6px 14px' }}
          >
            {order.status === 'completed' && <CheckCircle2 size={15} />}
            {isFailedOrRejected && <AlertCircle size={15} />}
            {!['completed', 'failed', 'rejected', 'cancelled'].includes(order.status) && (
              <Clock size={15} />
            )}
            <span style={{ textTransform: 'uppercase', fontWeight: 800 }}>
              {order.status.replace(/_/g, ' ')}
            </span>
          </span>
        </div>

        {/* Target Processing Time Banner */}
        <div
          style={{
            background: 'rgba(255, 255, 255, 0.04)',
            borderRadius: 'var(--tp-radius-md)',
            padding: '12px 14px',
            marginTop: '20px',
            textAlign: 'left',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
            <Zap size={14} color="#F59E0B" />
            <span style={{ fontSize: '12.5px', fontWeight: 700, color: '#FFF' }}>
              Estimated Processing Target: ~15 minutes
            </span>
          </div>
          <p style={{ fontSize: '11px', color: 'var(--tp-text-muted)', lineHeight: 1.45 }}>
            Processing speed depends on immediate banking rail availability (NEFT/IMPS/UPI clearance),
            network latency, and AML security protocols.
          </p>
        </div>
      </div>

      {/* Stepper Timeline Workflow */}
      <div
        style={{
          background: 'var(--tp-bg-surface)',
          border: '1px solid var(--tp-border-subtle)',
          borderRadius: 'var(--tp-radius-xl)',
          padding: '22px 20px',
        }}
      >
        <div style={{ fontSize: '13.5px', fontWeight: 800, color: '#FFF', marginBottom: '18px' }}>
          Settlement Timeline
        </div>

        {isFailedOrRejected ? (
          <div
            style={{
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.25)',
              borderRadius: 'var(--tp-radius-md)',
              padding: '14px',
              display: 'flex',
              gap: '12px',
            }}
          >
            <AlertCircle size={20} color="#EF4444" style={{ flexShrink: 0 }} />
            <div>
              <div style={{ fontSize: '13px', fontWeight: 700, color: '#FCA5A5', marginBottom: '4px' }}>
                Order {order.status.toUpperCase()}
              </div>
              <div style={{ fontSize: '12px', color: '#FCA5A5', lineHeight: 1.45 }}>
                {order.rejection_reason || 'Verification check failed. Your USDT has been safely refunded back to your wallet balance.'}
              </div>
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {steps.map((st, idx) => {
              const isDone = idx < currentStepIdx || order.status === 'completed';
              const isCurrent = idx === currentStepIdx && order.status !== 'completed';

              return (
                <div key={st.key} className="tp-timeline-item">
                  {idx < steps.length - 1 && (
                    <div className={`tp-timeline-line ${isDone ? 'active' : ''}`} />
                  )}
                  <div className={`tp-timeline-dot ${isDone || isCurrent ? 'active' : ''}`}>
                    {isDone ? (
                      <CheckCircle2 size={16} color="#00E599" />
                    ) : isCurrent ? (
                      <span
                        style={{
                          width: '8px',
                          height: '8px',
                          borderRadius: '50%',
                          background: '#00E599',
                          boxShadow: '0 0 8px #00E599',
                        }}
                      />
                    ) : (
                      <span style={{ fontSize: '10px', fontWeight: 700 }}>{idx + 1}</span>
                    )}
                  </div>
                  <div>
                    <div style={{ fontSize: '13.5px', fontWeight: 700, color: isDone || isCurrent ? '#FFF' : 'var(--tp-text-muted)' }}>
                      {st.label}
                    </div>
                    <div style={{ fontSize: '11.5px', color: 'var(--tp-text-secondary)', marginTop: '2px' }}>
                      {st.desc}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Recipient Details Card */}
      <div
        style={{
          background: 'var(--tp-bg-surface)',
          border: '1px solid var(--tp-border-subtle)',
          borderRadius: 'var(--tp-radius-lg)',
          padding: '16px',
        }}
      >
        <div style={{ fontSize: '13px', fontWeight: 700, color: '#FFF', marginBottom: '12px' }}>
          Payout Destination
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '12.5px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--tp-text-secondary)' }}>
            <span>Method</span>
            <span style={{ color: '#FFF', fontWeight: 600 }}>{order.method}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--tp-text-secondary)' }}>
            <span>Account Holder</span>
            <span style={{ color: '#FFF', fontWeight: 600 }}>{order.payout_details.account_holder_name}</span>
          </div>
          {order.payout_details.type === 'UPI' ? (
            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--tp-text-secondary)' }}>
              <span>UPI ID</span>
              <span className="tp-num" style={{ color: '#00E599', fontWeight: 700 }}>
                {order.payout_details.upi_id}
              </span>
            </div>
          ) : order.payout_details.type === 'CDM' ? (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--tp-text-secondary)' }}>
                <span>CDM Bank</span>
                <span style={{ color: '#FFF', fontWeight: 600 }}>{order.payout_details.bank_name}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--tp-text-secondary)' }}>
                <span>Account Number</span>
                <span className="tp-num" style={{ color: '#FFF', fontWeight: 600 }}>
                  {order.payout_details.bank_account_number}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--tp-text-secondary)' }}>
                <span>Linked Mobile</span>
                <span className="tp-num" style={{ color: '#F59E0B', fontWeight: 600 }}>
                  {order.payout_details.mobile_number}
                </span>
              </div>
              {order.payout_details.branch_city && (
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--tp-text-secondary)' }}>
                  <span>City / Branch</span>
                  <span style={{ color: '#FFF', fontWeight: 600 }}>{order.payout_details.branch_city}</span>
                </div>
              )}
            </>
          ) : (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--tp-text-secondary)' }}>
                <span>Bank Name</span>
                <span style={{ color: '#FFF', fontWeight: 600 }}>{order.payout_details.bank_name}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--tp-text-secondary)' }}>
                <span>Account Number</span>
                <span className="tp-num" style={{ color: '#FFF', fontWeight: 600 }}>
                  {order.payout_details.bank_account_number}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--tp-text-secondary)' }}>
                <span>IFSC Code</span>
                <span className="tp-num" style={{ color: '#FFF', fontWeight: 600 }}>
                  {order.payout_details.ifsc_code}
                </span>
              </div>
            </>
          )}

          {order.utr_number && (
            <div
              style={{
                marginTop: '6px',
                paddingTop: '8px',
                borderTop: '1px solid var(--tp-border-subtle)',
                display: 'flex',
                justifyContent: 'space-between',
              }}
            >
              <span style={{ color: '#00E599', fontWeight: 700 }}>Bank Reference (UTR)</span>
              <span className="tp-num" style={{ color: '#00E599', fontWeight: 800 }}>
                {order.utr_number}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Need Help with this order CTA */}
      <button
        type="button"
        onClick={() => onNeedHelp(order.id)}
        className="tp-btn-secondary"
      >
        <HelpCircle size={16} color="#F59E0B" />
        <span>Need help with Order #{order.id}?</span>
      </button>

      <button
        type="button"
        onClick={onBack}
        className="tp-btn-primary"
      >
        <span>Return to Dashboard</span>
      </button>
    </div>
  );
};
