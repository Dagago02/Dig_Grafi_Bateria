import React, { useState, createContext, useContext } from 'react';

const TabsContext = createContext<{
  activeTab: string;
  setActiveTab: (value: string) => void;
} | null>(null);

export const Tabs = ({ defaultValue, children, className = '' }: any) => {
  const [activeTab, setActiveTab] = useState(defaultValue);
  return (
    <TabsContext.Provider value={{ activeTab, setActiveTab }}>
      <div className={className}>{children}</div>
    </TabsContext.Provider>
  );
};

export const TabsList = ({ children, className = '' }: any) => {
  return <div className={`flex gap-2 border-b border-border mb-4 pb-2 ${className}`}>{children}</div>;
};

export const TabsTrigger = ({ value, children, className = '' }: any) => {
  const { activeTab, setActiveTab } = useContext(TabsContext)!;
  const isActive = activeTab === value;
  return (
    <button
      className={`px-4 py-2 font-medium text-sm transition-colors ${
        isActive
          ? 'border-b-2 border-primary text-primary'
          : 'text-muted-foreground hover:text-foreground'
      } ${className}`}
      onClick={() => setActiveTab(value)}
    >
      {children}
    </button>
  );
};

export const TabsContent = ({ value, children, className = '' }: any) => {
  const { activeTab } = useContext(TabsContext)!;
  if (activeTab !== value) return null;
  return <div className={className}>{children}</div>;
};
