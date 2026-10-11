# Rentzquip Backend

Rentzquip is a rental platform backend built with Node.js, Express, TypeScript, Prisma, and PostgreSQL. It handles user auth, provider management, equipment listings, rentals, payments, and email workflows.

This project is made to power a smooth rental system where users can browse equipment, book rentals, and pay online.

## What this app includes

- User signup, login, and Google auth
- JWT-based access and refresh tokens
- Cookie-based auth
- Provider management
- Category and equipment management
- Rental booking and status tracking
- Late fee logic
- Stripe payment flow and webhook handling
- Email sending for OTP and account updates
- Cloudinary image upload support
- Redis for caching and background setup

## Tech stack

- Node.js
- TypeScript
- Express
- PostgreSQL
- Prisma ORM
- Redis
- Stripe
- Cloudinary
- Nodemailer
- JWT
- Zod

## Project structure

```bash
.
├── API_Docs/
│   └── Rentzquip.postman_collection.json
├── prisma/
│   ├── migrations/
│   └── schema/
├── src/
│   ├── app/
│   ├── generated/
│   ├── app.ts
│   └── server.ts
├── package.json
├── tsconfig.json
├── tsup.config.ts
├── vercel.json
└── README.md
```

## Prerequisites

Before you run this project, make sure you have:

- Node.js 18 or newer
- PostgreSQL installed and running
- Redis installed and running
- A Stripe account for payment setup
- A Cloudinary account for image uploads
- An email provider for SMTP

## Setup

1. Open the project folder
2. Install dependencies:

```bash
npm install
```

3. Create a `.env` file in the root folder
4. Add your environment variables

## Environment variables

Use values like this in your `.env` file:

```env
NODE_ENV=development
PORT=5000
DATABASE_URL="postgresql://postgres:123456@localhost:5432/rentzquip?schema=public"
APP_URL="http://localhost:5000"
FRONTEND_URL="http://localhost:3000"

BCRYPT_SALT_ROUNDS=10
JWT_ACCESS_SECRET=your_access_secret
JWT_REFRESH_SECRET=your_refresh_secret
JWT_ACCESS_EXPIRES_IN=1d
JWT_REFRESH_EXPIRES_IN=7d

REDIS_USER=default
REDIS_PASSWORD=your_redis_password
REDIS_HOST=localhost
REDIS_PORT=6379

SMTP_USER=your_email
SMTP_PASSWORD=your_email_password
EMAIL_SENDER=your_sender_email

TEST_ADMIN_EMAIL=admin@example.com
TEST_ADMIN_PASSWORD=admin123
TEST_ADMIN_NAME=Admin User

TEST_MOD_EMAIL=mod@example.com
TEST_MOD_PASSWORD=mod123
TEST_MOD_NAME=Moderator User

TEST_PROVIDER_EMAIL=provider@example.com
TEST_PROVIDER_PASSWORD=provider123
TEST_PROVIDER_NAME=Provider User

TEST_USER_EMAIL=user@example.com
TEST_USER_PASSWORD=user123
TEST_USER_NAME=Regular User

GOOGLE_CLIENT_ID=your_google_client_id

CLOUDINARY_CLOUDE_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_webhook_secret
LATE_FEE_RATE=0.05
```

## Database setup

This project uses Prisma with PostgreSQL.

Run these commands:

```bash
npx prisma generate
npx prisma migrate dev
```

If you want to reset the database:

```bash
npx prisma migrate reset
```

## Run the app

For local development:

```bash
npm run dev
```

For production build:

```bash
npm run build
npm run start
```

## Useful scripts

```bash
npm run dev
npm run build
npm run start
npm run lint:check
npm run lint:fix
npm run formate:check
npm run formate:fix
```

## API docs

The Postman collection is inside:

- `API_Docs/Rentzquip.postman_collection.json`

You can import that file into Postman and test the endpoints quickly.

## Notes

- The app starts Redis, Prisma, and email verification checks on boot.
- Seed users are created automatically when the server starts.
- The backend is set up to work with a frontend using cookies and CORS.

## License

This project is under the ISC license.
