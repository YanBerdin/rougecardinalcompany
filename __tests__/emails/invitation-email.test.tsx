import assert from 'node:assert/strict'
import React from 'react'
import { render } from '@react-email/render'
import InvitationEmail from '@/emails/invitation-email'

async function main() {
  const invitationUrl = 'https://example.com/invite/abc123'

  const html = render(
    <InvitationEmail
      email="test@example.com"
      role="admin"
      displayName="Test User"
      invitationUrl={invitationUrl}
    />
  )

  // Assertions: html should be non-empty and include key parts
  assert.ok(typeof html === 'string' && html.length > 0, 'Rendered html should not be empty')
  assert.ok(html.includes('Activer mon compte'), 'Rendered html should include CTA text')
  assert.ok(html.includes(invitationUrl), 'Rendered html should include invitation URL')
  assert.ok(html.includes('test@example.com'), 'Rendered html should include recipient email')

  console.log('✅ InvitationEmail render test passed')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
