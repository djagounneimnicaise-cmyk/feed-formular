import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';

export type Currency = 'XOF' | 'USD' | 'EUR';

type CurrencyDef = {
  code: Currency;
  symbol: string;
  label: string;
  labelEn: string;
  rateFromXOF: number;
};

export const CURRENCIES: CurrencyDef[] = [
  { code: 'XOF', symbol: 'XOF', label: 'XOF - francs CFA', labelEn: 'XOF - CFA francs', rateFromXOF: 1 },
  { code: 'USD', symbol: '$', label: '$ - Dollar US', labelEn: '$ - US Dollar', rateFromXOF: 1 / 600 },
  { code: 'EUR', symbol: '€', label: '€ - Euro', labelEn: '€ - Euro', rateFromXOF: 1 / 655.957 },
];

const CURRENCY_MAP = Object.fromEntries(CURRENCIES.map((c) => [c.code, c])) as Record<Currency, CurrencyDef>;

type CurrencyContextValue = {
  currency: Currency;
  setCurrency: (c: Currency) => void;
  symbol: string;
  convertFromXOF: (xof: number) => number;
  convertToXOF: (value: number) => number;
  formatPrice: (xof: number, decimals?: number) => string;
};

const CurrencyContext = createContext<CurrencyContextValue | undefined>(undefined);

const CURRENCY_KEY = 'feed_formular_currency';

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrencyState] = useState<Currency>(() => {
    try {
      const saved = localStorage.getItem(CURRENCY_KEY) as Currency | null;
      if (saved && (CURRENCY_MAP as Record<string, CurrencyDef>)[saved]) return saved;
    } catch { /* ignore */ }
    return 'XOF';
  });

  useEffect(() => {
    try {
      localStorage.setItem(CURRENCY_KEY, currency);
    } catch { /* ignore */ }
  }, [currency]);

  const setCurrency = useCallback((c: Currency) => {
    setCurrencyState(c);
  }, []);

  const convertFromXOF = useCallback((xof: number) => {
    return xof * CURRENCY_MAP[currency].rateFromXOF;
  }, [currency]);

  const convertToXOF = useCallback((value: number) => {
    return value / CURRENCY_MAP[currency].rateFromXOF;
  }, [currency]);

  const symbol = CURRENCY_MAP[currency].symbol;

  const formatPrice = useCallback((xof: number, decimals = 0) => {
    const def = CURRENCY_MAP[currency];
    const converted = xof * def.rateFromXOF;
    const formatted = formatNumber(converted, decimals);
    return `${formatted} ${def.symbol}`;
  }, [currency]);

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, symbol, convertFromXOF, convertToXOF, formatPrice }}>
      {children}
    </CurrencyContext.Provider>
  );
}

function formatNumber(value: number, decimals = 2): string {
  if (!isFinite(value)) return '0';
  return value.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

export function useCurrency() {
  const ctx = useContext(CurrencyContext);
  if (!ctx) throw new Error('useCurrency must be used within CurrencyProvider');
  return ctx;
}

export { CURRENCY_MAP };
