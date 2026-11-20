import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useDebounce, fetchWithSWR, prefetchLeadDetails, invalidateClientCache } from './utils/performance.js';
import { SkeletonTableRow, SkeletonLeadCard, SkeletonStatCard, SkeletonConversationItem } from './components/Skeletons.js';
import {
  TabKey,
  TAB_ROUTES,
  matchRoute,
  buildRouteUrl,
  pushRoute,
  replaceRoute
} from './utils/router.js';
import { detectNicheFromCategory } from './templates/detectNiche.js';
import {
  Activity,
  LayoutTemplate,
  LayoutGrid,
  MessageSquareQuote,
  Search,
  MessageSquare,
  Globe,
  Settings,
  RefreshCw,
  ExternalLink,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Smartphone,
  Monitor,
  Tablet,
  Send,
  Layers,
  Sliders,
  Database,
  Building2,
  Phone,
  MapPin,
  Map,
  Flame,
  Play,
  Square,
  RotateCw,
  Terminal,
  X,
  Eye,
  Menu,
  Star,
  Copy,
  Check,
  CheckCheck,
  Shield,
  ShieldCheck,
  ShieldAlert,
  Server,
  Radio,
  Wifi,
  Scissors,
  HeartPulse,
  UtensilsCrossed,
  Wrench,
  Hammer,
  Dumbbell,
  PawPrint,
  Briefcase,
  Tag,
  Wand2,
  Filter,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Clock,
  Share2,
  Link2,
  Info,
  Maximize2,
  Sun,
  Moon,
  User,
  Camera,
  Image as ImageIcon,
  Pencil,
  Save,
  FileEdit,
  MessageCircle,
  Inbox,
  Loader2,
  Bot,
  Sparkles,
  CloudUpload,
  Car,
  ShoppingBag,
  PanelLeftClose,
  PanelLeftOpen
} from 'lucide-react';

import { AiCopilotDrawer } from './components/AiCopilotDrawer.js';
import { CentralPipelineStreamChart } from './components/CentralPipelineStreamChart.js';

import {
  generateHumanizedPitch,
  buildAllPitchVariations,
  detectNicheContext,
  cleanBusinessName,
  type PitchVariation
} from '../../domain/pitchGenerator.js';

interface ServiceStatus {
  id: 'scraper' | 'openwa' | 'doop';
  name: string;
  status: 'available' | 'connected' | 'disconnected' | 'stopped' | 'mock' | 'degraded';
  mode: 'real' | 'mock';
  port: number;
  endpoint: string;
  summary: string;
  actionRequired?: string;
  details?: Record<string, any>;
}

interface Lead {
  id: string;
  name: string;
  category: string;
  niche?: string;
  nicheLabel?: string;
  address: string;
  city: string;
  phoneRaw: string;
  phoneNorm: string;
  website: string;
  websiteType: string;
  siteStatus: string;
  pitchType: string;
  siteAuditReason?: string;
  rating?: string;
  reviewsCount?: number;
  userReviews?: string;
  thumbnailUrl?: string;
  logoUrl?: string;
  photos?: string;
  latitude?: number | string;
  longitude?: number | string;
  priority: string;
  stage: string;
  doopCanvasUrl?: string;
  doopCanvasId?: string;
}

function getNicheIcon(nicheId?: string) {
  switch (nicheId) {
    case 'beleza':
      return Scissors;
    case 'saude':
      return HeartPulse;
    case 'automotivo':
      return Wrench;
    case 'pet':
      return PawPrint;
    case 'fitness':
      return Dumbbell;
    case 'manutencao':
      return Hammer;
    case 'alimentacao':
      return UtensilsCrossed;
    default:
      return Building2;
  }
}

function parseLeadPhotos(raw?: string | null): string[] {
  if (!raw || !raw.trim()) return [];
  try {
    const data = JSON.parse(raw);
    if (Array.isArray(data)) {
      return data
        .map((item: any) => (typeof item === 'string' ? item : item?.link || item?.url || item?.photo || item?.image || item?.src))
        .filter((u): u is string => typeof u === 'string' && u.startsWith('http'));
    }
  } catch {
    return raw
      .split(/;|,/)
      .map((s) => s.trim())
      .filter((s) => s.startsWith('http'));
  }
  return [];
}

interface ParsedReview {
  author: string;
  rating: number;
  text: string;
  time?: string;
  avatar?: string;
}

function parseLeadReviews(raw?: string | null): ParsedReview[] {
  if (!raw || !raw.trim()) return [];
  try {
    const data = JSON.parse(raw);
    const arr = Array.isArray(data) ? data : (data.reviews || data.user_reviews || [data]);
    return arr.map((item: any) => {
      if (typeof item === 'string') {
        return { author: 'Cliente do Google', rating: 5, text: item };
      }
      let cleanText = item.text_original || item.Description || item.description || item.text || item.comment || item.snippet || '';
      if (cleanText.includes('(Original)')) {
        const parts = cleanText.split('(Original)');
        cleanText = parts[parts.length - 1].trim();
      }
      cleanText = cleanText.replace(/\(Translated by Google\)/gi, '').trim();

      return {
        author: item.Name || item.name || item.author || item.author_name || item.reviewer || 'Cliente do Google',
        rating: Math.min(5, Math.max(1, parseInt(item.Rating || item.rating || item.stars || '5', 10) || 5)),
        text: cleanText,
        time: item.When || item.when || item.time || item.date || item.publishedAt || item.published_at || undefined,
        avatar: item.ProfilePicture || item.profile_picture || item.avatar || item.photo || item.author_url || undefined
      };
    }).filter((r: any) => r.text && r.text.trim().length > 0);
  } catch {
    if (raw.includes(';') || raw.includes('||')) {
      return raw.split(/;|\|\|/).map(s => s.trim()).filter(Boolean).map(text => ({
        author: 'Cliente do Google',
        rating: 5,
        text
      }));
    }
    if (raw.trim().length > 5) {
      return [{ author: 'Cliente do Google', rating: 5, text: raw.trim() }];
    }
  }
  return [];
}

interface DraggableScrollRowProps {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
  className?: string;
}

export function DraggableScrollRow({ label, icon: Icon, children, className = '' }: DraggableScrollRowProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [isGrabbing, setIsGrabbing] = useState(false);

  const isDownRef = useRef(false);
  const startXRef = useRef(0);
  const scrollLeftStartRef = useRef(0);
  const hasDraggedRef = useRef(false);

  const updateScrollState = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    setCanScrollLeft(scrollLeft > 6);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 6);
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    updateScrollState();

    const timer = setTimeout(updateScrollState, 150);
    const ro = new ResizeObserver(() => updateScrollState());
    ro.observe(el);

    const handleScroll = () => updateScrollState();
    el.addEventListener('scroll', handleScroll, { passive: true });

    const handleNativeWheel = (e: WheelEvent) => {
      if (el.scrollWidth > el.clientWidth && Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
        const canScrollMore =
          (e.deltaY > 0 && el.scrollLeft < el.scrollWidth - el.clientWidth - 1) ||
          (e.deltaY < 0 && el.scrollLeft > 1);
        if (canScrollMore) {
          e.preventDefault();
          el.scrollLeft += e.deltaY * 0.9;
          updateScrollState();
        }
      }
    };
    el.addEventListener('wheel', handleNativeWheel, { passive: false });

    return () => {
      clearTimeout(timer);
      ro.disconnect();
      el.removeEventListener('scroll', handleScroll);
      el.removeEventListener('wheel', handleNativeWheel);
    };
  }, [updateScrollState, children]);

  useEffect(() => {
    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (!isDownRef.current || !scrollRef.current) return;
      const x = e.pageX;
      const walk = (x - startXRef.current) * 1.35;
      scrollRef.current.scrollLeft = scrollLeftStartRef.current - walk;

      if (Math.abs(walk) > 4) {
        hasDraggedRef.current = true;
      }
      updateScrollState();
    };

    const handleGlobalMouseUp = () => {
      if (isDownRef.current) {
        isDownRef.current = false;
        setIsGrabbing(false);
        if (hasDraggedRef.current) {
          setTimeout(() => {
            hasDraggedRef.current = false;
          }, 60);
        }
      }
    };

    window.addEventListener('mousemove', handleGlobalMouseMove);
    window.addEventListener('mouseup', handleGlobalMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleGlobalMouseMove);
      window.removeEventListener('mouseup', handleGlobalMouseUp);
    };
  }, [updateScrollState]);

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.button !== 0) return;
    const el = scrollRef.current;
    if (!el) return;

    isDownRef.current = true;
    hasDraggedRef.current = false;
    startXRef.current = e.pageX;
    scrollLeftStartRef.current = el.scrollLeft;
    setIsGrabbing(true);
  };

  const handleClickCapture = (e: React.MouseEvent) => {
    if (hasDraggedRef.current) {
      e.stopPropagation();
      e.preventDefault();
    }
  };

  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    const el = scrollRef.current;
    if (!el) return;
    if (el.scrollWidth > el.clientWidth && Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
      const canScrollMore =
        (e.deltaY > 0 && el.scrollLeft < el.scrollWidth - el.clientWidth - 1) ||
        (e.deltaY < 0 && el.scrollLeft > 1);
      if (canScrollMore) {
        el.scrollLeft += e.deltaY * 0.9;
        updateScrollState();
      }
    }
  };

  const scrollBy = (offset: number) => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: offset, behavior: 'smooth' });
      setTimeout(updateScrollState, 250);
    }
  };

  return (
    <div className={`flex items-center gap-2 border-t border-[#E2DBD0]/70 dark:border-[#403D39]/60 relative select-none ${className}`}>
      {/* Pinned Category / Status Label */}
      <span className="text-[11px] text-[#57534E] dark:text-[#CCC5B9] font-heading font-medium flex items-center gap-1 shrink-0 select-none mr-0.5">
        <Icon className="w-3 h-3 text-[#EB5E28]" />
        {label}
      </span>

      {/* Track Container with Overflow Navigation */}
      <div className="relative flex-1 min-w-0 flex items-center">
        {/* Left Arrow Button with Soft Edge Mask (Desktop & Tablet) */}
        {canScrollLeft && (
          <div className="hidden sm:flex absolute left-0 top-0 bottom-0 z-20 items-center pr-7 pl-1 bg-gradient-to-r from-white via-white/95 to-transparent dark:from-[#252422] dark:via-[#252422]/95 pointer-events-none">
            <button
              type="button"
              onClick={() => scrollBy(-240)}
              className="w-6 h-6 rounded-full bg-white dark:bg-[#1c1b1a] border border-[#E2DBD0] dark:border-[#403D39] text-[#1C1917] dark:text-[#FFFCF2] shadow-md flex items-center justify-center pointer-events-auto hover:bg-[#FAF8F5] dark:hover:bg-[#33302d] hover:border-[#CCC5B9] active:scale-95 transition-colors cursor-pointer shrink-0"
              title="Rolar para esquerda"
              aria-label="Rolar para esquerda"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Draggable & Scrollable Pills Track */}
        <div
          ref={scrollRef}
          onMouseDown={handleMouseDown}
          onClickCapture={handleClickCapture}
          onWheel={handleWheel}
          onDragStart={(e) => e.preventDefault()}
          className={`flex items-center gap-1.5 overflow-x-auto pb-1 pt-0.5 scrollbar-none w-full ${
            isGrabbing ? 'cursor-grabbing [&_*]:cursor-grabbing' : 'cursor-grab'
          }`}
        >
          {children}
        </div>

        {/* Right Arrow Button with Soft Edge Mask (Desktop & Tablet) */}
        {canScrollRight && (
          <div className="hidden sm:flex absolute right-0 top-0 bottom-0 z-20 items-center pl-7 pr-1 bg-gradient-to-l from-white via-white/95 to-transparent dark:from-[#252422] dark:via-[#252422]/95 pointer-events-none">
            <button
              type="button"
              onClick={() => scrollBy(240)}
              className="w-6 h-6 rounded-full bg-white dark:bg-[#1c1b1a] border border-[#E2DBD0] dark:border-[#403D39] text-[#1C1917] dark:text-[#FFFCF2] shadow-md flex items-center justify-center pointer-events-auto hover:bg-[#FAF8F5] dark:hover:bg-[#33302d] hover:border-[#CCC5B9] active:scale-95 transition-colors cursor-pointer shrink-0"
              title="Rolar para direita"
              aria-label="Rolar para direita"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

interface ModernDropdownOption {
  id: string;
  label: string;
  count?: number;
  icon?: React.ComponentType<{ className?: string }>;
}

interface ModernDropdownProps {
  value: string;
  onChange: (value: string) => void;
  options: ModernDropdownOption[];
  allLabel: string;
  totalCount?: number;
  icon: React.ComponentType<{ className?: string }>;
  searchPlaceholder?: string;
  align?: 'left' | 'right';
  className?: string;
}

export function ModernDropdown({
  value,
  onChange,
  options,
  allLabel,
  totalCount,
  icon: Icon,
  searchPlaceholder = 'Buscar...',
  align = 'left',
  className = ''
}: ModernDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Close when clicking outside or pressing Escape
  useEffect(() => {
    if (!isOpen) return;

    const handlePointerDown = (e: MouseEvent | TouchEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setSearchQuery('');
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
        setSearchQuery('');
      }
    };

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('touchstart', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('touchstart', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  // Auto-focus search input when opened
  useEffect(() => {
    if (isOpen && options.length > 5) {
      setTimeout(() => searchInputRef.current?.focus(), 60);
    }
  }, [isOpen, options.length]);

  const selectedOption = options.find((o) => o.id === value);
  const displayLabel = selectedOption ? selectedOption.label : allLabel;
  const displayCount = selectedOption ? selectedOption.count : totalCount;
  const CurrentIcon = (selectedOption && selectedOption.icon) ? selectedOption.icon : Icon;

  const filteredOptions = searchQuery.trim()
    ? options.filter((o) => o.label.toLowerCase().includes(searchQuery.toLowerCase().trim()))
    : options;

  const handleSelect = (id: string) => {
    onChange(id);
    setIsOpen(false);
    setSearchQuery('');
  };

  return (
    <div ref={dropdownRef} className={`relative inline-block text-left w-full sm:w-auto ${className}`}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        className={`w-full sm:w-auto pl-3 pr-2.5 py-2.5 rounded-xl text-xs font-medium transition-colors duration-150 flex items-center justify-between gap-2 cursor-pointer shadow-xs whitespace-nowrap ${
          isOpen
            ? 'bg-white dark:bg-[#252422] border-[#EB5E28] ring-2 ring-[#EB5E28]/15 text-[#1C1917] dark:text-[#FFFCF2]'
            : selectedOption
            ? 'bg-white dark:bg-[#1c1b1a] border-[#EB5E28]/50 text-[#1C1917] dark:text-[#FFFCF2]'
            : 'bg-[#FAF8F5] dark:bg-[#1c1b1a] border border-[#E2DBD0] dark:border-[#403D39] text-[#1C1917] dark:text-[#CCC5B9] hover:border-[#CCC5B9] dark:hover:border-[#57524d]'
        }`}
      >
        <div className="flex items-center gap-1.5 min-w-0">
          <CurrentIcon className="w-3.5 h-3.5 text-[#EB5E28] shrink-0" />
          <span className="truncate font-medium">{displayLabel}</span>
          {displayCount !== undefined && (
            <span className="px-1.5 py-0.2 text-[10px] font-mono rounded-md font-semibold bg-[#E2DBD0]/60 dark:bg-[#403D39]/60 text-[#57534E] dark:text-[#CCC5B9] shrink-0">
              {displayCount}
            </span>
          )}
        </div>
        <ChevronDown
          className={`w-3.5 h-3.5 shrink-0 transition-transform duration-200 ${
            isOpen ? 'rotate-180 text-[#EB5E28]' : 'text-[#78716C] dark:text-[#A8A29E]'
          }`}
        />
      </button>

      {/* Popover Menu Panel */}
      {isOpen && (
        <div
          className={`absolute top-full mt-1.5 z-50 w-64 sm:w-72 bg-white dark:bg-[#252422] border border-[#E2DBD0] dark:border-[#403D39] rounded-2xl shadow-xl overflow-hidden p-1.5 transition-colors duration-150 animate-in fade-in-0 zoom-in-95 ${
            align === 'right' ? 'right-0' : 'left-0 sm:left-0'
          }`}
        >
          {/* Quick Search Input (if > 5 items) */}
          {options.length > 5 && (
            <div className="p-1 pb-1.5 mb-1 border-b border-[#E2DBD0]/60 dark:border-[#403D39]/60">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-[#78716C] dark:text-[#A8A29E] absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder={searchPlaceholder}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-7 py-1.5 text-xs rounded-lg bg-[#FAF8F5] dark:bg-[#1c1b1a] border border-[#E2DBD0] dark:border-[#403D39] text-[#1C1917] dark:text-[#FFFCF2] placeholder-[#78716C]/60 focus:outline-none focus:border-[#EB5E28]"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-[#78716C] hover:text-[#1C1917] dark:text-[#A8A29E] dark:hover:text-[#FFFCF2] p-0.5 rounded cursor-pointer"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Options List */}
          <div className="max-h-64 overflow-y-auto space-y-0.5 scrollbar-thin">
            {/* "All" default item (only show if not searching or if search matches allLabel) */}
            {(!searchQuery || allLabel.toLowerCase().includes(searchQuery.toLowerCase().trim())) && (
              <button
                type="button"
                onClick={() => handleSelect('')}
                className={`w-full px-2.5 py-2 rounded-xl text-xs font-medium flex items-center justify-between gap-2 transition-colors cursor-pointer ${
                  value === ''
                    ? 'bg-[#EB5E28]/10 dark:bg-[#EB5E28]/20 text-[#EB5E28] font-semibold'
                    : 'text-[#1C1917] dark:text-[#CCC5B9] hover:bg-[#FAF8F5] dark:hover:bg-[#1c1b1a]'
                }`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <Icon className={`w-3.5 h-3.5 shrink-0 ${value === '' ? 'text-[#EB5E28]' : 'text-[#78716C] dark:text-[#A8A29E]'}`} />
                  <span className="truncate">{allLabel}</span>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  {totalCount !== undefined && (
                    <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-md bg-[#FAF8F5] dark:bg-[#1c1b1a] border border-[#E2DBD0]/70 dark:border-[#403D39]/70 text-[#57534E] dark:text-[#CCC5B9] font-semibold">
                      {totalCount}
                    </span>
                  )}
                  {value === '' && <Check className="w-3.5 h-3.5 text-[#EB5E28] shrink-0" />}
                </div>
              </button>
            )}

            {/* Separator if "All" is visible and options exist */}
            {!searchQuery && <div className="h-px bg-[#E2DBD0]/60 dark:border-[#403D39]/60 my-1 mx-1" />}

            {/* Filtered list items */}
            {filteredOptions.length === 0 ? (
              <div className="py-4 text-center text-xs text-[#78716C] dark:text-[#A8A29E]">
                Nenhum resultado encontrado
              </div>
            ) : (
              filteredOptions.map((opt) => {
                const isSelected = value === opt.id;
                const OptIcon = opt.icon || Icon;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => handleSelect(opt.id)}
                    className={`w-full px-2.5 py-2 rounded-xl text-xs font-medium flex items-center justify-between gap-2 transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-[#EB5E28]/10 dark:bg-[#EB5E28]/20 text-[#EB5E28] font-semibold'
                        : 'text-[#1C1917] dark:text-[#CCC5B9] hover:bg-[#FAF8F5] dark:hover:bg-[#1c1b1a]'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <OptIcon className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-[#EB5E28]' : 'text-[#78716C] dark:text-[#A8A29E]'}`} />
                      <span className="truncate">{opt.label}</span>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      {opt.count !== undefined && (
                        <span
                          className={`text-[10px] font-mono px-1.5 py-0.2 rounded-md font-semibold ${
                            isSelected
                              ? 'bg-[#EB5E28]/20 text-[#EB5E28]'
                              : 'bg-[#FAF8F5] dark:bg-[#1c1b1a] border border-[#E2DBD0]/70 dark:border-[#403D39]/70 text-[#57534E] dark:text-[#CCC5B9]'
                          }`}
                        >
                          {opt.count}
                        </span>
                      )}
                      {isSelected && <Check className="w-3.5 h-3.5 text-[#EB5E28] shrink-0" />}
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}

interface Toast {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  message?: string;
}

export function App() {
  const initialRoute = React.useMemo(() => {
    if (typeof window === 'undefined') {
      return { tab: 'overview' as TabKey, leadId: null, canonicalPath: '/', isAlias: false };
    }
    return matchRoute(window.location.pathname, window.location.search);
  }, []);

  const [tab, setTabState] = useState<TabKey>(initialRoute.tab);
  const [pendingLeadIdFromUrl, setPendingLeadIdFromUrl] = useState<string | null>(initialRoute.leadId);
  const [conversationsFilter, setConversationsFilter] = useState<'all' | 'inbound' | 'waiting'>('all');
  const [mobileChatOpen, setMobileChatOpen] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [desktopSidebarCollapsed, setDesktopSidebarCollapsed] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('sidebar_collapsed') === 'true';
    }
    return false;
  });

  const toggleDesktopSidebar = useCallback(() => {
    setDesktopSidebarCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem('sidebar_collapsed', String(next));
      return next;
    });
  }, []);
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('theme');
      if (saved === 'light' || saved === 'dark') return saved;
    }
    return 'dark';
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    addToast('info', next === 'dark' ? 'Modo Escuro Ativado' : 'Modo Claro Ativado', 'Paleta ajustada para visualização.');
  };

  const [services, setServices] = useState<ServiceStatus[]>([]);
  const [stats, setStats] = useState<any>({});
  const [mode, setMode] = useState<string>('integrado_sem_envio');
  const [loading, setLoading] = useState(false);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [detailModalLead, setDetailModalLead] = useState<Lead | null>(null);

  // Router tab navigation with history pushState/replaceState
  const navigateTab = useCallback((nextTab: TabKey, targetLeadId?: string | number | null, replace: boolean = false) => {
    setTabState(nextTab);
    const leadToKeep = (nextTab === 'overview' || nextTab === 'settings')
      ? null
      : (targetLeadId !== undefined ? targetLeadId : (selectedLead ? selectedLead.id : null));
    if (replace) {
      replaceRoute(nextTab, leadToKeep);
    } else {
      pushRoute(nextTab, leadToKeep);
    }
  }, [selectedLead]);

  const setTab = useCallback((nextTab: TabKey) => {
    navigateTab(nextTab);
  }, [navigateTab]);

  // Browser Back/Forward popstate listener
  useEffect(() => {
    const handlePopState = () => {
      const route = matchRoute(window.location.pathname, window.location.search);
      setTabState(route.tab);
      document.title = TAB_ROUTES[route.tab]?.title || 'Prospec';
      if (route.leadId) {
        setPendingLeadIdFromUrl(route.leadId);
      } else if (route.tab === 'overview' || route.tab === 'settings') {
        setSelectedLead(null);
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Normalize aliases (e.g. /leads -> /prospeccao) and set browser tab title on mount
  useEffect(() => {
    if (initialRoute.isAlias) {
      replaceRoute(initialRoute.tab, initialRoute.leadId);
    } else {
      document.title = TAB_ROUTES[initialRoute.tab]?.title || 'Prospec';
    }
    if (initialRoute.tab === 'conversations' && initialRoute.leadId) {
      setMobileChatOpen(true);
    }
  }, [initialRoute]);

  // Effect to resolve pending lead from URL once leads list is available or via direct fetch
  useEffect(() => {
    if (!pendingLeadIdFromUrl) return;

    const found = leads.find((l) => String(l.id) === String(pendingLeadIdFromUrl));
    if (found) {
      selectLead(found);
      if (tab === 'conversations') {
        setMobileChatOpen(true);
      }
      setPendingLeadIdFromUrl(null);
      return;
    }

    if (!loading && leads.length > 0) {
      fetch(`/api/leads/${encodeURIComponent(pendingLeadIdFromUrl)}`)
        .then((res) => res.json())
        .then((data) => {
          if (data && data.success && data.lead) {
            selectLead(data.lead);
            if (tab === 'conversations') {
              setMobileChatOpen(true);
            }
          }
        })
        .catch((err) => console.warn('[Router] Não foi possível carregar lead da URL:', err))
        .finally(() => setPendingLeadIdFromUrl(null));
    }
  }, [pendingLeadIdFromUrl, leads, loading, tab]);

  // AI Copilot (Claude Sonnet 5 via GhostCLI) State
  const [aiDrawerOpen, setAiDrawerOpen] = useState(false);
  const [activeCopilotLead, setActiveCopilotLead] = useState<Lead | null>(null);
  const [aiStatus, setAiStatus] = useState<{ available: boolean; model: string; latencyMs?: number; error?: string } | null>(null);
  const [aiConfig, setAiConfig] = useState<{ provider: string; baseUrl: string; model: string; hasKey: boolean; maskedKey: string } | null>(null);
  const [isTestingAi, setIsTestingAi] = useState(false);

  // Filters & Pagination
  const searchInputRef = React.useRef<HTMLInputElement>(null);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300);
  const [cityFilter, setCityFilter] = useState('');
  const [availableCities, setAvailableCities] = useState<Array<{ city: string; count: number }>>([]);
  const [nicheFilter, setNicheFilter] = useState('');
  const [availableNiches, setAvailableNiches] = useState<Array<{ id: string; label: string; count: number; iconName?: string; desc?: string }>>([]);
  const [pitchFilter, setPitchFilter] = useState('');
  const [onlyWithReviews, setOnlyWithReviews] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState<number>(25);
  const [activeStreamMonth, setActiveStreamMonth] = useState('Nov');

  // WhatsApp Tab State
  const [waPhone, setWaPhone] = useState('');
  const [waMessage, setWaMessage] = useState('');
  const [waMessageApproved, setWaMessageApproved] = useState(false);
  const [waSendResult, setWaSendResult] = useState<any>(null);
  const [waHistory, setWaHistory] = useState<any[]>([]);
  const [waSenderName, setWaSenderName] = useState(() => localStorage.getItem('wa_sender_name') || 'Geovane');
  const [pitchVariantIndex, setPitchVariantIndex] = useState(0);
  const [pitchIsReady, setPitchIsReady] = useState(true);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [waSession, setWaSession] = useState<{ id: string; name: string; status: string; phone?: string; pushName?: string } | null>(null);

  // Dynamic AI Humanized Pitches (Claude Sonnet 5 + Humanizer)
  const [aiPitchOptions, setAiPitchOptions] = useState<Array<{ title: string; text: string }>>([]);
  const [selectedAiPitchIdx, setSelectedAiPitchIdx] = useState<number | null>(null);
  const [isGeneratingAiPitch, setIsGeneratingAiPitch] = useState(false);

  // WhatsApp Live Chat & Conversations State
  const [waSubView, setWaSubView] = useState<'chat' | 'preview' | 'conversations'>('chat');
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [chatLoading, setChatLoading] = useState(false);
  const [chatSyncing, setChatSyncing] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [chatSending, setChatSending] = useState(false);
  const [conversations, setConversations] = useState<any[]>([]);
  const [conversationsLoading, setConversationsLoading] = useState(false);
  const [conversationsSearch, setConversationsSearch] = useState('');
  const debouncedConversationsSearch = useDebounce(conversationsSearch, 250);
  const chatScrollRef = React.useRef<HTMLDivElement>(null);

  // Humanizer Pitch Generator (Strictly adheres to Geovane's conversational guidelines)
  const buildHumanizedPitch = (lead: Lead, sender: string = waSenderName, variant: number = pitchVariantIndex, isReady: boolean = pitchIsReady) => {
    return generateHumanizedPitch(lead as any, {
      senderName: sender,
      variantIndex: variant,
      isReady
    });
  };

  const handleRegeneratePitch = (targetIndex?: number) => {
    if (!selectedLead) return;
    setIsRegenerating(true);
    const nextIndex = targetIndex !== undefined
      ? targetIndex
      : (pitchVariantIndex + 1) % 3;
    setPitchVariantIndex(nextIndex);
    const newText = generateHumanizedPitch(selectedLead as any, {
      senderName: waSenderName.trim() || 'Geovane',
      variantIndex: nextIndex,
      isReady: pitchIsReady
    });
    setWaMessage(newText);
    setWaMessageApproved(false);
    const varNames = ['Atendimento & Horário (Padrão Geovane)', 'Celular & Fotos de Serviços', 'Direta & Objetiva'];
    addToast('info', 'Abordagem Regerada', `Variação ${nextIndex + 1}: ${varNames[nextIndex]}`);
    setTimeout(() => setIsRegenerating(false), 400);
  };

  const handleTogglePitchReady = (newReady: boolean) => {
    setPitchIsReady(newReady);
    if (selectedLead) {
      const newText = generateHumanizedPitch(selectedLead as any, {
        senderName: waSenderName.trim() || 'Geovane',
        variantIndex: pitchVariantIndex,
        isReady: newReady
      });
      setWaMessage(newText);
      setWaMessageApproved(false);
      addToast(
        'info',
        newReady ? 'Status: Prévia Pronta' : 'Status: Oferecer Preparo',
        newReady ? 'Mensagem ajustada: "Preparei uma prévia..."' : 'Mensagem ajustada: "Posso preparar uma prévia..."'
      );
    }
  };

  const handleGenerateAiPitch = async () => {
    if (!selectedLead) return;
    setIsGeneratingAiPitch(true);
    try {
      const res = await fetch('/api/ai/generate-approach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          leadId: selectedLead.id,
          senderName: waSenderName.trim() || 'Geovane'
        })
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.options) && data.options.length > 0) {
        setAiPitchOptions(data.options);
        setSelectedAiPitchIdx(0);
        setWaMessage(data.options[0].text);
        setWaMessageApproved(false);
        addToast('success', 'Abordagens Geradas (Humanizer)', `${data.options.length} opções geradas via Claude Sonnet 5.`);
      } else if (data.fullText) {
        setWaMessage(data.fullText);
        setWaMessageApproved(false);
        addToast('info', 'Abordagem Gerada', 'Texto criado pelo Claude Sonnet.');
      } else {
        addToast('error', 'Falha ao gerar abordagem', data.error || 'Erro desconhecido');
      }
    } catch (err: any) {
      addToast('error', 'Erro de Conexão com IA', err.message);
    } finally {
      setIsGeneratingAiPitch(false);
    }
  };

  // Edit Lead Modal State
  const [editingLead, setEditingLead] = useState<Lead | null>(null);
  const [editForm, setEditForm] = useState({
    name: '',
    phone: '',
    category: '',
    city: '',
    address: '',
    website: '',
    pitchType: 'no_site',
    priority: 'media',
    stage: 'novo',
    notes: ''
  });
  const [isSavingLead, setIsSavingLead] = useState(false);

  const openEditModal = (lead: Lead) => {
    setEditingLead(lead);
    setEditForm({
      name: lead.name || '',
      phone: lead.phoneRaw || lead.phoneNorm || '',
      category: lead.category || '',
      city: lead.city || '',
      address: lead.address || '',
      website: lead.website || '',
      pitchType: lead.pitchType || 'no_site',
      priority: lead.priority || 'media',
      stage: lead.stage || 'novo',
      notes: (lead as any).notes || ''
    });
  };

  const closeEditModal = () => {
    setEditingLead(null);
  };

  const handleSaveLeadEdit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!editingLead) return;

    try {
      setIsSavingLead(true);
      const res = await fetch(`/api/leads/${editingLead.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm)
      });
      const data = await res.json();
      if (data.success && data.lead) {
        const updated = data.lead;
        setLeads((prev) => prev.map((l) => (l.id === updated.id ? { ...l, ...updated } : l)));
        if (selectedLead && selectedLead.id === updated.id) {
          setSelectedLead({ ...selectedLead, ...updated });
          setWaPhone(updated.phoneNorm || updated.phoneRaw || '');
          const newText = generateHumanizedPitch(updated, {
            senderName: waSenderName.trim() || 'Geovane',
            variantIndex: pitchVariantIndex,
            isReady: pitchIsReady
          });
          setWaMessage(newText);
        }
        if (detailModalLead && detailModalLead.id === updated.id) {
          setDetailModalLead({ ...detailModalLead, ...updated });
        }
        addToast('success', 'Cadastro Atualizado', `Informações de "${updated.name}" salvas no banco.`);
        closeEditModal();
      } else {
        addToast('error', 'Falha ao Salvar', data.error || 'Não foi possível atualizar as informações.');
      }
    } catch (err: any) {
      addToast('error', 'Erro de Conexão', err.message);
    } finally {
      setIsSavingLead(false);
    }
  };

  const handleQuickSavePhone = async () => {
    if (!selectedLead || !waPhone.trim()) return;
    try {
      const res = await fetch(`/api/leads/${selectedLead.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: waPhone.trim() })
      });
      const data = await res.json();
      if (data.success && data.lead) {
        const updated = data.lead;
        setLeads((prev) => prev.map((l) => (l.id === updated.id ? { ...l, ...updated } : l)));
        setSelectedLead({ ...selectedLead, ...updated });
        setWaPhone(updated.phoneNorm || updated.phoneRaw || '');
        addToast('success', 'Telefone Salvo', `Novo WhatsApp (${updated.phoneNorm}) atualizado no cadastro.`);
      }
    } catch (err: any) {
      addToast('error', 'Erro ao salvar telefone', err.message);
    }
  };

  // Prototypes Tab State
  const [briefBusinessName, setBriefBusinessName] = useState('');
  const [briefSegment, setBriefSegment] = useState('');
  const [briefCta, setBriefCta] = useState('Chamar no WhatsApp');
  const [briefServices, setBriefServices] = useState('Atendimento Rápido, Produtos de Alta Qualidade, Orçamento Sem Compromisso');
  const [briefTheme, setBriefTheme] = useState('auto');
  const [currentPrototypeUrl, setCurrentPrototypeUrl] = useState<string | null>(null);
  const [previewViewport, setPreviewViewport] = useState<'desktop' | 'mobile' | 'tablet'>('desktop');
  const [canvasViewMode, setCanvasViewMode] = useState<'page' | 'studio'>('page');
  const [prototypesList, setPrototypesList] = useState<any[]>([]);

  // Brazilian Niche Kits State (Conversão Brasileira)
  const [nicheKits, setNicheKits] = useState<any[]>([]);
  const [selectedNicheKey, setSelectedNicheKey] = useState<string>('health');
  const [forceShowAllNiches, setForceShowAllNiches] = useState(false);
  const [prototypeSubTab, setPrototypeSubTab] = useState<'niche_models' | 'custom_canvas'>('niche_models');
  const [applyingNiche, setApplyingNiche] = useState(false);
  const [nicheIframeKey, setNicheIframeKey] = useState(Date.now());
  const [previewEngine, setPreviewEngine] = useState<'react' | 'ssr'>('react');

  // Auto-sincroniza o nicho exibido com o nicho do comércio selecionado
  useEffect(() => {
    if (selectedLead) {
      const niche = detectNicheFromCategory(selectedLead.category, selectedLead.name);
      setSelectedNicheKey(niche);
      setNicheIframeKey(Date.now());
    }
  }, [selectedLead?.id, selectedLead?.category, selectedLead?.name]);

  // Vercel Live Deployment State
  const [deployingVercel, setDeployingVercel] = useState(false);
  const [showVercelModal, setShowVercelModal] = useState(false);
  const [vercelTokenInput, setVercelTokenInput] = useState('');
  const [vercelTeamIdInput, setVercelTeamIdInput] = useState('');
  const [vercelConfigStatus, setVercelConfigStatus] = useState<{ hasToken: boolean; valid?: boolean; user?: string } | null>(null);

  // Doop Managed Process State
  const [doopProcStatus, setDoopProcStatus] = useState<any>({});
  const [showDoopLogs, setShowDoopLogs] = useState(false);
  const [doopLogs, setDoopLogs] = useState<string[]>([]);

  // Toast Notifications System (Sonner-like)
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const addToast = (type: 'success' | 'error' | 'info' | 'warning', title: string, message?: string) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, type, title, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3800);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(label);
      addToast('info', 'Copiado para a área de transferência', label);
      setTimeout(() => setCopiedField(null), 2000);
    } catch {
      addToast('error', 'Falha ao copiar texto');
    }
  };

  const handleThemeChange = (newTheme: string) => {
    setBriefTheme(newTheme);
    const doopProto = prototypesList.find((p) => p.provider === 'doop' || p.artifactType === 'doop_canvas' || p.id?.startsWith('canvas_'));
    const canvasId = selectedLead?.doopCanvasId || (doopProto?.id?.startsWith('canvas_') ? doopProto.id.replace('canvas_', '') : (doopProto?.url?.includes('/c/') ? doopProto.url.split('/c/')[1] : null));
    if (canvasId) {
      setCurrentPrototypeUrl(
        canvasViewMode === 'studio'
          ? `http://localhost:4300/c/${canvasId}`
          : `/api/prototypes/canvas/${canvasId}/preview?viewport=${previewViewport}&theme=${newTheme}&t=${Date.now()}`
      );
    }
  };

  // Load WhatsApp active session info
  const loadWaSession = async () => {
    try {
      const res = await fetch('/api/whatsapp/session');
      const data = await res.json();
      if (data.success && data.session) {
        setWaSession(data.session);
      } else {
        setWaSession(null);
      }
    } catch {
      setWaSession(null);
    }
  };

  // Load Status with SWR (instant cached render + background revalidation)
  const loadStatus = async () => {
    try {
      await fetchWithSWR('/api/status', (data: any) => {
        if (data && data.success) {
          setServices(data.services);
          setStats(data.stats);
          if (Array.isArray(data.stats?.cityCounts) && data.stats.cityCounts.length > 0) {
            setAvailableCities(data.stats.cityCounts);
          }
          if (Array.isArray(data.stats?.nicheCounts) && data.stats.nicheCounts.length > 0) {
            setAvailableNiches(data.stats.nicheCounts);
          }
          setMode(data.mode);
          if (data.doopStatus) {
            setDoopProcStatus(data.doopStatus);
          }
        }
      }, 5000);
      await loadWaSession();
      loadAiStatus();
      loadAiConfig();
      checkVercelConfig();
    } catch (err) {
      console.error('Erro ao carregar status:', err);
    }
  };

  const loadAiStatus = async () => {
    try {
      const res = await fetch('/api/ai/status');
      const data = await res.json();
      if (data && data.success) {
        setAiStatus({
          available: Boolean(data.available),
          model: data.model || 'claude-sonnet-5',
          latencyMs: data.latencyMs,
          error: data.error
        });
      }
    } catch {
      // Ignore background network error
    }
  };

  const loadAiConfig = async () => {
    try {
      const res = await fetch('/api/ai/config');
      const data = await res.json();
      if (data && data.success && data.config) {
        setAiConfig(data.config);
      }
    } catch {
      // Ignore
    }
  };

  const handleTestAi = async () => {
    setIsTestingAi(true);
    try {
      const res = await fetch('/api/ai/status');
      const data = await res.json();
      if (data.success && data.available) {
        setAiStatus({
          available: true,
          model: data.model || 'claude-sonnet-5',
          latencyMs: data.latencyMs
        });
        addToast('success', 'Claude Sonnet Online', `Conexão validada em ${data.latencyMs}ms (${data.model}).`);
      } else {
        setAiStatus({
          available: false,
          model: data.model || 'claude-sonnet-5',
          error: data.error
        });
        addToast('error', 'Falha no Claude Sonnet', data.error || 'Não foi possível conectar.');
      }
    } catch (err: any) {
      addToast('error', 'Erro de Conexão', err.message);
    } finally {
      setIsTestingAi(false);
    }
  };

  // Update operation mode persistently
  const handleUpdateMode = async (newMode: 'mock' | 'integrado_sem_envio' | 'real') => {
    try {
      setMode(newMode);
      invalidateClientCache('/api/status');
      const res = await fetch('/api/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode: newMode })
      });
      const data = await res.json();
      if (data.success) {
        if (newMode === 'real') {
          addToast('warning', 'Modo Piloto Real Ativado', 'Atenção: disparos aprovados agora serão transmitidos pelo WhatsApp.');
        } else if (newMode === 'integrado_sem_envio') {
          addToast('success', 'Modo Seguro Ativo', 'Leitura real ativada com envio protegido (simulação de histórico).');
        } else {
          addToast('info', 'Modo Mock Ativado', 'Executando em modo Mock isolado.');
        }
        await loadStatus();
      } else {
        addToast('error', 'Falha ao salvar modo', data.error);
      }
    } catch (err: any) {
      addToast('error', 'Erro de conexão', err.message);
    }
  };

  // Load Cities dynamically with lead counts (SWR cached)
  const loadCities = async () => {
    try {
      await fetchWithSWR('/api/cities', (data: any) => {
        if (data && data.success && Array.isArray(data.cities)) {
          setAvailableCities(data.cities);
        }
      }, 15000);
    } catch (err) {
      console.error('Erro ao carregar lista de cidades:', err);
    }
  };

  // Load Niches dynamically with counts (SWR cached)
  const loadNiches = async () => {
    try {
      await fetchWithSWR('/api/niches', (data: any) => {
        if (data && data.success && Array.isArray(data.niches)) {
          setAvailableNiches(data.niches);
        }
      }, 15000);
    } catch (err) {
      console.error('Erro ao carregar lista de nichos:', err);
    }
  };

  // Load Brazilian Niche Kits for Pre-defined High-Conversion Models
  const loadNicheKits = async () => {
    try {
      const res = await fetch('/api/niche-kits');
      const data = await res.json();
      if (data && data.success && Array.isArray(data.kits)) {
        setNicheKits(data.kits);
      }
    } catch (err: any) {
      console.error('Erro ao carregar kits de nicho:', err);
    }
  };

  // Apply a Pre-defined Brazilian Niche Model directly to the current Lead
  const handleApplyNiche = async (kitId: string, leadId: string) => {
    if (!leadId) return;
    try {
      setApplyingNiche(true);
      const res = await fetch(`/api/niche-kits/${kitId}/apply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leadId })
      });
      const data = await res.json();
      if (data.success) {
        addToast('success', 'Modelo Aplicado com Sucesso!', `O modelo '${data.kit}' foi adaptado para ${selectedLead?.name}.`);
        if (data.brief) {
          setBriefBusinessName(data.brief.businessName || '');
          setBriefSegment(data.brief.segment || '');
          setBriefCta(data.brief.cta || '');
          setBriefServices((data.brief.services || []).map((s: any) => s.title).join(', '));
        }
        setNicheIframeKey(Date.now());
        const lRes = await fetch(`/api/leads/${leadId}`);
        const lData = await lRes.json();
        if (lData.success && lData.lead) {
          setSelectedLead(lData.lead);
          setLeads(prev => prev.map(l => l.id === leadId ? { ...l, ...lData.lead } : l));
        }
      } else {
        addToast('error', 'Erro ao aplicar modelo', data.error);
      }
    } catch (err: any) {
      addToast('error', 'Erro ao aplicar modelo', err.message);
    } finally {
      setApplyingNiche(false);
    }
  };

  // Load Leads with SWR and Summary fields support (Sparse Fields)
  const loadLeads = async (searchQuery: string = debouncedSearch) => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (searchQuery) params.append('search', searchQuery);
      if (cityFilter) params.append('city', cityFilter);
      if (nicheFilter) params.append('niche', nicheFilter);
      if (pitchFilter && pitchFilter !== 'has_reviews') params.append('pitchType', pitchFilter);
      params.append('summary', 'true');

      await fetchWithSWR(`/api/leads?${params.toString()}`, (data: any) => {
        if (data && data.success && Array.isArray(data.leads)) {
          setLeads(data.leads);
          if (!selectedLead && !pendingLeadIdFromUrl && data.leads.length > 0) {
            selectLead(data.leads[0]);
          }
        }
      }, 10000);
    } catch (err) {
      console.error('Erro ao buscar leads:', err);
      addToast('error', 'Erro ao carregar contatos', 'Não foi possível buscar a lista de leads.');
    } finally {
      setLoading(false);
    }
  };

  // Site Validation Handlers
  const [isValidatingSite, setIsValidatingSite] = useState(false);
  const [isBatchValidating, setIsBatchValidating] = useState(false);

  const handleRevalidateLeadSite = async (leadId: string) => {
    setIsValidatingSite(true);
    try {
      const res = await fetch(`/api/leads/${leadId}/revalidate-site`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      const data = await res.json();
      if (data.success && data.lead) {
        setLeads((prev) => prev.map((l) => (l.id === data.lead.id ? data.lead : l)));
        if (selectedLead?.id === data.lead.id) setSelectedLead(data.lead);
        if (detailModalLead?.id === data.lead.id) setDetailModalLead(data.lead);
        addToast(
          data.lead.pitchType === 'active_site' ? 'success' : 'info',
          'Diagnóstico Atualizado',
          data.message || data.lead.siteAuditReason
        );
        loadStatus();
      } else {
        addToast('error', 'Falha ao revalidar', data.error || 'Erro desconhecido');
      }
    } catch (err: any) {
      addToast('error', 'Erro de conexão', err.message);
    } finally {
      setIsValidatingSite(false);
    }
  };

  const handleBatchRevalidateTimeouts = async () => {
    setIsBatchValidating(true);
    addToast('info', 'Revalidação em lote iniciada', 'Testando conexões de sites com cabeçalhos reais...');
    try {
      const res = await fetch('/api/leads/revalidate-timeouts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ limit: 250 })
      });
      const data = await res.json();
      if (data.success) {
        addToast(
          'success',
          'Revalidação Concluída!',
          `${data.summary.recoveredOnline} sites recuperados como online (${data.summary.totalChecked} testados)`
        );
        loadLeads();
        loadStatus();
      } else {
        addToast('error', 'Erro na revalidação', data.error);
      }
    } catch (err: any) {
      addToast('error', 'Erro ao processar lote', err.message);
    } finally {
      setIsBatchValidating(false);
    }
  };

  useEffect(() => {
    loadStatus();
    loadCities();
    loadNiches();
    loadNicheKits();
    loadLeads();
    const interval = setInterval(loadStatus, 5000);
    return () => clearInterval(interval);
  }, []);

  // Global shortcut '/' to focus search input
  useEffect(() => {
    const handleShortcut = (e: KeyboardEvent) => {
      const activeTag = document.activeElement?.tagName;
      if (
        (e.key === '/' || ((e.metaKey || e.ctrlKey) && e.key === 'k')) &&
        activeTag !== 'INPUT' &&
        activeTag !== 'TEXTAREA'
      ) {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
      if (
        (e.metaKey || e.ctrlKey) &&
        (e.key === 'b' || e.key === 'B') &&
        activeTag !== 'INPUT' &&
        activeTag !== 'TEXTAREA'
      ) {
        e.preventDefault();
        toggleDesktopSidebar();
      }
    };
    window.addEventListener('keydown', handleShortcut);
    return () => window.removeEventListener('keydown', handleShortcut);
  }, []);

  useEffect(() => {
    setCurrentPage(1);
    loadLeads(debouncedSearch);
  }, [debouncedSearch, cityFilter, nicheFilter, pitchFilter]);

  // Global ESC handler for accessible modal dismissal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (aiDrawerOpen) {
          setAiDrawerOpen(false);
        } else if (detailModalLead) {
          setDetailModalLead(null);
        } else if (showDoopLogs) {
          setShowDoopLogs(false);
        } else if (mobileSidebarOpen) {
          setMobileSidebarOpen(false);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [aiDrawerOpen, detailModalLead, showDoopLogs, mobileSidebarOpen]);

  // Filtered leads calculation (including niche and reviews filter)
  const displayedLeads = leads.filter((lead) => {
    if (nicheFilter && lead.niche !== nicheFilter) {
      return false;
    }
    if (onlyWithReviews) {
      const reviews = parseLeadReviews(lead.userReviews);
      if (reviews.length === 0) return false;
    }
    if (pitchFilter === 'has_reviews') {
      const reviews = parseLeadReviews(lead.userReviews);
      if (reviews.length === 0) return false;
    }
    return true;
  });

  const totalPages = Math.max(1, Math.ceil(displayedLeads.length / pageSize));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const startIndex = (safeCurrentPage - 1) * pageSize;
  const paginatedLeads = displayedLeads.slice(startIndex, startIndex + pageSize);

  // Table Horizontal Scroll & Edge Gradient Fade State
  const tableScrollRef = useRef<HTMLDivElement>(null);
  const [canScrollTableLeft, setCanScrollTableLeft] = useState(false);
  const [canScrollTableRight, setCanScrollTableRight] = useState(false);
  const [isTableGrabbing, setIsTableGrabbing] = useState(false);

  const isTableDownRef = useRef(false);
  const tableStartXRef = useRef(0);
  const tableScrollLeftStartRef = useRef(0);
  const tableHasDraggedRef = useRef(false);

  const updateTableScrollState = useCallback(() => {
    const el = tableScrollRef.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    setCanScrollTableLeft(scrollLeft > 6);
    setCanScrollTableRight(scrollLeft < scrollWidth - clientWidth - 6);
  }, []);

  useEffect(() => {
    const el = tableScrollRef.current;
    if (!el) return;
    updateTableScrollState();

    const timer = setTimeout(updateTableScrollState, 200);
    const ro = new ResizeObserver(() => updateTableScrollState());
    ro.observe(el);

    const handleScroll = () => updateTableScrollState();
    el.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      clearTimeout(timer);
      ro.disconnect();
      el.removeEventListener('scroll', handleScroll);
    };
  }, [updateTableScrollState, displayedLeads, currentPage, pageSize]);

  useEffect(() => {
    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (!isTableDownRef.current || !tableScrollRef.current) return;
      const x = e.pageX;
      const walk = (x - tableStartXRef.current) * 1.35;
      tableScrollRef.current.scrollLeft = tableScrollLeftStartRef.current - walk;

      if (Math.abs(walk) > 4) {
        tableHasDraggedRef.current = true;
      }
      updateTableScrollState();
    };

    const handleGlobalMouseUp = () => {
      if (isTableDownRef.current) {
        isTableDownRef.current = false;
        setIsTableGrabbing(false);
        if (tableHasDraggedRef.current) {
          setTimeout(() => {
            tableHasDraggedRef.current = false;
          }, 60);
        }
      }
    };

    window.addEventListener('mousemove', handleGlobalMouseMove);
    window.addEventListener('mouseup', handleGlobalMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleGlobalMouseMove);
      window.removeEventListener('mouseup', handleGlobalMouseUp);
    };
  }, [updateTableScrollState]);

  const handleTableMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.button !== 0) return;
    const el = tableScrollRef.current;
    if (!el) return;

    isTableDownRef.current = true;
    tableHasDraggedRef.current = false;
    tableStartXRef.current = e.pageX;
    tableScrollLeftStartRef.current = el.scrollLeft;
    setIsTableGrabbing(true);
  };

  const handleTableClickCapture = (e: React.MouseEvent) => {
    if (tableHasDraggedRef.current) {
      e.stopPropagation();
      e.preventDefault();
    }
  };

  // Filtered active conversations
  const filteredConversations = conversations.filter((c) => {
    if (conversationsFilter === 'inbound' && !c.hasInbound) return false;
    if (conversationsFilter === 'waiting' && c.hasInbound) return false;

    if (!debouncedConversationsSearch.trim()) return true;
    const q = debouncedConversationsSearch.toLowerCase();
    return (
      (c.name && c.name.toLowerCase().includes(q)) ||
      (c.city && c.city.toLowerCase().includes(q)) ||
      (c.category && c.category.toLowerCase().includes(q)) ||
      (c.phoneNorm && c.phoneNorm.includes(q)) ||
      (c.phoneRaw && c.phoneRaw.includes(q)) ||
      (c.lastMessage?.body && c.lastMessage.body.toLowerCase().includes(q))
    );
  });

  // Chat & Conversation Handlers
  const loadChatMessages = async (leadId: string, silent = false) => {
    if (!leadId) return;
    try {
      if (!silent) setChatLoading(true);
      else setChatSyncing(true);
      const res = await fetch(`/api/whatsapp/chat/${leadId}`);
      const data = await res.json();
      if (data.success && Array.isArray(data.messages)) {
        setChatMessages(data.messages);
        setWaHistory(data.messages);
      }
    } catch (err) {
      if (!silent) console.error('Erro ao carregar chat:', err);
    } finally {
      if (!silent) setChatLoading(false);
      setChatSyncing(false);
    }
  };

  const loadActiveConversations = async (silent = false) => {
    try {
      if (!silent) setConversationsLoading(true);
      await fetchWithSWR('/api/whatsapp/conversations', (data: any) => {
        if (data && data.success && Array.isArray(data.conversations)) {
          setConversations(data.conversations);
        }
      }, 5000);
    } catch (err) {
      if (!silent) console.error('Erro ao listar conversas:', err);
    } finally {
      if (!silent) setConversationsLoading(false);
    }
  };

  const handleSendChatReply = async (customText?: string) => {
    const textToSend = (customText !== undefined ? customText : chatInput).trim();
    if (!textToSend || !selectedLead) return;
    try {
      setChatSending(true);
      const res = await fetch(`/api/whatsapp/chat/${selectedLead.id}/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: textToSend,
          senderName: waSenderName.trim() || 'Geovane'
        })
      });
      const data = await res.json();
      if (data.success) {
        if (!customText) setChatInput('');
        addToast(
          data.mode === 'real' ? 'success' : 'info',
          data.mode === 'real' ? 'Resposta Enviada' : 'Simulação de Resposta',
          data.mode === 'real'
            ? 'Mensagem disparada com sucesso no WhatsApp.'
            : 'Gravado no histórico de auditoria (Modo Seguro).'
        );
        await loadChatMessages(selectedLead.id, true);
        await loadActiveConversations(true);
        setTimeout(() => {
          if (chatScrollRef.current) {
            chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
          }
        }, 100);
      } else {
        addToast('error', 'Falha ao Enviar', data.error || 'Não foi possível enviar a resposta.');
      }
    } catch (err: any) {
      addToast('error', 'Erro no Envio', err.message);
    } finally {
      setChatSending(false);
    }
  };

  // Auto-scroll chat feed to bottom on new messages or view change
  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [chatMessages.length, waSubView]);

  // Polling for live chat updates & active conversations
  useEffect(() => {
    if (tab !== 'whatsapp' && tab !== 'conversations') return;
    loadActiveConversations(true);
    if (selectedLead?.id) {
      loadChatMessages(selectedLead.id, true);
    }
    const timer = setInterval(() => {
      loadActiveConversations(true);
      if (selectedLead?.id) {
        loadChatMessages(selectedLead.id, true);
      }
    }, 4000);
    return () => clearInterval(timer);
  }, [tab, selectedLead?.id]);

  // Select Lead & fill tabs
  const selectLead = async (lead: Lead) => {
    setSelectedLead(lead);
    if (tab !== 'overview' && tab !== 'settings') {
      replaceRoute(tab, lead.id);
    }
    if (tab === 'conversations') {
      setMobileChatOpen(true);
    }
    setWaPhone(lead.phoneNorm || lead.phoneRaw);
    setWaMessageApproved(false);
    setWaSendResult(null);

    // Populate Briefing fields
    setBriefBusinessName(lead.name);
    setBriefSegment(lead.category || 'Comércio Local');
    setBriefCta('Fale Conosco pelo WhatsApp');
    setBriefTheme('auto');

    const isBarber = /barber|barbearia|cabelo|barba/i.test(`${lead.category} ${lead.name}`);
    if (isBarber) {
      setBriefServices('Corte Degradê & Social, Barba Terapia Tradicional, Combo Cabelo + Barba, Acabamento & Sobrancelha');
    } else {
      setBriefServices('Atendimento Rápido, Produtos de Alta Qualidade, Orçamento Sem Compromisso');
    }

    // Fetch lead details and history
    try {
      const isReadyDefault = true;
      setPitchIsReady(isReadyDefault);
      setPitchVariantIndex(0);
      const sender = waSenderName || 'Geovane';
      const query = `?senderName=${encodeURIComponent(sender)}&isReady=${isReadyDefault}`;
      const res = await fetch(`/api/leads/${lead.id}${query}`);
      const data = await res.json();
      if (data.success) {
        setWaMessage(data.suggestedPitch || buildHumanizedPitch(lead, sender, 0, isReadyDefault));
        setWaHistory(data.messages || []);
        setPrototypesList(data.prototypes || []);
        const doopProto = (data.prototypes || []).find((p: any) => p.provider === 'doop' || p.artifactType === 'doop_canvas' || p.id?.startsWith('canvas_'));
        const canvasId = doopProto?.id?.startsWith('canvas_')
          ? doopProto.id.replace('canvas_', '')
          : (data.lead?.doopCanvasId || (doopProto?.url?.includes('/c/') ? doopProto.url.split('/c/')[1] : null));

        if (canvasId) {
          setCurrentPrototypeUrl(
            canvasViewMode === 'studio'
              ? `http://localhost:4300/c/${canvasId}`
              : `/api/prototypes/canvas/${canvasId}/preview?viewport=${previewViewport}`
          );
        } else {
          setCurrentPrototypeUrl(null);
        }
        loadChatMessages(lead.id, true);
        loadActiveConversations(true);
      }
    } catch (e) {
      console.error('Erro ao carregar detalhes:', e);
      setWaMessage(buildHumanizedPitch(lead, waSenderName || 'Geovane', 0, true));
    }
  };

  // Import Leads
  const handleImportLeads = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/leads/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ limit: 150 })
      });
      const data = await res.json();
      if (data.success) {
        addToast('success', 'Importação Concluída', `${data.importedCount} comércios carregados do scraper (RMBH).`);
        loadLeads();
        loadStatus();
      } else {
        addToast('error', 'Falha na Importação', data.error || 'Não foi possível importar leads.');
      }
    } catch (err: any) {
      addToast('error', 'Erro de Conexão', err.message);
    } finally {
      setLoading(false);
    }
  };

  // Doop Controls
  const handleStartDoop = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/services/doop/start', { method: 'POST' });
      const data = await res.json();
      addToast(data.success ? 'success' : 'warning', 'Serviço Doop', data.message);
      loadStatus();
    } catch (err: any) {
      addToast('error', 'Erro ao Iniciar Doop', err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleStopDoop = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/services/doop/stop', { method: 'POST' });
      const data = await res.json();
      addToast('info', 'Serviço Doop', data.message);
      loadStatus();
    } catch (err: any) {
      addToast('error', 'Erro ao Parar Doop', err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRestartDoop = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/services/doop/restart', { method: 'POST' });
      const data = await res.json();
      addToast('success', 'Serviço Doop', data.message);
      loadStatus();
    } catch (err: any) {
      addToast('error', 'Erro ao Reiniciar Doop', err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDoopLogs = async () => {
    try {
      const res = await fetch('/api/services/doop/logs');
      const data = await res.json();
      if (data.success) {
        setDoopLogs(data.logs);
        setShowDoopLogs(true);
      }
    } catch (err) {
      console.error(err);
      addToast('error', 'Logs do Doop', 'Não foi possível carregar o log de execução.');
    }
  };

  // WhatsApp Actions
  const handlePrepareWhatsApp = (lead: Lead) => {
    selectLead(lead);
    setTab('whatsapp');
  };

  const handleApproveWhatsApp = () => {
    setWaMessageApproved(true);
    addToast('success', 'Conteúdo Aprovado', 'Abordagem comercial validada e pronta para disparo.');
  };

  const handleSendWhatsApp = async () => {
    if (!selectedLead) return;
    try {
      setLoading(true);
      const res = await fetch('/api/whatsapp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          leadId: selectedLead.id,
          phone: waPhone,
          body: waMessage,
          mode
        })
      });
      const data = await res.json();
      if (data.success) {
        setWaSendResult(data.result);
        if (data.mode === 'real') {
          addToast('success', 'WhatsApp Enviado', 'Mensagem enviada com sucesso para o comerciante via WhatsApp.');
        } else {
          addToast('info', 'Envio Simulado (Modo Seguro)', 'Registro gravado no histórico. Disparo físico bloqueado no Modo Seguro.');
        }
        setWaSubView('chat');
        await loadChatMessages(selectedLead.id, true);
        await loadActiveConversations(true);
        selectLead(selectedLead);
        await loadStatus();
      } else {
        addToast('error', 'Falha no Envio', data.error || 'Não foi possível processar o envio.');
      }
    } catch (err: any) {
      addToast('error', 'Erro no Envio', err.message);
    } finally {
      setLoading(false);
    }
  };

  // Prototype Actions
  const handlePreparePrototype = (lead: Lead) => {
    selectLead(lead);
    setTab('prototypes');
  };

  const handleGeneratePrototype = async () => {
    if (!selectedLead) return;
    try {
      setLoading(true);
      // Save briefing first
      await fetch('/api/prototypes/briefing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          leadId: selectedLead.id,
          businessName: briefBusinessName,
          segment: briefSegment,
          cta: briefCta,
          services: briefServices.split(',').map((s) => s.trim()).filter(Boolean),
          identityNotes: briefTheme,
          status: 'confirmado'
        })
      });

      // Pin existing canvas ID if one already exists for this lead
      const doopProto = prototypesList.find((p) => p.provider === 'doop' || p.artifactType === 'doop_canvas' || p.id?.startsWith('canvas_'));
      const existingCanvasId = selectedLead.doopCanvasId || (doopProto?.id?.startsWith('canvas_') ? doopProto.id.replace('canvas_', '') : (doopProto?.url?.includes('/c/') ? doopProto.url.split('/c/')[1] : undefined));

      // Generate or update unique canvas in Doop (reusing existingCanvasId)
      const res = await fetch(`/api/leads/${selectedLead.id}/create-canvas`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          canvasId: existingCanvasId,
          theme: briefTheme,
          services: briefServices.split(',').map((s) => s.trim()).filter(Boolean),
          cta: briefCta
        })
      });
      const data = await res.json();
      if (data.success) {
        const finalCanvasId = data.canvasId || existingCanvasId;
        setCurrentPrototypeUrl(
          canvasViewMode === 'studio'
            ? `http://localhost:4300/c/${finalCanvasId}`
            : `/api/prototypes/canvas/${finalCanvasId}/preview?viewport=${previewViewport}&t=${Date.now()}`
        );
        await selectLead({
          ...selectedLead,
          doopCanvasId: finalCanvasId,
          doopCanvasUrl: data.canvasUrl,
          stage: 'prototipo_em_revisao'
        });
        await loadLeads();
        addToast(
          'success',
          existingCanvasId ? 'Canvas do Doop Atualizado' : 'Canvas Criado no Doop',
          `Canvas oficial ${finalCanvasId} mantido com 12 pranchetas.`
        );
      } else {
        addToast('error', 'Falha no Doop', data.error || 'Erro ao processar o canvas no Doop.');
      }
    } catch (err: any) {
      addToast('error', 'Erro no Layout', err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeployVercel = async (leadToDeploy = selectedLead) => {
    if (!leadToDeploy) return;
    try {
      setDeployingVercel(true);
      const res = await fetch(`/api/leads/${leadToDeploy.id}/deploy-vercel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: vercelTokenInput || undefined,
          teamId: vercelTeamIdInput || undefined
        })
      });
      const data = await res.json();
      if (data.success && data.url) {
        addToast(
          'success',
          'Site Publicado na Vercel!',
          `Link ao vivo: ${data.url}`
        );
        if (data.lead) {
          await selectLead(data.lead);
        }
        await loadLeads();
      } else if (data.requiresToken) {
        setShowVercelModal(true);
        addToast(
          'info',
          'Configurar Token da Vercel',
          'Insira seu token pessoal da Vercel para concluir a publicação com link ao vivo.'
        );
      } else {
        addToast('error', 'Falha ao publicar na Vercel', data.error || 'Erro desconhecido');
      }
    } catch (err: any) {
      addToast('error', 'Erro no Deploy', err.message);
    } finally {
      setDeployingVercel(false);
    }
  };

  const handleSaveVercelConfig = async () => {
    if (!vercelTokenInput.trim()) {
      addToast('warning', 'Token vazio', 'Por favor insira um token da Vercel.');
      return;
    }
    try {
      setLoading(true);
      const res = await fetch('/api/vercel/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: vercelTokenInput.trim(),
          teamId: vercelTeamIdInput.trim()
        })
      });
      const data = await res.json();
      if (data.success) {
        setVercelConfigStatus({ hasToken: true, valid: data.valid, user: data.user });
        if (data.valid) {
          addToast('success', 'Vercel Conectada!', `Autenticado com sucesso como ${data.user || 'usuário'}`);
          setShowVercelModal(false);
          if (selectedLead) {
            handleDeployVercel(selectedLead);
          }
        } else {
          addToast('warning', 'Token Salvo', data.error || 'Token salvo, mas não foi possível verificar a conta.');
        }
      } else {
        addToast('error', 'Erro ao salvar', data.error || 'Falha ao salvar configuração');
      }
    } catch (err: any) {
      addToast('error', 'Erro', err.message);
    } finally {
      setLoading(false);
    }
  };

  const checkVercelConfig = async () => {
    try {
      const res = await fetch('/api/vercel/config');
      const data = await res.json();
      if (data && data.success) {
        setVercelConfigStatus({
          hasToken: Boolean(data.hasToken),
          valid: Boolean(data.valid),
          user: data.user
        });
      }
    } catch (err) {
      console.error('Erro ao verificar status da Vercel:', err);
    }
  };

  // Visual Themes List
  const themesList = [
    { id: 'auto', label: 'Automático', desc: 'Detectar pelo segmento', icon: Wand2 },
    { id: 'barber', label: 'Barbearia & Barber', desc: 'Dark Barber Luxury', icon: Scissors },
    { id: 'health', label: 'Saúde & Estética', desc: 'Clean Hospitalar & Odonto', icon: HeartPulse },
    { id: 'gastro', label: 'Gastronomia', desc: 'Warm Dark & Delivery', icon: UtensilsCrossed },
    { id: 'auto_mechanic', label: 'Oficinas & Auto', desc: 'Industrial Slate', icon: Wrench },
    { id: 'corporate', label: 'Corporativo & Geral', desc: 'Modern Blue Saas', icon: Building2 }
  ];

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#fafafa] dark:bg-[#0b0b0e] text-[#171717] dark:text-[#f4f4f6] font-sans antialiased selection:bg-[#EB5E28]/35 selection:text-white transition-colors duration-150">
      {/* Mobile Drawer Backdrop */}
      {mobileSidebarOpen && (
        <div
          onClick={() => setMobileSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-black/75 backdrop-blur-sm md:hidden transition-opacity"
        />
      )}

      {/* Modern High-End Collapsible Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 h-full bg-[#f4f4f5] dark:bg-[#0e0e12] border-r border-black/[0.08] dark:border-white/[0.06] flex flex-col justify-between transition-all duration-200 ease-out md:static md:h-screen md:shrink-0 ${
          mobileSidebarOpen ? 'w-[260px] translate-x-0 shadow-xl' : 'w-[260px] -translate-x-full md:translate-x-0'
        } ${
          desktopSidebarCollapsed
            ? 'md:hidden'
            : 'md:w-[260px] md:min-w-[260px]'
        }`}
      >
        <div className="flex flex-col flex-1 overflow-y-auto w-[260px]">
          {/* Sidebar Brand Header */}
          <div className="h-14 min-h-14 shrink-0 px-4 border-b border-black/[0.08] dark:border-white/[0.06] flex items-center justify-between">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-7 h-7 rounded-lg bg-[#EB5E28] text-white flex items-center justify-center font-heading font-semibold text-xs shadow-xs shrink-0 ring-1 ring-white/10">
                <Layers className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <h1 className="font-heading font-semibold text-sm tracking-tight text-[#171717] dark:text-[#f4f4f6] truncate">
                    Prospec
                  </h1>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-black/5 dark:bg-white/[0.08] text-[#737373] dark:text-[#8e8e98] shrink-0 font-medium">
                    RMBH
                  </span>
                </div>
                <div className="flex items-center gap-1 text-[10px] text-emerald-600 dark:text-emerald-400 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 ring-2 ring-emerald-500/20"></span>
                  <span className="truncate">Prospec Local</span>
                </div>
              </div>
            </div>

            {/* Collapse/Close button (Desktop + Mobile) */}
            <button
              onClick={() => {
                if (window.innerWidth < 768) {
                  setMobileSidebarOpen(false);
                } else {
                  toggleDesktopSidebar();
                }
              }}
              className="p-1.5 rounded-lg text-[#737373] hover:text-[#171717] dark:text-[#8e8e98] dark:hover:text-[#f4f4f6] hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer shrink-0"
              title="Fechar / Recolher menu lateral (Ctrl+B)"
              aria-label="Fechar menu lateral"
            >
              <PanelLeftClose className="w-4 h-4" />
            </button>
          </div>

          {/* Quick Search Shortcut */}
          <div className="p-3 border-b border-black/[0.06] dark:border-white/[0.06]">
            <div
              onClick={() => {
                setTab('leads');
                setTimeout(() => searchInputRef.current?.focus(), 100);
              }}
              className="flex h-9 items-center rounded-xl border border-black/[0.08] dark:border-white/[0.07] bg-white dark:bg-[#141418] px-3 text-xs text-[#737373] dark:text-[#8e8e98] cursor-pointer hover:border-[#EB5E28]/40 transition-colors shadow-2xs"
            >
              <Search className="w-3.5 h-3.5 mr-2 shrink-0 text-[#737373] dark:text-[#6e6e78]" />
              <span className="flex-1 truncate">Buscar comércio, nicho...</span>
              <kbd className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-black/5 dark:bg-white/[0.08] border border-black/5 dark:border-white/[0.08] text-[#737373] dark:text-[#8e8e98]">
                ⌘K
              </kbd>
            </div>
          </div>

          {/* Active Selected Commerce Pinned in Sidebar */}
          <div className="p-3 border-b border-black/[0.06] dark:border-white/[0.06]">
            {selectedLead ? (
              <div className="p-3 rounded-xl bg-white dark:bg-[#19191b] border border-black/[0.08] dark:border-white/[0.08] shadow-2xs space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-[11px] font-medium text-[#EB5E28]">
                    <Building2 className="w-3 h-3 text-[#EB5E28]" />
                    <span>Comércio em Foco</span>
                  </div>
                  <button
                    onClick={() => {
                      setTab('leads');
                      setMobileSidebarOpen(false);
                    }}
                    className="text-[10px] text-[#737373] dark:text-[#85858b] hover:text-[#171717] dark:hover:text-[#ededed] transition-colors cursor-pointer font-medium whitespace-nowrap shrink-0"
                    title="Trocar comércio"
                  >
                    Trocar
                  </button>
                </div>

                <div>
                  <div
                    className="font-heading font-medium text-xs text-[#171717] dark:text-[#ededed] leading-snug line-clamp-2"
                    title={selectedLead.name}
                  >
                    {selectedLead.name}
                  </div>
                  <div className="flex items-center gap-1 text-[10px] text-[#737373] dark:text-[#85858b] mt-0.5 truncate">
                    <span>{selectedLead.category}</span>
                    <span>•</span>
                    <span>{selectedLead.city}</span>
                  </div>
                  {(selectedLead.phoneNorm || selectedLead.phoneRaw) && (
                    <div className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 mt-0.5 truncate">
                      {selectedLead.phoneNorm || selectedLead.phoneRaw}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-1.5 pt-1.5 border-t border-black/[0.06] dark:border-white/[0.06]">
                  <a
                    href={buildRouteUrl('whatsapp', selectedLead.id)}
                    onClick={(e) => {
                      if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
                      e.preventDefault();
                      navigateTab('whatsapp', selectedLead.id);
                      setMobileSidebarOpen(false);
                    }}
                    className={`flex-1 h-7 px-2 rounded-lg text-[10px] font-medium flex items-center justify-center gap-1 transition-colors whitespace-nowrap shrink-0 cursor-pointer no-underline ${
                      tab === 'whatsapp'
                        ? 'bg-black/5 dark:bg-[#232325] text-[#171717] dark:text-[#ededed] border border-black/10 dark:border-white/10'
                        : 'bg-black/[0.03] dark:bg-white/[0.03] text-[#525252] dark:text-[#a1a1a6] hover:bg-black/5 dark:hover:bg-white/5 border border-transparent'
                    }`}
                  >
                    <MessageSquare className="w-3 h-3 text-[#EB5E28]" />
                    <span>Chat</span>
                  </a>

                  <a
                    href={buildRouteUrl('prototypes', selectedLead.id)}
                    onClick={(e) => {
                      if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
                      e.preventDefault();
                      navigateTab('prototypes', selectedLead.id);
                      setMobileSidebarOpen(false);
                    }}
                    className={`flex-1 h-7 px-2 rounded-lg text-[10px] font-medium flex items-center justify-center gap-1 transition-colors whitespace-nowrap shrink-0 cursor-pointer no-underline ${
                      tab === 'prototypes'
                        ? 'bg-black/5 dark:bg-[#232325] text-[#171717] dark:text-[#ededed] border border-black/10 dark:border-white/10'
                        : 'bg-black/[0.03] dark:bg-white/[0.03] text-[#525252] dark:text-[#a1a1a6] hover:bg-black/5 dark:hover:bg-white/5 border border-transparent'
                    }`}
                  >
                    <LayoutTemplate className="w-3 h-3 text-[#EB5E28]" />
                    <span>Doop</span>
                  </a>
                </div>
              </div>
            ) : (
              <a
                href="/prospeccao"
                onClick={(e) => {
                  if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
                  e.preventDefault();
                  setTab('leads');
                  setMobileSidebarOpen(false);
                }}
                className="w-full p-2.5 rounded-xl border border-dashed border-black/[0.1] dark:border-white/[0.1] hover:border-[#EB5E28]/50 text-left transition-colors cursor-pointer group bg-white/40 dark:bg-white/[0.02] block no-underline"
              >
                <div className="flex items-center gap-2 text-xs font-medium text-[#737373] dark:text-[#85858b] group-hover:text-[#171717] dark:group-hover:text-[#ededed]">
                  <Building2 className="w-3.5 h-3.5 text-[#737373] group-hover:text-[#EB5E28]" />
                  <span>Selecionar Comércio</span>
                </div>
                <p className="text-[10px] text-[#737373]/70 dark:text-[#85858b]/70 mt-0.5">
                  Escolha um comércio para ativar
                </p>
              </a>
            )}
          </div>

          {/* Navigation Links */}
          <div className="p-3 space-y-4">
            <div>
              <span className="text-[11px] font-mono text-[#737373] dark:text-[#6e6e78] px-3 mb-1.5 block uppercase tracking-wider font-semibold">
                Navegação
              </span>
              <nav className="space-y-1">
                <a
                  href="/"
                  onClick={(e) => {
                    if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
                    e.preventDefault();
                    setTab('overview');
                    setMobileSidebarOpen(false);
                  }}
                  className={`w-full h-9 px-3 rounded-lg text-xs flex items-center justify-between transition-colors duration-150 active:scale-[0.98] cursor-pointer whitespace-nowrap shrink-0 no-underline ${
                    tab === 'overview'
                      ? 'bg-black/5 dark:bg-[#1e1e24] text-[#171717] dark:text-[#f4f4f6] border border-black/10 dark:border-white/[0.08] shadow-[inset_0_1px_0_rgba(255,255,255,0.12)] font-medium'
                      : 'text-[#525252] dark:text-[#8e8e98] hover:text-[#171717] dark:hover:text-[#f4f4f6] hover:bg-black/5 dark:hover:bg-white/[0.04]'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <LayoutGrid className={`w-4 h-4 shrink-0 ${tab === 'overview' ? 'text-[#EB5E28]' : 'text-[#737373] dark:text-[#6e6e78]'}`} />
                    <span>Visão Geral</span>
                  </div>
                </a>

                <a
                  href="/prospeccao"
                  onClick={(e) => {
                    if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
                    e.preventDefault();
                    setTab('leads');
                    setMobileSidebarOpen(false);
                  }}
                  className={`w-full h-9 px-3 rounded-lg text-xs flex items-center justify-between transition-colors duration-150 active:scale-[0.98] cursor-pointer whitespace-nowrap shrink-0 no-underline ${
                    tab === 'leads'
                      ? 'bg-black/5 dark:bg-[#1e1e24] text-[#171717] dark:text-[#f4f4f6] border border-black/10 dark:border-white/[0.08] shadow-[inset_0_1px_0_rgba(255,255,255,0.12)] font-medium'
                      : 'text-[#525252] dark:text-[#8e8e98] hover:text-[#171717] dark:hover:text-[#f4f4f6] hover:bg-black/5 dark:hover:bg-white/[0.04]'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Database className={`w-4 h-4 shrink-0 ${tab === 'leads' ? 'text-[#EB5E28]' : 'text-[#737373] dark:text-[#6e6e78]'}`} />
                    <span>Prospecção</span>
                  </div>
                  {leads.length > 0 && (
                    <span className="text-[11px] font-mono text-[#737373] dark:text-[#6e6e78] tabular-nums shrink-0">
                      {displayedLeads.length}
                    </span>
                  )}
                </a>

                <a
                  href="/conversas"
                  onClick={(e) => {
                    if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
                    e.preventDefault();
                    setTab('conversations');
                    setMobileSidebarOpen(false);
                  }}
                  className={`w-full h-9 px-3 rounded-lg text-xs flex items-center justify-between transition-colors duration-150 active:scale-[0.98] cursor-pointer whitespace-nowrap shrink-0 no-underline ${
                    tab === 'conversations'
                      ? 'bg-black/5 dark:bg-[#1e1e24] text-[#171717] dark:text-[#f4f4f6] border border-black/10 dark:border-white/[0.08] shadow-[inset_0_1px_0_rgba(255,255,255,0.12)] font-medium'
                      : 'text-[#525252] dark:text-[#8e8e98] hover:text-[#171717] dark:hover:text-[#f4f4f6] hover:bg-black/5 dark:hover:bg-white/[0.04]'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <MessageCircle className={`w-4 h-4 shrink-0 ${tab === 'conversations' ? 'text-[#EB5E28]' : 'text-[#737373] dark:text-[#6e6e78]'}`} />
                    <span className="truncate">Conversas</span>
                  </div>
                  {conversations.length > 0 && (
                    <span className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 tabular-nums shrink-0 font-medium">
                      {conversations.length}
                    </span>
                  )}
                </a>

                <a
                  href="/whatsapp"
                  onClick={(e) => {
                    if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
                    e.preventDefault();
                    setTab('whatsapp');
                    setMobileSidebarOpen(false);
                  }}
                  className={`w-full h-9 px-3 rounded-lg text-xs flex items-center justify-between transition-colors duration-150 active:scale-[0.98] cursor-pointer whitespace-nowrap shrink-0 no-underline ${
                    tab === 'whatsapp'
                      ? 'bg-black/5 dark:bg-[#1e1e24] text-[#171717] dark:text-[#f4f4f6] border border-black/10 dark:border-white/[0.08] shadow-[inset_0_1px_0_rgba(255,255,255,0.12)] font-medium'
                      : 'text-[#525252] dark:text-[#8e8e98] hover:text-[#171717] dark:hover:text-[#f4f4f6] hover:bg-black/5 dark:hover:bg-white/[0.04]'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <MessageSquare className={`w-4 h-4 shrink-0 ${tab === 'whatsapp' ? 'text-[#EB5E28]' : 'text-[#737373] dark:text-[#6e6e78]'}`} />
                    <span className="truncate">WhatsApp Studio</span>
                  </div>
                  {selectedLead && (
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0"></span>
                  )}
                </a>

                <a
                  href="/layouts"
                  onClick={(e) => {
                    if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
                    e.preventDefault();
                    setTab('prototypes');
                    setMobileSidebarOpen(false);
                  }}
                  className={`w-full h-9 px-3 rounded-lg text-xs flex items-center justify-between transition-colors duration-150 active:scale-[0.98] cursor-pointer whitespace-nowrap shrink-0 no-underline ${
                    tab === 'prototypes'
                      ? 'bg-black/5 dark:bg-[#1e1e24] text-[#171717] dark:text-[#f4f4f6] border border-black/10 dark:border-white/[0.08] shadow-[inset_0_1px_0_rgba(255,255,255,0.12)] font-medium'
                      : 'text-[#525252] dark:text-[#8e8e98] hover:text-[#171717] dark:hover:text-[#f4f4f6] hover:bg-black/5 dark:hover:bg-white/[0.04]'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <LayoutTemplate className={`w-4 h-4 shrink-0 ${tab === 'prototypes' ? 'text-[#EB5E28]' : 'text-[#737373] dark:text-[#6e6e78]'}`} />
                    <span className="truncate">Layouts no Doop</span>
                  </div>
                  {stats.totalPrototypes > 0 && (
                    <span className="text-[11px] font-mono text-[#737373] dark:text-[#6e6e78] tabular-nums shrink-0">
                      {stats.totalPrototypes}
                    </span>
                  )}
                </a>

                <a
                  href="/operacao"
                  onClick={(e) => {
                    if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
                    e.preventDefault();
                    setTab('settings');
                    setMobileSidebarOpen(false);
                  }}
                  className={`w-full h-9 px-3 rounded-lg text-xs flex items-center justify-between transition-colors duration-150 active:scale-[0.98] cursor-pointer whitespace-nowrap shrink-0 no-underline ${
                    tab === 'settings'
                      ? 'bg-black/5 dark:bg-[#1e1e24] text-[#171717] dark:text-[#f4f4f6] border border-black/10 dark:border-white/[0.08] shadow-[inset_0_1px_0_rgba(255,255,255,0.12)] font-medium'
                      : 'text-[#525252] dark:text-[#8e8e98] hover:text-[#171717] dark:hover:text-[#f4f4f6] hover:bg-black/5 dark:hover:bg-white/[0.04]'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Settings className={`w-4 h-4 shrink-0 ${tab === 'settings' ? 'text-[#EB5E28]' : 'text-[#737373] dark:text-[#6e6e78]'}`} />
                    <span>Operação</span>
                  </div>
                </a>
              </nav>
            </div>

            {/* Nichos RMBH (Colored Dot List - Clean & Functional) */}
            <div className="pt-3 border-t border-black/[0.06] dark:border-white/[0.06]">
              <div className="flex items-center justify-between px-3 mb-2">
                <span className="text-[11px] font-mono text-[#737373] dark:text-[#6e6e78] uppercase tracking-wider font-semibold">
                  Nichos RMBH
                </span>
                <span className="text-[10px] font-mono text-[#737373] dark:text-[#6e6e78]">
                  {stats.totalLeads?.toLocaleString('pt-BR') || '5.565'}
                </span>
              </div>
              <div className="space-y-0.5">
                {[
                  { id: 'beleza', label: 'Beleza & Estética', count: 1727, dotColor: '#F59E0B' },
                  { id: 'automotivo', label: 'Automotivo & Mecânica', count: 1020, dotColor: '#06B6D4' },
                  { id: 'saude', label: 'Saúde & Odonto', count: 913, dotColor: '#3B82F6' },
                  { id: 'pet', label: 'Pet Shop & Veterinária', count: 514, dotColor: '#EC4899' },
                  { id: 'fitness', label: 'Fitness & Academias', count: 479, dotColor: '#8B5CF6' },
                ].map((niche) => {
                  const isSelected = nicheFilter === niche.id;
                  return (
                    <button
                      key={niche.id}
                      onClick={() => {
                        setNicheFilter(isSelected ? '' : niche.id);
                        setTab('leads');
                        setMobileSidebarOpen(false);
                      }}
                      className={`w-full h-8 px-3 rounded-lg text-xs flex items-center justify-between transition-colors duration-150 cursor-pointer whitespace-nowrap shrink-0 group ${
                        isSelected
                          ? 'bg-black/5 dark:bg-[#1e1e24] text-[#171717] dark:text-[#f4f4f6] font-medium border border-black/10 dark:border-white/[0.08]'
                          : 'text-[#525252] dark:text-[#8e8e98] hover:text-[#171717] dark:hover:text-[#f4f4f6] hover:bg-black/5 dark:hover:bg-white/[0.04]'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span
                          className="w-2 h-2 rounded-full shrink-0"
                          style={{ backgroundColor: niche.dotColor, boxShadow: `0 0 6px ${niche.dotColor}80` }}
                        />
                        <span className="truncate text-xs">{niche.label}</span>
                      </div>
                      <span className="text-[11px] font-mono text-[#737373] dark:text-[#6e6e78] tabular-nums shrink-0 ml-2">
                        {niche.count.toLocaleString('pt-BR')}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Recent WhatsApp Conversations list in Sidebar */}
            {conversations.length > 0 && (
              <div className="pt-3 border-t border-black/[0.06] dark:border-white/[0.06]">
                <div className="flex items-center justify-between px-3 mb-1.5">
                  <span className="text-[11px] font-mono text-[#737373] dark:text-[#6e6e78] uppercase tracking-wider font-semibold flex items-center gap-1.5">
                    <MessageCircle className="w-3 h-3 text-emerald-500" />
                    <span>Conversas WhatsApp</span>
                  </span>
                  <span className="text-[10px] font-mono font-medium px-1.5 py-0.2 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                    {conversations.length}
                  </span>
                </div>

                <div className="space-y-0.5">
                  {conversations.slice(0, 4).map((conv) => {
                    const leadObj = conv.lead || conv;
                    const leadName = conv.name || leadObj.name || 'Comércio Local';
                    const leadId = conv.id || leadObj.id;
                    const isCurrent = selectedLead?.id === leadId;
                    return (
                      <a
                        key={leadId}
                        href={buildRouteUrl('conversations', leadId)}
                        onClick={(e) => {
                          if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
                          e.preventDefault();
                          const target = leads.find((l) => l.id === leadId) || {
                            ...leadObj,
                            id: leadId,
                            name: leadName,
                            pitchType: leadObj.pitchType || 'no_site'
                          };
                          selectLead(target as any);
                          navigateTab('conversations', leadId);
                          setMobileChatOpen(true);
                          setMobileSidebarOpen(false);
                        }}
                        className={`w-full text-left px-3 py-1.5 rounded-lg text-xs transition-colors flex items-center justify-between gap-1.5 cursor-pointer whitespace-nowrap shrink-0 no-underline ${
                          isCurrent
                            ? 'bg-black/5 dark:bg-[#1e1e24] text-[#EB5E28] font-semibold border border-black/10 dark:border-white/[0.08]'
                            : 'text-[#525252] dark:text-[#8e8e98] hover:bg-black/5 dark:hover:bg-white/[0.04] hover:text-[#171717] dark:hover:text-[#f4f4f6]'
                        }`}
                        title={leadName}
                      >
                        <span className="truncate text-[11px] flex-1">{leadName}</span>
                        {conv.hasInbound && (
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" title="Cliente respondeu"></span>
                        )}
                      </a>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar Telemetry & System Status Footer */}
        <div className="p-4 border-t border-black/[0.06] dark:border-white/[0.06] bg-transparent space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono text-[#737373] dark:text-[#6e6e78] uppercase tracking-wider font-semibold">
              Motores Locais
            </span>
            <button
              onClick={() => {
                loadStatus();
                loadLeads();
                addToast('info', 'Status Atualizado', 'Sincronizado com os serviços locais.');
              }}
              className="p-1 rounded-lg text-[#737373] hover:text-[#171717] dark:text-[#8e8e98] dark:hover:text-[#f4f4f6] transition-colors cursor-pointer"
              title="Sincronizar serviços"
              aria-label="Sincronizar serviços"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-[#EB5E28]' : ''}`} />
            </button>
          </div>

          <div className="space-y-1.5 text-[11px] font-mono">
            <div className="flex items-center justify-between text-[#525252] dark:text-[#8e8e98]">
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                <span>Scraper Kit</span>
              </span>
              <span className="text-[#737373] dark:text-[#6e6e78]">8080</span>
            </div>
            <div className="flex items-center justify-between text-[#525252] dark:text-[#8e8e98]">
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                <span>OpenWA</span>
              </span>
              <span className="text-[#737373] dark:text-[#6e6e78]">2785</span>
            </div>
            <div className="flex items-center justify-between text-[#525252] dark:text-[#8e8e98]">
              <span className="flex items-center gap-1.5">
                <span className={`w-1.5 h-1.5 rounded-full ${doopProcStatus.running ? 'bg-emerald-500' : 'bg-[#EB5E28]'}`}></span>
                <span>Doop Studio</span>
              </span>
              <span className="text-[#737373] dark:text-[#6e6e78]">4400</span>
            </div>
          </div>

          {/* Quick link to active Doop Canvas */}
          <div className="pt-2 border-t border-black/[0.06] dark:border-white/[0.06]">
            <a
              href="http://localhost:4300/c/9AvMi5_xuu"
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-between text-[11px] text-[#171717] dark:text-[#f4f4f6] hover:text-[#EB5E28] dark:hover:text-[#EB5E28] font-medium px-2.5 py-1.5 rounded-lg bg-black/[0.02] dark:bg-white/[0.03] border border-black/[0.06] dark:border-white/[0.06] hover:border-[#EB5E28]/40 transition-colors"
            >
              <span className="flex items-center gap-1.5">
                <LayoutTemplate className="w-3 h-3 text-[#EB5E28]" />
                <span>Canvas Torra 31</span>
              </span>
              <ExternalLink className="w-3 h-3 text-[#737373] dark:text-[#6e6e78]" />
            </a>
          </div>

          <div className="pt-2 border-t border-black/[0.06] dark:border-white/[0.06] flex items-center justify-between text-[11px]">
            <span className="text-[#525252] dark:text-[#8e8e98] flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Modo</span>
            </span>
            <span className="font-mono text-emerald-700 dark:text-emerald-400 font-semibold uppercase text-[10px] bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
              {mode.replace(/_/g, ' ')}
            </span>
          </div>

          {/* Theme switcher */}
          <div className="pt-2 border-t border-black/[0.06] dark:border-white/[0.06] flex items-center justify-between">
            <span className="text-[11px] text-[#525252] dark:text-[#8e8e98]">Tema</span>
            <button
              onClick={toggleTheme}
              className="px-2 py-1 rounded-lg text-xs flex items-center gap-1.5 bg-black/[0.03] dark:bg-white/[0.04] text-[#171717] dark:text-[#f4f4f6] hover:bg-black/[0.06] dark:hover:bg-white/[0.08] transition-colors cursor-pointer border border-black/[0.06] dark:border-white/[0.06]"
              title="Alternar tema claro/escuro"
            >
              {theme === 'dark' ? (
                <>
                  <Moon className="w-3 h-3 text-amber-400" />
                  <span className="text-[10px]">Escuro</span>
                </>
              ) : (
                <>
                  <Sun className="w-3 h-3 text-[#EB5E28]" />
                  <span className="text-[10px]">Claro</span>
                </>
              )}
            </button>
          </div>
        </div>
      </aside>

      {/* Main App Container */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-y-auto">
        {/* Top Control Bar of Main Content Area (Borderless & Clean) */}
        <header className="sticky top-0 z-30 h-14 min-h-14 min-h-[56px] shrink-0 bg-[#fafafa]/80 dark:bg-[#0b0b0e]/80 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between transition-colors duration-150">
          <div className="flex items-center gap-2.5 min-w-0">
            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileSidebarOpen(true)}
              className="w-8 h-8 rounded-xl border border-black/[0.08] dark:border-white/[0.07] bg-white dark:bg-[#141418] text-[#525252] dark:text-[#8e8e98] hover:text-[#171717] dark:hover:text-[#f4f4f6] active:scale-[0.98] md:hidden transition-all duration-150 cursor-pointer shrink-0 flex items-center justify-center p-0"
              aria-label="Abrir menu lateral"
            >
              <Menu className="w-4 h-4" />
            </button>

            {/* Desktop Reopen Sidebar Button (when collapsed) */}
            {desktopSidebarCollapsed && (
              <button
                onClick={toggleDesktopSidebar}
                className="hidden md:flex items-center justify-center w-8 h-8 rounded-xl border border-black/[0.08] dark:border-white/[0.07] bg-white dark:bg-[#141418] text-[#737373] dark:text-[#8e8e98] hover:text-[#171717] dark:hover:text-[#f4f4f6] hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer shrink-0 shadow-2xs mr-1"
                title="Expandir menu lateral (Ctrl+B)"
                aria-label="Expandir menu lateral"
              >
                <PanelLeftOpen className="w-4 h-4" />
              </button>
            )}

            {/* Breadcrumb Navigation & View Title */}
            <div className="flex items-center gap-2 min-w-0">
              <a
                href="/"
                onClick={(e) => {
                  if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
                  e.preventDefault();
                  setTab('overview');
                }}
                className="text-xs font-mono font-medium text-[#737373] dark:text-[#8e8e98] hover:text-[#EB5E28] transition-colors shrink-0 cursor-pointer no-underline"
              >
                Prospec
              </a>
              <span className="text-xs text-black/20 dark:text-white/20 shrink-0">/</span>
              <span className="font-heading font-semibold text-xs sm:text-sm text-[#171717] dark:text-[#f4f4f6] tracking-tight truncate">
                {tab === 'overview' && 'Visão Geral'}
                {tab === 'leads' && 'Prospecção & Contatos'}
                {tab === 'conversations' && 'Conversas'}
                {tab === 'whatsapp' && 'WhatsApp Studio'}
                {tab === 'prototypes' && 'Layouts no Doop'}
                {tab === 'settings' && 'Operação'}
              </span>

              {/* Status Context Pill */}
              <span className="hidden lg:inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-mono bg-black/[0.04] dark:bg-white/[0.06] text-[#737373] dark:text-[#8e8e98] border border-black/[0.06] dark:border-white/[0.06] shrink-0">
                {tab === 'overview' && (
                  <>
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 ring-2 ring-emerald-500/20" />
                    <span>3 serviços ativos</span>
                  </>
                )}
                {tab === 'leads' && (
                  <>
                    <span className="text-[#EB5E28] font-bold">{leads.length || stats.totalLeads || 0}</span>
                    <span>leads</span>
                  </>
                )}
                {tab === 'conversations' && (
                  <>
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    <span>{conversations.length} ativas</span>
                  </>
                )}
                {tab === 'whatsapp' && (
                  <>
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    <span>Geovane AI</span>
                  </>
                )}
                {tab === 'prototypes' && (
                  <span>Doop Canvas</span>
                )}
                {tab === 'settings' && (
                  <span>Serviços & Portas</span>
                )}
              </span>
            </div>
          </div>

          {/* Right Header Actions */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Vercel Cloud Hosting Status & Trigger */}
            <button
              onClick={() => setShowVercelModal(true)}
              className="h-8 min-w-8 px-2 sm:px-3 rounded-xl border border-black/[0.08] dark:border-white/[0.07] bg-white dark:bg-[#141418] hover:bg-black/[0.03] dark:hover:bg-white/[0.04] text-[#525252] dark:text-[#9b9ba3] hover:text-[#171717] dark:hover:text-[#f4f4f6] text-xs font-medium transition-all duration-150 active:scale-[0.98] cursor-pointer flex items-center justify-center gap-1.5 whitespace-nowrap shrink-0 shadow-2xs"
              title={
                vercelConfigStatus?.valid
                  ? `Vercel Conectada (@${vercelConfigStatus.user || 'ok'}) • Clique para gerenciar`
                  : 'Configurar Hospedagem na Vercel (Gerar link ao vivo para celular)'
              }
              aria-label="Configurar Vercel"
            >
              <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-current shrink-0" aria-hidden="true">
                <path d="M12 2L24 22H0L12 2Z" />
              </svg>
              {vercelConfigStatus?.valid ? (
                <>
                  <span className="hidden md:inline">Vercel</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 ring-2 ring-emerald-500/20 shrink-0" />
                  <span className="text-[10px] font-mono text-[#737373] dark:text-[#8e8e98] hidden lg:inline truncate max-w-[110px]">
                    @{vercelConfigStatus.user}
                  </span>
                </>
              ) : (
                <span className="hidden sm:inline">Conectar Vercel</span>
              )}
            </button>

            {/* Claude Copilot Quick Trigger */}
            <button
              onClick={() => {
                if (selectedLead && !activeCopilotLead) {
                  setActiveCopilotLead(selectedLead);
                }
                setAiDrawerOpen(true);
              }}
              className="h-8 min-w-8 px-2 sm:px-3 rounded-xl border border-black/[0.08] dark:border-white/[0.07] bg-white dark:bg-[#141418] hover:bg-black/[0.03] dark:hover:bg-white/[0.04] text-[#525252] dark:text-[#9b9ba3] hover:text-[#171717] dark:hover:text-[#f4f4f6] transition-all duration-150 active:scale-[0.98] cursor-pointer text-xs font-medium flex items-center justify-center gap-1.5 whitespace-nowrap shrink-0 shadow-2xs"
              title="Abrir Claude Copilot (IA Estratégica)"
              aria-label="Abrir Claude Copilot"
            >
              <Bot className="w-3.5 h-3.5 shrink-0 text-[#EB5E28]" />
              <span className="hidden sm:inline">Claude Copilot</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
            </button>

            {/* Importar Scraper Action */}
            <button
              onClick={handleImportLeads}
              disabled={loading}
              className="h-8 min-w-8 px-2 sm:px-3.5 rounded-xl border border-black/[0.08] dark:border-white/[0.07] bg-white dark:bg-[#141418] hover:bg-black/[0.03] dark:hover:bg-white/[0.04] text-[#171717] dark:text-[#ededed] hover:border-[#EB5E28]/40 active:scale-[0.98] font-medium text-xs transition-all duration-150 flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0 shadow-2xs disabled:opacity-50"
              title="Importar leads do Google Maps Scraper"
              aria-label="Importar leads do Scraper"
            >
              <CloudUpload className="w-3.5 h-3.5 shrink-0 text-[#EB5E28]" />
              <span className="hidden sm:inline">Importar Scraper</span>
            </button>

            {/* Subtle Divider */}
            <div className="h-4 w-px bg-black/[0.08] dark:bg-white/[0.08] mx-0.5 shrink-0" />

            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className="w-8 h-8 rounded-xl border border-black/[0.08] dark:border-white/[0.07] bg-white dark:bg-[#141418] hover:bg-black/[0.03] dark:hover:bg-white/[0.04] text-[#525252] dark:text-[#9b9ba3] hover:text-[#171717] dark:hover:text-[#f4f4f6] active:scale-[0.98] transition-all duration-150 cursor-pointer flex items-center justify-center shrink-0 p-0 shadow-2xs"
              title={theme === 'dark' ? 'Mudar para Modo Claro' : 'Mudar para Modo Escuro'}
              aria-label="Alternar tema"
            >
              {theme === 'dark' ? (
                <Sun className="w-3.5 h-3.5 text-amber-400" />
              ) : (
                <Moon className="w-3.5 h-3.5 text-[#171717]" />
              )}
            </button>

            {/* Refresh Status & Leads Button */}
            <button
              onClick={() => {
                loadStatus();
                loadLeads();
                checkVercelConfig();
                addToast('info', 'Status Atualizado', 'Métricas e conexões sincronizadas.');
              }}
              className="w-8 h-8 rounded-xl border border-black/[0.08] dark:border-white/[0.07] bg-white dark:bg-[#141418] hover:bg-black/[0.03] dark:hover:bg-white/[0.04] text-[#525252] dark:text-[#9b9ba3] hover:text-[#171717] dark:hover:text-[#f4f4f6] active:scale-[0.98] transition-all duration-150 cursor-pointer flex items-center justify-center shrink-0 p-0 shadow-2xs"
              title="Atualizar dados e conexões"
              aria-label="Atualizar dados"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-[#EB5E28]' : ''}`} />
            </button>
          </div>
        </header>

        {/* Dynamic Main Workspace Content */}
        <main className="flex-1 p-3.5 sm:p-6 max-w-7xl w-full mx-auto">
          {/* Tab 1: Overview */}
          {tab === 'overview' && (
            <div className="space-y-6">
              {/* Context Headline (Calm space left for title - Line-free) */}
              <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-3 pb-2">
                <div>
                  <div className="flex items-center gap-2 text-xs font-mono text-[#737373] dark:text-[#6e6e78] mb-1">
                    <LayoutGrid className="w-3.5 h-3.5 text-[#EB5E28]" />
                    <span>Console de Operações</span>
                    <span>/</span>
                    <span>RMBH</span>
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-heading font-medium tracking-tight text-[#171717] dark:text-[#f4f4f6]">
                    Visão Geral da Operação
                  </h1>
                </div>
                <div className="flex items-center gap-3 text-xs font-mono text-[#737373] dark:text-[#6e6e78]">
                  <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 ring-2 ring-emerald-500/20 animate-pulse"></span>
                    <span>3 motores conectados</span>
                  </span>
                  <span>•</span>
                  <span>{stats.totalLeads?.toLocaleString('pt-BR') || '5.565'} leads no SQLite</span>
                </div>
              </div>

              {/* Top Metric Deck (Numbers-First, Quiet Chrome) */}
              {loading && !stats.totalLeads ? (
                <SkeletonStatCard count={4} />
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-white dark:bg-[#141418] border border-black/[0.08] dark:border-white/[0.07] p-5 rounded-2xl shadow-xs transition-colors hover:border-black/[0.14] dark:hover:border-white/[0.12]">
                    <div className="text-xs text-[#737373] dark:text-[#8e8e98] font-medium">Comércios Mapeados</div>
                    <div className="text-3xl font-heading font-medium text-[#171717] dark:text-[#f4f4f6] mt-2 tabular-nums">
                      {stats.totalLeads?.toLocaleString('pt-BR') || '5.565'}
                    </div>
                    <div className="text-xs text-[#737373] dark:text-[#6e6e78] mt-1.5 font-mono">
                      Banco SQLite • Grande BH
                    </div>
                  </div>

                  <div className="bg-white dark:bg-[#141418] border border-black/[0.08] dark:border-white/[0.07] p-5 rounded-2xl shadow-xs transition-colors hover:border-black/[0.14] dark:hover:border-white/[0.12]">
                    <div className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">Sem Presença Digital</div>
                    <div className="text-3xl font-heading font-medium text-emerald-600 dark:text-emerald-400 mt-2 tabular-nums">
                      {stats.pitchCounts?.no_site?.toLocaleString('pt-BR') || '3.330'}
                    </div>
                    <div className="text-xs text-[#737373] dark:text-[#6e6e78] mt-1.5 font-mono">
                      Alvo prioritário comercial (60%)
                    </div>
                  </div>

                  <div className="bg-white dark:bg-[#141418] border border-black/[0.08] dark:border-white/[0.07] p-5 rounded-2xl shadow-xs transition-colors hover:border-black/[0.14] dark:hover:border-white/[0.12]">
                    <div className="text-xs text-[#EB5E28] font-medium">Layouts no Doop</div>
                    <div className="text-3xl font-heading font-medium text-[#EB5E28] mt-2 tabular-nums">
                      {stats.totalPrototypes || 47}
                    </div>
                    <div className="text-xs text-[#737373] dark:text-[#6e6e78] mt-1.5 font-mono">
                      12 pranchetas ativas por canvas
                    </div>
                  </div>

                  <div className="bg-white dark:bg-[#141418] border border-black/[0.08] dark:border-white/[0.07] p-5 rounded-2xl shadow-xs transition-colors hover:border-black/[0.14] dark:hover:border-white/[0.12]">
                    <div className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">Conversas WhatsApp</div>
                    <div className="text-3xl font-heading font-medium text-[#171717] dark:text-[#f4f4f6] mt-2 tabular-nums">
                      {conversations.length || stats.totalMessages || 7}
                    </div>
                    <div className="text-xs text-[#737373] dark:text-[#6e6e78] mt-1.5 font-mono">
                      Supervisão ao vivo via OpenWA
                    </div>
                  </div>
                </div>
              )}

              {/* Feature Hero Card: Volume de Prospecção & Conversão (Spline Wave Centerpiece) */}
              <div className="bg-white dark:bg-[#141418] border border-black/[0.08] dark:border-white/[0.07] p-6 rounded-2xl shadow-xs space-y-4">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div>
                    <div className="text-xs text-[#737373] dark:text-[#6e6e78] font-mono tracking-wide uppercase font-semibold">
                      Volume de Prospecção & Conversão (RMBH)
                    </div>
                    <div className="flex items-baseline gap-3 mt-1.5">
                      <span className="text-3xl sm:text-4xl font-heading font-medium tracking-tight text-[#171717] dark:text-[#f4f4f6] tabular-nums">
                        {stats.totalLeads?.toLocaleString('pt-BR') || '5.565'} comércios
                      </span>
                      <span className="text-xs font-mono text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-medium">
                        <span>↑ 8.4%</span>
                        <span className="text-[#737373] dark:text-[#6e6e78]">no último ciclo</span>
                      </span>
                    </div>
                  </div>

                  {/* Legend Badges matching the spline curves */}
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-black/[0.03] dark:bg-white/[0.03] border border-black/[0.06] dark:border-white/[0.06]">
                      <span className="w-2 h-2 rounded-full bg-[#F59E0B] shadow-[0_0_6px_#F59E0B]" />
                      <span className="text-[#525252] dark:text-[#9b9ba3]">Beleza (31%)</span>
                    </div>
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-black/[0.03] dark:bg-white/[0.03] border border-black/[0.06] dark:border-white/[0.06]">
                      <span className="w-2 h-2 rounded-full bg-[#06B6D4] shadow-[0_0_6px_#06B6D4]" />
                      <span className="text-[#525252] dark:text-[#9b9ba3]">Automotivo (18%)</span>
                    </div>
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-black/[0.03] dark:bg-white/[0.03] border border-black/[0.06] dark:border-white/[0.06]">
                      <span className="w-2 h-2 rounded-full bg-[#3B82F6] shadow-[0_0_6px_#3B82F6]" />
                      <span className="text-[#525252] dark:text-[#9b9ba3]">Saúde (16%)</span>
                    </div>
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-black/[0.03] dark:bg-white/[0.03] border border-black/[0.06] dark:border-white/[0.06]">
                      <span className="w-2 h-2 rounded-full bg-[#EC4899] shadow-[0_0_6px_#EC4899]" />
                      <span className="text-[#525252] dark:text-[#9b9ba3]">Pet Shop (9%)</span>
                    </div>
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-black/[0.03] dark:bg-white/[0.03] border border-black/[0.06] dark:border-white/[0.06]">
                      <span className="w-2 h-2 rounded-full bg-[#8B5CF6] shadow-[0_0_6px_#8B5CF6]" />
                      <span className="text-[#525252] dark:text-[#9b9ba3]">Fitness (8%)</span>
                    </div>
                  </div>
                </div>

                {/* Pure SVG Spline Wave Chart */}
                <div className="pt-2">
                  <CentralPipelineStreamChart
                    activeMonth={activeStreamMonth}
                    onSelectMonth={setActiveStreamMonth}
                  />
                </div>
              </div>

              {/* Main Content Split: Funnel & Priority Queue (8 cols) + Engine Console (4 cols) */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                {/* Left Column (8 cols): Conversion Funnel + Priority Leads */}
                <div className="lg:col-span-8 space-y-5">
                  {/* Conversion Pipeline Funnel Card */}
                  <div className="bg-white dark:bg-[#141418] border border-black/[0.08] dark:border-white/[0.07] p-6 rounded-2xl shadow-xs space-y-5">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <h2 className="font-heading font-medium text-sm text-[#171717] dark:text-[#f4f4f6]">
                          Funil de Prospecção & Conversão
                        </h2>
                        <p className="text-xs text-[#737373] dark:text-[#8e8e98] mt-0.5 font-sans">
                          Fluxo contínuo desde a auditoria no Google Maps até a abordagem no WhatsApp
                        </p>
                      </div>
                      <button
                        onClick={() => setTab('leads')}
                        className="text-xs text-[#EB5E28] hover:text-[#d8521d] font-medium transition-colors cursor-pointer self-start sm:self-auto whitespace-nowrap shrink-0"
                      >
                        Ver todos os contatos →
                      </button>
                    </div>

                    {/* Funnel Progress Bars */}
                    <div className="space-y-3 font-sans">
                      <div>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-[#525252] dark:text-[#8e8e98]">1. Mapeados no Scraper (RMBH)</span>
                          <span className="font-mono text-[#171717] dark:text-[#f4f4f6] font-medium tabular-nums">{stats.totalLeads?.toLocaleString('pt-BR') || '5.565'}</span>
                        </div>
                        <div className="h-2 rounded-full bg-black/5 dark:bg-white/5 overflow-hidden">
                          <div className="h-full bg-[#171717] dark:bg-[#ededed] rounded-full w-full"></div>
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-[#525252] dark:text-[#8e8e98]">2. Sem Presença Online / Offline (Oportunidades)</span>
                          <span className="font-mono text-emerald-600 dark:text-emerald-400 font-medium tabular-nums">
                            {((stats.pitchCounts?.no_site || 3330) + (stats.pitchCounts?.offline_site || 363)).toLocaleString('pt-BR')} (66%)
                          </span>
                        </div>
                        <div className="h-2 rounded-full bg-black/5 dark:bg-white/5 overflow-hidden">
                          <div className="h-full bg-emerald-500 rounded-full w-[66%]"></div>
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-[#525252] dark:text-[#8e8e98]">3. Layouts Gerados no Doop (12 Pranchetas)</span>
                          <span className="font-mono text-[#EB5E28] font-medium tabular-nums">{stats.totalPrototypes || 47}</span>
                        </div>
                        <div className="h-2 rounded-full bg-black/5 dark:bg-white/5 overflow-hidden">
                          <div className="h-full bg-[#EB5E28] rounded-full w-[25%]"></div>
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-[#525252] dark:text-[#8e8e98]">4. Conversas Ativas WhatsApp</span>
                          <span className="font-mono text-emerald-600 dark:text-emerald-400 font-medium tabular-nums">{conversations.length}</span>
                        </div>
                        <div className="h-2 rounded-full bg-black/5 dark:bg-white/5 overflow-hidden">
                          <div className="h-full bg-emerald-500/80 rounded-full w-[12%]"></div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Priority Contacts Queue */}
                  <div className="bg-white dark:bg-[#141418] border border-black/[0.08] dark:border-white/[0.07] p-6 rounded-2xl shadow-xs space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className="font-heading font-medium text-sm text-[#171717] dark:text-[#f4f4f6]">
                          Comércios Prontos para Contato
                        </h2>
                        <p className="text-xs text-[#737373] dark:text-[#8e8e98] mt-0.5 font-sans">
                          Leads qualificados sem site ou com layout Doop preparado
                        </p>
                      </div>
                      <button
                        onClick={() => setTab('leads')}
                        className="text-xs text-[#737373] dark:text-[#8e8e98] hover:text-[#171717] dark:hover:text-[#f4f4f6] transition-colors cursor-pointer whitespace-nowrap shrink-0"
                      >
                        Abrir Prospecção
                      </button>
                    </div>

                    <div className="divide-y divide-black/[0.06] dark:divide-white/[0.06]">
                      {displayedLeads.slice(0, 4).map((lead) => (
                        <div
                          key={lead.id}
                          className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-black/[0.02] dark:hover:bg-white/[0.02] -mx-2 px-2 rounded-xl transition-colors"
                        >
                          <div className="flex items-start gap-3 min-w-0">
                            <div className="w-8 h-8 rounded-lg bg-black/5 dark:bg-white/5 text-[#171717] dark:text-[#f4f4f6] flex items-center justify-center font-heading font-medium text-xs shrink-0 mt-0.5 border border-black/[0.06] dark:border-white/[0.06]">
                              {lead.name.charAt(0).toUpperCase()}
                            </div>
                            <div className="min-w-0">
                              <div
                                onClick={() => setDetailModalLead(lead)}
                                className="font-heading font-medium text-xs text-[#171717] dark:text-[#f4f4f6] truncate cursor-pointer hover:text-[#EB5E28]"
                              >
                                {lead.name}
                              </div>
                              <div className="flex items-center gap-1.5 text-[11px] text-[#737373] dark:text-[#8e8e98] mt-0.5 truncate">
                                <span>{lead.category || 'Comércio Local'}</span>
                                <span>•</span>
                                <span>{lead.city || 'RMBH'}</span>
                                {lead.rating && (
                                  <>
                                    <span>•</span>
                                    <span className="text-amber-500 font-mono flex items-center gap-0.5">
                                      <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                                      {parseFloat(lead.rating).toFixed(1)}
                                    </span>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                            <button
                              onClick={() => handlePrepareWhatsApp(lead)}
                              className="h-7 px-2.5 rounded-lg text-[11px] font-medium bg-black/5 dark:bg-white/5 hover:bg-[#EB5E28] hover:text-white dark:hover:bg-[#EB5E28] dark:hover:text-white text-[#171717] dark:text-[#f4f4f6] transition-colors cursor-pointer flex items-center gap-1 whitespace-nowrap shrink-0"
                            >
                              <MessageSquare className="w-3 h-3" />
                              <span>WhatsApp</span>
                            </button>
                            <button
                              onClick={() => handlePreparePrototype(lead)}
                              className="h-7 px-2.5 rounded-lg text-[11px] font-medium border border-black/[0.08] dark:border-white/[0.08] hover:border-[#EB5E28]/40 text-[#525252] dark:text-[#8e8e98] hover:text-[#171717] dark:hover:text-[#f4f4f6] transition-colors cursor-pointer flex items-center gap-1 whitespace-nowrap shrink-0"
                            >
                              <LayoutTemplate className="w-3 h-3" />
                              <span>Doop</span>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Right Column (4 cols): System Engines Console */}
                <div className="lg:col-span-4 space-y-4">
                  <div className="bg-white dark:bg-[#141418] border border-black/[0.08] dark:border-white/[0.07] p-5 rounded-2xl shadow-xs space-y-4">
                    <div className="flex items-center justify-between pb-3 border-b border-black/[0.06] dark:border-white/[0.06]">
                      <div className="flex items-center gap-2">
                        <Server className="w-4 h-4 text-[#EB5E28]" />
                        <h2 className="font-heading font-medium text-xs text-[#171717] dark:text-[#f4f4f6]">
                          Console dos Motores Locais
                        </h2>
                      </div>
                      <span className="text-[10px] font-mono text-[#737373] dark:text-[#8e8e98]">
                        localhost
                      </span>
                    </div>

                    {/* Engine 1: Scraper Kit */}
                    <div className="p-3.5 rounded-xl bg-black/[0.02] dark:bg-white/[0.02] border border-black/[0.06] dark:border-white/[0.06] space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-heading font-medium text-xs text-[#171717] dark:text-[#f4f4f6]">
                          Scraper Kit (Google Maps)
                        </span>
                        <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                          :8080
                        </span>
                      </div>
                      <p className="text-[11px] text-[#737373] dark:text-[#8e8e98] leading-normal font-sans">
                        5 arquivos CSV com 4.401 comércios prontos para leitura e deduplicação no SQLite.
                      </p>
                    </div>

                    {/* Engine 2: OpenWA Gateway */}
                    <div className="p-3.5 rounded-xl bg-black/[0.02] dark:bg-white/[0.02] border border-black/[0.06] dark:border-white/[0.06] space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-heading font-medium text-xs text-[#171717] dark:text-[#f4f4f6]">
                          OpenWA Gateway (Baileys)
                        </span>
                        <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                          :2785
                        </span>
                      </div>
                      <p className="text-[11px] text-[#737373] dark:text-[#8e8e98] leading-normal font-sans">
                        Gateway HTTP operacional para envio supervisionado de mensagens e timeline ao vivo.
                      </p>
                    </div>

                    {/* Engine 3: Doop Design Canvas */}
                    <div className="p-3.5 rounded-xl bg-black/[0.02] dark:bg-white/[0.02] border border-black/[0.06] dark:border-white/[0.06] space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="font-heading font-medium text-xs text-[#171717] dark:text-[#f4f4f6]">
                          Doop Design Canvas
                        </span>
                        <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-[#EB5E28]/10 text-[#EB5E28] border border-[#EB5E28]/20">
                          :4300 / :4400
                        </span>
                      </div>
                      <p className="text-[11px] text-[#737373] dark:text-[#8e8e98] leading-normal font-sans">
                        Servidor multiplayer Bun em background com 12 pranchetas por canvas.
                      </p>

                      <div className="flex items-center gap-1.5 pt-1">
                        <button
                          onClick={handleStartDoop}
                          disabled={loading || doopProcStatus.running}
                          className={`h-7 px-2.5 rounded-lg text-[10px] font-medium flex items-center gap-1 cursor-pointer whitespace-nowrap shrink-0 ${
                            doopProcStatus.running
                              ? 'bg-black/5 dark:bg-white/5 text-[#737373] cursor-not-allowed'
                              : 'bg-emerald-600 text-white hover:bg-emerald-700'
                          }`}
                        >
                          <Play className="w-3 h-3" />
                          <span>Iniciar</span>
                        </button>
                        <button
                          onClick={handleRestartDoop}
                          disabled={loading}
                          className="h-7 px-2.5 rounded-lg text-[10px] font-medium bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 text-[#171717] dark:text-[#f4f4f6] border border-black/[0.06] dark:border-white/[0.06] transition-colors cursor-pointer flex items-center gap-1 whitespace-nowrap shrink-0"
                        >
                          <RotateCw className="w-3 h-3" />
                          <span>Reiniciar</span>
                        </button>
                        <button
                          onClick={handleStopDoop}
                          disabled={loading || !doopProcStatus.running}
                          className="h-7 px-2.5 rounded-lg text-[10px] font-medium bg-rose-500/10 text-rose-700 dark:text-rose-400 hover:bg-rose-500/20 transition-colors cursor-pointer flex items-center gap-1 whitespace-nowrap shrink-0"
                        >
                          <Square className="w-3 h-3" />
                          <span>Parar</span>
                        </button>
                        <button
                          onClick={handleOpenDoopLogs}
                          className="h-7 px-2 rounded-lg text-[10px] bg-black/5 dark:bg-white/5 text-[#737373] dark:text-[#8e8e98] hover:text-[#171717] dark:hover:text-[#f4f4f6] transition-colors cursor-pointer whitespace-nowrap shrink-0"
                          title="Logs do terminal Doop"
                        >
                          <Terminal className="w-3 h-3" />
                        </button>
                      </div>

                      <div className="pt-2 border-t border-black/[0.06] dark:border-white/[0.06] space-y-1">
                        <a
                          href="http://localhost:4300"
                          target="_blank"
                          rel="noreferrer"
                          className="text-[11px] text-[#EB5E28] hover:text-[#d8521d] flex items-center gap-1 font-medium"
                        >
                          <span>Abrir Interface Web do Doop</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                        <a
                          href="http://localhost:4300/c/9AvMi5_xuu"
                          target="_blank"
                          rel="noreferrer"
                          className="text-[11px] text-[#737373] dark:text-[#85858b] hover:text-[#171717] dark:hover:text-[#ededed] flex items-center gap-1"
                        >
                          <span>Canvas Torra 31 (`9AvMi5_xuu`)</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: Prospecção & Contatos */}
          {tab === 'leads' && (
            <div className="space-y-4">
              {/* Search & Filter Bar */}
              <div className="bg-white dark:bg-[#252422] border border-[#E2DBD0] dark:border-[#403D39] p-3.5 sm:p-4.5 rounded-2xl flex flex-col gap-3 shadow-xs">
                {/* Row 1: Search, Dynamic Cities, Dynamic Niches, Counter, Clear Action & Import */}
                <div className="flex flex-col lg:flex-row lg:items-center gap-2.5 sm:gap-3 justify-between">
                  {/* Search Input with Keyboard Indicator */}
                  <div className="relative flex-1 w-full lg:max-w-md">
                    <Search className="w-4 h-4 text-[#78716C] dark:text-[#A8A29E] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      ref={searchInputRef}
                      type="text"
                      placeholder="Buscar comércio, categoria, telefone..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="w-full pl-10 pr-14 py-2.5 rounded-xl bg-[#FAF8F5] dark:bg-[#1c1b1a] border border-[#E2DBD0] dark:border-[#403D39] text-xs text-[#1C1917] dark:text-[#FFFCF2] placeholder-[#78716C]/70 dark:placeholder-[#A8A29E]/60 focus:outline-none focus:border-[#EB5E28] focus:ring-2 focus:ring-[#EB5E28]/15 transition-colors"
                    />
                    <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
                      {search ? (
                        <button
                          onClick={() => setSearch('')}
                          className="p-1 text-[#78716C] hover:text-[#1C1917] dark:text-[#A8A29E] dark:hover:text-[#FFFCF2] transition-colors cursor-pointer rounded-md hover:bg-[#E2DBD0]/40"
                          aria-label="Limpar busca"
                          title="Limpar busca"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      ) : (
                        <kbd className="hidden sm:inline-flex items-center px-1.5 py-0.5 text-[10px] font-mono font-medium text-[#78716C] dark:text-[#A8A29E] bg-[#E2DBD0]/50 dark:bg-[#403D39]/50 rounded border border-[#E2DBD0]/80 dark:border-[#403D39]/80 select-none">
                          /
                        </kbd>
                      )}
                    </div>
                  </div>

                  {/* Filter Controls & Secondary Action */}
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 justify-between lg:justify-end w-full lg:w-auto">
                    {/* Selectors Group: 2 columns on mobile, inline flex on desktop */}
                    <div className="grid grid-cols-2 sm:flex sm:items-center gap-2 w-full sm:w-auto">
                      {/* Dynamic City Selector with Exact Counts */}
                      <ModernDropdown
                        value={cityFilter}
                        onChange={setCityFilter}
                        options={availableCities.map((c) => ({ id: c.city, label: c.city, count: c.count }))}
                        allLabel="Todas Cidades"
                        totalCount={stats.totalLeads || leads.length}
                        icon={MapPin}
                        searchPlaceholder="Buscar cidade..."
                        align="left"
                      />

                      {/* Dynamic Niche Selector with Exact Counts */}
                      <ModernDropdown
                        value={nicheFilter}
                        onChange={setNicheFilter}
                        options={availableNiches.map((n) => ({ id: n.id, label: n.label, count: n.count, icon: getNicheIcon(n.id) }))}
                        allLabel="Todos Nichos"
                        totalCount={stats.totalLeads || leads.length}
                        icon={Briefcase}
                        searchPlaceholder="Buscar nicho..."
                        align="right"
                      />
                    </div>

                    <div className="flex items-center gap-2 justify-between sm:justify-end w-full sm:w-auto">
                      {/* Results Counter Tag */}
                      <div className="text-xs text-[#57534E] dark:text-[#CCC5B9] px-2.5 py-2 bg-[#FAF8F5] dark:bg-[#1c1b1a] rounded-xl border border-[#E2DBD0]/70 dark:border-[#403D39]/60 hidden sm:flex items-center gap-1.5 font-sans whitespace-nowrap shrink-0">
                        <span>Exibindo</span>
                        <span className="font-semibold text-[#1C1917] dark:text-[#FFFCF2] font-mono tabular-nums">{displayedLeads.length}</span>
                        <span>de</span>
                        <span className="font-semibold text-[#1C1917] dark:text-[#FFFCF2] font-mono tabular-nums">{leads.length}</span>
                      </div>

                      {/* Clear Active Filters Button */}
                      {(search || cityFilter || nicheFilter || pitchFilter) && (
                        <button
                          onClick={() => {
                            setSearch('');
                            setCityFilter('');
                            setNicheFilter('');
                            setPitchFilter('');
                          }}
                          className="inline-flex items-center gap-1 px-2.5 py-2 rounded-xl text-xs font-medium text-[#78716C] hover:text-[#EB5E28] dark:text-[#A8A29E] dark:hover:text-[#EB5E28] hover:bg-[#EB5E28]/10 border border-transparent hover:border-[#EB5E28]/25 transition-colors duration-150 cursor-pointer active:scale-[0.98] whitespace-nowrap shrink-0"
                          title="Limpar todos os filtros ativos"
                        >
                          <X className="w-3.5 h-3.5 shrink-0" />
                          <span>Limpar filtros</span>
                        </button>
                      )}

                      {/* Import Button */}
                      <button
                        onClick={handleImportLeads}
                        disabled={loading}
                        className="hidden sm:flex px-3.5 py-2.5 rounded-xl bg-[#FAF8F5] hover:bg-[#F2ECE1] dark:bg-[#1c1b1a] dark:hover:bg-[#33302d] text-[#1C1917] dark:text-[#FFFCF2] font-semibold text-xs border border-[#E2DBD0] dark:border-[#403D39] hover:border-[#CCC5B9] transition-colors duration-150 items-center gap-1.5 active:scale-[0.98] cursor-pointer shadow-xs disabled:opacity-50 whitespace-nowrap shrink-0"
                        title="Sincronizar base com dados do Scraper Kit"
                      >
                        <Database className="w-3.5 h-3.5 text-[#EB5E28] shrink-0" />
                        <span>Importar Scraper</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Row 2: Status Filter Pills with Live Badges */}
                <DraggableScrollRow label="Status:" icon={Filter} className="pt-2.5">
                  {[
                    { id: '', label: 'Todos', icon: Database, count: stats.totalLeads || leads.length },
                    { id: 'has_reviews', label: 'Com Avaliações Google', icon: Star, color: 'text-amber-500 dark:text-amber-400', count: stats.hasReviewsCount },
                    { id: 'google_sites', label: 'Google Sites', icon: Globe, color: 'text-indigo-600 dark:text-indigo-400', count: stats.pitchCounts?.google_sites || 0, isHot: true },
                    { id: 'no_site', label: 'Sem Site', icon: Flame, color: 'text-rose-500 dark:text-rose-400', count: stats.pitchCounts?.no_site || 0 },
                    { id: 'offline_site', label: 'Site Fora do Ar', icon: AlertTriangle, color: 'text-amber-500 dark:text-amber-400', count: stats.pitchCounts?.offline_site || 0 },
                    { id: 'whatsapp_site', label: 'Usa WhatsApp', icon: MessageSquare, color: 'text-emerald-500 dark:text-emerald-400', count: stats.pitchCounts?.whatsapp_site || 0 },
                    { id: 'social_site', label: 'Rede Social', icon: Share2, color: 'text-sky-500 dark:text-sky-400', count: stats.pitchCounts?.social_site || 0 },
                    { id: 'bio_site', label: 'Link de Bio', icon: Link2, color: 'text-purple-500 dark:text-purple-400', count: stats.pitchCounts?.bio_site || 0 },
                    { id: 'active_site', label: 'Site Ativo', icon: CheckCircle2, color: 'text-[#57534E] dark:text-[#CCC5B9]', count: stats.pitchCounts?.active_site || 0 }
                  ].map((item) => {
                    const Icon = item.icon;
                    const isActive = pitchFilter === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => setPitchFilter(item.id)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-medium flex items-center gap-1.5 transition-colors duration-150 active:scale-[0.98] cursor-pointer whitespace-nowrap shrink-0 ${
                          isActive
                            ? 'bg-[#EB5E28] text-white font-semibold border border-[#EB5E28] shadow-xs'
                            : item.isHot
                            ? 'bg-indigo-500/10 hover:bg-indigo-500/15 text-indigo-900 dark:text-indigo-200 border border-indigo-500/30'
                            : 'bg-[#FAF8F5] dark:bg-[#1c1b1a] border border-[#E2DBD0] dark:border-[#403D39] text-[#57534E] dark:text-[#CCC5B9] hover:text-[#1C1917] dark:hover:text-[#FFFCF2] hover:border-[#CCC5B9] dark:hover:border-[#57524d]'
                        }`}
                      >
                        <Icon className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-white' : item.color || 'text-[#57534E] dark:text-[#CCC5B9]'}`} />
                        <span>{item.label}</span>
                        {item.count !== undefined && (
                          <span
                            className={`ml-0.5 px-1.5 py-0.2 text-[10px] font-mono rounded-md font-semibold ${
                              isActive
                                ? 'bg-white/25 text-white'
                                : item.isHot
                                ? 'bg-indigo-500/20 text-indigo-700 dark:text-indigo-300'
                                : 'bg-[#E2DBD0]/60 dark:bg-[#403D39]/60 text-[#57534E] dark:text-[#CCC5B9]'
                            }`}
                          >
                            {item.count}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </DraggableScrollRow>

                {/* Row 3: Niche Quick Selection Pills with Icons & Live Counts */}
                <DraggableScrollRow label="Nichos:" icon={Briefcase} className="pt-2">
                  <button
                    onClick={() => setNicheFilter('')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-medium flex items-center gap-1.5 transition-colors duration-150 active:scale-[0.98] cursor-pointer whitespace-nowrap shrink-0 ${
                      !nicheFilter
                        ? 'bg-[#1C1917] dark:bg-[#FFFCF2] text-white dark:text-[#1C1917] font-semibold shadow-xs'
                        : 'bg-[#FAF8F5] dark:bg-[#1c1b1a] border border-[#E2DBD0] dark:border-[#403D39] text-[#57534E] dark:text-[#CCC5B9] hover:text-[#1C1917] dark:hover:text-[#FFFCF2]'
                    }`}
                  >
                    <span>Todos os Nichos</span>
                    <span className="ml-0.5 px-1.5 py-0.2 text-[10px] font-mono rounded-md font-semibold bg-[#E2DBD0]/60 dark:bg-[#403D39]/60">
                      {stats.totalLeads || leads.length}
                    </span>
                  </button>
                  {availableNiches.map((n) => {
                    const Icon = getNicheIcon(n.id);
                    const isActive = nicheFilter === n.id;
                    return (
                      <button
                        key={n.id}
                        onClick={() => setNicheFilter(isActive ? '' : n.id)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-medium flex items-center gap-1.5 transition-colors duration-150 active:scale-[0.98] cursor-pointer whitespace-nowrap shrink-0 ${
                          isActive
                            ? 'bg-[#EB5E28] text-white font-semibold border border-[#EB5E28] shadow-xs'
                            : 'bg-[#FAF8F5] dark:bg-[#1c1b1a] border border-[#E2DBD0] dark:border-[#403D39] text-[#57534E] dark:text-[#CCC5B9] hover:text-[#1C1917] dark:hover:text-[#FFFCF2] hover:border-[#CCC5B9] dark:hover:border-[#57524d]'
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5 shrink-0 text-[#EB5E28]" />
                        <span>{n.label}</span>
                        <span
                          className={`ml-0.5 px-1.5 py-0.2 text-[10px] font-mono rounded-md font-semibold ${
                            isActive
                              ? 'bg-white/25 text-white'
                              : 'bg-[#E2DBD0]/60 dark:bg-[#403D39]/60 text-[#57534E] dark:text-[#CCC5B9]'
                          }`}
                        >
                          {n.count}
                        </span>
                      </button>
                    );
                  })}
                </DraggableScrollRow>
              </div>

              {/* Batch Revalidate Bar for Offline Sites */}
              {pitchFilter === 'offline_site' && (
                <div className="bg-amber-500/10 dark:bg-amber-950/30 border border-amber-500/30 dark:border-amber-800/40 p-4 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
                  <div className="flex items-center gap-2.5 text-xs text-amber-900 dark:text-amber-200">
                    <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600 dark:text-amber-400" />
                    <span>
                      Filtro de Sites Fora do Ar ativo. Você pode revalidar todas as conexões pendentes para atualizar com verificações HTTP completas.
                    </span>
                  </div>
                  <button
                    onClick={handleBatchRevalidateTimeouts}
                    disabled={isBatchValidating}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs transition-colors shrink-0 cursor-pointer shadow-xs active:scale-[0.98] disabled:opacity-50"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isBatchValidating ? 'animate-spin' : ''}`} />
                    <span>{isBatchValidating ? 'Revalidando Sites...' : 'Revalidar Todos os Timeouts'}</span>
                  </button>
                </div>
              )}

              {/* Google Sites High-Conversion Banner */}
              {pitchFilter === 'google_sites' && (
                <div className="bg-indigo-500/10 dark:bg-indigo-950/30 border border-indigo-500/30 dark:border-indigo-800/40 p-4 rounded-2xl flex items-center gap-3 shadow-xs text-xs text-indigo-950 dark:text-indigo-200">
                  <Globe className="w-4 h-4 shrink-0 text-indigo-600 dark:text-indigo-400" />
                  <span>
                    <strong>Oportunidade de Alta Conversão:</strong> Estes comércios já valorizam ter presença online e usam o Google Sites. Porém, essas páginas são genéricas e perdem clientes no celular pela falta de botão de WhatsApp fixo e domínio próprio. Use a copy de WhatsApp personalizada e o protótipo de alta fidelidade para demonstrar o upgrade!
                  </span>
                </div>
              )}

              {/* Leads Table & Cards Container */}
              <div className="bg-white dark:bg-[#252422] border border-[#E2DBD0] dark:border-[#403D39] rounded-2xl overflow-hidden shadow-xs">
                {/* Desktop Table View with Edge Gradient Fade (Hidden on mobile < md) */}
                <div className="hidden md:block relative">
                  {/* Left Gradient Fade Mask (when table scrolled right) */}
                  {canScrollTableLeft && (
                    <div className="absolute left-0 top-0 bottom-0 w-16 z-20 pointer-events-none bg-gradient-to-r from-white via-white/85 to-transparent dark:from-[#252422] dark:via-[#252422]/85 transition-opacity duration-200" />
                  )}

                  {/* Scrollable Table Track with Mouse Drag-to-Scroll */}
                  <div
                    ref={tableScrollRef}
                    onMouseDown={handleTableMouseDown}
                    onClickCapture={handleTableClickCapture}
                    onDragStart={(e) => e.preventDefault()}
                    className={`overflow-x-auto scrollbar-none transition-colors duration-150 ${
                      isTableGrabbing ? 'cursor-grabbing select-none [&_*]:cursor-grabbing' : 'cursor-grab'
                    }`}
                  >
                    <table className="w-full text-left text-xs">
                    <thead className="bg-[#F9F7F1] dark:bg-[#1c1b1a] border-b border-[#E2DBD0] dark:border-[#403D39] text-[#5A554E] dark:text-[#CCC5B9] font-heading font-medium text-[11px]">
                      <tr>
                        <th className="py-3 px-4">Comércio & Nicho</th>
                        <th className="py-3 px-4">Cidade & Contato</th>
                        <th className="py-3 px-4">Presença Digital</th>
                        <th className="py-3 px-4">Etapa</th>
                        <th className="py-3 px-4 text-right">Ações</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E2DBD0]/70 dark:divide-[#403D39]/60">
                      {loading && displayedLeads.length === 0 ? (
                        <SkeletonTableRow count={8} />
                      ) : displayedLeads.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="py-12 text-center text-[#5A554E] dark:text-[#CCC5B9]">
                            <Database className="w-8 h-8 mx-auto mb-2 text-[#5A554E]/60 dark:text-[#CCC5B9]/60" />
                            Nenhum comércio encontrado com os filtros atuais.
                            <div className="mt-3">
                              <button
                                onClick={handleImportLeads}
                                className="px-4 py-2 rounded-xl bg-[#EB5E28] hover:bg-[#d8521d] text-[#FFFCF2] font-semibold text-xs inline-flex items-center gap-1.5 active:scale-[0.98] transition-colors cursor-pointer whitespace-nowrap"
                              >
                                <Database className="w-3.5 h-3.5" />
                                Carregar do Scraper RMBH
                              </button>
                            </div>
                          </td>
                        </tr>
                      ) : (
                        paginatedLeads.map((lead) => (
                          <tr
                            key={lead.id}
                            onClick={() => setDetailModalLead(lead)}
                            onMouseEnter={() => prefetchLeadDetails(lead.id)}
                            className={`hover:bg-[#F9F7F1] dark:hover:bg-[#2d2b28] cursor-pointer transition-colors duration-150 ${
                              selectedLead?.id === lead.id ? 'bg-[#F2ECE1]/60 dark:bg-[#33302d]/70 border-l-2 border-l-[#EB5E28]' : ''
                            }`}
                          >
                            <td className="py-3.5 px-4">
                              <div className="flex items-start gap-2.5">
                                <div className="w-8 h-8 rounded-lg bg-[#F2ECE1] dark:bg-[#33302d] text-[#252422] dark:text-[#FFFCF2] font-heading font-bold text-xs flex items-center justify-center shrink-0 border border-[#E2DBD0] dark:border-[#403D39] mt-0.5">
                                  {lead.name.charAt(0).toUpperCase()}
                                </div>
                                <div className="min-w-0">
                                  <div className="font-heading font-bold text-[#252422] dark:text-[#FFFCF2] text-sm tracking-tight hover:text-[#EB5E28] transition-colors truncate">
                                    {lead.name}
                                  </div>
                                  <div className="flex flex-wrap items-center gap-1.5 text-xs mt-0.5 font-sans">
                                    <span className="px-1.5 py-0.5 rounded bg-[#F2ECE1] dark:bg-[#33302d] text-[10px] font-semibold text-[#1C1917] dark:text-[#CCC5B9] border border-[#E2DBD0]/60 dark:border-[#403D39]/60 whitespace-nowrap">
                                      {lead.nicheLabel || lead.category || 'Geral'}
                                    </span>
                                    <span className="text-[#5A554E] dark:text-[#CCC5B9] text-[11px] truncate max-w-[120px]">{lead.category || 'Geral'}</span>
                                    {lead.rating && (
                                      <span className="text-amber-600 dark:text-amber-400 font-semibold flex items-center gap-1 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20 whitespace-nowrap">
                                        <Star className="w-3 h-3 fill-amber-500 text-amber-500 dark:fill-amber-400 dark:text-amber-400" />
                                        <span>{parseFloat(lead.rating).toFixed(1)}</span>
                                        <span className="text-[#5A554E] dark:text-[#CCC5B9] font-normal">({lead.reviewsCount || 0})</span>
                                      </span>
                                    )}
                                    {parseLeadReviews(lead.userReviews).length > 0 && (
                                      <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20 whitespace-nowrap" title="Possui comentários reais de clientes">
                                        <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600 dark:text-emerald-400" />
                                        <span>{parseLeadReviews(lead.userReviews).length} com.</span>
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="py-3.5 px-4 whitespace-nowrap font-sans">
                              <div className="text-[#5A554E] dark:text-[#CCC5B9] flex items-center gap-1.5">
                                <MapPin className="w-3 h-3 text-[#5A554E]/70 dark:text-[#CCC5B9]/70 shrink-0" />
                                <span>{lead.city || 'RMBH'}</span>
                              </div>
                              <div className="text-[#5A554E] dark:text-[#CCC5B9] font-mono text-xs mt-1 flex items-center gap-1.5">
                                <Phone className="w-3 h-3 text-[#5A554E]/70 dark:text-[#CCC5B9]/70 shrink-0" />
                                <span>{lead.phoneNorm || lead.phoneRaw || 'Sem telefone'}</span>
                                {(lead.phoneNorm || lead.phoneRaw) && (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      copyToClipboard(lead.phoneNorm || lead.phoneRaw, `Telefone ${lead.name}`);
                                    }}
                                    className="text-[#5A554E] dark:text-[#CCC5B9] hover:text-[#252422] dark:hover:text-[#FFFCF2] p-1 transition-colors cursor-pointer"
                                    title="Copiar telefone"
                                    aria-label="Copiar telefone"
                                  >
                                    <Copy className="w-3 h-3" />
                                  </button>
                                )}
                              </div>
                            </td>
                            <td className="py-3.5 px-4">
                              <span
                                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border whitespace-nowrap shrink-0 ${
                                  lead.pitchType === 'no_site'
                                    ? 'bg-rose-500/10 dark:bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/25 dark:border-rose-500/30'
                                    : lead.pitchType === 'offline_site'
                                    ? 'bg-amber-500/10 dark:bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/25 dark:border-amber-500/30'
                                    : lead.pitchType === 'whatsapp_site'
                                    ? 'bg-emerald-500/10 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/25 dark:border-emerald-500/30'
                                    : lead.pitchType === 'social_site'
                                    ? 'bg-sky-500/10 dark:bg-sky-500/15 text-sky-700 dark:text-sky-300 border-sky-500/25 dark:border-sky-500/30'
                                    : lead.pitchType === 'bio_site'
                                    ? 'bg-purple-500/10 dark:bg-purple-500/15 text-purple-700 dark:text-purple-300 border-purple-500/25 dark:border-purple-500/30'
                                    : lead.pitchType === 'google_sites'
                                    ? 'bg-indigo-500/10 dark:bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 border-indigo-500/25 dark:border-indigo-500/30'
                                    : 'bg-[#F9F7F1] dark:bg-[#1c1b1a] text-[#5A554E] dark:text-[#CCC5B9] border-[#E2DBD0] dark:border-[#403D39]'
                                }`}
                              >
                                {lead.pitchType === 'no_site' && <Flame className="w-3 h-3 text-rose-500 dark:text-rose-400" />}
                                {lead.pitchType === 'offline_site' && <AlertTriangle className="w-3 h-3 text-amber-500 dark:text-amber-400" />}
                                {lead.pitchType === 'whatsapp_site' && <MessageSquare className="w-3 h-3 text-emerald-500 dark:text-emerald-400" />}
                                {lead.pitchType === 'social_site' && <Share2 className="w-3 h-3 text-sky-500 dark:text-sky-400" />}
                                {lead.pitchType === 'bio_site' && <Link2 className="w-3 h-3 text-purple-500 dark:text-purple-400" />}
                                {lead.pitchType === 'google_sites' && <Globe className="w-3 h-3 text-indigo-600 dark:text-indigo-400" />}
                                {lead.pitchType === 'active_site' && <CheckCircle2 className="w-3 h-3 text-[#5A554E] dark:text-[#CCC5B9]" />}

                                <span>
                                  {lead.pitchType === 'no_site' && 'Sem Site'}
                                  {lead.pitchType === 'offline_site' && 'Site Fora do Ar'}
                                  {lead.pitchType === 'whatsapp_site' && 'Usa WhatsApp'}
                                  {lead.pitchType === 'social_site' && 'Rede Social'}
                                  {lead.pitchType === 'bio_site' && 'Link de Bio'}
                                  {lead.pitchType === 'google_sites' && 'Google Sites'}
                                  {lead.pitchType === 'active_site' && 'Site Ativo'}
                                </span>
                              </span>
                              {lead.siteAuditReason && (
                                <div className="text-[10px] text-[#5A554E]/80 dark:text-[#CCC5B9]/80 mt-1 max-w-xs truncate font-sans">
                                  {lead.siteAuditReason}
                                </div>
                              )}
                            </td>
                            <td className="py-3.5 px-4 whitespace-nowrap">
                              <span className="capitalize px-2.5 py-1 rounded-lg bg-[#F9F7F1] dark:bg-[#1c1b1a] border border-[#E2DBD0] dark:border-[#403D39] text-[#5A554E] dark:text-[#CCC5B9] font-medium text-[11px] whitespace-nowrap inline-block">
                                {lead.stage.replace(/_/g, ' ')}
                              </span>
                            </td>
                            <td className="py-3.5 px-4 text-right">
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    openEditModal(lead);
                                  }}
                                  className="px-2.5 py-1.5 rounded-xl bg-[#F2ECE1] hover:bg-[#E6DFD3] dark:bg-[#33302d] dark:hover:bg-[#403D39] text-[#252422] dark:text-[#FFFCF2] border border-[#E2DBD0] dark:border-[#403D39] transition-colors duration-150 flex items-center gap-1.5 active:scale-[0.98] cursor-pointer text-xs font-semibold whitespace-nowrap shrink-0"
                                  title="Editar informações deste comércio (telefone, nome, endereço)"
                                  aria-label="Editar comércio"
                                >
                                  <Pencil className="w-3.5 h-3.5 text-[#EB5E28] shrink-0" />
                                  <span className="hidden sm:inline">Editar</span>
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setDetailModalLead(lead);
                                  }}
                                  className="px-2.5 py-1.5 rounded-xl bg-[#F2ECE1] hover:bg-[#E6DFD3] dark:bg-[#33302d] dark:hover:bg-[#403D39] text-[#252422] dark:text-[#FFFCF2] border border-[#E2DBD0] dark:border-[#403D39] transition-colors duration-150 flex items-center gap-1.5 active:scale-[0.98] cursor-pointer text-xs font-semibold whitespace-nowrap shrink-0"
                                  title="Ver detalhes do comércio e avaliações"
                                  aria-label="Ver detalhes"
                                >
                                  <Eye className="w-3.5 h-3.5 text-[#5A554E] dark:text-[#CCC5B9] shrink-0" />
                                  <span className="hidden sm:inline">Detalhes</span>
                                </button>
                                {lead.website && (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleRevalidateLeadSite(lead.id);
                                    }}
                                    disabled={isValidatingSite}
                                    className="p-1.5 rounded-xl bg-[#F2ECE1] hover:bg-amber-500/15 text-[#5A554E] hover:text-amber-800 dark:text-[#CCC5B9] dark:hover:text-amber-300 border border-[#E2DBD0] dark:border-[#403D39] transition-colors duration-150 active:scale-[0.98] cursor-pointer disabled:opacity-50 shrink-0"
                                    title="Revalidar status de conexão do site"
                                    aria-label="Revalidar status do site"
                                  >
                                    <RefreshCw className={`w-3.5 h-3.5 ${isValidatingSite ? 'animate-spin' : ''}`} />
                                  </button>
                                )}
                                {lead.doopCanvasUrl || lead.doopCanvasId ? (
                                  <a
                                    href={lead.doopCanvasUrl || `http://localhost:4300/c/${lead.doopCanvasId}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    onClick={(e) => e.stopPropagation()}
                                    className="px-3 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border border-emerald-500/35 font-semibold text-xs transition-colors duration-150 flex items-center gap-1.5 active:scale-[0.98] whitespace-nowrap shrink-0"
                                    title="Abrir Canvas com 12 pranchetas no Doop"
                                  >
                                    <LayoutTemplate className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                                    <span>Canvas Doop</span>
                                    <ExternalLink className="w-3 h-3 opacity-70 shrink-0" />
                                  </a>
                                ) : (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handlePreparePrototype(lead);
                                    }}
                                    className="px-3 py-1.5 rounded-xl bg-[#EB5E28]/10 hover:bg-[#EB5E28]/20 dark:bg-[#EB5E28]/15 dark:hover:bg-[#EB5E28]/25 text-[#EB5E28] border border-[#EB5E28]/35 font-semibold text-xs transition-colors duration-150 flex items-center gap-1.5 active:scale-[0.98] cursor-pointer whitespace-nowrap shrink-0"
                                    title="Criar layout único no Doop para este comércio"
                                  >
                                    <LayoutTemplate className="w-3.5 h-3.5 shrink-0" />
                                    <span>Criar Layout</span>
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Right Gradient Fade Mask (when table overflows right) */}
                {canScrollTableRight && (
                  <div className="absolute right-0 top-0 bottom-0 w-16 z-20 pointer-events-none bg-gradient-to-l from-white via-white/85 to-transparent dark:from-[#252422] dark:via-[#252422]/85 transition-opacity duration-200" />
                )}
              </div>

                {/* Mobile Card List View (Exclusively rendered on mobile < md for zero side-scroll) */}
                <div className="block md:hidden divide-y divide-[#E2DBD0]/70 dark:divide-[#403D39]/60">
                  {loading && displayedLeads.length === 0 ? (
                    <div className="p-3">
                      <SkeletonLeadCard count={4} />
                    </div>
                  ) : displayedLeads.length === 0 ? (
                    <div className="py-12 px-4 text-center text-[#5A554E] dark:text-[#CCC5B9]">
                      <Database className="w-8 h-8 mx-auto mb-2 text-[#5A554E]/60 dark:text-[#CCC5B9]/60" />
                      Nenhum comércio encontrado com os filtros atuais.
                      <div className="mt-3">
                        <button
                          onClick={handleImportLeads}
                          className="px-4 py-2 rounded-xl bg-[#EB5E28] hover:bg-[#d8521d] text-[#FFFCF2] font-semibold text-xs inline-flex items-center gap-1.5 active:scale-[0.98] transition-colors cursor-pointer whitespace-nowrap"
                        >
                          <Database className="w-3.5 h-3.5 shrink-0" />
                          Carregar do Scraper RMBH
                        </button>
                      </div>
                    </div>
                  ) : (
                    paginatedLeads.map((lead) => {
                      const NicheIcon = getNicheIcon(lead.niche);
                      return (
                        <div
                          key={lead.id}
                          onClick={() => setDetailModalLead(lead)}
                          onMouseEnter={() => prefetchLeadDetails(lead.id)}
                          className={`p-3.5 space-y-3 transition-colors duration-150 cursor-pointer ${
                            selectedLead?.id === lead.id
                              ? 'bg-[#F2ECE1]/60 dark:bg-[#33302d]/70 border-l-4 border-l-[#EB5E28]'
                              : 'hover:bg-[#F9F7F1] dark:hover:bg-[#2d2b28]'
                          }`}
                        >
                          {/* Top: Initial + Name + Rating */}
                          <div className="flex items-start justify-between gap-2.5">
                            <div className="flex items-start gap-2.5 min-w-0">
                              <div className="w-9 h-9 rounded-xl bg-[#F2ECE1] dark:bg-[#33302d] text-[#252422] dark:text-[#FFFCF2] font-heading font-bold text-xs flex items-center justify-center shrink-0 border border-[#E2DBD0] dark:border-[#403D39] mt-0.5">
                                {lead.name.charAt(0).toUpperCase()}
                              </div>
                              <div className="min-w-0">
                                <div className="font-heading font-bold text-[#252422] dark:text-[#FFFCF2] text-sm tracking-tight hover:text-[#EB5E28] transition-colors truncate">
                                  {lead.name}
                                </div>
                                <div className="flex flex-wrap items-center gap-1.5 mt-1">
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#FAF8F5] dark:bg-[#1c1b1a] text-[10px] font-semibold text-[#1C1917] dark:text-[#CCC5B9] border border-[#E2DBD0] dark:border-[#403D39]">
                                    <NicheIcon className="w-3 h-3 text-[#EB5E28] shrink-0" />
                                    <span className="whitespace-nowrap">{lead.nicheLabel || lead.category || 'Geral'}</span>
                                  </span>
                                  <span className="text-[11px] text-[#5A554E] dark:text-[#CCC5B9] flex items-center gap-0.5 whitespace-nowrap">
                                    <MapPin className="w-3 h-3 text-[#EB5E28] shrink-0" />
                                    {lead.city || 'RMBH'}
                                  </span>
                                </div>
                              </div>
                            </div>

                            {lead.rating && (
                              <span className="text-amber-600 dark:text-amber-400 font-semibold flex items-center gap-1 bg-amber-500/10 px-2 py-0.5 rounded-lg border border-amber-500/20 text-xs shrink-0 whitespace-nowrap">
                                <Star className="w-3 h-3 fill-amber-500 text-amber-500 dark:fill-amber-400 dark:text-amber-400" />
                                <span>{parseFloat(lead.rating).toFixed(1)}</span>
                              </span>
                            )}
                          </div>

                          {/* Middle: Phone & Presence */}
                          <div className="flex flex-wrap items-center justify-between gap-2 text-xs pt-1 border-t border-[#E2DBD0]/60 dark:border-[#403D39]/50">
                            <div className="flex items-center gap-1.5 font-mono text-[#5A554E] dark:text-[#CCC5B9] whitespace-nowrap">
                              <Phone className="w-3 h-3 text-[#5A554E]/70 dark:text-[#CCC5B9]/70 shrink-0" />
                              <span>{lead.phoneNorm || lead.phoneRaw || 'Sem telefone'}</span>
                              {(lead.phoneNorm || lead.phoneRaw) && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    copyToClipboard(lead.phoneNorm || lead.phoneRaw, `Telefone ${lead.name}`);
                                  }}
                                  className="text-[#5A554E] dark:text-[#CCC5B9] hover:text-[#252422] dark:hover:text-[#FFFCF2] p-1 transition-colors cursor-pointer"
                                  title="Copiar telefone"
                                  aria-label="Copiar telefone"
                                >
                                  <Copy className="w-3 h-3" />
                                </button>
                              )}
                            </div>

                            {/* Presence badge */}
                            <span
                              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold border whitespace-nowrap shrink-0 ${
                                lead.pitchType === 'no_site'
                                  ? 'bg-rose-500/10 dark:bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/25 dark:border-rose-500/30'
                                  : lead.pitchType === 'offline_site'
                                  ? 'bg-amber-500/10 dark:bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/25 dark:border-amber-500/30'
                                  : lead.pitchType === 'whatsapp_site'
                                  ? 'bg-emerald-500/10 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/25 dark:border-emerald-500/30'
                                  : lead.pitchType === 'social_site'
                                  ? 'bg-sky-500/10 dark:bg-sky-500/15 text-sky-700 dark:text-sky-300 border-sky-500/25 dark:border-sky-500/30'
                                  : lead.pitchType === 'bio_site'
                                  ? 'bg-purple-500/10 dark:bg-purple-500/15 text-purple-700 dark:text-purple-300 border-purple-500/25 dark:border-purple-500/30'
                                  : lead.pitchType === 'google_sites'
                                  ? 'bg-indigo-500/10 dark:bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 border-indigo-500/25 dark:border-indigo-500/30'
                                  : 'bg-[#F9F7F1] dark:bg-[#1c1b1a] text-[#5A554E] dark:text-[#CCC5B9] border-[#E2DBD0] dark:border-[#403D39]'
                              }`}
                            >
                              {lead.pitchType === 'no_site' && <Flame className="w-3 h-3 text-rose-500 dark:text-rose-400" />}
                              {lead.pitchType === 'offline_site' && <AlertTriangle className="w-3 h-3 text-amber-500 dark:text-amber-400" />}
                              {lead.pitchType === 'whatsapp_site' && <MessageSquare className="w-3 h-3 text-emerald-500 dark:text-emerald-400" />}
                              {lead.pitchType === 'social_site' && <Share2 className="w-3 h-3 text-sky-500 dark:text-sky-400" />}
                              {lead.pitchType === 'bio_site' && <Link2 className="w-3 h-3 text-purple-500 dark:text-purple-400" />}
                              {lead.pitchType === 'google_sites' && <Globe className="w-3 h-3 text-indigo-600 dark:text-indigo-400" />}
                              {lead.pitchType === 'active_site' && <CheckCircle2 className="w-3 h-3 text-[#5A554E] dark:text-[#CCC5B9]" />}
                              <span>
                                {lead.pitchType === 'no_site' && 'Sem Site'}
                                {lead.pitchType === 'offline_site' && 'Site Fora do Ar'}
                                {lead.pitchType === 'whatsapp_site' && 'Usa WhatsApp'}
                                {lead.pitchType === 'social_site' && 'Rede Social'}
                                {lead.pitchType === 'bio_site' && 'Link de Bio'}
                                {lead.pitchType === 'google_sites' && 'Google Sites'}
                                {lead.pitchType === 'active_site' && 'Site Ativo'}
                              </span>
                            </span>
                          </div>

                          {lead.siteAuditReason && (
                            <div className="text-[10px] text-[#5A554E]/80 dark:text-[#CCC5B9]/80 truncate font-sans">
                              {lead.siteAuditReason}
                            </div>
                          )}

                          {/* Bottom Mobile Action Buttons: strictly white-space: nowrap */}
                          <div className="space-y-2 pt-1 border-t border-[#E2DBD0]/60 dark:border-[#403D39]/50">
                            {/* Tier 1 Primary Action: Abordar no WhatsApp */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                selectLead(lead);
                                setTab('whatsapp');
                              }}
                              className="w-full py-2.5 px-3 rounded-xl bg-[#EB5E28] hover:bg-[#d8521d] text-white font-semibold text-xs inline-flex items-center justify-center gap-2 active:scale-[0.98] cursor-pointer whitespace-nowrap shadow-xs"
                            >
                              <MessageSquare className="w-4 h-4 shrink-0" />
                              <span>Abordar no WhatsApp</span>
                            </button>

                            {/* Tier 2 Secondary Utilities: 3 equal columns */}
                            <div className="grid grid-cols-3 gap-1.5 w-full">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openEditModal(lead);
                                }}
                                className="py-2 px-1.5 rounded-xl bg-[#F2ECE1] dark:bg-[#33302d] text-[#1C1917] dark:text-[#FFFCF2] text-xs font-semibold inline-flex items-center justify-center gap-1 border border-[#E2DBD0] dark:border-[#403D39] active:scale-[0.98] cursor-pointer whitespace-nowrap"
                              >
                                <Pencil className="w-3.5 h-3.5 text-[#EB5E28] shrink-0" />
                                <span>Editar</span>
                              </button>

                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setDetailModalLead(lead);
                                }}
                                className="py-2 px-1.5 rounded-xl bg-[#F2ECE1] dark:bg-[#33302d] text-[#5A554E] dark:text-[#CCC5B9] text-xs font-semibold inline-flex items-center justify-center gap-1 border border-[#E2DBD0] dark:border-[#403D39] active:scale-[0.98] cursor-pointer whitespace-nowrap"
                              >
                                <Eye className="w-3.5 h-3.5 shrink-0" />
                                <span>Detalhes</span>
                              </button>

                              {lead.doopCanvasUrl || lead.doopCanvasId ? (
                                <a
                                  href={lead.doopCanvasUrl || `http://localhost:4300/c/${lead.doopCanvasId}`}
                                  target="_blank"
                                  rel="noreferrer"
                                  onClick={(e) => e.stopPropagation()}
                                  className="py-2 px-1.5 rounded-xl bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 border border-emerald-500/35 text-xs font-semibold inline-flex items-center justify-center gap-1 whitespace-nowrap active:scale-[0.98]"
                                >
                                  <LayoutTemplate className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                                  <span>Doop</span>
                                </a>
                              ) : (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handlePreparePrototype(lead);
                                  }}
                                  className="py-2 px-1.5 rounded-xl bg-[#EB5E28]/10 text-[#EB5E28] border border-[#EB5E28]/35 text-xs font-semibold inline-flex items-center justify-center gap-1 whitespace-nowrap active:scale-[0.98] cursor-pointer"
                                >
                                  <LayoutTemplate className="w-3.5 h-3.5 shrink-0" />
                                  <span>Layout</span>
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Table Pagination Footer */}
                {displayedLeads.length > 0 && (
                  <div className="px-3.5 sm:px-5 py-3 sm:py-3.5 bg-[#F9F7F1] dark:bg-[#1c1b1a] border-t border-[#E2DBD0] dark:border-[#403D39] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                    {/* Page Size Selector & Total Counter */}
                    <div className="flex flex-wrap items-center justify-between sm:justify-start gap-2.5 w-full sm:w-auto">
                      <div className="flex items-center gap-2">
                        <span className="text-[#5A554E] dark:text-[#CCC5B9] font-medium whitespace-nowrap">Por página:</span>
                        <div className="inline-flex rounded-xl bg-white dark:bg-[#252422] border border-[#E2DBD0] dark:border-[#403D39] p-0.5">
                          {[10, 25, 50, 100].map((size) => (
                            <button
                              key={size}
                              onClick={() => {
                                setPageSize(size);
                                setCurrentPage(1);
                              }}
                              className={`px-2.5 py-1 rounded-lg text-xs font-semibold tabular-nums transition-colors duration-150 cursor-pointer whitespace-nowrap ${
                                pageSize === size
                                  ? 'bg-[#EB5E28] text-[#FFFCF2] shadow-sm'
                                  : 'text-[#5A554E] dark:text-[#CCC5B9] hover:text-[#252422] dark:hover:text-[#FFFCF2] hover:bg-[#F2ECE1] dark:hover:bg-[#33302d]'
                              }`}
                            >
                              {size}
                            </button>
                          ))}
                        </div>
                      </div>

                      <span className="text-[#CCC5B9] dark:text-[#403D39] hidden sm:inline">•</span>

                      <div className="text-[#5A554E] dark:text-[#CCC5B9] whitespace-nowrap">
                        Mostrando <span className="font-semibold text-[#252422] dark:text-[#FFFCF2] tabular-nums">{startIndex + 1}–{Math.min(startIndex + pageSize, displayedLeads.length)}</span> de <span className="font-semibold text-[#252422] dark:text-[#FFFCF2] tabular-nums">{displayedLeads.length}</span> comércios
                      </div>
                    </div>

                    {/* Page Navigation Controls */}
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                        disabled={safeCurrentPage <= 1}
                        className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1 transition-colors duration-150 ${
                          safeCurrentPage <= 1
                            ? 'border-[#E2DBD0]/50 dark:border-[#403D39]/50 text-[#5A554E]/40 dark:text-[#CCC5B9]/40 bg-[#F9F7F1]/40 dark:bg-[#1c1b1a]/40 cursor-not-allowed'
                            : 'border-[#E2DBD0] dark:border-[#403D39] bg-white dark:bg-[#252422] text-[#5A554E] dark:text-[#CCC5B9] hover:bg-[#F2ECE1] dark:hover:bg-[#33302d] hover:text-[#252422] dark:hover:text-[#FFFCF2] active:scale-[0.98] cursor-pointer'
                        }`}
                        aria-label="Página anterior"
                      >
                        <ChevronLeft className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Anterior</span>
                      </button>

                      <div className="px-3 py-1.5 rounded-xl bg-white dark:bg-[#252422] border border-[#E2DBD0] dark:border-[#403D39] text-[#252422] dark:text-[#FFFCF2] font-mono text-xs tabular-nums font-semibold">
                        {safeCurrentPage} / {totalPages}
                      </div>

                      <button
                        onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                        disabled={safeCurrentPage >= totalPages}
                        className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1 transition-colors duration-150 ${
                          safeCurrentPage >= totalPages
                            ? 'border-[#E2DBD0]/50 dark:border-[#403D39]/50 text-[#5A554E]/40 dark:text-[#CCC5B9]/40 bg-[#F9F7F1]/40 dark:bg-[#1c1b1a]/40 cursor-not-allowed'
                            : 'border-[#E2DBD0] dark:border-[#403D39] bg-white dark:bg-[#252422] text-[#5A554E] dark:text-[#CCC5B9] hover:bg-[#F2ECE1] dark:hover:bg-[#33302d] hover:text-[#252422] dark:hover:text-[#FFFCF2] active:scale-[0.98] cursor-pointer'
                        }`}
                        aria-label="Próxima página"
                      >
                        <span className="hidden sm:inline">Próxima</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Tab: Central de Conversas (WhatsApp Web Layout) */}
          {tab === 'conversations' && (
            <div className="h-[calc(100vh-140px)] min-h-[580px] max-h-[900px] bg-white dark:bg-[#111b21] rounded-2xl border border-[#E2DBD0] dark:border-[#403D39] overflow-hidden flex flex-col md:flex-row shadow-sm">
              {/* Coluna Esquerda: Lista de Conversas e Contatos */}
              <div
                className={`w-full md:w-80 lg:w-96 shrink-0 border-r border-[#E2DBD0] dark:border-[#222d34] flex flex-col bg-[#FAF8F5] dark:bg-[#111b21] ${
                  mobileChatOpen ? 'hidden md:flex' : 'flex'
                }`}
              >
                {/* Header da Coluna */}
                <div className="p-3.5 bg-white dark:bg-[#202c33] border-b border-[#E2DBD0] dark:border-[#2a3942] flex items-center justify-between gap-3 shrink-0">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="relative">
                      <div className="w-9 h-9 rounded-full bg-[#00a884]/15 text-[#00a884] flex items-center justify-center font-heading font-bold text-sm border border-[#00a884]/30">
                        {waSenderName.charAt(0).toUpperCase() || 'G'}
                      </div>
                      <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-[#00a884] ring-2 ring-white dark:ring-[#202c33]"></span>
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-sm font-heading font-bold text-[#252422] dark:text-[#FFFCF2] truncate">
                        Conversas Ativas
                      </h3>
                      <p className="text-[11px] text-[#5A554E] dark:text-[#8696a0] font-sans truncate">
                        {conversations.length} {conversations.length === 1 ? 'comércio registrado' : 'comércios registrados'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => loadActiveConversations()}
                      className="p-2 rounded-xl bg-[#FAF8F5] dark:bg-[#111b21] hover:bg-[#F2ECE1] dark:hover:bg-[#2a3942] text-[#5A554E] dark:text-[#8696a0] border border-[#E2DBD0] dark:border-[#2a3942] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                      title="Sincronizar conversas"
                    >
                      <RotateCw className={`w-3.5 h-3.5 ${conversationsLoading ? 'animate-spin' : ''}`} />
                    </button>
                  </div>
                </div>

                {/* Barra de Busca */}
                <div className="p-2.5 bg-[#FAF8F5] dark:bg-[#111b21] border-b border-[#E2DBD0] dark:border-[#222d34] shrink-0">
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-[#5A554E] dark:text-[#8696a0] absolute left-3 top-2.5" />
                    <input
                      type="text"
                      value={conversationsSearch}
                      onChange={(e) => setConversationsSearch(e.target.value)}
                      placeholder="Pesquisar por comércio ou mensagem..."
                      className="w-full pl-8 pr-8 py-1.5 rounded-xl bg-white dark:bg-[#202c33] border border-[#E2DBD0] dark:border-[#2a3942] text-xs text-[#252422] dark:text-[#FFFCF2] placeholder-[#5A554E]/60 dark:placeholder-[#8696a0] focus:outline-none focus:border-[#00a884]"
                    />
                    {conversationsSearch && (
                      <button
                        type="button"
                        onClick={() => setConversationsSearch('')}
                        className="absolute right-2.5 top-2 text-[#5A554E] dark:text-[#8696a0] hover:text-[#252422] dark:hover:text-[#FFFCF2] whitespace-nowrap shrink-0"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  {/* Filtros em Pílulas */}
                  <div className="flex items-center gap-1.5 mt-2 overflow-x-auto scrollbar-none">
                    <button
                      type="button"
                      onClick={() => setConversationsFilter('all')}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                        conversationsFilter === 'all'
                          ? 'bg-[#00a884] text-white shadow-2xs'
                          : 'bg-white dark:bg-[#202c33] text-[#5A554E] dark:text-[#8696a0] border border-[#E2DBD0] dark:border-[#2a3942] hover:bg-[#F2ECE1] dark:hover:bg-[#2a3942]'
                      }`}
                    >
                      Todas ({conversations.length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setConversationsFilter('inbound')}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer flex items-center gap-1 ${
                        conversationsFilter === 'inbound'
                          ? 'bg-[#00a884] text-white shadow-2xs'
                          : 'bg-white dark:bg-[#202c33] text-[#5A554E] dark:text-[#8696a0] border border-[#E2DBD0] dark:border-[#2a3942] hover:bg-[#F2ECE1] dark:hover:bg-[#2a3942]'
                      }`}
                    >
                      <span>Responderam</span>
                      <span className="px-1 py-0.2 rounded-full text-[9px] bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 font-mono">
                        {conversations.filter((c) => c.hasInbound).length}
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setConversationsFilter('waiting')}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                        conversationsFilter === 'waiting'
                          ? 'bg-[#00a884] text-white shadow-2xs'
                          : 'bg-white dark:bg-[#202c33] text-[#5A554E] dark:text-[#8696a0] border border-[#E2DBD0] dark:border-[#2a3942] hover:bg-[#F2ECE1] dark:hover:bg-[#2a3942]'
                      }`}
                    >
                      Aguardando ({conversations.filter((c) => !c.hasInbound).length})
                    </button>
                  </div>
                </div>

                {/* Lista com Rolagem */}
                <div className="flex-1 divide-y divide-[#E2DBD0] dark:divide-[#222d34] overflow-y-auto">
                  {conversationsLoading && conversations.length === 0 ? (
                    <SkeletonConversationItem count={5} />
                  ) : filteredConversations.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center p-6 text-center text-xs text-[#5A554E] dark:text-[#8696a0] space-y-3">
                      <Inbox className="w-10 h-10 opacity-30" />
                      <p className="max-w-[200px]">
                        {conversationsSearch
                          ? 'Nenhum comércio encontrado com esse filtro de busca.'
                          : 'Nenhuma conversa ativa registrada até o momento.'}
                      </p>
                      <button
                        type="button"
                        onClick={() => setTab('leads')}
                        className="px-3 py-1.5 rounded-xl bg-[#EB5E28] hover:bg-[#d44d18] text-white text-[11px] font-semibold whitespace-nowrap shrink-0 cursor-pointer shadow-xs transition-colors"
                      >
                        Ver Fila de Leads
                      </button>
                    </div>
                  ) : (
                    filteredConversations.map((conv) => {
                      const isSelected = selectedLead?.id === conv.id;
                      const hasInbound = conv.hasInbound;
                      const initial = (conv.name || conv.phoneNorm || 'C').charAt(0).toUpperCase();

                      return (
                        <div
                          key={conv.id || conv.phoneNorm}
                          onClick={() => {
                            const targetLead = leads.find((l) => l.id === conv.id) || conv.lead || {
                              id: conv.id,
                              name: conv.name,
                              category: conv.category,
                              city: conv.city,
                              phoneRaw: conv.phoneRaw,
                              phoneNorm: conv.phoneNorm,
                              priority: conv.priority,
                              stage: conv.stage,
                              pitchType: 'no_site',
                              address: '',
                              website: '',
                              websiteType: '',
                              siteStatus: ''
                            };
                            selectLead(targetLead as any);
                            setMobileChatOpen(true);
                          }}
                          className={`p-3 flex items-start gap-3 transition-colors cursor-pointer ${
                            isSelected
                              ? 'bg-emerald-500/10 dark:bg-[#202c33] border-l-4 border-[#00a884]'
                              : 'hover:bg-[#F2ECE1] dark:hover:bg-[#202c33]/50'
                          }`}
                        >
                          {/* Avatar do Comércio */}
                          <div className="relative shrink-0 mt-0.5">
                            <div className="w-10 h-10 rounded-full bg-[#EB5E28]/15 text-[#EB5E28] dark:bg-[#EB5E28]/25 flex items-center justify-center font-heading font-bold text-sm border border-[#EB5E28]/30">
                              {initial}
                            </div>
                            {hasInbound && (
                              <span className="absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full bg-[#00a884] ring-2 ring-white dark:ring-[#111b21]"></span>
                            )}
                          </div>

                          {/* Detalhes da Conversa */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-1.5">
                              <h4 className="text-xs sm:text-sm font-heading font-bold text-[#252422] dark:text-[#FFFCF2] truncate">
                                {conv.name}
                              </h4>
                              {(conv.lastMessage?.sentAt || conv.lastMessage?.createdAt) && (
                                <span className="text-[10px] text-[#5A554E] dark:text-[#8696a0] font-mono shrink-0">
                                  {new Date(conv.lastMessage.sentAt || conv.lastMessage.createdAt).toLocaleTimeString([], {
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}
                                </span>
                              )}
                            </div>

                            <div className="flex items-center gap-1 text-[11px] text-[#5A554E] dark:text-[#8696a0] truncate mt-0.5">
                              <span className="truncate">{conv.category || 'Comércio'}</span>
                              <span>•</span>
                              <span className="shrink-0">{conv.city || 'RMBH'}</span>
                            </div>

                            <div className="flex items-center justify-between gap-2 mt-1">
                              <div className="flex items-center gap-1 min-w-0 text-xs text-[#5A554E] dark:text-[#8696a0] truncate">
                                {(conv.lastMessage?.direction === 'outbound' || conv.lastMessage?.source === 'outbound') && (
                                  <CheckCheck className="w-3.5 h-3.5 text-[#53bdeb] shrink-0" />
                                )}
                                <span className="truncate font-sans text-[11px]">
                                  {conv.lastMessage?.body || 'Conversa iniciada'}
                                </span>
                              </div>

                              {hasInbound ? (
                                <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 whitespace-nowrap shrink-0">
                                  Respondeu
                                </span>
                              ) : (
                                <span className="px-1.5 py-0.2 rounded text-[9px] font-medium bg-[#F2ECE1] dark:bg-[#202c33] text-[#5A554E] dark:text-[#8696a0] whitespace-nowrap shrink-0">
                                  Aguardando
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Coluna Direita: Janela de Chat Ativa */}
              <div
                className={`flex-1 flex flex-col min-w-0 bg-[#efeae2]/35 dark:bg-[#0b141a] ${
                  !mobileChatOpen ? 'hidden md:flex' : 'flex'
                }`}
              >
                {selectedLead ? (
                  <>
                    {/* Header do Chat Ativo */}
                    <div className="p-3 sm:px-4 bg-white dark:bg-[#202c33] border-b border-[#E2DBD0] dark:border-[#2a3942] flex items-center justify-between gap-3 shrink-0">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <button
                          type="button"
                          onClick={() => setMobileChatOpen(false)}
                          className="md:hidden p-1.5 -ml-1 rounded-xl text-[#5A554E] dark:text-[#8696a0] hover:bg-[#F2ECE1] dark:hover:bg-[#2a3942] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                          aria-label="Voltar para a lista"
                        >
                          <ChevronLeft className="w-5 h-5" />
                        </button>

                        <div className="w-9 h-9 rounded-full bg-[#EB5E28]/15 text-[#EB5E28] flex items-center justify-center font-heading font-bold text-sm shrink-0 border border-[#EB5E28]/30">
                          {selectedLead.name.charAt(0).toUpperCase()}
                        </div>

                        <div className="min-w-0">
                          <div className="flex items-center gap-2 truncate">
                            <h3 className="text-sm font-heading font-bold text-[#252422] dark:text-[#FFFCF2] truncate">
                              {selectedLead.name}
                            </h3>
                            <span className="hidden sm:inline px-1.5 py-0.2 rounded text-[10px] font-mono text-emerald-700 dark:text-emerald-400 bg-emerald-500/10">
                              {selectedLead.phoneNorm || selectedLead.phoneRaw}
                            </span>
                          </div>
                          <p className="text-[11px] text-[#5A554E] dark:text-[#8696a0] flex items-center gap-1.5 truncate">
                            <span>{selectedLead.category}</span>
                            <span>•</span>
                            <span>{selectedLead.city}</span>
                            <span>•</span>
                            <span className="text-emerald-600 dark:text-emerald-400 font-medium">Online via OpenWA</span>
                          </p>
                        </div>
                      </div>

                      {/* Botões de Ação do Lead */}
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => setDetailModalLead(selectedLead)}
                          className="hidden sm:flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-white dark:bg-[#111b21] hover:bg-[#F2ECE1] dark:hover:bg-[#2a3942] text-[#252422] dark:text-[#FFFCF2] border border-[#E2DBD0] dark:border-[#2a3942] text-xs font-semibold whitespace-nowrap shrink-0 transition-colors shadow-2xs cursor-pointer"
                          title="Ver Ficha Técnica do Lead"
                        >
                          <Eye className="w-3.5 h-3.5 text-[#5A554E] dark:text-[#8696a0]" />
                          <span>Ficha</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setTab('prototypes')}
                          className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-white dark:bg-[#111b21] hover:bg-[#F2ECE1] dark:hover:bg-[#2a3942] text-[#252422] dark:text-[#FFFCF2] border border-[#E2DBD0] dark:border-[#2a3942] text-xs font-semibold whitespace-nowrap shrink-0 transition-colors shadow-2xs cursor-pointer"
                          title="Ver Pranchetas no Doop"
                        >
                          <LayoutTemplate className="w-3.5 h-3.5 text-[#EB5E28]" />
                          <span>Doop</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setTab('whatsapp')}
                          className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-[#EB5E28] hover:bg-[#d44d18] text-white text-xs font-semibold whitespace-nowrap shrink-0 transition-colors shadow-2xs cursor-pointer"
                          title="Compor Pitch Comercial"
                        >
                          <FileEdit className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">Compor Pitch</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => loadChatMessages(selectedLead.id)}
                          className="p-1.5 rounded-xl bg-white dark:bg-[#111b21] hover:bg-[#F2ECE1] dark:hover:bg-[#2a3942] text-[#5A554E] dark:text-[#8696a0] border border-[#E2DBD0] dark:border-[#2a3942] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                          title="Atualizar mensagens"
                        >
                          <RotateCw className={`w-3.5 h-3.5 ${chatLoading || chatSyncing ? 'animate-spin' : ''}`} />
                        </button>
                      </div>
                    </div>

                    {/* Timeline de Mensagens (WhatsApp Feed) */}
                    <div
                      ref={chatScrollRef}
                      className="flex-1 p-3 sm:p-5 overflow-y-auto space-y-3"
                    >
                      {/* Badge Central de Segurança */}
                      <div className="flex justify-center mb-2">
                        <div className="px-3 py-1 rounded-xl bg-white/80 dark:bg-[#182229]/90 border border-[#E2DBD0]/60 dark:border-[#222d34] text-[10px] text-[#5A554E] dark:text-[#8696a0] flex items-center gap-1.5 shadow-2xs text-center max-w-md">
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                          <span>Mensagens criptografadas e integradas ao Prospec.</span>
                        </div>
                      </div>

                      {chatLoading && chatMessages.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center p-8 space-y-2">
                          <Loader2 className="w-6 h-6 animate-spin text-[#00a884]" />
                          <p className="text-xs text-[#5A554E] dark:text-[#8696a0]">Carregando histórico do WhatsApp...</p>
                        </div>
                      ) : chatMessages.filter(m => (m.body && m.body.trim().length > 0) || (m as any).mediaPath).length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-2">
                          <MessageCircle className="w-10 h-10 text-[#5A554E]/30 dark:text-[#8696a0]/30" />
                          <p className="text-xs font-heading font-bold text-[#252422] dark:text-[#FFFCF2]">
                            Nenhuma mensagem registrada ainda para {selectedLead.name}
                          </p>
                          <p className="text-[11px] text-[#5A554E] dark:text-[#8696a0] max-w-xs">
                            Utilize um dos atalhos rápidos ou digite uma mensagem abaixo para iniciar o diálogo comercial.
                          </p>
                        </div>
                      ) : (
                        chatMessages
                          .filter((msg) => (msg.body && msg.body.trim().length > 0) || (msg as any).mediaPath)
                          .map((msg) => {
                            const isOutbound = msg.direction === 'outbound' || msg.source === 'outbound';
                            return (
                              <div
                                key={msg.id}
                                className={`flex flex-col ${isOutbound ? 'items-end' : 'items-start'}`}
                              >
                                <div
                                  className={`px-3.5 py-2.5 rounded-2xl max-w-[85%] sm:max-w-[75%] shadow-2xs relative select-text text-xs sm:text-sm font-sans ${
                                    isOutbound
                                      ? 'bg-[#d9fdd3] dark:bg-[#005c4b] text-[#111b21] dark:text-[#e9edef] rounded-tr-xs'
                                      : 'bg-white dark:bg-[#202c33] text-[#111b21] dark:text-[#e9edef] rounded-tl-xs border border-[#E2DBD0]/60 dark:border-transparent'
                                  }`}
                                >
                                  <div className="flex items-center justify-between gap-3 mb-1">
                                    <span
                                      className={`text-[10px] font-bold ${
                                        isOutbound ? 'text-emerald-800 dark:text-emerald-300' : 'text-[#00a884]'
                                      }`}
                                    >
                                      {isOutbound ? `Você (${msg.senderName || waSenderName || 'Geovane'})` : selectedLead.name}
                                    </span>
                                    <span className="text-[9px] text-[#667781] dark:text-[#8696a0] font-mono">
                                      {new Date(msg.sentAt || msg.createdAt).toLocaleTimeString([], {
                                        hour: '2-digit',
                                        minute: '2-digit'
                                      })}
                                    </span>
                                  </div>

                                  <p className="leading-relaxed whitespace-pre-wrap break-words">
                                    {msg.body}
                                  </p>

                                {isOutbound && (
                                  <div className="flex items-center justify-end gap-1 text-[10px] text-[#667781] dark:text-[#8696a0] mt-1 font-mono">
                                    {msg.status === 'falha' ? (
                                      <span className="flex items-center gap-1 text-rose-500 text-[10px]">
                                        <AlertTriangle className="w-3 h-3" /> Falha
                                      </span>
                                    ) : msg.status === 'enviado' || msg.status === 'sent' ? (
                                      <CheckCheck className="w-3.5 h-3.5 text-[#53bdeb]" title="Entregue" />
                                    ) : (
                                      <Check className="w-3.5 h-3.5 text-[#8696a0]" title="Processando" />
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>

                    {/* Sugestões Rápidas (Quick Replies) */}
                    <div className="px-3 sm:px-4 py-2 bg-white dark:bg-[#202c33] border-t border-[#E2DBD0] dark:border-[#2a3942] flex items-center gap-1.5 overflow-x-auto scrollbar-none shrink-0">
                      <span className="text-[11px] font-medium text-[#5A554E] dark:text-[#8696a0] whitespace-nowrap shrink-0">
                        Atalhos:
                      </span>
                      {[
                        {
                          label: 'Link da Prévia',
                          text: `Olá! Montei uma prévia visual rápida de como o ${selectedLead.name} ficaria com presença digital moderna e botão direto para o seu WhatsApp: ${typeof window !== 'undefined' ? window.location.origin : ''}/p/${selectedLead.id}. O que achou?`
                        },
                        {
                          label: 'Qual Horário?',
                          text: `Qual o melhor horário amanhã para alinharmos em 5 minutos os ajustes e liberar o seu acesso completo?`
                        },
                        {
                          label: 'Combinado!',
                          text: `Combinado! Qualquer dúvida que surgir estou por aqui à disposição. Um abraço!`
                        },
                        {
                          label: 'Sem Custo',
                          text: `Essa demonstração é 100% sem custo nem compromisso, para você ver na prática o resultado antes de decidir qualquer coisa.`
                        }
                      ].map((item, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setChatInput(item.text)}
                          className="px-2.5 py-1 rounded-lg bg-[#FAF8F5] dark:bg-[#111b21] hover:bg-[#F2ECE1] dark:hover:bg-[#2a3942] text-[#00a884] dark:text-[#00a884] border border-[#E2DBD0] dark:border-[#2a3942] text-[10px] font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>

                    {/* Compositor de Mensagem (WhatsApp Web Input) */}
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        handleSendChatReply();
                      }}
                      className="p-3 sm:px-4 sm:py-3 bg-white dark:bg-[#202c33] border-t border-[#E2DBD0] dark:border-[#2a3942] flex flex-col gap-2 shrink-0"
                    >
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={chatInput}
                          onChange={(e) => setChatInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                              e.preventDefault();
                              handleSendChatReply();
                            }
                          }}
                          placeholder={`Mensagem para ${selectedLead.name}... (Enter para enviar)`}
                          className="flex-1 px-4 py-2.5 rounded-xl bg-[#FAF8F5] dark:bg-[#2a3942] border border-[#E2DBD0] dark:border-[#3b4a54] text-xs sm:text-sm text-[#252422] dark:text-[#FFFCF2] placeholder-[#5A554E]/60 dark:placeholder-[#8696a0] focus:outline-none focus:border-[#00a884] focus:ring-1 focus:ring-[#00a884] transition-colors"
                        />
                        <button
                          type="submit"
                          disabled={chatSending || !chatInput.trim()}
                          className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                            chatInput.trim() && !chatSending
                              ? 'bg-[#00a884] hover:bg-[#02906f] text-white shadow-xs'
                              : 'bg-[#E2DBD0] dark:bg-[#3b4a54] text-[#5A554E] dark:text-[#8696a0] cursor-not-allowed opacity-60'
                          }`}
                        >
                          {chatSending ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Send className="w-4 h-4" />
                          )}
                          <span className="hidden sm:inline">Enviar</span>
                        </button>
                      </div>

                      {/* Rodapé Informativo */}
                      <div className="flex items-center justify-between text-[10px] text-[#5A554E] dark:text-[#8696a0] px-1">
                        <div className="flex items-center gap-2">
                          <span className="flex items-center gap-1 font-semibold text-emerald-600 dark:text-emerald-400">
                            <ShieldCheck className="w-3 h-3" />
                            {mode === 'real' ? 'WhatsApp Real Conectado' : 'Modo Seguro (Auditoria Interna)'}
                          </span>
                          <span>•</span>
                          <span>Remetente: {waSenderName || 'Geovane'}</span>
                        </div>
                        <div className="hidden sm:block">
                          Pressione <kbd className="px-1 py-0.5 rounded bg-white dark:bg-[#2a3942] border border-[#E2DBD0] dark:border-[#3b4a54] font-mono text-[9px]">Enter</kbd> para enviar
                        </div>
                      </div>
                    </form>
                  </>
                ) : (
                  /* Placeholder quando nenhuma conversa está selecionada */
                  <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-[#FAF8F5] dark:bg-[#111b21]">
                    <div className="w-16 h-16 rounded-3xl bg-[#00a884]/15 text-[#00a884] flex items-center justify-center mb-4 border border-[#00a884]/30 shadow-xs">
                      <MessageCircle className="w-8 h-8" />
                    </div>
                    <h3 className="text-lg font-heading font-bold text-[#252422] dark:text-[#FFFCF2] mb-1.5">
                      WhatsApp Studio do Prospec
                    </h3>
                    <p className="text-xs sm:text-sm text-[#5A554E] dark:text-[#8696a0] max-w-md mb-6 leading-relaxed">
                      Selecione um comércio na coluna ao lado para visualizar a timeline em tempo real, acompanhar respostas de clientes e enviar propostas.
                    </p>
                    {filteredConversations.length > 0 ? (
                      <button
                        type="button"
                        onClick={() => {
                          const first = filteredConversations[0];
                          const targetLead = leads.find((l) => l.id === first.id) || first.lead || first;
                          selectLead(targetLead as any);
                          setMobileChatOpen(true);
                        }}
                        className="px-4 py-2.5 rounded-xl bg-[#00a884] hover:bg-[#02906f] text-white text-xs font-semibold flex items-center gap-2 shadow-xs transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                      >
                        <MessageCircle className="w-4 h-4" />
                        <span>Abrir {filteredConversations[0]?.name}</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setTab('leads')}
                        className="px-4 py-2.5 rounded-xl bg-[#EB5E28] hover:bg-[#d44d18] text-white text-xs font-semibold flex items-center gap-2 shadow-xs transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                      >
                        <Inbox className="w-4 h-4" />
                        <span>Ver Lista de Leads</span>
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Tab 3: WhatsApp Studio */}
          {tab === 'whatsapp' && (
            <div className="space-y-4 sm:space-y-6">
              {/* Header info */}
              {selectedLead ? (
                <div className="bg-white dark:bg-[#252422] border border-[#E2DBD0] dark:border-[#403D39] p-3.5 sm:p-5 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3.5 sm:gap-4 shadow-xs">
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-[#EB5E28]/15 text-[#EB5E28] flex items-center justify-center border border-[#EB5E28]/30 shrink-0 font-heading font-bold">
                      {selectedLead.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="text-base sm:text-lg font-heading font-bold text-[#252422] dark:text-[#FFFCF2] tracking-tight truncate">{selectedLead.name}</h2>
                        <span className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-[#EB5E28]/15 text-[#EB5E28] border border-[#EB5E28]/30 whitespace-nowrap">
                          {selectedLead.pitchType.replace(/_/g, ' ')}
                        </span>
                      </div>
                      <p className="text-xs text-[#5A554E] dark:text-[#CCC5B9] mt-0.5 flex flex-wrap items-center gap-1.5 font-sans">
                        <span className="px-1.5 py-0.2 rounded bg-[#F2ECE1] dark:bg-[#33302d] text-[10px] font-semibold text-[#1C1917] dark:text-[#CCC5B9]">
                          {selectedLead.nicheLabel || selectedLead.category}
                        </span>
                        <span className="text-[#CCC5B9] dark:text-[#403D39]">•</span>
                        <span>{selectedLead.city}</span>
                        <span className="text-[#CCC5B9] dark:text-[#403D39]">•</span>
                        <span className="truncate max-w-[200px]">Diagnóstico: {selectedLead.siteAuditReason || 'Sem presença digital'}</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                        selectedLead.name + ' ' + (selectedLead.address || selectedLead.city)
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs text-amber-700 dark:text-amber-300 hover:text-amber-800 dark:hover:text-amber-200 px-3 py-1.5 rounded-xl bg-amber-500/10 dark:bg-amber-950/40 border border-amber-500/30 dark:border-amber-800/50 transition-colors duration-150 active:scale-[0.98] whitespace-nowrap shrink-0"
                    >
                      <Map className="w-3.5 h-3.5 shrink-0" />
                      <span>Google Maps</span>
                      {selectedLead.rating && (
                        <span className="font-bold flex items-center gap-0.5 ml-1">
                          <Star className="w-3 h-3 fill-amber-500 dark:fill-amber-400 text-amber-500 dark:text-amber-400" />
                          {parseFloat(selectedLead.rating).toFixed(1)}
                        </span>
                      )}
                    </a>
                    <button
                      onClick={() => openEditModal(selectedLead)}
                      className="inline-flex items-center gap-1.5 text-xs text-[#252422] dark:text-[#FFFCF2] hover:text-[#EB5E28] dark:hover:text-[#EB5E28] px-3 py-1.5 rounded-xl bg-[#F9F7F1] dark:bg-[#1c1b1a] border border-[#E2DBD0] dark:border-[#403D39] hover:border-[#EB5E28]/40 transition-colors duration-150 active:scale-[0.98] cursor-pointer whitespace-nowrap shrink-0"
                      title="Editar telefone, nome, endereço ou observações deste comércio"
                    >
                      <Pencil className="w-3.5 h-3.5 text-[#EB5E28] shrink-0" />
                      <span className="font-semibold">Editar Dados</span>
                    </button>
                    <button
                      onClick={() => setTab('leads')}
                      className="text-xs text-[#5A554E] dark:text-[#CCC5B9] hover:text-[#252422] dark:hover:text-[#FFFCF2] px-3 py-1.5 rounded-xl bg-[#F9F7F1] dark:bg-[#1c1b1a] border border-[#E2DBD0] dark:border-[#403D39] hover:border-[#CCC5B9] dark:hover:border-[#57524d] transition-colors duration-150 active:scale-[0.98] cursor-pointer whitespace-nowrap shrink-0"
                    >
                      Trocar Comércio
                    </button>
                  </div>
                </div>
              ) : (
                <div className="bg-amber-500/10 dark:bg-[#252422] border border-amber-500/30 dark:border-amber-800/50 p-5 rounded-2xl text-amber-800 dark:text-amber-300 text-xs flex items-center gap-3">
                  <AlertTriangle className="w-5 h-5 shrink-0" />
                  <span>Nenhum comércio selecionado. Vá na aba "Prospecção & Contatos" e selecione um comércio.</span>
                </div>
              )}

              {/* Preparation Form & WhatsApp Bubble Preview */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Left Column: Outbound Composer */}
                <div className="lg:col-span-7 bg-white dark:bg-[#252422] border border-[#E2DBD0] dark:border-[#403D39] p-6 rounded-2xl space-y-4 shadow-xs">
                  <div className="flex items-center justify-between">
                    <h3 className="font-heading font-bold text-sm text-[#252422] dark:text-[#FFFCF2] flex items-center gap-2">
                      <MessageSquare className="w-4 h-4 text-[#EB5E28]" />
                      <span>Preparação de Abordagem Comercial</span>
                    </h3>
                    <span className="text-[11px] text-[#5A554E] dark:text-[#CCC5B9] font-mono">
                      {waMessage.length} caracteres • {waMessage.trim().split(/\s+/).filter(Boolean).length} palavras
                    </span>
                  </div>

                  {/* Sender Name & Recipient row */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-[#5A554E] dark:text-[#CCC5B9] mb-1.5 flex items-center justify-between font-sans">
                        <span>Seu Nome (Apresentação Pessoal)</span>
                        <span className="text-[10px] text-[#5A554E]/70 dark:text-[#CCC5B9]/70">Salvo no navegador</span>
                      </label>
                      <div className="relative">
                        <User className="w-4 h-4 text-[#5A554E]/70 dark:text-[#CCC5B9]/70 absolute left-3.5 top-3" />
                        <input
                          type="text"
                          value={waSenderName}
                          onChange={(e) => {
                            const val = e.target.value;
                            setWaSenderName(val);
                            localStorage.setItem('wa_sender_name', val);
                            if (selectedLead) {
                              const newText = generateHumanizedPitch(selectedLead as any, {
                                senderName: val.trim() || 'Geovane',
                                variantIndex: pitchVariantIndex,
                                isReady: pitchIsReady
                              });
                              setWaMessage(newText);
                            }
                          }}
                          placeholder="Ex: Geovane"
                          className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#F9F7F1] dark:bg-[#1c1b1a] border border-[#E2DBD0] dark:border-[#403D39] text-xs text-[#252422] dark:text-[#FFFCF2] focus:outline-none focus:border-[#EB5E28]"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#5A554E] dark:text-[#CCC5B9] mb-1.5 flex items-center justify-between font-sans">
                        <span>Destinatário (WhatsApp com DDI 55)</span>
                        <div className="flex items-center gap-2">
                          {selectedLead && waPhone.trim() && waPhone.trim() !== (selectedLead.phoneNorm || selectedLead.phoneRaw) && (
                            <button
                              type="button"
                              onClick={handleQuickSavePhone}
                              className="text-[11px] text-emerald-700 dark:text-emerald-400 hover:text-emerald-800 dark:hover:text-emerald-300 font-semibold flex items-center gap-1 transition-colors cursor-pointer bg-emerald-500/10 hover:bg-emerald-500/20 px-2 py-0.5 rounded-md border border-emerald-500/30 active:scale-95 whitespace-nowrap"
                              title="Salvar este novo telefone no banco permanentemente"
                            >
                              <Save className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                              <span>Salvar no Cadastro</span>
                            </button>
                          )}
                          <button
                            onClick={() => copyToClipboard(waPhone, 'Telefone')}
                            className="text-[11px] text-[#5A554E] dark:text-[#CCC5B9] hover:text-[#252422] dark:hover:text-[#FFFCF2] flex items-center gap-1 transition-colors cursor-pointer whitespace-nowrap"
                          >
                            {copiedField === 'Telefone' ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                            <span>Copiar</span>
                          </button>
                        </div>
                      </label>
                      <div className="relative">
                        <Phone className="w-4 h-4 text-[#5A554E]/70 dark:text-[#CCC5B9]/70 absolute left-3.5 top-3" />
                        <input
                          type="text"
                          value={waPhone}
                          onChange={(e) => setWaPhone(e.target.value)}
                          className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#F9F7F1] dark:bg-[#1c1b1a] border border-[#E2DBD0] dark:border-[#403D39] text-xs text-[#252422] dark:text-[#FFFCF2] font-mono focus:outline-none focus:border-[#EB5E28]"
                          placeholder="Ex: 553199999999"
                        />
                      </div>
                      {(() => {
                        const digits = waPhone.replace(/\D/g, '');
                        const isLandline = digits.length === 12 || (digits.startsWith('55') && digits.length === 12 && ['2', '3', '4', '5'].includes(digits.charAt(4)));
                        if (isLandline) {
                          return (
                            <div className="mt-1.5 p-2 rounded-lg bg-amber-500/10 border border-amber-500/25 flex items-start gap-2 text-[11px] text-amber-800 dark:text-amber-300">
                              <AlertTriangle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                              <div className="leading-tight">
                                <span className="font-semibold">Telefone Fixo detectado ({digits.slice(4)}):</span> Linhas fixas só recebem WhatsApp se tiverem o WhatsApp Business explicitamente configurado. Caso o envio retorne erro 400 (destinatário não resolvido), insira o celular do lead no campo acima e clique em <b>Salvar no Cadastro</b>.
                              </div>
                            </div>
                          );
                        }
                        return null;
                      })()}
                    </div>
                  </div>

                  {/* Context Intelligence & Anti-Cliché Rules Display */}
                  {selectedLead && (
                    <div className="p-3.5 rounded-xl bg-[#F2ECE1]/60 dark:bg-[#1c1b1a] border border-[#E2DBD0] dark:border-[#403D39] space-y-2">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-[#252422] dark:text-[#FFFCF2]">
                          <Sliders className="w-3.5 h-3.5 text-[#EB5E28]" />
                          <span>Personalização Contextual Detectada</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-[11px] font-mono text-[#5A554E] dark:text-[#CCC5B9]">
                          <span className="px-2 py-0.5 rounded-md bg-white dark:bg-[#252422] border border-[#E2DBD0] dark:border-[#403D39]">
                            {detectNicheContext(selectedLead).term}
                          </span>
                          <span className="px-2 py-0.5 rounded-md bg-white dark:bg-[#252422] border border-[#E2DBD0] dark:border-[#403D39]">
                            {detectNicheContext(selectedLead).clientTerm}
                          </span>
                          {selectedLead.rating && parseFloat(selectedLead.rating) > 0 && (
                            <span className="px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-800 dark:text-amber-300 border border-amber-500/20 flex items-center gap-1">
                              <Star className="w-2.5 h-2.5 fill-amber-500 text-amber-500" />
                              <span>{parseFloat(selectedLead.rating).toFixed(1)}</span>
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Status da Prévia: Toggle entre Prévia Pronta vs Oferecer Preparo */}
                      <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-[#E2DBD0]/60 dark:border-[#403D39]/60">
                        <span className="text-[11px] text-[#5A554E] dark:text-[#CCC5B9] font-sans">
                          Status do Conteúdo:
                        </span>
                        <div className="inline-flex rounded-lg bg-white dark:bg-[#252422] p-0.5 border border-[#E2DBD0] dark:border-[#403D39] text-[11px]">
                          <button
                            type="button"
                            onClick={() => handleTogglePitchReady(true)}
                            className={`px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                              pitchIsReady
                                ? 'bg-[#EB5E28] text-white shadow-xs'
                                : 'text-[#5A554E] dark:text-[#CCC5B9] hover:text-[#252422] dark:hover:text-[#FFFCF2]'
                            }`}
                          >
                            Prévia Pronta ("Preparei...")
                          </button>
                          <button
                            type="button"
                            onClick={() => handleTogglePitchReady(false)}
                            className={`px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                              !pitchIsReady
                                ? 'bg-[#EB5E28] text-white shadow-xs'
                                : 'text-[#5A554E] dark:text-[#CCC5B9] hover:text-[#252422] dark:hover:text-[#FFFCF2]'
                            }`}
                          >
                            Oferecer Preparo ("Posso preparar...")
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* AI Humanizer Generator Banner */}
                  <div className="p-3 rounded-xl bg-[#EB5E28]/10 border border-[#EB5E28]/30 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-7 h-7 rounded-lg bg-[#EB5E28] text-white flex items-center justify-center shrink-0">
                        <Sparkles className={`w-4 h-4 ${isGeneratingAiPitch ? 'animate-spin' : ''}`} />
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-[#252422] dark:text-[#FFFCF2] flex items-center gap-1.5">
                          <span>Abordagem Dinâmica (Claude Sonnet + Humanizer)</span>
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 font-semibold shrink-0">Sem Clichês</span>
                        </div>
                        <p className="text-[11px] text-[#5A554E] dark:text-[#CCC5B9] font-sans truncate">
                          Gera abordagens personalizadas com dados reais do Google Maps, sem fórmulas pré-definidas.
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleGenerateAiPitch}
                      disabled={isGeneratingAiPitch || !selectedLead}
                      className={`h-8 px-3.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all duration-150 cursor-pointer whitespace-nowrap shrink-0 active:scale-[0.98] ${
                        isGeneratingAiPitch
                          ? 'bg-[#F2ECE1] dark:bg-[#33302d] text-[#5A554E] dark:text-[#CCC5B9] cursor-not-allowed'
                          : 'bg-[#EB5E28] hover:bg-[#d04f1f] text-white shadow-sm shadow-[#EB5E28]/25'
                      }`}
                      title="Gerar abordagens com Claude Sonnet usando a skill Humanizer"
                    >
                      <Sparkles className={`w-3.5 h-3.5 ${isGeneratingAiPitch ? 'animate-spin' : ''}`} />
                      <span>{isGeneratingAiPitch ? 'Gerando com IA...' : 'Gerar com Claude (Humanizer)'}</span>
                    </button>
                  </div>

                  {/* AI Generated Options Selector (if generated) */}
                  {aiPitchOptions.length > 0 && (
                    <div className="p-2.5 rounded-xl bg-[#F9F7F1] dark:bg-[#1c1b1a] border border-[#E2DBD0] dark:border-[#403D39] flex flex-wrap items-center gap-2">
                      <span className="text-[11px] font-semibold text-[#5A554E] dark:text-[#CCC5B9] font-sans mr-1">
                        Opções Geradas pelo Claude:
                      </span>
                      {aiPitchOptions.map((opt, oIdx) => (
                        <button
                          key={oIdx}
                          type="button"
                          onClick={() => {
                            setSelectedAiPitchIdx(oIdx);
                            setWaMessage(opt.text);
                            setWaMessageApproved(false);
                          }}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-colors cursor-pointer whitespace-nowrap shrink-0 flex items-center gap-1 ${
                            selectedAiPitchIdx === oIdx
                              ? 'bg-[#EB5E28] text-white font-bold shadow-2xs'
                              : 'bg-white dark:bg-[#252422] text-[#252422] dark:text-[#FFFCF2] border border-[#E2DBD0] dark:border-[#403D39] hover:border-[#EB5E28]/50'
                          }`}
                        >
                          <span>{opt.title || `Opção ${oIdx + 1}`}</span>
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Message Header & Direct Actions */}
                  <div>
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-1.5">
                        <label className="text-xs font-semibold text-[#5A554E] dark:text-[#CCC5B9] font-sans">
                          Mensagem de Abordagem para Envio:
                        </label>
                        <span className="text-[10px] text-[#737373] dark:text-[#85858b] font-sans hidden sm:inline">
                          (Edite livremente ou gere opções com Claude acima)
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            if (selectedLead) {
                              setActiveCopilotLead(selectedLead);
                              setAiDrawerOpen(true);
                            }
                          }}
                          className="px-2.5 py-1 rounded-lg bg-[#EB5E28]/15 hover:bg-[#EB5E28]/25 text-[#EB5E28] text-[11px] font-semibold flex items-center gap-1.5 cursor-pointer active:scale-95 transition-colors whitespace-nowrap shrink-0"
                          title="Pedir abordagem customizada ao Claude Sonnet"
                        >
                          <Bot className="w-3.5 h-3.5" />
                          <span>Claude Copilot</span>
                        </button>

                        <button
                          onClick={() => copyToClipboard(waMessage, 'Mensagem')}
                          className="text-[11px] text-[#5A554E] dark:text-[#CCC5B9] hover:text-[#252422] dark:hover:text-[#FFFCF2] flex items-center gap-1 transition-colors cursor-pointer whitespace-nowrap shrink-0"
                        >
                          {copiedField === 'Mensagem' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5 text-[#5A554E]" />}
                          <span className="whitespace-nowrap">Copiar Texto</span>
                        </button>
                      </div>
                    </div>

                    <textarea
                      rows={8}
                      value={waMessage}
                      onChange={(e) => {
                        setWaMessage(e.target.value);
                        setWaMessageApproved(false);
                      }}
                      className={`w-full px-4 py-3 rounded-xl bg-[#F9F7F1] dark:bg-[#1c1b1a] border text-xs text-[#252422] dark:text-[#FFFCF2] leading-relaxed focus:outline-none focus:border-[#EB5E28] font-sans transition-colors duration-150 ${
                        isRegenerating
                          ? 'border-[#EB5E28] ring-2 ring-[#EB5E28]/30 bg-amber-500/5'
                          : 'border-[#E2DBD0] dark:border-[#403D39]'
                      }`}
                    />
                  </div>

                  {/* Workflow Buttons */}
                  <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 sm:gap-3 border-t border-[#E2DBD0] dark:border-[#403D39]">
                    <button
                      onClick={handleApproveWhatsApp}
                      className={`px-4 py-2.5 rounded-xl text-xs font-semibold transition-colors duration-150 flex items-center justify-center gap-2 active:scale-[0.98] cursor-pointer whitespace-nowrap shrink-0 ${
                        waMessageApproved
                          ? 'bg-emerald-600 text-white'
                          : 'bg-[#F2ECE1] hover:bg-[#E6DFD3] dark:bg-[#33302d] dark:hover:bg-[#403D39] text-[#252422] dark:text-[#FFFCF2] border border-[#E2DBD0] dark:border-[#403D39]'
                      }`}
                    >
                      <CheckCircle2 className="w-4 h-4 shrink-0" />
                      <span>{waMessageApproved ? 'Mensagem Aprovada' : 'Aprovar Conteúdo'}</span>
                    </button>

                    <button
                      onClick={handleSendWhatsApp}
                      disabled={!waMessageApproved || loading}
                      className={`px-5 sm:px-6 py-2.5 rounded-xl text-xs font-semibold transition-colors duration-150 flex items-center justify-center gap-2 active:scale-[0.98] cursor-pointer whitespace-nowrap shrink-0 ${
                        waMessageApproved && !loading
                          ? (mode === 'real'
                              ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm shadow-emerald-600/25'
                              : 'bg-[#EB5E28] hover:bg-[#d8521d] text-[#FFFCF2] shadow-sm shadow-[#EB5E28]/25')
                          : 'bg-[#F2ECE1] dark:bg-[#33302d] text-[#5A554E]/40 dark:text-[#CCC5B9]/40 cursor-not-allowed border border-[#E2DBD0]/50 dark:border-[#403D39]/50'
                      }`}
                    >
                      <Send className="w-4 h-4 shrink-0" />
                      <span className="whitespace-nowrap">
                        {mode === 'real' ? 'Enviar WhatsApp (Disparo Real)' : 'Simular Envio (Modo Seguro)'}
                      </span>
                    </button>
                  </div>
                </div>

                {/* Right Column: Realistic WhatsApp Mobile Bubble Preview, Live Chat & Status */}
                <div className="lg:col-span-5 space-y-4">
                  {/* View Selector Tabs */}
                  <div className="flex items-center justify-between p-1 bg-[#F2ECE1] dark:bg-[#1c1b1a] rounded-xl border border-[#E2DBD0] dark:border-[#403D39] text-xs">
                    <button
                      type="button"
                      onClick={() => setWaSubView('chat')}
                      className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                        waSubView === 'chat'
                          ? 'bg-white dark:bg-[#252422] text-[#252422] dark:text-[#FFFCF2] shadow-xs'
                          : 'text-[#5A554E] dark:text-[#CCC5B9] hover:text-[#252422] dark:hover:text-[#FFFCF2]'
                      }`}
                    >
                      <MessageCircle className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                      <span>Chat ao Vivo</span>
                      {chatMessages.length > 0 && (
                        <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 font-mono">
                          {chatMessages.length}
                        </span>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => setWaSubView('preview')}
                      className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                        waSubView === 'preview'
                          ? 'bg-white dark:bg-[#252422] text-[#252422] dark:text-[#FFFCF2] shadow-xs'
                          : 'text-[#5A554E] dark:text-[#CCC5B9] hover:text-[#252422] dark:hover:text-[#FFFCF2]'
                      }`}
                    >
                      <Eye className="w-3.5 h-3.5 text-[#EB5E28]" />
                      <span>Prévia Pitch</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setWaSubView('conversations');
                        loadActiveConversations();
                      }}
                      className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                        waSubView === 'conversations'
                          ? 'bg-white dark:bg-[#252422] text-[#252422] dark:text-[#FFFCF2] shadow-xs'
                          : 'text-[#5A554E] dark:text-[#CCC5B9] hover:text-[#252422] dark:hover:text-[#FFFCF2]'
                      }`}
                    >
                      <Inbox className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
                      <span>Conversas</span>
                      {conversations.length > 0 && (
                        <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-sky-500/15 text-sky-700 dark:text-sky-300 font-mono">
                          {conversations.length}
                        </span>
                      )}
                    </button>
                  </div>

                  {/* Subview 1: Live Interactive WhatsApp Chat */}
                  {waSubView === 'chat' && (
                    <div className="bg-white dark:bg-[#252422] border border-[#E2DBD0] dark:border-[#403D39] rounded-2xl overflow-hidden shadow-xs flex flex-col h-[520px]">
                      {/* Chat Header */}
                      <div className="bg-[#202c33] px-4 py-3 border-b border-[#2a3942] flex items-center justify-between shrink-0">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-8 h-8 rounded-full bg-[#00a884] text-white font-heading font-bold text-xs flex items-center justify-center shrink-0">
                            {(selectedLead?.name || 'W').charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <div className="font-heading font-bold text-xs text-[#e9edef] truncate max-w-[170px] sm:max-w-[210px]">
                              {selectedLead ? selectedLead.name : 'Cliente'}
                            </div>
                            <div className="text-[10px] text-[#00a884] flex items-center gap-1 font-sans">
                              <span className="w-2 h-2 rounded-full bg-[#00a884] ring-2 ring-[#00a884]/20"></span>
                              <span className="truncate">{waPhone || selectedLead?.phoneNorm || 'WhatsApp'}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <div className="hidden sm:flex items-center gap-1 text-[10px] text-[#8696a0] font-mono bg-[#111b21] px-2 py-0.5 rounded-md border border-[#2a3942]">
                            <span className={`w-1.5 h-1.5 rounded-full ${chatSyncing ? 'bg-amber-400 animate-ping' : 'bg-emerald-400'}`}></span>
                            <span>{chatSyncing ? 'Sincronizando' : 'Sync 4s'}</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => selectedLead && loadChatMessages(selectedLead.id)}
                            className="p-1.5 rounded-lg bg-[#111b21] hover:bg-[#2a3942] text-[#8696a0] hover:text-[#e9edef] border border-[#2a3942] transition-colors cursor-pointer whitespace-nowrap shrink-0"
                            title="Sincronizar mensagens agora"
                          >
                            <RotateCw className={`w-3.5 h-3.5 ${chatLoading || chatSyncing ? 'animate-spin text-[#00a884]' : ''}`} />
                          </button>
                        </div>
                      </div>

                      {/* Chat Timeline Feed */}
                      <div
                        ref={chatScrollRef}
                        className="flex-1 p-4 bg-[#0b141a] overflow-y-auto space-y-3"
                      >
                        {!selectedLead ? (
                          <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-2">
                            <MessageCircle className="w-8 h-8 text-[#8696a0]/40" />
                            <p className="text-xs text-[#8696a0] font-sans">Nenhum comércio selecionado.</p>
                          </div>
                        ) : chatMessages.length === 0 ? (
                          <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-2">
                            <MessageCircle className="w-8 h-8 text-[#8696a0]/40" />
                            <p className="text-xs text-[#8696a0] font-sans">
                              Nenhuma mensagem registrada ainda para este comércio.
                            </p>
                            <p className="text-[11px] text-[#8696a0]/70 font-sans max-w-[260px]">
                              Aprove e envie a abordagem comercial no painel ao lado ou envie uma resposta direta abaixo.
                            </p>
                          </div>
                        ) : (
                          chatMessages.map((msg) => {
                            const isOutbound = msg.direction === 'outbound';
                            return (
                              <div
                                key={msg.id}
                                className={`flex flex-col ${isOutbound ? 'items-end' : 'items-start'}`}
                              >
                                <div
                                  className={`px-3.5 py-2.5 rounded-2xl max-w-[88%] sm:max-w-[82%] shadow-sm relative group text-xs font-sans ${
                                    isOutbound
                                      ? 'bg-[#005c4b] text-[#e9edef] rounded-tr-xs'
                                      : 'bg-[#202c33] text-[#e9edef] rounded-tl-xs border border-[#2a3942]/60'
                                  }`}
                                >
                                  <div className="flex items-center justify-between gap-2 mb-1">
                                    <span
                                      className={`text-[10px] font-semibold ${
                                        isOutbound ? 'text-emerald-300/80' : 'text-[#00a884]'
                                      }`}
                                    >
                                      {isOutbound ? `Você (${waSenderName || 'Operador'})` : selectedLead.name}
                                    </span>
                                    <span className="text-[9px] text-[#8696a0] font-mono">
                                      {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                  </div>
                                  <p className="leading-relaxed whitespace-pre-wrap break-words select-text">
                                    {msg.body}
                                  </p>
                                  {isOutbound && (
                                    <div className="flex items-center justify-end gap-1 text-[10px] text-[#8696a0] mt-1 font-mono">
                                      {msg.status === 'falha' ? (
                                        <span className="flex items-center gap-1 text-rose-400 text-[10px]">
                                          <AlertTriangle className="w-3 h-3" /> Falha
                                        </span>
                                      ) : msg.status === 'enviado' ? (
                                        <CheckCheck className="w-3.5 h-3.5 text-[#53bdeb]" title="Entregue" />
                                      ) : (
                                        <Check className="w-3.5 h-3.5 text-[#8696a0]" title="Processando" />
                                      )}
                                    </div>
                                  )}
                                </div>
                              </div>
                            );
                          })
                        )}
                      </div>

                      {/* Quick suggestions chips */}
                      {selectedLead && (
                        <div className="px-3 pt-2 pb-1.5 bg-[#111b21] border-t border-[#2a3942] flex items-center gap-1.5 overflow-x-auto scrollbar-none">
                          <span className="text-[11px] font-medium text-[#8696a0] whitespace-nowrap shrink-0">
                            Sugestões:
                          </span>
                          {[
                            {
                              label: 'Link da Prévia',
                              text: `Opa! Preparei uma prévia visual exclusiva para vocês darem uma olhada sem compromisso: ${
                                selectedLead.vercelUrl || selectedLead.doopCanvasUrl || (selectedLead.doopCanvasId ? `${window.location.origin}/api/prototypes/canvas/${selectedLead.doopCanvasId}/preview` : '')
                              } - O que achou?`
                            },
                            {
                              label: 'Qual Horário?',
                              text: 'Qual seria o melhor dia e horário para eu te ligar rapidinho por 5 minutos?'
                            },
                            {
                              label: 'Combinado!',
                              text: 'Perfeito! Muito obrigado pelo retorno, fico no seu aguardo.'
                            },
                            {
                              label: 'Valores e Prazos',
                              text: 'Os nossos projetos para comércios locais são bem enxutos e sem taxas mensais abusivas. Posso te detalhar por aqui?'
                            }
                          ].map((opt, i) => (
                            <button
                              key={i}
                              type="button"
                              onClick={() => setChatInput(opt.text)}
                              className="px-2 py-0.5 rounded-lg bg-[#202c33] hover:bg-[#2a3942] text-[#00a884] hover:text-[#25d366] border border-[#2a3942] transition-colors whitespace-nowrap shrink-0 text-[10px] font-medium cursor-pointer"
                            >
                              {opt.label}
                            </button>
                          ))}
                        </div>
                      )}

                      {/* Chat Composer Input */}
                      <form
                        onSubmit={(e) => {
                          e.preventDefault();
                          handleSendChatReply();
                        }}
                        className="p-3 bg-[#202c33] border-t border-[#2a3942] flex items-center gap-2 shrink-0"
                      >
                        <input
                          type="text"
                          value={chatInput}
                          onChange={(e) => setChatInput(e.target.value)}
                          disabled={!selectedLead}
                          placeholder={selectedLead ? "Responder cliente no WhatsApp... (Enter para enviar)" : "Selecione um comércio primeiro"}
                          className="flex-1 px-3.5 py-2 rounded-xl bg-[#111b21] text-xs text-[#e9edef] placeholder-[#8696a0] border border-[#2a3942] focus:outline-none focus:border-[#00a884] font-sans disabled:opacity-50"
                        />
                        <button
                          type="submit"
                          disabled={chatSending || !chatInput.trim() || !selectedLead}
                          className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                            chatInput.trim() && !chatSending && selectedLead
                              ? 'bg-[#00a884] hover:bg-[#02906f] text-white shadow-sm'
                              : 'bg-[#111b21] text-[#8696a0]/50 border border-[#2a3942]/60 cursor-not-allowed'
                          }`}
                        >
                          {chatSending ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Send className="w-3.5 h-3.5 shrink-0" />
                          )}
                          <span className="whitespace-nowrap">Enviar</span>
                        </button>
                      </form>
                    </div>
                  )}

                  {/* Subview 2: Pitch Bubble Preview */}
                  {waSubView === 'preview' && (
                    <div className="space-y-4">
                      {/* Chat Bubble Simulation */}
                      <div className="bg-white dark:bg-[#252422] border border-[#E2DBD0] dark:border-[#403D39] rounded-2xl overflow-hidden shadow-xs">
                        <div className="bg-[#F9F7F1] dark:bg-[#1c1b1a] px-4 py-3 border-b border-[#E2DBD0] dark:border-[#403D39] flex items-center justify-between">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-[#EB5E28] text-[#FFFCF2] font-heading font-bold text-xs flex items-center justify-center shrink-0">
                              {selectedLead ? selectedLead.name.charAt(0) : 'W'}
                            </div>
                            <div>
                              <div className="font-heading font-bold text-xs text-[#252422] dark:text-[#FFFCF2] truncate max-w-[180px]">
                                {selectedLead ? selectedLead.name : 'Cliente'}
                              </div>
                              <div className="text-[10px] text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-sans">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                                <span>online</span>
                              </div>
                            </div>
                          </div>
                          <span className="text-[10px] uppercase font-bold text-[#5A554E] dark:text-[#CCC5B9] bg-[#F2ECE1] dark:bg-[#33302d] px-2 py-0.5 rounded-full border border-[#E2DBD0] dark:border-[#403D39]">
                            Prévia do Pitch
                          </span>
                        </div>

                        {/* Chat canvas */}
                        <div className="p-4 bg-[#121b22] min-h-[180px] flex flex-col justify-end space-y-2">
                          <div className="bg-[#005c4b] text-[#FFFCF2] p-3.5 rounded-2xl rounded-tr-xs text-xs leading-relaxed max-w-[95%] ml-auto relative">
                            <div className="whitespace-pre-wrap font-sans">{waMessage || 'Digite ou aprove a mensagem para ver a prévia.'}</div>
                            <div className="flex items-center justify-end gap-1 text-[10px] text-[#CCC5B9] mt-1 font-mono">
                              <span>{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                              <CheckCheck className="w-3.5 h-3.5 text-[#53bdeb]" />
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* History */}
                      <div className="bg-white dark:bg-[#252422] border border-[#E2DBD0] dark:border-[#403D39] p-5 rounded-2xl shadow-xs">
                        <h4 className="font-heading font-bold text-xs text-[#252422] dark:text-[#FFFCF2] mb-3 flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-[#5A554E] dark:text-[#CCC5B9]" />
                          <span>Histórico de Mensagens deste Comércio</span>
                        </h4>
                        {waHistory.length === 0 ? (
                          <div className="text-xs text-[#5A554E]/70 dark:text-[#CCC5B9]/70 flex items-center gap-2 font-sans">
                            <Info className="w-3.5 h-3.5" />
                            <span>Nenhum envio registrado ainda para este lead.</span>
                          </div>
                        ) : (
                          <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                            {waHistory.map((m: any) => (
                              <div key={m.id} className="p-2.5 rounded-xl bg-[#F9F7F1] dark:bg-[#1c1b1a] border border-[#E2DBD0] dark:border-[#403D39] text-[11px]">
                                <div className="flex justify-between font-mono text-[10px] text-[#5A554E] dark:text-[#CCC5B9] mb-1">
                                  <span className="font-bold text-emerald-600 dark:text-emerald-400 uppercase">{m.status}</span>
                                  <span>{new Date(m.createdAt).toLocaleTimeString()}</span>
                                </div>
                                <div className="text-[#252422] dark:text-[#FFFCF2] line-clamp-2 font-sans">{m.body}</div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Subview 3: Active Conversations List */}
                  {waSubView === 'conversations' && (
                    <div className="bg-white dark:bg-[#252422] border border-[#E2DBD0] dark:border-[#403D39] rounded-2xl overflow-hidden shadow-xs flex flex-col h-[520px]">
                      {/* Search & Refresh */}
                      <div className="p-3 bg-[#F9F7F1] dark:bg-[#1c1b1a] border-b border-[#E2DBD0] dark:border-[#403D39] flex items-center justify-between gap-2 shrink-0">
                        <div className="relative flex-1">
                          <Search className="w-3.5 h-3.5 text-[#5A554E] dark:text-[#CCC5B9] absolute left-3 top-2.5" />
                          <input
                            type="text"
                            value={conversationsSearch}
                            onChange={(e) => setConversationsSearch(e.target.value)}
                            placeholder="Buscar clientes em conversa..."
                            className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-white dark:bg-[#252422] border border-[#E2DBD0] dark:border-[#403D39] text-xs text-[#252422] dark:text-[#FFFCF2] focus:outline-none focus:border-[#EB5E28]"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => loadActiveConversations()}
                          className="p-2 rounded-xl bg-white dark:bg-[#252422] hover:bg-[#F2ECE1] dark:hover:bg-[#33302d] text-[#5A554E] dark:text-[#CCC5B9] border border-[#E2DBD0] dark:border-[#403D39] transition-colors cursor-pointer whitespace-nowrap shrink-0"
                          title="Atualizar lista de conversas"
                        >
                          <RotateCw className={`w-3.5 h-3.5 ${conversationsLoading ? 'animate-spin' : ''}`} />
                        </button>
                      </div>

                      {/* Conversations List */}
                      <div className="flex-1 divide-y divide-[#E2DBD0] dark:divide-[#403D39] overflow-y-auto">
                        {conversations.filter((c) => {
                          if (!conversationsSearch.trim()) return true;
                          const q = conversationsSearch.toLowerCase();
                          return (
                            c.name?.toLowerCase().includes(q) ||
                            c.city?.toLowerCase().includes(q) ||
                            c.category?.toLowerCase().includes(q) ||
                            (c.phoneNorm && c.phoneNorm.includes(q)) ||
                            (c.phoneRaw && c.phoneRaw.includes(q)) ||
                            (c.lastMessage?.body && c.lastMessage.body.toLowerCase().includes(q))
                          );
                        }).length === 0 ? (
                          <div className="h-full flex flex-col items-center justify-center p-6 text-center text-xs text-[#5A554E] dark:text-[#CCC5B9] space-y-2">
                            <Inbox className="w-8 h-8 opacity-40" />
                            <p>{conversationsSearch ? 'Nenhuma conversa encontrada com esse filtro.' : 'Nenhuma conversa ativa registrada ainda.'}</p>
                          </div>
                        ) : (
                          conversations
                            .filter((c) => {
                              if (!conversationsSearch.trim()) return true;
                              const q = conversationsSearch.toLowerCase();
                              return (
                                c.name?.toLowerCase().includes(q) ||
                                c.city?.toLowerCase().includes(q) ||
                                c.category?.toLowerCase().includes(q) ||
                                (c.phoneNorm && c.phoneNorm.includes(q)) ||
                                (c.phoneRaw && c.phoneRaw.includes(q)) ||
                                (c.lastMessage?.body && c.lastMessage.body.toLowerCase().includes(q))
                              );
                            })
                            .map((conv) => {
                              const isSelected = selectedLead?.id === conv.id;
                              return (
                                <div
                                  key={conv.id}
                                  onClick={() => {
                                    const targetLead = leads.find((l) => l.id === conv.id) || {
                                      id: conv.id,
                                      name: conv.name,
                                      category: conv.category,
                                      city: conv.city,
                                      phoneRaw: conv.phoneRaw,
                                      phoneNorm: conv.phoneNorm,
                                      priority: conv.priority,
                                      stage: conv.stage,
                                      pitchType: 'no_site',
                                      address: '',
                                      website: '',
                                      websiteType: '',
                                      siteStatus: ''
                                    };
                                    selectLead(targetLead as any);
                                    setWaSubView('chat');
                                  }}
                                  className={`p-3.5 flex items-start gap-3 transition-colors cursor-pointer ${
                                    isSelected
                                      ? 'bg-[#EB5E28]/10 dark:bg-[#EB5E28]/20'
                                      : 'hover:bg-[#F9F7F1] dark:hover:bg-[#1c1b1a]'
                                  }`}
                                >
                                  <div className="w-9 h-9 rounded-full bg-[#EB5E28]/15 text-[#EB5E28] font-heading font-bold text-xs flex items-center justify-center shrink-0 border border-[#EB5E28]/30">
                                    {(conv.name || conv.phoneNorm || 'C').charAt(0).toUpperCase()}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between gap-1 mb-0.5">
                                      <span className="font-heading font-bold text-xs text-[#252422] dark:text-[#FFFCF2] truncate">
                                        {conv.name || conv.phoneNorm || 'Comércio Local'}
                                      </span>
                                      {conv.lastMessage && (
                                        <span className="text-[10px] text-[#5A554E] dark:text-[#CCC5B9] font-mono shrink-0">
                                          {new Date(conv.lastMessage.sentAt || conv.lastMessage.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                      )}
                                    </div>
                                    <div className="flex items-center gap-1.5 text-[10px] text-[#5A554E] dark:text-[#CCC5B9] mb-1">
                                      <span>{conv.category || 'Local'}</span>
                                      <span>•</span>
                                      <span>{conv.city || 'RMBH'}</span>
                                    </div>
                                    {conv.lastMessage && (
                                      <div className="text-[11px] text-[#5A554E] dark:text-[#CCC5B9] line-clamp-1 font-sans flex items-center gap-1">
                                        {conv.lastMessage.direction === 'inbound' ? (
                                          <span className="text-emerald-600 dark:text-emerald-400 font-semibold shrink-0">Cliente:</span>
                                        ) : (
                                          <span className="text-[#EB5E28] font-semibold shrink-0">Você:</span>
                                        )}
                                        <span className="truncate">{conv.lastMessage.body}</span>
                                      </div>
                                    )}
                                  </div>
                                  <div className="flex flex-col items-end gap-1 shrink-0">
                                    {conv.hasInbound ? (
                                      <span className="px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 whitespace-nowrap shrink-0">
                                        Respondeu
                                      </span>
                                    ) : (
                                      <span className="px-1.5 py-0.5 rounded-full text-[9px] font-medium bg-[#F2ECE1] dark:bg-[#33302d] text-[#5A554E] dark:text-[#CCC5B9] whitespace-nowrap shrink-0">
                                        Aguardando
                                      </span>
                                    )}
                                    <span className="text-[9px] font-mono uppercase px-1.5 py-0.2 rounded bg-[#F2ECE1] dark:bg-[#33302d] text-[#5A554E] dark:text-[#CCC5B9] whitespace-nowrap shrink-0">
                                      {conv.stage}
                                    </span>
                                  </div>
                                </div>
                              );
                            })
                        )}
                      </div>
                    </div>
                  )}

                  {/* Gateway Status */}
                  <div className="bg-white dark:bg-[#252422] border border-[#E2DBD0] dark:border-[#403D39] p-5 rounded-2xl space-y-3 shadow-xs">
                    <div className="flex items-center justify-between">
                      <h4 className="font-heading font-bold text-xs text-[#252422] dark:text-[#FFFCF2] flex items-center gap-2">
                        <ShieldCheck className="w-3.5 h-3.5 text-[#EB5E28]" />
                        <span>Integração OpenWA Gateway</span>
                      </h4>
                      <span className="text-[10px] font-mono text-emerald-700 dark:text-emerald-400 uppercase bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/25">
                        Porta 2785
                      </span>
                    </div>

                    <div className="p-3.5 rounded-xl bg-[#F9F7F1] dark:bg-[#1c1b1a] border border-[#E2DBD0] dark:border-[#403D39] space-y-2.5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                            waSession?.status === 'ready' || waSession?.status === 'connected'
                              ? 'bg-emerald-500 ring-2 ring-emerald-500/25'
                              : 'bg-amber-500'
                          }`} />
                          <span className="text-xs font-semibold text-[#252422] dark:text-[#FFFCF2]">
                            {waSession?.status === 'ready' || waSession?.status === 'connected'
                              ? `WhatsApp Conectado: ${waSession.pushName || 'Operador'} (+${waSession.phone || 'Ativo'})`
                              : (waSession ? `Sessão: ${waSession.name} (${waSession.status})` : 'Conectando ao Gateway...')}
                          </span>
                        </div>
                      </div>

                      {/* Quick Mode Toggle */}
                      <div className="pt-2 border-t border-[#E2DBD0]/60 dark:border-[#403D39]/60 flex flex-wrap items-center justify-between gap-2">
                        <span className="text-[11px] text-[#5A554E] dark:text-[#CCC5B9] font-medium">Modo Atual:</span>
                        <div className="inline-flex rounded-lg bg-white dark:bg-[#252422] p-0.5 border border-[#E2DBD0] dark:border-[#403D39] text-[11px]">
                          <button
                            type="button"
                            onClick={() => handleUpdateMode('integrado_sem_envio')}
                            className={`px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                              mode === 'integrado_sem_envio'
                                ? 'bg-emerald-600 text-white shadow-xs'
                                : 'text-[#5A554E] dark:text-[#CCC5B9] hover:text-[#252422] dark:hover:text-[#FFFCF2]'
                            }`}
                          >
                            Modo Seguro (Simulado)
                          </button>
                          <button
                            type="button"
                            onClick={() => handleUpdateMode('real')}
                            className={`px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                              mode === 'real'
                                ? 'bg-amber-600 text-white shadow-xs'
                                : 'text-[#5A554E] dark:text-[#CCC5B9] hover:text-[#252422] dark:hover:text-[#FFFCF2]'
                            }`}
                          >
                            Piloto Real (Disparo Físico)
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="p-2.5 rounded-xl bg-[#F9F7F1]/60 dark:bg-[#1c1b1a]/60 border border-[#E2DBD0]/60 dark:border-[#403D39]/60 text-[11px] text-[#5A554E] dark:text-[#CCC5B9] leading-normal flex items-start gap-2 font-sans">
                      <Shield className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                      <span>
                        {mode === 'real'
                          ? 'Atenção: Modo Piloto Real ativo. O botão enviará a mensagem pelo WhatsApp conectado sob sua aprovação.'
                          : 'Modo Seguro ativo: as mensagens são salvas e registradas no banco para auditoria sem envio externo.'}
                      </span>
                    </div>
                  </div>

                  {/* History */}
                  <div className="bg-white dark:bg-[#252422] border border-[#E2DBD0] dark:border-[#403D39] p-5 rounded-2xl shadow-xs">
                    <h4 className="font-heading font-bold text-xs text-[#252422] dark:text-[#FFFCF2] mb-3 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-[#5A554E] dark:text-[#CCC5B9]" />
                      <span>Histórico de Mensagens deste Comércio</span>
                    </h4>
                    {waHistory.length === 0 ? (
                      <div className="text-xs text-[#5A554E]/70 dark:text-[#CCC5B9]/70 flex items-center gap-2 font-sans">
                        <Info className="w-3.5 h-3.5" />
                        <span>Nenhum envio registrado ainda para este lead.</span>
                      </div>
                    ) : (
                      <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                        {waHistory.map((m: any) => (
                          <div key={m.id} className="p-2.5 rounded-xl bg-[#F9F7F1] dark:bg-[#1c1b1a] border border-[#E2DBD0] dark:border-[#403D39] text-[11px]">
                            <div className="flex justify-between font-mono text-[10px] text-[#5A554E] dark:text-[#CCC5B9] mb-1">
                              <span className="font-bold text-emerald-600 dark:text-emerald-400 uppercase">{m.status}</span>
                              <span>{new Date(m.createdAt).toLocaleTimeString()}</span>
                            </div>
                            <div className="text-[#252422] dark:text-[#FFFCF2] line-clamp-2 font-sans">{m.body}</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab 4: Protótipos Doop Studio */}
          {tab === 'prototypes' && (() => {
            const activeCanvasProto = prototypesList.find((p) => p.provider === 'doop' || p.artifactType === 'doop_canvas' || p.id?.startsWith('canvas_'));
            const activeCanvasId = activeCanvasProto?.id?.startsWith('canvas_')
              ? activeCanvasProto.id.replace('canvas_', '')
              : (selectedLead?.doopCanvasId || (activeCanvasProto?.url?.includes('/c/') ? activeCanvasProto.url.split('/c/')[1] : null));
            const activeCanvasUrl = activeCanvasId
              ? `http://localhost:4300/c/${activeCanvasId}`
              : (selectedLead?.doopCanvasUrl || activeCanvasProto?.url);

            return (
              <div className="space-y-6">
                {/* Header info */}
                {selectedLead && (
                  <div className="bg-white dark:bg-[#252422] border border-[#E2DBD0] dark:border-[#403D39] p-5 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
                    <div className="flex items-start gap-3.5">
                      <div className="w-10 h-10 rounded-xl bg-[#EB5E28]/15 text-[#EB5E28] flex items-center justify-center border border-[#EB5E28]/30 shrink-0 font-heading font-bold">
                        <LayoutTemplate className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h2 className="text-lg font-heading font-bold text-[#252422] dark:text-[#FFFCF2] tracking-tight">{selectedLead.name}</h2>
                          <span className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-[#EB5E28]/15 text-[#EB5E28] border border-[#EB5E28]/30">
                            {briefTheme.toUpperCase()}
                          </span>
                        </div>
                        <p className="text-xs text-[#5A554E] dark:text-[#CCC5B9] mt-0.5 flex items-center gap-2 font-sans">
                          <span>{selectedLead.category}</span>
                          <span className="text-[#CCC5B9] dark:text-[#403D39]">•</span>
                          <span>{selectedLead.city}</span>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <a
                        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                          selectedLead.name + ' ' + (selectedLead.address || selectedLead.city)
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs text-amber-700 dark:text-amber-300 hover:text-amber-800 dark:hover:text-amber-200 px-3 py-1.5 rounded-xl bg-amber-500/10 dark:bg-amber-950/40 border border-amber-500/30 dark:border-amber-800/50 transition-colors duration-150 active:scale-[0.98]"
                      >
                        <Map className="w-3.5 h-3.5" />
                        <span>Ficha Google Maps</span>
                        {selectedLead.rating && (
                          <span className="font-bold flex items-center gap-0.5 ml-1">
                            <Star className="w-3 h-3 fill-amber-500 dark:fill-amber-400 text-amber-500 dark:text-amber-400" />
                            {parseFloat(selectedLead.rating).toFixed(1)}
                          </span>
                        )}
                      </a>
                      <button
                        onClick={() => setTab('leads')}
                        className="text-xs text-[#5A554E] dark:text-[#CCC5B9] hover:text-[#252422] dark:hover:text-[#FFFCF2] px-3 py-1.5 rounded-xl bg-[#F9F7F1] dark:bg-[#1c1b1a] border border-[#E2DBD0] dark:border-[#403D39] hover:border-[#CCC5B9] dark:hover:border-[#57524d] transition-colors duration-150 active:scale-[0.98] cursor-pointer"
                      >
                        Trocar Comércio
                      </button>
                    </div>
                  </div>
                )}

                {/* Sub-tab Navigation: 8 Modelos de Conversão Brasileira vs Canvas Customizado */}
                <div className="flex flex-wrap items-center justify-between bg-white dark:bg-[#252422] p-2.5 rounded-2xl border border-[#E2DBD0] dark:border-[#403D39] shadow-xs gap-3">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setPrototypeSubTab('niche_models')}
                      className={`px-4 py-2 rounded-xl text-xs font-heading font-bold transition-all duration-150 flex items-center gap-2 cursor-pointer ${
                        prototypeSubTab === 'niche_models'
                          ? 'bg-[#EB5E28] text-white shadow-xs'
                          : 'text-[#5A554E] dark:text-[#CCC5B9] hover:text-[#252422] dark:hover:text-[#FFFCF2] hover:bg-[#F9F7F1] dark:hover:bg-[#1c1b1a]'
                      }`}
                    >
                      <Sparkles className="w-4 h-4" />
                      <span>8 Modelos Predefinidos (Conversão BR)</span>
                    </button>

                    <button
                      onClick={() => setPrototypeSubTab('custom_canvas')}
                      className={`px-4 py-2 rounded-xl text-xs font-heading font-bold transition-all duration-150 flex items-center gap-2 cursor-pointer ${
                        prototypeSubTab === 'custom_canvas'
                          ? 'bg-[#EB5E28] text-white shadow-xs'
                          : 'text-[#5A554E] dark:text-[#CCC5B9] hover:text-[#252422] dark:hover:text-[#FFFCF2] hover:bg-[#F9F7F1] dark:hover:bg-[#1c1b1a]'
                      }`}
                    >
                      <LayoutTemplate className="w-4 h-4" />
                      <span>Canvas Doop Studio {activeCanvasId ? `(${activeCanvasId})` : ''}</span>
                    </button>
                  </div>

                  <div className="hidden md:flex items-center gap-2 text-[11px] text-[#5A554E] dark:text-[#CCC5B9] pr-3 font-sans">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span className="font-semibold text-emerald-600 dark:text-emerald-400">Mobile-First</span>
                    <span>•</span>
                    <span>Zero Quebra em Botões</span>
                    <span>•</span>
                    <span>Sticky WhatsApp 1-Toque</span>
                  </div>
                </div>

                {/* Subtab 1: 8 Predefined Niche Kits */}
                {prototypeSubTab === 'niche_models' && (() => {
                  const detectedCommerceNiche = selectedLead ? detectNicheFromCategory(selectedLead.category, selectedLead.name) : selectedNicheKey;
                  const activeNiche = forceShowAllNiches ? selectedNicheKey : (selectedLead ? detectedCommerceNiche : selectedNicheKey);

                  const allKits = (nicheKits.length > 0 ? nicheKits : [
                    { id: 'beauty', name: 'Beleza & Estética', tokens: { accent: '#8A3D4D' } },
                    { id: 'auto', name: 'Automotivo', tokens: { accent: '#EAB308' } },
                    { id: 'health', name: 'Saúde & Odonto', tokens: { accent: '#5B2329' } },
                    { id: 'gastro', name: 'Alimentação', tokens: { accent: '#C2410C' } },
                    { id: 'pet', name: 'Pet & Vet', tokens: { accent: '#0D9488' } },
                    { id: 'fitness', name: 'Fitness', tokens: { accent: '#EA580C' } },
                    { id: 'services', name: 'Serviços & Reformas', tokens: { accent: '#1D4ED8' } },
                    { id: 'retail', name: 'Varejo & Bairro', tokens: { accent: '#059669' } },
                  ]);

                  const currentKit = allKits.find((k: any) => k.id === activeNiche) || allKits[0] || {
                    id: 'health',
                    name: 'Saúde & Odonto',
                    categoryLabel: 'Clínicas Odontológicas, Médicas & Fisioterapia',
                    tokens: { ground: '#FAF8F5', accent: '#5B2329', card_bg: '#FFFFFF', font_display: 'Plus Jakarta Sans', font_body: 'Inter' },
                    hero: { headline: 'A Clínica Odontológica Ideal Pra Você e Sua Família' },
                    sampleLead: { name: 'Sorria! Clínica Odontológica', city: 'Belo Horizonte' },
                    services: [],
                    differentials: [],
                    stats: []
                  };

                  const previewUrl =
                    previewEngine === 'react'
                      ? `/preview?niche=${activeNiche}&viewport=${previewViewport}${selectedLead ? `&leadId=${selectedLead.id}` : ''}&t=${nicheIframeKey}`
                      : `/api/niche-kits/${activeNiche}/preview?viewport=${previewViewport}${selectedLead ? `&leadId=${selectedLead.id}` : ''}&t=${nicheIframeKey}`;

                  const NICHE_ICONS: Record<string, React.ReactNode> = {
                    beauty: <Scissors className="w-4 h-4" />,
                    auto: <Car className="w-4 h-4" />,
                    health: <HeartPulse className="w-4 h-4" />,
                    gastro: <UtensilsCrossed className="w-4 h-4" />,
                    pet: <PawPrint className="w-4 h-4" />,
                    fitness: <Dumbbell className="w-4 h-4" />,
                    services: <Hammer className="w-4 h-4" />,
                    retail: <ShoppingBag className="w-4 h-4" />
                  };

                  return (
                    <div className="space-y-6">
                      {/* Nicho do Comércio Banner / Selector */}
                      <div className="bg-white dark:bg-[#252422] border border-[#E2DBD0] dark:border-[#403D39] p-4 rounded-2xl shadow-xs">
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <h3 className="font-heading font-bold text-xs uppercase tracking-wider text-[#5A554E] dark:text-[#CCC5B9] flex items-center gap-1.5">
                              <Sparkles className="w-3.5 h-3.5 text-[#EB5E28]" />
                              <span>
                                {selectedLead && !forceShowAllNiches
                                  ? `Modelo Exclusivo para o Nicho do Comércio (${currentKit.name})`
                                  : 'Modelos de Alta Conversão Brasileira (React + Vite + TypeScript)'}
                              </span>
                            </h3>
                          </div>
                          {selectedLead && (
                            <div>
                              {forceShowAllNiches ? (
                                <button
                                  onClick={() => setForceShowAllNiches(false)}
                                  className="text-[11px] font-bold text-[#EB5E28] hover:underline cursor-pointer flex items-center gap-1"
                                >
                                  <span>🎯 Voltar ao nicho de {selectedLead.name}</span>
                                </button>
                              ) : (
                                <button
                                  onClick={() => setForceShowAllNiches(true)}
                                  className="text-[11px] font-medium text-[#5A554E] dark:text-[#CCC5B9] hover:text-[#EB5E28] underline cursor-pointer"
                                >
                                  Ver todos os 8 nichos
                                </button>
                              )}
                            </div>
                          )}
                        </div>

                        {/* SE LEAD SELECIONADO & MODO FOCO: MOSTRA APENAS O MODELO DO NICHO DO COMÉRCIO */}
                        {selectedLead && !forceShowAllNiches ? (
                          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 rounded-xl bg-gradient-to-r from-emerald-500/10 via-[#EB5E28]/5 to-transparent border border-emerald-500/25 gap-3">
                            <div className="flex items-center gap-3">
                              <div className="w-11 h-11 rounded-xl bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-md shadow-emerald-500/25">
                                {NICHE_ICONS[currentKit.id] || <Sparkles className="w-5 h-5" />}
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-500 text-white px-2 py-0.5 rounded-md">
                                    Nicho Detectado
                                  </span>
                                  <span className="text-sm font-heading font-black text-[#252422] dark:text-[#FFFCF2]">
                                    {currentKit.name}
                                  </span>
                                </div>
                                <div className="text-xs text-[#5A554E] dark:text-[#CCC5B9] mt-0.5 font-sans">
                                  Exibindo modelo sob medida para <strong>{selectedLead.name}</strong> ({selectedLead.category || 'Comércio Local'}) em <strong>{selectedLead.city || 'sua cidade'}</strong>.
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              <span className="text-[11px] font-mono font-bold px-2.5 py-1 rounded-lg bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30">
                                100% React + GSAP
                              </span>
                            </div>
                          </div>
                        ) : (
                          /* MODO COMPLETO (OU SEM LEAD): EXIBE SELETOR DE NICHOS */
                          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
                            {allKits.map((kit: any) => {
                              const isSelected = activeNiche === kit.id;
                              return (
                                <button
                                  key={kit.id}
                                  onClick={() => {
                                    setSelectedNicheKey(kit.id);
                                    setNicheIframeKey(Date.now());
                                  }}
                                  className={`p-3 rounded-xl border text-left transition-all duration-150 cursor-pointer flex flex-col justify-between gap-2 active:scale-[0.98] ${
                                    isSelected
                                      ? 'border-[#EB5E28] ring-2 ring-[#EB5E28]/25 bg-[#EB5E28]/10 dark:bg-[#EB5E28]/15 shadow-xs'
                                      : 'border-[#E2DBD0] dark:border-[#403D39] bg-[#F9F7F1] dark:bg-[#1c1b1a] hover:border-[#CCC5B9] dark:hover:border-[#57524d]'
                                  }`}
                                >
                                  <div className="flex items-center justify-between w-full">
                                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                                      isSelected ? 'bg-[#EB5E28] text-white' : 'bg-white dark:bg-[#252422] text-[#5A554E] dark:text-[#CCC5B9]'
                                    }`}>
                                      {NICHE_ICONS[kit.id] || <Tag className="w-3.5 h-3.5" />}
                                    </div>
                                    <span
                                      className="w-3.5 h-3.5 rounded-full border border-black/10 shrink-0 shadow-xs"
                                      style={{ backgroundColor: kit.tokens?.accent || '#EB5E28' }}
                                      title={`Cor de destaque: ${kit.tokens?.accent}`}
                                    />
                                  </div>
                                  <div>
                                    <span className={`block font-heading font-bold text-xs truncate ${
                                      isSelected ? 'text-[#EB5E28] dark:text-[#FFFCF2]' : 'text-[#252422] dark:text-[#FFFCF2]'
                                    }`}>
                                      {kit.name}
                                    </span>
                                    <span className="text-[10px] text-[#5A554E] dark:text-[#CCC5B9] truncate block">
                                      {kit.categoryLabel?.split(',')[0] || kit.id}
                                    </span>
                                  </div>
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </div>

                      {/* Main Grid: Details on Left (5 cols) & Visualizer on Right (7 cols) */}
                      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                        {/* Left Column: Niche Kit Intelligence & Quick Actions */}
                        <div className="lg:col-span-5 bg-white dark:bg-[#252422] border border-[#E2DBD0] dark:border-[#403D39] p-6 rounded-2xl space-y-4 shadow-xs flex flex-col justify-between">
                          <div className="space-y-4">
                            {/* Header of selected kit */}
                            <div className="pb-3 border-b border-[#E2DBD0] dark:border-[#403D39]">
                              <div className="flex flex-wrap items-center justify-between gap-1 mb-1.5">
                                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-[#EB5E28]/15 text-[#EB5E28] border border-[#EB5E28]/30 max-w-[70%] truncate">
                                  {currentKit.categoryLabel || currentKit.name}
                                </span>
                                <span className="text-[10px] font-mono text-[#5A554E] dark:text-[#CCC5B9] shrink-0">
                                  Conversão BR
                                </span>
                              </div>
                              <h2 className="text-base font-heading font-bold text-[#252422] dark:text-[#FFFCF2] tracking-tight">
                                {currentKit.name}
                              </h2>
                              <p className="text-xs text-[#5A554E] dark:text-[#CCC5B9] mt-1 font-sans">
                                {selectedLead
                                  ? `Adaptado em tempo real para ${selectedLead.name} (${selectedLead.city || 'sua cidade'}).`
                                  : `Exemplo nativo: ${currentKit.sampleLead?.name} (${currentKit.sampleLead?.city}).`}
                              </p>
                            </div>

                            {/* Tech Stack & Animations Badge */}
                            <div className="p-3 rounded-xl bg-gradient-to-r from-blue-500/10 via-purple-500/5 to-transparent border border-blue-500/20 space-y-1.5">
                              <div className="flex items-center justify-between">
                                <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#5A554E] dark:text-[#CCC5B9]">
                                  Arquitetura de Código
                                </span>
                                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-500/15 text-blue-600 dark:text-blue-400 font-bold border border-blue-500/25">
                                  React 18 + Vite + TypeScript
                                </span>
                              </div>
                              <div className="flex flex-wrap gap-1.5 text-[10px] font-semibold text-[#5A554E] dark:text-[#CCC5B9]">
                                <span className="px-2 py-0.5 rounded bg-white dark:bg-[#252422] border border-[#E2DBD0] dark:border-[#403D39]">
                                  ⚡ GSAP 3.12 + ScrollTrigger
                                </span>
                                <span className="px-2 py-0.5 rounded bg-white dark:bg-[#252422] border border-[#E2DBD0] dark:border-[#403D39]">
                                  📱 Mobile-First 390px
                                </span>
                                <span className="px-2 py-0.5 rounded bg-white dark:bg-[#252422] border border-[#E2DBD0] dark:border-[#403D39]">
                                  🔒 Zero Quebra de CTAs
                                </span>
                              </div>
                            </div>

                            {/* Design Tokens & Typography Swatches */}
                            <div className="p-3.5 rounded-xl bg-[#F9F7F1] dark:bg-[#1c1b1a] border border-[#E2DBD0] dark:border-[#403D39] space-y-2">
                              <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#5A554E] dark:text-[#CCC5B9] block">
                                Design Tokens & Tipografia Curada (GEMINI.md)
                              </span>
                              <div className="flex flex-wrap items-center gap-2 text-xs">
                                <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-white dark:bg-[#252422] border border-[#E2DBD0] dark:border-[#403D39]">
                                  <span className="w-3 h-3 rounded-full" style={{ backgroundColor: currentKit.tokens?.ground || '#FAF8F5' }} />
                                  <span className="text-[10px] font-mono text-[#5A554E] dark:text-[#CCC5B9]">Fundo: {currentKit.tokens?.ground}</span>
                                </div>
                                <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-white dark:bg-[#252422] border border-[#E2DBD0] dark:border-[#403D39]">
                                  <span className="w-3 h-3 rounded-full" style={{ backgroundColor: currentKit.tokens?.accent || '#EB5E28' }} />
                                  <span className="text-[10px] font-mono text-[#5A554E] dark:text-[#CCC5B9]">Ação: {currentKit.tokens?.accent}</span>
                                </div>
                                <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-white dark:bg-[#252422] border border-[#E2DBD0] dark:border-[#403D39]">
                                  <span className="text-[10px] font-semibold text-[#252422] dark:text-[#FFFCF2]">
                                    {currentKit.tokens?.font_display} + {currentKit.tokens?.font_body}
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* Strategic Differentials for Brazilian conversion */}
                            <div>
                              <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#5A554E] dark:text-[#CCC5B9] block mb-2">
                                Diferenciais Estratégicos Inclusos
                              </span>
                              <div className="grid grid-cols-2 gap-2 text-xs">
                                {(currentKit.differentials?.slice(0, 4) || [
                                  'Atendimento aos Sábados',
                                  'Orçamento Rápido no WhatsApp',
                                  'Facilidade no Pix e Cartão',
                                  'Profissionais Qualificados'
                                ]).map((diff: string, idx: number) => (
                                  <div key={idx} className="flex items-start gap-1.5 p-2 rounded-lg bg-[#F9F7F1] dark:bg-[#1c1b1a] border border-[#E2DBD0] dark:border-[#403D39]">
                                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                                    <span className="text-[11px] text-[#252422] dark:text-[#FFFCF2] leading-tight line-clamp-2">{diff}</span>
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* Services Preview */}
                            <div>
                              <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#5A554E] dark:text-[#CCC5B9] block mb-2">
                                4 Serviços / Especialidades em Destaque
                              </span>
                              <div className="space-y-1.5">
                                {(currentKit.services?.slice(0, 4) || []).map((srv: any, idx: number) => (
                                  <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-[#F9F7F1] dark:bg-[#1c1b1a] border border-[#E2DBD0] dark:border-[#403D39] text-xs">
                                    <span className="font-semibold text-[#252422] dark:text-[#FFFCF2] truncate">{srv.title}</span>
                                    <span className="text-[10px] px-2 py-0.5 rounded bg-white dark:bg-[#252422] border border-[#E2DBD0] dark:border-[#403D39] text-[#5A554E] dark:text-[#CCC5B9] shrink-0 font-medium">
                                      {srv.badge}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>

                          {/* Action Buttons */}
                          <div className="pt-4 border-t border-[#E2DBD0] dark:border-[#403D39] space-y-2">
                            {selectedLead ? (
                              <button
                                onClick={() => handleApplyNiche(selectedNicheKey, selectedLead.id)}
                                disabled={applyingNiche}
                                className="w-full py-3 rounded-xl bg-[#EB5E28] hover:bg-[#d8521d] text-[#FFFCF2] font-heading font-bold text-xs transition-colors duration-150 flex items-center justify-center gap-2 active:scale-[0.98] cursor-pointer shadow-md shadow-[#EB5E28]/25 disabled:opacity-60"
                              >
                                {applyingNiche ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                  <Sparkles className="w-4 h-4" />
                                )}
                                <span>
                                  {applyingNiche
                                    ? 'Aplicando Modelo ao Lead...'
                                    : `Aplicar este Modelo a ${selectedLead.name}`}
                                </span>
                              </button>
                            ) : (
                              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-800 dark:text-amber-300 text-xs">
                                <span>Selecione um comércio na aba <strong>Prospecção</strong> para aplicar e personalizar este modelo automaticamente.</span>
                              </div>
                            )}

                            <div className="flex items-center gap-2">
                              <a
                                href={previewUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="flex-1 py-2.5 px-3 rounded-xl bg-[#F9F7F1] dark:bg-[#1c1b1a] border border-[#E2DBD0] dark:border-[#403D39] text-xs font-semibold text-[#252422] dark:text-[#FFFCF2] hover:border-[#CCC5B9] dark:hover:border-[#57524d] transition-colors duration-150 flex items-center justify-center gap-1.5 cursor-pointer text-center"
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                                <span>Abrir em Nova Aba</span>
                              </a>

                              {selectedLead && (
                                <button
                                  onClick={() => handleDeployVercel(selectedLead)}
                                  disabled={deployingVercel}
                                  className="py-2.5 px-3 rounded-xl bg-[#171717] hover:bg-black dark:bg-[#EDEDED] dark:hover:bg-white text-white dark:text-[#171717] text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-60"
                                  title="Publicar página na nuvem Vercel"
                                >
                                  <CloudUpload className="w-3.5 h-3.5" />
                                  <span>Publicar Vercel</span>
                                </button>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Right Column: Interactive Visualizer Frame (Desktop 1280px / Tablet 768px / Mobile 390px) */}
                        <div className="lg:col-span-7 bg-white dark:bg-[#252422] border border-[#E2DBD0] dark:border-[#403D39] p-6 rounded-2xl flex flex-col shadow-xs">
                          <div className="flex flex-wrap items-center justify-between pb-4 border-b border-[#E2DBD0] dark:border-[#403D39] mb-4 gap-2">
                            <div className="flex items-center gap-2">
                              <span className="font-heading font-bold text-sm text-[#252422] dark:text-[#FFFCF2]">
                                Visualizador de Alta Conversão
                              </span>
                              <span className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30 font-bold">
                                {currentKit.name}
                              </span>
                            </div>

                            <div className="flex items-center gap-2">
                              {/* Engine switcher: React 18 (Vite + GSAP) vs HTML SSR */}
                              <div className="bg-[#F9F7F1] dark:bg-[#1c1b1a] border border-[#E2DBD0] dark:border-[#403D39] p-1 rounded-xl flex items-center gap-1">
                                <button
                                  onClick={() => {
                                    setPreviewEngine('react');
                                    setNicheIframeKey(Date.now());
                                  }}
                                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1 ${
                                    previewEngine === 'react'
                                      ? 'bg-[#10B981] text-white shadow-xs'
                                      : 'text-[#5A554E] dark:text-[#CCC5B9] hover:text-[#252422]'
                                  }`}
                                  title="Renderização direta em React 18 + Vite + GSAP ScrollTrigger"
                                >
                                  <span>⚛️ React + GSAP</span>
                                </button>
                                <button
                                  onClick={() => {
                                    setPreviewEngine('ssr');
                                    setNicheIframeKey(Date.now());
                                  }}
                                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1 ${
                                    previewEngine === 'ssr'
                                      ? 'bg-[#252422] text-white dark:bg-white dark:text-[#252422] shadow-xs'
                                      : 'text-[#5A554E] dark:text-[#CCC5B9] hover:text-[#252422]'
                                  }`}
                                  title="Renderização HTML Server-Side para exportação estática"
                                >
                                  <span>🌐 HTML SSR</span>
                                </button>
                              </div>

                              {/* Viewport switcher: Desktop (1280px), Tablet (768px), Mobile (390px) */}
                              <div className="bg-[#F9F7F1] dark:bg-[#1c1b1a] border border-[#E2DBD0] dark:border-[#403D39] p-1 rounded-xl flex items-center gap-1">
                                <button
                                  onClick={() => setPreviewViewport('desktop')}
                                  className={`p-1.5 rounded-lg text-xs transition-colors duration-150 cursor-pointer ${
                                    previewViewport === 'desktop'
                                      ? 'bg-[#F2ECE1] dark:bg-[#33302d] text-[#252422] dark:text-[#FFFCF2]'
                                      : 'text-[#5A554E] dark:text-[#CCC5B9] hover:text-[#252422] dark:hover:text-[#FFFCF2]'
                                  }`}
                                  title="Desktop (1280px)"
                                  aria-label="Viewport Desktop"
                                >
                                  <Monitor className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => setPreviewViewport('tablet')}
                                  className={`p-1.5 rounded-lg text-xs transition-colors duration-150 cursor-pointer ${
                                    previewViewport === 'tablet'
                                      ? 'bg-[#F2ECE1] dark:bg-[#33302d] text-[#252422] dark:text-[#FFFCF2]'
                                      : 'text-[#5A554E] dark:text-[#CCC5B9] hover:text-[#252422] dark:hover:text-[#FFFCF2]'
                                  }`}
                                  title="Tablet (768px)"
                                  aria-label="Viewport Tablet"
                                >
                                  <Tablet className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => setPreviewViewport('mobile')}
                                  className={`p-1.5 rounded-lg text-xs transition-colors duration-150 cursor-pointer ${
                                    previewViewport === 'mobile'
                                      ? 'bg-[#F2ECE1] dark:bg-[#33302d] text-[#252422] dark:text-[#FFFCF2]'
                                      : 'text-[#5A554E] dark:text-[#CCC5B9] hover:text-[#252422] dark:hover:text-[#FFFCF2]'
                                  }`}
                                  title="Mobile (390px) com Sticky Action Bar WhatsApp"
                                  aria-label="Viewport Mobile"
                                >
                                  <Smartphone className="w-3.5 h-3.5" />
                                </button>
                              </div>

                              {/* Refresh button */}
                              <button
                                onClick={() => {
                                  setNicheIframeKey(Date.now());
                                  addToast('info', 'Prévia Atualizada');
                                }}
                                className="p-2 rounded-xl bg-[#F9F7F1] dark:bg-[#1c1b1a] border border-[#E2DBD0] dark:border-[#403D39] text-[#5A554E] dark:text-[#CCC5B9] hover:text-[#252422] dark:hover:text-[#FFFCF2] transition-colors duration-150 active:scale-[0.98] cursor-pointer"
                                title="Recarregar tela"
                                aria-label="Recarregar tela"
                              >
                                <RotateCw className="w-3.5 h-3.5" />
                              </button>

                              <a
                                href={previewUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="p-2 rounded-xl bg-[#F9F7F1] dark:bg-[#1c1b1a] border border-[#E2DBD0] dark:border-[#403D39] text-[#5A554E] dark:text-[#CCC5B9] hover:text-[#252422] dark:hover:text-[#FFFCF2] transition-colors duration-150 active:scale-[0.98]"
                                title="Abrir em nova aba"
                                aria-label="Abrir em nova aba"
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                              </a>
                            </div>
                          </div>

                          {/* Iframe preview container with device frame */}
                          <div className="flex-1 min-h-[560px] bg-[#F9F7F1] dark:bg-[#1c1b1a] rounded-2xl overflow-hidden flex items-center justify-center p-3 border border-[#E2DBD0] dark:border-[#403D39]">
                            <div
                              className={`h-full transition-[width] duration-200 ease-out flex items-center justify-center ${
                                previewViewport === 'mobile'
                                  ? 'w-[390px] border-[6px] border-[#252422] dark:border-[#33302d] rounded-[32px] overflow-hidden relative bg-black shadow-2xl'
                                  : previewViewport === 'tablet'
                                  ? 'w-[740px] border-[4px] border-[#252422] dark:border-[#33302d] rounded-2xl overflow-hidden shadow-lg'
                                  : 'w-full rounded-xl overflow-hidden shadow-xs'
                              }`}
                            >
                              {/* Notch simulation for mobile frame */}
                              {previewViewport === 'mobile' && (
                                <div className="absolute top-2 left-1/2 -translate-x-1/2 w-24 h-4 bg-[#252422] rounded-full z-20 flex items-center justify-center pointer-events-none">
                                  <span className="w-2.5 h-2.5 rounded-full bg-[#1c1b1a]"></span>
                                </div>
                              )}
                              <iframe
                                src={previewUrl}
                                className="w-full h-[620px] border-none bg-white"
                                title={`Prévia do Nicho: ${currentKit.name}`}
                                loading="lazy"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })()}

                {/* Subtab 2: Custom Doop Canvas View */}
                {prototypeSubTab === 'custom_canvas' && (
                  <div className="space-y-6">
                {/* Doop Canvas Architecture Banner */}
                {selectedLead && (
                  <div className="p-5 rounded-2xl bg-white dark:bg-[#252422] border border-[#E2DBD0] dark:border-[#403D39] shadow-xs">
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                      <div className="flex items-start gap-3.5">
                        <div className="w-10 h-10 rounded-xl bg-[#EB5E28]/15 text-[#EB5E28] border border-[#EB5E28]/30 flex items-center justify-center shrink-0">
                          <LayoutTemplate className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="text-sm font-heading font-bold text-[#252422] dark:text-[#FFFCF2]">
                              {activeCanvasId ? `Canvas Oficial no Doop: ${selectedLead.name}` : `Layout Único no Doop para ${selectedLead.name}`}
                            </h3>
                            {activeCanvasId ? (
                              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30 font-bold">
                                ID FIXO: {activeCanvasId}
                              </span>
                            ) : (
                              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30 font-semibold">
                                Aguardando Criação
                              </span>
                            )}
                            <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-[#EB5E28]/15 text-[#EB5E28] border border-[#EB5E28]/30">
                              Prévia Ágil (Desktop + Mobile)
                            </span>
                          </div>
                          <p className="text-xs text-[#5A554E] dark:text-[#CCC5B9] mt-1 font-sans">
                            {activeCanvasId
                              ? `Canvas estruturado no Doop (ID fixo ${activeCanvasId}) com Desktop Completo (1280px) e Mobile (390px) com Sticky Action Bar WhatsApp.`
                              : 'Layout exclusivo por comércio com paleta tangível (WCAG > 5.5:1), tipografia display + neutral e ícones vetoriais SVG.'}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0 w-full md:w-auto">
                        {activeCanvasId ? (
                          <a
                            href={activeCanvasUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="w-full md:w-auto px-4 py-2.5 rounded-xl bg-[#EB5E28] hover:bg-[#d8521d] text-[#FFFCF2] text-xs font-semibold flex items-center justify-center gap-2 active:scale-[0.98] transition-colors duration-150 cursor-pointer shadow-md shadow-[#EB5E28]/25"
                          >
                            <LayoutTemplate className="w-4 h-4" />
                            <span>Abrir Canvas no Doop</span>
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        ) : (
                          <button
                            onClick={handleGeneratePrototype}
                            disabled={loading}
                            className="w-full md:w-auto px-4 py-2.5 rounded-xl bg-[#EB5E28] hover:bg-[#d8521d] text-[#FFFCF2] text-xs font-semibold flex items-center justify-center gap-2 active:scale-[0.98] transition-colors duration-150 cursor-pointer shadow-md shadow-[#EB5E28]/25"
                          >
                            <LayoutTemplate className="w-4 h-4" />
                            <span>Criar Canvas no Doop Agora</span>
                          </button>
                        )}
                      </div>
                    </div>

                    {/* 4 Columns Architecture Indicator */}
                    <div className="mt-4 pt-3 border-t border-[#E2DBD0] dark:border-[#403D39] grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] font-sans">
                      <div className="p-2 rounded-lg bg-[#F9F7F1] dark:bg-[#1c1b1a] border border-[#E2DBD0] dark:border-[#403D39]">
                        <span className="font-semibold text-[#252422] dark:text-[#FFFCF2] block">Coluna 1 • Desktop Modular</span>
                        <span className="text-[#5A554E] dark:text-[#CCC5B9] text-[10px]">5 frames (01 Hero a 05 Footer)</span>
                      </div>
                      <div className="p-2 rounded-lg bg-[#F9F7F1] dark:bg-[#1c1b1a] border border-[#E2DBD0] dark:border-[#403D39]">
                        <span className="font-semibold text-[#252422] dark:text-[#FFFCF2] block">Coluna 2 • Desktop Completo</span>
                        <span className="text-[#5A554E] dark:text-[#CCC5B9] text-[10px]">1280px × ~4250px contínuo</span>
                      </div>
                      <div className="p-2 rounded-lg bg-[#F9F7F1] dark:bg-[#1c1b1a] border border-[#E2DBD0] dark:border-[#403D39]">
                        <span className="font-semibold text-[#252422] dark:text-[#FFFCF2] block">Coluna 3 • Mobile Modular</span>
                        <span className="text-[#5A554E] dark:text-[#CCC5B9] text-[10px]">5 frames verticais (M01 a M05)</span>
                      </div>
                      <div className="p-2 rounded-lg bg-[#F9F7F1] dark:bg-[#1c1b1a] border border-[#E2DBD0] dark:border-[#403D39]">
                        <span className="font-semibold text-[#252422] dark:text-[#FFFCF2] block">Coluna 4 • Mobile Completo</span>
                        <span className="text-[#5A554E] dark:text-[#CCC5B9] text-[10px]">390px + Sticky Action Bar WhatsApp</span>
                      </div>
                    </div>
                  </div>
                )}

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Briefing Form & Theme Selector */}
                <div className="lg:col-span-5 bg-white dark:bg-[#252422] border border-[#E2DBD0] dark:border-[#403D39] p-6 rounded-2xl space-y-4 shadow-xs">
                  <div className="flex items-center justify-between">
                    <h3 className="font-heading font-bold text-sm text-[#252422] dark:text-[#FFFCF2] flex items-center gap-2">
                      <Layers className="w-4 h-4 text-[#EB5E28]" />
                      <span>Briefing do Layout Único</span>
                    </h3>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#5A554E] dark:text-[#CCC5B9] mb-1 font-sans">Nome do Comércio</label>
                    <input
                      type="text"
                      value={briefBusinessName}
                      onChange={(e) => setBriefBusinessName(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#F9F7F1] dark:bg-[#1c1b1a] border border-[#E2DBD0] dark:border-[#403D39] text-xs text-[#252422] dark:text-[#FFFCF2] focus:outline-none focus:border-[#EB5E28]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#5A554E] dark:text-[#CCC5B9] mb-1 font-sans">Segmento / Categoria</label>
                    <input
                      type="text"
                      value={briefSegment}
                      onChange={(e) => setBriefSegment(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#F9F7F1] dark:bg-[#1c1b1a] border border-[#E2DBD0] dark:border-[#403D39] text-xs text-[#252422] dark:text-[#FFFCF2] focus:outline-none focus:border-[#EB5E28]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#5A554E] dark:text-[#CCC5B9] mb-1 font-sans">Chamada para Ação (CTA)</label>
                    <input
                      type="text"
                      value={briefCta}
                      onChange={(e) => setBriefCta(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#F9F7F1] dark:bg-[#1c1b1a] border border-[#E2DBD0] dark:border-[#403D39] text-xs text-[#252422] dark:text-[#FFFCF2] focus:outline-none focus:border-[#EB5E28]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#5A554E] dark:text-[#CCC5B9] mb-1 font-sans">Serviços e Especialidades</label>
                    <textarea
                      rows={3}
                      value={briefServices}
                      onChange={(e) => setBriefServices(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl bg-[#F9F7F1] dark:bg-[#1c1b1a] border border-[#E2DBD0] dark:border-[#403D39] text-xs text-[#252422] dark:text-[#FFFCF2] leading-relaxed focus:outline-none focus:border-[#EB5E28] font-sans"
                    />
                  </div>

                  <div className="space-y-2 pt-1">
                    <button
                      onClick={handleGeneratePrototype}
                      disabled={loading || deployingVercel}
                      className="w-full py-3 rounded-xl bg-[#EB5E28] hover:bg-[#d8521d] text-[#FFFCF2] font-heading font-bold text-xs transition-colors duration-150 flex items-center justify-center gap-2 active:scale-[0.98] cursor-pointer shadow-md shadow-[#EB5E28]/25 disabled:opacity-60"
                    >
                      <LayoutTemplate className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                      <span>
                        {loading
                          ? (activeCanvasId ? 'Atualizando Canvas no Doop...' : 'Criando Canvas no Doop...')
                          : (activeCanvasId ? `Atualizar Canvas no Doop (ID Fixo: ${activeCanvasId})` : 'Criar Canvas no Doop (12 Pranchetas)')}
                      </span>
                    </button>

                    <button
                      onClick={() => handleDeployVercel(selectedLead)}
                      disabled={deployingVercel || loading}
                      className="w-full py-3 rounded-xl bg-[#171717] hover:bg-black dark:bg-[#EDEDED] dark:hover:bg-white text-white dark:text-[#171717] font-heading font-bold text-xs transition-colors duration-150 flex items-center justify-center gap-2 active:scale-[0.98] cursor-pointer shadow-md disabled:opacity-60"
                      title="Publicar na nuvem Vercel gerando link direto para o cliente"
                    >
                      {deployingVercel ? (
                        <Loader2 className="w-4 h-4 animate-spin text-[#EB5E28]" />
                      ) : (
                        <CloudUpload className="w-4 h-4" />
                      )}
                      <span>{deployingVercel ? 'Publicando na Vercel...' : 'Publicar na Vercel (Gerar Link ao Vivo)'}</span>
                    </button>
                  </div>

                  {/* Vercel Live Deployment Card */}
                  {selectedLead?.vercelUrl && (
                    <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-800 dark:text-emerald-300 space-y-2.5 animate-fade-in">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
                          <Globe className="w-3.5 h-3.5" />
                          <span>Hospedado na Vercel • Link Ativo</span>
                        </span>
                        <span className="flex h-2 w-2 relative">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          readOnly
                          value={selectedLead.vercelUrl}
                          className="flex-1 px-3 py-1.5 text-xs bg-white dark:bg-[#1c1b1a] border border-emerald-500/30 rounded-lg text-emerald-950 dark:text-emerald-200 font-mono select-all focus:outline-none"
                        />
                        <button
                          onClick={() => copyToClipboard(selectedLead.vercelUrl!, 'Link da Vercel')}
                          className="p-2 bg-white dark:bg-[#1c1b1a] border border-emerald-500/30 rounded-lg hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 transition-colors cursor-pointer"
                          title="Copiar Link para o Cliente"
                          aria-label="Copiar Link da Vercel"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                        <a
                          href={selectedLead.vercelUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="p-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors cursor-pointer flex items-center justify-center"
                          title="Abrir Site no Navegador"
                          aria-label="Abrir Site na Vercel"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </div>
                      <p className="text-[10px] text-emerald-700/80 dark:text-emerald-400/80 font-sans leading-relaxed">
                        Este link é 100% público e responsivo, ideal para ser enviado na abordagem do WhatsApp.
                      </p>
                    </div>
                  )}
                </div>

                {/* Interactive Visualizer Canvas with Device Mockup */}
                <div className="lg:col-span-7 bg-white dark:bg-[#252422] border border-[#E2DBD0] dark:border-[#403D39] p-6 rounded-2xl flex flex-col shadow-xs">
                  <div className="flex flex-wrap items-center justify-between pb-4 border-b border-[#E2DBD0] dark:border-[#403D39] mb-4 gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-heading font-bold text-sm text-[#252422] dark:text-[#FFFCF2]">Visualizador Oficial do Doop</span>
                      {activeCanvasId && (
                        <span className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30 font-bold">
                          {activeCanvasId}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      {/* View Mode Toggle: Página vs Studio Doop */}
                      {activeCanvasId && (
                        <div className="bg-[#F9F7F1] dark:bg-[#1c1b1a] border border-[#E2DBD0] dark:border-[#403D39] p-1 rounded-xl flex items-center gap-1">
                          <button
                            onClick={() => {
                              setCanvasViewMode('page');
                              setCurrentPrototypeUrl(`/api/prototypes/canvas/${activeCanvasId}/preview?viewport=${previewViewport}&t=${Date.now()}`);
                            }}
                            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors duration-150 cursor-pointer ${
                              canvasViewMode === 'page'
                                ? 'bg-[#EB5E28] text-white shadow-xs'
                                : 'text-[#5A554E] dark:text-[#CCC5B9] hover:text-[#252422] dark:hover:text-[#FFFCF2]'
                            }`}
                            title="Ver página renderizada do canvas"
                          >
                            Página
                          </button>
                          <button
                            onClick={() => {
                              setCanvasViewMode('studio');
                              setCurrentPrototypeUrl(`http://localhost:4300/c/${activeCanvasId}`);
                            }}
                            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors duration-150 cursor-pointer ${
                              canvasViewMode === 'studio'
                                ? 'bg-[#EB5E28] text-white shadow-xs'
                                : 'text-[#5A554E] dark:text-[#CCC5B9] hover:text-[#252422] dark:hover:text-[#FFFCF2]'
                            }`}
                            title="Ver canvas completo no Doop Studio"
                          >
                            Studio Doop
                          </button>
                        </div>
                      )}

                      {/* Viewport switch: Desktop, Tablet, Mobile (when viewing page) */}
                      {canvasViewMode === 'page' && (
                        <div className="bg-[#F9F7F1] dark:bg-[#1c1b1a] border border-[#E2DBD0] dark:border-[#403D39] p-1 rounded-xl flex items-center gap-1">
                          <button
                            onClick={() => {
                              setPreviewViewport('desktop');
                              if (activeCanvasId) setCurrentPrototypeUrl(`/api/prototypes/canvas/${activeCanvasId}/preview?viewport=desktop&t=${Date.now()}`);
                            }}
                            className={`p-1.5 rounded-lg text-xs transition-colors duration-150 cursor-pointer ${
                              previewViewport === 'desktop' ? 'bg-[#F2ECE1] dark:bg-[#33302d] text-[#252422] dark:text-[#FFFCF2]' : 'text-[#5A554E] dark:text-[#CCC5B9] hover:text-[#252422] dark:hover:text-[#FFFCF2]'
                            }`}
                            title="Desktop (100%)"
                            aria-label="Viewport Desktop"
                          >
                            <Monitor className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              setPreviewViewport('tablet');
                              if (activeCanvasId) setCurrentPrototypeUrl(`/api/prototypes/canvas/${activeCanvasId}/preview?viewport=tablet&t=${Date.now()}`);
                            }}
                            className={`p-1.5 rounded-lg text-xs transition-colors duration-150 cursor-pointer ${
                              previewViewport === 'tablet' ? 'bg-[#F2ECE1] dark:bg-[#33302d] text-[#252422] dark:text-[#FFFCF2]' : 'text-[#5A554E] dark:text-[#CCC5B9] hover:text-[#252422] dark:hover:text-[#FFFCF2]'
                            }`}
                            title="Tablet (768px)"
                            aria-label="Viewport Tablet"
                          >
                            <Tablet className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              setPreviewViewport('mobile');
                              if (activeCanvasId) setCurrentPrototypeUrl(`/api/prototypes/canvas/${activeCanvasId}/preview?viewport=mobile&t=${Date.now()}`);
                            }}
                            className={`p-1.5 rounded-lg text-xs transition-colors duration-150 cursor-pointer ${
                              previewViewport === 'mobile' ? 'bg-[#F2ECE1] dark:bg-[#33302d] text-[#252422] dark:text-[#FFFCF2]' : 'text-[#5A554E] dark:text-[#CCC5B9] hover:text-[#252422] dark:hover:text-[#FFFCF2]'
                            }`}
                            title="Mobile (390px)"
                            aria-label="Viewport Mobile"
                          >
                            <Smartphone className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}

                      {currentPrototypeUrl && (
                        <>
                          <button
                            onClick={() => {
                              if (activeCanvasId) {
                                if (canvasViewMode === 'studio') {
                                  setCurrentPrototypeUrl(`http://localhost:4300/c/${activeCanvasId}?t=${Date.now()}`);
                                } else {
                                  setCurrentPrototypeUrl(`/api/prototypes/canvas/${activeCanvasId}/preview?viewport=${previewViewport}&t=${Date.now()}`);
                                }
                                addToast('info', 'Preview Atualizado');
                              }
                            }}
                            className="p-2 rounded-xl bg-[#F9F7F1] dark:bg-[#1c1b1a] border border-[#E2DBD0] dark:border-[#403D39] text-[#5A554E] dark:text-[#CCC5B9] hover:text-[#252422] dark:hover:text-[#FFFCF2] transition-colors duration-150 active:scale-[0.98] cursor-pointer"
                            title="Recarregar tela"
                            aria-label="Recarregar tela"
                          >
                            <RotateCw className="w-3.5 h-3.5" />
                          </button>
                          <a
                            href={activeCanvasUrl || (activeCanvasId ? `http://localhost:4300/c/${activeCanvasId}` : currentPrototypeUrl)}
                            target="_blank"
                            rel="noreferrer"
                            className="p-2 rounded-xl bg-[#F9F7F1] dark:bg-[#1c1b1a] border border-[#E2DBD0] dark:border-[#403D39] text-[#5A554E] dark:text-[#CCC5B9] hover:text-[#252422] dark:hover:text-[#FFFCF2] transition-colors duration-150 active:scale-[0.98]"
                            title="Abrir Canvas no Doop em nova aba"
                            aria-label="Abrir Canvas no Doop em nova aba"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>

                          {selectedLead?.vercelUrl && (
                            <a
                              href={selectedLead.vercelUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="px-3 py-1.5 rounded-xl bg-emerald-500/15 border border-emerald-500/35 text-emerald-700 dark:text-emerald-300 text-xs font-bold hover:bg-emerald-500/25 transition-colors flex items-center gap-1.5"
                              title="Abrir site oficial hospedado na Vercel"
                            >
                              <Globe className="w-3.5 h-3.5" />
                              <span className="hidden sm:inline">Site ao Vivo</span>
                            </a>
                          )}
                        </>
                      )}
                    </div>
                  </div>

                  {/* Iframe preview container with device frame */}
                  <div className="flex-1 min-h-[540px] bg-[#F9F7F1] dark:bg-[#1c1b1a] rounded-2xl overflow-hidden flex items-center justify-center p-3 border border-[#E2DBD0] dark:border-[#403D39]">
                    {currentPrototypeUrl ? (
                      <div
                        className={`h-full transition-[width] duration-200 ease-out flex items-center justify-center ${
                          canvasViewMode === 'page' && previewViewport === 'mobile'
                            ? 'w-[390px] border-[6px] border-[#252422] dark:border-[#33302d] rounded-[32px] overflow-hidden relative bg-black shadow-lg'
                            : canvasViewMode === 'page' && previewViewport === 'tablet'
                            ? 'w-[740px] border-[4px] border-[#252422] dark:border-[#33302d] rounded-2xl overflow-hidden shadow-lg'
                            : 'w-full rounded-xl overflow-hidden'
                        }`}
                      >
                        {/* Notch simulation for mobile frame */}
                        {canvasViewMode === 'page' && previewViewport === 'mobile' && (
                          <div className="absolute top-2 left-1/2 -translate-x-1/2 w-24 h-4 bg-[#252422] rounded-full z-20 flex items-center justify-center">
                            <span className="w-2.5 h-2.5 rounded-full bg-[#1c1b1a]"></span>
                          </div>
                        )}
                        <iframe
                          src={currentPrototypeUrl}
                          className="w-full h-[580px] border-none bg-white"
                          title="Visualização do Protótipo"
                          loading="lazy"
                        />
                      </div>
                    ) : (
                      <div className="text-center text-[#5A554E] dark:text-[#CCC5B9] text-xs py-12 font-sans">
                        <LayoutTemplate className="w-8 h-8 mx-auto mb-2 text-[#5A554E]/60 dark:text-[#CCC5B9]/60" />
                        <span>Nenhum canvas gerado ainda para este comércio no Doop.</span>
                        <br />
                        <span className="text-[#5A554E]/70 dark:text-[#CCC5B9]/70 mt-1 block">Ajuste os dados e clique em "Criar Canvas no Doop (12 Pranchetas)".</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              </div>
            )}
            </div>
          );
        })()}

          {/* Tab 5: Settings & Diagnostics */}
          {tab === 'settings' && (
            <div className="space-y-6 max-w-4xl">
              <div className="bg-white dark:bg-[#252422] border border-[#E2DBD0] dark:border-[#403D39] p-6 rounded-2xl space-y-6 shadow-xs">
                <div>
                  <h3 className="font-heading font-bold text-base text-[#252422] dark:text-[#FFFCF2] flex items-center gap-2">
                    <Sliders className="w-4 h-4 text-[#EB5E28]" />
                    <span>Configurações & Políticas da Central Local</span>
                  </h3>
                  <p className="text-xs text-[#5A554E] dark:text-[#CCC5B9] mt-1 font-sans">
                    Gerencie o tema visual, as portas, os modos de segurança e o processo background do Doop.
                  </p>
                </div>

                <div className="space-y-4">
                  {/* Theme Selector Section */}
                  <div>
                    <label className="block text-xs font-semibold text-[#5A554E] dark:text-[#CCC5B9] mb-2 font-sans">
                      Tema Visual da Interface
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <button
                        onClick={() => theme !== 'dark' && toggleTheme()}
                        className={`p-3.5 rounded-2xl border text-left text-xs transition-colors duration-150 active:scale-[0.98] cursor-pointer flex items-start gap-3 ${
                          theme === 'dark'
                            ? 'border-[#EB5E28] bg-[#EB5E28]/10 text-[#FFFCF2] font-bold'
                            : 'border-[#E2DBD0] dark:border-[#403D39] bg-[#F9F7F1] dark:bg-[#1c1b1a] text-[#5A554E] dark:text-[#CCC5B9] hover:border-[#CCC5B9]'
                        }`}
                      >
                        <div className="w-8 h-8 rounded-xl bg-[#1c1b1a] border border-[#403D39] flex items-center justify-center shrink-0 text-[#EB5E28]">
                          <Moon className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="font-heading font-bold text-[#252422] dark:text-[#FFFCF2] mb-0.5">
                            Modo Escuro (Carvão Profundo)
                          </div>
                          <span className="text-[11px] text-[#5A554E] dark:text-[#CCC5B9]/80 leading-normal block font-sans">
                            Fundo #1c1b1a, cards #252422, texto Floral White #FFFCF2 e acentos Spicy Paprika.
                          </span>
                        </div>
                      </button>

                      <button
                        onClick={() => theme !== 'light' && toggleTheme()}
                        className={`p-3.5 rounded-2xl border text-left text-xs transition-colors duration-150 active:scale-[0.98] cursor-pointer flex items-start gap-3 ${
                          theme === 'light'
                            ? 'border-[#EB5E28] bg-[#EB5E28]/10 text-[#252422] font-bold'
                            : 'border-[#E2DBD0] dark:border-[#403D39] bg-[#F9F7F1] dark:bg-[#1c1b1a] text-[#5A554E] dark:text-[#CCC5B9] hover:border-[#CCC5B9]'
                        }`}
                      >
                        <div className="w-8 h-8 rounded-xl bg-white border border-[#E2DBD0] flex items-center justify-center shrink-0 text-[#EB5E28]">
                          <Sun className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="font-heading font-bold text-[#252422] dark:text-[#FFFCF2] mb-0.5">
                            Modo Claro (Floral White Suave)
                          </div>
                          <span className="text-[11px] text-[#5A554E] dark:text-[#CCC5B9]/80 leading-normal block font-sans">
                            Fundo Floral White #FFFCF2, cards brancos, texto Charcoal #252422 e acentos Spicy Paprika.
                          </span>
                        </div>
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#5A554E] dark:text-[#CCC5B9] mb-2 font-sans">
                      Modo de Execução do Sistema
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <button
                        onClick={() => handleUpdateMode('mock')}
                        className={`p-3.5 rounded-2xl border text-left text-xs transition-colors duration-150 active:scale-[0.98] cursor-pointer ${
                          mode === 'mock'
                            ? 'border-[#EB5E28] bg-[#EB5E28]/10 text-[#252422] dark:text-[#FFFCF2] font-bold'
                            : 'border-[#E2DBD0] dark:border-[#403D39] bg-[#F9F7F1] dark:bg-[#1c1b1a] text-[#5A554E] dark:text-[#CCC5B9] hover:border-[#CCC5B9] dark:hover:border-[#57524d]'
                        }`}
                      >
                        <div className="font-heading font-bold text-[#252422] dark:text-[#FFFCF2] mb-1 flex items-center gap-1.5">
                          <Shield className="w-3.5 h-3.5 text-[#EB5E28]" />
                          <span>Mock (Simulado)</span>
                        </div>
                        <span className="text-[11px] text-[#5A554E]/80 dark:text-[#CCC5B9]/80 leading-normal block font-sans">
                          Totalmente isolado, sem tocar em portas de serviços externos.
                        </span>
                      </button>

                      <button
                        onClick={() => handleUpdateMode('integrado_sem_envio')}
                        className={`p-3.5 rounded-2xl border text-left text-xs transition-colors duration-150 active:scale-[0.98] cursor-pointer ${
                          mode === 'integrado_sem_envio'
                            ? 'border-emerald-500 bg-emerald-500/10 text-[#252422] dark:text-[#FFFCF2] font-bold'
                            : 'border-[#E2DBD0] dark:border-[#403D39] bg-[#F9F7F1] dark:bg-[#1c1b1a] text-[#5A554E] dark:text-[#CCC5B9] hover:border-[#CCC5B9] dark:hover:border-[#57524d]'
                        }`}
                      >
                        <div className="font-heading font-bold text-[#252422] dark:text-[#FFFCF2] mb-1 flex items-center gap-1.5">
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                          <span>Integrado sem Envio</span>
                        </div>
                        <span className="text-[11px] text-[#5A554E]/80 dark:text-[#CCC5B9]/80 leading-normal block font-sans">
                          Lê scraper real e OpenWA, mas bloqueia disparos físicos de mensagem.
                        </span>
                      </button>

                      <button
                        onClick={() => handleUpdateMode('real')}
                        className={`p-3.5 rounded-2xl border text-left text-xs transition-colors duration-150 active:scale-[0.98] cursor-pointer ${
                          mode === 'real'
                            ? 'border-amber-500 bg-amber-500/10 dark:bg-amber-950/40 text-[#252422] dark:text-[#FFFCF2] font-bold'
                            : 'border-[#E2DBD0] dark:border-[#403D39] bg-[#F9F7F1] dark:bg-[#1c1b1a] text-[#5A554E] dark:text-[#CCC5B9] hover:border-[#CCC5B9] dark:hover:border-[#57524d]'
                        }`}
                      >
                        <div className="font-heading font-bold text-[#252422] dark:text-[#FFFCF2] mb-1 flex items-center gap-1.5">
                          <ShieldAlert className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" />
                          <span>Piloto Real</span>
                        </div>
                        <span className="text-[11px] text-[#5A554E]/80 dark:text-[#CCC5B9]/80 leading-normal block font-sans">
                          Habilita disparos físicos via OpenWA Gateway sob aprovação manual expressa.
                        </span>
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                    <div className="bg-[#F9F7F1] dark:bg-[#1c1b1a] border border-[#E2DBD0] dark:border-[#403D39] p-3.5 rounded-xl">
                      <label className="block text-xs font-semibold text-[#5A554E] dark:text-[#CCC5B9] mb-1 flex items-center gap-1.5 font-sans">
                        <Server className="w-3.5 h-3.5 text-[#EB5E28]" />
                        <span>Porta Central Local</span>
                      </label>
                      <div className="font-mono text-sm text-[#252422] dark:text-[#FFFCF2] font-bold">3333</div>
                    </div>
                    <div className="bg-[#F9F7F1] dark:bg-[#1c1b1a] border border-[#E2DBD0] dark:border-[#403D39] p-3.5 rounded-xl">
                      <label className="block text-xs font-semibold text-[#5A554E] dark:text-[#CCC5B9] mb-1 flex items-center gap-1.5 font-sans">
                        <Radio className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                        <span>Porta OpenWA Gateway</span>
                      </label>
                      <div className="font-mono text-sm text-[#252422] dark:text-[#FFFCF2] font-bold">2785</div>
                    </div>
                    <div className="bg-[#F9F7F1] dark:bg-[#1c1b1a] border border-[#E2DBD0] dark:border-[#403D39] p-3.5 rounded-xl">
                      <label className="block text-xs font-semibold text-[#5A554E] dark:text-[#CCC5B9] mb-1 flex items-center gap-1.5 font-sans">
                        <LayoutTemplate className="w-3.5 h-3.5 text-[#EB5E28]" />
                        <span>Porta Doop Studio</span>
                      </label>
                      <div className="font-mono text-sm text-[#252422] dark:text-[#FFFCF2] font-bold">4400 / 4300</div>
                    </div>
                  </div>
                </div>

                {/* AI / LLM Configuration Section: Claude Sonnet 5 via GhostCLI */}
                <div className="border-t border-[#E2DBD0] dark:border-[#403D39] pt-5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                    <div>
                      <h4 className="font-heading font-bold text-xs text-[#252422] dark:text-[#FFFCF2] flex items-center gap-2">
                        <Bot className="w-4 h-4 text-[#EB5E28]" />
                        <span>Inteligência Artificial: Claude Sonnet 5 Copilot</span>
                      </h4>
                      <p className="text-[11px] text-[#5A554E] dark:text-[#CCC5B9] mt-0.5 font-sans">
                        Configurado via API GhostCLI (Anthropic Messages API) para diagnóstico de leads, abordagens e superação de objeções.
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleTestAi}
                        disabled={isTestingAi}
                        className="px-3 py-1.5 rounded-xl bg-[#F2ECE1] hover:bg-[#E6DFD3] dark:bg-[#33302d] dark:hover:bg-[#403D39] text-[#252422] dark:text-[#FFFCF2] border border-[#E2DBD0] dark:border-[#403D39] text-xs font-semibold flex items-center gap-1.5 active:scale-[0.98] transition-colors duration-150 cursor-pointer whitespace-nowrap shrink-0"
                      >
                        <RefreshCw className={`w-3.5 h-3.5 ${isTestingAi ? 'animate-spin text-[#EB5E28]' : ''}`} />
                        <span>{isTestingAi ? 'Testando...' : 'Testar Conexão'}</span>
                      </button>
                      <button
                        onClick={() => setAiDrawerOpen(true)}
                        className="px-3 py-1.5 rounded-xl bg-[#EB5E28] hover:bg-[#d04f1f] text-white text-xs font-semibold flex items-center gap-1.5 active:scale-[0.98] transition-colors duration-150 cursor-pointer whitespace-nowrap shrink-0 shadow-sm shadow-[#EB5E28]/25"
                      >
                        <Bot className="w-3.5 h-3.5" />
                        <span>Abrir Copilot</span>
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                    <div className="bg-[#F9F7F1] dark:bg-[#1c1b1a] border border-[#E2DBD0] dark:border-[#403D39] p-3.5 rounded-xl">
                      <span className="block text-[11px] font-semibold text-[#5A554E] dark:text-[#CCC5B9] mb-1 font-sans">
                        Status do Claude
                      </span>
                      <div className="flex items-center gap-1.5">
                        <span className={`w-2 h-2 rounded-full ${aiStatus?.available ? 'bg-emerald-500 ring-2 ring-emerald-500/20' : 'bg-amber-500'}`} />
                        <span className="text-xs font-bold text-[#252422] dark:text-[#FFFCF2]">
                          {aiStatus?.available ? 'Online & Pronto' : 'Aguardando Teste'}
                        </span>
                      </div>
                      {aiStatus?.latencyMs && (
                        <span className="text-[10px] text-[#5A554E]/70 dark:text-[#CCC5B9]/70 font-mono mt-0.5 block">
                          Ping: {aiStatus.latencyMs}ms
                        </span>
                      )}
                    </div>

                    <div className="bg-[#F9F7F1] dark:bg-[#1c1b1a] border border-[#E2DBD0] dark:border-[#403D39] p-3.5 rounded-xl">
                      <span className="block text-[11px] font-semibold text-[#5A554E] dark:text-[#CCC5B9] mb-1 font-sans">
                        Modelo Ativo
                      </span>
                      <div className="font-mono text-xs font-bold text-[#252422] dark:text-[#FFFCF2] truncate">
                        {aiConfig?.model || aiStatus?.model || 'claude-sonnet-5'}
                      </div>
                      <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-sans mt-0.5 block">
                        Anthropic Sonnet
                      </span>
                    </div>

                    <div className="bg-[#F9F7F1] dark:bg-[#1c1b1a] border border-[#E2DBD0] dark:border-[#403D39] p-3.5 rounded-xl">
                      <span className="block text-[11px] font-semibold text-[#5A554E] dark:text-[#CCC5B9] mb-1 font-sans">
                        Endpoint Base
                      </span>
                      <div className="font-mono text-xs font-bold text-[#252422] dark:text-[#FFFCF2] truncate">
                        {aiConfig?.baseUrl || 'https://ghostcli.cloud'}
                      </div>
                      <span className="text-[10px] text-[#5A554E]/70 dark:text-[#CCC5B9]/70 font-sans mt-0.5 block">
                        Proxy GhostCLI
                      </span>
                    </div>

                    <div className="bg-[#F9F7F1] dark:bg-[#1c1b1a] border border-[#E2DBD0] dark:border-[#403D39] p-3.5 rounded-xl">
                      <span className="block text-[11px] font-semibold text-[#5A554E] dark:text-[#CCC5B9] mb-1 font-sans">
                        Chave de API
                      </span>
                      <div className="font-mono text-xs font-bold text-[#252422] dark:text-[#FFFCF2] truncate">
                        {aiConfig?.maskedKey || 'gcli_***HiWr'}
                      </div>
                      <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-sans mt-0.5 block">
                        Autenticado
                      </span>
                    </div>
                  </div>
                </div>

                {/* Doop Process Control in Settings */}
                <div className="border-t border-[#E2DBD0] dark:border-[#403D39] pt-5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h4 className="font-heading font-bold text-xs text-[#252422] dark:text-[#FFFCF2] flex items-center gap-1.5">
                        <LayoutTemplate className="w-3.5 h-3.5 text-[#EB5E28]" />
                        <span>Processo Gerenciado: Doop Design Canvas</span>
                      </h4>
                      <p className="text-[11px] text-[#5A554E] dark:text-[#CCC5B9] mt-0.5 font-sans">
                        Controle da execução de <code className="text-[#252422] dark:text-[#FFFCF2] font-semibold">bun run dev</code> na pasta <code className="text-[#252422] dark:text-[#FFFCF2] font-semibold">doop/</code>.
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        onClick={handleStartDoop}
                        disabled={loading || doopProcStatus.running}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 active:scale-[0.98] transition-colors duration-150 cursor-pointer ${
                          doopProcStatus.running
                            ? 'bg-[#F2ECE1] dark:bg-[#33302d] text-[#5A554E]/50 dark:text-[#CCC5B9]/50 cursor-not-allowed'
                            : 'bg-emerald-600 text-white'
                        }`}
                      >
                        <Play className="w-3.5 h-3.5" />
                        <span>Iniciar Doop</span>
                      </button>
                      <button
                        onClick={handleRestartDoop}
                        disabled={loading}
                        className="px-3 py-1.5 rounded-xl bg-[#F2ECE1] hover:bg-[#E6DFD3] dark:bg-[#33302d] dark:hover:bg-[#403D39] text-[#252422] dark:text-[#FFFCF2] border border-[#E2DBD0] dark:border-[#403D39] text-xs font-semibold flex items-center gap-1.5 active:scale-[0.98] transition-colors duration-150 cursor-pointer"
                      >
                        <RotateCw className="w-3.5 h-3.5" />
                        <span>Reiniciar</span>
                      </button>
                      <button
                        onClick={handleStopDoop}
                        disabled={loading || !doopProcStatus.running}
                        className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold flex items-center gap-1.5 active:scale-[0.98] transition-colors duration-150 cursor-pointer"
                      >
                        <Square className="w-3.5 h-3.5" />
                        <span>Parar</span>
                      </button>
                      <button
                        onClick={handleOpenDoopLogs}
                        className="px-3 py-1.5 rounded-xl bg-[#F2ECE1] hover:bg-[#E6DFD3] dark:bg-[#33302d] dark:hover:bg-[#403D39] text-[#5A554E] hover:text-[#252422] dark:text-[#CCC5B9] dark:hover:text-[#FFFCF2] border border-[#E2DBD0] dark:border-[#403D39] text-xs font-semibold flex items-center gap-1.5 active:scale-[0.98] transition-colors duration-150 cursor-pointer"
                      >
                        <Terminal className="w-3.5 h-3.5" />
                        <span>Logs</span>
                      </button>
                      <a
                        href="http://localhost:4300/c/9AvMi5_xuu"
                        target="_blank"
                        rel="noreferrer"
                        className="px-3 py-1.5 rounded-xl bg-[#EB5E28]/10 hover:bg-[#EB5E28]/20 dark:bg-[#EB5E28]/15 dark:hover:bg-[#EB5E28]/25 text-[#EB5E28] border border-[#EB5E28]/30 text-xs font-semibold flex items-center gap-1.5 active:scale-[0.98] transition-colors duration-150"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>Abrir Canvas Torra 31</span>
                      </a>
                    </div>
                  </div>
                </div>

                {/* Diagnostic Box */}
                <div className="border-t border-[#E2DBD0] dark:border-[#403D39] pt-5">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-heading font-bold text-xs text-[#252422] dark:text-[#FFFCF2] flex items-center gap-1.5">
                      <Activity className="w-3.5 h-3.5 text-[#EB5E28]" />
                      <span>Diagnóstico de Ambiente & Repositórios</span>
                    </h4>
                    <button
                      onClick={() => {
                        const diag = `Node: v22.19.0\nBun: v1.4.4\nSQLite: node:sqlite\nModo: ${mode}\nTema: ${theme}\nDoop: ${doopProcStatus.running ? 'Ativo' : 'Parado'}`;
                        copyToClipboard(diag, 'Diagnóstico');
                      }}
                      className="text-xs text-[#5A554E] dark:text-[#CCC5B9] hover:text-[#252422] dark:hover:text-[#FFFCF2] flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      {copiedField === 'Diagnóstico' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>Copiar Diagnóstico</span>
                    </button>
                  </div>
                  <div className="bg-[#F9F7F1] dark:bg-[#1c1b1a] border border-[#E2DBD0] dark:border-[#403D39] rounded-xl p-4 space-y-2.5 text-xs font-mono text-[#5A554E] dark:text-[#CCC5B9]">
                    <div className="flex justify-between">
                      <span className="text-[#5A554E]/70 dark:text-[#CCC5B9]/70">Node.js Host:</span>
                      <span className="text-emerald-600 dark:text-emerald-400">v22.19.0 (Compatível)</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#5A554E]/70 dark:text-[#CCC5B9]/70">Bun Runtime:</span>
                      <span className="text-emerald-600 dark:text-emerald-400">v1.4.4 (C:\Users\Win 10\.bun\bin\bun.exe)</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#5A554E]/70 dark:text-[#CCC5B9]/70">SQLite Nativo:</span>
                      <span className="text-emerald-600 dark:text-emerald-400">node:sqlite (Ativo em data/operacao.sqlite)</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#5A554E]/70 dark:text-[#CCC5B9]/70">google-maps-scraper-kit:</span>
                      <span className="text-emerald-600 dark:text-emerald-400">Git Independente • CSVs Detectados em out/</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#5A554E]/70 dark:text-[#CCC5B9]/70">OpenWA Gateway:</span>
                      <span className="text-emerald-600 dark:text-emerald-400">Git Independente • Sessão Baileys em disco</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#5A554E]/70 dark:text-[#CCC5B9]/70">Doop Design:</span>
                      <span className="text-emerald-600 dark:text-emerald-400">
                        {doopProcStatus.running ? `Gerenciado pela Central (PID ${doopProcStatus.pid})` : 'Disponível via "bun run dev"'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Doop Logs Modal */}
      {showDoopLogs && (
        <div 
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setShowDoopLogs(false)}
        >
          <div 
            className="bg-white dark:bg-[#252422] border border-[#E2DBD0] dark:border-[#403D39] rounded-2xl w-full max-w-3xl overflow-hidden shadow-lg border border-[#E2DBD0] dark:border-[#403D39] flex flex-col max-h-[80vh] animate-modal-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-5 py-3.5 bg-[#F9F7F1] dark:bg-[#1c1b1a] border-b border-[#E2DBD0] dark:border-[#403D39] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <h3 className="font-heading font-bold text-xs text-[#252422] dark:text-[#FFFCF2]">Console de Logs: Doop (bun run dev)</h3>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-[#5A554E] dark:text-[#CCC5B9] hidden sm:inline">ESC para fechar</span>
                <button
                  onClick={() => setShowDoopLogs(false)}
                  className="p-1 rounded-lg text-[#5A554E] hover:text-[#252422] dark:text-[#CCC5B9] dark:hover:text-[#FFFCF2] transition-colors cursor-pointer"
                  aria-label="Fechar logs"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="p-4 overflow-y-auto flex-1 font-mono text-xs text-zinc-300 dark:text-[#CCC5B9] space-y-1 bg-[#121110]">
              {doopLogs.length === 0 ? (
                <div className="text-zinc-500">Nenhum log registrado ainda.</div>
              ) : (
                doopLogs.map((log, i) => (
                  <div key={i} className="leading-relaxed">
                    {log}
                  </div>
                ))
              )}
            </div>
            <div className="px-5 py-3 bg-[#F9F7F1] dark:bg-[#1c1b1a] border-t border-[#E2DBD0] dark:border-[#403D39] flex items-center justify-between">
              <button
                onClick={() => copyToClipboard(doopLogs.join('\n'), 'Logs do Doop')}
                className="text-xs text-[#5A554E] dark:text-[#CCC5B9] hover:text-[#252422] dark:hover:text-[#FFFCF2] flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>Copiar todos os logs</span>
              </button>
              <button
                onClick={() => setShowDoopLogs(false)}
                className="px-4 py-1.5 rounded-xl bg-[#F2ECE1] dark:bg-[#33302d] text-[#252422] dark:text-[#FFFCF2] text-xs font-semibold hover:bg-[#E6DFD3] dark:hover:bg-[#403D39] border border-[#E2DBD0] dark:border-[#403D39] transition-colors cursor-pointer active:scale-[0.98]"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Detalhes do Estabelecimento e Avaliações Reais */}
      {detailModalLead && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-fade-in"
          onClick={() => setDetailModalLead(null)}
        >
          <div
            className="bg-white dark:bg-[#252422] border border-[#E2DBD0] dark:border-[#403D39] rounded-2xl max-w-2xl w-full shadow-lg border border-[#E2DBD0] dark:border-[#403D39] overflow-hidden text-left my-8 animate-modal-in"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-6 border-b border-[#E2DBD0] dark:border-[#403D39] bg-[#F9F7F1] dark:bg-[#1c1b1a] flex items-start justify-between gap-4">
              <div className="flex items-start gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-[#EB5E28] text-[#FFFCF2] font-heading font-bold text-xl flex items-center justify-center shrink-0 border border-[#EB5E28]/40 shadow-sm shadow-[#EB5E28]/25 overflow-hidden">
                  {detailModalLead.logoUrl ? (
                    <img
                      src={detailModalLead.logoUrl}
                      alt={detailModalLead.name}
                      width={48}
                      height={48}
                      loading="lazy"
                      decoding="async"
                      className="w-full h-full object-cover"
                    />
                  ) : detailModalLead.thumbnailUrl ? (
                    <img
                      src={detailModalLead.thumbnailUrl}
                      alt={detailModalLead.name}
                      width={48}
                      height={48}
                      loading="lazy"
                      decoding="async"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    detailModalLead.name.charAt(0).toUpperCase()
                  )}
                </div>
                <div>
                  <h3 className="text-xl font-heading font-bold text-[#252422] dark:text-[#FFFCF2] tracking-tight leading-tight">
                    {detailModalLead.name}
                  </h3>
                  <div className="flex flex-wrap items-center gap-2 mt-1.5 text-xs text-[#5A554E] dark:text-[#CCC5B9] font-sans">
                    <span className="px-2.5 py-0.5 rounded-full bg-[#F2ECE1] dark:bg-[#33302d] border border-[#E2DBD0] dark:border-[#403D39] text-[#252422] dark:text-[#FFFCF2] font-medium">
                      {detailModalLead.category || 'Comércio Local'}
                    </span>
                    <span className="flex items-center gap-1 text-[#5A554E] dark:text-[#CCC5B9]">
                      <MapPin className="w-3.5 h-3.5 text-[#5A554E]/70 dark:text-[#CCC5B9]/70" />
                      {detailModalLead.city || 'RMBH'}
                    </span>
                    {detailModalLead.rating && (
                      <span className="text-amber-700 dark:text-amber-400 font-semibold flex items-center gap-1 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                        <Star className="w-3 h-3 fill-amber-500 text-amber-500 dark:fill-amber-400 dark:text-amber-400" />
                        <span>{parseFloat(detailModalLead.rating).toFixed(1)}</span>
                        <span className="text-[#5A554E] dark:text-[#CCC5B9] font-normal">({detailModalLead.reviewsCount || 0} avaliações)</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-[#5A554E] dark:text-[#CCC5B9] hidden sm:inline">ESC para fechar</span>
                <button
                  onClick={() => setDetailModalLead(null)}
                  className="text-[#5A554E] dark:text-[#CCC5B9] hover:text-[#252422] dark:hover:text-[#FFFCF2] p-2 rounded-xl hover:bg-[#F2ECE1] dark:hover:bg-[#33302d] transition-colors cursor-pointer"
                  title="Fechar modal"
                  aria-label="Fechar modal"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
              {/* Presença Digital & Contato Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {/* Card 1: Presença Digital */}
                <div className="p-4 rounded-2xl bg-[#F9F7F1] dark:bg-[#1c1b1a] border border-[#E2DBD0] dark:border-[#403D39] space-y-2">
                  <div className="text-[11px] font-heading font-medium text-[#5A554E] dark:text-[#CCC5B9] flex items-center gap-1.5">
                    <Globe className="w-3.5 h-3.5 text-[#EB5E28]" />
                    Diagnóstico de Presença
                  </div>
                  <div>
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${
                        detailModalLead.pitchType === 'no_site'
                          ? 'bg-rose-500/10 dark:bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/25 dark:border-rose-500/30'
                          : detailModalLead.pitchType === 'offline_site'
                          ? 'bg-amber-500/10 dark:bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/25 dark:border-amber-500/30'
                          : detailModalLead.pitchType === 'whatsapp_site'
                          ? 'bg-emerald-500/10 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/25 dark:border-emerald-500/30'
                          : detailModalLead.pitchType === 'social_site'
                          ? 'bg-sky-500/10 dark:bg-sky-500/15 text-sky-700 dark:text-sky-300 border-sky-500/25 dark:border-sky-500/30'
                          : detailModalLead.pitchType === 'bio_site'
                          ? 'bg-purple-500/10 dark:bg-purple-500/15 text-purple-700 dark:text-purple-300 border-purple-500/25 dark:border-purple-500/30'
                          : detailModalLead.pitchType === 'google_sites'
                          ? 'bg-indigo-500/10 dark:bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 border-indigo-500/25 dark:border-indigo-500/30'
                          : 'bg-white dark:bg-[#252422] text-[#5A554E] dark:text-[#CCC5B9] border-[#E2DBD0] dark:border-[#403D39]'
                      }`}
                    >
                      {detailModalLead.pitchType === 'no_site' && <Flame className="w-3.5 h-3.5 text-rose-500 dark:text-rose-400" />}
                      {detailModalLead.pitchType === 'offline_site' && <AlertTriangle className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" />}
                      {detailModalLead.pitchType === 'whatsapp_site' && <MessageSquare className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400" />}
                      {detailModalLead.pitchType === 'social_site' && <Share2 className="w-3.5 h-3.5 text-sky-500 dark:text-sky-400" />}
                      {detailModalLead.pitchType === 'bio_site' && <Link2 className="w-3.5 h-3.5 text-purple-500 dark:text-purple-400" />}
                      {detailModalLead.pitchType === 'google_sites' && <Globe className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />}
                      {detailModalLead.pitchType === 'active_site' && <CheckCircle2 className="w-3.5 h-3.5 text-[#5A554E] dark:text-[#CCC5B9]" />}
                      <span>
                        {detailModalLead.pitchType === 'no_site' && 'Sem Site Cadastrado'}
                        {detailModalLead.pitchType === 'offline_site' && 'Site Fora do Ar'}
                        {detailModalLead.pitchType === 'whatsapp_site' && 'Usa Apenas WhatsApp'}
                        {detailModalLead.pitchType === 'social_site' && 'Rede Social'}
                        {detailModalLead.pitchType === 'bio_site' && 'Link de Bio'}
                        {detailModalLead.pitchType === 'google_sites' && 'Google Sites (Oportunidade de Upgrade)'}
                        {detailModalLead.pitchType === 'active_site' && 'Site Ativo'}
                      </span>
                    </span>
                  </div>
                  {detailModalLead.siteAuditReason && (
                    <p className="text-xs text-[#5A554E] dark:text-[#CCC5B9] leading-relaxed font-sans">
                      {detailModalLead.siteAuditReason}
                    </p>
                  )}
                  {detailModalLead.website && (
                    <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-t border-[#E2DBD0]/60 dark:border-[#403D39]/50">
                      <a
                        href={detailModalLead.website.startsWith('http') ? detailModalLead.website : `https://${detailModalLead.website}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#EB5E28] hover:text-[#d8521d] flex items-center gap-1.5 truncate font-medium text-xs max-w-full sm:max-w-[220px]"
                      >
                        <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate">{detailModalLead.website}</span>
                      </a>
                      <button
                        onClick={() => handleRevalidateLeadSite(detailModalLead.id)}
                        disabled={isValidatingSite}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-800 dark:text-amber-200 border border-amber-500/30 text-xs font-semibold transition-colors active:scale-[0.98] cursor-pointer disabled:opacity-50 shrink-0 self-start sm:self-auto"
                      >
                        <RefreshCw className={`w-3 h-3 ${isValidatingSite ? 'animate-spin' : ''}`} />
                        <span>{isValidatingSite ? 'Verificando...' : 'Revalidar Site'}</span>
                      </button>
                    </div>
                  )}
                </div>

                {/* Card 2: Contato & Localização */}
                <div className="p-4 rounded-2xl bg-[#F9F7F1] dark:bg-[#1c1b1a] border border-[#E2DBD0] dark:border-[#403D39] space-y-2">
                  <div className="text-[11px] font-heading font-medium text-[#5A554E] dark:text-[#CCC5B9] flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    Contato & Endereço
                  </div>
                  <div className="flex items-center justify-between text-xs bg-white dark:bg-[#252422] p-2.5 rounded-xl border border-[#E2DBD0] dark:border-[#403D39]">
                    <span className="font-mono text-[#252422] dark:text-[#FFFCF2]">
                      {detailModalLead.phoneNorm || detailModalLead.phoneRaw || 'Telefone não disponível'}
                    </span>
                    {(detailModalLead.phoneNorm || detailModalLead.phoneRaw) && (
                      <button
                        onClick={() => copyToClipboard(detailModalLead.phoneNorm || detailModalLead.phoneRaw, `Telefone de ${detailModalLead.name}`)}
                        className="text-[#5A554E] dark:text-[#CCC5B9] hover:text-[#252422] dark:hover:text-[#FFFCF2] p-1 rounded hover:bg-[#F2ECE1] dark:hover:bg-[#33302d] transition-colors cursor-pointer"
                        title="Copiar telefone"
                        aria-label="Copiar telefone"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                  {detailModalLead.address && (
                    <p className="text-xs text-[#5A554E] dark:text-[#CCC5B9] leading-relaxed flex items-start gap-1.5 pt-1 font-sans">
                      <MapPin className="w-3.5 h-3.5 text-[#5A554E]/70 dark:text-[#CCC5B9]/70 shrink-0 mt-0.5" />
                      <span>{detailModalLead.address}</span>
                    </p>
                  )}
                </div>
              </div>

              {/* Imagens Reais do Estabelecimento */}
              {(() => {
                const photosList = parseLeadPhotos(detailModalLead.photos);
                const hasImages = Boolean(detailModalLead.thumbnailUrl || detailModalLead.logoUrl || photosList.length > 0 || (detailModalLead.latitude && detailModalLead.longitude));

                return (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Camera className="w-4 h-4 text-[#EB5E28]" />
                        <h4 className="text-sm font-heading font-bold text-[#252422] dark:text-[#FFFCF2] tracking-tight">
                          Imagens Reais do Estabelecimento
                        </h4>
                      </div>
                      {hasImages && (
                        <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20 font-semibold flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                          {photosList.length + (detailModalLead.thumbnailUrl ? 1 : 0)} fotos capturadas
                        </span>
                      )}
                    </div>

                    {!hasImages ? (
                      <div className="p-5 rounded-2xl bg-[#F9F7F1] dark:bg-[#1c1b1a] border border-dashed border-[#E2DBD0] dark:border-[#403D39] text-center space-y-1.5">
                        <ImageIcon className="w-7 h-7 text-[#5A554E]/60 dark:text-[#CCC5B9]/60 mx-auto" />
                        <div className="text-xs text-[#252422] dark:text-[#FFFCF2] font-medium font-sans">
                          Nenhuma foto oficial extraída no momento da coleta.
                        </div>
                        <p className="text-[11px] text-[#5A554E] dark:text-[#CCC5B9] max-w-md mx-auto font-sans">
                          Ao compilar o protótipo, a Central aplicará automaticamente imagens de estúdio em alta definição correspondentes ao segmento.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-xs text-[#252422] dark:text-[#FFFCF2] flex items-center gap-2 font-sans">
                          <Camera className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                          <span>Fotos reais são injetadas diretamente na vitrine, capa do site e cards de serviço do protótipo.</span>
                        </div>

                        {/* Foto de Capa (Thumbnail) */}
                        {detailModalLead.thumbnailUrl && (
                          <div className="relative rounded-2xl overflow-hidden border border-[#E2DBD0] dark:border-[#403D39] h-48 sm:h-56 bg-zinc-900 group shadow-sm">
                            <img
                              src={detailModalLead.thumbnailUrl}
                              alt={detailModalLead.name}
                              loading="lazy"
                              decoding="async"
                              className="w-full h-full object-cover transition-opacity duration-200"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                            <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs text-white">
                              <span className="font-semibold flex items-center gap-1.5 bg-black/60 px-2.5 py-1 rounded-lg backdrop-blur-sm">
                                <Camera className="w-3.5 h-3.5 text-amber-400" />
                                Foto de Capa Oficial (Google Maps)
                              </span>
                              {detailModalLead.logoUrl && (
                                <span className="font-semibold flex items-center gap-1.5 bg-emerald-600/80 px-2.5 py-1 rounded-lg backdrop-blur-sm">
                                  <Check className="w-3.5 h-3.5" />
                                  Logo WhatsApp Sincronizada
                                </span>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Galeria de Fotos */}
                        {photosList.length > 0 && (
                          <div className="space-y-1.5">
                            <div className="text-[11px] font-heading font-medium text-[#5A554E] dark:text-[#CCC5B9]">
                              Galeria de Procedimentos & Ambiente ({photosList.length})
                            </div>
                            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                              {photosList.slice(0, 8).map((photoUrl, pIdx) => (
                                <a
                                  key={pIdx}
                                  href={photoUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="relative rounded-xl overflow-hidden border border-[#E2DBD0] dark:border-[#403D39] h-20 bg-zinc-900 group hover:border-[#EB5E28] transition-colors"
                                  title="Ver foto em alta resolução"
                                >
                                  <img
                                    src={photoUrl}
                                    alt={`Foto ${pIdx + 1} de ${detailModalLead.name}`}
                                    loading="lazy"
                                    decoding="async"
                                    className="w-full h-full object-cover transition-opacity duration-200"
                                  />
                                  <div className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded bg-black/70 text-[9px] font-bold text-white backdrop-blur-sm">
                                    #{pIdx + 1}
                                  </div>
                                </a>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Fachada / Street View se houver coordenadas */}
                        {detailModalLead.latitude && detailModalLead.longitude && (
                          <div className="p-3 rounded-xl bg-[#F9F7F1] dark:bg-[#1c1b1a] border border-[#E2DBD0] dark:border-[#403D39] flex items-center justify-between text-xs">
                            <div className="flex items-center gap-2">
                              <MapPin className="w-4 h-4 text-amber-500 shrink-0" />
                              <span className="text-[#5A554E] dark:text-[#CCC5B9]">
                                Coordenadas GPS: <strong className="text-[#252422] dark:text-[#FFFCF2] font-mono">{Number(detailModalLead.latitude).toFixed(4)}, {Number(detailModalLead.longitude).toFixed(4)}</strong>
                              </span>
                            </div>
                            <a
                              href={`https://maps.google.com/maps?q=&layer=c&cbll=${detailModalLead.latitude},${detailModalLead.longitude}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[#EB5E28] hover:text-[#d8521d] font-semibold flex items-center gap-1 transition-colors"
                            >
                              <span>Ver Fachada no Street View</span>
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })()}

              {/* Avaliações Reais do Google */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Star className="w-4 h-4 fill-amber-500 text-amber-500 dark:fill-amber-400 dark:text-amber-400" />
                    <h4 className="text-sm font-heading font-bold text-[#252422] dark:text-[#FFFCF2] tracking-tight">
                      Avaliações e Comentários Reais (Google Maps)
                    </h4>
                  </div>
                  {parseLeadReviews(detailModalLead.userReviews).length > 0 && (
                    <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                      {parseLeadReviews(detailModalLead.userReviews).length} comentários disponíveis
                    </span>
                  )}
                </div>

                {parseLeadReviews(detailModalLead.userReviews).length === 0 ? (
                  <div className="p-6 rounded-2xl bg-[#F9F7F1] dark:bg-[#1c1b1a] border border-dashed border-[#E2DBD0] dark:border-[#403D39] text-center space-y-2">
                    <Info className="w-8 h-8 text-[#5A554E]/60 dark:text-[#CCC5B9]/60 mx-auto" />
                    <div className="text-xs text-[#252422] dark:text-[#FFFCF2] font-medium font-sans">
                      Nenhum comentário em texto extraído para este estabelecimento.
                    </div>
                    <p className="text-[11px] text-[#5A554E] dark:text-[#CCC5B9] max-w-md mx-auto font-sans">
                      O comércio pode possuir apenas notas numéricas por estrelas ou a coleta rápida priorizou dados cadastrais. Ao gerar o protótipo, depoimentos contextuais padrão serão utilizados.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="p-3 rounded-xl bg-[#EB5E28]/10 border border-[#EB5E28]/30 text-xs text-[#252422] dark:text-[#FFFCF2] flex items-center gap-2 font-sans">
                      <MessageSquareQuote className="w-4 h-4 text-[#EB5E28] shrink-0" />
                      <span>Estes comentários reais são injetados automaticamente na seção de depoimentos do protótipo gerado.</span>
                    </div>

                    <div className="grid grid-cols-1 gap-2.5">
                      {parseLeadReviews(detailModalLead.userReviews).map((review, idx) => (
                        <div
                          key={idx}
                          className="p-4 rounded-2xl bg-[#F9F7F1] dark:bg-[#1c1b1a] border border-[#E2DBD0] dark:border-[#403D39] space-y-2 hover:border-[#CCC5B9] dark:hover:border-[#57524d] transition-colors duration-150"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className="w-7 h-7 rounded-full overflow-hidden bg-[#F2ECE1] dark:bg-[#33302d] text-[#252422] dark:text-[#FFFCF2] text-xs font-heading font-bold flex items-center justify-center border border-[#E2DBD0] dark:border-[#403D39] shrink-0">
                                {review.avatar ? (
                                  <img
                                    src={review.avatar}
                                    alt={review.author}
                                    width={28}
                                    height={28}
                                    loading="lazy"
                                    decoding="async"
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                      (e.target as HTMLElement).style.display = 'none';
                                    }}
                                  />
                                ) : (
                                  review.author.charAt(0).toUpperCase()
                                )}
                              </div>
                              <span className="text-xs font-heading font-semibold text-[#252422] dark:text-[#FFFCF2]">
                                {review.author}
                              </span>
                              {review.time && (
                                <span className="text-[10px] text-[#5A554E] dark:text-[#CCC5B9]">
                                  • {review.time}
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-0.5">
                              {Array.from({ length: 5 }).map((_, s) => (
                                <Star
                                  key={s}
                                  className={`w-3 h-3 ${
                                    s < review.rating
                                      ? 'fill-amber-500 text-amber-500 dark:fill-amber-400 dark:text-amber-400'
                                      : 'text-[#E2DBD0] dark:text-[#403D39]'
                                  }`}
                                />
                              ))}
                            </div>
                          </div>
                          <p className="text-xs text-[#252422] dark:text-[#FFFCF2] leading-relaxed italic bg-white dark:bg-[#252422] p-2.5 rounded-xl border border-[#E2DBD0] dark:border-[#403D39] font-sans">
                            "{review.text}"
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer Actions */}
            <div className="p-5 border-t border-[#E2DBD0] dark:border-[#403D39] bg-[#F9F7F1] dark:bg-[#1c1b1a] flex flex-wrap items-center justify-between gap-3">
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                  detailModalLead.name + ' ' + (detailModalLead.address || detailModalLead.city)
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3.5 py-2 rounded-xl bg-[#F2ECE1] hover:bg-[#E6DFD3] dark:bg-[#33302d] dark:hover:bg-[#403D39] text-[#252422] dark:text-[#FFFCF2] border border-[#E2DBD0] dark:border-[#403D39] text-xs font-semibold transition-colors duration-150 flex items-center gap-1.5 active:scale-[0.98] whitespace-nowrap"
              >
                <Map className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                <span>Ver no Google Maps</span>
              </a>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    const target = detailModalLead;
                    setActiveCopilotLead(target);
                    setAiDrawerOpen(true);
                  }}
                  className="px-3.5 py-2 rounded-xl bg-[#EB5E28]/15 hover:bg-[#EB5E28]/25 text-[#EB5E28] border border-[#EB5E28]/40 text-xs font-semibold transition-colors duration-150 flex items-center gap-1.5 active:scale-[0.98] cursor-pointer whitespace-nowrap shrink-0"
                  title="Diagnóstico estratégico com Claude Sonnet"
                >
                  <Bot className="w-3.5 h-3.5" />
                  <span>Diagnóstico Claude Sonnet</span>
                </button>

                <button
                  onClick={() => {
                    const target = detailModalLead;
                    setDetailModalLead(null);
                    openEditModal(target);
                  }}
                  className="px-3.5 py-2 rounded-xl bg-[#F2ECE1] hover:bg-[#E6DFD3] dark:bg-[#33302d] dark:hover:bg-[#403D39] text-[#252422] dark:text-[#FFFCF2] border border-[#E2DBD0] dark:border-[#403D39] text-xs font-semibold transition-colors duration-150 flex items-center gap-1.5 active:scale-[0.98] cursor-pointer whitespace-nowrap"
                >
                  <Pencil className="w-3.5 h-3.5 text-[#EB5E28]" />
                  <span>Editar Dados</span>
                </button>
                <button
                  onClick={() => {
                    const target = detailModalLead;
                    setDetailModalLead(null);
                    handlePrepareWhatsApp(target);
                  }}
                  className="px-4 py-2 rounded-xl bg-emerald-600/15 hover:bg-emerald-600/25 dark:bg-emerald-600/20 dark:hover:bg-emerald-600/30 text-emerald-800 dark:text-emerald-300 border border-emerald-500/40 font-semibold text-xs transition-colors duration-150 flex items-center gap-1.5 active:scale-[0.98] cursor-pointer"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Abordar no WhatsApp</span>
                </button>
                {detailModalLead.doopCanvasUrl || detailModalLead.doopCanvasId ? (
                  <a
                    href={detailModalLead.doopCanvasUrl || `http://localhost:4300/c/${detailModalLead.doopCanvasId}`}
                    target="_blank"
                    rel="noreferrer"
                    className="px-4 py-2 rounded-xl bg-emerald-600 text-[#FFFCF2] hover:bg-emerald-700 font-semibold text-xs transition-colors duration-150 flex items-center gap-1.5 active:scale-[0.98] cursor-pointer shadow-sm shadow-emerald-600/25"
                  >
                    <LayoutTemplate className="w-3.5 h-3.5" />
                    <span>Abrir Canvas no Doop (12 Pranchetas)</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                ) : (
                  <button
                    onClick={() => {
                      const target = detailModalLead;
                      setDetailModalLead(null);
                      handlePreparePrototype(target);
                    }}
                    className="px-4 py-2 rounded-xl bg-[#EB5E28] hover:bg-[#d8521d] text-[#FFFCF2] font-semibold text-xs transition-colors duration-150 flex items-center gap-1.5 active:scale-[0.98] cursor-pointer shadow-sm shadow-[#EB5E28]/25"
                  >
                    <LayoutTemplate className="w-3.5 h-3.5" />
                    <span>Criar Layout Único</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Edição de Informações do Comércio */}
      {editingLead && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-fade-in"
          onClick={closeEditModal}
        >
          <div
            className="bg-white dark:bg-[#252422] border border-[#E2DBD0] dark:border-[#403D39] rounded-2xl max-w-2xl w-full shadow-lg border border-[#E2DBD0] dark:border-[#403D39] overflow-hidden text-left my-8 animate-modal-in"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-6 border-b border-[#E2DBD0] dark:border-[#403D39] bg-[#F9F7F1] dark:bg-[#1c1b1a] flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#EB5E28]/15 text-[#EB5E28] flex items-center justify-center border border-[#EB5E28]/30">
                  <Pencil className="w-5 h-5 text-[#EB5E28]" />
                </div>
                <div>
                  <h3 className="text-lg font-heading font-bold text-[#252422] dark:text-[#FFFCF2] tracking-tight leading-tight">
                    Editar Informações do Comércio
                  </h3>
                  <p className="text-xs text-[#5A554E] dark:text-[#CCC5B9] mt-0.5 font-sans">
                    Atualize o WhatsApp, endereço, links ou anotações caso o número do Google tenha mudado.
                  </p>
                </div>
              </div>
              <button
                onClick={closeEditModal}
                className="text-[#5A554E] dark:text-[#CCC5B9] hover:text-[#252422] dark:hover:text-[#FFFCF2] p-2 rounded-xl hover:bg-[#F2ECE1] dark:hover:bg-[#33302d] transition-colors cursor-pointer"
                title="Fechar"
                aria-label="Fechar"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveLeadEdit}>
              <div className="p-6 space-y-4 max-h-[72vh] overflow-y-auto">
                {/* Destaque: Telefone / WhatsApp */}
                <div className="p-4 rounded-2xl bg-[#FAF8F5] dark:bg-[#1c1b1a] border-2 border-[#EB5E28]/30 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-[#252422] dark:text-[#FFFCF2] flex items-center gap-1.5 font-sans">
                      <Phone className="w-4 h-4 text-[#EB5E28]" />
                      <span>WhatsApp / Telefone Principal de Contato</span>
                    </label>
                    <span className="text-[10px] font-mono uppercase bg-[#EB5E28]/10 text-[#EB5E28] px-2 py-0.5 rounded font-semibold">
                      Disparo & Contato
                    </span>
                  </div>
                  <input
                    type="text"
                    value={editForm.phone}
                    onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                    placeholder="Ex: (31) 98765-4321 ou 5531987654321"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-[#252422] border border-[#E2DBD0] dark:border-[#403D39] text-xs font-mono text-[#252422] dark:text-[#FFFCF2] focus:outline-none focus:border-[#EB5E28]"
                  />
                  <p className="text-[11px] text-[#5A554E] dark:text-[#CCC5B9] leading-relaxed font-sans">
                    Este é o número que será utilizado para mensagens no WhatsApp e links diretos. Se o número listado no Google Maps era fixo ou não pertence mais à empresa, coloque aqui o WhatsApp direto.
                  </p>
                </div>

                {/* Nome & Categoria */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#5A554E] dark:text-[#CCC5B9] mb-1.5 font-sans">
                      Nome do Comércio / Empresa
                    </label>
                    <div className="relative">
                      <Building2 className="w-4 h-4 text-[#5A554E]/70 dark:text-[#CCC5B9]/70 absolute left-3 top-3" />
                      <input
                        type="text"
                        value={editForm.name}
                        onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                        required
                        className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#F9F7F1] dark:bg-[#1c1b1a] border border-[#E2DBD0] dark:border-[#403D39] text-xs text-[#252422] dark:text-[#FFFCF2] focus:outline-none focus:border-[#EB5E28]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#5A554E] dark:text-[#CCC5B9] mb-1.5 font-sans">
                      Categoria / Nicho
                    </label>
                    <input
                      type="text"
                      value={editForm.category}
                      onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                      placeholder="Ex: Salão de beleza, Oficina mecânica..."
                      className="w-full px-3 py-2 rounded-xl bg-[#F9F7F1] dark:bg-[#1c1b1a] border border-[#E2DBD0] dark:border-[#403D39] text-xs text-[#252422] dark:text-[#FFFCF2] focus:outline-none focus:border-[#EB5E28]"
                    />
                  </div>
                </div>

                {/* Cidade & Endereço */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#5A554E] dark:text-[#CCC5B9] mb-1.5 font-sans">
                      Cidade (RMBH)
                    </label>
                    <input
                      type="text"
                      value={editForm.city}
                      onChange={(e) => setEditForm({ ...editForm, city: e.target.value })}
                      placeholder="Ex: Belo Horizonte, Sabará..."
                      className="w-full px-3 py-2 rounded-xl bg-[#F9F7F1] dark:bg-[#1c1b1a] border border-[#E2DBD0] dark:border-[#403D39] text-xs text-[#252422] dark:text-[#FFFCF2] focus:outline-none focus:border-[#EB5E28]"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-[#5A554E] dark:text-[#CCC5B9] mb-1.5 font-sans">
                      Endereço Completo
                    </label>
                    <div className="relative">
                      <MapPin className="w-4 h-4 text-[#5A554E]/70 dark:text-[#CCC5B9]/70 absolute left-3 top-3" />
                      <input
                        type="text"
                        value={editForm.address}
                        onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                        placeholder="Rua, número, bairro..."
                        className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#F9F7F1] dark:bg-[#1c1b1a] border border-[#E2DBD0] dark:border-[#403D39] text-xs text-[#252422] dark:text-[#FFFCF2] focus:outline-none focus:border-[#EB5E28]"
                      />
                    </div>
                  </div>
                </div>

                {/* Site Atual & Diagnóstico (PitchType) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#5A554E] dark:text-[#CCC5B9] mb-1.5 font-sans">
                      Website / Link Atual
                    </label>
                    <div className="relative">
                      <Globe className="w-4 h-4 text-[#5A554E]/70 dark:text-[#CCC5B9]/70 absolute left-3 top-3" />
                      <input
                        type="text"
                        value={editForm.website}
                        onChange={(e) => setEditForm({ ...editForm, website: e.target.value })}
                        placeholder="https://... ou instagram.com/..."
                        className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#F9F7F1] dark:bg-[#1c1b1a] border border-[#E2DBD0] dark:border-[#403D39] text-xs text-[#252422] dark:text-[#FFFCF2] focus:outline-none focus:border-[#EB5E28]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#5A554E] dark:text-[#CCC5B9] mb-1.5 font-sans">
                      Diagnóstico de Presença
                    </label>
                    <select
                      value={editForm.pitchType}
                      onChange={(e) => setEditForm({ ...editForm, pitchType: e.target.value as any })}
                      className="w-full px-3 py-2 rounded-xl bg-[#F9F7F1] dark:bg-[#1c1b1a] border border-[#E2DBD0] dark:border-[#403D39] text-xs text-[#252422] dark:text-[#FFFCF2] focus:outline-none focus:border-[#EB5E28]"
                    >
                      <option value="no_site">Sem Site Cadastrado</option>
                      <option value="offline_site">Site Fora do Ar</option>
                      <option value="google_sites">Google Sites</option>
                      <option value="whatsapp_site">Direciona para WhatsApp</option>
                      <option value="social_site">Direciona para Rede Social</option>
                      <option value="bio_site">Link de Bio</option>
                      <option value="active_site">Site Ativo</option>
                    </select>
                  </div>
                </div>

                {/* Prioridade & Estágio do Funil */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#5A554E] dark:text-[#CCC5B9] mb-1.5 font-sans">
                      Prioridade
                    </label>
                    <select
                      value={editForm.priority}
                      onChange={(e) => setEditForm({ ...editForm, priority: e.target.value as any })}
                      className="w-full px-3 py-2 rounded-xl bg-[#F9F7F1] dark:bg-[#1c1b1a] border border-[#E2DBD0] dark:border-[#403D39] text-xs text-[#252422] dark:text-[#FFFCF2] focus:outline-none focus:border-[#EB5E28]"
                    >
                      <option value="baixa">Baixa</option>
                      <option value="media">Média</option>
                      <option value="alta">Alta</option>
                      <option value="urgente">Urgente</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#5A554E] dark:text-[#CCC5B9] mb-1.5 font-sans">
                      Estágio no Funil
                    </label>
                    <select
                      value={editForm.stage}
                      onChange={(e) => setEditForm({ ...editForm, stage: e.target.value as any })}
                      className="w-full px-3 py-2 rounded-xl bg-[#F9F7F1] dark:bg-[#1c1b1a] border border-[#E2DBD0] dark:border-[#403D39] text-xs text-[#252422] dark:text-[#FFFCF2] focus:outline-none focus:border-[#EB5E28]"
                    >
                      <option value="novo">Novo</option>
                      <option value="qualificado">Qualificado</option>
                      <option value="contato_pendente">Contato Pendente</option>
                      <option value="em_conversa">Em Conversa</option>
                      <option value="briefing_pendente">Briefing Pendente</option>
                      <option value="prototipo_em_preparo">Protótipo em Preparo</option>
                      <option value="prototipo_enviado">Protótipo Enviado</option>
                      <option value="proposta_enviada">Proposta Enviada</option>
                      <option value="ganho">Ganho (Fechado)</option>
                      <option value="perdido">Perdido</option>
                      <option value="descartado">Descartado</option>
                    </select>
                  </div>
                </div>

                {/* Anotações Internas / Histórico de Contato */}
                <div>
                  <label className="block text-xs font-semibold text-[#5A554E] dark:text-[#CCC5B9] mb-1.5 font-sans">
                    Anotações Internas & Histórico de Contato
                  </label>
                  <textarea
                    rows={3}
                    value={editForm.notes}
                    onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                    placeholder="Ex: Falar com Mariana no WhatsApp pessoal 99999-1234; dono pediu para retornar amanhã..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#F9F7F1] dark:bg-[#1c1b1a] border border-[#E2DBD0] dark:border-[#403D39] text-xs text-[#252422] dark:text-[#FFFCF2] leading-relaxed focus:outline-none focus:border-[#EB5E28] font-sans"
                  />
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-4 px-6 border-t border-[#E2DBD0] dark:border-[#403D39] bg-[#F9F7F1] dark:bg-[#1c1b1a] flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={closeEditModal}
                  disabled={isSavingLead}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-[#5A554E] dark:text-[#CCC5B9] hover:bg-[#E6DFD3] dark:hover:bg-[#33302d] transition-colors cursor-pointer whitespace-nowrap"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSavingLead}
                  className="px-5 py-2.5 rounded-xl bg-[#EB5E28] hover:bg-[#d8521d] text-[#FFFCF2] text-xs font-semibold flex items-center gap-2 shadow-sm shadow-[#EB5E28]/25 transition-colors cursor-pointer active:scale-95 disabled:opacity-50 whitespace-nowrap"
                >
                  {isSavingLead ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                  <span>Salvar Alterações</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Floating Claude Sonnet Copilot Trigger Button */}
      <button
        type="button"
        onClick={() => {
          if (selectedLead && !activeCopilotLead) {
            setActiveCopilotLead(selectedLead);
          }
          setAiDrawerOpen(prev => !prev);
        }}
        className="fixed bottom-6 right-6 z-40 px-3.5 py-2.5 rounded-2xl bg-[#EB5E28] hover:bg-[#d04f1f] text-white shadow-xl shadow-[#EB5E28]/35 flex items-center gap-2.5 transition-all duration-200 hover:scale-[1.03] active:scale-[0.97] cursor-pointer border border-white/20 whitespace-nowrap shrink-0 group"
        title="Abrir Claude Sonnet 5 Copilot"
        aria-label="Abrir Claude Copilot"
      >
        <div className="w-6 h-6 rounded-lg bg-white/20 flex items-center justify-center shrink-0">
          <Bot className="w-4 h-4 text-white group-hover:rotate-12 transition-transform duration-200" />
        </div>
        <div className="text-left hidden sm:block">
          <div className="text-xs font-bold leading-tight flex items-center gap-1.5">
            <span>Claude Copilot</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-pulse" />
          </div>
          <span className="text-[10px] text-white/80 block leading-tight font-sans">Sonnet 5 Ativo</span>
        </div>
      </button>

      {/* Claude Copilot Slide-in Drawer */}
      <AiCopilotDrawer
        isOpen={aiDrawerOpen}
        onClose={() => setAiDrawerOpen(false)}
        activeLead={activeCopilotLead || selectedLead}
        onClearActiveLead={() => setActiveCopilotLead(null)}
        onUsePitchInWhatsapp={(text) => {
          setWaMessage(text);
          setTab('whatsapp');
          setAiDrawerOpen(false);
          addToast('success', 'Texto Inserido no WhatsApp', 'Abordagem gerada pelo Claude Sonnet pronta para envio.');
        }}
      />

      {/* Modal de Configuração / Conexão com a Vercel */}
      {showVercelModal && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-fade-in"
          onClick={() => setShowVercelModal(false)}
        >
          <div
            className="bg-white dark:bg-[#252422] border border-[#E2DBD0] dark:border-[#403D39] rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden text-left my-8 animate-modal-in"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="p-6 border-b border-[#E2DBD0] dark:border-[#403D39] bg-[#F9F7F1] dark:bg-[#1c1b1a] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-black dark:bg-white text-white dark:text-black flex items-center justify-center">
                  <CloudUpload className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-heading font-bold text-sm text-[#252422] dark:text-[#FFFCF2]">
                    Conectar Hospedagem na Vercel
                  </h3>
                  <span className="text-[11px] text-[#5A554E] dark:text-[#CCC5B9]">
                    Publicação instantânea e link direto para celular
                  </span>
                </div>
              </div>
              <button
                onClick={() => setShowVercelModal(false)}
                className="p-1 rounded-lg text-[#5A554E] dark:text-[#CCC5B9] hover:text-[#252422] dark:hover:text-[#FFFCF2]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 space-y-4">
              {vercelConfigStatus?.valid && (
                <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-between text-xs font-sans">
                  <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-medium">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <span>Conta Vercel conectada:</span>
                    <span className="font-mono font-bold">@{vercelConfigStatus.user}</span>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-800 dark:text-emerald-200 font-semibold shrink-0">
                    Ativo
                  </span>
                </div>
              )}

              <div className="p-3.5 rounded-xl bg-[#EB5E28]/10 border border-[#EB5E28]/25 text-xs text-[#252422] dark:text-[#FFFCF2] space-y-1.5 font-sans">
                <div className="font-bold flex items-center gap-1.5 text-[#EB5E28]">
                  <Globe className="w-4 h-4" />
                  <span>Por que conectar à Vercel?</span>
                </div>
                <p className="text-[11px] text-[#5A554E] dark:text-[#CCC5B9] leading-relaxed">
                  Clientes e comerciantes no celular não conseguem acessar links locais (<code className="text-[#EB5E28]">localhost</code>). Ao conectar seu token gratuito da Vercel, o sistema compila o layout do Doop e publica um link ao vivo seguro (<code className="text-emerald-600">https://seu-comercio.vercel.app</code>) com 1 clique!
                </p>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-[#5A554E] dark:text-[#CCC5B9] font-sans">
                    Token Pessoal da Vercel (VERCEL_TOKEN)
                  </label>
                  <a
                    href="https://vercel.com/account/tokens"
                    target="_blank"
                    rel="noreferrer"
                    className="text-[11px] font-bold text-[#EB5E28] hover:underline flex items-center gap-1"
                  >
                    <span>Criar Token Grátis</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
                <input
                  type="password"
                  placeholder={
                    vercelConfigStatus?.hasToken
                      ? 'Token já configurado (digite para alterar ou atualizar)'
                      : 'Ex: vercel_tok_...'
                  }
                  value={vercelTokenInput}
                  onChange={(e) => setVercelTokenInput(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#F9F7F1] dark:bg-[#1c1b1a] border border-[#E2DBD0] dark:border-[#403D39] text-xs font-mono text-[#252422] dark:text-[#FFFCF2] focus:outline-none focus:border-[#EB5E28]"
                />
                <span className="text-[10px] text-[#5A554E] dark:text-[#CCC5B9] block mt-1">
                  O token é armazenado com segurança no banco local SQLite e nas variáveis de ambiente.
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#5A554E] dark:text-[#CCC5B9] mb-1.5 font-sans">
                  ID do Time / Team ID (Opcional)
                </label>
                <input
                  type="text"
                  placeholder="Opcional (se usar conta de equipe na Vercel)"
                  value={vercelTeamIdInput}
                  onChange={(e) => setVercelTeamIdInput(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#F9F7F1] dark:bg-[#1c1b1a] border border-[#E2DBD0] dark:border-[#403D39] text-xs text-[#252422] dark:text-[#FFFCF2] focus:outline-none focus:border-[#EB5E28]"
                />
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-[#E2DBD0] dark:border-[#403D39] bg-[#F9F7F1] dark:bg-[#1c1b1a] flex items-center justify-end gap-2.5">
              <button
                onClick={() => setShowVercelModal(false)}
                className="px-4 py-2 rounded-xl border border-[#E2DBD0] dark:border-[#403D39] text-xs font-semibold text-[#5A554E] dark:text-[#CCC5B9] hover:text-[#252422] dark:hover:text-[#FFFCF2] transition-colors"
              >
                {vercelConfigStatus?.valid ? 'Fechar' : 'Cancelar'}
              </button>
              <button
                onClick={handleSaveVercelConfig}
                disabled={loading || !vercelTokenInput.trim()}
                className="px-5 py-2 rounded-xl bg-[#EB5E28] hover:bg-[#d8521d] text-[#FFFCF2] font-heading font-bold text-xs transition-colors flex items-center gap-2 disabled:opacity-60 shadow-md shadow-[#EB5E28]/25 cursor-pointer"
              >
                {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                <span>Salvar Configuração</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Sonner-style Toast Notifications */}
      <div className="fixed bottom-22 right-6 z-50 flex flex-col gap-2 max-w-md w-full pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto p-4 rounded-xl border shadow-lg backdrop-blur-xl animate-toast-in flex items-start gap-3 transition-colors duration-150 ${
              toast.type === 'success'
                ? 'bg-white/95 dark:bg-[#252422]/95 border-emerald-500/40 text-emerald-800 dark:text-emerald-300'
                : toast.type === 'error'
                ? 'bg-white/95 dark:bg-[#252422]/95 border-rose-500/40 text-rose-800 dark:text-rose-300'
                : toast.type === 'warning'
                ? 'bg-white/95 dark:bg-[#252422]/95 border-amber-500/40 text-amber-800 dark:text-amber-300'
                : 'bg-white/95 dark:bg-[#252422]/95 border-[#EB5E28]/40 text-[#EB5E28]'
            }`}
          >
            <div className="shrink-0 mt-0.5">
              {toast.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />}
              {toast.type === 'error' && <XCircle className="w-4 h-4 text-rose-600 dark:text-rose-400" />}
              {toast.type === 'warning' && <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400" />}
              {toast.type === 'info' && <Info className="w-4 h-4 text-[#EB5E28]" />}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-heading font-bold text-[#252422] dark:text-[#FFFCF2]">{toast.title}</div>
              {toast.message && <div className="text-[11px] text-[#5A554E] dark:text-[#CCC5B9] mt-0.5 leading-normal font-sans">{toast.message}</div>}
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-[#5A554E] dark:text-[#CCC5B9] hover:text-[#252422] dark:hover:text-[#FFFCF2] p-0.5 transition-colors cursor-pointer"
              aria-label="Fechar notificação"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
