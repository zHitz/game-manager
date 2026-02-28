"""
Full Scan Pipeline — Orchestrator for capture -> PDF -> OCR -> parse -> save.

Runs the complete scan pipeline for one or more emulators in background threads.
Broadcasts WebSocket progress events at each step.
"""
import time
import threading
import os
from backend.config import config
from backend.core.macro_replay import _get_adb_serial

# Track scan state
_running_scans = {}
_lock = threading.Lock()

WORK_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))),
                         "data", "scan_captures")


def _scan_worker(emulator_index: int, emulator_name: str,
                  ws_callback=None):
    """Background thread: runs full scan pipeline for one emulator."""
    serial = _get_adb_serial(emulator_index)
    key = f"scan-{emulator_index}"

    try:
        start_time = time.time()

        with _lock:
            _running_scans[key] = {
                "status": "running",
                "emulator_index": emulator_index,
                "emulator_name": emulator_name,
                "serial": serial,
                "step": "starting",
                "start_time": start_time,
            }

        def _broadcast(step, detail=""):
            with _lock:
                if key in _running_scans:
                    _running_scans[key]["step"] = step
            if ws_callback:
                ws_callback("scan_progress", {
                    "emulator_index": emulator_index,
                    "serial": serial,
                    "step": step,
                    "detail": detail,
                })

        # ── Step 1: Capture Screenshots ──
        _broadcast("capturing", "Navigating and capturing screenshots...")
        from backend.core.screen_capture import run_full_capture

        def progress_cb(phase, step, total):
            _broadcast(f"capturing ({step}/{total})", f"Phase: {phase}")

        pdf_path = run_full_capture(serial, WORK_DIR, progress_callback=progress_cb)

        if not pdf_path:
            raise RuntimeError("Screenshot capture failed - no PDF created")

        # ── Step 2: OCR API ──
        _broadcast("ocr_processing", "Uploading PDF to OCR API...")
        from backend.core.ocr_client import run_ocr

        ocr_result = run_ocr(pdf_path)

        if not ocr_result["success"]:
            raise RuntimeError(f"OCR failed: {ocr_result['error']}")

        _broadcast("parsing", "Parsing OCR results...")

        parsed_data = ocr_result["parsed"]
        raw_text = ocr_result["text"]

        # ── Step 3: Save to Database ──
        _broadcast("saving", "Saving to database...")
        import asyncio
        from backend.storage.database import database

        elapsed_ms = int((time.time() - start_time) * 1000)

        # Run async save in event loop
        async def _save():
            await database.save_scan_snapshot(
                emulator_index=emulator_index,
                serial=serial,
                emulator_name=emulator_name,
                parsed_data=parsed_data,
                scan_status="completed",
                scan_duration_ms=elapsed_ms,
                raw_ocr_text=raw_text,
            )

        try:
            loop = asyncio.get_event_loop()
            if loop.is_running():
                asyncio.run_coroutine_threadsafe(_save(), loop).result(timeout=10)
            else:
                loop.run_until_complete(_save())
        except RuntimeError:
            asyncio.run(_save())

        # ── Done ──
        with _lock:
            _running_scans[key] = {
                "status": "completed",
                "emulator_index": emulator_index,
                "emulator_name": emulator_name,
                "serial": serial,
                "step": "done",
                "elapsed_ms": elapsed_ms,
                "data": parsed_data,
            }

        if ws_callback:
            ws_callback("scan_completed", {
                "emulator_index": emulator_index,
                "serial": serial,
                "elapsed_ms": elapsed_ms,
                "data": parsed_data,
            })

        print(f"[FullScan] Completed #{emulator_index} ({emulator_name}) in {elapsed_ms}ms")

    except Exception as e:
        import traceback
        traceback.print_exc()

        with _lock:
            _running_scans[key] = {
                "status": "failed",
                "emulator_index": emulator_index,
                "serial": serial,
                "step": "error",
                "error": str(e),
            }

        if ws_callback:
            ws_callback("scan_failed", {
                "emulator_index": emulator_index,
                "serial": serial,
                "error": str(e),
            })


def start_full_scan(emulator_index: int, emulator_name: str = "",
                     ws_callback=None) -> dict:
    """Start a full scan for one emulator in a background thread."""
    key = f"scan-{emulator_index}"

    with _lock:
        existing = _running_scans.get(key)
        if existing and existing.get("status") == "running":
            return {"success": False, "error": f"Scan already running on #{emulator_index}"}

    thread = threading.Thread(
        target=_scan_worker,
        args=(emulator_index, emulator_name, ws_callback),
        daemon=True,
    )
    thread.start()

    return {
        "success": True,
        "emulator_index": emulator_index,
        "serial": _get_adb_serial(emulator_index),
    }


def stop_scan(emulator_index: int) -> dict:
    """Stop a running scan."""
    key = f"scan-{emulator_index}"
    with _lock:
        if key in _running_scans:
            del _running_scans[key]
            return {"success": True}
    return {"success": False, "error": "Scan not running"}


def get_scan_status() -> list[dict]:
    """Get status of all scans."""
    with _lock:
        return list(_running_scans.values())
