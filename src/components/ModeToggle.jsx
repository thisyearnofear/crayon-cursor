import React from 'react';
import '../styles/toggle.css';

const ModeToggle = ({ mode, onToggle }) => {
  return (
    <div className="mode-toggle">
      <button 
        className={`toggle-btn ${mode === 'signature' ? 'active' : ''}`}
        onClick={() => onToggle('signature')}
        aria-label="Signature Mode"
      >
        SIGNATURE
      </button>
      <button 
        className={`toggle-btn ${mode === 'quill' ? 'active' : ''}`}
        onClick={() => onToggle('quill')}
        aria-label="Quill Mode"
      >
        QUILL
      </button>
    </div>
  );
};

export default ModeToggle; 