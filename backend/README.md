# Cupid AI — Golang Backend

REST API that handles auth, user management, rate limiting, and orchestrates calls to the AI microservice.

## Setup

### Prerequisites
- Go 1.21+
- PostgreSQL running locally

### 1. Install PostgreSQL

Download from https://www.postgresql.org/download/windows/ and install.

Create the database:
```sql
CREATE DATABASE cupid_ai;
```

### 2. Configure environment

```bash
copy .env.example .env
```

Edit `.env` with your database password and a strong JWT secret.

### 3. Run

```bash
go run ./cmd/api
```

The server starts on `http://localhost:8080`.

## API Endpoints

### Public
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/auth/register` | Create account |
| POST | `/api/v1/auth/login` | Login |
| GET | `/health` | Health check |

### Protected (requires Bearer token)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/analysis` | Analyze conversation |
| GET | `/api/v1/analysis/history` | Get past analyses |
| GET | `/api/v1/profile` | Get profile + stats |
| PATCH | `/api/v1/profile` | Update display name |
