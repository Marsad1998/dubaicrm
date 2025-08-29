import React from 'react';
import { DataTable, DataTableSortStatus } from 'mantine-datatable';
import Select from 'react-select';

interface Column {
  accessor: string;
  // title: string;
  title: string | React.ReactNode;
  sortable?: boolean;
  render?: (record: any) => JSX.Element;
  width?: string | number;
}

interface SelectFilter {
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  placeholder?: string;
}

interface TableProps {
  columns: Column[];
  rows: any[];
  title: string;
  totalRecords: number;
  currentPage: number;
  recordsPerPage: number;
  onPageChange: (page: number) => void;
  onRecordsPerPageChange: (pageSize: number) => void;
  onSortChange?: (sortStatus: DataTableSortStatus) => void;
  onSearchChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  sortStatus?: DataTableSortStatus;
  isLoading?: boolean;
  height?: string | number;
  minHeight?: string | number;
  searchValue?: string;
  noRecordsText :string
  idAccessor?: string;
  selectFilter?: SelectFilter;
}

const Table: React.FC<TableProps> = ({ 
  columns, 
  rows, 
  title, 
  totalRecords, 
  currentPage, 
  recordsPerPage, 
  onPageChange, 
  onRecordsPerPageChange,
  onSortChange,
  onSearchChange,
  sortStatus = { columnAccessor: 'id', direction: 'desc' },
  isLoading = false,
  height,
  minHeight = 200,
  noRecordsText = 'No records found',
  searchValue = '',
  idAccessor,
  selectFilter // New select filter prop
}) => {
  const PAGE_SIZES = [10, 20, 30, 50, 100];

  return (
    <div className="panel overflow-visible">
      <div className="flex md:items-center md:flex-row flex-col mb-5 gap-5">
        <h5 className="font-semibold text-lg dark:text-white-light">
          {title}
        </h5>
        {/* Select input container - positioned in the middle */}
        {selectFilter && (
          <div className="flex-1 flex justify-center items-center gap-2 z-50">
            <Select
              name="client_user_status"
              placeholder="Select Agent to Filter"
              options={selectFilter.options}
              value={selectFilter.options.find(option => option.value === selectFilter.value)}
              onChange={(selected) => {
                // Handle the case where selected might be null
                if (selected) {
                  selectFilter.onChange(selected.value);
                } else {
                  // Pass an empty string or whatever default your filter expects
                  selectFilter.onChange(""); 
                }
              }}
              isClearable
              isSearchable
              className="w-64"
            />
          </div>
        )}
        {onSearchChange && (
          <div className="ltr:ml-auto rtl:mr-auto">
            <input 
              type="text" 
              className="form-input w-auto" 
              placeholder="Search..." 
              value={searchValue} 
              onChange={onSearchChange} 
            />
          </div>
        )}
      </div>
      <div className="datatablesz-10">
        <DataTable 
          className="whitespace-nowrap table-hover" 
          records={rows} 
          columns={columns} 
          highlightOnHover
          totalRecords={totalRecords}
          recordsPerPage={recordsPerPage}
          page={currentPage}
          onPageChange={onPageChange}
          recordsPerPageOptions={PAGE_SIZES}
          onRecordsPerPageChange={onRecordsPerPageChange}
          sortStatus={sortStatus}
          onSortStatusChange={onSortChange}
          minHeight={minHeight}
          height={height}
          paginationText={({ from, to, totalRecords }) => `Showing ${from} to ${to} of ${totalRecords} entries`}
          fetching={isLoading}
          loaderVariant="dots"
          noRecordsText={noRecordsText}
          idAccessor={idAccessor}
        />
      </div>
    </div>
  );
};

export default Table;
