// ============================================================
// 墨韵轩 - 书法学习与作品记录应用
// 后端: JSONBlob (共享存储) + localStorage (本地缓存)
// ============================================================

// ──── 配置 ────
const CONFIG = {
  // JSONBlob 数据库 ID（用于共享数据）
  JSONBLOB_ID: '019eee90-5a22-770b-b337-1c15a6b9ea91',
  JSONBLOB_URL: 'https://jsonblob.com/api/jsonBlob/019eee90-5a22-770b-b337-1c15a6b9ea91',
  
  // 导师密码（可修改）
  MASTER_PASSWORD: 'moyunxuan2024',
  
  // 存储键名
  STORAGE_KEY: 'moyunxuan_data',
  
  // 最近浏览的作品上限
  MAX_RECENT: 10
};

// ──── 本地状态 ────
let state = {
  works: [],
  reviews: [],
  comments: [],
  nextWorkId: 1,
  nextReviewId: 1,
  masterName: '书法导师',
  masterBio: '自幼习书，临池三十载，曾获全国书法大赛金奖。',
  isMasterMode: false
};

// ──── DOM 引用缓存 ────
let $ = (s) => document.querySelector(s);
let $$ = (s) => document.querySelectorAll(s);

// ──── 数据层 ────

// 从 JSONBlob 读取共享数据
async function fetchFromCloud() {
  try {
    const res = await fetch(CONFIG.JSONBLOB_URL, {
      signal: AbortSignal.timeout(5000)
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return data;
  } catch (e) {
    console.warn('[云存储] 读取失败:', e.message);
    return null;
  }
}

// 写入 JSONBlob
async function saveToCloud(data) {
  try {
    const res = await fetch(CONFIG.JSONBLOB_URL, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
      signal: AbortSignal.timeout(5000)
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    console.log('[云存储] 保存成功');
    return true;
  } catch (e) {
    console.warn('[云存储] 保存失败:', e.message);
    return false;
  }
}

// 从 localStorage 读取
function loadLocal() {
  try {
    const raw = localStorage.getItem(CONFIG.STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object') {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('[本地存储] 读取失败:', e);
  }
  return null;
}

// 保存到 localStorage
function saveLocal(data) {
  try {
    localStorage.setItem(CONFIG.STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.warn('[本地存储] 写入失败:', e);
  }
}

// 合并云端和本地数据（云端优先）
function mergeData(cloudData, localData) {
  if (!cloudData && !localData) return null;
  if (!cloudData) return localData;
  if (!localData) return cloudData;
  
  // 合并 works（去重）
  const workMap = new Map();
  const allWorks = [...(localData.works || []), ...(cloudData.works || [])];
  for (const w of allWorks) {
    const key = w.id || w._localTime;
    if (!workMap.has(key) || w._source === 'cloud') {
      workMap.set(key, { ...w, _source: w._source || 'cloud' });
    }
  }
  
  // 合并 reviews
  const reviewMap = new Map();
  const allReviews = [...(localData.reviews || []), ...(cloudData.reviews || [])];
  for (const r of allReviews) {
    const key = r.id || r._localTime;
    if (!reviewMap.has(key)) {
      reviewMap.set(key, r);
    }
  }
  
  return {
    works: Array.from(workMap.values()),
    reviews: Array.from(reviewMap.values()),
    comments: cloudData.comments || localData.comments || [],
    nextWorkId: Math.max(cloudData.nextWorkId || 1, localData.nextWorkId || 1),
    nextReviewId: Math.max(cloudData.nextReviewId || 1, localData.nextReviewId || 1),
    masterName: cloudData.masterName || localData.masterName || '书法导师',
    masterBio: cloudData.masterBio || localData.masterBio || ''
  };
}

// 初始化数据：先从云端加载，合并本地，回写云端
async function initData() {
  showStatus('加载中...');
  
  const [cloudData, localData] = await Promise.all([
    fetchFromCloud(),
    Promise.resolve(loadLocal())
  ]);
  
  const merged = mergeData(cloudData, localData);
  if (merged) {
    state.works = merged.works || [];
    state.reviews = merged.reviews || [];
    state.comments = merged.comments || [];
    state.nextWorkId = merged.nextWorkId || 1;
    state.nextReviewId = merged.nextReviewId || 1;
    state.masterName = merged.masterName || '书法导师';
    state.masterBio = merged.masterBio || '';
    
    // 回写云端（如果没有云端数据或本地有更新）
    if (!cloudData && merged) {
      await saveToCloud(merged);
    }
    saveLocal(merged);
  }
  
  hideStatus();
  renderAll();
}

// 保存并同步
async function saveAndSync() {
  const data = getStateData();
  saveLocal(data);
  const ok = await saveToCloud(data);
  if (!ok) {
    showToast('⚠️ 云端同步失败，数据已保存到本地');
  }
}

function getStateData() {
  return {
    works: state.works,
    reviews: state.reviews,
    comments: state.comments,
    nextWorkId: state.nextWorkId,
    nextReviewId: state.nextReviewId,
    masterName: state.masterName,
    masterBio: state.masterBio
  };
}

// ──── 导航 ────
function navigateTo(pageName) {
  // 隐藏所有页面
  $$('.page').forEach(p => p.classList.remove('active'));
  // 显示目标页面
  const target = $('#page-' + pageName);
  if (target) target.classList.add('active');
  // 更新导航高亮
  $$('.nav-link').forEach(l => l.classList.remove('active'));
  const navLink = $(`.nav-link[data-page="${pageName}"]`);
  if (navLink) navLink.classList.add('active');
  // 关闭移动端菜单
  document.getElementById('sidebar').classList.remove('open');
  
  // 页面渲染
  if (pageName === 'learn') renderLearn();
  if (pageName === 'gallery') renderGallery();
  if (pageName === 'about') renderComments();
  
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ──── 状态提示 ────
function showStatus(msg) {
  let el = $('#statusBar');
  if (!el) {
    el = document.createElement('div');
    el.id = 'statusBar';
    el.className = 'status-bar';
    document.body.appendChild(el);
  }
  el.textContent = msg;
  el.classList.add('show');
}

function hideStatus() {
  const el = $('#statusBar');
  if (el) el.classList.remove('show');
}

// ──── Toast 消息 ────
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

// ──── 首次渲染 ────
function renderAll() {
  renderHome();
  renderLearn();
  renderGallery();
  renderComments();
}

// ================================================================
// 首页
// ================================================================
function renderHome() {
  const grid = $('.quick-cards');
  if (!grid) return;
  
  // 最新作品预览（保留已有结构）
  const workCount = state.works.length;
  const reviewCount = state.reviews.length;
  
  // 更新计数器
  const cards = grid.querySelectorAll('.card');
  if (cards.length >= 3) {
    cards[0].querySelector('p').textContent = workCount > 0 ? `${workCount} 篇学习资料` : '楷行草隶篆，入门到精通';
    cards[1].querySelector('p').textContent = workCount > 0 ? `已有 ${workCount} 幅作品` : '记录每一幅心血之作';
  }
}

// ================================================================
// 学书法 — 海量干货内容
// ================================================================

// 文房四宝指南
const TOOLS_GUIDE = [
  {
    title: '毛笔',
    icon: '🖊️',
    content: '选笔四德：「尖、齐、圆、健」。尖指笔锋尖锐；齐指毫毛齐整；圆指笔肚饱满；健指弹性好。初学者推荐兼毫（羊狼毫混合），弹性适中易控制。羊毫柔软蓄墨多，狼毫劲健弹性好。笔号选「中楷」即可通用。品牌推荐：善琏湖笔、周虎臣、戴月轩。',
    tips: ['新笔用温水泡开，只泡笔头三分之二', '每次用完清水洗净，悬挂晾干', '出差/长期不用请彻底洗净晾干保存']
  },
  {
    title: '墨',
    icon: '⚫',
    content: '分为墨锭（研墨）和墨汁（开瓶即用）。初学者推荐墨汁方便快捷。「一得阁」「红星」「曹素功」为三大老字号墨汁品牌。研墨更有仪式感，墨色层次更丰富，但需要花费时间研磨。',
    tips: ['墨汁倒出后不要倒回瓶内（会变质）', '研墨以「浓淡适中、墨色黑亮」为佳', '墨汁用前摇匀']
  },
  {
    title: '纸',
    icon: '📜',
    content: '宣纸按工艺分为生宣、熟宣、半生熟。生宣吸墨快、洇墨明显，适合写意和行草书。熟宣不洇墨，适合楷书、隶书、篆书。半生熟介于两者之间，最适合初学者。初学者推荐手工毛边纸或机制毛边纸，性价比高。宣纸品牌：红星、汪六吉、桃记红。',
    tips: ['练习用毛边纸，创作用好宣纸', '半生熟宣纸最适合入门', '保存宣纸要防潮防晒']
  },
  {
    title: '砚',
    icon: '🪨',
    content: '四大名砚：端砚（广东）、歙砚（安徽）、洮河砚（甘肃）、澄泥砚。初学者用普通砚台即可，关键是「平整细腻、发墨快」。现代多用墨汁，砚台更多用于储墨。可选择带盖子的砚台防止墨汁挥发。',
    tips: ['每次用完清洗砚台，不留宿墨', '砚台不要暴晒', '端砚歙砚价高，初学者选几十元的普通砚即可']
  },
  {
    title: '其他工具',
    icon: '🧰',
    content: '笔搁（搁笔用，防滚动）、笔洗（洗笔容器，大碗也可替代）、镇纸（压纸防皱，重物即可）、毡垫（吸墨防渗，毛毡最佳）。进阶：印泥+印章（落款用）、界格（折纸辅助）。',
    tips: ['毛毡垫是必需品，普通毛毡约10-20元', '镇纸可用厚书替代', '练字前准备一盆清水和一块抹布']
  }
];

// 执笔坐姿
const POSTURE_GUIDE = {
  title: '正确坐姿与执笔',
  icon: '🧘',
  content: [
    { subtitle: '坐姿要领', text: '头正：头部端正，微向前倾。身直：身体坐直，胸部离桌一拳。臂开：两臂自然打开，左手按纸右手执笔。足安：两脚平放地面，与肩同宽。' },
    { subtitle: '执笔法（五指法）', text: '擫（yè）：拇指按住笔杆左侧。押：食指压住笔杆右侧。钩：中指弯曲钩住笔杆外侧。格：无名指抵住笔杆内侧。抵：小指紧贴无名指辅助发力。' },
    { subtitle: '执笔要领', text: '指实掌虚：手指用力握笔，掌心要空（可容一个鸡蛋）。腕平掌竖：手腕与桌面平行，手掌竖立。执笔高低：写小楷执低（近笔头），写大字执高（远笔头）。' },
    { subtitle: '常见错误', text: '执笔太紧（腕部僵硬），掌心未虚（运笔不灵活），坐姿歪斜（影响字形判断）。建议每次练习前先调整姿势，养成肌肉记忆。' }
  ]
};

// 28种基本笔画（楷书核心口诀）
const BASIC_STROKES = [
  { name: '点（侧）', shape: '丶', method: '轻入→渐按→顿笔→回锋', tips: '如高峰坠石，棱角分明' },
  { name: '横（勒）', shape: '一', method: '逆锋起→中锋行→顿笔收', tips: '左低右高，微呈弧势' },
  { name: '竖（努）', shape: '丨', method: '逆锋起→中锋行→顿笔收', tips: '垂露竖收笔圆润，悬针竖出锋尖细' },
  { name: '撇（掠）', shape: '丿', method: '逆锋起→中锋行→渐提出锋', tips: '力送笔端，不可飘忽' },
  { name: '捺（磔）', shape: '乀', method: '轻入→渐按→重顿→平出锋', tips: '一波三折，捺脚含蓄饱满' },
  { name: '提（策）', shape: '㇀', method: '逆锋起→顿→提锋右上出', tips: '如策马扬鞭，短促有力' },
  { name: '折（矩）', shape: '𠃋', method: '横至折处→提笔→顿→转锋下行', tips: '内方外圆，折处骨节分明' },
  { name: '钩（趯）', shape: '亅', method: '行至钩处→顿→蓄势→向左上趯出', tips: '如人踢脚，短促锐利' }
];

// 楷书四大家深度对比
const KAISHU_MASTERS = [
  {
    name: '欧阳询',
    era: '唐',
    style: '险峻严谨',
    masterpiece: '《九成宫醴泉铭》',
    features: ['笔画方整峻峭，棱角分明', '结体险绝，左紧右舒', '横画左低右高，斜度较大', '竖画微向内环抱（"背"势）', '主笔突出，一字有一主峰'],
    advice: '从《九成宫》入手，先练基本笔画，再学结体。此碑为楷书之极则。'
  },
  {
    name: '颜真卿',
    era: '唐',
    style: '雄强厚实',
    masterpiece: '《多宝塔碑》《颜勤礼碑》',
    features: ['点画圆厚丰腴，筋力内含', '结体宽博，外紧内松', '横轻竖重，对比鲜明', '竖画直下（"抱"势），两头粗中间细', '蚕头雁尾式的捺脚'],
    advice: '初学可选《多宝塔碑》（更工整），进阶学《颜勤礼碑》。注意体会"颜筋"的骨力。'
  },
  {
    name: '柳公权',
    era: '唐',
    style: '清劲挺拔',
    masterpiece: '《玄秘塔碑》《神策军碑》',
    features: ['笔画瘦硬挺拔，如削金斩玉', '结体中宫紧密，四面伸展', '起收笔多用方笔，斩钉截铁', '撇轻捺重，对比强烈', '竖画多作悬针，锐利干脆'],
    advice: '学柳体需先有欧颜基础，否则易陷入"瘦硬无肉"。重在体会其骨力清峻。'
  },
  {
    name: '赵孟頫',
    era: '元',
    style: '秀美流畅',
    masterpiece: '《胆巴碑》《妙严寺记》',
    features: ['线条圆润流畅，含蓄柔美', '结体匀称疏朗，沉稳端庄', '笔法融合行书意趣，流动感强', '起笔多用侧锋，收笔自然回锋', '整体风格温润典雅，平易近人'],
    advice: '赵体是楷书入门的好选择，相对容易上手。重点练其流畅自然的笔意。'
  }
];

// 行书四大技法
const XINGSHU_TECHNIQUES = [
  {
    title: '牵丝引带',
    desc: '字与字之间用细细的牵丝连接，形成行气贯通。牵丝要细而有弹性，不可粗重拖沓。例：《兰亭序》中"之"字的牵丝变化。',
    practice: '先写楷书单字熟练，再用极细的笔意连接两字，最后发展为自然牵丝。'
  },
  {
    title: '大小参差',
    desc: '行书讲究「大字促令小，小字展令大」。通过字形大小的变化制造节奏，避免千篇一律。例：王羲之「群贤毕至」四字大小各有不同。',
    practice: '同一内容写三遍，每次尝试不同的轻重缓急变化。'
  },
  {
    title: '欹侧取势',
    desc: '字的重心不一定居中，可左倾右仰，通过上下字的呼应保持平衡。例：米芾书法中极端的欹侧而不倒。',
    practice: '写一行字，让字轮流左倾右斜，但整体行线始终保持垂直。'
  },
  {
    title: '疏密对比',
    desc: '笔画密集处收紧，松散处舒展。通过疏密变化制造节奏感。例：王铎草书中的极强烈的疏密对比。',
    practice: '单字练习时注意内部空间的分割，避免均匀排布。'
  }
];

// 草书五阶路线
const CAOSHU_PATH = [
  { stage: 1, name: '识草入门', content: '先认识草书符号，了解草法规则。推荐《草诀百韵歌》作为识字教材，学习常见的偏旁草化写法。注意：同一个字可能有多种草法写法。' },
  { stage: 2, name: '小草筑基', content: '练章草（草书源头），推荐皇象《急就章》、索靖《出师颂》。章草特点是字字独立、笔画有隶意，比今草更容易入。每日临写15-20字，重在记草法。' },
  { stage: 3, name: '线条锤炼', content: '练今草的线条质感和使转功夫。推荐孙过庭《书谱》（墨迹本，笔法清晰）。重点练习：中锋行笔的圆劲感、转折处的使转交替、提按顿挫的节奏。' },
  { stage: 4, name: '章法气韵', content: '练习行与行之间的呼应，字组关系，墨色变化。推荐怀素《自叙帖》、张旭《古诗四帖》（狂草经典）。重点：整体气息的连贯，布局的疏密虚实，长线条的张力。' },
  { stage: 5, name: '狂草升华', content: '脱帖创作，追求个人风貌。推荐王铎、傅山作品。重点：情感表达、节奏变化、意外之趣。这个阶段需要大量临摹经典，逐渐形成自己的草书语言。' }
];

// 隶书核心技巧
const LISHU_TIPS = [
  { title: '蚕头燕尾', desc: '横画起笔如蚕头（逆锋起笔后顿笔呈圆形），收笔如燕尾（顿笔后向右上挑出）。这是隶书最标志性的笔画特征。' },
  { title: '一波三折', desc: '横画和捺画不是一条直线，而是像波浪一样有起伏变化。起→行→收三个阶段各有不同节奏。' },
  { title: '燕不双飞', desc: '一个字中只能有一个"燕尾"（波磔）。如果有多个横画，只有一个横画出燕尾收笔，其余横画都要平收。' },
  { title: '横向取势', desc: '隶书整体呈扁方形，横向舒展纵向收敛。左右开张如飞翼，给人以稳重中有灵动之感。' },
  { title: '轻重分明', desc: '横画细竖画粗（与楷书相反），主笔粗壮次笔纤细。通过笔画的粗细对比制造节奏变化。' }
];

// 篆书四要
const ZHUANSHU_KEYS = [
  { title: '中锋行笔', desc: '笔尖始终在线条中间运行，线条圆润饱满如铁丝。这是篆书最基本的用笔要求。' },
  { title: '匀速运动', desc: '行笔速度均匀，不可忽快忽慢。转弯处同样保持匀速，不可停顿或颤抖。' },
  { title: '对称均衡', desc: '篆书结体注重左右对称、上下均衡。书写前心中要有中轴线概念，左右笔画对称分布。' },
  { title: '粗细一致', desc: '小篆线条从头到尾粗细均匀，起收笔均为圆笔（藏锋），无明显顿挫。大篆（石鼓文）稍微有变化但仍以均匀为主。' }
];

// 学习卡片数据
const SCRIPTS_DATA = [
  {
    id: 'tools',
    script: '文房四宝',
    title: '文房四宝选购与使用指南',
    desc: '从笔、墨、纸、砚到配件，一站式了解书法必备工具',
    icon: '🧰',
    level: '入门'
  },
  {
    id: 'posture',
    script: '基本功',
    title: '正确坐姿与执笔法',
    desc: '五指执笔法详解，养成正确的书写习惯',
    icon: '🧘',
    level: '入门'
  },
  {
    id: 'strokes',
    script: '楷书',
    title: '28种基本笔画口诀',
    desc: '从点横竖撇捺到折钩提，八大核心笔画技法精讲',
    icon: '✍️',
    level: '入门'
  },
  {
    id: 'masters',
    script: '楷书',
    title: '楷书四大家对比精讲',
    desc: '欧颜柳赵——风格特点、代表碑帖、学习方法全解析',
    icon: '👑',
    level: '进阶'
  },
  {
    id: 'xingshu',
    script: '行书',
    title: '行书四大技法',
    desc: '牵丝引带、大小参差、欹侧取势、疏密对比',
    icon: '🌊',
    level: '进阶'
  },
  {
    id: 'caoshu',
    script: '草书',
    title: '草书五阶学习路线',
    desc: '从识草入门到狂草升华，循序渐进的训练路径',
    icon: '🐉',
    level: '高阶'
  },
  {
    id: 'lishu',
    script: '隶书',
    title: '隶书核心技巧五要',
    desc: '蚕头燕尾、一波三折、燕不双飞、横向取势、轻重分明',
    icon: '🌾',
    level: '进阶'
  },
  {
    id: 'zhuanshu',
    script: '篆书',
    title: '篆书四要诀',
    desc: '中锋行笔、匀速运动、对称均衡、粗细一致',
    icon: '🔤',
    level: '高阶'
  }
];

// 渲染学书法板块
function renderLearn() {
  const grid = $('#learnGrid');
  if (!grid) return;
  
  let html = '';
  for (const card of SCRIPTS_DATA) {
    html += `
      <div class="learn-card" data-script="${card.script}" onclick="showLearnDetail('${card.id}')">
        <div class="learn-card-icon">${card.icon}</div>
        <span class="learn-level level-${card.level}">${card.level}</span>
        <h4>${card.title}</h4>
        <p>${card.desc}</p>
      </div>
    `;
  }
  grid.innerHTML = html;
}

// 学习详情弹窗
function showLearnDetail(id) {
  const main = $('#mainContent');
  
  // 查找卡片数据
  const card = SCRIPTS_DATA.find(c => c.id === id);
  if (!card) return;
  
  let content = '';
  
  if (id === 'tools') {
    content = renderToolsGuide();
  } else if (id === 'posture') {
    content = renderPostureGuide();
  } else if (id === 'strokes') {
    content = renderBasicStrokes();
  } else if (id === 'masters') {
    content = renderKaishuMasters();
  } else if (id === 'xingshu') {
    content = renderXingshu();
  } else if (id === 'caoshu') {
    content = renderCaoshu();
  } else if (id === 'lishu') {
    content = renderLishu();
  } else if (id === 'zhuanshu') {
    content = renderZhuanshu();
  }
  
  // 显示弹窗
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.onclick = (e) => { if (e.target === overlay) overlay.remove(); };
  overlay.innerHTML = `
    <div class="modal modal-lg">
      <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">&times;</button>
      <h3>${card.icon} ${card.title}</h3>
      <div class="learn-detail-content">
        ${content}
      </div>
    </div>
  `;
  main.appendChild(overlay);
}

function renderToolsGuide() {
  let html = '<div class="tools-guide">';
  for (const item of TOOLS_GUIDE) {
    html += `
      <div class="tool-card">
        <h4>${item.icon} ${item.title}</h4>
        <p>${item.content}</p>
        ${item.tips.length ? `
          <div class="tool-tips">
            <strong>💡 小贴士：</strong>
            <ul>${item.tips.map(t => `<li>${t}</li>`).join('')}</ul>
          </div>
        ` : ''}
      </div>
    `;
  }
  html += '</div>';
  return html;
}

function renderPostureGuide() {
  let html = '';
  for (const item of POSTURE_GUIDE.content) {
    html += `
      <div class="posture-item">
        <h4>${item.subtitle}</h4>
        <p>${item.text}</p>
      </div>
    `;
  }
  return html;
}

function renderBasicStrokes() {
  let html = '<div class="strokes-tips"><p>「永字八法」是书法基本笔画的经典概括。以下为八大核心笔画及口诀：</p></div>';
  html += '<table class="strokes-table"><thead><tr><th>笔画</th><th>形态</th><th>笔法</th><th>口诀</th></tr></thead><tbody>';
  for (const s of BASIC_STROKES) {
    html += `<tr>
      <td><strong>${s.name}</strong></td>
      <td style="font-size:2em;font-family:'Noto Serif SC',serif;">${s.shape}</td>
      <td>${s.method}</td>
      <td>${s.tips}</td>
    </tr>`;
  }
  html += '</tbody></table>';
  
  html += '<div class="stroke-practice"><h4>✍️ 练习建议</h4><p>每天选2-3个笔画各写20遍，先慢后快，注重提按轻重的变化。一周后再写单字组合练习。</p></div>';
  return html;
}

function renderKaishuMasters() {
  let html = '<p>楷书四大家（欧阳询、颜真卿、柳公权、赵孟頫）代表了楷书的最高成就。深入了解他们的风格特点，有助于找到适合自己的学习方向。</p>';
  
  for (const m of KAISHU_MASTERS) {
    html += `
      <div class="master-card">
        <h4>${m.name} <span class="master-era">${m.era}</span> <span class="master-style">${m.style}</span></h4>
        <p><strong>代表碑帖：</strong>${m.masterpiece}</p>
        <p><strong>风格特点：</strong></p>
        <ul>${m.features.map(f => `<li>${f}</li>`).join('')}</ul>
        <div class="master-advice"><strong>学习建议：</strong>${m.advice}</div>
      </div>
    `;
  }
  return html;
}

function renderXingshu() {
  if (!XINGSHU_TECHNIQUES || !XINGSHU_TECHNIQUES.length) return '<p>行书技法资料加载中...</p>';
  let html = '<p>行书介于楷书和草书之间，比楷书流动，比草书易识。掌握以下四大技法，行书水平将有大提升：</p>';
  for (const t of XINGSHU_TECHNIQUES) {
    html += `
      <div class="technique-card">
        <h4>${t.title}</h4>
        <p>${t.desc}</p>
        <div class="practice-tip"><strong>练习方法：</strong>${t.practice}</div>
      </div>
    `;
  }
  return html;
}

function renderCaoshu() {
  if (!CAOSHU_PATH || !CAOSHU_PATH.length) return '<p>草书学习资料加载中...</p>';
  let html = '<p>草书学习不能一蹴而就，需要按阶段循序渐进。以下为五阶学习路线：</p>';
  for (const s of CAOSHU_PATH) {
    html += `
      <div class="caoshu-stage">
        <div class="stage-badge">第${s.stage}阶</div>
        <h4>${s.name}</h4>
        <p>${s.content}</p>
      </div>
    `;
  }
  html += `
    <div class="caoshu-tips">
      <p><strong>推荐工具书：</strong>《标准草书》《草诀百韵歌》《王羲之草诀歌》</p>
      <p><strong>每日功课：</strong>识5个草法符号 + 临写50字小草 + 读帖15分钟</p>
    </div>
  `;
  return html;
}

function renderLishu() {
  if (!LISHU_TIPS || !LISHU_TIPS.length) return '<p>隶书技巧资料加载中...</p>';
  let html = '<p>隶书源于秦代，盛于汉代。掌握以下五大核心技巧，隶书功力将大为精进：</p>';
  for (const t of LISHU_TIPS) {
    html += `
      <div class="lishu-tip">
        <h4>${t.title}</h4>
        <p>${t.desc}</p>
      </div>
    `;
  }
  html += '<div class="lishu-recommend"><p><strong>推荐碑帖：</strong>《曹全碑》（秀美一路）、《张迁碑》（雄强一路）、《礼器碑》（精劲一路）、《乙瑛碑》（庙堂气象）</p></div>';
  return html;
}

function renderZhuanshu() {
  if (!ZHUANSHU_KEYS || !ZHUANSHU_KEYS.length) return '<p>篆书技巧资料加载中...</p>';
  let html = '<p>篆书是五体之祖，学好篆书对掌握中锋行笔至关重要。以下四大要诀助你入门：</p>';
  for (const k of ZHUANSHU_KEYS) {
    html += `
      <div class="zhuanshu-key">
        <h4>${k.title}</h4>
        <p>${k.desc}</p>
      </div>
    `;
  }
  html += '<div class="zhuanshu-recommend"><p><strong>推荐碑帖：</strong>小篆→李斯《峄山刻石》、李阳冰《三坟记》；大篆→《石鼓文》</p></div>';
  return html;
}

// ──── 书体标签切换 ────
function setupScriptTabs() {
  const tabBar = $('#scriptTabs');
  if (!tabBar) return;
  
  tabBar.addEventListener('click', (e) => {
    const tab = e.target.closest('.tab');
    if (!tab) return;
    
    tabBar.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    
    const script = tab.dataset.script;
    const cards = $$('.learn-card');
    cards.forEach(c => {
      if (script === 'all' || c.dataset.script === script) {
        c.style.display = 'flex';
      } else {
        c.style.display = 'none';
      }
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
    grid.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">🖌️</div>
        <h3>还没有作品</h3>
        <p>点击上方按钮上传您的第一幅书法作品吧</p>
      </div>
    `;
    return;
  }
  
  // 按时间倒序排列
  const sorted = [...state.works].sort((a, b) => b.createdAt - a.createdAt);
  
  grid.innerHTML = sorted.map(work => {
    const review = state.reviews.find(r => r.workId === work.id);
    return `
      <div class="work-card" onclick="showWorkDetail(${work.id})">
        <div class="work-image" style="background-image: url('${work.image || 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22300%22 height=%22200%22%3E%3Crect fill=%22%23f0eee6%22 width=%22300%22 height=%22200%22/%3E%3Ctext x=%22150%22 y=%22115%22 text-anchor=%22middle%22 fill=%22%23999%22 font-size=%2230%22%3E📜%3C/text%3E%3C/svg%3E'});background-size:cover;background-position:center;">
          <span class="work-script-badge">${work.script}</span>
          ${review ? '<span class="work-reviewed">✅ 已点评</span>' : ''}
        </div>
        <div class="work-info">
          <h4>${work.title}</h4>
          <p class="work-date">${formatDate(work.createdAt)}</p>
          ${review ? `<div class="work-preview-review"><span class="review-stars">${'⭐'.repeat(review.rating)}</span><span class="review-excerpt">${review.comment.slice(0, 20)}${review.comment.length > 20 ? '...' : ''}</span></div>` : ''}
        </div>
      </div>
    `;
  }).join('');
}

// 查看作品详情
function showWorkDetail(id) {
  const work = state.works.find(w => w.id === id);
  if (!work) return;
  
  const review = state.reviews.find(r => r.workId === id);
  
  const detail = $('#detailContent');
  const modal = $('#detailModal');
  
  detail.innerHTML = `
    <div class="detail-header">
      <button class="btn btn-sm btn-edit" onclick="editWork(${work.id})">✏️ 编辑</button>
      <button class="btn btn-sm btn-danger" onclick="deleteWork(${work.id})">🗑️ 删除</button>
    </div>
    ${work.image ? `<div class="detail-image-wrap"><img src="${work.image}" alt="${work.title}" class="detail-image" onclick="window.open('${work.image}','_blank')"></div>` : ''}
    <div class="detail-body">
      <h3>${work.title}</h3>
      <p><span class="detail-tag">${work.script}</span> ${work.workDate ? `<span class="detail-tag">${work.workDate}</span>` : ''}</p>
      ${work.note ? `<p class="detail-note">${work.note}</p>` : ''}
      <p class="detail-time">上传于 ${formatDate(work.createdAt)}</p>
    </div>
    
    ${review ? `
      <div class="master-review-section">
        <h4>📝 导师点评</h4>
        <div class="review-box">
          <div class="review-header">
            <span class="review-avatar">👨‍🏫</span>
            <div>
              <strong>${review.masterName || state.masterName}</strong>
              <span class="review-rating">${'⭐'.repeat(review.rating)}${'☆'.repeat(5 - review.rating)}</span>
            </div>
            <span class="review-time">${formatDate(review.createdAt)}</span>
          </div>
          <p class="review-comment">${review.comment}</p>
        </div>
      </div>
    ` : ''}
    
    <!-- 导师点评按钮 -->
    ${!review ? '<button class="btn btn-primary btn-full mt-1" onclick="showReviewForm(' + work.id + ')">✍️ 写点评（导师模式）</button>' : ''}
    
    <button class="btn btn-outline btn-full mt-1" onclick="closeDetail()">关闭</button>
  `;
  
  modal.classList.add('active');
}

function closeDetail() {
  $('#detailModal').classList.remove('active');
}

// 编辑作品
function editWork(id) {
  const work = state.works.find(w => w.id === id);
  if (!work) return;
  
  closeDetail();
  setTimeout(() => {
    openWorkModal(work);
  }, 300);
}

// 删除作品
function deleteWork(id) {
  if (!confirm('确定要删除这幅作品吗？此操作不可撤销。')) return;
  
  state.works = state.works.filter(w => w.id !== id);
  state.reviews = state.reviews.filter(r => r.workId !== id);
  
  closeDetail();
  saveAndSync().then(() => {
    renderGallery();
    showToast('✅ 已删除');
  });
}

// 格式化日期
function formatDate(ts) {
  if (!ts) return '';
  const d = new Date(ts);
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}

// ──── 上传/编辑作品 ────
function openWorkModal(work) {
  const modal = $('#workModal');
  const title = $('#modalTitle');
  const form = $('#workForm');
  const editId = $('#editId');
  const preview = $('#imagePreview');
  const placeholder = $('#uploadPlaceholder');
  const imgInput = $('#imageInput');
  
  if (work) {
    title.textContent = '编辑作品';
    editId.value = work.id;
    $('#workTitle').value = work.title || '';
    $('#workScript').value = work.script || '楷书';
    $('#workDate').value = work.workDate || '';
    $('#workNote').value = work.note || '';
    
    if (work.image) {
      preview.src = work.image;
      preview.classList.remove('hidden');
      placeholder.classList.add('hidden');
    }
  } else {
    title.textContent = '上传新作品';
    form.reset();
    editId.value = '';
    preview.classList.add('hidden');
    preview.src = '';
    placeholder.classList.remove('hidden');
  }
  
  modal.classList.add('active');
}

// ──── 作品表单提交 ────
function setupWorkForm() {
  const form = $('#workForm');
  if (!form) return;
  
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const editId = $('#editId').value;
    const title = $('#workTitle').value.trim();
    const script = $('#workScript').value;
    const workDate = $('#workDate').value;
    const note = $('#workNote').value.trim();
    const img = $('#imagePreview');
    
    if (!title) {
      showToast('请填写作品名称');
      return;
    }
    
    const image = img.src && !img.classList.contains('hidden') ? img.src : null;
    
    if (editId) {
      // 编辑已有作品
      const idx = state.works.findIndex(w => w.id === parseInt(editId));
      if (idx !== -1) {
        state.works[idx] = {
          ...state.works[idx],
          title,
          script,
          workDate,
          note,
          ...(image ? { image } : {})
        };
      }
      showToast('✅ 已更新');
    } else {
      // 新建作品
      state.works.push({
        id: state.nextWorkId++,
        title,
        script,
        workDate,
        note,
        image,
        createdAt: Date.now()
      });
      showToast('🎉 作品上传成功！');
    }
    
    $('#workModal').classList.remove('active');
    await saveAndSync();
    renderGallery();
    renderHome();
  });
}

// ──── 图片上传 ────
function setupImageUpload() {
  const uploadArea = $('#uploadArea');
  const imgInput = $('#imageInput');
  const preview = $('#imagePreview');
  const placeholder = $('#uploadPlaceholder');
  
  if (!uploadArea) return;
  
  // 点击上传
  uploadArea.addEventListener('click', () => imgInput.click());
  
  // 文件选择
  imgInput.addEventListener('change', handleFileSelect);
  
  // 拖拽上传
  uploadArea.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadArea.classList.add('drag-over');
  });
  
  uploadArea.addEventListener('dragleave', () => {
    uploadArea.classList.remove('drag-over');
  });
  
  uploadArea.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadArea.classList.remove('drag-over');
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      processFile(file);
    }
  });
}

function handleFileSelect(e) {
  const file = e.target.files[0];
  if (file && file.type.startsWith('image/')) {
    processFile(file);
  }
}

function processFile(file) {
  const preview = $('#imagePreview');
  const placeholder = $('#uploadPlaceholder');
  
  // 压缩图片到最大 800px
  const reader = new FileReader();
  reader.onload = (e) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      let w = img.width, h = img.height;
      const maxDim = 800;
      if (w > maxDim || h > maxDim) {
        if (w > h) { h = h * maxDim / w; w = maxDim; }
        else { w = w * maxDim / h; h = maxDim; }
      }
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, w, h);
      preview.src = canvas.toDataURL('image/jpeg', 0.7);
      preview.classList.remove('hidden');
      placeholder.classList.add('hidden');
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
}

// ──── 添加作品按钮 ────
function setupAddWorkBtn() {
  const btn = $('#addWorkBtn');
  if (btn) {
    btn.addEventListener('click', () => openWorkModal(null));
  }
}

// ──── 关闭弹窗 ────
function setupModals() {
  // 作品弹窗关闭
  const modalClose = $('#modalClose');
  if (modalClose) {
    modalClose.addEventListener('click', () => $('#workModal').classList.remove('active'));
  }
  
  // 详情弹窗关闭
  const detailClose = $('#detailClose');
  if (detailClose) {
    detailClose.addEventListener('click', closeDetail);
  }
  
  // 点击遮罩关闭
  $$('.modal-overlay').forEach(el => {
    el.addEventListener('click', (e) => {
      if (e.target === el) el.classList.remove('active');
    });
  });
}

// ================================================================
// 导师点评功能
// ================================================================

// 显示点评表单
function showReviewForm(workId) {
  const work = state.works.find(w => w.id === workId);
  if (!work) return;
  
  // 先验证密码
  const pwd = prompt('🔐 请输入导师密码：');
  if (pwd !== CONFIG.MASTER_PASSWORD) {
    if (pwd !== null) showToast('❌ 密码错误');
    return;
  }
  
  // 密码正确，显示点评表单
  const detail = $('#detailContent');
  
  const reviewHtml = `
    <div class="review-form-section">
      <h4>✍️ 导师点评 — ${work.title}</h4>
      <div class="form-group">
        <label>导师名称</label>
        <input type="text" id="reviewMasterName" class="form-input" value="${state.masterName}" placeholder="导师称呼">
      </div>
      <div class="form-group">
        <label>评分</label>
        <div class="review-stars-input" id="reviewStarsInput">
          ${[1,2,3,4,5].map(i => `<span class="review-star" data-val="${i}">☆</span>`).join('')}
        </div>
      </div>
      <div class="form-group">
        <label>点评内容</label>
        <textarea id="reviewComment" class="form-textarea" rows="5" placeholder="写下专业点评意见..."></textarea>
      </div>
      <button class="btn btn-primary btn-full" onclick="submitReview(${workId})">提交点评</button>
      <button class="btn btn-outline btn-full mt-1" onclick="closeDetail()">取消</button>
    </div>
  `;
  
  // 替换详情内容
  detail.innerHTML = reviewHtml;
  
  // 初始化为空
  window._reviewRating = 5;
  
  // 星级交互
  setTimeout(() => {
    const stars = $$('.review-star');
    stars.forEach((s, idx) => {
      s.addEventListener('click', () => {
        window._reviewRating = idx + 1;
        stars.forEach((ss, i) => {
          ss.textContent = i <= idx ? '⭐' : '☆';
        });
      });
      // 默认5星
      if (idx < 5) s.textContent = '⭐';
    });
  }, 50);
}

// 提交点评
async function submitReview(workId) {
  const comment = $('#reviewComment')?.value?.trim();
  const masterName = $('#reviewMasterName')?.value?.trim() || state.masterName;
  
  if (!comment) {
    showToast('请填写点评内容');
    return;
  }
  
  const review = {
    id: state.nextReviewId++,
    workId: workId,
    masterName: masterName,
    comment: comment,
    rating: window._reviewRating || 5,
    createdAt: Date.now()
  };
  
  state.reviews.push(review);
  state.masterName = masterName;
  
  await saveAndSync();
  showToast('✅ 点评已保存');
  
  // 刷新详情
  showWorkDetail(workId);
  renderGallery();
}

// ================================================================
// 书友留言
// ================================================================
function renderComments() {
  const list = $('#commentList');
  if (!list) return;
  
  if (state.comments.length === 0) {
    list.innerHTML = '<div class="empty-state-sm">暂无留言，快来写第一条吧～</div>';
    return;
  }
  
  const sorted = [...state.comments].sort((a, b) => b.createdAt - a.createdAt);
  list.innerHTML = sorted.map(c => `
    <div class="comment-item">
      <div class="comment-header">
        <strong>${c.name || '匿名书友'}</strong>
        <span class="comment-stars-display">${'⭐'.repeat(c.rating || 0)}</span>
        <span class="comment-time">${formatDate(c.createdAt)}</span>
      </div>
      <p>${c.content}</p>
    </div>
  `).join('');
}

// 提交留言
function setupCommentForm() {
  const btn = $('#submitComment');
  if (!btn) return;
  
  btn.addEventListener('click', async () => {
    const name = $('#commentName')?.value?.trim() || '匿名书友';
    const content = $('#commentContent')?.value?.trim();
    const rating = parseInt($('#ratingText')?.dataset?.rating || '0');
    
    if (!content) {
      showToast('请写下想说的话');
      return;
    }
    
    state.comments.push({
      name,
      content,
      rating: rating || 0,
      createdAt: Date.now()
    });
    
    $('#commentContent').value = '';
    renderComments();
    await saveAndSync();
    showToast('💬 留言发表成功！');
  });
}

// 留言星级
function setupCommentStars() {
  const stars = $$('#starRating .star');
  const ratingText = $('#ratingText');
  
  stars.forEach(star => {
    star.addEventListener('click', () => {
      const val = parseInt(star.dataset.value);
      stars.forEach((s, i) => {
        s.textContent = i < val ? '⭐' : '☆';
      });
      const labels = ['', '🤔 一般', '👍 还行', '😊 不错', '🎉 很好', '🌟 完美'];
      ratingText.textContent = labels[val] || `${val}分`;
      ratingText.dataset.rating = val;
    });
    
    star.addEventListener('mouseenter', () => {
      const val = parseInt(star.dataset.value);
      stars.forEach((s, i) => {
        s.textContent = i < val ? '⭐' : '☆';
      });
    });
    
    star.addEventListener('mouseleave', () => {
      const currentRating = parseInt(ratingText.dataset.rating || '0');
      stars.forEach((s, i) => {
        s.textContent = i < currentRating ? '⭐' : '☆';
      });
    });
  });
}

// ================================================================
// 导师管理面板
// ================================================================

// 打开导师面板
function openMasterPanel() {
  const pwd = prompt('🔐 请输入导师密码：');
  if (pwd !== CONFIG.MASTER_PASSWORD) {
    if (pwd !== null) showToast('❌ 密码错误');
    return;
  }
  
  state.isMasterMode = true;
  
  // 统计信息
  const totalWorks = state.works.length;
  const reviewedWorks = state.reviews.length;
  const pendingWorks = state.works.filter(w => !state.reviews.find(r => r.workId === w.id)).length;
  
  const html = `
    <div class="master-panel">
      <div class="master-panel-header">
        <h3>👨‍🏫 导师管理面板</h3>
        <button class="btn btn-sm btn-outline" onclick="closeMasterPanel()">退出</button>
      </div>
      
      <div class="master-stats">
        <div class="stat-card">
          <span class="stat-number">${totalWorks}</span>
          <span class="stat-label">全部作品</span>
        </div>
        <div class="stat-card">
          <span class="stat-number">${reviewedWorks}</span>
          <span class="stat-label">已点评</span>
        </div>
        <div class="stat-card">
          <span class="stat-number">${pendingWorks}</span>
          <span class="stat-label">待点评</span>
        </div>
      </div>
      
      <div class="master-settings">
        <h4>⚙️ 导师设置</h4>
        <div class="form-group">
          <label>导师名称</label>
          <input type="text" id="masterNameInput" class="form-input" value="${state.masterName}">
        </div>
        <div class="form-group">
          <label>导师简介</label>
          <textarea id="masterBioInput" class="form-textarea" rows="3">${state.masterBio}</textarea>
        </div>
        <button class="btn btn-primary" onclick="saveMasterSettings()">保存设置</button>
      </div>
      
      <div class="master-pending">
        <h4>📋 待点评作品 ${pendingWorks > 0 ? `<span class="pending-badge">${pendingWorks}</span>` : ''}</h4>
        ${pendingWorks === 0 ? '<p class="empty-state-sm">所有作品都已点评！🎉</p>' : ''}
        ${state.works.filter(w => !state.reviews.find(r => r.workId === w.id)).map(w => `
          <div class="pending-item" onclick="showWorkDetail(${w.id})">
            <span class="pending-title">${w.title}</span>
            <span class="pending-script">${w.script}</span>
            <span class="pending-date">${formatDate(w.createdAt)}</span>
            <span class="pending-action">✍️ 去点评</span>
          </div>
        `).join('')}
      </div>
      
      <div class="master-reviewed">
        <h4>✅ 已点评作品</h4>
        ${state.reviews.sort((a,b) => b.createdAt - a.createdAt).map(r => {
          const w = state.works.find(ww => ww.id === r.workId);
          if (!w) return '';
          return `
            <div class="reviewed-item" onclick="showWorkDetail(${w.id})">
              <span>${w.title}</span>
              <span class="review-stars">${'⭐'.repeat(r.rating)}</span>
              <span class="reviewed-date">${formatDate(r.createdAt)}</span>
            </div>
          `;
        }).join('')}
      </div>
    </div>
  `;
  
  // 显示为弹窗
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay master-panel-overlay';
  overlay.onclick = (e) => { if (e.target === overlay) overlay.remove(); };
  overlay.innerHTML = `
    <div class="modal modal-lg">
      <button class="modal-close" onclick="closeMasterPanel()">&times;</button>
      ${html}
    </div>
  `;
  document.body.appendChild(overlay);
}

function closeMasterPanel() {
  state.isMasterMode = false;
  const overlay = document.querySelector('.master-panel-overlay');
  if (overlay) overlay.remove();
}

async function saveMasterSettings() {
  const name = $('#masterNameInput')?.value?.trim();
  const bio = $('#masterBioInput')?.value?.trim();
  
  if (name) state.masterName = name;
  if (bio) state.masterBio = bio;
  
  await saveAndSync();
  showToast('✅ 导师设置已保存');
}

// ──── 导师入口按钮 ────
function addMasterEntry() {
  const btn = document.createElement('button');
  btn.className = 'btn btn-sm btn-master';
  btn.textContent = '👨‍🏫 导师管理';
  btn.onclick = openMasterPanel;
  btn.style.cssText = 'position:fixed;bottom:20px;right:20px;z-index:1000;';
  document.body.appendChild(btn);
}

// ================================================================
// 数据导出/导入（共享备用方案）
// ================================================================

function exportData() {
  const data = getStateData();
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `moyunxuan_backup_${formatDate(Date.now())}.json`;
  a.click();
  URL.revokeObjectURL(url);
  showToast('✅ 数据已导出');
}

function importData() {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.json';
  input.onchange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      if (data && data.works && Array.isArray(data.works)) {
        state.works = data.works || [];
        state.reviews = data.reviews || [];
        state.comments = data.comments || [];
        state.nextWorkId = data.nextWorkId || 1;
        state.nextReviewId = data.nextReviewId || 1;
        state.masterName = data.masterName || '书法导师';
        state.masterBio = data.masterBio || '';
        
        await saveAndSync();
        renderAll();
        showToast('✅ 数据导入成功！');
      } else {
        showToast('❌ 文件格式不正确');
      }
    } catch (err) {
      showToast('❌ 导入失败: ' + err.message);
    }
  };
  input.click();
}

// ──── 数据管理按钮 ────
function addDataTools() {
  const aboutSection = $('.about-container');
  if (!aboutSection) return;
  
  const toolsDiv = document.createElement('div');
  toolsDiv.className = 'data-tools';
  toolsDiv.style.cssText = 'margin-top:20px;padding:15px;background:#f8f6f0;border-radius:8px;';
  toolsDiv.innerHTML = `
    <h4 style="margin-bottom:10px;">💾 数据管理</h4>
    <p style="font-size:0.9em;color:#888;margin-bottom:10px;">
      数据存储在服务器（自动同步）和本地浏览器中。
      ${state.works.length > 0 ? `当前有 ${state.works.length} 幅作品，${state.reviews.length} 条点评。` : ''}
    </p>
    <div style="display:flex;gap:10px;flex-wrap:wrap;">
      <button class="btn btn-sm btn-outline" onclick="exportData()">📤 导出备份</button>
      <button class="btn btn-sm btn-outline" onclick="importData()">📥 导入数据</button>
      <button class="btn btn-sm btn-outline" onclick="syncNow()">🔄 手动同步</button>
    </div>
  `;
  aboutSection.appendChild(toolsDiv);
}

async function syncNow() {
  showStatus('同步中...');
  const cloud = await fetchFromCloud();
  if (cloud) {
    const merged = mergeData(cloud, getStateData());
    if (merged) {
      state.works = merged.works || [];
      state.reviews = merged.reviews || [];
      state.comments = merged.comments || [];
      state.nextWorkId = merged.nextWorkId || 1;
      state.nextReviewId = merged.nextReviewId || 1;
      state.masterName = merged.masterName || '书法导师';
      state.masterBio = merged.masterBio || '';
      saveLocal(merged);
      await saveToCloud(merged);
    }
    renderAll();
    showToast('✅ 同步完成！');
  } else {
    showToast('⚠️ 云端暂时不可用');
  }
  hideStatus();
}

// ================================================================
// 初始化
// ================================================================
document.addEventListener('DOMContentLoaded', async () => {
  // 导航链接
  $$('.nav-link').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      navigateTo(link.dataset.page);
    });
  });
  
  // 首页快捷入口
  document.querySelectorAll('[data-nav]').forEach(el => {
    el.addEventListener('click', (e) => {
      e.preventDefault();
      navigateTo(el.dataset.nav);
    });
  });
  
  // 首页卡片导航
  document.querySelectorAll('.card').forEach((card, idx) => {
    const pages = ['learn', 'gallery', 'about'];
    card.addEventListener('click', () => {
      navigateTo(pages[idx]);
    });
  });
  
  // 汉堡菜单
  const hamburger = $('#hamburger');
  const sidebar = $('#sidebar');
  if (hamburger && sidebar) {
    hamburger.addEventListener('click', () => {
      sidebar.classList.toggle('open');
    });
  }
  
  // 作品标签切换
  setupScriptTabs();
  
  // 作品表单
  setupWorkForm();
  
  // 图片上传
  setupImageUpload();
  
  // 作品上传按钮
  setupAddWorkBtn();
  
  // 弹窗关闭
  setupModals();
  
  // 留言提交
  setupCommentForm();
  
  // 留言星级
  setupCommentStars();
  
  // 导师人口按钮
  addMasterEntry();
  
  // 数据管理工具
  addDataTools();
  
  // 初始化数据
  await initData();
});
