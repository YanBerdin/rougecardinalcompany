import assert from 'node:assert/strict'
import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'

// ensure React symbol is available to modules that expect it (jsx runtime differences)
globalThis.React = React as unknown as typeof globalThis.React

// import the component after ensuring React exists on the global scope
const InvitationEmail = (await import('@/emails/invitation-email')).default

async function main() {
  const invitationUrl = 'https://example.com/invite/abc123'

  const html = renderToStaticMarkup(
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

  // ✅ Vérifier inline styles CTA (requis pour clients email)
  assert.ok(
    html.includes('background-color:#4F46E5') || html.includes('background-color:#4f46e5'),
    'CTA button should have inline indigo background color'
  )
  assert.ok(
    html.includes('color:#ffffff') || html.includes('color:#FFFFFF'),
    'CTA button should have inline white text color'
  )

  // ✅ Vérifier structure Tailwind (classes converties en inline styles)
  assert.ok(
    html.includes('style=') && html.includes('padding:'),
    'Tailwind classes should be converted to inline styles'
  )

  // ✅ Vérifier absence classes Tailwind custom (non-core)
  assert.ok(
    !html.includes('class='),
    'No Tailwind class attributes should remain (should be converted to inline styles)'
  )

  // ✅ Vérifier role label français
  assert.ok(
    html.includes('Administrateur') || html.includes('Éditeur') || html.includes('Utilisateur'),
    'Email should include French role label'
  )

  console.log('✅ All InvitationEmail assertions passed')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
