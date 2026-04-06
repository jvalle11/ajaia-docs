import { describe, it, before } from 'node:test'
import assert from 'node:assert'

const BASE_URL = 'http://localhost:3000'

let userId
let documentId

describe('Documents API', () => {
  before(async () => {
    const res = await fetch(`${BASE_URL}/api/users`)
    const users = await res.json()
    userId = users[0].id
  })

  it('creates a new document', async () => {
    const res = await fetch(`${BASE_URL}/api/documents`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ owner_id: userId, title: 'Test Document' }),
    })
    assert.strictEqual(res.status, 201)
    const data = await res.json()
    assert.strictEqual(data.title, 'Test Document')
    assert.strictEqual(data.owner_id, userId)
    documentId = data.id
  })

  it('fetches a document by id', async () => {
    const res = await fetch(`${BASE_URL}/api/documents/${documentId}`)
    assert.strictEqual(res.status, 200)
    const data = await res.json()
    assert.strictEqual(data.id, documentId)
  })

  it('updates a document title', async () => {
    const res = await fetch(`${BASE_URL}/api/documents/${documentId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: 'Updated Title' }),
    })
    assert.strictEqual(res.status, 200)
    const data = await res.json()
    assert.strictEqual(data.title, 'Updated Title')
  })

  it('returns owned documents for a user', async () => {
    const res = await fetch(`${BASE_URL}/api/documents?userId=${userId}`)
    assert.strictEqual(res.status, 200)
    const data = await res.json()
    assert.ok(Array.isArray(data.owned))
    const found = data.owned.find((d) => d.id === documentId)
    assert.ok(found)
  })

  it('rejects share request with missing fields', async () => {
    const res = await fetch(`${BASE_URL}/api/share`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ document_id: documentId }),
    })
    assert.strictEqual(res.status, 400)
  })

  it('deletes a document', async () => {
    const res = await fetch(`${BASE_URL}/api/documents/${documentId}`, {
      method: 'DELETE',
    })
    assert.strictEqual(res.status, 200)
    const data = await res.json()
    assert.ok(data.success)
  })
})