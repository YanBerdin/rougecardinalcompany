# Development Email Redirect

## Purpose

Allows testing invitation flow locally without sending emails to real addresses.

## Configuration

```bash
NODE_ENV=development
EMAIL_DEV_REDIRECT=true
EMAIL_DEV_REDIRECT_TO=your-dev-email@example.com
```

## Behavior

When enabled:

1. All `sendInvitationEmail()` calls redirect to `EMAIL_DEV_REDIRECT_TO`
2. Original email is preserved in template content for debugging
3. Works ONLY if `NODE_ENV === 'development'`

## Production Safety

- **Default:** `false` (disabled)
- **Validation:** Checked at runtime in `lib/email/actions.ts`
- **Fail-safe:** Ignored if `NODE_ENV !== 'development'`

## Troubleshooting

**Problem:** Real invitations going to dev email in production

**Root cause:** `EMAIL_DEV_REDIRECT=true` in production env vars

**Solution:**

```bash
# Verify environment
echo $NODE_ENV          # Should be "production"
echo $EMAIL_DEV_REDIRECT # Should be "false" or empty

# Fix in deployment platform (Vercel, etc.)
vercel env rm EMAIL_DEV_REDIRECT production
```

## Implementation Details

The redirect logic is implemented in `lib/email/actions.ts`:

```typescript
const devRedirectEnabled =
  process.env.NODE_ENV === 'development' &&
  String(process.env.EMAIL_DEV_REDIRECT).toLowerCase() === 'true';

const recipientEmail = devRedirectEnabled
  ? process.env.EMAIL_DEV_REDIRECT_TO ?? 'dev@example.com'
  : params.email;
```

## Security Considerations

- Only active in development environment
- Original email preserved in template for debugging
- No impact on production email delivery
- Environment variable validation prevents accidental activation
