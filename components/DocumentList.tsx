'use client'

import { Document } from '@/lib/types'
import { useRouter } from 'next/navigation'

interface DocumentListProps {
  owned: Document[]
  shared: Document[]
  onDelete: (id: string) => void
  userId: string
}

export default function DocumentList({ owned, shared, onDelete, userId }: DocumentListProps) {
  const router = useRouter()

  const DocCard = ({ doc, isShared }: { doc: Document; isShared: boolean }) => (
    <div
      className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer flex justify-between items-start"
      onClick={() => router.push(`/doc/${doc.id}?userId=${userId}`)}
    >
      <div>
        <h3 className="font-medium text-gray-900 truncate max-w-xs">{doc.title}</h3>
        <p className="text-xs text-gray-400 mt-1">
          {new Date(doc.updated_at).toLocaleDateString('en-US', {
            month: 'short', day: 'numeric', year: 'numeric',
          })}
        </p>
        {isShared && (
          <span className="inline-block mt-2 text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
            Shared with you
          </span>
        )}
      </div>
      {!isShared && (
        <button
          onClick={e => { e.stopPropagation(); onDelete(doc.id) }}
          className="text-xs text-red-400 hover:text-red-600 ml-4 shrink-0"
        >
          Delete
        </button>
      )}
    </div>
  )

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
          My Documents ({owned.length})
        </h2>
        {owned.length === 0 ? (
          <p className="text-gray-400 text-sm">No documents yet. Create one above.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {owned.map(doc => <DocCard key={doc.id} doc={doc} isShared={false} />)}
          </div>
        )}
      </div>

      {shared.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
            Shared With Me ({shared.length})
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {shared.map(doc => <DocCard key={doc.id} doc={doc} isShared={true} />)}
          </div>
        </div>
      )}
    </div>
  )
}