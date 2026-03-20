import React, { useState, useEffect } from 'react';
import { X, Delete } from 'lucide-react';

const CalculatorModal = ({ isOpen, onClose }) => {
  const [display, setDisplay] = useState('0');
  const [previousValue, setPreviousValue] = useState(null);
  const [operator, setOperator] = useState(null);
  const [waitingForNewValue, setWaitingForNewValue] = useState(false);

  // Handle keyboard events
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      e.preventDefault();
      
      if (/[0-9]/.test(e.key)) {
        inputDigit(e.key);
      } else if (e.key === '.') {
        inputDecimal();
      } else if (e.key === '=' || e.key === 'Enter') {
        calculate();
      } else if (e.key === 'Backspace') {
        handleBackspace();
      } else if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'c' || e.key === 'C') {
        clearAll();
      } else if (['+', '-', '*', '/'].includes(e.key)) {
        performOperation(e.key);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, display, previousValue, operator, waitingForNewValue]);

  if (!isOpen) return null;

  const inputDigit = (digit) => {
    if (waitingForNewValue) {
      setDisplay(String(digit));
      setWaitingForNewValue(false);
    } else {
      setDisplay(display === '0' ? String(digit) : display + digit);
    }
  };

  const inputDecimal = () => {
    if (waitingForNewValue) {
      setDisplay('0.');
      setWaitingForNewValue(false);
      return;
    }
    if (!display.includes('.')) {
      setDisplay(display + '.');
    }
  };

  const handleBackspace = () => {
    if (waitingForNewValue) return;
    setDisplay(display.length > 1 ? display.slice(0, -1) : '0');
  };

  const clearAll = () => {
    setDisplay('0');
    setPreviousValue(null);
    setOperator(null);
    setWaitingForNewValue(false);
  };

  const performOperation = (nextOperator) => {
    const inputValue = parseFloat(display);

    if (previousValue == null) {
      setPreviousValue(inputValue);
    } else if (operator) {
      const currentValue = previousValue || 0;
      let newValue = currentValue;
      
      switch (operator) {
        case '+': newValue = currentValue + inputValue; break;
        case '-': newValue = currentValue - inputValue; break;
        case '*': newValue = currentValue * inputValue; break;
        case '/': newValue = currentValue / inputValue; break;
        default: break;
      }
      
      setPreviousValue(newValue);
      setDisplay(String(parseFloat(newValue.toFixed(6))));
    }

    setWaitingForNewValue(true);
    setOperator(nextOperator);
  };

  const calculate = () => {
    if (!operator || previousValue == null) return;
    performOperation(operator);
    setOperator(null);
    setPreviousValue(null);
    setWaitingForNewValue(true);
  };

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl overflow-hidden w-[320px] animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-slate-50 flex items-center justify-between px-4 py-3 border-b border-slate-100">
          <h3 className="text-[14px] font-black text-slate-700 tracking-tight">Calculator</h3>
          <button 
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-400 hover:bg-slate-200 hover:text-slate-600 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Display */}
        <div className="p-6 pb-4 bg-slate-50">
          <div className="h-6 text-right text-slate-400 text-[12px] font-bold tracking-widest min-h-[24px]">
            {previousValue != null && `${previousValue} ${operator} ${waitingForNewValue ? '' : display}`}
          </div>
          <div className="text-right text-4xl font-black text-slate-800 tracking-tighter overflow-hidden text-ellipsis whitespace-nowrap mt-1">
            {display}
          </div>
        </div>

        {/* Keypad */}
        <div className="p-5 grid grid-cols-4 gap-3 bg-white">
          <button onClick={clearAll} className="col-span-2 h-12 bg-rose-50 text-rose-500 rounded-xl font-black text-[15px] hover:bg-rose-100 transition-all active:scale-95 shadow-sm">C</button>
          <button onClick={handleBackspace} className="h-12 bg-slate-100 text-slate-600 rounded-xl font-black text-[15px] flex items-center justify-center hover:bg-slate-200 transition-all active:scale-95 shadow-sm"><Delete size={18} /></button>
          <button onClick={() => performOperation('/')} className={`h-12 rounded-xl font-black text-[18px] transition-all active:scale-95 shadow-sm ${operator === '/' ? 'bg-sky-500 text-white' : 'bg-sky-50 text-sky-600 hover:bg-sky-100'}`}>÷</button>

          <button onClick={() => inputDigit(7)} className="h-12 bg-slate-50 border border-slate-100 text-slate-700 rounded-xl font-black text-[18px] hover:bg-slate-100 transition-all active:scale-95 shadow-sm">7</button>
          <button onClick={() => inputDigit(8)} className="h-12 bg-slate-50 border border-slate-100 text-slate-700 rounded-xl font-black text-[18px] hover:bg-slate-100 transition-all active:scale-95 shadow-sm">8</button>
          <button onClick={() => inputDigit(9)} className="h-12 bg-slate-50 border border-slate-100 text-slate-700 rounded-xl font-black text-[18px] hover:bg-slate-100 transition-all active:scale-95 shadow-sm">9</button>
          <button onClick={() => performOperation('*')} className={`h-12 rounded-xl font-black text-[18px] transition-all active:scale-95 shadow-sm ${operator === '*' ? 'bg-sky-500 text-white' : 'bg-sky-50 text-sky-600 hover:bg-sky-100'}`}>×</button>

          <button onClick={() => inputDigit(4)} className="h-12 bg-slate-50 border border-slate-100 text-slate-700 rounded-xl font-black text-[18px] hover:bg-slate-100 transition-all active:scale-95 shadow-sm">4</button>
          <button onClick={() => inputDigit(5)} className="h-12 bg-slate-50 border border-slate-100 text-slate-700 rounded-xl font-black text-[18px] hover:bg-slate-100 transition-all active:scale-95 shadow-sm">5</button>
          <button onClick={() => inputDigit(6)} className="h-12 bg-slate-50 border border-slate-100 text-slate-700 rounded-xl font-black text-[18px] hover:bg-slate-100 transition-all active:scale-95 shadow-sm">6</button>
          <button onClick={() => performOperation('-')} className={`h-12 rounded-xl font-black text-[18px] transition-all active:scale-95 shadow-sm ${operator === '-' ? 'bg-sky-500 text-white' : 'bg-sky-50 text-sky-600 hover:bg-sky-100'}`}>-</button>

          <button onClick={() => inputDigit(1)} className="h-12 bg-slate-50 border border-slate-100 text-slate-700 rounded-xl font-black text-[18px] hover:bg-slate-100 transition-all active:scale-95 shadow-sm">1</button>
          <button onClick={() => inputDigit(2)} className="h-12 bg-slate-50 border border-slate-100 text-slate-700 rounded-xl font-black text-[18px] hover:bg-slate-100 transition-all active:scale-95 shadow-sm">2</button>
          <button onClick={() => inputDigit(3)} className="h-12 bg-slate-50 border border-slate-100 text-slate-700 rounded-xl font-black text-[18px] hover:bg-slate-100 transition-all active:scale-95 shadow-sm">3</button>
          <button onClick={() => performOperation('+')} className={`h-12 rounded-xl font-black text-[18px] transition-all active:scale-95 shadow-sm ${operator === '+' ? 'bg-sky-500 text-white' : 'bg-sky-50 text-sky-600 hover:bg-sky-100'}`}>+</button>

          <button onClick={() => inputDigit(0)} className="col-span-2 h-12 bg-slate-50 border border-slate-100 text-slate-700 rounded-xl font-black text-[18px] hover:bg-slate-100 transition-all active:scale-95 shadow-sm">0</button>
          <button onClick={inputDecimal} className="h-12 bg-slate-50 border border-slate-100 text-slate-700 rounded-xl font-black text-[18px] hover:bg-slate-100 transition-all active:scale-95 shadow-sm">.</button>
          <button onClick={calculate} className="h-12 bg-sky-500 text-white rounded-xl font-black text-[18px] hover:bg-sky-600 transition-all active:scale-95 shadow-md shadow-sky-500/20">=</button>
        </div>
      </div>
    </div>
  );
};

export default CalculatorModal;
