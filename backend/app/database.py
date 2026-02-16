from __future__ import annotations

import sqlite3
import json
from datetime import datetime
from typing import List, Optional
from contextlib import contextmanager
import os

DATABASE_PATH = os.environ.get("DATABASE_PATH", "timetable.db")


def get_db_path() -> str:
    """Get the database file path."""
    return DATABASE_PATH


@contextmanager
def get_db():
    """Context manager for database connections."""
    conn = sqlite3.connect(DATABASE_PATH)
    conn.row_factory = sqlite3.Row
    try:
        yield conn
    finally:
        conn.close()


def init_db():
    """Initialize the database with tables."""
    with get_db() as conn:
        cursor = conn.cursor()
        
        # Events table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS events (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                title TEXT NOT NULL,
                description TEXT,
                start_time TEXT NOT NULL,
                end_time TEXT,
                days TEXT NOT NULL,
                color TEXT DEFAULT '#3B82F6',
                icon TEXT DEFAULT '📅',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)
        
        # Settings table (single row with id=1)
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS settings (
                id INTEGER PRIMARY KEY CHECK (id = 1),
                pin_hash TEXT,
                timezone TEXT DEFAULT 'Pacific/Auckland',
                notifications_enabled INTEGER DEFAULT 0,
                theme TEXT DEFAULT 'default',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)
        
        # PIN attempts tracking for rate limiting
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS pin_attempts (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                ip_address TEXT,
                attempt_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                success INTEGER DEFAULT 0
            )
        """)
        
        conn.commit()
        
        # Insert default settings row if not exists
        cursor.execute("SELECT id FROM settings WHERE id = 1")
        if not cursor.fetchone():
            cursor.execute("INSERT INTO settings (id) VALUES (1)")
            conn.commit()


# ============== Event CRUD Operations ==============

def create_event(event_data: dict) -> dict:
    """Create a new event."""
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO events (title, description, start_time, end_time, days, color, icon)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        """, (
            event_data["title"],
            event_data.get("description"),
            event_data["start_time"],
            event_data.get("end_time"),
            json.dumps(event_data["days"]),
            event_data.get("color", "#3B82F6"),
            event_data.get("icon", "📅")
        ))
        conn.commit()
        event_id = cursor.lastrowid
        return get_event(event_id)


def get_event(event_id: int) -> Optional[dict]:
    """Get a single event by ID."""
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM events WHERE id = ?", (event_id,))
        row = cursor.fetchone()
        if row:
            return _row_to_event(dict(row))
        return None


def get_all_events() -> List[dict]:
    """Get all events."""
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM events ORDER BY start_time")
        rows = cursor.fetchall()
        return [_row_to_event(dict(row)) for row in rows]


def update_event(event_id: int, event_data: dict) -> Optional[dict]:
    """Update an existing event."""
    with get_db() as conn:
        cursor = conn.cursor()
        
        # Build update query dynamically
        fields = []
        values = []
        
        if "title" in event_data:
            fields.append("title = ?")
            values.append(event_data["title"])
        if "description" in event_data:
            fields.append("description = ?")
            values.append(event_data["description"])
        if "start_time" in event_data:
            fields.append("start_time = ?")
            values.append(event_data["start_time"])
        if "end_time" in event_data:
            fields.append("end_time = ?")
            values.append(event_data["end_time"])
        if "days" in event_data:
            fields.append("days = ?")
            values.append(json.dumps(event_data["days"]))
        if "color" in event_data:
            fields.append("color = ?")
            values.append(event_data["color"])
        if "icon" in event_data:
            fields.append("icon = ?")
            values.append(event_data["icon"])
        
        if not fields:
            return get_event(event_id)
        
        fields.append("updated_at = CURRENT_TIMESTAMP")
        values.append(event_id)
        
        cursor.execute(f"""
            UPDATE events SET {', '.join(fields)} WHERE id = ?
        """, values)
        conn.commit()
        
        return get_event(event_id)


def delete_event(event_id: int) -> bool:
    """Delete an event."""
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("DELETE FROM events WHERE id = ?", (event_id,))
        conn.commit()
        return cursor.rowcount > 0


def _row_to_event(row: dict) -> dict:
    """Convert a database row to an event dict."""
    return {
        "id": row["id"],
        "title": row["title"],
        "description": row["description"],
        "start_time": row["start_time"],
        "end_time": row["end_time"],
        "days": json.loads(row["days"]),
        "color": row["color"],
        "icon": row["icon"],
        "created_at": row["created_at"],
        "updated_at": row["updated_at"]
    }


# ============== Settings Operations ==============

def get_settings() -> dict:
    """Get application settings."""
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM settings WHERE id = 1")
        row = cursor.fetchone()
        if row:
            return {
                "timezone": row["timezone"],
                "notifications_enabled": bool(row["notifications_enabled"]),
                "theme": row["theme"],
                "pin_is_set": row["pin_hash"] is not None
            }
        return {
            "timezone": "Pacific/Auckland",
            "notifications_enabled": False,
            "theme": "default",
            "pin_is_set": False
        }


def update_settings(settings_data: dict) -> dict:
    """Update application settings."""
    with get_db() as conn:
        cursor = conn.cursor()
        
        fields = []
        values = []
        
        if "timezone" in settings_data:
            fields.append("timezone = ?")
            values.append(settings_data["timezone"])
        if "notifications_enabled" in settings_data:
            fields.append("notifications_enabled = ?")
            values.append(1 if settings_data["notifications_enabled"] else 0)
        if "theme" in settings_data:
            fields.append("theme = ?")
            values.append(settings_data["theme"])
        
        if fields:
            fields.append("updated_at = CURRENT_TIMESTAMP")
            cursor.execute(f"""
                UPDATE settings SET {', '.join(fields)} WHERE id = 1
            """, values)
            conn.commit()
        
        return get_settings()


def set_pin_hash(pin_hash: str):
    """Set or update the PIN hash."""
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("""
            UPDATE settings SET pin_hash = ?, updated_at = CURRENT_TIMESTAMP WHERE id = 1
        """, (pin_hash,))
        conn.commit()


def get_pin_hash() -> Optional[str]:
    """Get the current PIN hash."""
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT pin_hash FROM settings WHERE id = 1")
        row = cursor.fetchone()
        return row["pin_hash"] if row else None


# ============== PIN Attempts (Rate Limiting) ==============

def record_pin_attempt(ip_address: str, success: bool = False):
    """Record a PIN attempt."""
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO pin_attempts (ip_address, success)
            VALUES (?, ?)
        """, (ip_address, 1 if success else 0))
        conn.commit()


def get_recent_failed_attempts(ip_address: str, minutes: int = 5) -> int:
    """Get count of recent failed attempts from an IP."""
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("""
            SELECT COUNT(*) as count FROM pin_attempts
            WHERE ip_address = ? AND success = 0
            AND attempt_time > datetime('now', ?)
        """, (ip_address, f"-{minutes} minutes"))
        row = cursor.fetchone()
        return row["count"] if row else 0


def clear_old_attempts(hours: int = 24):
    """Clear old PIN attempts."""
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("""
            DELETE FROM pin_attempts WHERE attempt_time < datetime('now', ?)
        """, (f"-{hours} hours",))
        conn.commit()
