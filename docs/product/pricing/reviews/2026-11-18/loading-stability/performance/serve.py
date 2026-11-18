from http.server import ThreadingHTTPServer, BaseHTTPRequestHandler
from pathlib import Path
from urllib.request import urlopen
from urllib.parse import urlsplit,parse_qs
import gzip,mimetypes
BASE=Path(__file__).resolve().parent
class Serve(BaseHTTPRequestHandler):
 def log_message(self,*args): pass
 def do_GET(self):
  parsed=urlsplit(self.path)
  if parsed.path=='/api/pricing/catalog/active':
   try:
    r=urlopen('https://pricing.sundae.io/api/pricing/catalog/active'+('?' + parsed.query if parsed.query else ''),timeout=20);body=r.read();mime='application/json';status=r.status
   except Exception as e:
    body=str(e).encode();mime='text/plain';status=502
  else:
   root=Path((BASE/'active-root.txt').read_text().strip())
   lang=parse_qs(parsed.query).get('lang',['en'])[0]
   if parsed.path in ['/','/simulator','/simulator/']:
    file='simulator.html' if parsed.path.startswith('/simulator') else 'index.html'
    path=root/file if lang=='en' else root/'localized'/lang/file
   else:path=root/parsed.path.lstrip('/')
   if not path.is_file():path=root/'404.html';status=404
   else:status=200
   body=path.read_bytes();mime=mimetypes.guess_type(path)[0] or 'application/octet-stream'
  zipped=gzip.compress(body)
  self.send_response(status);self.send_header('Content-Type',mime);self.send_header('Content-Encoding','gzip');self.send_header('Content-Length',str(len(zipped)));self.send_header('Cache-Control','no-store');self.end_headers();self.wfile.write(zipped)
ThreadingHTTPServer(('127.0.0.1',int(__import__('os').environ.get('PORT','5190'))),Serve).serve_forever()
