# Supabase Email Templates

Paste these into **Supabase Dashboard → Authentication → Email Templates**.
Use the "Source" view to paste the HTML.

---

## 1. Confirm Signup

**Subject:** `Confirm your NagLead account`

```html
<div style="background-color: #000; padding: 40px 20px; font-family: 'Helvetica Neue', Arial, sans-serif;">
  <div style="max-width: 480px; margin: 0 auto;">
    <h1 style="color: #FF4500; font-size: 32px; font-weight: 800; letter-spacing: 2px; margin: 0 0 24px 0;">NAGLEAD</h1>
    <h2 style="color: #fff; font-size: 24px; font-weight: 700; margin: 0 0 12px 0;">Welcome aboard</h2>
    <p style="color: #a1a1aa; font-size: 16px; line-height: 1.6; margin: 0 0 24px 0;">
      Click the button below to confirm your account and start getting nagged about your leads.
    </p>
    <a href="{{ .ConfirmationURL }}"
       style="display: inline-block; background-color: #FF4500; color: #000; padding: 14px 32px; text-decoration: none; font-weight: 800; font-size: 18px; letter-spacing: 1px; border-radius: 4px;">
      CONFIRM MY ACCOUNT
    </a>
    <p style="color: #52525b; font-size: 13px; margin: 32px 0 0 0;">
      If you didn't sign up for NagLead, you can safely ignore this email.
    </p>
  </div>
</div>
```

---

## 2. Reset Password

**Subject:** `Reset your NagLead password`

```html
<div style="background-color: #000; padding: 40px 20px; font-family: 'Helvetica Neue', Arial, sans-serif;">
  <div style="max-width: 480px; margin: 0 auto;">
    <h1 style="color: #FF4500; font-size: 32px; font-weight: 800; letter-spacing: 2px; margin: 0 0 24px 0;">NAGLEAD</h1>
    <h2 style="color: #fff; font-size: 24px; font-weight: 700; margin: 0 0 12px 0;">Reset your password</h2>
    <p style="color: #a1a1aa; font-size: 16px; line-height: 1.6; margin: 0 0 24px 0;">
      Someone requested a password reset for your NagLead account. Click below to choose a new password.
    </p>
    <a href="{{ .ConfirmationURL }}"
       style="display: inline-block; background-color: #FF4500; color: #000; padding: 14px 32px; text-decoration: none; font-weight: 800; font-size: 18px; letter-spacing: 1px; border-radius: 4px;">
      RESET PASSWORD
    </a>
    <p style="color: #52525b; font-size: 13px; margin: 32px 0 0 0;">
      If you didn't request this, ignore this email. Your password won't change.
    </p>
  </div>
</div>
```

---

## 3. Magic Link

**Subject:** `Your NagLead login link`

```html
<div style="background-color: #000; padding: 40px 20px; font-family: 'Helvetica Neue', Arial, sans-serif;">
  <div style="max-width: 480px; margin: 0 auto;">
    <h1 style="color: #FF4500; font-size: 32px; font-weight: 800; letter-spacing: 2px; margin: 0 0 24px 0;">NAGLEAD</h1>
    <h2 style="color: #fff; font-size: 24px; font-weight: 700; margin: 0 0 12px 0;">Your login link</h2>
    <p style="color: #a1a1aa; font-size: 16px; line-height: 1.6; margin: 0 0 24px 0;">
      Click below to log in to your NagLead account. This link expires in 1 hour.
    </p>
    <a href="{{ .ConfirmationURL }}"
       style="display: inline-block; background-color: #FF4500; color: #000; padding: 14px 32px; text-decoration: none; font-weight: 800; font-size: 18px; letter-spacing: 1px; border-radius: 4px;">
      LOG IN TO NAGLEAD
    </a>
    <p style="color: #52525b; font-size: 13px; margin: 32px 0 0 0;">
      If you didn't request this link, you can safely ignore this email.
    </p>
  </div>
</div>
```

---

## 4. Change Email

**Subject:** `Confirm your new email address`

```html
<div style="background-color: #000; padding: 40px 20px; font-family: 'Helvetica Neue', Arial, sans-serif;">
  <div style="max-width: 480px; margin: 0 auto;">
    <h1 style="color: #FF4500; font-size: 32px; font-weight: 800; letter-spacing: 2px; margin: 0 0 24px 0;">NAGLEAD</h1>
    <h2 style="color: #fff; font-size: 24px; font-weight: 700; margin: 0 0 12px 0;">Confirm your new email</h2>
    <p style="color: #a1a1aa; font-size: 16px; line-height: 1.6; margin: 0 0 24px 0;">
      Click below to confirm changing your NagLead email address to this one.
    </p>
    <a href="{{ .ConfirmationURL }}"
       style="display: inline-block; background-color: #FF4500; color: #000; padding: 14px 32px; text-decoration: none; font-weight: 800; font-size: 18px; letter-spacing: 1px; border-radius: 4px;">
      CONFIRM NEW EMAIL
    </a>
    <p style="color: #52525b; font-size: 13px; margin: 32px 0 0 0;">
      If you didn't request this change, contact us at hello@naglead.com.
    </p>
  </div>
</div>
```

---

## 5. Invite User (if used)

**Subject:** `You've been invited to NagLead`

```html
<div style="background-color: #000; padding: 40px 20px; font-family: 'Helvetica Neue', Arial, sans-serif;">
  <div style="max-width: 480px; margin: 0 auto;">
    <h1 style="color: #FF4500; font-size: 32px; font-weight: 800; letter-spacing: 2px; margin: 0 0 24px 0;">NAGLEAD</h1>
    <h2 style="color: #fff; font-size: 24px; font-weight: 700; margin: 0 0 12px 0;">You're invited</h2>
    <p style="color: #a1a1aa; font-size: 16px; line-height: 1.6; margin: 0 0 24px 0;">
      You've been invited to NagLead — the app that won't shut up until you call your leads back. Click below to set up your account.
    </p>
    <a href="{{ .ConfirmationURL }}"
       style="display: inline-block; background-color: #FF4500; color: #000; padding: 14px 32px; text-decoration: none; font-weight: 800; font-size: 18px; letter-spacing: 1px; border-radius: 4px;">
      ACCEPT INVITE
    </a>
    <p style="color: #52525b; font-size: 13px; margin: 32px 0 0 0;">
      If you don't know what this is, ignore this email.
    </p>
  </div>
</div>
```

---

## Notes

- All templates use NagLead's design: black background, orange (#FF4500) accent, bold typography
- `{{ .ConfirmationURL }}` is the only required variable — Supabase replaces it automatically
- Supabase Dashboard → Authentication → URL Configuration must have **Site URL** set to `https://naglead.com`
- Add `https://naglead.com/**` and `https://www.naglead.com/**` to **Redirect URLs**
