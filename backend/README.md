# Event Registration API

Run the development server:

```powershell
.\venv\Scripts\python.exe app.py
```

It listens on `http://127.0.0.1:5000`. Configure `SUPABASE_URL` and
`SUPABASE_PUBLISHABLE_KEY` in `.env` before running it.

## Endpoints

| Method | Endpoint | Body / query | Result |
| --- | --- | --- | --- |
| GET | `/api/events` | optional `?status=value` | List events |
| GET | `/api/events/{id}` | | Event details |
| POST | `/api/registrations` | `{"user_id":"uuid","event_id":"uuid"}` | Create registration (`201`, or `409` if duplicate/full) |
| GET | `/api/me/registrations` | required `?user_id=uuid` | Registrations for that user |
| GET | `/api/events/{id}/registrations` | | Registrations and attendee details |

There is deliberately no authentication or authorization yet. Consequently,
`user_id` is an explicit input to the personal-registration endpoint and the
attendee list is public. Add authentication and row-level security before
exposing this service outside development.
