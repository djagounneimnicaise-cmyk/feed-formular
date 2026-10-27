const KKIAPEAY_PUBLIC_KEY = 'b065a540c3e311f19576abea11f03cad';

type KkiapayWidgetOptions = {
  amount: number;
  key: string;
  callback?: string;
  data?: Record<string, unknown>;
  name?: string;
  email?: string;
  partnerId?: string;
  theme?: string;
  position?: 'left' | 'right' | 'center';
  countries?: string[];
  phone?: string;
  sandbox?: boolean;
  paymentmethod?: 'momo' | 'card' | 'wallet';
};

type KkiapaySuccessResponse = {
  transactionId?: string;
  [key: string]: unknown;
};

type KkiapayGlobal = {
  openKkiapayWidget?: (options: KkiapayWidgetOptions) => void;
  addSuccessListener?: (listener: (response: KkiapaySuccessResponse) => void) => void;
  addFailedListener?: (listener: (response: unknown) => void) => void;
  addErrorListener?: (listener: (response: unknown) => void) => void;
};

function kkiapay(): KkiapayGlobal {
  return window as unknown as KkiapayGlobal;
}

export function isKkiapayReady(): boolean {
  return typeof kkiapay().openKkiapayWidget === 'function';
}

export function openKkiapayWidget(options: {
  amount: number;
  name?: string;
  email?: string;
  phone?: string;
  partnerId?: string;
}): void {
  const fn = kkiapay().openKkiapayWidget;
  if (!fn) throw new Error('KKiaPay widget not loaded');
  fn({
    amount: options.amount,
    key: KKIAPEAY_PUBLIC_KEY,
    theme: '#059669',
    position: 'center',
    countries: ['BJ', 'CI', 'TG', 'SN', 'NE'],
    name: options.name,
    email: options.email,
    phone: options.phone,
    partnerId: options.partnerId,
    sandbox: false,
  });
}

export function onKkiapaySuccess(listener: (response: KkiapaySuccessResponse) => void): void {
  kkiapay().addSuccessListener?.(listener);
}

export function onKkiapayFailed(listener: (response: unknown) => void): void {
  kkiapay().addFailedListener?.(listener);
}

export function onKkiapayError(listener: (response: unknown) => void): void {
  kkiapay().addErrorListener?.(listener);
}
