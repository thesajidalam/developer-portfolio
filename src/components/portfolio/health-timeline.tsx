'use client'

import { Shield, Clock, Activity, CheckCircle2, XCircle } from 'lucide-react'
import { cn, formatDate } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface HealthCheckEntry {
  id: string
  checkedAt: Date
  statusCode: number
  responseTime: number
  sslValid: boolean
  sslExpiry?: Date | null
  accessible: boolean
  details?: string | null
}

interface HealthTimelineProps {
  healthChecks: HealthCheckEntry[]
}

function getStatusColor(statusCode: number) {
  if (statusCode < 300) return 'bg-emerald-500'
  if (statusCode < 400) return 'bg-yellow-500'
  if (statusCode < 500) return 'bg-orange-500'
  return 'bg-red-500'
}

function getStatusLabel(statusCode: number) {
  if (statusCode >= 200 && statusCode < 300) return 'OK'
  if (statusCode >= 300 && statusCode < 400) return 'Redirect'
  if (statusCode >= 400 && statusCode < 500) return 'Client Error'
  if (statusCode >= 500) return 'Server Error'
  return 'Unknown'
}

function getResponseTimeLabel(ms: number) {
  if (ms < 300) return 'Fast'
  if (ms < 1000) return 'Good'
  if (ms < 2000) return 'Moderate'
  return 'Slow'
}

function getResponseTimeColor(ms: number) {
  if (ms < 300) return 'text-emerald-400'
  if (ms < 1000) return 'text-yellow-400'
  if (ms < 2000) return 'text-orange-400'
  return 'text-red-400'
}

export function HealthTimeline({ healthChecks }: HealthTimelineProps) {
  const latestCheck = healthChecks[0]
  const validChecks = healthChecks.filter(hc => hc.statusCode < 400)
  const uptime = healthChecks.length > 0
    ? Math.round((validChecks.length / healthChecks.length) * 100)
    : 0

  return (
    <div className="space-y-6">
      {/* Summary cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="border-zinc-800 bg-zinc-900/50">
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10">
              <Activity className="h-5 w-5 text-emerald-400" />
            </div>
            <div>
              <p className="text-[10px] font-medium uppercase tracking-wider text-zinc-500">
                Uptime
              </p>
              <p className="text-lg font-bold tabular-nums text-zinc-100">{uptime}%</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-zinc-800 bg-zinc-900/50">
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/10">
              <Shield className="h-5 w-5 text-amber-400" />
            </div>
            <div>
              <p className="text-[10px] font-medium uppercase tracking-wider text-zinc-500">
                SSL Status
              </p>
              <p className={cn(
                'text-lg font-bold',
                latestCheck?.sslValid ? 'text-emerald-400' : 'text-red-400'
              )}>
                {latestCheck?.sslValid ? 'Valid' : 'N/A'}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-zinc-800 bg-zinc-900/50">
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-zinc-500/10">
              <Clock className="h-5 w-5 text-zinc-400" />
            </div>
            <div>
              <p className="text-[10px] font-medium uppercase tracking-wider text-zinc-500">
                Last Checked
              </p>
              <p className="text-sm font-medium text-zinc-200">
                {latestCheck ? formatDate(latestCheck.checkedAt) : 'Never'}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Timeline */}
      <Card className="border-zinc-800 bg-zinc-900/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm text-zinc-300">
            <Activity className="h-4 w-4 text-amber-500" />
            Health Check History
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          {healthChecks.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Activity className="h-10 w-10 text-zinc-700" />
              <p className="mt-3 text-sm text-zinc-500">No health check data available.</p>
              <p className="text-xs text-zinc-600">Checks will appear once monitoring begins.</p>
            </div>
          ) : (
            <div className="relative ml-3">
              {/* Vertical line */}
              <div className="absolute left-0 top-2 bottom-2 w-px bg-zinc-800" />

              <div className="space-y-6">
                {healthChecks.map((check, index) => (
                  <div key={check.id} className="relative pl-6">
                    {/* Dot */}
                    <div
                      className={cn(
                        'absolute -left-1.5 top-1.5 h-3 w-3 rounded-full ring-2 ring-zinc-900',
                        getStatusColor(check.statusCode)
                      )}
                    />

                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-zinc-300">
                          {formatDate(check.checkedAt)}
                        </span>
                        {check.statusCode < 400 ? (
                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                        ) : (
                          <XCircle className="h-3.5 w-3.5 text-red-400" />
                        )}
                        <span className="text-[11px] text-zinc-500">
                          {getStatusLabel(check.statusCode)}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-3 text-[11px] text-zinc-500">
                        <span>
                          HTTP{' '}
                          <span className={cn(
                            'font-medium tabular-nums',
                            check.statusCode < 400 ? 'text-emerald-400' : 'text-red-400'
                          )}>
                            {check.statusCode}
                          </span>
                        </span>
                        <span className="text-zinc-700">·</span>
                        <span>
                          <span className={cn(
                            'font-medium tabular-nums',
                            getResponseTimeColor(check.responseTime)
                          )}>
                            {check.responseTime}ms
                          </span>
                          {' '}
                          ({getResponseTimeLabel(check.responseTime)})
                        </span>
                        <span className="text-zinc-700">·</span>
                        <span>
                          SSL:{' '}
                          <span className={cn(
                            'font-medium',
                            check.sslValid ? 'text-emerald-400' : 'text-red-400'
                          )}>
                            {check.sslValid ? 'Valid' : 'Invalid'}
                          </span>
                        </span>
                        {check.sslExpiry && (
                          <>
                            <span className="text-zinc-700">·</span>
                            <span>
                              Expires {formatDate(check.sslExpiry)}
                            </span>
                          </>
                        )}
                      </div>

                      {check.details && (
                        <p className="text-[11px] text-zinc-600 mt-0.5">
                          {check.details}
                        </p>
                      )}
                    </div>

                    {index === 0 && (
                      <span className="ml-2 inline-flex rounded bg-zinc-800 px-1.5 py-0.5 text-[10px] font-medium text-zinc-400">
                        Latest
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
