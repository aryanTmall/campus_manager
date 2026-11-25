"""Public event-registration API.

Authentication is deliberately not enabled yet. Until it is, endpoints that
would normally infer the current user accept an explicit ``user_id`` instead.
"""

import os
from pathlib import Path
from uuid import UUID

from dotenv import load_dotenv
from flask import Flask, jsonify, request
from httpx import HTTPError
from postgrest import APIError
from supabase import Client, create_client


env_path = Path(__file__).resolve().parent / ".env"
load_dotenv(dotenv_path=env_path)

app = Flask(__name__)

supabase_url = os.environ.get("SUPABASE_URL")
supabase_key = os.environ.get("SUPABASE_PUBLISHABLE_KEY")
if not supabase_url or not supabase_key:
    raise ValueError(
        "Missing SUPABASE_URL or SUPABASE_PUBLISHABLE_KEY environment variables. "
        "Set them in your environment or in backend/.env"
    )

supabase: Client = create_client(supabase_url, supabase_key)


@app.after_request
def add_cors_headers(response):
    """Allow a separately-hosted frontend while authentication is disabled."""
    response.headers["Access-Control-Allow-Origin"] = "*"
    response.headers["Access-Control-Allow-Headers"] = "Content-Type"
    response.headers["Access-Control-Allow-Methods"] = "GET, POST, OPTIONS"
    return response


@app.route("/api/<path:_path>", methods=["OPTIONS"])
def options(_path):
    return "", 204


def error(message, status_code, *, details=None):
    body = {"error": message}
    if details:
        body["details"] = details
    return jsonify(body), status_code


def validate_uuid(value, field_name):
    if not value or not isinstance(value, str):
        return None, error(f"{field_name} is required and must be a UUID.", 400)
    try:
        UUID(value)
    except ValueError:
        return None, error(f"{field_name} must be a valid UUID.", 400)
    return value, None


def database_error(exc):
    # Do not leak provider details or credentials to API consumers.
    app.logger.exception("Supabase request failed", exc_info=exc)
    return error("Database request failed.", 502)


def get_event(event_id):
    response = supabase.table("events").select("*").eq("id", event_id).limit(1).execute()
    return response.data[0] if response.data else None


@app.get("/")
def index():
    # Fetch events safely
    events = []
    events_error = None
    try:
        events_resp = supabase.table("events").select("id,organizer_id,title,capacity,status").order("title").execute()
        events = events_resp.data or []
    except Exception as exc:
        events_error = str(exc)

    # Fetch users safely
    users = []
    users_error = None
    try:
        users_resp = supabase.table("users").select("id,email,role").execute()
        users = users_resp.data or []
    except Exception as exc:
        users_error = str(exc)

    # Return JSON if client expects json or requests it explicitly
    if request.headers.get("Accept") == "application/json" or request.args.get("format") == "json":
        return jsonify({
            "service": "event-registration-api",
            "status": "ok",
            "database": {
                "events": events if not events_error else {"error": events_error},
                "users": users if not users_error else {"error": users_error}
            }
        })

    # Render HTML Dashboard for browser visits
    events_html = ""
    if events:
        events_html = "".join([
            f'<div class="card"><h3>{e.get("title", "Untitled")}</h3>'
            f'<p><strong>Status:</strong> <span class="badge">{e.get("status", "N/A")}</span> &bull; '
            f'<strong>Capacity:</strong> {e.get("capacity", "Unlimited")}</p>'
            f'<small>Event ID: <code>{e.get("id")}</code></small></div>'
            for e in events
        ])
    elif events_error:
        events_html = (
            '<div class="alert warning">'
            '<strong>Events table access restricted:</strong> Supabase returned permission denied on public.events.<br>'
            'Run the SQL commands from <code>backend/setup_database_permissions.sql</code> in your '
            '<a href="https://supabase.com/dashboard" target="_blank">Supabase SQL Editor</a> to enable public access.'
            '</div>'
        )
    else:
        events_html = '<p class="empty-state">No events found in database.</p>'

    users_html = ""
    if users:
        users_html = "".join([
            f'<li class="user-item"><div><strong>{u.get("email", "No email")}</strong> '
            f'<span class="badge">{u.get("role", "user")}</span></div>'
            f'<small><code>{u.get("id")}</code></small></li>'
            for u in users
        ])
    elif users_error:
        users_html = f'<p class="error-text">Error loading users: {users_error}</p>'
    else:
        users_html = '<p class="empty-state">No users found.</p>'

    html = f'''<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Campus Manager - Event Registration API</title>
    <style>
        :root {{
            --bg: #0f172a;
            --surface: #1e293b;
            --border: #334155;
            --text: #f8fafc;
            --text-muted: #94a3b8;
            --primary: #38bdf8;
            --accent: #22c55e;
            --warning: #f59e0b;
        }}
        * {{ box-sizing: border-box; margin: 0; padding: 0; }}
        body {{
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            background: var(--bg);
            color: var(--text);
            line-height: 1.6;
            padding: 2rem 1rem;
        }}
        .container {{ max-width: 900px; margin: 0 auto; }}
        header {{ margin-bottom: 2rem; border-bottom: 1px solid var(--border); padding-bottom: 1rem; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem; }}
        h1 {{ font-size: 1.8rem; font-weight: 700; color: #fff; }}
        .status-pill {{ background: rgba(34, 197, 94, 0.15); color: var(--accent); padding: 0.3rem 0.8rem; border-radius: 9999px; font-size: 0.85rem; font-weight: 600; border: 1px solid rgba(34, 197, 94, 0.3); }}
        section {{ background: var(--surface); border: 1px solid var(--border); border-radius: 10px; padding: 1.5rem; margin-bottom: 1.5rem; }}
        h2 {{ font-size: 1.25rem; margin-bottom: 1rem; color: var(--primary); }}
        .card {{ background: rgba(15, 23, 42, 0.6); border: 1px solid var(--border); border-radius: 8px; padding: 1rem; margin-bottom: 0.75rem; }}
        .badge {{ background: #334155; color: #e2e8f0; padding: 0.2rem 0.5rem; border-radius: 4px; font-size: 0.75rem; text-transform: uppercase; font-weight: 600; }}
        ul {{ list-style: none; }}
        .user-item {{ padding: 0.6rem 0; border-bottom: 1px solid rgba(51, 65, 85, 0.5); display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 0.5rem; }}
        .user-item:last-child {{ border-bottom: none; }}
        code {{ font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 0.8rem; color: #cbd5e1; background: rgba(0,0,0,0.3); padding: 0.15rem 0.4rem; border-radius: 4px; }}
        .alert {{ padding: 1rem; border-radius: 8px; margin-bottom: 1rem; font-size: 0.9rem; }}
        .alert.warning {{ background: rgba(245, 158, 11, 0.15); border: 1px solid var(--warning); color: #fde68a; }}
        .alert a {{ color: var(--primary); text-decoration: underline; }}
        .api-links {{ display: flex; gap: 0.75rem; flex-wrap: wrap; margin-top: 0.5rem; }}
        .btn {{ display: inline-block; background: #334155; color: #fff; text-decoration: none; padding: 0.4rem 0.8rem; border-radius: 6px; font-size: 0.85rem; font-weight: 500; transition: background 0.2s; }}
        .btn:hover {{ background: #475569; }}
        .empty-state {{ color: var(--text-muted); font-style: italic; }}
    </style>
</head>
<body>
    <div class="container">
        <header>
            <div>
                <h1>Campus Manager</h1>
                <p style="color: var(--text-muted); font-size: 0.9rem;">Event Registration Backend API</p>
            </div>
            <span class="status-pill">&bull; Service Online</span>
        </header>

        <section>
            <h2>Database Events</h2>
            {events_html}
        </section>

        <section>
            <h2>Database Users ({len(users)})</h2>
            <ul>{users_html}</ul>
        </section>

        <section>
            <h2>API Endpoints</h2>
            <div class="api-links">
                <a class="btn" href="/api/events" target="_blank">GET /api/events</a>
                <a class="btn" href="/api/users" target="_blank">GET /api/users</a>
                <a class="btn" href="/?format=json" target="_blank">GET /?format=json</a>
            </div>
        </section>
    </div>
</body>
</html>'''
    return html


@app.get("/api/users")
def list_users():
    """List all registered users."""
    try:
        response = supabase.table("users").select("id,email,role").execute()
        return jsonify({"data": response.data or []})
    except (APIError, HTTPError) as exc:
        return database_error(exc)


@app.get("/api/events")
def list_events():
    """Browse events, optionally filtered by their status."""
    try:
        query = supabase.table("events").select("id,organizer_id,title,capacity,status")
        if status := request.args.get("status"):
            query = query.eq("status", status)
        response = query.order("title").execute()
        return jsonify({"data": response.data or []})
    except (APIError, HTTPError) as exc:
        return database_error(exc)


@app.get("/api/events/<event_id>")
def event_details(event_id):
    _, validation_error = validate_uuid(event_id, "event_id")
    if validation_error:
        return validation_error
    try:
        event = get_event(event_id)
        if not event:
            return error("Event not found.", 404)
        return jsonify({"data": event})
    except (APIError, HTTPError) as exc:
        return database_error(exc)


@app.post("/api/registrations")
def create_registration():
    """Register a supplied user for an event; duplicate/full registrations are 409."""
    payload = request.get_json(silent=True)
    if not isinstance(payload, dict):
        return error("A JSON request body is required.", 400)

    user_id, validation_error = validate_uuid(payload.get("user_id"), "user_id")
    if validation_error:
        return validation_error
    event_id, validation_error = validate_uuid(payload.get("event_id"), "event_id")
    if validation_error:
        return validation_error

    try:
        event = get_event(event_id)
        if not event:
            return error("Event not found.", 404)

        existing = (
            supabase.table("registrations")
            .select("id")
            .eq("user_id", user_id)
            .eq("event_id", event_id)
            .limit(1)
            .execute()
        )
        if existing.data:
            return error("User is already registered for this event.", 409)

        registrations = (
            supabase.table("registrations").select("id", count="exact").eq("event_id", event_id).execute()
        )
        if event.get("capacity") is not None and (registrations.count or 0) >= event["capacity"]:
            return error("Event capacity has been reached.", 409)

        response = (
            supabase.table("registrations")
            .insert({"user_id": user_id, "event_id": event_id})
            .select("id,user_id,event_id,created_at")
            .execute()
        )
        return jsonify({"data": response.data[0]}), 201
    except (APIError, HTTPError) as exc:
        # A database unique constraint is the final safeguard for duplicate
        # submissions arriving concurrently.
        if getattr(exc, "code", None) == "23505":
            return error("User is already registered for this event.", 409)
        return database_error(exc)


@app.get("/api/me/registrations")
def my_registrations():
    """List a user's registrations. user_id replaces auth context for now."""
    user_id, validation_error = validate_uuid(request.args.get("user_id"), "user_id")
    if validation_error:
        return validation_error
    try:
        response = (
            supabase.table("registrations")
            .select("id,user_id,event_id,created_at,events(id,title,capacity,status,organizer_id)")
            .eq("user_id", user_id)
            .order("created_at", desc=True)
            .execute()
        )
        return jsonify({"data": response.data or []})
    except (APIError, HTTPError) as exc:
        return database_error(exc)


@app.get("/api/events/<event_id>/registrations")
def event_registrations(event_id):
    """Public attendee list for now; organizer authorization will be added later."""
    _, validation_error = validate_uuid(event_id, "event_id")
    if validation_error:
        return validation_error
    try:
        if not get_event(event_id):
            return error("Event not found.", 404)
        response = (
            supabase.table("registrations")
            .select("id,user_id,event_id,created_at,users(id,email,role)")
            .eq("event_id", event_id)
            .order("created_at", desc=False)
            .execute()
        )
        return jsonify({"data": response.data or []})
    except (APIError, HTTPError) as exc:
        return database_error(exc)


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=False)
