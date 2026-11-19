# Wedding Website

A Next.js wedding website backed by local PostgreSQL, with a public RSVP and gift registry plus a private admin dashboard.

## 1. Create the PostgreSQL database

Using TablePlus or PostgreSQL:

1. Create a database named `wedding`.
2. Note the host, port, username and password.

## 2. Configure environment variables

Copy `.env.example` to `.env`, then set:

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=wedding
DB_USER=postgres
DB_PASSWORD=your-password
ADMIN_SESSION_SECRET=use-a-long-random-value
```

The app automatically applies `postgres/schema.sql` on its first database connection. No manual table seeding is required.

## 3. Create the first administrator

```bash
npm install
npm run dev
```

Open `http://localhost:3000/admin/login`.

If no administrator exists, the page opens in first-admin setup mode. Enter an email and password of at least eight characters. The account is stored securely with bcrypt and becomes the first administrator.

## 4. Use the dashboard

Open `http://localhost:3000/admin` to manage wedding settings, story, schedule, colours, gallery, FAQs, registry items, RSVP responses and reservations.

## 5. Optional RSVP email

Configure Gmail SMTP variables in `.env`:

```env
SMTP_USER=your@gmail.com
SMTP_FROM="Our Wedding <your@gmail.com>"
SMTP_PASS=your-app-password
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
```

The RSVP is saved even if email delivery fails.

## 6. Production build

```bash
npm run build
npm run start
```

For hosted deployments, point `DB_*` variables to a reachable PostgreSQL server and use persistent storage for uploaded images.
