# Wedding Website

Next.js + Tailwind + Supabase + Gmail SMTP (nodemailer). Public site at `/`, admin dashboard at `/admin`.

## 1. Create the Supabase project
Go to supabase.com, create a project, and wait for it to finish.

## 2. Run the database setup
Supabase → **SQL Editor** → paste all of `supabase/schema.sql` → **Run**. This creates the tables, security rules, the `images` storage bucket, and placeholder content (story, schedule, colours, registry, FAQ).

## 3. Create the admin login
1. Supabase → **Authentication → Users → Add user**. Enter the email and password, and tick "Auto confirm".
2. In the SQL Editor run (use the same email):
   `insert into admins (email) values ('friend@example.com');`
Only emails in this table can use the dashboard.

## 4. Set up the thank-you email (Gmail)
The site sends each guest a thank-you email through Gmail. Pick **one** of the methods below. Method A is the easiest and is what most people should use.

In all methods, `SMTP_USER` is the Gmail address and `SMTP_FROM` should use **the same address**, e.g. `"Our Wedding <yourname@gmail.com>"`. Gmail rewrites or spam-folders mail sent "from" a different address. Gmail allows about 500 emails a day (2,000 on Google Workspace), far more than a wedding needs.

### Method A: App Password (recommended)
1. Sign in to the Gmail account that will send the emails.
2. Turn on **2-Step Verification**: myaccount.google.com → Security → 2-Step Verification.
3. Create an **App Password**: myaccount.google.com/apppasswords (or Security → 2-Step Verification → App passwords). Name it "Wedding site".
4. Copy the 16-character password with the spaces removed.
5. Set in `.env.local` (and Vercel):
```
SMTP_USER=yourname@gmail.com
SMTP_PASS=abcdefghijklmnop
SMTP_FROM="Our Wedding <yourname@gmail.com>"
```
`SMTP_HOST` (default `smtp.gmail.com`) and `SMTP_PORT` (default `465`) can be left alone.

If you can't see "App passwords", 2-Step Verification is off, or the account is a work or school account whose admin has disabled it, or Advanced Protection is on. Use Method B or C instead.

### Method B: Port 587 (STARTTLS)
Same as Method A, but add `SMTP_PORT=587`. Use this only if port 465 is blocked on your network. It works the same on Vercel with 465.

### Method C: OAuth2 (no password stored, for accounts that can't use App Passwords)
1. Go to console.cloud.google.com and create a project.
2. **APIs & Services → OAuth consent screen**: choose External, fill in the app name and your email, and add your Gmail address under **Test users**. Then **publish the app to Production** so the refresh token doesn't expire after 7 days. (For a personal app you can ignore the "unverified app" warning when signing in.)
3. **Credentials → Create credentials → OAuth client ID → Web application**. Under Authorized redirect URIs add `https://developers.google.com/oauthplayground`. Copy the **Client ID** and **Client Secret**.
4. Go to developers.google.com/oauthplayground. Click the gear icon, tick **Use your own OAuth credentials**, and paste the ID and secret.
5. In Step 1 type the scope `https://mail.google.com/` and click **Authorize APIs**. Sign in with the sending Gmail account.
6. In Step 2 click **Exchange authorization code for tokens** and copy the **Refresh token**.
7. Set:
```
SMTP_USER=yourname@gmail.com
SMTP_FROM="Our Wedding <yourname@gmail.com>"
GMAIL_CLIENT_ID=...
GMAIL_CLIENT_SECRET=...
GMAIL_REFRESH_TOKEN=...
```
Leave `SMTP_PASS` empty. The site uses OAuth2 automatically when `GMAIL_REFRESH_TOKEN` is set.

### Method D: Send from your own domain through Gmail ("Send mail as")
If you'd like emails to come from something like `rsvp@yourwedding.com`:
1. In Gmail → Settings → Accounts → **Send mail as → Add another email address**, and follow the verification steps.
2. Keep authenticating with Method A or C, but set `SMTP_FROM="Our Wedding <rsvp@yourwedding.com>"`.
Gmail will then send as that address. For best deliverability, make sure your domain's SPF record includes `include:_spf.google.com`.

### Method E: Google Workspace SMTP relay (not recommended here)
Google Workspace offers `smtp-relay.gmail.com`, but it needs fixed server IP addresses to be allow-listed. Vercel doesn't have fixed IPs, so it won't work reliably. Use Method A or C instead.

### Testing and troubleshooting
- Submit a test RSVP with a different email address and check inbox and spam.
- **Invalid login / 535 error**: wrong App Password, 2-Step Verification is off, or there are spaces in the password.
- **Mail goes to spam**: `SMTP_FROM` doesn't match `SMTP_USER`, or you're sending from a custom domain with no SPF record.
- **OAuth `invalid_grant`**: the OAuth app is still in Testing mode (the token expires in 7 days). Publish it to Production and create a new refresh token.
- The RSVP is always saved, even if the email fails. Check **Vercel → your project → Logs** for the "Email failed" message.

## 5. Environment variables
Copy `.env.example` to `.env.local` and fill it in. Supabase keys are under **Project Settings → API**. `SUPABASE_SERVICE_ROLE_KEY` is secret: never share it or put it in client code.

## 6. Run locally
```
npm install
npm run dev
```
Open http://localhost:3000 and http://localhost:3000/admin.

## 7. Deploy to Vercel
Push to GitHub, import the repo on vercel.com, add the same environment variables from `.env.example`, and deploy. Add a custom domain under Project → Domains.

## 8. Using the dashboard
- **Settings**: couple names, date, venue, hero photo, currency and **bank details** (shown in the registry popup).
- **Story / Schedule / Colours / Gallery / FAQ**: add, edit, reorder (change the Order number) and delete. Click **Save** on each card.
- **RSVPs**: search, export to CSV, delete.
- **Registry**: add items with a photo and price.
- **Reservations**: guests tap "I've paid" on trust. Check your bank app, then set the status to **confirmed**, or **removed** if no payment arrived (the badge disappears from the item). Guests who chose Anonymous show as "Anonymous" publicly; you still see their name if they gave one.
- **Colours**: the palette on the site comes from here. Site design colours live in `src/lib/theme.ts`.

## Notes
- Reservations don't block an item, so friends can chip in on the same gift.
- Guest emails and real names are never exposed publicly; RLS blocks all public reads on `rsvps` and `reservations`.
