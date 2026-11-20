/**
 * Sistema de Rotas & Histórico do Prospec (SPA Router)
 * 
 * Permite navegação canônica em português, URLs diretas, persistência em refresh (F5),
 * suporte ao botão voltar/avançar do navegador (popstate) e deep-linking com id de lead (?lead=id).
 */

export type TabKey = 'overview' | 'leads' | 'conversations' | 'whatsapp' | 'prototypes' | 'settings';

export interface TabRouteMeta {
  key: TabKey;
  path: string;
  title: string;
  navLabel: string;
  aliases: string[];
}

export interface RouteMatch {
  tab: TabKey;
  leadId: string | null;
  canonicalPath: string;
  isAlias: boolean;
}

export const TAB_ROUTES: Record<TabKey, TabRouteMeta> = {
  overview: {
    key: 'overview',
    path: '/',
    title: 'Visão Geral | Prospec',
    navLabel: 'Visão Geral',
    aliases: ['/overview', '/visao-geral', '/inicio']
  },
  leads: {
    key: 'leads',
    path: '/prospeccao',
    title: 'Prospecção & Contatos | Prospec',
    navLabel: 'Prospecção',
    aliases: ['/leads', '/prospeccao', '/contatos']
  },
  conversations: {
    key: 'conversations',
    path: '/conversas',
    title: 'Conversas WhatsApp | Prospec',
    navLabel: 'Conversas',
    aliases: ['/conversas', '/conversations', '/chat']
  },
  whatsapp: {
    key: 'whatsapp',
    path: '/whatsapp',
    title: 'WhatsApp Studio | Prospec',
    navLabel: 'WhatsApp Studio',
    aliases: ['/whatsapp', '/whatsapp-studio', '/studio']
  },
  prototypes: {
    key: 'prototypes',
    path: '/layouts',
    title: 'Layouts no Doop | Prospec',
    navLabel: 'Layouts no Doop',
    aliases: ['/layouts', '/prototypes', '/doop', '/canvas']
  },
  settings: {
    key: 'settings',
    path: '/operacao',
    title: 'Operação do Sistema | Prospec',
    navLabel: 'Operação',
    aliases: ['/operacao', '/configuracoes', '/settings']
  }
};

/**
 * Normaliza e identifica a rota atual a partir do pathname e da query string.
 */
export function matchRoute(pathname: string = typeof window !== 'undefined' ? window.location.pathname : '/', search: string = typeof window !== 'undefined' ? window.location.search : ''): RouteMatch {
  let cleanPath = (pathname || '/').trim();
  // Remove barra final se não for a raiz
  if (cleanPath.length > 1 && cleanPath.endsWith('/')) {
    cleanPath = cleanPath.slice(0, -1);
  }

  // Tenta extrair leadId da query string (?lead=... ou ?id=...)
  let leadId: string | null = null;
  if (search) {
    try {
      const params = new URLSearchParams(search);
      leadId = params.get('lead') || params.get('id') || null;
    } catch {
      leadId = null;
    }
  }

  // Suporte a sub-segmentos de caminho (ex: /prospeccao/:id ou /conversas/:id)
  const segments = cleanPath.split('/').filter(Boolean);
  const firstSegment = segments.length > 0 ? `/${segments[0]}` : '/';
  if (segments.length >= 2 && !leadId) {
    leadId = decodeURIComponent(segments[1]);
  }

  // 1. Casamento com caminho canônico exato ou de primeiro nível
  for (const meta of Object.values(TAB_ROUTES)) {
    if (meta.path === cleanPath || meta.path === firstSegment) {
      return {
        tab: meta.key,
        leadId,
        canonicalPath: meta.path,
        isAlias: false
      };
    }
  }

  // 2. Casamento com aliases / sinônimos conhecidos
  const lowerClean = cleanPath.toLowerCase();
  const lowerFirst = firstSegment.toLowerCase();
  for (const meta of Object.values(TAB_ROUTES)) {
    if (meta.aliases.includes(lowerClean) || meta.aliases.includes(lowerFirst)) {
      return {
        tab: meta.key,
        leadId,
        canonicalPath: meta.path,
        isAlias: true
      };
    }
  }

  // 3. Fallback seguro para Visão Geral
  return {
    tab: 'overview',
    leadId: null,
    canonicalPath: '/',
    isAlias: cleanPath !== '/'
  };
}

/**
 * Constrói a URL completa para um tab e lead opcional.
 */
export function buildRouteUrl(tab: TabKey, leadId?: string | number | null): string {
  const meta = TAB_ROUTES[tab] || TAB_ROUTES.overview;
  if (leadId && tab !== 'overview' && tab !== 'settings') {
    return `${meta.path}?lead=${encodeURIComponent(String(leadId))}`;
  }
  return meta.path;
}

/**
 * Atualiza o histórico do navegador e a barra de URL sem recarregar a página (pushState).
 */
export function pushRoute(tab: TabKey, leadId?: string | number | null) {
  if (typeof window === 'undefined') return;
  const targetUrl = buildRouteUrl(tab, leadId);
  const meta = TAB_ROUTES[tab] || TAB_ROUTES.overview;
  const currentUrl = window.location.pathname + window.location.search;

  if (currentUrl !== targetUrl) {
    window.history.pushState({ tab, leadId: leadId ? String(leadId) : null }, meta.title, targetUrl);
  }
  document.title = meta.title;
}

/**
 * Substitui o estado atual do histórico do navegador (replaceState).
 */
export function replaceRoute(tab: TabKey, leadId?: string | number | null) {
  if (typeof window === 'undefined') return;
  const targetUrl = buildRouteUrl(tab, leadId);
  const meta = TAB_ROUTES[tab] || TAB_ROUTES.overview;

  window.history.replaceState({ tab, leadId: leadId ? String(leadId) : null }, meta.title, targetUrl);
  document.title = meta.title;
}

