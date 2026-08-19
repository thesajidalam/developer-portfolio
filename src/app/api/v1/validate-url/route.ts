import { NextRequest, NextResponse } from 'next/server'
import { UrlValidationSchema } from '@/lib/validations'
import { validateUrlSafety, safeFetch } from '@/lib/ssrf-protection'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const parsed = UrlValidationSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { valid: false, reachable: false, message: parsed.error.issues[0]?.message ?? 'Invalid URL' },
        { status: 400 }
      )
    }

    const { url } = parsed.data

    const safety = validateUrlSafety(url)
    if (!safety.safe) {
      return NextResponse.json({
        valid: false,
        reachable: false,
        message: safety.reason,
      })
    }

    try {
      const response = await safeFetch(url, 8000)

      const reachable = response.ok
      const message = reachable
        ? `URL is reachable (HTTP ${response.status})`
        : `URL returned HTTP ${response.status}`

      return NextResponse.json({
        valid: true,
        reachable,
        message,
        statusCode: response.status,
      })
    } catch (err) {
      const message =
        err instanceof Error && err.name === 'AbortError'
          ? 'URL timed out after 8 seconds'
          : 'URL is not reachable'

      return NextResponse.json({
        valid: true,
        reachable: false,
        message,
      })
    }
  } catch (error) {
    console.error('URL validation failed:', error)
    return NextResponse.json(
      { valid: false, reachable: false, message: 'Validation request failed' },
      { status: 500 }
    )
  }
}
