import React from 'react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;
  
  const getVisiblePages = (): (number | '...')[] => {
    const pages: (number | '...')[] = [];
    const max = 5;
    
    if (totalPages <= max) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
      return pages;
    }
    
    if (currentPage <= 3) {
      pages.push(1, 2, 3, 4, '...', totalPages);
    } else if (currentPage >= totalPages - 2) {
      pages.push(1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
    } else {
      pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
    }
    return pages;
  };
  
  const visiblePages = getVisiblePages();
  
  return (
    <div className="flex items-center justify-center gap-1.5 mt-8 py-3 bg-[#F8F8F8] rounded-xl">
      <button
        onClick={() => onPageChange(Math.max(1, currentPage - 1))}
        disabled={currentPage === 1}
        className="px-3 py-1.5 text-[12px] font-semibold text-[#6B6B6B] hover:text-[#0A0A0A] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
      >
        ←
      </button>
      {visiblePages.map((p, i) => (
        p === '...' ? (
          <span key={`dot-${i}`} className="px-2 text-[#C0C0C0]">...</span>
        ) : (
          <button
            key={p}
            onClick={() => onPageChange(p)}
            className={`min-w-[36px] h-9 px-2 text-[12px] font-bold rounded-lg transition-all ${
              p === currentPage
                ? 'bg-[#0A0A0A] text-white'
                : 'text-[#6B6B6B] hover:bg-white hover:text-[#0A0A0A]'
            }`}
          >
            {p}
          </button>
        )
      ))}
      <button
        onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
        disabled={currentPage === totalPages}
        className="px-3 py-1.5 text-[12px] font-semibold text-[#6B6B6B] hover:text-[#0A0A0A] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
      >
        →
      </button>
    </div>
  );
};

export default Pagination;
