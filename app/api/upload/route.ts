import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  const formData = await request.formData()
  const file = formData.get('file') as File
  const owner_id = formData.get('owner_id') as string

  if (!file || !owner_id) {
    return NextResponse.json({ error: 'File and owner_id required' }, { status: 400 })
  }

  const allowedTypes = ['text/plain', 'text/markdown']
  const fileExtension = file.name.split('.').pop()?.toLowerCase()

  if (!allowedTypes.includes(file.type) && !['txt', 'md'].includes(fileExtension || '')) {
    return NextResponse.json(
      { error: 'Only .txt and .md files are supported' },
      { status: 415 }
    )
  }

  const text = await file.text()

  // Convert plain text to basic HTML paragraphs
  const content = text
    .split('\n')
    .filter(line => line.trim())
    .map(line => `<p>${line}</p>`)
    .join('')

  const title = file.name.replace(/\.(txt|md)$/, '')

  const { data, error } = await supabase
    .from('documents')
    .insert({ title, content, owner_id })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data, { status: 201 })
}