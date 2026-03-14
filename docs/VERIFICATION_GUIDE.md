# PEC Portal — Verification Guide (Thunder Client)

## Prerequisites

1. **Thunder Client** extension installed in VS Code
2. **PostgreSQL** running on `localhost:5432` (via Docker or local)
3. **Backend** started with `npm run start:dev`

### Start the database & server

DB Querry:
(PgAdmin 4)
SELECT current_database();
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public';

```powershell
# Terminal 1 — Start PostgreSQL
cd "d:\PEC_APP\Production Hardening done\PEC-Portal\infra"
docker-compose up -d postgres

# Terminal 2 — Start backend
cd "d:\PEC_APP\Production Hardening done\PEC-Portal\backend"
npx prisma migrate deploy
npx prisma generate
npm run start:dev
```

Server will be running on **`http://localhost:3001`**

---

## Thunder Client Test Requests

Open Thunder Client (lightning bolt icon in VS Code sidebar), then create each request:

---

### 1. ✅ API Root — No Auth

| Field | Value |
|-------|-------|
| **Method** | `GET` |
| **URL** | `http://localhost:3001/api` |
| **Headers** | None |
| **Body** | None |

**Expected Response (200):**
```json
{
  "name": "PEC Portal API",
  "version": "1.0.0",
  "status": "running",
  "docs": "/api/docs",
  "endpoints": { ... }
}
```

---

### 2. ✅ Health Check — No Auth

| Field | Value |
|-------|-------|
| **Method** | `GET` |
| **URL** | `http://localhost:3001/api/health` |

**Expected Response (200):**
```json
{
  "status": "OK",
  "database": "Connected",
  "timestamp": "2026-02-28T..."
}
```

> ❌ If you get a database error, PostgreSQL isn't running or `DATABASE_URL` in `.env` is wrong.

---

### 3. ✅ Login

| Field | Value |
|-------|-------|
| **Method** | `POST` |
| **URL** | `http://localhost:3001/api/auth/login` |
| **Headers** | `Content-Type: application/json` |
| **Body (JSON)** | See below |

```json
{
  "email": "admin@pec.edu",
  "password": "password123"
}
```

> ⚠️ Replace with a real user email/password from your database. If no users exist, import them via the admin CSV endpoints first.

**Expected Response (201):**
```json
{
  "message": "Login successful",
  "user": {
    "id": "uuid-here",
    "email": "admin@pec.edu",
    "role": "ADMIN"
  },
  "accessToken": "eyJhbGciOi..."
}
```

> 📋 **Copy the `accessToken` value** — you'll need it for all authenticated requests below.

---

### 4. ✅ Get Profile — Requires Auth

| Field | Value |
|-------|-------|
| **Method** | `GET` |
| **URL** | `http://localhost:3001/api/auth/me` |
| **Auth Tab** | Select **Bearer Token**, paste your `accessToken` |

Or manually add header:
| Header | Value |
|--------|-------|
| `Authorization` | `Bearer eyJhbGciOi...` |

**Expected Response (200):**
```json
{
  "id": "...",
  "email": "admin@pec.edu",
  "role": "ADMIN",
  "isActive": true,
  "student": null,
  "faculty": { ... }
}
```

---

### 5. ✅ Refresh Token

| Field | Value |
|-------|-------|
| **Method** | `POST` |
| **URL** | `http://localhost:3001/api/auth/refresh` |
| **Headers** | `Content-Type: application/json` |
| **Body (JSON)** | See below |

```json
    {
    "refreshToken": "eyJhbGciOi... (from login response)"
    }
```

---

### 6. ✅ Logout — Requires Auth

| Field | Value |
|-------|-------|
| **Method** | `POST` |
| **URL** | `http://localhost:3001/api/auth/logout` |
| **Auth** | Bearer Token |

**Expected Response (201):**
```json
{ "message": "Logged out successfully" }
```

---

### 7. ✅ List Users — Admin Only

| Field | Value |
|-------|-------|
| **Method** | `GET` |
| **URL** | `http://localhost:3001/api/users` |
| **Auth** | Bearer Token (admin) |

---

### 8. ✅ List Courses

| Field | Value |
|-------|-------|
| **Method** | `GET` |
| **URL** | `http://localhost:3001/api/courses` |
| **Auth** | Bearer Token |

---

### 9. ✅ Create Course — Admin/Faculty

| Field | Value |
|-------|-------|
| **Method** | `POST` |
| **URL** | `http://localhost:3001/api/courses` |
| **Auth** | Bearer Token |
| **Body (JSON)** | See below |

```json
{
  "code": "CS101",
  "name": "Introduction to Computer Science",
  "semester": 1,
  "credits": 4,
  "departmentId": "uuid-of-department"
}
```

---

### 10. ✅ Enroll Student

| Field | Value |
|-------|-------|
| **Method** | `POST` |
| **URL** | `http://localhost:3001/api/enrollments` |
| **Auth** | Bearer Token (admin/faculty) |
| **Body (JSON)** | See below |

```json
{
  "studentId": "uuid-of-student",
  "courseId": "uuid-of-course"
}
```

---

### 11. ✅ Mark Attendance — Faculty/Admin

| Field | Value |
|-------|-------|
| **Method** | `POST` |
| **URL** | `http://localhost:3001/api/attendance/mark` |
| **Auth** | Bearer Token |
| **Body (JSON)** | See below |

```json
{
  "studentId": "uuid-of-student",
  "courseId": "uuid-of-course",
  "date": "2026-02-28",
  "status": "PRESENT"
}
```

---

### 12. ✅ Record Grade — Faculty/Admin

| Field | Value |
|-------|-------|
| **Method** | `POST` |
| **URL** | `http://localhost:3001/api/grades/record` |
| **Auth** | Bearer Token |
| **Body (JSON)** | See below |

```json
{
  "studentId": "uuid-of-student",
  "courseId": "uuid-of-course",
  "grade": "A"
}
```

---

### 13. ✅ Import CSV — Admin Only (File Upload)

| Field | Value |
|-------|-------|
| **Method** | `POST` |
| **URL** | `http://localhost:3001/api/admin/import/departments` |
| **Auth** | Bearer Token (admin) |
| **Body Tab** | Select **Form**, add field: `file` → type **File** → pick your CSV |

> Repeat for `/api/admin/import/faculty` and `/api/admin/import/students`.

---

## Thunder Client Tips

1. **Save as Collection**: Click **Collections** → **New Collection** → name it `PEC Portal`. Save each request inside it.
2. **Environment Variables**: Create an environment with:
   - `baseUrl` = `http://localhost:3001/api`
   - `token` = paste your token after login
   
   Then use `{{baseUrl}}/health` and `Bearer {{token}}` in your requests.
3. **Auth Tab shortcut**: Instead of manually typing the `Authorization` header, use the **Auth** tab → select **Bearer** → paste token.

---

## Quick Verification Order

| # | Request | What it proves |
|---|---------|---------------|
| 1 | `GET /api` | Server is running |
| 2 | `GET /api/health` | Database is connected |
| 3 | `POST /api/auth/login` | Auth works, returns token |
| 4 | `GET /api/auth/me` | JWT validation works |
| 5 | `GET /api/courses` | Protected routes work |
| 6 | `POST /api/auth/logout` | Logout clears refresh token |
| 7 | Open `/api/docs` in browser | Swagger UI works |
