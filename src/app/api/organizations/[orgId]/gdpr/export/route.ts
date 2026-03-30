import { NextRequest } from 'next/server'
import { proxyToBackend } from '@/lib/server/proxy'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ orgId: string }> },
) {
  const { orgId } = await params
  return proxyToBackend(request, `/api/v1/organizations/${orgId}/gdpr/export`, 'GET')
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ orgId: string }> },
) {
  const { orgId } = await params
  return proxyToBackend(request, `/api/v1/organizations/${orgId}/gdpr/export`, 'POST')
}
