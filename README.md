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
