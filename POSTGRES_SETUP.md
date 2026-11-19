# Local PostgreSQL setup

1. Create a database named `wedding` in TablePlus or PostgreSQL.
2. Copy `.env.example` to `.env`.
3. Set `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`, and a random `ADMIN_SESSION_SECRET`.
4. Start the app with `npm run dev`.
5. The app applies `postgres/schema.sql` automatically when the first database query runs.
6. Open `/admin/login` and create the first administrator account.

You do not need to seed the tables manually. The admin dashboard manages settings, story, schedule, colours, gallery, FAQ, registry items, RSVP responses and reservations.

## Persistent media with Cloudinary

Create a Cloudinary account and add these variables in `.env` or Vercel:

```env
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
CLOUDINARY_FOLDER=wedding-site
```

When these variables are present, uploaded images and audio are stored persistently in Cloudinary and URLs are saved in PostgreSQL. Without them, uploads fall back to the local `public/uploads` folder for local development.
