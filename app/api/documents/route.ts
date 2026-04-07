import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const userId = searchParams.get('userId')

  if (!userId) {
    return NextResponse.json({ error: 'userId required' }, { status: 400 })
  }

  // Get documents the user owns
  const { data: ownedDocs, error: ownedError } = await supabase
    .from('documents')
    .select('*')
    .eq('owner_id', userId)
    .order('updated_at', { ascending: false })

  if (ownedError) {
    return NextResponse.json({ error: ownedError.message }, { status: 500 })
  }

  // Get documents shared with this user
  const { data: user } = await supabase
    .from('users')
    .select('email')
    .eq('id', userId)
    .single()

  const { data: sharedDocs } = await supabase
    .from('document_shares')
    .select('document_id, documents(*)')
    .eq('shared_with_email', user?.email || '')

  const sharedDocuments = sharedDocs
    ?.map((s: any) => ({ ...s.documents, isShared: true }))
    .filter((d: any) => d.owner_id !== userId) 
    || []

  const ownedDocuments = (ownedDocs || []).map((d: any) => ({
    ...d,
    isShared: false,
  }))

  return NextResponse.json({
    owned: ownedDocuments,
    shared: sharedDocuments,
  })
}

export async function POST(request: NextRequest) {
  const body = await request.json()
  const { title, content, owner_id } = body

  if (!owner_id) {
    return NextResponse.json({ error: 'owner_id required' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('documents')
    .insert({ title: title || 'Untitled Document', content: content || '', owner_id })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data, { status: 201 })
}