import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  const body = await request.json()
  const { document_id, shared_with_email, owner_id } = body

  if (!document_id || !shared_with_email || !owner_id) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  // Confirm the requester owns this document
  const { data: doc, error: docError } = await supabase
    .from('documents')
    .select('owner_id')
    .eq('id', document_id)
    .single()

  if (docError || !doc) {
    return NextResponse.json({ error: 'Document not found' }, { status: 404 })
  }

  if (doc.owner_id !== owner_id) {
    return NextResponse.json({ error: 'Only the owner can share this document' }, { status: 403 })
  }

  // Confirm the target user exists
  const { data: targetUser } = await supabase
    .from('users')
    .select('id')
    .eq('email', shared_with_email)
    .single()

  if (!targetUser) {
    return NextResponse.json({ error: 'No user found with that email' }, { status: 404 })
  }

  // Prevent duplicate shares
  const { data: existing } = await supabase
    .from('document_shares')
    .select('id')
    .eq('document_id', document_id)
    .eq('shared_with_email', shared_with_email)
    .single()

  if (existing) {
    return NextResponse.json({ error: 'Already shared with this user' }, { status: 409 })
  }

  const { data, error } = await supabase
    .from('document_shares')
    .insert({ document_id, shared_with_email })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data, { status: 201 })
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const documentId = searchParams.get('documentId')

  if (!documentId) {
    return NextResponse.json({ error: 'documentId required' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('document_shares')
    .select('*')
    .eq('document_id', documentId)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}