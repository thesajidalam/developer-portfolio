import { Globe, Inbox, AlertTriangle, Vote } from 'lucide-react'
import { db } from '@/lib/db'
import { StatsCard } from '@/components/admin/stats-card'
import Link from 'next/link'
import { formatDate } from '@/lib/utils'

export default async function AdminDashboard() {
  const [totalPortfolios, pendingSubmissions, offlinePortfolios, recentVotes, recentActivity] =
    await Promise.all([
      db.portfolio.count(),
      db.submission.count({ where: { status: 'pending' } }),
      db.portfolio.count({ where: { health: 'offline' } }),
      db.vote.count({
        where: {
          createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
        },
      }),
      db.submission.findMany({
        orderBy: { createdAt: 'desc' },
        take: 8,
      }),
    ])

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-zinc-50">Dashboard</h1>
        <p className="mt-1 text-sm text-zinc-400">
          Overview of your platform activity
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          icon={Globe}
          label="Total Portfolios"
          value={totalPortfolios}
          color="blue"
        />
        <StatsCard
          icon={Inbox}
          label="Pending Submissions"
          value={pendingSubmissions}
          color="amber"
        />
        <StatsCard
          icon={AlertTriangle}
          label="Offline Portfolios"
          value={offlinePortfolios}
          color="red"
        />
        <StatsCard
          icon={Vote}
          label="Votes (7d)"
          value={recentVotes}
          color="emerald"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5">
          <h2 className="text-sm font-semibold text-zinc-100">Quick Actions</h2>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link
              href="/admin/submissions"
              className="rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-2 text-sm font-medium text-zinc-200 transition-colors hover:bg-zinc-700"
            >
              Review Pending ({pendingSubmissions})
            </Link>
            <Link
              href="/admin/portfolios?health=offline"
              className="rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-2 text-sm font-medium text-zinc-200 transition-colors hover:bg-zinc-700"
            >
              Check Offline ({offlinePortfolios})
            </Link>
            <Link
              href="/admin/portfolios"
              className="rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-2 text-sm font-medium text-zinc-200 transition-colors hover:bg-zinc-700"
            >
              Manage Portfolios
            </Link>
          </div>
        </div>

        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5">
          <h2 className="text-sm font-semibold text-zinc-100">Recent Activity</h2>
          <div className="mt-4 space-y-3">
            {recentActivity.length === 0 ? (
              <p className="text-sm text-zinc-500">No recent activity</p>
            ) : (
              recentActivity.map((sub) => (
                <div
                  key={sub.id}
                  className="flex items-center justify-between text-sm"
                >
                  <div className="min-w-0">
                    <p className="truncate text-zinc-300">{sub.portfolioUrl}</p>
                    <p className="text-xs text-zinc-500">
                      {sub.submitterName ?? 'Anonymous'} · {formatDate(sub.createdAt)}
                    </p>
                  </div>
                  <span
                    className={`ml-4 shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${
                      sub.status === 'pending'
                        ? 'bg-yellow-500/10 text-yellow-500'
                        : sub.status === 'completed'
                          ? 'bg-emerald-500/10 text-emerald-500'
                          : sub.status === 'failed'
                            ? 'bg-red-500/10 text-red-500'
                            : 'bg-blue-500/10 text-blue-500'
                    }`}
                  >
                    {sub.status}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
