import React, { memo } from 'react';
import { ReactComponent as ArrowLeft } from '../../assets/arrow-left.svg';
import { ReactComponent as ArrowRight } from '../../assets/arrow-right.svg';

const PaginationButtons = ({ currentPage, totalPages, setCurrentPage }) => {
  const handlePrev = () => {
    setCurrentPage((p) => Math.max(1, p - 1));
  };

  const handleNext = () => {
    setCurrentPage((p) => Math.min(totalPages, p + 1));
  };

  return (
    <div className="pagination-controls">
      <button className="arrow-btn" onClick={handlePrev} disabled={currentPage === 1}>
        <ArrowLeft />
      </button>
      <span>Page {currentPage} of {totalPages}</span>
      <button
        className="arrow-btn"
        onClick={handleNext}
        disabled={currentPage === totalPages || totalPages === 0}
      >
        <ArrowRight />
      </button>
    </div>
  );
};

export default memo(PaginationButtons);