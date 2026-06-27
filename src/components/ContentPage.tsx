import React from 'react';
import { CloseIcon } from './Icons';
import { PAGE_CONTENT, PageKey } from '../data/content';

interface ContentPageProps {
  isOpen: boolean;
  onClose: () => void;
  page: PageKey;
}

// Компонент для подсветки важного текста
export const Highlight: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <span className="bg-blue-500/15 text-[#0A0A0A] px-1 py-0.5 rounded font-medium">{children}</span>
);

const ContentPage: React.FC<ContentPageProps> = ({ isOpen, onClose, page }) => {
  if (!isOpen) return null;
  const content = PAGE_CONTENT[page];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 overflow-y-auto">
      <div className="absolute inset-0 bg-black/30 animate-fade-in" onClick={onClose} />
      <div className="relative w-full max-w-2xl bg-white rounded-2xl border border-[#E5E5E5] shadow-lg animate-scale-in p-6 my-4 max-h-[90vh] overflow-y-auto">
        <button onClick={onClose} className="sticky top-0 float-right p-1.5 text-[#B0B0B0] hover:text-[#0A0A0A] transition-colors">
          <CloseIcon size={18} />
        </button>
        <div className="clear-both">
          <h1 className="text-xl font-bold text-[#0A0A0A] mb-5">{content.title}</h1>
          <div className="space-y-5">
            {page === 'faq' ? (
              (content as any).sections.map((item: any, i: number) => (
                <div key={i} className="pb-4 border-b border-[#F0F0F0] last:border-0">
                  <h3 className="text-[14px] font-semibold text-[#0A0A0A] mb-2">
                    <Highlight>{item.question}</Highlight>
                  </h3>
                  <p className="text-[13px] text-[#4B4B4B] leading-relaxed">{item.answer}</p>
                </div>
              ))
            ) : (
              (content as any).sections.map((item: any, i: number) => (
                <div key={i}>
                  <h3 className="text-[14px] font-semibold text-[#0A0A0A] mb-2">
                    <Highlight>{item.title}</Highlight>
                  </h3>
                  <p className="text-[13px] text-[#4B4B4B] leading-relaxed">{item.text}</p>
                </div>
              ))
            )}
          </div>
          <button onClick={onClose} className="mt-6 w-full py-2.5 bg-[#0A0A0A] text-white text-[13px] font-semibold rounded-xl hover:bg-[#1A1A1A] transition-all">
            Закрыть
          </button>
        </div>
      </div>
    </div>
  );
};

export default ContentPage;
