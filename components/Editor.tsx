'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'

interface EditorProps {
  content: string
  onChange: (content: string) => void
  editable?: boolean
}

export default function Editor({ content, onChange, editable = true }: EditorProps) {
  const editor = useEditor({
    extensions: [StarterKit, Underline],
    content,
    editable,
    immediatelyRender: false,
    onUpdate({ editor }) {
      onChange(editor.getHTML())
    },
  })

  if (!editor) return null

  const btn = (action: () => void, label: string, active?: boolean) => (
    <button
      onClick={action}
      className={`px-2 py-1 rounded text-sm font-medium border transition-colors ${
        active
          ? 'bg-blue-600 text-white border-blue-600'
          : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
      }`}
    >
      {label}
    </button>
  )

  return (
    <div className="border border-gray-300 rounded-lg overflow-hidden bg-white">
      {editable && (
        <div className="flex flex-wrap gap-1 p-2 border-b border-gray-200 bg-gray-50">
          {btn(() => editor.chain().focus().toggleBold().run(), 'B', editor.isActive('bold'))}
          {btn(() => editor.chain().focus().toggleItalic().run(), 'I', editor.isActive('italic'))}
          {btn(() => editor.chain().focus().toggleUnderline().run(), 'U', editor.isActive('underline'))}
          {btn(() => editor.chain().focus().toggleHeading({ level: 1 }).run(), 'H1', editor.isActive('heading', { level: 1 }))}
          {btn(() => editor.chain().focus().toggleHeading({ level: 2 }).run(), 'H2', editor.isActive('heading', { level: 2 }))}
          {btn(() => editor.chain().focus().toggleHeading({ level: 3 }).run(), 'H3', editor.isActive('heading', { level: 3 }))}
          {btn(() => editor.chain().focus().toggleBulletList().run(), '• List', editor.isActive('bulletList'))}
          {btn(() => editor.chain().focus().toggleOrderedList().run(), '1. List', editor.isActive('orderedList'))}
        </div>
      )}
      <EditorContent editor={editor} className="prose max-w-none p-4 min-h-96" />
    </div>
  )
}