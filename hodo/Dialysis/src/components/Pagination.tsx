import React from 'react';
import { ChevronsLeft, ChevronLeft, ChevronRight, ChevronsRight } from 'lucide-react';
import '../styles/Pagination.css';


interface PaginationProps {
  page: number;
  totalPages: number;
  rowsPerPage: number;
  setPage: (page: number) => void;
  setRowsPerPage: (rows: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({
  page,
  totalPages,
  rowsPerPage,
  setPage,
  setRowsPerPage,
}) => {
  const handleChangeRows = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setRowsPerPage(Number(e.target.value));
    setPage(1);
  };

  const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <div className="pagination-container">
      <div className="pagination-left">
        <span id="span3">Rows per page:</span>
        <select value={rowsPerPage} onChange={handleChangeRows} className="pagination-select">
          {[5, 10, 20, 50].map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
        <span id="span4" className="pagination-page-label">
          Page {page} of {totalPages}
        </span>
      </div>

      <div className="pagination-buttons">
        <button type="button" onClick={() => setPage(1)} disabled={page === 1} title="First Page">
          <ChevronsLeft size={16} style={{ verticalAlign: 'middle' }} />
        </button>
        <button type="button" onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1} title="Previous Page">
          <ChevronLeft size={16} style={{ verticalAlign: 'middle' }} />
          
        </button>

        {pageNumbers.map((p) =>
          p === 1 || p === totalPages || Math.abs(p - page) <= 1 ? (
            <button
              type="button"
              key={p}
              onClick={() => setPage(p)}
              className={p === page ? 'active' : ''}
            >
              {p}
            </button>
          ) : (p === page - 2 || p === page + 2) && totalPages > 5 ? (
            <span key={p} className="pagination-dots">...</span>
          ) : null
        )}

{/* type="button" prevents default form submission; ensures this button only handles onClick */}
        <button type="button" onClick={() => setPage(Math.min(totalPages, page + 1))} disabled={page === totalPages} title="Next Page">
          <ChevronRight size={16} style={{ verticalAlign: 'middle' }} />
        </button>
        <button type="button" onClick={() => setPage(totalPages)} disabled={page === totalPages} title="Last Page">
          <ChevronsRight size={16} style={{ verticalAlign: 'middle' }} />
        </button>
      </div>
    </div>
  );
};

export default Pagination;