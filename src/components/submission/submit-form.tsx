'use client'

import { useState, useCallback } from 'react'
import { Globe, ArrowRight, ArrowLeft, Loader2, AlertCircle, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { SubmissionSuccess } from './submission-success'

type Step = 1 | 2 | 3

interface FormState {
  url: string
  name: string
  email: string
  description: string
  role: string
  agreedToTerms: boolean
}

interface UrlCheckResult {
  valid: boolean
  reachable: boolean
  message: string
}

const ROLES = [
  'Frontend Developer',
  'Backend Developer',
  'Full Stack Developer',
  'UI/UX Designer',
  'DevOps Engineer',
  'Mobile Developer',
  'Data Scientist',
  'Machine Learning Engineer',
  'Software Engineer',
  'Other',
]

export function SubmitForm() {
  const [step, setStep] = useState<Step>(1)
  const [form, setForm] = useState<FormState>({
    url: '',
    name: '',
    email: '',
    description: '',
    role: '',
    agreedToTerms: false,
  })
  const [urlCheck, setUrlCheck] = useState<UrlCheckResult | null>(null)
  const [checkingUrl, setCheckingUrl] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const updateField = <K extends keyof FormState>(field: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [field]: value }))
    if (field === 'url') {
      setUrlCheck(null)
    }
    setError(null)
  }

  const checkUrl = useCallback(async () => {
    if (!form.url) return

    setCheckingUrl(true)
    setUrlCheck(null)

    try {
      const res = await fetch('/api/v1/validate-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: form.url }),
      })
      const data = await res.json()

      setUrlCheck({
        valid: data.valid ?? false,
        reachable: data.reachable ?? false,
        message: data.message ?? 'Unknown result',
      })
    } catch {
      setUrlCheck({
        valid: false,
        reachable: false,
        message: 'Failed to validate URL. Please try again.',
      })
    } finally {
      setCheckingUrl(false)
    }
  }, [form.url])

  const isUrlValid = urlCheck?.valid && urlCheck?.reachable

  const handleSubmit = useCallback(async () => {
    setSubmitting(true)
    setError(null)

    try {
      const res = await fetch('/api/v1/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: form.url,
          name: form.name || undefined,
          email: form.email || undefined,
          description: form.description || undefined,
          role: form.role || undefined,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error ?? 'Submission failed')
      }

      setSubmitted(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setSubmitting(false)
    }
  }, [form])

  if (submitted) {
    return <SubmissionSuccess />
  }

  return (
    <div className="mx-auto w-full max-w-2xl space-y-8">
      <div className="flex items-center justify-between">
        {[1, 2, 3].map((s) => (
          <div key={s} className="flex items-center gap-2">
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium transition-colors ${
                step >= s
                  ? 'bg-zinc-50 text-zinc-950'
                  : 'bg-zinc-800 text-zinc-500'
              }`}
            >
              {step > s ? '✓' : s}
            </div>
            <span
              className={`hidden text-sm sm:inline ${
                step >= s ? 'text-zinc-100' : 'text-zinc-500'
              }`}
            >
              {s === 1 ? 'URL' : s === 2 ? 'Details' : 'Review'}
            </span>
            {s < 3 && (
              <div className="mx-2 hidden h-px w-8 bg-zinc-700 sm:block" />
            )}
          </div>
        ))}
      </div>

      {step === 1 && (
        <div className="space-y-6">
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-zinc-50">Portfolio URL</h3>
            <p className="text-sm text-zinc-400">
              Enter the URL of your developer portfolio
            </p>
          </div>

          <div className="space-y-3">
            <div className="relative">
              <Globe className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
              <Input
                type="url"
                placeholder="https://yourportfolio.com"
                value={form.url}
                onChange={(e) => updateField('url', e.target.value)}
                className="pl-10"
                autoFocus
              />
            </div>

            {form.url && !form.url.startsWith('https://') && form.url.length > 8 && (
              <div className="flex items-center gap-2 text-sm text-amber-500">
                <AlertCircle className="h-4 w-4" />
                Only HTTPS URLs are accepted
              </div>
            )}

            {urlCheck && (
              <div
                className={`flex items-center gap-2 text-sm ${
                  isUrlValid ? 'text-emerald-500' : 'text-red-500'
                }`}
              >
                {isUrlValid ? (
                  <CheckCircle className="h-4 w-4" />
                ) : (
                  <AlertCircle className="h-4 w-4" />
                )}
                {urlCheck.message}
              </div>
            )}

            <Button
              variant="outline"
              onClick={checkUrl}
              disabled={!form.url || checkingUrl}
            >
              {checkingUrl ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Checking...
                </>
              ) : (
                'Check availability'
              )}
            </Button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-6">
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-zinc-50">Details</h3>
            <p className="text-sm text-zinc-400">
              Optional information to help us process your submission
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-300">Name</label>
              <Input
                placeholder="Your name"
                value={form.name}
                onChange={(e) => updateField('name', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-300">Email</label>
              <Input
                type="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={(e) => updateField('email', e.target.value)}
              />
              <p className="text-xs text-zinc-500">
                For submission updates only
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-300">
              Short description
            </label>
            <textarea
              placeholder="Tell us about your portfolio..."
              rows={3}
              maxLength={500}
              className="w-full rounded-md border border-zinc-200 bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-zinc-500 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-400 dark:border-zinc-700 dark:placeholder:text-zinc-400"
              value={form.description}
              onChange={(e) => updateField('description', e.target.value)}
            />
            <p className="text-xs text-zinc-500">
              {form.description.length}/500
            </p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-300">
              Primary role
            </label>
            <Select
              value={form.role}
              onValueChange={(val) => updateField('role', val)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select your role" />
              </SelectTrigger>
              <SelectContent>
                {ROLES.map((role) => (
                  <SelectItem key={role} value={role}>
                    {role}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-6">
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-zinc-50">Review & Submit</h3>
            <p className="text-sm text-zinc-400">
              Please review your submission before submitting
            </p>
          </div>

          <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-zinc-400">URL</span>
              <span className="text-sm font-medium text-zinc-100">{form.url}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-zinc-400">Status</span>
              <Badge variant={isUrlValid ? 'success' : 'warning'}>
                {isUrlValid ? 'Verified' : 'Pending verification'}
              </Badge>
            </div>
            {form.name && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-zinc-400">Name</span>
                <span className="text-sm text-zinc-100">{form.name}</span>
              </div>
            )}
            {form.email && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-zinc-400">Email</span>
                <span className="text-sm text-zinc-100">{form.email}</span>
              </div>
            )}
            {form.description && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-zinc-400">Description</span>
                <span className="text-sm text-zinc-100">{form.description}</span>
              </div>
            )}
            {form.role && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-zinc-400">Role</span>
                <span className="text-sm text-zinc-100">{form.role}</span>
              </div>
            )}
          </div>

          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={form.agreedToTerms}
              onChange={(e) => updateField('agreedToTerms', e.target.checked)}
              className="mt-1 h-4 w-4 rounded border-zinc-700 bg-zinc-800"
            />
            <span className="text-sm text-zinc-400">
              I confirm this is my own portfolio and I agree to the terms of service.
              I understand the submission will be reviewed before being published.
            </span>
          </label>

          {error && (
            <div className="flex items-center gap-2 rounded-md bg-red-500/10 p-3 text-sm text-red-500">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {error}
            </div>
          )}
        </div>
      )}

      <div className="flex items-center justify-between pt-4 border-t border-zinc-800">
        {step > 1 ? (
          <Button variant="ghost" onClick={() => setStep((s) => (s - 1) as Step)}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        ) : (
          <div />
        )}

        {step < 3 ? (
          <Button
            onClick={() => setStep((s) => (s + 1) as Step)}
            disabled={step === 1 && !isUrlValid}
          >
            Continue
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        ) : (
          <Button
            onClick={handleSubmit}
            disabled={!form.agreedToTerms || submitting}
          >
            {submitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              'Submit Portfolio'
            )}
          </Button>
        )}
      </div>
    </div>
  )
}
