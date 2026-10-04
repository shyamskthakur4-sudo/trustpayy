import React, { useState, useEffect } from 'react';
import { Wifi, BatteryMedium, Signal } from './Icons';

export const AndroidStatusBar: React.FC = () => {
  const [time, setTime] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(
        now.toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
          hour12: false,
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="tp-status-bar select-none">
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        <span style={{ fontWeight: 700, fontSize: '12.5px', color: '#F8FAFC' }}>
          {time || '09:41'}
        </span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', opacity: 0.85 }}>
        <Signal size={13} color="#F8FAFC" />
        <Wifi size={13} color="#F8FAFC" />
        <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
          <span style={{ fontSize: '10.5px', fontWeight: 600 }}>98%</span>
          <BatteryMedium size={15} color="#00E599" />
        </div>
      </div>
    </div>
  );
};
