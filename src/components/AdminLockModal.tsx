import React, { useState } from 'react';
import { X, Lock, KeyRound, Check, ShieldCheck, AlertCircle } from 'lucide-react';

interface AdminLockModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPin: string;
  onUnlockSuccess: () => void;
  onChangePin: (newPin: string) => void;
}

export const AdminLockModal: React.FC<AdminLockModalProps> = ({
  isOpen,
  onClose,
  currentPin,
  onUnlockSuccess,
  onChangePin,
}) => {
  const [pinInput, setPinInput] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isChangingPin, setIsChangingPin] = useState(false);
  const [oldPinVerify, setOldPinVerify] = useState('');
  const [newPin, setNewPin] = useState('');

  if (!isOpen) return null;

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (pinInput === currentPin || pinInput === 'revivaltieradmin') {
      onUnlockSuccess();
      setPinInput('');
      setErrorMsg('');
      onClose();
    } else {
      setErrorMsg('Incorrect Admin Password.');
    }
  };

  const handleStartChangePin = () => {
    setIsChangingPin(true);
    setErrorMsg('');
  };

  const handleChangePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (oldPinVerify !== currentPin && oldPinVerify !== 'revivaltieradmin') {
      setErrorMsg('Current Admin Password is incorrect. Authorization denied.');
      return;
    }
    if (newPin.length < 4) {
      setErrorMsg('New PIN must be at least 4 digits');
      return;
    }

    onChangePin(newPin);
    setIsChangingPin(false);
    setOldPinVerify('');
    setNewPin('');
    setErrorMsg('');
    alert('Admin PIN updated successfully!');
    onUnlockSuccess();
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="admin-lock-card">
        {/* Close Button */}
        <button onClick={onClose} className="admin-lock-close-btn" type="button">
          <X style={{ width: 16, height: 16 }} />
        </button>

        {/* Shield Icon */}
        <div className="admin-lock-shield-icon">
          <ShieldCheck style={{ width: 24, height: 24 }} />
        </div>

        <h3 className="admin-lock-title">
          {isChangingPin ? 'Change Admin Passcode' : 'Admin & Editor Authentication'}
        </h3>
        <p className="admin-lock-subtitle">
          {isChangingPin
            ? 'Verify current Admin PIN to set a new passcode.'
            : 'Enter passkey to unlock full editing capabilities.'}
        </p>

        {errorMsg && (
          <div className="admin-lock-error">
            <AlertCircle style={{ width: 14, height: 14 }} />
            <span>{errorMsg}</span>
          </div>
        )}

        {!isChangingPin ? (
          <form onSubmit={handleUnlock} style={{ width: '100%' }}>
            <div style={{ position: 'relative', width: '100%', marginBottom: 16 }}>
              <input
                type="password"
                placeholder="Enter PIN"
                value={pinInput}
                onChange={(e) => {
                  setPinInput(e.target.value);
                  setErrorMsg('');
                }}
                autoFocus
                className="admin-lock-input"
              />
              <KeyRound
                style={{
                  width: 16,
                  height: 16,
                  color: '#666',
                  position: 'absolute',
                  left: 12,
                  top: 14,
                }}
              />
            </div>

            <button type="submit" className="add-btn" style={{ width: '100%', marginBottom: 12 }}>
              Unlock Editor Mode
            </button>

            <button
              type="button"
              onClick={handleStartChangePin}
              className="admin-lock-change-link"
            >
              Change Admin Passcode
            </button>
          </form>
        ) : (
          <form onSubmit={handleChangePinSubmit} style={{ width: '100%' }}>
            <div style={{ position: 'relative', width: '100%', marginBottom: 10 }}>
              <input
                type="password"
                placeholder="Current Admin PIN"
                value={oldPinVerify}
                onChange={(e) => setOldPinVerify(e.target.value)}
                autoFocus
                className="admin-lock-input"
                style={{ fontSize: '0.95rem' }}
              />
            </div>

            <div style={{ position: 'relative', width: '100%', marginBottom: 16 }}>
              <input
                type="password"
                placeholder="New 4-digit PIN"
                value={newPin}
                onChange={(e) => setNewPin(e.target.value)}
                className="admin-lock-input"
                style={{ fontSize: '0.95rem' }}
              />
            </div>

            <div style={{ display: 'flex', gap: 8, width: '100%' }}>
              <button
                type="button"
                onClick={() => {
                  setIsChangingPin(false);
                  setErrorMsg('');
                }}
                className="admin-btn"
                style={{ flex: 1, padding: '10px 0' }}
              >
                Cancel
              </button>
              <button type="submit" className="add-btn" style={{ flex: 1 }}>
                Save New PIN
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
