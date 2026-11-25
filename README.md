# Campus Manager

A Flask and Supabase-powered backend for managing campus events, users, and registrations.

## Project Structure

```text
├── app.py                      # Root launcher
├── backend/
│   ├── app.py                  # Main Flask application
│   ├── enable_public_user_names.sql # Supabase RLS policies and table grants
│   ├── requirements.txt        # Python package dependencies
│   ├── .env.example            # Environment variables template
│   ├── api.png/                # API contract reference
│   └── database.png/           # Database schema diagram
└── .gitignore
```

## Setup & Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/aryanTmall/campus_manager.git
   cd campus_manager
   ```

2. **Create and activate a virtual environment**:
   ```bash
   python -m venv backend/venv
   # Windows (PowerShell):
   .\backend\venv\Scripts\Activate.ps1
   # macOS/Linux:
   source backend/venv/bin/activate
   ```

3. **Install dependencies**:
   ```bash
   pip install -r backend/requirements.txt
   ```

4. **Configure environment variables**:
   Create a `.env` file inside `backend/`:
   ```bash
   cp backend/.env.example backend/.env
   ```
   Add your Supabase project credentials in `backend/.env`:
   ```env
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_PUBLISHABLE_KEY=your-supabase-anon-key
   ```

5. **Database Setup**:
   Execute `backend/enable_public_user_names.sql` in your Supabase SQL editor to set up row-level security (RLS) and table permissions.

## Running the Application

From the project root:
```bash
python app.py
```
Open [http://127.0.0.1:5000](http://127.0.0.1:5000) to view the application.

## Deployment on Vercel

This repository is ready for a single Vercel project: the Vite frontend is
deployed as static output and the Flask API runs as a Python Serverless
Function at `/api/*`.

1. Import the repository into Vercel using the repository root as the project root.
2. Add `SUPABASE_URL` and `SUPABASE_PUBLISHABLE_KEY` in **Project Settings → Environment Variables** (Production and Preview).
3. Deploy. Vercel uses `vercel.json` to build `frontend/` and route `/api/*` to `api/index.py`.

The deployed browser app calls its own origin for the API automatically; do not
set `VITE_API_URL` in Vercel unless you intentionally use a separate API host.

## Deployment on Render

1. Log into [Render Dashboard](https://dashboard.render.com).
2. Click **New +** and select **Web Service** (or use **Blueprint** pointing to `render.yaml`).
3. Connect your GitHub repository: `aryanTmall/campus_manager`.
4. Configure the service settings:
   - **Environment**: `Python`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `gunicorn app:app`
5. Under **Environment Variables**, add:
   - `SUPABASE_URL`: Your Supabase project URL
   - `SUPABASE_PUBLISHABLE_KEY`: Your Supabase public/anon API key
6. Click **Deploy Web Service**. Render will automatically build, provision, and provide you with a public HTTPS URL (e.g. `https://campus-manager-xxx.onrender.com`).
