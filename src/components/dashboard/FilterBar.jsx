import React from "react";
import DatePickerField from "../common/DatePickerField";
import StyledDropdown from "../common/StyledDropdown";

const FilterBar = ({ filters, onChange, storeOptions }) => (
  <div className="rounded-[24px] border border-neutral-100 bg-white p-6 shadow-sm">
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
      <label className="flex flex-col gap-2 group">
        <span className="text-[10px] font-black uppercase tracking-widest text-neutral-400 ml-1 group-focus-within:text-primary transition-colors">
          Select Store
        </span>
        <StyledDropdown
          value={filters.storeId}
          onChange={(event) => onChange({ storeId: event.target.value })}
          triggerClassName="border-neutral-200 bg-neutral-50 !text-neutral-700 !font-bold"
          placeholder="Select Store"
        >
          {storeOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </StyledDropdown>
      </label>
      <DatePickerField
        label="From Period"
        value={filters.from}
        onChange={(val) => onChange({ from: val })}
        wrapperClassName="group"
      />
      <DatePickerField
        label="To Period"
        value={filters.to}
        onChange={(val) => onChange({ to: val })}
        wrapperClassName="group"
      />
      <div className="flex items-end">
        <div className="w-full rounded-xl bg-neutral-50 px-4 py-2.5 text-[10px] font-black uppercase tracking-widest text-neutral-400 border border-dotted border-neutral-200 text-center">
          Data Aggregated Across Stores
        </div>
      </div>
    </div>
  </div>
);

export default FilterBar;
