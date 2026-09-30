# VERSA

VERSA is a universal digital money app MVP focused on secure wallet management, transfers, and digital balances.

## Stack
- NestJS
- Prisma
- PostgreSQL
- Redis
- JWT
- Docker

## Quick start

```bash
cd backend
npm install
npx prisma migrate dev --name init
npm run start:dev
```

## Docker

```bash
docker compose up -d
```

## API overview

- POST /api/v1/auth/register
- POST /api/v1/auth/login
- GET /api/v1/wallet/balance
- POST /api/v1/wallet/transfer
- GET /api/v1/wallet/history
```

