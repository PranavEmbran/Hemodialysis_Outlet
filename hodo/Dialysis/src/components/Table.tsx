import React, { useState } from 'react';
import '../styles/Table.css';
import Pagination from './Pagination';


interface Column {
  key: string;
  header: string;
  render?: (row: Record<string, any>) => React.ReactNode;

}

interface TableProps {
  columns: Column[];
  data: Record<string, any>[];
  actions?: (row: Record<string, any>) => React.ReactNode;
  // Add these props for controlled pagination and selection
  page?: number;
  rowsPerPage?: number;
  setPage?: (page: number) => void;
  setRowsPerPage?: (rows: number) => void;
  getRowKey?: (row: Record<string, any>) => string;
  selectedRowKeys?: string[];
}

const Table: React.FC<TableProps> = ({
  columns,
  data,
  actions,
  page: controlledPage,
  rowsPerPage: controlledRowsPerPage,
  setPage: controlledSetPage,
  setRowsPerPage: controlledSetRowsPerPage,
  getRowKey,
  selectedRowKeys,
}) => {
  // Use controlled or internal state for pagination
  const [internalPage, internalSetPage] = useState(1);
  const [internalRowsPerPage, internalSetRowsPerPage] = useState(10);

  const page = controlledPage ?? internalPage;
  const rowsPerPage = controlledRowsPerPage ?? internalRowsPerPage;
  const setPage = controlledSetPage ?? internalSetPage;
  const setRowsPerPage = controlledSetRowsPerPage ?? internalSetRowsPerPage;

  const totalPages = Math.ceil(data.length / rowsPerPage);

  // Paginate data
  const paginatedData = data.slice((page - 1) * rowsPerPage, page * rowsPerPage);

  return (
    <>
      <div className="table-container">
        <table className="custom-table">
          <thead>
            <tr>
              {columns.map((col) => (
                <th key={col.key}>{col.header}</th>
              ))}
              {actions && <th>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {paginatedData.length === 0 ? (
              <tr>
                <td colSpan={columns.length + (actions ? 2 : 1)} style={{ textAlign: 'center' }}>No data found.</td>
              </tr>
            ) : (
              paginatedData.map((row) => (
                <tr
                  key={getRowKey ? getRowKey(row) : row.id}
                  style={row._rowStyle || {}}
                >
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      data-label={col.header}
                    >
                      {typeof row[col.key] === 'number'
                        ? row[col.key].toString()
                        : row[col.key]}
                    </td>
                  ))}
                  {actions && (
                    <td data-label="Actions">
                      {actions(row)}
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <div>
        <Pagination
          page={page}
          totalPages={totalPages}
          rowsPerPage={rowsPerPage}
          setPage={setPage}
          setRowsPerPage={setRowsPerPage}
        />
      </div>
    </>
  );
};

export default Table;