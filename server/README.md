# Ajay Tour and Travels – API (Stage 1)

Implemented: env validation, MongoDB models (10), security middleware (Helmet, strict CORS allowlist,
rate limits, NoSQL-operator scrubbing, 20 kB body limit), centralized errors, public read API,
inquiry submission (validation, sanitization, dedupe, honeypot, reference numbers, optional SMTP email).

```bash
cd server
cp .env.example .env     # fill MONGODB_URI and JWT_SECRET
npm install
npm test                 # uses an in-memory MongoDB
npm run dev
curl localhost:5000/api/health
```
Not yet built: admin auth + CRUD (Stage 2), frontend (Stages 3-4), SEO/pre-rendering (Stage 5), seed + deploy docs (Stage 6).
