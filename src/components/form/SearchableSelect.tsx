"use client";

import React from "react";
import Select, { StylesConfig } from "react-select";

interface Option {
  value: string;
  label: string;
}

interface SearchableSelectProps {
  options: Option[];
  placeholder?: string;
  label?: string;
  onChange: (value: string) => void;
  value?: string;
  id?: string;
  required?: boolean;
  className?: string;
}

const SearchableSelect: React.FC<SearchableSelectProps> = ({
  options,
  placeholder = "Search or select...",
  label,
  onChange,
  value,
  id,
  required,
  className = "",
}) => {
  const selectedOption = options.find((opt) => opt.value === value) || null;

  const customStyles: StylesConfig<Option, false> = {
    control: (base, state) => ({
      ...base,
      height: "44px",
      borderRadius: "8px",
      borderWidth: "1px",
      borderColor: state.isFocused ? "#3B82F6" : "#D1D5DB",
      backgroundColor: "transparent",
      boxShadow: state.isFocused ? "0 0 0 3px rgba(59, 130, 246, 0.1)" : "none",
      "&:hover": {
        borderColor: "#3B82F6",
      },
    }),
    singleValue: (base) => ({
      ...base,
      color: "inherit",
      fontSize: "0.875rem",
    }),
    placeholder: (base) => ({
      ...base,
      color: "#9CA3AF",
      fontSize: "0.875rem",
    }),
    input: (base) => ({
      ...base,
      color: "inherit",
    }),
    menu: (base) => ({
      ...base,
      backgroundColor: document.documentElement.classList.contains("dark") ? "#1a222c" : "#fff",
      borderRadius: "8px",
      boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
      zIndex: 100,
    }),
    option: (base, state) => ({
      ...base,
      backgroundColor: state.isFocused
        ? "#3B82F6"
        : "transparent",
      color: state.isFocused ? "#fff" : "inherit",
      cursor: "pointer",
      fontSize: "0.875rem",
      "&:active": {
        backgroundColor: "#2563EB",
      },
    }),
  };

  return (
    <div className={`w-full space-y-1.5 flex flex-col ${className}`}>
      {label && (
        <label
          htmlFor={id}
          className="text-sm font-medium text-gray-700 dark:text-gray-300 text-start"
        >
          {label} {required && <span className="text-error-500">*</span>}
        </label>
      )}
      <Select
        id={id}
        instanceId={id}
        options={options}
        placeholder={placeholder}
        value={selectedOption}
        onChange={(val: any) => onChange(val?.value || "")}
        styles={customStyles}
        classNamePrefix="react-select"
        required={required}
        isSearchable
      />
    </div>
  );
};

export default SearchableSelect;
