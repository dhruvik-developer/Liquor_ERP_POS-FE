import React, { createContext, useContext, useState } from 'react';
import CalculatorModal from '../components/common/CalculatorModal';

const CalculatorContext = createContext(null);

export const CalculatorProvider = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);

  const openCalculator = () => setIsOpen(true);
  const closeCalculator = () => setIsOpen(false);

  return (
    <CalculatorContext.Provider value={{ isOpen, openCalculator, closeCalculator }}>
      {children}
      <CalculatorModal isOpen={isOpen} onClose={closeCalculator} />
    </CalculatorContext.Provider>
  );
};

export const useCalculator = () => {
  const context = useContext(CalculatorContext);
  if (!context) {
    throw new Error('useCalculator must be used within a CalculatorProvider');
  }
  return context;
};
