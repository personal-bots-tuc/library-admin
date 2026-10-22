import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import './index.css';
import { AuthProvider } from './hooks/useAuth';
import { SchoolProvider } from './hooks/useSchool';
import { ToastProvider } from './components/Toast/useToast';
import { QueryProvider } from './providers/QueryProvider';
import { ConnectivityBadge } from './components/ConnectivityBadge';
import { PwaUpdateBanner } from './components/PwaUpdateBanner';
import { registerPwa } from './lib/pwa';
import App from './App';

registerPwa();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <QueryProvider>
        <SchoolProvider fallbackName="Panel de Control">
          <ToastProvider>
            <BrowserRouter>
              <App />
              <ConnectivityBadge />
              <PwaUpdateBanner />
            </BrowserRouter>
          </ToastProvider>
        </SchoolProvider>
      </QueryProvider>
    </AuthProvider>
  </StrictMode>
);
