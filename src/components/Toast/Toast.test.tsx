import { describe, it } from 'vitest';
import { renderWithAdminProviders } from '../../test/utils';
import { ToastProvider, useToast } from './useToast';

const TestComponent = () => {
  const { success, error } = useToast();
  return (
    <div>
      <button onClick={() => success('Operación exitosa')} data-testid="show-success">
        Show Success
      </button>
      <button onClick={() => error('Algo salió mal')} data-testid="show-error">
        Show Error
      </button>
    </div>
  );
};

describe('Toast', () => {
  it('shows success toast', async () => {
    const { getByTestId, findByText } = renderWithAdminProviders(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    );
    getByTestId('show-success').click();
    await findByText('Operación exitosa');
  });

  it('shows error toast', async () => {
    const { getByTestId, findByText } = renderWithAdminProviders(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    );
    getByTestId('show-error').click();
    await findByText('Algo salió mal');
  });
});
