'use client'

import { useState } from 'react'

interface ShareModalProps {
  documentId: string
  ownerId: string
  onClose: () => void
}

export default function ShareModal({ documentId, ownerId, onClose }: ShareModalProps) {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')

  const handleShare = async () => {
    if (!email.trim()) return
    setStatus('loading')

    const res = await fetch('/api/share', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ document_id: documentId, shared_with_email: email, owner_id: ownerId }),
    })

    const data = await res.json()

    if (res.ok) {
      setStatus('success')
      setMessage(`Document shared with ${email}`)
      setEmail('')
    } else {
      setStatus('error')
      setMessage(data.error || 'Something went wrong')
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-xl">
        <h2 className="text-lg font-semibold mb-4">Share Document</h2>
        <p className="text-sm text-gray-500 mb-4">
          Enter the email of a registered user. Test accounts: alice@test.com and bob@test.com
        </p>
        <input
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="Enter email address"
          className="w-full border border-gray-300 rounded px-3 py-2 text-sm mb-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
          onKeyDown={e => e.key === 'Enter' && handleShare()}
        />
        {message && (
          <p className={`text-sm mb-3 ${status === 'success' ? 'text-green-600' : 'text-red-600'}`}>
            {message}
          </p>
        )}
        <div className="flex gap-2 justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm rounded border border-gray-300 hover:bg-gray-50"
          >
            Close
          </button>
          <button
            onClick={handleShare}
            disabled={status === 'loading' || !email.trim()}
            className="px-4 py-2 text-sm rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {status === 'loading' ? 'Sharing...' : 'Share'}
          </button>
        </div>
      </div>
    </div>
  )
}