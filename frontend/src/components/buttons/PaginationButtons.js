import React, { memo, useState, useEffect } from 'react';
import { ReactComponent as ArrowLeft } from '../../assets/arrow-left.svg';
import { ReactComponent as ArrowRight } from '../../assets/arrow-right.svg';

const PaginationButtons = ({ currentPage, totalPages, setCurrentPage }) => {
  const [inputValue, setInputValue] = useState(currentPage.toString());

  useEffect(() => {
    setInputValue(currentPage.toString());
  }, [currentPage]);

  const handlePrev = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleNext = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const handleChange = (e) => {
    setInputValue(e.target.value);
  };

  const handleBlur = () => {
    const pageNum = Number(inputValue);
    if (!isNaN(pageNum) && pageNum >= 1 && pageNum <= totalPages) {
      setCurrentPage(pageNum);
    } else {
      setInputValue(currentPage.toString());
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.target.blur();
    }
  };

  return (
    <div className="pagination-controls">
      <button className="arrow-btn" onClick={handlePrev} disabled={currentPage === 1}>
        <ArrowLeft />
      </button>

      <span>
        <input className="pagination-page"
          type="number"
          value={inputValue}
          onChange={handleChange}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          min="1"
          max={totalPages}
        />
        <span>of {totalPages}</span>
      </span>

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