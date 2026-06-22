#!/bin/bash
# ========================================
# 墨韵轩 - 云端同步脚本
# 将 localstorage 中的数据同步到 GitHub Gist
# ========================================
# 使用方法：
#   1. 先在浏览器中打开网站，上传/编辑数据
#   2. 运行本脚本： ./sync.sh
#   3. 在另一台设备上刷新网页即可看到同步后的数据
# ========================================

GIST_ID="366a62d1cc9c6deec93f5e1a454483ea"
FILE="moyunxuan_data.json"
TMPFILE="/tmp/moyunxuan_sync.json"
DATADIR="$HOME/.moyunxuan"

# 创建数据目录
mkdir -p "$DATADIR"

echo "🔄 墨韵轩云端同步工具"
echo "======================"

# 从 Gist 拉取最新数据
echo "📥 从云端读取数据..."
curl -s -f -o "$TMPFILE" \
  "https://gist.githubusercontent.com/ChunmengGuo/${GIST_ID}/raw/${FILE}" 2>&1

if [ $? -eq 0 ] && [ -s "$TMPFILE" ]; then
  # 验证 JSON 格式
  if python3 -c "import json; json.load(open('$TMPFILE'))" 2>/dev/null; then
    cp "$TMPFILE" "$DATADIR/$FILE"
    echo "✅ 云端数据读取成功"
  else
    echo "⚠️ 云端数据格式异常，跳过读取"
  fi
else
  echo "⚠️ 无法连接到云端，跳过读取"
fi

# 显示当前数据状态
if [ -f "$DATADIR/$FILE" ]; then
  python3 -c "
import json
with open('$DATADIR/$FILE') as f:
    d = json.load(f)
works = len(d.get('works', []))
reviews = len(d.get('reviews', []))
comments = len(d.get('comments', []))
print(f'📊 当前数据: {works} 幅作品, {reviews} 条点评, {comments} 条留言')
"
fi

# 检查是否有本地 data.json 文件（用户导出的备份）
if [ -f "data.json" ]; then
  echo "📄 发现本地 data.json 文件"
  
  # 读取 data.json
  python3 -c "
import json
with open('data.json') as f:
    d = json.load(f)
  " 2>/dev/null
  
  if [ $? -eq 0 ]; then
    echo "⏫ 正在推送本地数据到云端..."
    
    CONTENT=$(python3 -c "import json; print(json.dumps(json.load(open('data.json'))))")
    
    # 构建 PATCH 数据
    python3 << PYEOF
import json, urllib.request

gist_id = "$GIST_ID"
token = "$(gh auth token)" 2>/dev/null

with open('data.json') as f:
    data = json.load(f)

payload = {
    "files": {
        "$FILE": {
            "content": json.dumps(data, ensure_ascii=False)
        }
    }
}

req = urllib.request.Request(
    f'https://api.github.com/gists/{gist_id}',
    data=json.dumps(payload).encode('utf-8'),
    headers={
        'Authorization': f'Bearer {token}',
        'Content-Type': 'application/json',
        'User-Agent': 'moyunxuan-sync/1.0'
    },
    method='PATCH'
)

try:
    with urllib.request.urlopen(req) as resp:
        result = json.loads(resp.read())
        print(f"✅ 同步成功！{result.get('id', '')}")
except Exception as e:
    print(f"❌ 同步失败: {e}")
PYEOF
  fi
fi

echo ""
echo "💡 提示: 在浏览器中打开网站后，按以下方式导出当前数据："
echo "   1. 打开网站，进入「关于」页面"
echo "   2. 点击「导出备份」按钮下载 JSON 文件"
echo "   3. 将下载的文件重命名为 data.json 放在本目录"
echo "   4. 重新运行 ./sync.sh"
echo "======================"
