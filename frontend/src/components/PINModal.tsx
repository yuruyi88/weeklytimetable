import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Shield, AlertCircle } from 'lucide-react';
import { setupPIN, verifyPIN, changePIN } from '../services/auth';
import confetti from 'canvas-confetti';

interface PINModalProps {
  mode: 'setup' | 'verify' | 'change';
  onSuccess: () => void;
  onClose: () => void;
}

const PINModal: React.FC<PINModalProps> = ({ mode, onSuccess, onClose }) => {
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [oldPin, setOldPin] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [step, setStep] = useState<'input' | 'confirm'>('input');

  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, [step, mode]);
  
  const handleSubmit = async () => {
    setError('');
    setIsSubmitting(true);
    
    try {
      if (mode === 'setup') {
        if (step === 'input') {
          if (pin.length < 4) {
            setError('PIN must be at least 4 digits');
            setIsSubmitting(false);
            return;
          }
          setStep('confirm');
          setConfirmPin('');
          setIsSubmitting(false);
          return;
        } else {
          if (pin !== confirmPin) {
            setError('PINs do not match. Please try again.');
            setConfirmPin('');
            setIsSubmitting(false);
            return;
          }
          await setupPIN(pin);
          confetti({
            particleCount: 150,
            spread: 80,
            origin: { y: 0.6 },
            colors: ['#FF6B6B', '#4ECDC4', '#FFE66D', '#95E1D3'],
          });
        }
      } else if (mode === 'verify') {
        if (pin.length < 4) {
          setError('Please enter your PIN');
          setIsSubmitting(false);
          return;
        }
        await verifyPIN(pin);
      } else if (mode === 'change') {
        if (step === 'input') {
          if (oldPin.length < 4 || pin.length < 4) {
            setError('PIN must be at least 4 digits');
            setIsSubmitting(false);
            return;
          }
          setStep('confirm');
          setConfirmPin('');
          setIsSubmitting(false);
          return;
        } else {
          if (pin !== confirmPin) {
            setError('New PINs do not match. Please try again.');
            setConfirmPin('');
            setIsSubmitting(false);
            return;
          }
          await changePIN(oldPin, pin);
        }
      }
      
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid PIN');
      if (mode === 'verify') {
        setPin('');
      } else if (mode === 'change' && step === 'input') {
        setOldPin('');
        setPin('');
      }
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const getTitle = () => {
    if (mode === 'setup') return step === 'input' ? 'Create PIN 🔐' : 'Confirm PIN';
    if (mode === 'verify') return 'Enter PIN 🔒';
    if (mode === 'change') return step === 'input' ? 'Change PIN' : 'Confirm New PIN';
    return '';
  };
  
  const getDescription = () => {
    if (mode === 'setup') {
      return step === 'input'
        ? 'Create a 4-6 digit PIN to protect your timetable'
        : 'Enter the same PIN again to confirm';
    }
    if (mode === 'verify') return 'Enter your PIN to continue';
    if (mode === 'change') {
      return step === 'input'
        ? 'Enter your current PIN and a new PIN'
        : 'Enter your new PIN again to confirm';
    }
    return '';
  };
  
  const handlePinInputChange = (value: string, setter: (val: string) => void) => {
    const digits = value.replace(/\D/g, '').slice(0, 6);
    setter(digits);
    setError('');
  };

  const renderPinInput = (value: string, onChange: (val: string) => void, label?: string) => (
    <div className="space-y-3">
      {label && (
        <label className="block text-sm font-medium text-gray-600">{label}</label>
      )}
      <input
        ref={inputRef}
        type="password"
        inputMode="numeric"
        pattern="[0-9]*"
        minLength={4}
        maxLength={6}
        value={value}
        onChange={e => handlePinInputChange(e.target.value, onChange)}
        className={`pin-input-single ${value ? 'border-pink-400 bg-pink-50' : ''}`}
        placeholder="4-6 digits"
        disabled={isSubmitting}
      />
    </div>
  );
  
  return (
    <div className="modal-overlay" onClick={onClose}>
      <motion.div
        initial={{ scale: 0.8, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.8, opacity: 0, y: 20 }}
        onClick={e => e.stopPropagation()}
        className="bg-white rounded-3xl p-6 w-full max-w-sm m-4"
      >
        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-pink-400 to-purple-400 flex items-center justify-center">
            {mode === 'setup' ? (
              <Shield className="w-8 h-8 text-white" />
            ) : (
              <Lock className="w-8 h-8 text-white" />
            )}
          </div>
          <h2 className="text-2xl font-bold text-gray-800">{getTitle()}</h2>
          <p className="text-sm text-gray-500 mt-1">{getDescription()}</p>
        </div>
        
        {/* Error */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="bg-red-50 text-red-600 px-4 py-3 rounded-xl mb-4 text-sm flex items-center gap-2"
            >
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* PIN Inputs */}
        <div className="space-y-5">
          {mode === 'change' && step === 'input' && (
            renderPinInput(oldPin, setOldPin, 'Current PIN')
          )}
          
          {(mode !== 'change' || step === 'input') && (
            renderPinInput(
              pin,
              setPin,
              mode === 'change' ? 'New PIN' : undefined
            )
          )}

          {(mode === 'setup' || mode === 'change') && step === 'confirm' && (
            renderPinInput(confirmPin, setConfirmPin, 'Confirm PIN')
          )}
        </div>
        
        {/* Actions */}
        <div className="flex gap-3 mt-8">
          {mode !== 'setup' && (
            <button
              onClick={onClose}
              className="flex-1 py-3 rounded-2xl font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors"
              disabled={isSubmitting}
            >
              Cancel
            </button>
          )}
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="flex-1 btn btn-primary disabled:opacity-50"
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center gap-2">
                <span className="spinner w-5 h-5 border-2" />
                Verifying...
              </span>
            ) : step === 'confirm' || mode === 'verify' ? (
              'Continue'
            ) : mode === 'change' ? (
              'Next'
            ) : (
              'Next'
            )}
          </button>
        </div>
        
        {/* Back button for confirm step */}
        {step === 'confirm' && (
          <button
            onClick={() => {
              setStep('input');
              setConfirmPin('');
              setError('');
            }}
            className="w-full mt-4 text-sm text-gray-500 hover:text-gray-700"
          >
            ← Go back
          </button>
        )}
      </motion.div>
    </div>
  );
};

export default PINModal;
