'use client'

import { useState } from 'react'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { RankingList } from '@/components/comparison/ranking-list'

interface RankingEntry {
  rank: number
  id: string
  name: string
  slug: string
  title?: string | null
  avatarUrl?: string | null
  health: string
  featured: boolean
  verified: boolean
  experienceLevel: string
  technologies: string[]
  score: {
    overallScore: number
    performanceScore: number
    accessibilityScore: number
    seoScore: number
    bestPracticesScore: number
    designScore: number
    contentScore: number
  } | null
}

export function RankingTabs({ rankings }: { rankings: RankingEntry[] }) {
  const [activeTab, setActiveTab] = useState('overall')

  const sorted = [...rankings].sort((a, b) => {
    if (!a.score || !b.score) return 0
    switch (activeTab) {
      case 'performance':
        return b.score.performanceScore - a.score.performanceScore
      case 'accessibility':
        return b.score.accessibilityScore - a.score.accessibilityScore
      case 'seo':
        return b.score.seoScore - a.score.seoScore
      case 'design':
        return b.score.designScore - a.score.designScore
      default:
        return b.score.overallScore - a.score.overallScore
    }
  })

  return (
    <div>
      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
        <TabsList className="bg-zinc-900 border border-zinc-800">
          <TabsTrigger value="overall" className="data-[state=active]:bg-zinc-800 data-[state=active]:text-zinc-50">Overall</TabsTrigger>
          <TabsTrigger value="performance" className="data-[state=active]:bg-zinc-800 data-[state=active]:text-zinc-50">Performance</TabsTrigger>
          <TabsTrigger value="accessibility" className="data-[state=active]:bg-zinc-800 data-[state=active]:text-zinc-50">Accessibility</TabsTrigger>
          <TabsTrigger value="seo" className="data-[state=active]:bg-zinc-800 data-[state=active]:text-zinc-50">SEO</TabsTrigger>
          <TabsTrigger value="design" className="data-[state=active]:bg-zinc-800 data-[state=active]:text-zinc-50">Design</TabsTrigger>
        </TabsList>
      </Tabs>

      <RankingList
        rankings={sorted.map((entry, i) => ({
          ...entry,
          rank: i + 1,
        }))}
        scoreKey={
          activeTab === 'performance' ? 'performanceScore' :
          activeTab === 'accessibility' ? 'accessibilityScore' :
          activeTab === 'seo' ? 'seoScore' :
          activeTab === 'design' ? 'designScore' :
          'overallScore'
        }
      />
    </div>
  )
}
