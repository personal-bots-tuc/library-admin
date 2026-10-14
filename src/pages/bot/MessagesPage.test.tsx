import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, act } from '@testing-library/react';
import { QueryClientProvider } from '@tanstack/react-query';
import MessagesPage from './MessagesPage';
import { createTestQueryClient } from '../../test/utils';
import * as botApi from '../../api/bot';
import { __resetSyncGateForTests } from '../../hooks/useSyncGate';

vi.mock('../../api/bot', () => ({
  listConversations: vi.fn(),
  getConversation: vi.fn(),
  pauseConversation: vi.fn(),
  resumeConversation: vi.fn(),
  replyConversation: vi.fn(),
}));

const mockList = vi.mocked(botApi.listConversations);

const fakeConversation = {
  id: 'conv-1',
  sessionId: 'session-1',
  status: 'bot' as const,
  lastMessage: 'hola',
  lastMessageAt: new Date().toISOString(),
  messageCount: 2,
};

function setVisibilityState(value: 'visible' | 'hidden') {
  Object.defineProperty(document, 'visibilityState', { value, configurable: true });
}

function renderPage() {
  return render(
    <QueryClientProvider client={createTestQueryClient()}>
      <MessagesPage />
    </QueryClientProvider>
  );
}

describe('MessagesPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setVisibilityState('visible');
    __resetSyncGateForTests();
    mockList.mockResolvedValue({ items: [fakeConversation], total: 1, page: 1, limit: 30 });
  });

  afterEach(() => {
    vi.useRealTimers();
    setVisibilityState('visible');
    __resetSyncGateForTests();
  });

  it('carga y renderiza la lista de conversaciones', async () => {
    renderPage();

    await waitFor(() => expect(screen.getByText('hola')).toBeInTheDocument());
    expect(mockList).toHaveBeenCalledTimes(1);
  });

  it('NO pollea cuando la pestaña está oculta (App Sleep safe)', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    renderPage();

    await waitFor(() => expect(mockList).toHaveBeenCalledTimes(1));

    setVisibilityState('hidden');
    act(() => {
      document.dispatchEvent(new Event('visibilitychange'));
    });

    act(() => {
      vi.advanceTimersByTime(60_000);
    });

    // 60s oculta → cero requests adicionales (antes: ~7 por minuto)
    expect(mockList).toHaveBeenCalledTimes(1);
  });
});
