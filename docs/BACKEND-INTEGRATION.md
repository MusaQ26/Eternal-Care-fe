Backend integration

- Set `EXPO_PUBLIC_API_URL` to your backend URL (e.g., `http://localhost:4000` or deployed URL).
- The app uses `@react-native-async-storage/async-storage` to store JWT tokens returned from the backend on login/signup.
- The backend expects `Authorization: Bearer <token>` for protected endpoints like `/bookings` and `/profile`.

How the flow works:
1. User signs up / logs in via `/auth/signup` or `/auth/login`.
2. Backend returns `{ user, token }` where `token` is a JWT.
3. The app stores the token locally and uses it to call protected endpoints (`/bookings`, `/profile`).

Notes:
- For local development, use `http://localhost:4000`. On devices/simulators you may need to use your machine IP address instead of `localhost`.
- Ensure `EXPO_PUBLIC_API_URL` is available to Expo (set in `.env` or environment).

Troubleshooting DB connectivity

- If the backend fails to connect to Supabase/Postgres, the server will run in fallback mode using `data.json`.
- Common causes:
  - DNS resolution failure (see `getaddrinfo ENOTFOUND ...` in logs)
  - Local firewall or corporate VPN blocking outbound TCP to Supabase
  - Incorrect `DATABASE_URL` configuration

Quick checks to run on your machine:

```bash
# verify DNS
nslookup db.ziobauvpbdfqinxcwggd.supabase.co
# verify TCP connectivity to the host:port
nc -vz db.ziobauvpbdfqinxcwggd.supabase.co 5432
# or
telnet db.ziobauvpbdfqinxcwggd.supabase.co 5432
```

If the checks fail, adjust network/DNS settings or use a different environment with outbound access to Supabase.
