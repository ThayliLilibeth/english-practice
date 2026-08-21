#!/usr/bin/env python3
"""Servidor local para la app de práctica de inglés.

Sirve los archivos estáticos de static/ y expone una API mínima
(GET/POST /api/data) que lee y escribe data.json en disco, para que
tu progreso y contenido queden guardados en un archivo local.
"""
import json
import os
import urllib.request
import urllib.parse
import urllib.error
import http.server
import socketserver

ROOT = os.path.dirname(os.path.abspath(__file__))
STATIC_DIR = os.path.join(ROOT, "static")
DATA_FILE = os.path.join(ROOT, "data.json")
PORT = 8420

MIME_TYPES = {
    ".html": "text/html; charset=utf-8",
    ".css": "text/css; charset=utf-8",
    ".js": "application/javascript; charset=utf-8",
    ".json": "application/json; charset=utf-8",
}


class Handler(http.server.BaseHTTPRequestHandler):
    def log_message(self, fmt, *args):
        pass  # silencia logs de acceso en consola

    def _send_json(self, obj, status=200):
        body = json.dumps(obj, ensure_ascii=False, indent=2).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def do_GET(self):
        if self.path == "/api/data":
            if os.path.exists(DATA_FILE):
                with open(DATA_FILE, "r", encoding="utf-8") as f:
                    data = json.load(f)
            else:
                data = {"vocab": [], "phrases": [], "stats": {"streak": 0, "lastStudyDate": None, "totalReviews": 0, "totalCorrect": 0}}
            self._send_json(data)
            return

        path = self.path.split("?")[0]
        if path == "/":
            path = "/index.html"
        safe_path = os.path.normpath(path).lstrip("/")
        full_path = os.path.join(STATIC_DIR, safe_path)

        if not full_path.startswith(STATIC_DIR) or not os.path.isfile(full_path):
            self.send_response(404)
            self.end_headers()
            self.wfile.write(b"Not found")
            return

        ext = os.path.splitext(full_path)[1]
        content_type = MIME_TYPES.get(ext, "application/octet-stream")
        with open(full_path, "rb") as f:
            body = f.read()
        self.send_response(200)
        self.send_header("Content-Type", content_type)
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def do_POST(self):
        if self.path == "/api/check-writing":
            self._handle_check_writing()
            return
        if self.path != "/api/data":
            self.send_response(404)
            self.end_headers()
            return
        length = int(self.headers.get("Content-Length", 0))
        raw = self.rfile.read(length)
        try:
            data = json.loads(raw)
        except json.JSONDecodeError:
            self._send_json({"ok": False, "error": "JSON inválido"}, status=400)
            return

        tmp_path = DATA_FILE + ".tmp"
        with open(tmp_path, "w", encoding="utf-8") as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
        os.replace(tmp_path, DATA_FILE)
        self._send_json({"ok": True})

    def _handle_check_writing(self):
        length = int(self.headers.get("Content-Length", 0))
        raw = self.rfile.read(length)
        try:
            payload = json.loads(raw)
        except json.JSONDecodeError:
            self._send_json({"ok": False, "error": "JSON inválido"}, status=400)
            return

        text = (payload.get("text") or "").strip()
        if not text:
            self._send_json({"ok": False, "error": "Texto vacío"}, status=400)
            return

        form_data = urllib.parse.urlencode({"text": text, "language": "en-US"}).encode("utf-8")
        req = urllib.request.Request(
            "https://api.languagetool.org/v2/check",
            data=form_data,
            headers={"Content-Type": "application/x-www-form-urlencoded"},
            method="POST",
        )
        try:
            with urllib.request.urlopen(req, timeout=15) as resp:
                lt_result = json.loads(resp.read().decode("utf-8"))
        except (urllib.error.URLError, TimeoutError) as e:
            self._send_json(
                {"ok": False, "error": "No se pudo conectar al corrector (revisa tu conexión a internet)."},
                status=502,
            )
            return

        matches = []
        for m in lt_result.get("matches", []):
            matches.append(
                {
                    "message": m.get("message", ""),
                    "shortMessage": m.get("shortMessage", ""),
                    "offset": m.get("offset", 0),
                    "length": m.get("length", 0),
                    "replacements": [r.get("value") for r in m.get("replacements", [])[:5]],
                    "context": m.get("context", {}).get("text", ""),
                    "category": (m.get("rule", {}) or {}).get("category", {}).get("name", ""),
                }
            )
        self._send_json({"ok": True, "matches": matches})


def main():
    with socketserver.TCPServer(("127.0.0.1", PORT), Handler) as httpd:
        print(f"Practica de ingles corriendo en: http://127.0.0.1:{PORT}")
        print("Presiona Ctrl+C para detener el servidor.")
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nServidor detenido.")


if __name__ == "__main__":
    main()
