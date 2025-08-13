import React from 'react';
import './DateRangeSelector.css';

interface DateRangeSelectorProps {
  fromDate: string;
  toDate: string;
  onFromDateChange: (date: string) => void;
  onToDateChange: (date: string) => void;
  label?: string;
  className?: string;
  disabled?: boolean;
}

const DateRangeSelector: React.FC<DateRangeSelectorProps> = ({
  fromDate,
  toDate,
  onFromDateChange,
  onToDateChange,
  label = "Date Range",
  className = "",
  disabled = false
}) => {
  const handleFromDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newFromDate = e.target.value;
    onFromDateChange(newFromDate);

    // If from date is after to date, update to date to match from date
    if (toDate && newFromDate > toDate) {
      onToDateChange(newFromDate);
    }
  };

  const handleToDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newToDate = e.target.value;
    onToDateChange(newToDate);

    // If to date is before from date, update from date to match to date
    if (fromDate && newToDate < fromDate) {
      onFromDateChange(newToDate);
    }
  };

  return (
    <div className={`date-range-selector ${className}`}>
      <label className="form-label">
        {label}
        <span className="required-indicator">&nbsp;</span>
      </label>
      <div className="date-range-inputs">
        <div className="date-input-group">
          <label className="date-input-label">From</label>
          <input
            type="date"
            value={fromDate}
            onChange={handleFromDateChange}
            disabled={disabled}
            className="form-control date-input"
            max={toDate || undefined}
          />
        </div>
        <div className="date-range-separator">__</div>
        <div className="date-input-group">
          <label className="date-input-label">To</label>
          <input
            type="date"
            value={toDate}
            onChange={handleToDateChange}
            disabled={disabled}
            className="form-control date-input"
            min={fromDate || undefined}
          />
        </div>
      </div>
    </div>
  );
};

export default DateRangeSelector;