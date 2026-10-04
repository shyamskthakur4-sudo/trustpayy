import React from 'react';
import { TrustPayLogo } from '../brand/TrustPayLogo';
import {
  Bell,
  ShieldCheck,
  ShieldAlert,
  Sliders,
  Home,
  ArrowDownLeft,
  ArrowUpRight,
  History,
  User,
  TrendingUp,
} from './Icons';
import type { UserAccount } from '../../types';
import type { NavTab } from './BottomNav';

interface HeaderProps {
  user: UserAccount | null;
  unreadCount: number;
  activeTab?: NavTab;
  onNavigateTab?: (tab: NavTab) => void;
  exchangeRate?: number;
  onOpenNotifications: () => void;
  onOpenSecurity: () => void;
  onOpenAdmin: () => void;
  onLogoClick?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  user,
  unreadCount,
  activeTab,
  onNavigateTab,
  exchangeRate,
  onOpenNotifications,
  onOpenSecurity,
  onOpenAdmin,
  onLogoClick,
}) => {
  const isSecure = user?.security_settings.pin_enabled || user?.security_settings.phrase_backed_up;

  const navLinks: { id: NavTab; label: string; icon: React.FC<{ size?: number }> }[] = [
    { id: 'home', label: 'Dashboard', icon: Home },
    { id: 'deposit', label: 'Deposit USDT', icon: ArrowDownLeft },
    { id: 'withdraw', label: 'Withdraw INR', icon: ArrowUpRight },
    { id: 'history', label: 'Transactions', icon: History },
    { id: 'profile', label: 'Account', icon: User },
  ];

  return (
    <header
      style={{
        borderBottom: '1px solid var(--tp-border-subtle)',
        background: 'rgba(9, 13, 22, 0.95)',
        backdropFilter: 'blur(16px)',
        position: 'sticky',
        top: 0,
        zIndex: 50,
        padding: '12px 24px',
        width: '100%',
      }}
    >
      <div className="tp-header-container">
        {/* Brand Logo */}
        <div onClick={onLogoClick} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
          <TrustPayLogo size="sm" layout="horizontal" showWordmark={true} />
        </div>

        {/* Desktop Navigation Links */}
        {user && onNavigateTab && (
          <nav className="tp-desktop-nav">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = activeTab === link.id;
              return (
                <button
                  key={link.id}
                  type="button"
                  onClick={() => onNavigateTab(link.id)}
                  className={`tp-desktop-nav-item ${isActive ? 'active' : ''}`}
                >
                  <Icon size={15} />
                  <span>{link.label}</span>
                </button>
              );
            })}
          </nav>
        )}

        {/* Action Buttons & Rate */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {/* Live Exchange Rate Pill */}
          {exchangeRate && (
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                background: 'rgba(0, 229, 153, 0.08)',
                border: '1px solid rgba(0, 229, 153, 0.25)',
                borderRadius: 'var(--tp-radius-full)',
                padding: '5px 12px',
                fontSize: '11.5px',
                fontWeight: 700,
                color: '#00E599',
              }}
              className="tp-hide-on-mobile"
            >
              <TrendingUp size={12} />
              <span>1 USDT = ₹{exchangeRate}</span>
            </div>
          )}

          {/* User Account ID pill */}
          {user && (
            <div
              onClick={onOpenSecurity}
              className="tp-pressable"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid var(--tp-border-light)',
                borderRadius: 'var(--tp-radius-full)',
                padding: '5px 12px',
                fontSize: '11.5px',
                fontWeight: 600,
                color: 'var(--tp-text-secondary)',
                cursor: 'pointer',
              }}
              title="View Security & Account"
            >
              {isSecure ? (
                <ShieldCheck size={14} color="#00E599" />
              ) : (
                <ShieldAlert size={14} color="#F59E0B" />
              )}
              <span className="tp-num">{user.account_id}</span>
            </div>
          )}

          {/* Notification Bell */}
          <button
            onClick={onOpenNotifications}
            className="tp-pressable"
            style={{
              position: 'relative',
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid var(--tp-border-subtle)',
              borderRadius: '50%',
              width: '36px',
              height: '36px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#F8FAFC',
              cursor: 'pointer',
            }}
            aria-label="Notifications"
          >
            <Bell size={17} />
            {unreadCount > 0 && (
              <span
                style={{
                  position: 'absolute',
                  top: '-2px',
                  right: '-2px',
                  background: '#00E599',
                  color: '#06090F',
                  fontSize: '10px',
                  fontWeight: 800,
                  width: '16px',
                  height: '16px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 0 8px rgba(0, 229, 153, 0.8)',
                }}
              >
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {/* Admin Portal Toggle Button */}
          <button
            onClick={onOpenAdmin}
            className="tp-pressable"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              background: 'rgba(0, 229, 153, 0.12)',
              border: '1px solid rgba(0, 229, 153, 0.3)',
              borderRadius: 'var(--tp-radius-md)',
              padding: '6px 12px',
              color: '#00E599',
              fontSize: '11px',
              fontWeight: 700,
              cursor: 'pointer',
            }}
            title="Open Admin Configuration Console"
          >
            <Sliders size={13} />
            <span>ADMIN</span>
          </button>
        </div>
      </div>
    </header>
  );
};
