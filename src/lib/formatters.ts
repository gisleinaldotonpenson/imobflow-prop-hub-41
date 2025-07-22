// Utilitários para formatação de valores

export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
};

export const formatNumber = (value: number): string => {
  return new Intl.NumberFormat("pt-BR").format(value);
};

// Formatar número com pontos para milhares
export const formatNumberWithDots = (value: string): string => {
  // Remove tudo que não é dígito
  const numbers = value.replace(/\D/g, "");
  
  // Adiciona pontos para separar milhares
  return numbers.replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1.");
};

// Converter string formatada para número
export const parseFormattedNumber = (value: string): number => {
  return parseFloat(value.replace(/\./g, "").replace(/,/g, ".")) || 0;
};

// Formatação de telefone brasileiro
export const formatPhone = (value: string): string => {
  const digits = value.replace(/\D/g, "");
  
  if (digits.length <= 11) {
    return digits.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
  }
  return value;
};

// Formatação de área (m²)
export const formatArea = (value: number): string => {
  return `${formatNumber(value)}m²`;
};