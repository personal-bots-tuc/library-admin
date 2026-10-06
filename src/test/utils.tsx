import React from 'react';
import { render } from '@testing-library/react';
import type { RenderOptions } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { ToastProvider } from '../components/Toast/useToast';
import { SchoolProvider } from '../hooks/useSchool';
import { AuthProvider } from '../hooks/useAuth';

interface WrapperProps {
  children: React.ReactNode;
}

const AdminProviders: React.FC<WrapperProps> = ({ children }) => (
  <BrowserRouter>
    <AuthProvider>
      <SchoolProvider fallbackName="Test">
        <ToastProvider>{children}</ToastProvider>
      </SchoolProvider>
    </AuthProvider>
  </BrowserRouter>
);

export const renderWithAdminProviders = (
  ui: React.ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AdminProviders, ...options });

export * from '@testing-library/react';
