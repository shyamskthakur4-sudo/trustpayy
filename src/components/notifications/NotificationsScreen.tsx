import React from 'react';
import { ArrowLeft, Bell, CheckCheck, ArrowDownLeft, ArrowUpRight, ShieldAlert, Info, ChevronRight } from '../common/Icons';
import { AppNotification } from '../../types';
import { TrustPayStore } from '../../services/storage';

interface NotificationsScreenProps {
  notifications: AppNotification[];
  onBack: () => void;
  onSelectOrder?: (orderId: string) => void;
}

export const NotificationsScreen: React.FC<NotificationsScreenProps> = ({
  notifications,
  onBack,
  onSelectOrder,
}) => {
  const handleMarkAllRead = () => {
    TrustPayStore.markAllNotificationsRead();
  };

  const handleNotificationClick = (n: AppNotification) => {
    if (!n.read) {
      TrustPayStore.markNotificationRead(n.id);
    }
    if (n.order_id && onSelectOrder) {
      onSelectOrder(n.order_id);
    }
  };

  const getNotificationIcon = (type: AppNotification['type']) => {
    switch (type) {
      case 'deposit':
        return <ArrowDownLeft size={18} color="#00E599" />;
      case 'withdrawal':
        return <ArrowUpRight size={18} color="#38BDF8" />;
      case 'security':
        return <ShieldAlert size={18} color="#F59E0B" />;
      default:
        return <Info size={18} color="#A855F7" />;
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
          Notifications
        </h1>

        <button
          onClick={handleMarkAllRead}
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
            gap: '4px',
          }}
        >
          <CheckCheck size={14} />
          <span>Mark Read</span>
        </button>
      </div>

      {/* Notifications List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {notifications.length === 0 ? (
          <div
            style={{
              padding: '48px 24px',
              textAlign: 'center',
              background: 'var(--tp-bg-surface)',
              borderRadius: 'var(--tp-radius-lg)',
              border: '1px solid var(--tp-border-subtle)',
            }}
          >
            <Bell size={32} color="var(--tp-text-muted)" style={{ margin: '0 auto 12px' }} />
            <div style={{ fontSize: '15px', fontWeight: 700, color: '#FFF', marginBottom: '4px' }}>
              No Notifications
            </div>
            <div style={{ fontSize: '12.5px', color: 'var(--tp-text-muted)' }}>
              You will receive real-time alerts when deposits and withdrawals update.
            </div>
          </div>
        ) : (
          notifications.map((n) => {
            const timeAgo = new Date(n.created_at).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            });

            return (
              <div
                key={n.id}
                onClick={() => handleNotificationClick(n)}
                className="tp-pressable"
                style={{
                  background: n.read ? 'var(--tp-bg-surface)' : 'rgba(18, 28, 46, 0.95)',
                  border: n.read ? '1px solid var(--tp-border-subtle)' : '1px solid rgba(0, 229, 153, 0.3)',
                  borderRadius: 'var(--tp-radius-lg)',
                  padding: '14px 16px',
                  display: 'flex',
                  gap: '12px',
                  alignItems: 'flex-start',
                  position: 'relative',
                  boxShadow: 'var(--tp-shadow-card)',
                }}
              >
                {/* Unread indicator dot */}
                {!n.read && (
                  <div
                    style={{
                      position: 'absolute',
                      top: '14px',
                      right: '14px',
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      background: '#00E599',
                      boxShadow: '0 0 8px #00E599',
                    }}
                  />
                )}

                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '10px',
                    background: 'rgba(255, 255, 255, 0.05)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  {getNotificationIcon(n.type)}
                </div>

                <div style={{ flex: 1, paddingRight: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2px' }}>
                    <div style={{ fontSize: '13.5px', fontWeight: 800, color: '#FFF' }}>
                      {n.title}
                    </div>
                  </div>
                  <p style={{ fontSize: '12.5px', color: 'var(--tp-text-secondary)', lineHeight: 1.45, marginBottom: '6px' }}>
                    {n.message}
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11px', color: 'var(--tp-text-muted)' }}>
                    <span>{timeAgo}</span>
                    {n.order_id && (
                      <span style={{ color: 'var(--tp-emerald)', fontWeight: 700 }}>
                        • View Order #{n.order_id}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
