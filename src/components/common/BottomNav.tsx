import React from 'react';
import { Home, ArrowDownLeft, ArrowUpRight, History, User } from './Icons';

export type NavTab = 'home' | 'deposit' | 'withdraw' | 'history' | 'profile';

interface BottomNavProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, onTabChange }) => {
  const tabs = [
    { id: 'home' as NavTab, label: 'Home', icon: Home },
    { id: 'deposit' as NavTab, label: 'Deposit', icon: ArrowDownLeft },
    { id: 'withdraw' as NavTab, label: 'Withdraw', icon: ArrowUpRight },
    { id: 'history' as NavTab, label: 'History', icon: History },
    { id: 'profile' as NavTab, label: 'Profile', icon: User },
  ];

  const handleTabClick = (tab: NavTab) => {
    if (typeof window !== 'undefined' && 'navigator' in window && navigator.vibrate) {
      navigator.vibrate(20);
    }
    onTabChange(tab);
  };

  return (
    <nav className="tp-bottom-nav">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => handleTabClick(tab.id)}
            className={`tp-nav-item ${isActive ? 'active' : ''}`}
            aria-label={tab.label}
          >
            {isActive && <div className="tp-nav-indicator" />}
            <Icon size={20} strokeWidth={isActive ? 2.5 : 1.8} />
            <span>{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
};
