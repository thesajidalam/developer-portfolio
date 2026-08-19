'use client'

import { cn } from '@/lib/utils'

const tabs = [
  { id: 'overview', label: 'Overview' },
  { id: 'scores', label: 'Scores' },
  { id: 'preview', label: 'Preview' },
  { id: 'technical', label: 'Technical' },
  { id: 'health', label: 'Health' },
]

interface PortfolioTabsProps {
  activeTab: string
  onTabChange: (tab: string) => void
}

export function PortfolioTabs({ activeTab, onTabChange }: PortfolioTabsProps) {
  return (
    <nav className="-mb-px flex gap-1 overflow-x-auto" aria-label="Portfolio sections">
      {tabs.map(tab => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={cn(
            'relative whitespace-nowrap px-4 py-3 text-sm font-medium transition-colors',
            activeTab === tab.id
              ? 'text-amber-400'
              : 'text-zinc-500 hover:text-zinc-300'
          )}
          aria-current={activeTab === tab.id ? 'page' : undefined}
        >
          {tab.label}
          {activeTab === tab.id && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full bg-amber-500" />
          )}
        </button>
      ))}
    </nav>
  )
}
