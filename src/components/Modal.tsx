import React, { useEffect } from 'react';
import { CloseIcon } from './Icons';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  maxWidth?: string;
  title?: string;
  showCloseButton?: boolean;
  zIndex?: string;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, children, maxWidth = 'max-w-md', title, showCloseButton = true, zIndex = 'z-[100]' }) => {
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className={`fixed inset-0 ${zIndex} flex items-center justify-center p-4 overflow-y-auto`}>
      <div className="absolute inset-0 bg-black/30 animate-fade-in" onClick={onClose} />
      <div className={`relative w-full ${maxWidth} bg-white rounded-2xl border border-[#E5E5E5] shadow-lg animate-scale-in p-6 my-4`}>
        {showCloseButton && (
          <button onClick={onClose} className="absolute top-4 right-4 p-1.5 text-[#B0B0B0] hover:text-[#0A0A0A] transition-colors z-10">
            <CloseIcon size={18} />
          </button>
        )}
        {title && <h2 className="text-lg font-bold text-[#0A0A0A] mb-1">{title}</h2>}
        {children}
      </div>
    </div>
  );
};

export default Modal;
