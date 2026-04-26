import React from "react";

interface Option {
  value: string;
  label: string;
}

interface SelectProps {
  options: Option[];
  placeholder?: string;
  label?: string; // Natively supported label
  onChange: (value: string) => void;
  className?: string;
  defaultValue?: string;
  value?: string;
  id?: string;
  required?: boolean;
}

const Select: React.FC<SelectProps> = ({
  options,
  placeholder = "Select an option",
  label,
  onChange,
  className = "",
  value = "",
  id,
  required,
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onChange(e.target.value);
  };

  return (
    <div className="w-full space-y-1.5 flex flex-col">
      {label && (
        <label
          htmlFor={id}
          className="text-sm font-medium text-gray-700 dark:text-gray-300 text-start"
        >
          {label} {required && <span className="text-error-500">*</span>}
        </label>
      )}
      <div className="relative">
        <select
          id={id}
          name={id}
          className={`h-11 w-full appearance-none rounded-lg border border-gray-300 px-4 py-2.5 pr-11 text-sm shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800 ${
            value ? "text-gray-800 dark:text-white/90" : "text-gray-400"
          } ${className}`}
          value={value}
          onChange={handleChange}
          required={required}
        >
          <option value="" disabled className="text-gray-700 dark:bg-gray-900 dark:text-gray-400">
            {placeholder}
          </option>
          {options.map((option) => (
            <option key={option.value} value={option.value} className="text-gray-700 dark:bg-gray-900 dark:text-gray-400">
              {option.label}
            </option>
          ))}
        </select>
        
        {/* Custom Chevron for select */}
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
    </div>
  );
};

export default Select;
