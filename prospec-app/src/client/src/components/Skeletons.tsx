import React from 'react';

/**
 * Skeleton placeholder row for the Leads Table.
 * Matches exact table dimensions and heights, eliminating Cumulative Layout Shift (CLS).
 */
export function SkeletonTableRow({ count = 5 }: { count?: number }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <tr
          key={`skel-row-${i}`}
          className="border-b border-[#E2DBD0]/60 dark:border-[#2d2b28]/60 animate-pulse"
        >
          {/* Coluna 1: Nome & Nicho */}
          <td className="py-3.5 px-4">
            <div className="flex items-start gap-2.5">
              <div className="w-8 h-8 rounded-lg skeleton-shimmer shrink-0" />
              <div className="space-y-1.5 flex-1 min-w-0">
                <div className="h-4 w-40 rounded skeleton-shimmer" />
                <div className="flex items-center gap-1.5">
                  <div className="h-3 w-16 rounded skeleton-shimmer" />
                  <div className="h-3 w-20 rounded skeleton-shimmer" />
                </div>
              </div>
            </div>
          </td>

          {/* Coluna 2: Cidade & Contato */}
          <td className="py-3.5 px-4 whitespace-nowrap">
            <div className="space-y-1.5">
              <div className="h-3.5 w-24 rounded skeleton-shimmer" />
              <div className="h-3 w-28 rounded skeleton-shimmer" />
            </div>
          </td>

          {/* Coluna 3: Tipo de Abordagem / Pitch */}
          <td className="py-3.5 px-4">
            <div className="h-6 w-28 rounded-full skeleton-shimmer" />
          </td>

          {/* Coluna 4: Status do Funil */}
          <td className="py-3.5 px-4 whitespace-nowrap">
            <div className="h-6 w-24 rounded-full skeleton-shimmer" />
          </td>

          {/* Coluna 5: Ações */}
          <td className="py-3.5 px-4 text-right">
            <div className="flex items-center justify-end gap-1.5">
              <div className="h-7 w-20 rounded-lg skeleton-shimmer" />
              <div className="h-7 w-7 rounded-lg skeleton-shimmer" />
            </div>
          </td>
        </tr>
      ))}
    </>
  );
}

/**
 * Skeleton card for Mobile / Responsive Leads view.
 */
export function SkeletonLeadCard({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={`skel-card-${i}`}
          className="p-4 rounded-2xl bg-white dark:bg-[#19191b] border border-black/[0.08] dark:border-white/[0.08] shadow-sm space-y-3 animate-pulse"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl skeleton-shimmer shrink-0" />
              <div className="space-y-1.5">
                <div className="h-4 w-36 rounded skeleton-shimmer" />
                <div className="h-3 w-24 rounded skeleton-shimmer" />
              </div>
            </div>
            <div className="h-5 w-16 rounded-full skeleton-shimmer" />
          </div>
          <div className="h-3.5 w-48 rounded skeleton-shimmer" />
          <div className="flex items-center justify-between pt-2 border-t border-black/[0.06] dark:border-white/[0.06]">
            <div className="h-7 w-24 rounded-lg skeleton-shimmer" />
            <div className="h-7 w-20 rounded-lg skeleton-shimmer" />
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * Skeleton Card for the Overview Dashboard Top Metrics.
 */
export function SkeletonStatCard({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={`skel-stat-${i}`}
          className="p-4 rounded-2xl bg-white dark:bg-[#19191b] border border-black/[0.08] dark:border-white/[0.08] shadow-sm space-y-2.5 animate-pulse"
        >
          <div className="flex items-center justify-between">
            <div className="h-3.5 w-20 rounded skeleton-shimmer" />
            <div className="w-7 h-7 rounded-lg skeleton-shimmer" />
          </div>
          <div className="h-7 w-16 rounded skeleton-shimmer" />
          <div className="h-3 w-28 rounded skeleton-shimmer" />
        </div>
      ))}
    </div>
  );
}

/**
 * Skeleton Item for WhatsApp Conversations sidebar.
 */
export function SkeletonConversationItem({ count = 4 }: { count?: number }) {
  return (
    <div className="space-y-1 p-2">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={`skel-conv-${i}`}
          className="p-3 rounded-xl flex items-start gap-3 bg-black/[0.02] dark:bg-white/[0.02] border border-transparent animate-pulse"
        >
          <div className="w-10 h-10 rounded-full skeleton-shimmer shrink-0" />
          <div className="flex-1 space-y-1.5 min-w-0">
            <div className="flex justify-between items-center">
              <div className="h-3.5 w-24 rounded skeleton-shimmer" />
              <div className="h-3 w-10 rounded skeleton-shimmer" />
            </div>
            <div className="h-3 w-40 rounded skeleton-shimmer" />
          </div>
        </div>
      ))}
    </div>
  );
}

