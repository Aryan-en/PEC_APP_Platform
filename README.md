# PEC-Portal
Full Fledged College App Designed for Punjab Engineering College


Tech Stack ->
Next.js + Flutter + NestJS + PostgreSQL + Redis + Docker + AWS


-----------------------------------------
How To Check Everything Is Working ->

Use this quick checklist after setup or before pushing changes.

1) Start infrastructure (Postgres + Redis)

```powershell
cd infra
docker-compose up -d postgres redis
docker-compose ps
```

Expected:
- `postgres` is up on port `5432`
- `redis` is up on port `6379`

PostgreSQL check (recommended):

```powershell
cd infra
docker-compose ps postgres
docker-compose exec postgres pg_isready -U pec_admin -d pec_db
docker-compose exec postgres psql -U pec_admin -d pec_db -c "SELECT current_database(), now();"
```

Expected:
- `State` shows `Up` for `postgres`
- `pg_isready` returns `accepting connections`
- SQL query returns `pec_db` and a current timestamp

If it fails, inspect logs:

```powershell
cd infra
docker-compose logs postgres --tail=100
```

PostgreSQL check in PgAdmin 4:

1. Open PgAdmin 4 -> right click `Servers` -> `Register` -> `Server`.
2. In `General` tab, set Name: `PEC Local Postgres`.
3. In `Connection` tab, use:
	- Host name/address: `localhost`
	- Port: `5432`
	- Maintenance database: `pec_db`
	- Username: `pec_admin`
	- Password: `strongpassword123`
4. Click `Save`.
5. Open `Query Tool` and run:

```sql
SELECT current_database();
SELECT now();
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;
```

Expected in PgAdmin 4:
- Server status is connected (green/active).
- `current_database()` returns `pec_db`.
- `now()` returns current timestamp.
- Public tables are listed (after migrations run).

2) Start backend API

```powershell
cd backend
npm install
npx prisma generate
npx prisma migrate deploy
npm run start:dev
```

Expected:
- API starts on `http://localhost:3001`
- Swagger available at `http://localhost:3001/api/docs`
- Health endpoint returns OK at `http://localhost:3001/api/health`

3) Run backend automated checks

```powershell
cd backend
npm run lint
npm run test
npm run test:e2e
```

Expected:
- Lint passes
- Unit and e2e tests pass

4) Start frontend (Vite app)

```powershell
cd Client_End
npm install
npm run dev
```

Expected:
- App opens on Vite dev URL (usually `http://localhost:5173`)
- Frontend pages load without console/runtime errors

5) Run frontend automated checks

```powershell
cd Client_End
npm run lint
npm run build
```

Expected:
- Lint passes
- Production build succeeds

6) Thunder Client API smoke checks (detailed)

Open Thunder Client in VS Code and create a collection named `PEC Backend Smoke`.

Create an Environment (recommended):
- `baseUrl` = `http://localhost:3001/api`
- `token` = (leave empty initially)

Then create and run requests in this exact order:

1. Request: `GET {{baseUrl}}`
	- Auth: None
	- Expected status: `200`
	- Expected body contains:
	  - `name: "PEC Portal API"`
	  - `status: "running"`
	  - `docs: "/api/docs"`

2. Request: `GET {{baseUrl}}/health`
	- Auth: None
	- Expected status: `200`
	- Expected body contains:
	  - `status` is `ok` or `OK`
	  - `database` is `connected` or `Connected`

3. Request: `POST {{baseUrl}}/auth/login`
	- Headers:
	  - `Content-Type: application/json`
	- Body (JSON):
```json
{
  "email": "admin@pec.edu",
  "password": "password123"
}
```
	- Expected status: `200` or `201`
	- Expected body contains:
	  - `accessToken`
	  - `user`
	- Action:
	  - Copy `accessToken` value into Thunder Client environment variable `token`.

4. Request: `GET {{baseUrl}}/auth/me`
	- Auth tab: `Bearer`
	- Token: `{{token}}`
	- Expected status: `200`
	- Expected body contains current user profile (id/email/role).

5. Request: `GET {{baseUrl}}/users`
	- Auth: Bearer `{{token}}`
	- Expected status:
	  - `200` for admin token
	  - `403` for non-admin token

6. Request: `GET {{baseUrl}}/courses`
	- Auth: Bearer `{{token}}`
	- Expected status: `200`
	- Expected body: array/object of course data.

7. Request: `POST {{baseUrl}}/auth/logout`
	- Auth: Bearer `{{token}}`
	- Expected status: `200` or `201`
	- Expected body contains logout success message.

Failure triage checklist:
- If request 1 fails: backend is not running or wrong port.
- If request 2 fails: database connectivity issue (check docker + env).
- If request 3 fails with `401`: invalid credentials or user missing.
- If request 4 fails with `401/403`: token missing/expired/invalid.
- If protected endpoints fail unexpectedly: role mismatch or authorization guard behavior.

Detailed API request-by-request guide: `docs/VERIFICATION_GUIDE.md`

Quick pass criteria:
- DB + Redis are healthy
- Backend starts and `/api/health` reports database connected
- Frontend starts and can call backend routes
- Lint/tests/build pass for the components you changed
