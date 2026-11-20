import React, { useState, useEffect, useRef } from 'react';
import {
  Bot,
  Send,
  X,
  RefreshCw,
  Copy,
  Check,
  Building2,
  Trash2,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  AlertTriangle,
  Lightbulb,
  MessageSquare,
  ChevronRight,
  Share2
} from 'lucide-react';

export interface LeadContextInfo {
  id: string;
  name: string;
  category?: string;
  nicheLabel?: string;
  city?: string;
  phoneNorm?: string;
  phoneRaw?: string;
  siteStatus?: string;
  siteAuditReason?: string;
  rating?: string;
  reviewsCount?: string;
  userReviews?: any;
  notes?: string;
  pitchType?: string;
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

interface AiCopilotDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  activeLead?: LeadContextInfo | null;
  onClearActiveLead?: () => void;
  onUsePitchInWhatsapp?: (text: string) => void;
}

const WELCOME_MESSAGE: Message = {
  id: 'welcome',
  role: 'assistant',
  content: 'Olá! Sou o **Claude Sonnet 5**, seu Copilot estratégico para a operação de negócios locais.\n\nPosso te ajudar a:\n- Criar abordagens de WhatsApp humanizadas e autênticas (sem clichês de IA)\n- Analisar a reputação real e dados de comércios em RMBH\n- Contornar objeções de clientes ("já tenho quem faça", "tá caro", etc.)\n- Estruturar estratégias de fechamento e precificação\n\nComo posso ajudar você agora?',
  timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
};

export const AiCopilotDrawer: React.FC<AiCopilotDrawerProps> = ({
  isOpen,
  onClose,
  activeLead,
  onClearActiveLead,
  onUsePitchInWhatsapp
}) => {
  const [messages, setMessages] = useState<Message[]>([WELCOME_MESSAGE]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [hasLoadedHistory, setHasLoadedHistory] = useState(false);
  const [aiStatus, setAiStatus] = useState<{
    available: boolean;
    model: string;
    latencyMs?: number;
    error?: string;
  } | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Load persisted history from backend SQLite on mount or when activeLead changes
  useEffect(() => {
    if (isOpen) {
      loadHistory();
      if (!aiStatus) checkHealth();
    }
  }, [isOpen, activeLead?.id]);

  // Auto-scroll on new messages
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isLoading, isOpen]);

  // Focus textarea when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => textareaRef.current?.focus(), 150);
    }
  }, [isOpen]);

  const loadHistory = async () => {
    try {
      const url = activeLead?.id
        ? `/api/ai/messages?leadId=${encodeURIComponent(activeLead.id)}`
        : '/api/ai/messages';
      const res = await fetch(url);
      const data = await res.json();
      if (data.success && Array.isArray(data.messages) && data.messages.length > 0) {
        const formatted: Message[] = data.messages.map((m: any) => ({
          id: m.id,
          role: m.role as 'user' | 'assistant',
          content: m.content,
          timestamp: new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }));
        setMessages([WELCOME_MESSAGE, ...formatted]);
      }
      setHasLoadedHistory(true);
    } catch (err) {
      console.warn('[Copilot] Aviso ao carregar histórico persistido:', err);
    }
  };

  const checkHealth = async () => {
    try {
      const res = await fetch('/api/ai/status');
      const data = await res.json();
      if (data.success) {
        setAiStatus({
          available: Boolean(data.available),
          model: data.model || 'claude-sonnet-5',
          latencyMs: data.latencyMs,
          error: data.error
        });
      } else {
        setAiStatus({
          available: false,
          model: 'claude-sonnet-5',
          error: data.error || 'Falha ao verificar status'
        });
      }
    } catch (err: any) {
      setAiStatus({
        available: false,
        model: 'claude-sonnet-5',
        error: err.message
      });
    }
  };

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || input).trim();
    if (!text || isLoading) return;

    const userMsg: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const newHistory = [...messages, userMsg];
    setMessages(newHistory);
    if (!textToSend) setInput('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newHistory
            .filter(m => m.id !== 'welcome')
            .map(m => ({ role: m.role, content: m.content })),
          leadContext: activeLead || undefined
        })
      });

      const data = await res.json();
      if (data.success && data.content) {
        setMessages(prev => [
          ...prev,
          {
            id: crypto.randomUUID(),
            role: 'assistant',
            content: data.content,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ]);
        if (data.latencyMs) {
          setAiStatus(prev => prev ? { ...prev, latencyMs: data.latencyMs, available: true } : null);
        }
      } else {
        setMessages(prev => [
          ...prev,
          {
            id: crypto.randomUUID(),
            role: 'assistant',
            content: `Aviso: Não foi possível obter resposta do Claude (${data.error || 'Erro desconhecido'}). Verifique a conexão com o provedor.`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ]);
      }
    } catch (err: any) {
      setMessages(prev => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: 'assistant',
          content: `Falha na requisição: ${err.message}. Certifique-se de que a Central está online.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyMessage = (id: string, text: string) => {
    const cleanText = text.replace(/^"|"$/g, '').trim();
    navigator.clipboard.writeText(cleanText);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleQuickPrompt = (prompt: string) => {
    handleSendMessage(prompt);
  };

  const handleClearChat = async () => {
    try {
      const url = activeLead?.id
        ? `/api/ai/messages?leadId=${encodeURIComponent(activeLead.id)}`
        : '/api/ai/messages';
      await fetch(url, { method: 'DELETE' });
    } catch (err) {
      console.warn('[Copilot] Falha ao limpar mensagens no banco:', err);
    }
    setMessages([
      {
        id: 'welcome',
        role: 'assistant',
        content: 'Histórico limpo. Como posso ajudar na operação agora?',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-[2px] transition-opacity duration-200"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer Container */}
      <aside
        className="relative w-full max-w-xl h-full bg-[#FAF8F5] dark:bg-[#1c1b1a] border-l border-[#E2DBD0] dark:border-[#403D39] shadow-2xl flex flex-col z-10 animate-in slide-in-from-right duration-250 ease-out"
        role="dialog"
        aria-label="Claude Sonnet Copilot"
      >
        {/* Header */}
        <header className="px-5 py-3.5 border-b border-[#E2DBD0] dark:border-[#403D39] bg-white dark:bg-[#252422] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-[#EB5E28]/10 text-[#EB5E28] border border-[#EB5E28]/25 flex items-center justify-center shrink-0">
              <Bot className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-heading font-bold text-sm text-[#252422] dark:text-[#FFFCF2] truncate">
                  Claude Sonnet Copilot
                </h3>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-md bg-[#F2ECE1] dark:bg-[#33302d] text-[#5A554E] dark:text-[#CCC5B9] shrink-0 font-medium">
                  {aiStatus?.model || 'claude-sonnet-5'}
                </span>
              </div>
              <div className="flex items-center gap-2 text-[11px] text-[#5A554E] dark:text-[#CCC5B9] mt-0.5">
                <span className="flex items-center gap-1.5">
                  <span
                    className={`w-2 h-2 rounded-full shrink-0 ${
                      aiStatus?.available ? 'bg-emerald-500 ring-2 ring-emerald-500/20' : 'bg-amber-500'
                    }`}
                  />
                  <span className="font-medium">{aiStatus?.available ? 'Ativo & Conectado' : 'Conectando...'}</span>
                </span>
                {aiStatus?.latencyMs && (
                  <>
                    <span>•</span>
                    <span className="font-mono text-[10px] text-[#5A554E]/80 dark:text-[#CCC5B9]/80">
                      {aiStatus.latencyMs}ms
                    </span>
                  </>
                )}
                <span>•</span>
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
                  Histórico Salvo
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={checkHealth}
              className="w-8 h-8 rounded-lg border border-[#E2DBD0] dark:border-[#403D39] text-[#5A554E] hover:text-[#252422] dark:text-[#CCC5B9] dark:hover:text-[#FFFCF2] hover:bg-[#F2ECE1] dark:hover:bg-[#33302d] transition-colors cursor-pointer flex items-center justify-center p-0"
              title="Testar Conexão com Claude"
              aria-label="Atualizar status"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleClearChat}
              className="w-8 h-8 rounded-lg border border-[#E2DBD0] dark:border-[#403D39] text-[#5A554E] hover:text-rose-600 dark:text-[#CCC5B9] dark:hover:text-rose-400 hover:bg-[#F2ECE1] dark:hover:bg-[#33302d] transition-colors cursor-pointer flex items-center justify-center p-0"
              title="Limpar Histórico de Conversa"
              aria-label="Limpar histórico"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg border border-[#E2DBD0] dark:border-[#403D39] text-[#5A554E] hover:text-[#252422] dark:text-[#CCC5B9] dark:hover:text-[#FFFCF2] hover:bg-[#F2ECE1] dark:hover:bg-[#33302d] transition-colors cursor-pointer flex items-center justify-center p-0"
              title="Fechar (Esc)"
              aria-label="Fechar painel"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </header>

        {/* Active Lead Context Bar */}
        {activeLead && (
          <div className="px-4 py-2.5 bg-amber-500/10 border-b border-amber-500/20 text-[#252422] dark:text-[#FFFCF2] flex items-center justify-between gap-2 shrink-0">
            <div className="flex items-center gap-2 min-w-0">
              <Building2 className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
              <div className="text-xs truncate">
                <span className="font-semibold text-amber-800 dark:text-amber-300">Contexto ativo: </span>
                <span className="font-medium text-[#252422] dark:text-[#FFFCF2]">{activeLead.name}</span>
                <span className="text-[#5A554E] dark:text-[#CCC5B9] text-[11px] ml-1.5">
                  ({activeLead.nicheLabel || activeLead.category || 'Nicho local'} • {activeLead.city || 'RMBH'})
                </span>
              </div>
            </div>
            {onClearActiveLead && (
              <button
                onClick={onClearActiveLead}
                className="text-[11px] text-[#5A554E] hover:text-[#252422] dark:text-[#CCC5B9] dark:hover:text-[#FFFCF2] underline cursor-pointer shrink-0 whitespace-nowrap"
                title="Remover contexto específico"
              >
                Remover
              </button>
            )}
          </div>
        )}

        {/* Message Feed */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 font-sans text-xs">
          {messages.map(msg => {
            const isUser = msg.role === 'user';
            const isCopied = copiedId === msg.id;

            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} max-w-full`}
              >
                <div className="flex items-center gap-1.5 mb-1 px-1">
                  <span className="text-[10px] font-semibold text-[#5A554E] dark:text-[#CCC5B9]">
                    {isUser ? 'Você' : 'Claude Sonnet 5'}
                  </span>
                  <span className="text-[9px] text-[#5A554E]/60 dark:text-[#CCC5B9]/60">
                    {msg.timestamp}
                  </span>
                </div>

                <div
                  className={`group relative rounded-2xl p-4 leading-relaxed max-w-[94%] break-words shadow-xs ${
                    isUser
                      ? 'bg-[#EB5E28] text-white rounded-tr-xs'
                      : 'bg-white dark:bg-[#252422] text-[#252422] dark:text-[#FFFCF2] border border-[#E2DBD0] dark:border-[#403D39] rounded-tl-xs'
                  }`}
                >
                  {/* Rich Markdown Parser specifically formatted for headers, blockquotes, and lists */}
                  <div className="space-y-2 selection:bg-amber-200 dark:selection:bg-amber-900">
                    {isUser ? (
                      <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                    ) : (
                      <RichAssistantMessage
                        content={msg.content}
                        msgId={msg.id}
                        copiedId={copiedId}
                        onCopy={(text, id) => handleCopyMessage(id, text)}
                        onUsePitchInWhatsapp={onUsePitchInWhatsapp}
                      />
                    )}
                  </div>

                  {/* Actions for Assistant Message Footer */}
                  {!isUser && msg.id !== 'welcome' && (
                    <div className="mt-3 pt-2 border-t border-[#E2DBD0]/60 dark:border-[#403D39]/60 flex items-center justify-between gap-2 opacity-80 group-hover:opacity-100 transition-opacity">
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleCopyMessage(msg.id, msg.content)}
                          className="flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-medium text-[#5A554E] dark:text-[#CCC5B9] hover:bg-[#F2ECE1] dark:hover:bg-[#33302d] transition-colors cursor-pointer whitespace-nowrap"
                          title="Copiar resposta inteira"
                        >
                          {isCopied ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                              <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Copiado</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3 text-[#EB5E28]" />
                              <span>Copiar Tudo</span>
                            </>
                          )}
                        </button>
                      </div>

                      <span className="text-[9px] font-mono text-[#5A554E]/50 dark:text-[#CCC5B9]/50">
                        Humanizer v3.1 • Sonnet 5
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {/* Loading Indicator */}
          {isLoading && (
            <div className="flex items-center gap-2 p-3 bg-white dark:bg-[#252422] rounded-2xl border border-[#E2DBD0] dark:border-[#403D39] w-fit shadow-xs animate-pulse">
              <Bot className="w-4 h-4 text-[#EB5E28] animate-spin" />
              <span className="text-xs text-[#5A554E] dark:text-[#CCC5B9] font-medium">
                Claude Sonnet elaborando abordagem humanizada...
              </span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Suggestion Chips */}
        <div className="px-4 py-2 border-t border-[#E2DBD0] dark:border-[#403D39] bg-white/70 dark:bg-[#252422]/70 shrink-0">
          <div className="text-[10px] font-semibold text-[#5A554E] dark:text-[#CCC5B9] mb-1.5 flex items-center gap-1">
            <Lightbulb className="w-3 h-3 text-[#EB5E28]" />
            <span>Sugestões Rápidas:</span>
          </div>
          <div className="flex flex-wrap gap-1.5 overflow-x-auto pb-0.5">
            {activeLead ? (
              <>
                <button
                  onClick={() => handleQuickPrompt(`Gere abordagens comerciais humanizadas via WhatsApp para "${activeLead.name}" usando a skill Humanizer (sem clichês de vendas, citando a reputação real e pedindo pelo responsável).`)}
                  disabled={isLoading}
                  className="px-2.5 py-1 rounded-lg bg-[#FAF8F5] dark:bg-[#1c1b1a] hover:bg-[#F2ECE1] dark:hover:bg-[#33302d] border border-[#E2DBD0] dark:border-[#403D39] text-[11px] text-[#252422] dark:text-[#FFFCF2] font-medium transition-colors cursor-pointer whitespace-nowrap shrink-0 flex items-center gap-1"
                >
                  <Sparkles className="w-3 h-3 text-[#EB5E28]" />
                  <span>Gerar abordagens humanizadas</span>
                </button>
                <button
                  onClick={() => handleQuickPrompt(`Faça um diagnóstico rápido de presença digital e pontos de dor para "${activeLead.name}".`)}
                  disabled={isLoading}
                  className="px-2.5 py-1 rounded-lg bg-[#FAF8F5] dark:bg-[#1c1b1a] hover:bg-[#F2ECE1] dark:hover:bg-[#33302d] border border-[#E2DBD0] dark:border-[#403D39] text-[11px] text-[#252422] dark:text-[#FFFCF2] transition-colors cursor-pointer whitespace-nowrap shrink-0"
                >
                  Diagnosticar presença e reviews
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => handleQuickPrompt('Como contornar a objeção: "Já tenho quem faça / sobrinho que cuida"? Me dê 2 respostas diretas e humanas sem forçar a barra.')}
                  disabled={isLoading}
                  className="px-2.5 py-1 rounded-lg bg-[#FAF8F5] dark:bg-[#1c1b1a] hover:bg-[#F2ECE1] dark:hover:bg-[#33302d] border border-[#E2DBD0] dark:border-[#403D39] text-[11px] text-[#252422] dark:text-[#FFFCF2] transition-colors cursor-pointer whitespace-nowrap shrink-0"
                >
                  Objeção "Já tenho quem faça"
                </button>
                <button
                  onClick={() => handleQuickPrompt('Como responder quando o comerciante pergunta "quanto custa" logo no início do WhatsApp?')}
                  disabled={isLoading}
                  className="px-2.5 py-1 rounded-lg bg-[#FAF8F5] dark:bg-[#1c1b1a] hover:bg-[#F2ECE1] dark:hover:bg-[#33302d] border border-[#E2DBD0] dark:border-[#403D39] text-[11px] text-[#252422] dark:text-[#FFFCF2] transition-colors cursor-pointer whitespace-nowrap shrink-0"
                >
                  Objeção "Quanto custa?"
                </button>
                <button
                  onClick={() => handleQuickPrompt('Quais os nichos mais lucrativos e receptivos para prospecção em cidades de RMBH?')}
                  disabled={isLoading}
                  className="px-2.5 py-1 rounded-lg bg-[#FAF8F5] dark:bg-[#1c1b1a] hover:bg-[#F2ECE1] dark:hover:bg-[#33302d] border border-[#E2DBD0] dark:border-[#403D39] text-[11px] text-[#252422] dark:text-[#FFFCF2] transition-colors cursor-pointer whitespace-nowrap shrink-0"
                >
                  Melhores nichos em RMBH
                </button>
              </>
            )}
          </div>
        </div>

        {/* Input Bar */}
        <footer className="p-3.5 bg-white dark:bg-[#252422] border-t border-[#E2DBD0] dark:border-[#403D39] shrink-0">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-end gap-2"
          >
            <div className="flex-1 relative">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={
                  activeLead
                    ? `Pergunte ao Claude sobre ${activeLead.name}...`
                    : 'Pergunte qualquer coisa ao Claude Sonnet (Shift+Enter para nova linha)...'
                }
                rows={2}
                disabled={isLoading}
                className="w-full resize-none p-2.5 rounded-xl border border-[#E2DBD0] dark:border-[#403D39] bg-[#FAF8F5] dark:bg-[#1c1b1a] text-[#252422] dark:text-[#FFFCF2] placeholder-[#5A554E]/60 dark:placeholder-[#CCC5B9]/60 text-xs focus:outline-hidden focus:ring-1 focus:ring-[#EB5E28] focus:border-[#EB5E28] transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className={`h-10 px-4 rounded-xl font-semibold text-xs flex items-center justify-center gap-1.5 transition-all duration-150 cursor-pointer whitespace-nowrap shrink-0 active:scale-[0.97] ${
                isLoading || !input.trim()
                  ? 'bg-[#F2ECE1] dark:bg-[#33302d] text-[#5A554E]/50 dark:text-[#CCC5B9]/50 cursor-not-allowed'
                  : 'bg-[#EB5E28] hover:bg-[#d04f1f] text-white shadow-md shadow-[#EB5E28]/20'
              }`}
              title="Enviar mensagem (Enter)"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Enviar</span>
            </button>
          </form>
        </footer>
      </aside>
    </div>
  );
};

// Rich Component to format Headings, Blockquotes (Pitches), and Lists with high polish
interface RichAssistantMessageProps {
  content: string;
  msgId: string;
  copiedId: string | null;
  onCopy: (text: string, id: string) => void;
  onUsePitchInWhatsapp?: (text: string) => void;
}

const RichAssistantMessage: React.FC<RichAssistantMessageProps> = ({
  content,
  msgId,
  copiedId,
  onCopy,
  onUsePitchInWhatsapp
}) => {
  // Normalize line endings and split into major blocks by double newline
  const rawBlocks = content.split(/\n\n+/);

  return (
    <div className="space-y-3">
      {rawBlocks.map((block, bIdx) => {
        const trimmed = block.trim();
        if (!trimmed) return null;

        // 1. Heading 3 / 2 (### or ##)
        if (trimmed.startsWith('### ') || trimmed.startsWith('## ') || trimmed.startsWith('#### ')) {
          const title = trimmed.replace(/^#+\s+/, '');
          return (
            <div key={bIdx} className="flex items-center gap-2 pt-2.5 pb-1 border-b border-[#E2DBD0]/60 dark:border-[#403D39]/60">
              <span className="w-2 h-2 rounded-full bg-[#EB5E28] shrink-0" />
              <h4 className="font-heading font-bold text-xs uppercase tracking-wide text-[#252422] dark:text-[#FFFCF2]">
                {title}
              </h4>
            </div>
          );
        }

        // 2. Blockquote (> ...) - Usually an Approach Pitch Option!
        if (trimmed.startsWith('>')) {
          const quoteLines = trimmed
            .split('\n')
            .map(line => line.replace(/^>\s?/, ''))
            .join('\n');
          const cleanQuote = quoteLines.replace(/^"|"$/g, '').trim();
          const blockId = `${msgId}-quote-${bIdx}`;
          const isCopied = copiedId === blockId;

          return (
            <div
              key={bIdx}
              className="my-2 p-3.5 rounded-xl bg-[#FAF8F5] dark:bg-[#1c1b1a] border-l-3 border-[#EB5E28] border-y border-r border-[#E2DBD0] dark:border-[#403D39] shadow-2xs space-y-3"
            >
              <div className="text-xs text-[#252422] dark:text-[#FFFCF2] leading-relaxed whitespace-pre-wrap font-sans italic">
                "{cleanQuote}"
              </div>

              {/* Dedicated Action Buttons for this specific pitch */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-[#E2DBD0]/60 dark:border-[#403D39]/60">
                <button
                  type="button"
                  onClick={() => onCopy(cleanQuote, blockId)}
                  className="px-2.5 py-1 rounded-lg text-[10px] font-semibold bg-white dark:bg-[#252422] border border-[#E2DBD0] dark:border-[#403D39] text-[#5A554E] dark:text-[#CCC5B9] hover:text-[#252422] dark:hover:text-[#FFFCF2] flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap shrink-0 active:scale-[0.98]"
                >
                  {isCopied ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                      <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Copiado</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3 text-[#EB5E28]" />
                      <span>Copiar esta Opção</span>
                    </>
                  )}
                </button>

                {onUsePitchInWhatsapp && (
                  <button
                    type="button"
                    onClick={() => onUsePitchInWhatsapp(cleanQuote)}
                    className="px-2.5 py-1 rounded-lg text-[10px] font-semibold bg-[#EB5E28] hover:bg-[#d04f1f] text-white flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap shrink-0 shadow-2xs active:scale-[0.98]"
                  >
                    <MessageSquare className="w-3 h-3" />
                    <span>Usar no WhatsApp</span>
                  </button>
                )}
              </div>
            </div>
          );
        }

        // 3. Numbered List (1. ..., 2. ...)
        if (/^\d+\.\s/.test(trimmed)) {
          const items = trimmed.split(/\n(?=\d+\.\s)/);
          return (
            <ol key={bIdx} className="space-y-2 my-2 pl-0.5">
              {items.map((item, iIdx) => {
                const numberMatch = item.match(/^(\d+)\.\s*([\s\S]*)$/);
                const num = numberMatch ? numberMatch[1] : `${iIdx + 1}`;
                const text = numberMatch ? numberMatch[2] : item;
                return (
                  <li key={iIdx} className="flex items-start gap-2.5 text-xs leading-relaxed text-[#252422] dark:text-[#FFFCF2]">
                    <span className="w-5 h-5 rounded-md bg-[#EB5E28]/10 text-[#EB5E28] font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5 font-mono">
                      {num}
                    </span>
                    <div className="flex-1 min-w-0">
                      {formatInlineMarkdown(text)}
                    </div>
                  </li>
                );
              })}
            </ol>
          );
        }

        // 4. Bullet List (- ... or * ...)
        if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
          const items = trimmed.split(/\n[-*]\s+/);
          return (
            <ul key={bIdx} className="space-y-1.5 my-2 pl-1">
              {items.map((item, iIdx) => {
                const cleaned = item.replace(/^[-*]\s+/, '').trim();
                if (!cleaned) return null;
                return (
                  <li key={iIdx} className="flex items-start gap-2 text-xs leading-relaxed text-[#252422] dark:text-[#FFFCF2]">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#EB5E28] mt-1.5 shrink-0" />
                    <div className="flex-1 min-w-0">
                      {formatInlineMarkdown(cleaned)}
                    </div>
                  </li>
                );
              })}
            </ul>
          );
        }

        // 5. Regular Paragraph
        return (
          <p key={bIdx} className="leading-relaxed text-[#252422] dark:text-[#FFFCF2]">
            {formatInlineMarkdown(trimmed)}
          </p>
        );
      })}
    </div>
  );
};

// Helper to format inline bold, italic and code
function formatInlineMarkdown(text: string): React.ReactNode {
  // Split on bold (**text**) or code (`text`) or italic (*text*)
  const parts = text.split(/(\*\*.*?\*\*|`.*?`|\*.*?\*)/g);
  return parts.map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={index} className="font-bold text-[#252422] dark:text-[#FFFCF2]">
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (part.startsWith('`') && part.endsWith('`')) {
      return (
        <code key={index} className="font-mono text-[11px] px-1 py-0.5 rounded-md bg-[#F2ECE1] dark:bg-[#33302d] text-[#EB5E28]">
          {part.slice(1, -1)}
        </code>
      );
    }
    if (part.startsWith('*') && part.endsWith('*')) {
      return (
        <em key={index} className="italic text-[#5A554E] dark:text-[#CCC5B9]">
          {part.slice(1, -1)}
        </em>
      );
    }
    return part;
  });
}
