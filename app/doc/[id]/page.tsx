'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams, useSearchParams, useRouter } from 'next/navigation'
import Editor from '@/components/Editor'
import ShareModal from '@/components/ShareModal'
import { Document } from '@/lib/types'

export default function DocPage() {
  const { id } = useParams()
  const searchParams = useSearchParams()
  const router = useRouter()
  const userId = searchParams.get('userId')

  const [doc, setDoc] = useState<Document | null>(null)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(true)
  const [showShare, setShowShare] = useState(false)
  const [isOwner, setIsOwner] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)

  useEffect(() => {
    const fetchDoc = async () => {
      const res = await fetch(`/api/documents/${id}`)
      if (!res.ok) { router.push('/'); return }
      const data = await res.json()
      setDoc(data)
      setTitle(data.title)
      setContent(data.content)
      setIsOwner(data.owner_id === userId)
    }
    fetchDoc()
  }, [id])

  // Autosave after 1.5 seconds of no changes
  const save = useCallback(async (newTitle: string, newContent: string) => {
    setSaving(true)
    await fetch(`/api/documents/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: newTitle, content: newContent }),
    })
    setSaving(false)
    setSaved(true)
    setLastSaved(new Date())
  }, [id])

  useEffect(() => {
    if (saved) return
    const timer = setTimeout(() => save(title, content), 1500)
    return () => clearTimeout(timer)
  }, [title, content, saved])

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value)
    setSaved(false)
  }

  const handleContentChange = (newContent: string) => {
    setContent(newContent)
    setSaved(false)
  }

  if (!doc) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-400">Loading document...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-3 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto flex justify-between items-center gap-4">
          <button
            onClick={() => router.push(`/?userId=${userId}`)}
            className="text-sm text-gray-400 hover:text-gray-600 shrink-0"
          >
            ← Back
          </button>

          <input
            value={title}
            onChange={handleTitleChange}
            className="flex-1 text-lg font-semibold text-gray-900 bg-transparent border-none outline-none text-center"
            placeholder="Untitled Document"
          />

          <div className="flex items-center gap-3 shrink-0">
            <span className="text-xs text-gray-400">
              {saving ? 'Saving...' : lastSaved ? `Saved ${lastSaved.toLocaleTimeString()}` : ''}
            </span>
            {isOwner && (
              <button
                onClick={() => setShowShare(true)}
                className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Share
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Editor */}
      <main className="max-w-4xl mx-auto px-6 py-8">
        {!isOwner && (
          <div className="mb-4 px-4 py-2 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-700">
            You are viewing a shared document. Changes will still be saved.
          </div>
        )}
        <Editor
          content={content}
          onChange={handleContentChange}
          editable={true}
        />
      </main>

      {showShare && userId && (
        <ShareModal
          documentId={id as string}
          ownerId={userId}
          onClose={() => setShowShare(false)}
        />
      )}
    </div>
  )
}