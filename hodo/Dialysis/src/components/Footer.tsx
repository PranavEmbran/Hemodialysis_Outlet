import React, { useState } from 'react';
import { X } from 'lucide-react';
import '../styles/Footer.css';
import '../styles/ShortcutModal.css';


const generalShortcuts = [
  { keys: 'ALT + CTRL + L', description: 'Log out or login' },
  { keys: 'ALT + S', description: 'Search Patient (Clear and search if patient selected)' },
  { keys: 'ALT + R', description: 'Register patient' },
  { keys: 'ALT + H', description: 'Visit History (After patient selected)' },
  { keys: 'ALT + A', description: 'Assign Doctor/Lab Tests (After patient selected)' },
  { keys: 'ALT + F', description: 'Add Pending Lab Result' },
  { keys: 'ALT + J', description: 'Add Pending Radiology Result (After patient selected)' },
  { keys: 'ALT + U', description: 'Add Pending Procedure Result (After patient selected)' },
  { keys: 'ALT + Z', description: 'View Lab Entered Results' },
  { keys: 'ALT + Y', description: 'Home collection registration' },
];


const functionKeys = [
  { keys: 'F1', description: 'Search' },
  { keys: 'F2', description: 'Todays Bills' },
  { keys: 'F3', description: 'Todays Visits' },
  { keys: 'CTRL + F2', description: 'Collect Sample' },
  { keys: 'F4', description: 'Appointments' },
  { keys: 'F6', description: 'Drug Stocks' },
  { keys: 'ALT + F6', description: 'Brand Name wise Stock' },
  { keys: 'CTRL + F6', description: 'Stock transfer' },
  { keys: 'F7', description: 'Pharmacy Sale' },
  { keys: 'CTRL + F7', description: 'Pharmacy Sale Return' },
  { keys: 'F8', description: 'Register Patient' },
  { keys: 'F9', description: 'New Visit' },
];


const ShortcutsModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  return (
    <>
      <div className="modal-overlay" onClick={onClose} />
      <div className="shortcuts-modal">
        <div className="modal-header">
          <h2>Shortcut Keys</h2>
          <button className="close-btn" onClick={onClose} aria-label="Close">
            <X size={20} />
          </button>
        </div>
       
        <div className="shortcut-section">
          <h3>GENERAL SHORTCUTS</h3>
          {generalShortcuts.map((shortcut, idx) => (
            <div className="shortcut-item" key={shortcut.keys + idx}>
              <div className="shortcut-keys">{shortcut.keys}</div>
              <div className="shortcut-description">= {shortcut.description}</div>
            </div>
          ))}
        </div>


        <div className="shortcut-section">
          <h3>FUNCTION KEYS</h3>
          {functionKeys.map((shortcut, idx) => (
            <div className="shortcut-item" key={shortcut.keys + idx}>
              <div className="shortcut-keys">{shortcut.keys}</div>
              <div className="shortcut-description">= {shortcut.description}</div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};


const Footer: React.FC = () => {
  const [showShortcuts, setShowShortcuts] = useState(false);


  const toggleFullscreen = (): void => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch((err: Error) => {
        console.log(`Error attempting to enable fullscreen: ${err.message}`);
      });
    } else {
      document.exitFullscreen();
    }
  };


  const toggleShortcuts = (e: React.MouseEvent) => {
    e.preventDefault();
    setShowShortcuts(!showShortcuts);
  };


  return (
    <>
      <div className='footer-container'>
        <div className="footer-left">
          <span id='span1'>© 2025 </span>
          <a href="https://hodo.io/">www.hodo.io</a>
          <span id='span2'>Empowering Entrepreneurs in Healthcare </span>
          <a href="#" onClick={toggleShortcuts}>Short Cuts</a>
        </div>
        <div className="footer-right">
          <button onClick={toggleFullscreen} className="fullscreen-btn" aria-label="Toggle fullscreen">
            ⛶
          </button>
        </div>
      </div>
      {showShortcuts && <ShortcutsModal onClose={() => setShowShortcuts(false)} />}
    </>
  );
};


export default Footer;