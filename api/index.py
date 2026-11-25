"""Vercel entry point for the Flask event-registration API."""

import sys
from pathlib import Path

# Ensure repository root is on sys.path so backend package can be imported reliably
root_dir = Path(__file__).resolve().parent.parent
if str(root_dir) not in sys.path:
    sys.path.insert(0, str(root_dir))

from backend.app import app

# Vercel's Python runtime detects this WSGI application automatically.
