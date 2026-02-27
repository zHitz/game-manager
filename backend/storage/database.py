"""
SQLite Storage — Database for scan results, task logs, and emulator data.
"""
import aiosqlite
import sqlite3
import json
import os
from datetime import datetime
from backend.config import config


CREATE_TABLES_SQL = """
CREATE TABLE IF NOT EXISTS scan_results (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    serial TEXT NOT NULL,
    task_type TEXT NOT NULL,
    status TEXT NOT NULL,
    data TEXT,
    is_reliable INTEGER DEFAULT 1,
    validation_errors TEXT,
    duration_ms INTEGER DEFAULT 0,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS task_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    task_id TEXT NOT NULL,
    serial TEXT NOT NULL,
    task_type TEXT NOT NULL,
    status TEXT NOT NULL,
    error TEXT,
    duration_ms INTEGER DEFAULT 0,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS emulator_sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    serial TEXT NOT NULL,
    event TEXT NOT NULL,
    details TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS emulator_data (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    emulator_index  INTEGER NOT NULL,
    serial          TEXT NOT NULL,
    emulator_name   TEXT,

    lord_name       TEXT,
    power           INTEGER DEFAULT 0,
    hall_level      INTEGER DEFAULT 0,
    market_level    INTEGER DEFAULT 0,
    pet_token       INTEGER DEFAULT 0,
    gold            INTEGER DEFAULT 0,
    wood            INTEGER DEFAULT 0,
    ore             INTEGER DEFAULT 0,
    mana            INTEGER DEFAULT 0,

    scan_status     TEXT DEFAULT 'pending',
    scan_duration_ms INTEGER DEFAULT 0,
    raw_ocr_text    TEXT,

    created_at      TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at      TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_scan_serial ON scan_results(serial);
CREATE INDEX IF NOT EXISTS idx_scan_created ON scan_results(created_at);
CREATE INDEX IF NOT EXISTS idx_logs_serial ON task_logs(serial);
CREATE INDEX IF NOT EXISTS idx_emu_data_serial ON emulator_data(serial);
CREATE INDEX IF NOT EXISTS idx_emu_data_index ON emulator_data(emulator_index);
"""


class Database:
    """Async SQLite database wrapper."""

    def __init__(self):
        self.db_path = config.db_path
        self._initialized = False

    def init_sync(self):
        """Initialize database synchronously (for startup)."""
        os.makedirs(os.path.dirname(self.db_path) or ".", exist_ok=True)
        conn = sqlite3.connect(self.db_path)
        conn.executescript(CREATE_TABLES_SQL)
        conn.close()
        self._initialized = True

    def _get_conn(self):
        return aiosqlite.connect(self.db_path)

    # ── Emulator Data (Full Scan) ──

    async def save_emulator_data(
        self,
        emulator_index: int,
        serial: str,
        emulator_name: str,
        parsed_data: dict,
        scan_status: str = "completed",
        scan_duration_ms: int = 0,
        raw_ocr_text: str = "",
    ):
        """Save scan data for an emulator."""
        async with self._get_conn() as db:
            await db.execute(
                """INSERT INTO emulator_data
                   (emulator_index, serial, emulator_name,
                    lord_name, power, hall_level, market_level, pet_token,
                    gold, wood, ore, mana,
                    scan_status, scan_duration_ms, raw_ocr_text)
                   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
                (
                    emulator_index, serial, emulator_name,
                    parsed_data.get("lord_name", ""),
                    parsed_data.get("power", 0),
                    parsed_data.get("hall_level", 0),
                    parsed_data.get("market_level", 0),
                    parsed_data.get("pet_token", 0),
                    parsed_data.get("resources", {}).get("gold", 0),
                    parsed_data.get("resources", {}).get("wood", 0),
                    parsed_data.get("resources", {}).get("ore", 0),
                    parsed_data.get("resources", {}).get("mana", 0),
                    scan_status, scan_duration_ms, raw_ocr_text,
                ),
            )
            await db.commit()

    async def get_emulator_data(self, serial: str = None,
                                 emulator_index: int = None) -> dict | None:
        """Get latest scan data for a specific emulator."""
        async with self._get_conn() as db:
            db.row_factory = aiosqlite.Row
            if serial:
                cursor = await db.execute(
                    "SELECT * FROM emulator_data WHERE serial = ? ORDER BY created_at DESC LIMIT 1",
                    (serial,),
                )
            elif emulator_index is not None:
                cursor = await db.execute(
                    "SELECT * FROM emulator_data WHERE emulator_index = ? ORDER BY created_at DESC LIMIT 1",
                    (emulator_index,),
                )
            else:
                return None
            row = await cursor.fetchone()
            return dict(row) if row else None

    async def get_all_emulator_data(self) -> list[dict]:
        """Get latest scan data for ALL emulators (one row per emulator)."""
        async with self._get_conn() as db:
            db.row_factory = aiosqlite.Row
            cursor = await db.execute(
                """SELECT * FROM emulator_data
                   WHERE id IN (SELECT MAX(id) FROM emulator_data GROUP BY emulator_index)
                   ORDER BY emulator_index""",
            )
            rows = await cursor.fetchall()
            return [dict(row) for row in rows]

    async def get_emulator_scan_history(self, emulator_index: int,
                                         limit: int = 20) -> list[dict]:
        """Get scan history for a specific emulator."""
        async with self._get_conn() as db:
            db.row_factory = aiosqlite.Row
            cursor = await db.execute(
                "SELECT * FROM emulator_data WHERE emulator_index = ? ORDER BY created_at DESC LIMIT ?",
                (emulator_index, limit),
            )
            rows = await cursor.fetchall()
            return [dict(row) for row in rows]

    # ── Legacy Scan Results ──

    async def save_scan_result(self, serial, task_type, status, data,
                                is_reliable, validation_errors, duration_ms):
        async with self._get_conn() as db:
            await db.execute(
                """INSERT INTO scan_results
                   (serial, task_type, status, data, is_reliable, validation_errors, duration_ms)
                   VALUES (?, ?, ?, ?, ?, ?, ?)""",
                (serial, task_type, status, json.dumps(data, default=str),
                 1 if is_reliable else 0, json.dumps(validation_errors), duration_ms),
            )
            await db.commit()

    async def save_task_log(self, task_id, serial, task_type, status,
                             error=None, duration_ms=0):
        async with self._get_conn() as db:
            await db.execute(
                """INSERT INTO task_logs
                   (task_id, serial, task_type, status, error, duration_ms)
                   VALUES (?, ?, ?, ?, ?, ?)""",
                (task_id, serial, task_type, status, error, duration_ms),
            )
            await db.commit()

    async def get_scan_history(self, limit=50, serial=None) -> list[dict]:
        async with self._get_conn() as db:
            db.row_factory = aiosqlite.Row
            if serial:
                cursor = await db.execute(
                    "SELECT * FROM scan_results WHERE serial = ? ORDER BY created_at DESC LIMIT ?",
                    (serial, limit),
                )
            else:
                cursor = await db.execute(
                    "SELECT * FROM scan_results ORDER BY created_at DESC LIMIT ?",
                    (limit,),
                )
            rows = await cursor.fetchall()
            return [
                {**dict(row), "data": json.loads(row["data"]) if row["data"] else {},
                 "validation_errors": json.loads(row["validation_errors"]) if row["validation_errors"] else []}
                for row in rows
            ]

    async def get_task_logs(self, limit=100) -> list[dict]:
        async with self._get_conn() as db:
            db.row_factory = aiosqlite.Row
            cursor = await db.execute(
                "SELECT * FROM task_logs ORDER BY created_at DESC LIMIT ?", (limit,),
            )
            return [dict(row) for row in await cursor.fetchall()]

    async def get_latest_report(self, serial: str) -> dict | None:
        async with self._get_conn() as db:
            db.row_factory = aiosqlite.Row
            cursor = await db.execute(
                "SELECT * FROM scan_results WHERE serial = ? ORDER BY created_at DESC LIMIT 1",
                (serial,),
            )
            row = await cursor.fetchone()
            if row:
                return {**dict(row), "data": json.loads(row["data"]) if row["data"] else {}}
            return None


# Global singleton
database = Database()
