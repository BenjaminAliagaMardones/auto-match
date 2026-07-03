import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

vi.mock('../../../services/apiClient', () => ({
  WS_BASE_URL: 'ws://localhost:8080/api/v1',
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

// Sin este mock el hook abriría un WebSocket real (flaky en CI y
// dependiente de que el backend local esté corriendo).
vi.mock('react-use-websocket', () => ({
  default: vi.fn(() => ({ sendMessage: vi.fn() })),
}));

import { apiClient } from '../../../services/apiClient';
import UnifiedChat from './UnifiedChat';

const HISTORY = {
  items: [
    {
      id: 'm1',
      match_id: 'match-1',
      sender_id: 'user-yo',
      body: 'hola vendedor',
      created_at: '2026-07-03T12:00:00Z',
    },
    {
      id: 'm2',
      match_id: 'match-1',
      sender_id: 'user-otro',
      body: 'hola comprador',
      created_at: '2026-07-03T12:01:00Z',
    },
  ],
  count: 2,
};

const renderChat = () => {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={qc}>
      <MemoryRouter initialEntries={['/app/chat/match-1']}>
        <Routes>
          <Route path="/app/chat/:id" element={<UnifiedChat />} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>
  );
};

beforeEach(() => {
  vi.clearAllMocks();
  sessionStorage.setItem('auth-token', 'fake-token');
  apiClient.get.mockReturnValue({ json: vi.fn().mockResolvedValue(HISTORY) });
});

describe('UnifiedChat', () => {
  it('renderiza sin crashear (regresión: pantalla en blanco por interop CJS)', () => {
    renderChat();
    expect(screen.getByText('Chat')).toBeInTheDocument();
  });

  it('carga el historial desde { items } con campos snake_case', async () => {
    renderChat();
    await waitFor(() => expect(screen.getByText('hola vendedor')).toBeInTheDocument());
    expect(screen.getByText('hola comprador')).toBeInTheDocument();
    expect(apiClient.get).toHaveBeenCalledWith('matches/match-1/messages');
  });
});
