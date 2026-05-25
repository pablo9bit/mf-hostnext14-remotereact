import React, { createContext, useContext, useState, ReactNode } from 'react';

interface AppContextType {
  counter: number;
  incrementCounter: () => void;
  decrementCounter: () => void;
  message: string;
  setMessage: (message: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within AppProvider');
  }
  return context;
};

interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const [counter, setCounter] = useState(0);
  const [message, setMessage] = useState('Hola desde Next.js Host!');

  const incrementCounter = () => setCounter(prev => prev + 1);
  const decrementCounter = () => setCounter(prev => prev - 1);

  const value: AppContextType = {
    counter,
    incrementCounter,
    decrementCounter,
    message,
    setMessage,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};
