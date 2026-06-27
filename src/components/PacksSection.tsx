import React from 'react';
import { Pack } from '../store/useStore';
import { PackageIcon, DownloadIcon } from './Icons';

interface PacksSectionProps {
  packs: Pack[];
  onPremiumClick: () => void;
}

const LockIcon: React.FC<{ size?: number; className?: string }> = ({ size = 12, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0110 0v4" />
  </svg>
);

const PacksSection: React.FC<PacksSectionProps> = ({ packs, onPremiumClick }) => {
  if (packs.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="w-14 h-14 mx-auto mb-4 bg-[#F3F3F3] rounded-2xl flex items-center justify-center">
          <PackageIcon size={24} className="text-[#B0B0B0]" />
        </div>
        <h3 className="text-base font-semibold text-[#0A0A0A] mb-1">Паки скоро появятся</h3>
        <p className="text-[13px] text-[#B0B0B0]">Коллекции звуков будут доступны в ближайшее время</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-[22px] font-bold text-[#0A0A0A] mb-1 tracking-tight">Паки звуков</h2>
        <p className="text-[13px] text-[#B0B0B0] font-medium">{packs.length} паков доступно</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {packs.map((pack, i) => (
          <div
            key={pack.id}
            className="group bg-white border border-[#EBEBEB] rounded-2xl p-5 hover:border-[#D4D4D4] hover:shadow-[0_2px_12px_rgba(0,0,0,0.04)] transition-all opacity-0 animate-fade-in-up"
            style={{ animationDelay: `${i * 50}ms`, animationFillMode: 'forwards' }}
          >
            <div className="w-12 h-12 bg-[#F3F3F3] rounded-xl flex items-center justify-center mb-4 group-hover:bg-[#EBEBEB] transition-colors">
              <PackageIcon size={22} className="text-[#6B6B6B]" />
            </div>
            <div className="mb-3">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-[14px] font-semibold text-[#0A0A0A] truncate">{pack.title}</h3>
                {!pack.isFree && (
                  <span className="shrink-0 px-1.5 py-0.5 bg-gradient-to-r from-amber-400 to-orange-500 text-white text-[8px] font-bold uppercase tracking-[0.08em] rounded-[3px]">PRO</span>
                )}
              </div>
              <div className="text-[12px] text-[#999]">{pack.soundCount} звуков · {pack.category}</div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-[#C0C0C0]">{pack.downloads} скач.</span>
              {pack.isFree ? (
                <button className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-semibold rounded-lg bg-[#0A0A0A] text-white hover:bg-[#1A1A1A] transition-all">
                  <DownloadIcon size={11} />Скачать
                </button>
              ) : (
                <button onClick={onPremiumClick} className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-semibold rounded-lg bg-[#E5E5E5] text-[#999] hover:bg-[#D4D4D4] transition-all">
                  <LockIcon size={11} />Premium
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PacksSection;
