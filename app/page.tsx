'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import DocumentList from '@/components/DocumentList'
import { Document } from '@/lib/types'

const TEST_USERS = [
  { id: '', email: 'alice@test.com' },
  { id: '', email: 'bob@test.com' },
]

export default function Home() {
  const router = useRouter()
  const [currentUser, setCurrentUser] = useState<{ id: string; email: string } | null>(null)
  const [users, setUsers] = useState<{ id: string; email: string }[]>([])
  const [owned, setOwned] = useState<Document[]>([])
  const [shared, setShared] = useState<Document[]>([])
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Load real user IDs from database on mount
  useEffect(() => {
    const fetchUsers = async () => {
      const res = await fetch('/api/users')
      const data = await res.json()
      setUsers(data)
    }
    fetchUsers()
  }, [])

  // Load documents whenever the current user changes
  useEffect(() => {
    if (!currentUser) return
    fetchDocuments()
  }, [currentUser])

  const fetchDocuments = async () => {
    if (!currentUser) return
    setLoading(true)
    const res = await fetch(`/api/documents?userId=${currentUser.id}`)
    const data = await res.json()
    setOwned(data.owned || [])
    setShared(data.shared || [])
    setLoading(false)
  }

  const handleCreateDocument = async () => {
    if (!currentUser) return
    const res = await fetch('/api/documents', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ owner_id: currentUser.id }),
    })
    const doc = await res.json()
    router.push(`/doc/${doc.id}?userId=${currentUser.id}`)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this document?')) return
    await fetch(`/api/documents/${id}`, { method: 'DELETE' })
    fetchDocuments()
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !currentUser) return
    setUploadError('')
    setUploading(true)

    const formData = new FormData()
    formData.append('file', file)
    formData.append('owner_id', currentUser.id)

    const res = await fetch('/api/upload', { method: 'POST', body: formData })
    const data = await res.json()

    if (res.ok) {
      router.push(`/doc/${data.id}?userId=${currentUser.id}`)
    } else {
      setUploadError(data.error || 'Upload failed')
      setUploading(false)
    }

    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  // Login screen
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 w-full max-w-sm">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Ajaia Docs</h1>
          <p className="text-gray-500 text-sm mb-6">Select an account to continue</p>
          <div className="space-y-2">
            {users.map(user => (
              <button
                key={user.id}
                onClick={() => setCurrentUser(user)}
                className="w-full text-left px-4 py-3 rounded-lg border border-gray-200 hover:border-blue-400 hover:bg-blue-50 transition-colors"
              >
                <p className="font-medium text-gray-800">{user.email}</p>
                <p className="text-xs text-gray-400">Test account</p>
              </button>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-5xl mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold text-gray-900">Ajaia Docs</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-500">{currentUser.email}</span>
            <button
              onClick={() => { setCurrentUser(null); setOwned([]); setShared([]) }}
              className="text-sm text-gray-400 hover:text-gray-600"
            >
              Switch user
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8">
        {/* Actions */}
        <div className="flex flex-wrap gap-3 mb-8">
          <button
            onClick={handleCreateDocument}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            + New Document
          </button>

          <div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".txt,.md"
              onChange={handleFileUpload}
              className="hidden"
              id="file-upload"
            />
            <label
              htmlFor="file-upload"
              className={`px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium cursor-pointer hover:bg-gray-50 transition-colors inline-block ${uploading ? 'opacity-50 pointer-events-none' : ''}`}
            >
              {uploading ? 'Uploading...' : '↑ Upload .txt or .md'}
            </label>
          </div>

          {uploadError && (
            <p className="text-sm text-red-500 self-center">{uploadError}</p>
          )}
        </div>

        {/* Document list */}
        {loading ? (
          <p className="text-gray-400 text-sm">Loading documents...</p>
        ) : (
          <DocumentList owned={owned} shared={shared} onDelete={handleDelete} userId={currentUser.id} />
        )}
      </main>
    </div>
  )
}