import React from 'react';

interface DeviceContainerProps {
  children: React.ReactNode;
}

export const DeviceContainer: React.FC<DeviceContainerProps> = ({ children }) => {
  return (
    <div className="tp-web-app">
      {children}
    </div>
  );
};
