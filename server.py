# ConnectHBG local dev server — proxies /api/chat to Anthropic
# Usage:
#   set ANTHROPIC_API_KEY=sk-ant-...    (Windows CMD)
#   $env:ANTHROPIC_API_KEY="sk-ant-..." (PowerShell)
#   python server.py
# Then open: http://localhost:3000

import http.server
import json
import os
import ssl
import urllib.error
import urllib.request

PORT    = int(os.environ.get('PORT', 3000))
API_KEY = os.environ.get('ANTHROPIC_API_KEY', '')


class Handler(http.server.SimpleHTTPRequestHandler):
    """Serves static files and proxies POST /api/chat to Anthropic."""

    def log_message(self, fmt, *args):
        # Suppress per-request noise; keep it clean
        pass

    def do_POST(self):
        if self.path != '/api/chat':
            self.send_response(405)
            self.end_headers()
            return

        if not API_KEY:
            self._json(503, {'error': 'ANTHROPIC_API_KEY not set. See server.py header.'})
            return

        length = int(self.headers.get('Content-Length', 0))
        body   = self.rfile.read(length)

        req = urllib.request.Request(
            'https://api.anthropic.com/v1/messages',
            data=body,
            headers={
                'Content-Type':     'application/json',
                'x-api-key':        API_KEY,
                'anthropic-version':'2023-06-01',
            },
            method='POST',
        )

        ctx = ssl.create_default_context()
        try:
            with urllib.request.urlopen(req, context=ctx) as r:
                self._json(r.status, json.loads(r.read()))
        except urllib.error.HTTPError as e:
            self._json(e.code, json.loads(e.read()))
        except Exception as e:
            self._json(500, {'error': str(e)})

    def _json(self, status, data):
        body = json.dumps(data).encode()
        self.send_response(status)
        self.send_header('Content-Type',   'application/json')
        self.send_header('Content-Length', str(len(body)))
        self.end_headers()
        self.wfile.write(body)


if __name__ == '__main__':
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    httpd = http.server.HTTPServer(('', PORT), Handler)
    key_ok = bool(API_KEY)
    print(f'ConnectHBG running at http://localhost:{PORT}')
    print(f'{"✓ API key loaded" if key_ok else "✗ No API key — set ANTHROPIC_API_KEY env var"}')
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print('\nStopped.')
