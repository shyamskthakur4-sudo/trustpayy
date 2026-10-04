import React, { useState } from 'react';
import { ArrowLeft, HelpCircle, ChevronDown, ChevronUp, Send, CheckCircle2, MessageSquare, AlertCircle } from '../common/Icons';
import { TransactionSummary, UserAccount } from '../../types';
import { TrustPayStore } from '../../services/storage';
import { useToast } from '../common/Toast';

interface SupportScreenProps {
  user: UserAccount;
  transactions: TransactionSummary[];
  preselectedOrderId?: string;
  onBack: () => void;
}

export const SupportScreen: React.FC<SupportScreenProps> = ({
  user,
  transactions,
  preselectedOrderId,
  onBack,
}) => {
  const [selectedOrderId, setSelectedOrderId] = useState<string>(preselectedOrderId || '');
  const [category, setCategory] = useState<'deposit' | 'withdrawal' | 'exchange' | 'security' | 'other'>('deposit');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [openFaqIdx, setOpenFaqIdx] = useState<number | null>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedTicketId, setSubmittedTicketId] = useState<string | null>(null);
  const { showToast } = useToast();

  const faqs = [
    {
      q: 'What is the minimum deposit amount?',
      a: 'The minimum deposit threshold on TrustPay is strictly 500 USDT across all supported networks. Deposits below 500 USDT cannot be credited.',
    },
    {
      q: 'How long does a withdrawal to INR take?',
      a: 'Our target settlement time is approximately 15 minutes. We support UPI Instant, IMPS Bank Transfer, and CDM Direct Cash Deposit into your bank account.',
    },
    {
      q: 'What networks can I use to deposit USDT?',
      a: 'We support five networks: BNB Smart Chain (BEP20), TRON (TRC20), Arbitrum One, Bitcoin, and Solana. Always send on the exact matching network.',
    },
    {
      q: 'How is the exchange rate calculated?',
      a: 'TrustPay guarantees zero hidden fees. The rate displayed (e.g. ₹109 / USDT) is the final settlement rate applied directly to your transfer.',
    },
    {
      q: 'Can TrustPay restore my 12-word recovery phrase if I lose it?',
      a: 'No. TrustPay operates on a non-custodial cryptographic standard. We do not store your recovery phrase. You must keep physical offline paper backups.',
    },
  ];

  const handleSubmitTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !message.trim()) {
      showToast('Please enter both subject and message', 'error');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      const ticket = TrustPayStore.createSupportTicket({
        userId: user.id,
        orderId: selectedOrderId || undefined,
        category,
        subject: subject.trim(),
        message: message.trim(),
      });

      setIsSubmitting(false);
      setSubmittedTicketId(ticket.id);
      showToast('Support ticket created. Priority desk responding.', 'success');
    }, 400);
  };

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
        <h1 style={{ fontSize: '17px', fontWeight: 800, color: '#FFF' }}>
          Support & Help Center
        </h1>
        <div style={{ width: '36px' }} />
      </div>

      {/* Frequently Asked Questions */}
      <div>
        <div style={{ fontSize: '13px', fontWeight: 800, color: '#FFF', marginBottom: '12px' }}>
          Frequently Asked Questions
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {faqs.map((faq, idx) => {
            const isOpen = openFaqIdx === idx;
            return (
              <div
                key={idx}
                style={{
                  background: 'var(--tp-bg-surface)',
                  border: '1px solid var(--tp-border-subtle)',
                  borderRadius: 'var(--tp-radius-md)',
                  overflow: 'hidden',
                }}
              >
                <div
                  onClick={() => setOpenFaqIdx(isOpen ? null : idx)}
                  className="tp-pressable"
                  style={{
                    padding: '14px 16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                  }}
                >
                  <span style={{ fontSize: '13px', fontWeight: 700, color: isOpen ? '#00E599' : '#FFF' }}>
                    {faq.q}
                  </span>
                  {isOpen ? <ChevronUp size={16} color="#00E599" /> : <ChevronDown size={16} color="var(--tp-text-muted)" />}
                </div>
                {isOpen && (
                  <div
                    style={{
                      padding: '0 16px 14px',
                      fontSize: '12px',
                      color: 'var(--tp-text-secondary)',
                      lineHeight: 1.5,
                      borderTop: '1px solid var(--tp-border-subtle)',
                      paddingTop: '10px',
                    }}
                  >
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Contact Priority Support Ticket Form */}
      <div
        style={{
          background: 'var(--tp-bg-surface)',
          border: '1px solid var(--tp-border-light)',
          borderRadius: 'var(--tp-radius-xl)',
          padding: '20px',
          boxShadow: 'var(--tp-shadow-card)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              background: 'rgba(0, 229, 153, 0.12)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <MessageSquare size={18} color="#00E599" />
          </div>
          <div>
            <h2 style={{ fontSize: '15px', fontWeight: 800, color: '#FFF' }}>
              Contact Priority Help Desk
            </h2>
            <div style={{ fontSize: '11px', color: 'var(--tp-text-muted)' }}>
              24/7 dedicated payment settlement support
            </div>
          </div>
        </div>

        {submittedTicketId ? (
          <div style={{ textAlign: 'center', padding: '20px 10px' }}>
            <div
              style={{
                width: '50px',
                height: '50px',
                borderRadius: '50%',
                background: 'rgba(0, 229, 153, 0.15)',
                border: '2px solid #00E599',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 12px',
              }}
            >
              <CheckCircle2 size={28} color="#00E599" />
            </div>
            <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#FFF', marginBottom: '4px' }}>
              Ticket Created #{submittedTicketId}
            </h3>
            <p style={{ fontSize: '12.5px', color: 'var(--tp-text-secondary)', lineHeight: 1.45, marginBottom: '18px' }}>
              Our payment operations desk has been dispatched to investigate. Response time target: within 15 minutes.
            </p>
            <button
              type="button"
              onClick={() => {
                setSubmittedTicketId(null);
                setSubject('');
                setMessage('');
              }}
              className="tp-btn-secondary"
            >
              <span>Submit Another Query</span>
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmitTicket}>
            {/* Order Selector (Section 13 requirement) */}
            <div className="tp-input-group">
              <label className="tp-input-label">
                <span>Relate to an Order (Optional)</span>
                <span style={{ color: 'var(--tp-text-muted)' }}>Order-Specific Help</span>
              </label>
              <select
                value={selectedOrderId}
                onChange={(e) => setSelectedOrderId(e.target.value)}
                className="tp-input-box"
                style={{ cursor: 'pointer' }}
              >
                <option value="">-- General Inquiry (No Order Selected) --</option>
                {transactions.map((tx) => (
                  <option key={tx.id} value={tx.id}>
                    Order #{tx.id} ({tx.type.toUpperCase()} • {tx.amount_usdt} USDT)
                  </option>
                ))}
              </select>
            </div>

            {/* Category */}
            <div className="tp-input-group">
              <label className="tp-input-label">Issue Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="tp-input-box"
                style={{ cursor: 'pointer' }}
              >
                <option value="deposit">Deposit Blockchain Verification</option>
                <option value="withdrawal">INR Payout / Bank Rail Inquiry</option>
                <option value="exchange">Exchange Rate & Calculation</option>
                <option value="security">Security & Recovery Credentials</option>
                <option value="other">Other Operational Support</option>
              </select>
            </div>

            {/* Subject */}
            <div className="tp-input-group">
              <label className="tp-input-label">Subject</label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="e.g. Need verification status on deposit"
                className="tp-input-box"
              />
            </div>

            {/* Message */}
            <div className="tp-input-group">
              <label className="tp-input-label">Detailed Description</label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Provide transaction details or question for the settlement desk..."
                rows={4}
                className="tp-input-box"
                style={{ resize: 'none', lineHeight: 1.5 }}
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting || !subject.trim() || !message.trim()}
              className="tp-btn-primary"
            >
              <Send size={16} />
              <span>{isSubmitting ? 'Dispatching Ticket...' : 'Send Message to Support'}</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
