import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ username: string }> }
) {
  try {
    const { username } = await params

    return NextResponse.json({
      profile: {
        login: username,
        name: username.charAt(0).toUpperCase() + username.slice(1),
        bio: 'Developer',
        avatar_url: `https://github.com/${username}.png`,
        html_url: `https://github.com/${username}`,
        public_repos: 0,
        followers: 0,
      },
      repos: [],
      languages: {},
    })
  } catch (error) {
    console.error('Failed to fetch GitHub data:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
