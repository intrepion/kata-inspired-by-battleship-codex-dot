"""Serve this directory on an available loopback-only port. No dependencies."""
import http.server
import os
from pathlib import Path
os.chdir(Path(__file__).resolve().parent)
server = http.server.ThreadingHTTPServer(('127.0.0.1', int(os.environ.get('PORT', '0'))), http.server.SimpleHTTPRequestHandler)
print(f'Quiet Meridian: http://127.0.0.1:{server.server_port}/', flush=True)
server.serve_forever()
