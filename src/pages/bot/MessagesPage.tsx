import { useCallback, useEffect, useRef, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  listConversations,
  getConversation,
  pauseConversation,
  resumeConversation,
  replyConversation,
  type ConversationSummary,
  type ConversationDetail,
} from '../../api/bot';
import { useSyncGate } from '../../hooks/useSyncGate';

const POLL_BASE_MS = 8000;
const POLL_MAX_MS = 60000;
/** Thread abierto: poll base mientras la compuerta esté abierta. */
const THREAD_POLL_MS = 8000;

const CONVERSATIONS_KEY = ['bot', 'conversations'] as const;

type ConversationStatus = 'bot' | 'human';
type ConversationRole = 'user' | 'assistant' | 'human';

interface StatusBadgeProps {
  status: ConversationStatus;
}

const StatusBadge = ({ status }: StatusBadgeProps) =>
  status === 'human' ? (
    <span className="px-2 py-1 text-[10px] font-bold uppercase rounded bg-amber-100 text-amber-700 tracking-wider">
      ✋ Intervenida
    </span>
  ) : (
    <span className="px-2 py-1 text-[10px] font-bold uppercase rounded bg-green-100 text-green-700 tracking-wider">
      🤖 Bot
    </span>
  );

const timeAgo = (iso: string): string => {
  const diff = Date.now() - new Date(iso).getTime();
  const min = Math.floor(diff / 60000);
  if (min < 1) return 'ahora';
  if (min < 60) return `hace ${min} min`;
  const h = Math.floor(min / 60);
  if (h < 24) return `hace ${h} h`;
  return `hace ${Math.floor(h / 24)} d`;
};

const formatTime = (iso: string): string =>
  new Date(iso).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });

const ROLE_STYLES: Record<ConversationRole, string> = {
  user: 'bg-neutral-100 text-neutral-800 rounded-xl rounded-tl-sm',
  assistant: 'bg-blue-600 text-white rounded-xl rounded-tr-sm',
  human: 'bg-amber-500 text-white rounded-xl rounded-tr-sm',
};

const ROLE_LABEL: Record<ConversationRole, string> = {
  user: 'Cliente',
  assistant: 'Bot',
  human: 'Vendedor',
};

interface ConversationListProps {
  conversations: ConversationSummary[];
  loading: boolean;
  filter: 'all' | 'bot' | 'human';
  selectedId: string | null;
  onFilterChange: (filter: 'all' | 'bot' | 'human') => void;
  onOpen: (id: string) => void;
}

const ConversationList = ({
  conversations,
  loading,
  filter,
  selectedId,
  onFilterChange,
  onOpen,
}: ConversationListProps) => (
  <aside className="bg-white border border-neutral-200 rounded-xl overflow-hidden shadow-sm flex flex-col h-full min-h-0">
    <div className="flex gap-1 p-3 border-b border-neutral-200 bg-neutral-50 shrink-0">
      {(['all', 'bot', 'human'] as const).map(f => (
        <button
          key={f}
          type="button"
          onClick={() => onFilterChange(f)}
          className={`flex-1 px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
            filter === f
              ? 'bg-white text-neutral-900 shadow-sm'
              : 'text-neutral-500 hover:text-neutral-700'
          }`}
        >
          {f === 'all' ? 'Todas' : f === 'bot' ? '🤖 Bot' : '✋ Intervenidas'}
        </button>
      ))}
    </div>
    <div className="overflow-y-auto flex-1 min-h-0">
      {loading ? (
        <div className="p-6 space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-16 bg-neutral-100 rounded-lg animate-pulse" />
          ))}
        </div>
      ) : conversations.length === 0 ? (
        <p className="p-6 text-sm text-neutral-400 text-center">
          Todavía no hay conversaciones{filter !== 'all' ? ' con ese filtro' : ''}.
        </p>
      ) : (
        conversations.map(c => (
          <button
            key={c.id}
            type="button"
            onClick={() => onOpen(c.id)}
            className={`w-full text-left px-4 py-3 border-b border-neutral-100 transition-colors ${
              selectedId === c.id ? 'bg-blue-50' : 'hover:bg-neutral-50'
            }`}
          >
            <div className="flex items-center justify-between gap-2 mb-1">
              <StatusBadge status={c.status} />
              <span className="text-[11px] text-neutral-400">{timeAgo(c.lastMessageAt)}</span>
            </div>
            <p className="text-sm text-neutral-700 line-clamp-2">{c.lastMessage}</p>
            <p className="text-[11px] text-neutral-400 mt-1">{c.messageCount} mensajes</p>
          </button>
        ))
      )}
    </div>
  </aside>
);

interface ConversationThreadProps {
  conversation: ConversationDetail;
  onBack: () => void;
  onPause: () => void;
  onResume: () => void;
  onReply: (message: string) => Promise<void>;
  threadRef: React.RefObject<HTMLDivElement | null>;
}

const ConversationThread = ({
  conversation,
  onBack,
  onPause,
  onResume,
  onReply,
  threadRef,
}: ConversationThreadProps) => {
  const [replyText, setReplyText] = useState('');
  const [sending, setSending] = useState(false);

  const handleReply = async () => {
    if (!replyText.trim() || sending) return;
    setSending(true);
    try {
      await onReply(replyText.trim());
      setReplyText('');
    } finally {
      setSending(false);
    }
  };

  return (
    <section className="bg-white border border-neutral-200 rounded-xl shadow-sm flex flex-col h-full min-h-0">
      <header className="flex items-center gap-3 px-5 py-4 border-b border-neutral-200 shrink-0">
        {/* Mobile: volver a la lista */}
        <button
          type="button"
          onClick={onBack}
          className="lg:hidden p-1.5 -ml-1.5 rounded-lg text-neutral-500 hover:bg-neutral-100"
          aria-label="Volver a la lista"
        >
          <span className="material-icons text-[20px]">arrow_back</span>
        </button>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-neutral-900 truncate">
            Sesión {conversation.sessionId.slice(0, 16)}…
          </p>
          <div className="mt-1">
            <StatusBadge status={conversation.status} />
          </div>
        </div>
        <div className="ml-auto shrink-0">
          {conversation.status === 'bot' ? (
            <button
              type="button"
              onClick={onPause}
              className="px-4 py-2 text-sm font-semibold text-white bg-amber-500 rounded-lg hover:bg-amber-600 transition-colors"
            >
              ✋ Tomar el control
            </button>
          ) : (
            <button
              type="button"
              onClick={onResume}
              className="px-4 py-2 text-sm font-semibold text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors"
            >
              🤖 Devolver al bot
            </button>
          )}
        </div>
      </header>

      <div
        ref={threadRef}
        className="flex-1 overflow-y-auto min-h-0 p-5 space-y-3 bg-neutral-50/50"
      >
        {conversation.messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-start' : 'justify-end'}`}>
            <div className="max-w-[75%]">
              <p className="text-[10px] font-medium text-neutral-400 mb-1 text-right">
                {ROLE_LABEL[m.role]} · {m.createdAt ? formatTime(m.createdAt) : ''}
              </p>
              <div className={`px-4 py-2.5 text-sm whitespace-pre-wrap ${ROLE_STYLES[m.role]}`}>
                {m.content}
              </div>
            </div>
          </div>
        ))}
      </div>

      {conversation.status === 'human' && (
        <footer className="p-4 border-t border-neutral-200 shrink-0">
          <div className="flex gap-2">
            <input
              type="text"
              value={replyText}
              onChange={e => setReplyText(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && void handleReply()}
              placeholder="Escribí tu respuesta al cliente…"
              className="flex-1 px-4 py-2.5 text-sm border border-neutral-300 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none"
            />
            <button
              type="button"
              onClick={() => void handleReply()}
              disabled={sending || !replyText.trim()}
              className="px-5 py-2.5 text-sm font-semibold text-white bg-amber-500 rounded-lg hover:bg-amber-600 transition-colors disabled:opacity-50"
            >
              {sending ? 'Enviando…' : 'Responder'}
            </button>
          </div>
          <p className="text-[11px] text-neutral-400 mt-2">
            El bot está pausado en esta conversación — el cliente ve tus respuestas cuando vuelva a
            abrir el chat.
          </p>
        </footer>
      )}
    </section>
  );
};

const MessagesPage = () => {
  const queryClient = useQueryClient();
  const syncAllowed = useSyncGate();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'bot' | 'human'>('all');
  const threadRef = useRef<HTMLDivElement>(null);

  // Backoff sin cambios: 8s → 16s → 32s → 60s tope. Se resetea si la firma
  // de la lista cambia (llegó mensaje nuevo) o al interactuar con filtros.
  const listSigRef = useRef<string | null>(null);
  const listQuietRef = useRef(0);

  const conversationsQuery = useQuery({
    queryKey: [...CONVERSATIONS_KEY, filter],
    queryFn: async () => {
      const result = await listConversations({
        ...(filter !== 'all' ? { status: filter } : {}),
        limit: 30,
      });
      return result.items;
    },
    // Errores silenciosos: se conserva la data previa (sin placeholder destruido).
    refetchInterval: q => {
      if (!syncAllowed) return false;
      const items = q.state.data;
      const sig = items
        ? items.map(c => `${c.id}:${c.messageCount}:${c.lastMessageAt}`).join(',')
        : null;
      if (sig && sig === listSigRef.current) {
        listQuietRef.current = Math.min(listQuietRef.current + 1, 3);
      } else {
        listQuietRef.current = 0;
        listSigRef.current = sig;
      }
      return Math.min(POLL_BASE_MS * 2 ** listQuietRef.current, POLL_MAX_MS);
    },
  });

  const conversations = conversationsQuery.data ?? [];
  const loading = conversationsQuery.isPending;

  const threadQuery = useQuery({
    queryKey: ['bot', 'conversation', selectedId],
    queryFn: async () => {
      if (!selectedId) throw new Error('sin conversación seleccionada');
      return getConversation(selectedId);
    },
    enabled: !!selectedId,
    refetchInterval: syncAllowed && selectedId ? THREAD_POLL_MS : false,
  });

  const selected = threadQuery.data ?? null;

  const openConversation = useCallback((id: string) => {
    setSelectedId(id);
  }, []);

  useEffect(() => {
    threadRef.current?.scrollTo({ top: threadRef.current.scrollHeight });
  }, [selected?.messages.length]);

  const invalidateAll = async () => {
    await queryClient.invalidateQueries({ queryKey: CONVERSATIONS_KEY });
    if (selectedId) {
      await queryClient.invalidateQueries({ queryKey: ['bot', 'conversation', selectedId] });
    }
  };

  const pauseMutation = useMutation({
    mutationFn: (id: string) => pauseConversation(id),
    onSuccess: invalidateAll,
  });
  const resumeMutation = useMutation({
    mutationFn: (id: string) => resumeConversation(id),
    onSuccess: invalidateAll,
  });
  const replyMutation = useMutation({
    mutationFn: ({ id, message }: { id: string; message: string }) =>
      replyConversation(id, message),
    onSuccess: invalidateAll,
  });

  const handlePause = async () => {
    if (!selectedId) return;
    await pauseMutation.mutateAsync(selectedId);
  };

  const handleResume = async () => {
    if (!selectedId) return;
    await resumeMutation.mutateAsync(selectedId);
  };

  const handleReply = async (message: string) => {
    if (!selectedId) return;
    await replyMutation.mutateAsync({ id: selectedId, message });
  };

  return (
    <div className="h-full min-h-0 grid grid-cols-1 lg:grid-cols-[340px,1fr] gap-4">
      {/* lg+: lista y chat lado a lado. Mobile/tablet: lista, o chat si hay uno abierto. */}
      <div className={`${selected ? 'hidden lg:block' : 'block'} h-full min-h-0`}>
        <ConversationList
          conversations={conversations}
          loading={loading}
          filter={filter}
          selectedId={selected?.id ?? null}
          onFilterChange={setFilter}
          onOpen={id => void openConversation(id)}
        />
      </div>

      {selected ? (
        <ConversationThread
          conversation={selected}
          onBack={() => setSelectedId(null)}
          onPause={() => void handlePause()}
          onResume={() => void handleResume()}
          onReply={handleReply}
          threadRef={threadRef}
        />
      ) : (
        <section className="hidden lg:flex bg-white border border-neutral-200 rounded-xl shadow-sm items-center justify-center min-h-0">
          <p className="text-sm text-neutral-400">Seleccioná una conversación de la izquierda</p>
        </section>
      )}
    </div>
  );
};

export default MessagesPage;
