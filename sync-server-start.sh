#!/bin/bash
# ========================================
# 墨韵轩 - 本地同步服务器
# 启动后在本地 19322 端口提供云端写入代理
# 浏览器中的 app.js 会自动发现并调用本服务
# ========================================

GIST_ID="366a62d1cc9c6deec93f5e1a454483ea"
PORT=${1:-19322}

echo "🔄 墨韵轩本地同步服务器"
echo "端口: localhost:$PORT"
echo "按 Ctrl+C 停止"

# 获取 GitHub Token（使用 gh CLI）
GH_TOKEN=$(gh auth token 2>/dev/null)
if [ -z "$GH_TOKEN" ]; then
  echo "❌ 错误：gh CLI 未认证或 token 不可用"
  echo "请先运行 gh auth login"
  exit 1
fi

echo "✅ GitHub 认证成功 (token: ${GH_TOKEN:0:10}...)"
echo ""

# 启动 HTTP 服务器
python3 << PYEOF &
import http.server, json, urllib.request, sys, os, ssl

GIST_ID = "$GIST_ID"
GH_TOKEN = "$GH_TOKEN"
PORT = int($PORT)
ctx = ssl._create_unverified_context()

class SyncHandler(http.server.BaseHTTPRequestHandler):
    def do_GET(self):
        if self.path == '/read':
            try:
                req = urllib.request.Request(
                    f'https://api.github.com/gists/{GIST_ID}',
                    headers={'Authorization': f'Bearer {GH_TOKEN}', 'User-Agent': 'moyunxuan-sync/1.0'})
                with urllib.request.urlopen(req, timeout=10, context=ctx) as resp:
                    gist = json.loads(resp.read())
                    content = gist['files']['moyunxuan_data.json']['content']
                    self.send_response(200)
                    self.send_header('Content-Type', 'application/json')
                    self.send_header('Access-Control-Allow-Origin', '*')
                    self.end_headers()
                    self.wfile.write(content.encode('utf-8'))
                    print(f'[READ] OK ({len(content)} bytes)')
            except Exception as e:
                self.send_response(500)
                self.send_header('Content-Type', 'text/plain')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                self.wfile.write(str(e).encode('utf-8'))
                print(f'[READ ERR] {e}')
        else:
            self.send_response(404)
            self.end_headers()

    def do_POST(self):
        if self.path == '/write':
            length = int(self.headers.get('Content-Length', 0))
            body = self.rfile.read(length).decode('utf-8')
            try:
                payload = json.dumps({"files": {"moyunxuan_data.json": {"content": body}}})
                req = urllib.request.Request(
                    f'https://api.github.com/gists/{GIST_ID}',
                    data=payload.encode('utf-8'),
                    headers={'Authorization': f'Bearer {GH_TOKEN}', 'Content-Type': 'application/json', 'User-Agent': 'moyunxuan-sync/1.0'},
                    method='PATCH')
                with urllib.request.urlopen(req, timeout=10, context=ctx) as resp:
                    self.send_response(200)
                    self.send_header('Access-Control-Allow-Origin', '*')
                    self.send_header('Content-Type', 'application/json')
                    self.end_headers()
                    self.wfile.write(json.dumps({"ok": True}).encode('utf-8'))
                    print(f'[WRITE] OK ({len(body)} bytes)')
            except Exception as e:
                self.send_response(500)
                self.send_header('Access-Control-Allow-Origin', '*')
                self.send_header('Content-Type', 'text/plain')
                self.end_headers()
                self.wfile.write(str(e).encode('utf-8'))
                print(f'[WRITE ERR] {e}')
        else:
            self.send_response(404)
            self.end_headers()

    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()

    def log_message(self, fmt, *args):
        pass

server = http.server.HTTPServer(('127.0.0.1', PORT), SyncHandler)
print(f'🌐 同步服务器已启动: http://localhost:{PORT}')
print(f'   浏览器中的墨韵轩会自动发现并使用此服务')
print(f'   关闭: 按 Ctrl+C')
try:
    server.serve_forever()
except KeyboardInterrupt:
    print('\n服务器已停止')
    server.server_close()
PYEOF

sleep 1
echo "服务器已启动 ➔ http://localhost:$PORT"
wait
