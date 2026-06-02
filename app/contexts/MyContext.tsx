
'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

type MyContextType = {
  value: string;
  setValue: (newValue: string) => void;
};

const MyContext = createContext<MyContextType | undefined>(undefined);

export function MyContextProvider({ children }: { children: ReactNode }) {
  const [value, setValue] = useState('Default Value');
  return (
    <MyContext.Provider value={{ value, setValue }}>
      {children}
    </MyContext.Provider>
  );
}

export function useMyContext() {
  const context = useContext(MyContext);
  if (!context) {
    throw new Error('useMyContext must be used within a MyContextProvider');
  }
  return context;
}
