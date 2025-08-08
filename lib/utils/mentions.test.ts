import { test } from 'node:test'
import assert from 'node:assert/strict'

import { extractMentions } from './mentions.ts'

test('extractMentions supports digits and ignores punctuation', () => {
  const text = 'Salut @User1, comment ça va ? Et @Jean Pierre aussi !'
  const mentions = extractMentions(text)
  assert.deepEqual(
    mentions.map((m) => m.username),
    ['User1', 'Jean Pierre']
  )
})
