import React, { forwardRef } from "react";
import { Input } from "@/components/ui/input";
import { formatNumberWithDots, parseFormattedNumber } from "@/lib/formatters";

export interface CurrencyInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value'> {
  value?: number;
  onChange?: (value: number) => void;
  prefix?: string;
  suffix?: string;
}

const CurrencyInput = forwardRef<HTMLInputElement, CurrencyInputProps>(
  ({ value = 0, onChange, prefix = "R$ ", suffix = "", className, ...props }, ref) => {
    const [displayValue, setDisplayValue] = React.useState(() => {
      return value > 0 ? formatNumberWithDots(value.toString()) : "";
    });

    React.useEffect(() => {
      if (value === 0) {
        setDisplayValue("");
      } else {
        setDisplayValue(formatNumberWithDots(value.toString()));
      }
    }, [value]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const inputValue = e.target.value;
      
      // Remove prefix, suffix e caracteres não numéricos
      const cleanValue = inputValue
        .replace(prefix, "")
        .replace(suffix, "")
        .replace(/\D/g, "");

      // Formatar para exibição
      const formatted = formatNumberWithDots(cleanValue);
      setDisplayValue(formatted);

      // Converter para número e chamar onChange
      const numericValue = parseFormattedNumber(formatted);
      onChange?.(numericValue);
    };

    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
      // Selecionar todo o texto ao focar
      e.target.select();
      props.onFocus?.(e);
    };

    const finalDisplayValue = displayValue ? `${prefix}${displayValue}${suffix}` : "";

    return (
      <Input
        {...props}
        ref={ref}
        value={finalDisplayValue}
        onChange={handleInputChange}
        onFocus={handleFocus}
        className={className}
        placeholder={`${prefix}0${suffix}`}
      />
    );
  }
);

CurrencyInput.displayName = "CurrencyInput";

export { CurrencyInput };