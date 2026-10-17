#!/usr/bin/env python3
"""Локальный сервер сайта и админки. Пароль читается из admin.secret."""

import json
import re
import secrets
import threading
import time
from email import policy
from email.parser import BytesParser
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import urlparse

ROOT = Path(__file__).resolve().parent
SECRET_FILE = ROOT / "admin.secret"
EXTRA_FILE = ROOT / "data" / "works-extra.json"
CUSTOM_DIR = ROOT / "media" / "custom"
USERNAME = "aliewilleatyxu"
MAX_BYTES = 200 * 1024 * 1024
TOKEN_TTL = 12 * 60 * 60
AUDIO_EXT = {".mp3", ".wav", ".ogg", ".m4a"}
VIDEO_EXT = {".mp4", ".webm", ".mov"}
CATEGORIES = {
    "score": ("Саундтрек", "Музыка", "#e7a23a", "Саундтрек."),
    "ambient": ("Эмбиент", "Музыка", "#9ec9ff", "Эмбиент."),
    "design": ("Удары", "Саунд-дизайн", "#ff6a3d", "Набор ударов."),
    "video": ("Видео", "Саунд к кадру", "#c4b2ff", "Видео из сессии."),
}
DURATION = re.compile(r"^\d{1,3}:\d{2}$")
TOKENS = {}
ATTEMPTS = {}
LOCK = threading.Lock()


def password():
    if not SECRET_FILE.is_file():
        raise RuntimeError("Нет файла admin.secret")
    return SECRET_FILE.read_text(encoding="utf-8").strip()


def same(left, right):
    left_b = left.encode("utf-8")
    right_b = right.encode("utf-8")
    if len(left_b) != len(right_b):
        return False
    return secrets.compare_digest(left_b, right_b)


def clean_text(value, limit):
    text = " ".join(str(value or "").split())
    text = "".join(ch for ch in text if ch.isprintable())
    return text[:limit].strip()


def load_extra():
    if not EXTRA_FILE.is_file():
        return []
    data = json.loads(EXTRA_FILE.read_text(encoding="utf-8"))
    return data if isinstance(data, list) else []


def save_extra(items):
    EXTRA_FILE.parent.mkdir(parents=True, exist_ok=True)
    EXTRA_FILE.write_text(json.dumps(items, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def signature_ok(ext, blob):
    if len(blob) < 12:
        return False
    if ext == ".mp3":
        return blob.startswith(b"ID3") or (blob[0] == 0xFF and (blob[1] & 0xE0) == 0xE0)
    if ext == ".wav":
        return blob.startswith(b"RIFF") and blob[8:12] == b"WAVE"
    if ext == ".ogg":
        return blob.startswith(b"OggS")
    if ext in {".mp4", ".m4a", ".mov"}:
        return blob[4:8] == b"ftyp"
    if ext == ".webm":
        return blob.startswith(b"\x1a\x45\xdf\xa3")
    return False


class Handler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(ROOT), **kwargs)

    def end_headers(self):
        self.send_header("X-Content-Type-Options", "nosniff")
        self.send_header("Referrer-Policy", "no-referrer")
        super().end_headers()

    def do_GET(self):
        path = urlparse(self.path).path
        if path in {"/admin.secret", "/server.py"} or path.startswith("/.git"):
            self.send_error(404)
            return
        if path == "/api/me":
            self.send_json({"ok": self.authorized()})
            return
        super().do_GET()

    def do_POST(self):
        path = urlparse(self.path).path
        try:
            if path == "/api/login":
                self.login()
            elif path == "/api/logout":
                self.logout()
            elif path == "/api/works":
                self.add_work()
            elif path == "/api/works/delete":
                self.delete_work()
            else:
                self.send_error(404)
        except ValueError as error:
            self.send_json({"error": str(error)}, 400)
        except Exception:
            self.send_json({"error": "Не удалось сохранить работу."}, 500)

    def client_ip(self):
        return self.client_address[0]

    def limited(self):
        now = time.time()
        ip = self.client_ip()
        recent = [stamp for stamp in ATTEMPTS.get(ip, []) if now - stamp < 600]
        ATTEMPTS[ip] = recent
        if len(recent) >= 8:
            return True
        recent.append(now)
        return False

    def read_body(self, limit):
        length = int(self.headers.get("Content-Length", "0") or "0")
        if length < 0 or length > limit:
            raise ValueError("Слишком большой запрос.")
        return self.rfile.read(length)

    def token_from_cookie(self):
        raw = self.headers.get("Cookie", "")
        for part in raw.split(";"):
            name, _, value = part.strip().partition("=")
            if name == "alie_session":
                return value
        return ""

    def authorized(self):
        token = self.token_from_cookie()
        expiry = TOKENS.get(token)
        if not token or expiry is None:
            return False
        if expiry < time.time():
            TOKENS.pop(token, None)
            return False
        return True

    def require_auth(self):
        if not self.authorized():
            self.send_json({"error": "Нужен вход."}, 401)
            return False
        return True

    def login(self):
        if self.limited():
            self.send_json({"error": "Слишком много попыток. Подождите."}, 429)
            return
        payload = json.loads(self.read_body(10000).decode("utf-8"))
        user = str(payload.get("username", ""))
        secret = str(payload.get("password", ""))
        if not (same(user, USERNAME) and same(secret, password())):
            self.send_json({"error": "Неверный логин или пароль."}, 401)
            return
        token = secrets.token_urlsafe(32)
        TOKENS[token] = time.time() + TOKEN_TTL
        self.send_response(200)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header(
            "Set-Cookie",
            f"alie_session={token}; HttpOnly; SameSite=Strict; Path=/; Max-Age={TOKEN_TTL}",
        )
        self.end_headers()
        self.wfile.write(b'{"ok":true}')

    def logout(self):
        TOKENS.pop(self.token_from_cookie(), None)
        self.send_response(200)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Set-Cookie", "alie_session=; HttpOnly; SameSite=Strict; Path=/; Max-Age=0")
        self.end_headers()
        self.wfile.write(b'{"ok":true}')

    def parse_form(self):
        body = self.read_body(MAX_BYTES + 1024 * 1024)
        ctype = self.headers.get("Content-Type", "")
        if "multipart/form-data" not in ctype:
            raise ValueError("Нужна форма с файлом.")
        header = f"Content-Type: {ctype}\r\nMIME-Version: 1.0\r\n\r\n".encode("utf-8")
        message = BytesParser(policy=policy.default).parsebytes(header + body)
        fields = {}
        upload = None
        if not message.is_multipart():
            raise ValueError("Нужна форма с файлом.")
        for part in message.iter_parts():
            name = part.get_param("name", header="content-disposition")
            filename = part.get_filename()
            data = part.get_payload(decode=True) or b""
            if filename:
                upload = (filename, data)
            elif name:
                fields[name] = data.decode("utf-8", "replace")
        return fields, upload

    def add_work(self):
        if not self.require_auth():
            return
        fields, upload = self.parse_form()
        if not upload:
            raise ValueError("Выберите аудио или видео.")
        original, blob = upload
        if len(blob) > MAX_BYTES:
            raise ValueError("Файл больше 200 МБ.")
        ext = Path(original).suffix.lower()
        if ext not in AUDIO_EXT | VIDEO_EXT or not signature_ok(ext, blob):
            raise ValueError("Нужен файл mp3, wav, ogg, m4a, mp4, webm или mov.")
        cat = fields.get("cat", "")
        if cat not in CATEGORIES:
            raise ValueError("Неизвестный формат.")
        title = clean_text(fields.get("title", ""), 80)
        if not title:
            raise ValueError("Нужно название.")
        label, role, tone, fallback = CATEGORIES[cat]
        text = clean_text(fields.get("text", ""), 280) or fallback
        length = clean_text(fields.get("length", ""), 8)
        if not DURATION.match(length):
            length = "—"
        stored = f"{secrets.token_hex(8)}{ext}"
        CUSTOM_DIR.mkdir(parents=True, exist_ok=True)
        target = CUSTOM_DIR / stored
        target.write_bytes(blob)
        relative = f"media/custom/{stored}"
        is_video = ext in VIDEO_EXT
        item = {
            "id": f"custom-{secrets.token_hex(4)}",
            "num": "00",
            "title": title,
            "cat": cat,
            "catLabel": label,
            "role": role,
            "hear": "ALIEWILLEATYXU",
            "length": length,
            "text": text,
            "note": "Добавлено заказчиком. Автор музыки — ALIEWILLEATYXU.",
            "tone": tone,
            "src": "" if is_video else relative,
            "video": relative if is_video else "",
        }
        with LOCK:
            items = load_extra()
            items.append(item)
            save_extra(items)
        self.send_json({"ok": True, "work": item})

    def delete_work(self):
        if not self.require_auth():
            return
        payload = json.loads(self.read_body(10000).decode("utf-8"))
        work_id = clean_text(payload.get("id", ""), 40)
        if not work_id.startswith("custom-"):
            raise ValueError("Можно убрать только добавленные работы.")
        with LOCK:
            items = load_extra()
            kept = []
            removed = None
            for item in items:
                if item.get("id") == work_id and removed is None:
                    removed = item
                else:
                    kept.append(item)
            if removed is None:
                raise ValueError("Работа не найдена.")
            save_extra(kept)
        for key in ("src", "video"):
            rel = str((removed or {}).get(key) or "")
            if rel.startswith("media/custom/"):
                path = (ROOT / rel).resolve()
                if CUSTOM_DIR.resolve() in path.parents and path.is_file():
                    path.unlink()
        self.send_json({"ok": True})

    def send_json(self, payload, status=200):
        raw = json.dumps(payload, ensure_ascii=False).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Cache-Control", "no-store")
        self.send_header("Content-Length", str(len(raw)))
        self.end_headers()
        self.wfile.write(raw)


def main():
    server = ThreadingHTTPServer(("127.0.0.1", 8771), Handler)
    print("http://127.0.0.1:8771/")
    server.serve_forever()


if __name__ == "__main__":
    main()
