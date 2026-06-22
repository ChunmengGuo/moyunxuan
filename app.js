// ============================================================
// 墨韵轩 - 书法学习与作品记录应用
// 后端: GitHub Gist (云端共享) + localStorage (本地缓存)
// ============================================================

// ──── 配置 ────
const CONFIG = {
  // GitHub Gist ID — 云数据库（CORS 友好，可公开读取）
  GIST_ID: '366a62d1cc9c6deec93f5e1a454483ea',
  
  // 导师密码（可修改）
  MASTER_PASSWORD: 'moyunxuan2024',
  
  // 存储键名
  STORAGE_KEY: 'moyunxuan_data',
  
  // 本地同步服务器（可选，须先运行 ./sync-server-start.sh）
  SYNC_SERVER_URL: 'http://localhost:19322',
  
  MAX_RECENT: 10
};

// ──── 本地状态 ────
const state = {
  works: [],
  reviews: [],
  comments: [],
  nextWorkId: 1,
  nextReviewId: 1,
  masterName: '书法导师',
  masterBio: '',
  _lastSync: 0
};

// ──── DOM 快捷引用 ────
const $ = s => document.querySelector(s);
const $$ = s => document.querySelectorAll(s);

// ──── 数据层 ────
const STORE = {};

// 从 GitHub Gist 读取
STORE.fetchFromCloud = async () => {
  // 优先用本地同步服务器（速度更快）
  try {
    const res = await fetch(`${CONFIG.SYNC_SERVER_URL}/read`, { signal: AbortSignal.timeout(2000) });
    if (res.ok) return await res.json();
  } catch (_) { /* no local sync server */ }

  // 从 Gist raw URL 读取（CORS ✅）
  try {
    const rawUrl = `https://gist.githubusercontent.com/ChunmengGuo/${CONFIG.GIST_ID}/raw/moyunxuan_data.json`;
    const res = await fetch(rawUrl, { signal: AbortSignal.timeout(5000) });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (e) {
    console.warn('[云端] 读取失败:', e.message);
    return null;
  }
};

// 写入（通过本地同步服务器）
STORE.writeToCloud = async data => {
  try {
    const res = await fetch(`${CONFIG.SYNC_SERVER_URL}/write`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
      signal: AbortSignal.timeout(3000)
    });
    if (res.ok) return true;
  } catch (_) {}
  return false;
};

// 加载 localStorage
STORE.loadLocal = () => {
  try {
    const raw = localStorage.getItem(CONFIG.STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (_) {}
  return null;
};

// 保存 localStorage
STORE.saveLocal = data => {
  try { localStorage.setItem(CONFIG.STORAGE_KEY, JSON.stringify(data)); } catch (_) {}
};

// 合并数据（云端优先）
STORE.merge = (cloud, local) => {
  if (!cloud && !local) return null;
  if (!cloud) return local;
  if (!local) return cloud;

  // 合并 works（按时间线去重）
  const seen = new Set();
  const all = [...(local.works || []), ...(cloud.works || [])];
  const works = [];
  for (const w of all) {
    const key = w.id + '_' + w.createdAt;
    if (!seen.has(key)) { seen.add(key); works.push(w); }
  }

  return {
    works,
    reviews: [...(cloud.reviews || []), ...(local.reviews || [])].filter(
      (r, i, a) => a.findIndex(x => x.id === r.id) === i
    ),
    comments: [...(cloud.comments || []), ...(local.comments || [])].filter(
      (c, i, a) => a.findIndex(x => x.createdAt === c.createdAt && x.name === c.name) === i
    ),
    nextWorkId: Math.max(cloud.nextWorkId || 1, local.nextWorkId || 1),
    nextReviewId: Math.max(cloud.nextReviewId || 1, local.nextReviewId || 1),
    masterName: cloud.masterName || local.masterName || '书法导师',
    masterBio: cloud.masterBio || local.masterBio || ''
  };
};

// 初始化
async function initData() {
  const cloud = await STORE.fetchFromCloud();
  const local = STORE.loadLocal();
  const merged = STORE.merge(cloud, local);
  if (merged) {
    Object.assign(state, merged);
    STORE.saveLocal(merged);
  }
  renderAll();
}

// 保存 + 同步
async function saveAndSync(msg = '✅ 已保存') {
  STORE.saveLocal(state);
  const ok = await STORE.writeToCloud(state);
  showToast(ok ? '✅ 已同步到云端' : msg);
}

// ──── 导航 ────
function navigateTo(pageName) {
  $$('.page').forEach(p => p.classList.remove('active'));
  const target = $('#page-' + pageName);
  if (target) target.classList.add('active');
  $$('.nav-link').forEach(l => l.classList.remove('active'));
  const link = $(`.nav-link[data-page="${pageName}"]`);
  if (link) link.classList.add('active');
  document.getElementById('sidebar')?.classList.remove('open');
  
  if (pageName === 'learn') renderLearn();
  if (pageName === 'gallery') renderGallery();
  if (pageName === 'about') renderComments();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ──── Toast ────
function showToast(msg, duration = 2500) {
  let el = document.createElement('div');
  el.className = 'toast';
  el.textContent = msg;
  document.body.appendChild(el);
  setTimeout(() => {
    el.classList.add('show');
    setTimeout(() => {
      el.classList.remove('show');
      setTimeout(() => el.remove(), 300);
    }, duration);
  }, 10);
}

// ================================================================
// 学书法 — 干货内容
// ================================================================

const SCRIPTS_DATA = [
  { id: 'tools', script: '入门', title: '文房四宝指南', desc: '笔、墨、纸、砚选购与养护全攻略', icon: '🧰', level: '入门' },
  { id: 'posture', script: '入门', title: '坐姿与执笔法', desc: '五指执笔法详解，养成正确书写习惯', icon: '🧘', level: '入门' },
  { id: 'strokes', script: '楷书', title: '28种基本笔画口诀', desc: '点横竖撇捺提折钩——八大核心笔画技法', icon: '✍️', level: '入门' },
  { id: 'masters', script: '楷书', title: '楷书四大家对比', desc: '欧颜柳赵风格、碑帖、学习方法全解析', icon: '👑', level: '进阶' },
  { id: 'xingshu', script: '行书', title: '行书四大技法', desc: '牵丝引带·大小参差·欹侧取势·疏密对比', icon: '🌊', level: '进阶' },
  { id: 'caoshu', script: '草书', title: '草书五阶路线', desc: '从识草到狂草，循序渐进的训练路径', icon: '🐉', level: '高阶' },
  { id: 'lishu', script: '隶书', title: '隶书技巧五要', desc: '蚕头燕尾·一波三折·燕不双飞·横向取势·轻重分明', icon: '🌾', level: '进阶' },
  { id: 'zhuanshu', script: '篆书', title: '篆书四要诀', desc: '中锋行笔·匀速运动·对称均衡·粗细一致', icon: '🔤', level: '高阶' }
];

const TOOLS_GUIDE = [
  { title: '毛笔', icon: '🖊️', content: '选笔四德：「尖、齐、圆、健」。初学者推荐兼毫（羊狼毫混合），弹性适中易控制。笔号选「中楷」。品牌：善琏湖笔、周虎臣、戴月轩。' },
  { title: '墨', icon: '⚫', content: '墨汁开瓶即用，方便快捷。品牌：「一得阁」「红星」「曹素功」三大老字号。研墨更有仪式感，墨色层次更丰富。' },
  { title: '纸', icon: '📜', content: '半生熟宣纸最适合初学者（不洇墨又不滞涩）。练习用毛边纸性价比高，创作用红星宣纸。' },
  { title: '砚', icon: '🪨', content: '四大名砚：端砚·歙砚·洮河砚·澄泥砚。初学者选普通砚台即可，关键是平整细腻。' },
  { title: '配件', icon: '🧰', content: '笔搁、笔洗、镇纸、毛毡垫。毛毡垫是必需品，普通毛毡约10-20元。镇纸可用厚书替代。' }
];

const POSTURE = [
  { title: '坐姿四要', desc: '头正·身直·臂开·足安。胸部离桌一拳，两脚平放与肩同宽。' },
  { title: '五指执笔法', desc: '擫（拇指按笔杆左侧）·押（食指压笔杆右侧）·钩（中指钩住外侧）·格（无名指抵住内侧）·抵（小指贴无名指辅助发力）。' },
  { title: '要领', desc: '指实掌虚（掌心可容一个鸡蛋），腕平掌竖。写小楷执笔低，写大字执笔高。' }
];

const BASIC_STROKES = [
  { name: '点（侧）', shape: '丶', method: '轻入→渐按→顿笔→回锋', tips: '如高峰坠石，棱角分明' },
  { name: '横（勒）', shape: '一', method: '逆锋起→中锋行→顿笔收', tips: '左低右高，微呈弧势' },
  { name: '竖（努）', shape: '丨', method: '逆锋起→中锋行→顿笔收', tips: '垂露竖圆润，悬针竖尖细' },
  { name: '撇（掠）', shape: '丿', method: '逆锋起→中锋行→渐提出锋', tips: '力送笔端，不可飘忽' },
  { name: '捺（磔）', shape: '乀', method: '轻入→渐按→重顿→平出锋', tips: '一波三折，含蓄饱满' },
  { name: '提（策）', shape: '㇀', method: '逆锋起→顿→提锋右上出', tips: '如策马扬鞭，短促有力' },
  { name: '折（矩）', shape: '𠃋', method: '横至折处→提笔→顿→转锋下行', tips: '内方外圆，骨节分明' },
  { name: '钩（趯）', shape: '亅', method: '行至钩处→顿→蓄势→向左上趯出', tips: '如人踢脚，短促锐利' }
];

const KAISHU_MASTERS = [
  { name: '欧阳询', style: '险峻严谨', masterpiece: '《九成宫醴泉铭》', features: '笔画方整峻峭，结体险绝左紧右舒，横画左低右高，主笔突出一字有一主峰', advice: '楷书之极则，先练基本笔画再学结体' },
  { name: '颜真卿', style: '雄强厚实', masterpiece: '《多宝塔碑》《颜勤礼碑》', features: '点画圆厚丰腴，结体宽博外紧内松，横轻竖重，蚕头雁尾捺脚', advice: '体"颜筋"骨力，初学选《多宝塔碑》更工整' },
  { name: '柳公权', style: '清劲挺拔', masterpiece: '《玄秘塔碑》', features: '瘦硬挺拔如削金斩玉，中宫紧密四面伸展，起收方笔斩钉截铁', advice: '需有欧颜基础，重在体会骨力清峻' },
  { name: '赵孟頫', style: '秀美流畅', masterpiece: '《胆巴碑》', features: '线条圆润流畅，结体匀称疏朗，笔法融行书意趣，温润典雅平易近人', advice: '楷书入门好选择，重点练流畅自然的笔意' }
];

const XINGSHU = [
  { title: '牵丝引带', desc: '字与字之间用细牵丝连接，形成行气贯通。牵丝要细而有弹性，不可粗重拖沓。' },
  { title: '大小参差', desc: '大字促令小，小字展令大。通过字形大小变化制造节奏，避免千篇一律。' },
  { title: '欹侧取势', desc: '字重心不一定居中，可左倾右仰，通过上下字呼应保持平衡。' },
  { title: '疏密对比', desc: '笔画密集处收紧，松散处舒展。通过疏密变化制造节奏感。' }
];

const CAOSHU = [
  { stage: 1, name: '识草入门', content: '学草诀百韵歌，认识草书符号，了解草法规则' },
  { stage: 2, name: '小草筑基', content: '练章草（皇象《急就章》），每日临写15-20字，重在记草法' },
  { stage: 3, name: '线条锤炼', content: '练今草线条质感（孙过庭《书谱》墨迹本），重点训练使转交替' },
  { stage: 4, name: '章法气韵', content: '练字组关系和墨色变化（怀素《自叙帖》），注重整体气息连贯' },
  { stage: 5, name: '狂草升华', content: '脱帖创作追求个人风貌（王铎、傅山），大量临摹逐渐形成自己的草书语言' }
];

const LISHU = [
  { title: '蚕头燕尾', desc: '横画起笔如蚕头（逆锋顿笔呈圆形），收笔如燕尾（顿笔后向右上挑出）' },
  { title: '一波三折', desc: '横画和捺画有波浪起伏变化，起→行→收三个阶段各有不同节奏' },
  { title: '燕不双飞', desc: '一个字中只能有一个燕尾波磔，其余横画都要平收' },
  { title: '横向取势', desc: '隶书整体呈扁方形，横向舒展纵向收敛，稳重中有灵动' },
  { title: '轻重分明', desc: '横画细竖画粗（与楷书相反），主笔粗壮次笔纤细' }
];

const ZHUANSHU = [
  { title: '中锋行笔', desc: '笔尖始终在线条中间运行，线条圆润饱满如铁丝' },
  { title: '匀速运动', desc: '行笔速度均匀，转弯处同样保持匀速，不可停顿或颤抖' },
  { title: '对称均衡', desc: '注重左右对称上下均衡，心中要有中轴线概念' },
  { title: '粗细一致', desc: '线条从头到尾粗细均匀，起收笔均为圆笔藏锋，无明显顿挫' }
];

// ──── 渲染学书法 ────
function renderLearn() {
  const grid = $('#learnGrid');
  if (!grid) return;
  
  grid.innerHTML = SCRIPTS_DATA.map(c => `
    <div class="learn-card" data-script="${c.script}" onclick="showLearnDetail('${c.id}')">
      <div class="learn-card-icon">${c.icon}</div>
      <span class="learn-level level-${c.level}">${c.level}</span>
      <h4>${c.title}</h4>
      <p>${c.desc}</p>
    </div>
  `).join('');
}

function showLearnDetail(id) {
  const modal = document.createElement('div');
  modal.className = 'modal-overlay active';
  modal.onclick = e => { if (e.target === modal) modal.remove(); };
  
  let content = '';
  
  if (id === 'tools') {
    content = TOOLS_GUIDE.map(t => `
      <div class="tool-card"><h4>${t.icon} ${t.title}</h4><p>${t.content}</p></div>
    `).join('');
  } else if (id === 'posture') {
    content = POSTURE.map(p => `
      <div class="posture-item"><h4>${p.title}</h4><p>${p.desc}</p></div>
    `).join('');
  } else if (id === 'strokes') {
    content = '<table class="strokes-table"><thead><tr><th>笔画</th><th>形态</th><th>笔法</th><th>口诀</th></tr></thead><tbody>' +
      BASIC_STROKES.map(s => `<tr><td><strong>${s.name}</strong></td><td class="stroke-shape">${s.shape}</td><td>${s.method}</td><td>${s.tips}</td></tr>`).join('') +
      '</tbody></table>';
  } else if (id === 'masters') {
    content = KAISHU_MASTERS.map(m => `
      <div class="master-card">
        <h4>${m.name} <span class="master-style">${m.style}</span></h4>
        <p><strong>代表：</strong>${m.masterpiece}</p>
        <p><strong>特点：</strong>${m.features}</p>
        <p><strong>建议：</strong>${m.advice}</p>
      </div>
    `).join('');
  } else if (id === 'xingshu') {
    content = XINGSHU.map(x => `
      <div class="technique-card"><h4>${x.title}</h4><p>${x.desc}</p></div>
    `).join('');
  } else if (id === 'caoshu') {
    content = CAOSHU.map(c => `
      <div class="caoshu-stage">
        <div class="stage-badge">第${c.stage}阶</div>
        <div><h4>${c.name}</h4><p>${c.content}</p></div>
      </div>
    `).join('');
  } else if (id === 'lishu') {
    content = LISHU.map(t => `
      <div class="lishu-tip"><h4>${t.title}</h4><p>${t.desc}</p></div>
    `).join('');
  } else if (id === 'zhuanshu') {
    content = ZHUANSHU.map(k => `
      <div class="zhuanshu-key"><h4>${k.title}</h4><p>${k.desc}</p></div>
    `).join('');
  }
  
  const card = SCRIPTS_DATA.find(c => c.id === id);
  modal.innerHTML = `
    <div class="modal modal-lg">
      <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">&times;</button>
      <h3>${card ? card.icon : ''} ${card ? card.title : ''}</h3>
      <div class="learn-detail-content">${content}</div>
    </div>
  `;
  $('#mainContent').appendChild(modal);
}

// 书体标签切换
function setupScriptTabs() {
  const bar = $('#scriptTabs');
  if (!bar) return;
  bar.addEventListener('click', e => {
    const tab = e.target.closest('.tab');
    if (!tab) return;
    bar.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    const sc = tab.dataset.script;
    $$('.learn-card').forEach(c => {
      c.style.display = (sc === 'all' || c.dataset.script === sc) ? 'flex' : 'none';
    });
  });
}

// ================================================================
// 作品集
// ================================================================

function renderGallery() {
  const grid = $('#galleryGrid');
  if (!grid) return;
  
  if (state.works.length === 0) {
    grid.innerHTML = '<div class="empty-state"><div class="empty-icon">🖌️</div><h3>还没有作品</h3><p>点击上方按钮上传您的第一幅书法作品吧</p></div>';
    return;
  }
  
  const sorted = [...state.works].sort((a, b) => b.createdAt - a.createdAt);
  
  grid.innerHTML = sorted.map(w => {
    const r = state.reviews.find(x => x.workId === w.id);
    return `
      <div class="work-card" onclick="showWorkDetail(${w.id})">
        <div class="work-image-wrap">
          <div class="work-image" style="background-image:url('${w.image || ''}')">
            ${!w.image ? '<div class="work-image-placeholder">📜</div>' : ''}
            <span class="work-script-badge">${w.script}</span>
            ${r ? '<span class="work-reviewed">✅ 已点评</span>' : ''}
          </div>
        </div>
        <div class="work-info">
          <h4>${w.title}</h4>
          <p class="work-date">${fmtDate(w.createdAt)}</p>
          ${r ? `<div class="work-preview-review"><span class="review-stars">${'⭐'.repeat(r.rating)}</span><span class="review-excerpt">${r.comment.slice(0,18)}${r.comment.length>18?'…':''}</span></div>` : ''}
        </div>
      </div>
    `;
  }).join('');
}

function showWorkDetail(id) {
  const w = state.works.find(x => x.id === id);
  if (!w) return;
  const r = state.reviews.find(x => x.workId === id);
  
  $('#detailContent').innerHTML = `
    <div class="detail-toolbar">
      <button class="btn btn-sm btn-outline" onclick="editWork(${w.id})">✏️ 编辑</button>
      <button class="btn btn-sm btn-outline" onclick="deleteWork(${w.id})" style="color:var(--vermillion);border-color:var(--vermillion);">🗑️ 删除</button>
    </div>
    ${w.image ? `<img src="${w.image}" class="detail-image" onclick="window.open('${w.image}','_blank')" alt="${w.title}">` : ''}
    <div class="detail-body">
      <h3>${w.title}</h3>
      <p><span class="detail-tag">${w.script}</span>${w.workDate ? ` <span class="detail-tag">${w.workDate}</span>` : ''}</p>
      ${w.note ? `<p class="detail-note">${w.note}</p>` : ''}
      <p class="detail-time">📅 ${fmtDate(w.createdAt)}</p>
    </div>
    ${r ? renderReviewBox(r) : ''}
    <div class="detail-actions">
      ${!r ? `<button class="btn btn-primary" onclick="showReviewForm(${w.id})">✍️ 导师点评</button>` : ''}
      <button class="btn btn-outline" onclick="closeDetail()">关闭</button>
    </div>
  `;
  $('#detailModal').classList.add('active');
}

function renderReviewBox(r) {
  return `
    <div class="master-review-section">
      <h4>📝 导师点评</h4>
      <div class="review-box">
        <div class="review-header">
          <span class="review-avatar">👨‍🏫</span>
          <strong>${r.masterName}</strong>
          <span class="review-rating">${'⭐'.repeat(r.rating)}${'☆'.repeat(5-r.rating)}</span>
          <span class="review-time">${fmtDate(r.createdAt)}</span>
        </div>
        <p class="review-comment">${r.comment}</p>
      </div>
    </div>
  `;
}

function closeDetail() { $('#detailModal').classList.remove('active'); }

function editWork(id) {
  const w = state.works.find(x => x.id === id);
  if (!w) return;
  closeDetail();
  setTimeout(() => openWorkModal(w), 300);
}

function deleteWork(id) {
  if (!confirm('确定删除？不可撤销。')) return;
  state.works = state.works.filter(x => x.id !== id);
  state.reviews = state.reviews.filter(x => x.workId !== id);
  closeDetail();
  saveAndSync().then(() => { renderGallery(); renderHome(); });
}

function fmtDate(ts) {
  if (!ts) return '';
  const d = new Date(ts);
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}

// ──── 上传/编辑作品 ────
function openWorkModal(work) {
  if (work) {
    $('#modalTitle').textContent = '编辑作品';
    $('#editId').value = work.id;
    $('#workTitle').value = work.title || '';
    $('#workScript').value = work.script || '楷书';
    $('#workDate').value = work.workDate || '';
    $('#workNote').value = work.note || '';
    if (work.image) {
      $('#imagePreview').src = work.image;
      $('#imagePreview').classList.remove('hidden');
      $('#uploadPlaceholder').classList.add('hidden');
    } else { resetUpload(); }
  } else {
    $('#modalTitle').textContent = '上传新作品';
    $('#workForm').reset();
    $('#editId').value = '';
    resetUpload();
  }
  $('#workModal').classList.add('active');
}

function resetUpload() {
  $('#imagePreview').classList.add('hidden');
  $('#imagePreview').src = '';
  $('#uploadPlaceholder').classList.remove('hidden');
}

// 表单提交
function setupWorkForm() {
  $('#workForm').addEventListener('submit', async e => {
    e.preventDefault();
    const id = $('#editId').value;
    const title = $('#workTitle').value.trim();
    if (!title) { showToast('请填写作品名称'); return; }
    
    const img = $('#imagePreview');
    const image = img.src && !img.classList.contains('hidden') ? img.src : null;
    
    if (id) {
      const idx = state.works.findIndex(w => w.id === parseInt(id));
      if (idx !== -1) Object.assign(state.works[idx], { title, script: $('#workScript').value, workDate: $('#workDate').value, note: $('#workNote').value.trim(), ...(image ? {image} : {}) });
    } else {
      state.works.push({ id: state.nextWorkId++, title, script: $('#workScript').value, workDate: $('#workDate').value, note: $('#workNote').value.trim(), image, createdAt: Date.now() });
    }
    
    $('#workModal').classList.remove('active');
    await saveAndSync('✅ 已保存到本地');
    renderGallery();
    renderHome();
  });
}

// 图片上传
function setupImageUpload() {
  const area = $('#uploadArea');
  if (!area) return;
  area.addEventListener('click', () => $('#imageInput').click());
  $('#imageInput').addEventListener('change', e => {
    const f = e.target.files[0];
    if (f && f.type.startsWith('image/')) processFile(f);
  });
  area.addEventListener('dragover', e => { e.preventDefault(); area.classList.add('drag-over'); });
  area.addEventListener('dragleave', () => area.classList.remove('drag-over'));
  area.addEventListener('drop', e => {
    e.preventDefault();
    area.classList.remove('drag-over');
    const f = e.dataTransfer.files[0];
    if (f && f.type.startsWith('image/')) processFile(f);
  });
}

function processFile(file) {
  const reader = new FileReader();
  reader.onload = e => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      let {width:w,height:h} = img;
      const max = 800;
      if (w > max || h > max) { if (w>h) { h=h*max/w; w=max; } else { w=w*max/h; h=max; } }
      canvas.width = w; canvas.height = h;
      canvas.getContext('2d').drawImage(img,0,0,w,h);
      $('#imagePreview').src = canvas.toDataURL('image/jpeg',0.7);
      $('#imagePreview').classList.remove('hidden');
      $('#uploadPlaceholder').classList.add('hidden');
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
}

// 添加作品按钮
function setupAddBtn() {
  $('#addWorkBtn')?.addEventListener('click', () => openWorkModal(null));
}

// 弹窗关闭
function setupModals() {
  $('#modalClose')?.addEventListener('click', () => $('#workModal').classList.remove('active'));
  $('#detailClose')?.addEventListener('click', closeDetail);
  window.addEventListener('click', e => {
    if (e.target.classList.contains('modal-overlay')) e.target.classList.remove('active');
  });
}

// ================================================================
// 导师点评
// ================================================================

let _reviewRating = 5;

function showReviewForm(workId) {
  const w = state.works.find(x => x.id === workId);
  if (!w) return;
  
  const pwd = prompt('🔐 请输入导师密码：');
  if (pwd !== CONFIG.MASTER_PASSWORD) { if (pwd !== null) showToast('❌ 密码错误'); return; }
  
  $('#detailContent').innerHTML = `
    <h4>✍️ 导师点评 — ${w.title}</h4>
    <div class="form-group"><label>导师名称</label><input type="text" id="rName" class="form-input" value="${state.masterName}"></div>
    <div class="form-group"><label>评分</label><div class="review-stars-input">${[1,2,3,4,5].map(i => `<span class="review-star" data-v="${i}">${i<=5?'⭐':'☆'}</span>`).join('')}</div></div>
    <div class="form-group"><label>点评内容</label><textarea id="rComment" class="form-textarea" rows="5"></textarea></div>
    <button class="btn btn-primary" onclick="submitReview(${workId})">提交点评</button>
    <button class="btn btn-outline mt-1" onclick="closeDetail()">取消</button>
  `;
  
  _reviewRating = 5;
  setTimeout(() => {
    $$('.review-star').forEach((s,i) => {
      s.textContent = i < 5 ? '⭐' : '☆';
      s.addEventListener('click', () => {
        _reviewRating = i + 1;
        $$('.review-star').forEach((ss, j) => { ss.textContent = j <= i ? '⭐' : '☆'; });
      });
    });
  }, 50);
}

async function submitReview(workId) {
  const comment = $('#rComment')?.value?.trim();
  const name = $('#rName')?.value?.trim() || state.masterName;
  if (!comment) { showToast('请填写点评内容'); return; }
  
  state.reviews.push({
    id: state.nextReviewId++, workId, masterName: name,
    comment, rating: _reviewRating || 5, createdAt: Date.now()
  });
  state.masterName = name;
  
  await saveAndSync('✅ 点评已保存到本地');
  showWorkDetail(workId);
  renderGallery();
}

// ================================================================
// 书友留言
// ================================================================

function renderComments() {
  const list = $('#commentList');
  if (!list) return;
  if (state.comments.length === 0) { list.innerHTML = '<div class="empty-state-sm">暂无留言，快来写第一条吧～</div>'; return; }
  
  const sorted = [...state.comments].sort((a,b) => b.createdAt - a.createdAt);
  list.innerHTML = sorted.map(c => `
    <div class="comment-item">
      <div class="comment-header"><strong>${c.name || '匿名书友'}</strong> ${c.rating ? '<span>'+'⭐'.repeat(c.rating)+'</span>' : ''}<span class="comment-time">${fmtDate(c.createdAt)}</span></div>
      <p>${c.content}</p>
    </div>
  `).join('');
}

function setupComments() {
  $('#submitComment')?.addEventListener('click', async () => {
    const content = $('#commentContent')?.value?.trim();
    if (!content) { showToast('请写下想说的话'); return; }
    state.comments.push({
      name: $('#commentName')?.value?.trim() || '匿名书友',
      content, rating: parseInt($('#ratingText')?.dataset?.rating || '0'), createdAt: Date.now()
    });
    $('#commentContent').value = '';
    renderComments();
    await saveAndSync('💬 留言已保存到本地');
  });
  
  // 星级
  $$('#starRating .star').forEach(s => {
    s.addEventListener('click', () => {
      const v = parseInt(s.dataset.value);
      $$('#starRating .star').forEach((ss,i) => { ss.textContent = i < v ? '⭐' : '☆'; });
      const labels = ['','🤔一般','👍还行','😊不错','🎉很好','🌟完美'];
      const rt = $('#ratingText');
      rt.textContent = labels[v] || v+'分';
      rt.dataset.rating = v;
    });
    s.addEventListener('mouseenter', () => {
      const v = parseInt(s.dataset.value);
      $$('#starRating .star').forEach((ss,i) => { ss.textContent = i < v ? '⭐' : '☆'; });
    });
    s.addEventListener('mouseleave', () => {
      const cur = parseInt($('#ratingText')?.dataset?.rating || '0');
      $$('#starRating .star').forEach((ss,i) => { ss.textContent = i < cur ? '⭐' : '☆'; });
    });
  });
}

// ================================================================
// 导师面板
// ================================================================

function openMasterPanel() {
  const pwd = prompt('🔐 请输入导师密码：');
  if (pwd !== CONFIG.MASTER_PASSWORD) { if (pwd !== null) showToast('❌ 密码错误'); return; }
  
  const total = state.works.length;
  const reviewed = state.reviews.length;
  const pending = state.works.filter(w => !state.reviews.find(r => r.workId === w.id)).length;
  
  const pendingHTML = pending === 0 ? '<p class="empty-state-sm">所有作品都已点评！🎉</p>' :
    state.works.filter(w => !state.reviews.find(r => r.workId === w.id))
      .map(w => `<div class="pending-item" onclick="closeMasterPanel();showWorkDetail(${w.id})">${w.title}<span class="pending-script">${w.script}</span><span class="pending-date">${fmtDate(w.createdAt)}</span><span class="pending-action">✍️ 去点评</span></div>`).join('');
  
  const reviewedHTML = state.reviews.sort((a,b) => b.createdAt - a.createdAt)
    .map(r => { const w = state.works.find(ww => ww.id === r.workId); return w ? `<div class="reviewed-item" onclick="closeMasterPanel();showWorkDetail(${w.id})">${w.title}<span class="review-stars">${'⭐'.repeat(r.rating)}</span><span class="reviewed-date">${fmtDate(r.createdAt)}</span></div>` : ''; }).join('');
  
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay active master-panel-overlay';
  overlay.onclick = e => { if (e.target === overlay) overlay.remove(); };
  overlay.innerHTML = `
    <div class="modal modal-lg">
      <button class="modal-close" onclick="closeMasterPanel()">&times;</button>
      <div class="master-panel">
        <div class="master-panel-header"><h3>👨‍🏫 导师管理面板</h3><button class="btn btn-sm btn-outline" onclick="closeMasterPanel()">退出</button></div>
        <div class="master-stats">
          <div class="stat-card"><span class="stat-number">${total}</span><span class="stat-label">全部作品</span></div>
          <div class="stat-card"><span class="stat-number">${reviewed}</span><span class="stat-label">已点评</span></div>
          <div class="stat-card"><span class="stat-number">${pending}</span><span class="stat-label">待点评</span></div>
        </div>
        <div class="master-settings">
          <h4>⚙️ 设置</h4>
          <div class="form-group"><label>导师名称</label><input type="text" id="masterNameInput" class="form-input" value="${state.masterName}"></div>
          <div class="form-group"><label>简介</label><textarea id="masterBioInput" class="form-textarea" rows="3">${state.masterBio}</textarea></div>
          <button class="btn btn-primary" onclick="saveMasterSettings()">保存设置</button>
        </div>
        <div class="master-pending"><h4>📋 待点评作品 ${pending > 0 ? `<span class="pending-badge">${pending}</span>` : ''}</h4>${pendingHTML}</div>
        ${reviewedHTML ? `<div class="master-reviewed"><h4>✅ 已点评</h4>${reviewedHTML}</div>` : ''}
      </div>
    </div>
  `;
  document.body.appendChild(overlay);
}

function closeMasterPanel() {
  document.querySelector('.master-panel-overlay')?.remove();
}

async function saveMasterSettings() {
  const n = $('#masterNameInput')?.value?.trim();
  const b = $('#masterBioInput')?.value?.trim();
  if (n) state.masterName = n;
  if (b) state.masterBio = b;
  await saveAndSync('✅ 设置已保存');
}

// 导师入口按钮
function addMasterBtn() {
  const btn = document.createElement('button');
  btn.className = 'master-fab';
  btn.innerHTML = '👨‍🏫';
  btn.title = '导师管理';
  btn.onclick = openMasterPanel;
  document.body.appendChild(btn);
}

// ================================================================
// 数据工具
// ================================================================

function aboutBio() {
  // 从 aboutBio 编辑器读取/写入简介
  const bio = $('#aboutBio');
  if (bio) {
    if (!bio.textContent.trim()) bio.textContent = state.masterBio || '自幼喜爱书法，临池不辍。钟情于楷书的端庄严正，亦醉心于行书的行云流水。书法于我，不仅是技艺的修炼，更是心灵的栖居。愿与同好共赏翰墨之美，在笔墨纸砚间寻得一份宁静与自在。';
    bio.addEventListener('blur', () => { state.masterBio = bio.textContent.trim(); saveAndSync(); });
  }
}

function exportData() {
  const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `moyunxuan_${fmtDate(Date.now())}.json`;
  a.click();
  URL.revokeObjectURL(a);
  showToast('✅ 数据已导出');
}

function importData() {
  const input = document.createElement('input');
  input.type = 'file'; input.accept = '.json';
  input.onchange = async e => {
    try {
      const text = await e.target.files[0].text();
      const d = JSON.parse(text);
      if (d && d.works) {
        Object.assign(state, d);
        await saveAndSync();
        renderAll();
        showToast('✅ 数据导入成功！');
      } else showToast('❌ 文件格式不正确');
    } catch (err) { showToast('❌ 导入失败'); }
  };
  input.click();
}

function syncNow() {
  showToast('🔄 请在本机运行: ./sync.sh');
}

function addDataTools() {
  const container = $('.about-container');
  if (!container) return;
  const div = document.createElement('div');
  div.style.cssText = 'margin-top:24px;padding:16px;background:#f8f6f0;border-radius:8px;';
  div.innerHTML = `
    <h4 style="font-size:16px;margin-bottom:8px;">💾 数据管理</h4>
    <p style="font-size:13px;color:#888;margin-bottom:10px;">
      当前有 ${state.works.length} 幅作品，${state.reviews.length} 条点评，${state.comments.length} 条留言。
      数据保存在本地浏览器中。
    </p>
    <div style="display:flex;gap:8px;flex-wrap:wrap;">
      <button class="btn btn-sm btn-outline" onclick="exportData()">📤 导出备份</button>
      <button class="btn btn-sm btn-outline" onclick="importData()">📥 导入</button>
      <button class="btn btn-sm btn-outline" onclick="syncNow()">🔄 手动同步</button>
    </div>
    <p style="font-size:12px;color:#aaa;margin-top:8px;">
      💡 想共享数据？导出备份文件后在本机运行 <code>./sync.sh</code>
    </p>
  `;
  container.appendChild(div);
}

// ──── 首页 ────
function renderHome() {
  const cards = $$('.quick-cards .card');
  if (cards.length >= 3) {
    cards[1].querySelector('p').textContent = state.works.length > 0 ? `已有 ${state.works.length} 幅作品` : '记录每一幅心血之作';
  }
}

// ================================================================
// 初始化
// ================================================================
document.addEventListener('DOMContentLoaded', async () => {
  // 导航
  $$('.nav-link').forEach(l => l.addEventListener('click', e => { e.preventDefault(); navigateTo(l.dataset.page); }));
  
  // 首页 data-nav
  document.querySelectorAll('[data-nav]').forEach(el => el.addEventListener('click', e => { e.preventDefault(); navigateTo(el.dataset.nav); }));
  
  // 汉堡菜单
  document.getElementById('hamburger')?.addEventListener('click', () => document.getElementById('sidebar')?.classList.toggle('open'));
  
  // 学书法标签
  setupScriptTabs();
  
  // 作品表单
  setupWorkForm();
  
  // 图片上传
  setupImageUpload();
  
  // 上传按钮
  setupAddBtn();
  
  // 弹窗
  setupModals();
  
  // 留言
  setupComments();
  
  // 关于介绍
  aboutBio();
  
  // 导师按钮
  addMasterBtn();
  
  // 数据工具
  addDataTools();
  
  // 初始化数据
  await initData();
});
