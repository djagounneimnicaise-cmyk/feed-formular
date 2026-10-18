import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import { AuthProvider } from '@/lib/auth';
import { CurrencyProvider } from '@/lib/currency';
import { SubscriptionProvider } from '@/lib/subscription';
import { I18nProvider } from '@/lib/i18n';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <I18nProvider>
      <CurrencyProvider>
        <AuthProvider>
          <SubscriptionProvider>
            <App />
          </SubscriptionProvider>
        </AuthProvider>
      </CurrencyProvider>
    </I18nProvider>
  </StrictMode>
);
