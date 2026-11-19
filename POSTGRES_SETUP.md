# Local PostgreSQL setup

1. Create a database named `wedding` in TablePlus or PostgreSQL.
2. Copy `.env.example` to `.env`.
3. Set `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`, and a random `ADMIN_SESSION_SECRET`.
4. Start the app with `npm run dev`.
5. The app applies `postgres/schema.sql` automatically when the first database query runs.
6. Open `/admin/login` and create the first administrator account.

You do not need to seed the tables manually. The admin dashboard manages settings, story, schedule, colours, gallery, FAQ, registry items, RSVP responses and reservations.
