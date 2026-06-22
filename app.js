// ========================================
// 墨韵轩 - JavaScript 应用逻辑
// ========================================

// ---------- 数据 ----------
// ========================================
// 书法学习数据 - 干货内容
// ========================================

// 楷书四大家对比
const KAISHU_MASTERS = [
  {
    name: '欧阳询（欧体）', period: '唐', style: '险峻严谨',
    desc: '字体修长，以方笔为主间用圆笔。点画讲究呼应，横竖起笔多用方笔，撇捺多用圆笔。结构上中宫紧凑，左收紧右舒展，法度森严，于平正中见险劲，被誉为"天下第一楷书"。',
    masterpiece: '《九成宫醴泉铭》',
    strokes: '横画斜上取势，中段不弧；竖画悬针多为主笔；点画以三角为主（源于魏碑）',
  },
  {
    name: '颜真卿（颜体）', period: '唐', style: '雄强宽博',
    desc: '笔画劲挺肥厚，间架平整茂密。横轻竖重，捺笔有"蚕头燕尾"之态。结构方正饱满，左右基本对称，竖画向内环抱呈弧形，上密下疏。展现出雍容大度、开阔雄伟的气概。',
    masterpiece: '《多宝塔碑》《颜勤礼碑》',
    strokes: '横画短横前细后粗，长横中段略细带弧形；竖画悬针中锋挺拔；钩画形如鹅头，钩尖如鸟啄',
  },
  {
    name: '柳公权（柳体）', period: '唐', style: '骨力劲健',
    desc: '以"骨"胜，笔画瘦硬挺拔，棱角分明。横画长横细瘦、短横粗壮。"颜筋柳骨"并称，结构严谨中见疏朗。',
    masterpiece: '《玄秘塔碑》《神策军碑》',
    strokes: '短横粗壮长横细瘦；悬针竖粗细均匀；横折中竖画微带弧状如弓；撇点出锋劲利',
  },
  {
    name: '赵孟頫（赵体）', period: '元', style: '圆润秀媚',
    desc: '用笔圆润流畅，以行入楷，笔画富有动感。结构匀称稳健，既有晋唐法度又具个人灵动之美。',
    masterpiece: '《胆巴碑》《妙严寺记》',
    strokes: '短横左重右轻，长横弧势明显；多用垂露收笔；撇轻快利落；捺轻灵畅达暗含起伏',
  },
];

// 楷书基本笔画口诀
const STROKE_MEMO = [
  { name: '长横', memo: '逆锋起笔→中锋行笔→提按调整→回锋收笔。口诀：顿→行→顿。两端略垂，中部拱起。' },
  { name: '短横', memo: '由轻到重滑翔入笔，顿笔收笔。形态短小，角度略斜可略带弧度，更显灵动。' },
  { name: '悬针竖', memo: '逆锋起笔→中锋下行→渐提笔出锋。行笔轻快流畅，出锋迅速。口诀：顿→行→出锋。' },
  { name: '垂露竖', memo: '逆起→中锋下行→顿笔回锋，末段如露珠圆润。中间左挺则挺拔精神。' },
  { name: '撇画', memo: '起笔如右点，转向左下方撇出。短撇爽劲有力，长撇细而有劲，如绵里裹针。' },
  { name: '捺画', memo: '由轻到重行笔，至捺脚处稍顿，再向右水平或右上提笔出锋。一波三折是精髓。' },
  { name: '点画', memo: '由轻到重入笔，向右下短促行笔顿收。三角点需肯定干净，不能写成圆点。' },
  { name: '竖钩', memo: '起笔顿笔凝重有力，中间左挺挺拔精神，钩前顿笔圆润，出锋迅速钩尖尖。' },
];

// 行书核心技法
const XINGSHU_TIPS = [
  { title: '笔法——露锋为主', content: '行书多用露锋入笔，落笔混成自然。点画之间常有牵丝映带，前笔收笔与后笔起笔形成呼应关系。' },
  { title: '结构——欹侧取势', content: '行书不似楷书平正，常取左低右高或欹侧之势。通过笔画疏密、开合、向背的变化，使字形富有动态美感。' },
  { title: '章法——纵有行横无列', content: '行书章法讲究字与字之间的呼应连贯，大小错落，疏密有致。字距较小，行距略宽，气韵贯通。' },
  { title: '节奏——轻重提按', content: '行书的节奏感极强，通过提按轻重变化，形成"重如崩云，轻如蝉翼"的丰富层次感。' },
];

// 草书学习路线
const CAOSHU_PATH = [
  { stage: '第一步 · 识草', content: '先学草法符号，记住草书约定俗成的写法。如"长短分知去，微茫视每安"。临帖前先识文词大意和分析书家情感。' },
  { stage: '第二步 · 小草筑基', content: '从王羲之《十七帖》、孙过庭《书谱》入手。作草如真，笔致遒媚。建议1:1临习，用硬毫或兼毫，半生熟宣纸。' },
  { stage: '第三步 · 线条锤炼', content: '怀素《小草千字文》线条规整富有弹性，练习中锋用笔，感受提按、轻重、缓急的变化。线条要圆润饱满、力透纸背。' },
  { stage: '第四步 · 章法气韵', content: '黄庭坚《诸上座帖》感受字与字之间的大小、疏密、欹正变化。隔行需换气，行气当摆动，切忌平直排列。' },
  { stage: '第五步 · 狂草升华', content: '怀素《自叙帖》、张旭《古诗四帖》。笔势狂放不羁，纯以神行。需深厚的楷行功底，融入个人性情方入化境。' },
];

// 隶书核心技法
const LISHU_TIPS = [
  { title: '蚕头燕尾', content: '横画起笔时逆锋向左下方切入，形如蚕头；收笔时顿笔后向右上方轻挑而出，宛如燕尾。这是隶书最典型的标志。口诀：逆锋起笔→中锋行笔→顿笔出锋。' },
  { title: '一波三折', content: '波横行笔有起伏变化：起笔后略提→中锋行笔渐重→至燕尾处再提笔出锋。犹如波浪的三次转折，节奏分明。' },
  { title: '燕不双飞', content: '隶书一个重要原则：一字之中只能有一个波磔（燕尾），其余横画须写为平横，否则显得杂乱。' },
  { title: '横向取势', content: '字形多扁方，横向笔画舒展，纵向笔画收敛，形成横宽竖短的视觉效果。重心下沉，上紧下松。' },
  { title: '方折与圆转', content: '转折处或方折（顿笔后调锋）或圆转（提笔暗过），需根据碑帖风格调整。《张迁碑》多方折，《曹全碑》多圆转。' },
];

// 篆书核心技法
const ZHUANSHU_TIPS = [
  { title: '中锋用笔', content: '篆书的生命在于中锋用笔。笔杆垂直于纸面，笔尖始终在笔画中心运行，线条饱满圆润如"屋漏痕"，力透纸背。' },
  { title: '均匀圆转', content: '笔画粗细一致，转折处圆转流畅无棱角。起笔藏锋逆入，收笔回锋护尾，两端含蓄浑圆。' },
  { title: '对称平衡', content: '篆书结构严格对称，左右均衡。书写前要先在脑中构建对称轴线，确保左右比例一致。' },
  { title: '先小后大', content: '从《峄山刻石》李斯小篆入手，掌握基本笔法和结体规律后再涉猎大篆（金文、甲骨文）。' },
];

const SCRIPTS_DATA = [
  {
    id: 'kaishu', script: '楷书', title: '楷书入门',
    desc: '楷书又称正书、真书，是汉字书写最规范的字体。',
    sections: [
      { heading: '📌 楷书四大家特点', content: KAISHU_MASTERS.map(m => `<div style="margin-bottom:12px;"><strong style="color:#c23a2b;">${m.name}</strong> <span style="font-size:12px;color:#888;">（${m.period} · ${m.style}）</span><p style="margin:4px 0;font-size:13px;line-height:1.7;">${m.desc}</p><p style="font-size:13px;color:#5a7a4a;">代表作：${m.masterpiece}</p><p style="font-size:13px;color:#6b6b6b;">笔画特征：${m.strokes}</p></div>`).join('<hr style="border:none;border-top:1px dashed rgba(0,0,0,0.06);">') },
      { heading: '✍️ 楷书运笔口诀', content: STROKE_MEMO.map(s => `<div style="margin-bottom:6px;font-size:13px;"><strong>${s.name}：</strong>${s.memo}</div>`).join('') },
      { heading: '📐 间架结构九法', content: `1. 顶戴得势，不可头轻尾重<br>2. 避密就疏，避险就易<br>3. 排叠均匀，长短疏密妥帖<br>4. 偏侧欹斜随字势安排<br>5. 偏旁依左右体势相互呼应<br>6. 穿插交错力求妥帖<br>7. 补空白使四边满足<br>8. 短让高、窄让宽，彼此相让<br>9. 主笔突出，撇捺伸展` },
    ]
  },
  {
    id: 'xingshu', script: '行书', title: '行书之美',
    desc: '行书介于楷书与草书之间，既具楷书的易读性，又有草书的流动感，是最实用的书体。',
    sections: [
      { heading: '📌 行书四大技法', content: XINGSHU_TIPS.map(t => `<div style="margin-bottom:8px;"><strong style="color:#c23a2b;">${t.title}</strong><p style="font-size:13px;line-height:1.7;margin:4px 0 0;">${t.content}</p></div>`).join('') },
      { heading: '🏆 天下三大行书', content: `<div style="margin-bottom:10px;"><strong>《兰亭序》</strong>王羲之 · 天下第一行书：用笔细腻丰富，藏露锋结合巧妙。文中20个"之"字无一雷同。章法纵有行横无列，气韵贯通。</div><div style="margin-bottom:10px;"><strong>《祭侄文稿》</strong>颜真卿 · 天下第二行书：情感真挚的悲愤之作。笔法苍劲，枯笔大量运用，是"书为心画"的极致体现。</div><div><strong>《寒食帖》</strong>苏轼 · 天下第三行书：沉郁顿挫，笔势奔放。字迹由小渐大，由轻渐重，映照诗人情感起伏。</div>` },
      { heading: '💡 临习要领', content: '1. 先读帖：仔细观察笔画的起承转合，体会笔势走向<br>2. 拆解单字：按笔画分类练习，逐字精临<br>3. 对临：看一字写一字，不要看一笔写一笔<br>4. 分段临：一小段反复对照修改，再逐渐增加字数<br>5. 推荐工具：中号兼毫或狼毫笔，半生熟宣纸' },
    ]
  },
  {
    id: 'caoshu', script: '草书', title: '草书意境',
    desc: '草书是书法艺术的最高表现形式，讲究"简"与"连"，笔画省简、气势贯通。章草、今草、狂草各有特色。',
    sections: [
      { heading: '📌 草书分类', content: '<strong>章草</strong>：隶书的草写，字字区别不相纠连。代表作皇象《急就章》。<br><strong>今草</strong>：不拘章法，笔势流畅。代表作王羲之《初月帖》。<br><strong>狂草</strong>：笔势狂放不羁，连绵不断。张旭、怀素为代表，完全脱离实用成为纯艺术。' },
      { heading: '🔥 学草要点', content: '1. 先识草法符号：记住草书约定俗成的写法<br>2. 先小草后大草：从《十七帖》《书谱》入手<br>3. 楷书功底是基础：作草如真，结构不乱<br>4. 字外功夫：草书载情性特强，书写者下意识流露审美与修养' },
      { heading: '🎯 史上经典', content: '孙过庭《书谱》："初学分布，但求平正；既知平正，务追险绝；既能险绝，复归平正。"——此乃学书三境界。' },
    ]
  },
  {
    id: 'lishu', script: '隶书', title: '隶书古韵',
    desc: '隶书由篆书演变而来，是汉字从古文字向今文字转变的桥梁。蚕头燕尾、一波三折是隶书的典型特征。',
    sections: [
      { heading: '📌 核心笔法', content: LISHU_TIPS.map(t => `<div style="margin-bottom:6px;"><strong style="color:#c23a2b;">${t.title}</strong><p style="font-size:13px;line-height:1.7;margin:4px 0 0;">${t.content}</p></div>`).join('') },
      { heading: '✍️ 隶书笔画分解', content: `<div style="margin-bottom:6px;"><strong>波磔横：</strong>逆锋起笔→中段略提→末端重按→向右上挑出燕尾</div><div style="margin-bottom:6px;"><strong>平横：</strong>逆锋向左下轻顿→转锋右行→回锋收笔</div><div style="margin-bottom:6px;"><strong>悬针竖：</strong>逆锋起笔→中锋直下→渐提笔出锋</div><div style="margin-bottom:6px;"><strong>垂露竖：</strong>行笔至末端稍驻→回锋收笔，形似露珠圆润</div><div style="margin-bottom:6px;"><strong>捺画：</strong>轻入转锋向右下→行笔渐重→末端顿笔→水平出锋</div>` },
      { heading: '🔄 临摹建议', content: '1. 先练单字结构，再通篇临写<br>2. 重点攻克波磔横画和撇捺<br>3. 注意笔画粗细变化和字内空间疏密关系<br>4. 观察细节：蚕头圆润饱满、燕尾轻盈飘逸<br>5. 避免过度夸张波磔破坏整体平衡' },
    ]
  },
  {
    id: 'zhuanshu', script: '篆书', title: '篆书溯源',
    desc: '篆书是中国最古老的成熟文字体系，包括大篆和小篆。线条均匀圆转，结构对称严谨，是书法艺术的源头。',
    sections: [
      { heading: '📌 篆书学习四要', content: ZHUANSHU_TIPS.map(t => `<div style="margin-bottom:6px;"><strong style="color:#c23a2b;">${t.title}</strong><p style="font-size:13px;line-height:1.7;margin:4px 0 0;">${t.content}</p></div>`).join('') },
      { heading: '💡 实用建议', content: '初学者从清人小篆入手（如邓石如、吴让之），先掌握中锋用笔和空间平衡感，再追溯秦篆李斯。软毫笔（羊毫）更易表现篆书线条的圆润饱满。' },
    ]
  },
];

// ---------- 状态 ----------
let state = {
  currentPage: 'home',
  currentScript: 'all',
  selectedRating: 0,
  works: [],
  comments: [],
  aboutBio: '',
};

// ---------- 加载数据 ----------
function loadData() {
  try {
    const saved = localStorage.getItem('moyunxuan_data');
    if (saved) {
      const parsed = JSON.parse(saved);
      state.works = parsed.works || [];
      state.comments = parsed.comments || [];
      state.aboutBio = parsed.aboutBio || '';
      if (state.aboutBio) {
        const bioEl = document.getElementById('aboutBio');
        if (bioEl) bioEl.textContent = state.aboutBio;
      }
    }
  } catch (e) {}
}

function saveData() {
  try {
    const bioEl = document.getElementById('aboutBio');
    if (bioEl) state.aboutBio = bioEl.textContent;
    localStorage.setItem('moyunxuan_data', JSON.stringify({
      works: state.works,
      comments: state.comments,
      aboutBio: state.aboutBio,
    }));
  } catch (e) {}
}

// ---------- 导航 ----------
function navigateTo(page) {
  state.currentPage = page;
  document.querySelectorAll('.nav-link').forEach(el => {
    el.classList.toggle('active', el.dataset.page === page);
  });
  document.querySelectorAll('.page').forEach(el => {
    el.classList.toggle('active', el.id === 'page-' + page);
  });
  document.getElementById('hamburger').classList.remove('open');
  document.getElementById('sidebar').classList.remove('open');

  if (page === 'gallery') renderGallery();
  if (page === 'learn') renderLearn();
  if (page === 'about') renderComments();

  window.scrollTo(0, 0);
}

// ---------- 学书法渲染 ----------
function renderLearn() {
  const grid = document.getElementById('learnGrid');
  grid.innerHTML = '';

  // 文房四宝指南（始终显示）
  const toolsCard = document.createElement('div');
  toolsCard.className = 'learn-card';
  toolsCard.style.gridColumn = '1 / -1';
  const TOOLS_HTML = getToolsGuideHTML();
  toolsCard.innerHTML = `
    <span class="label" style="background:rgba(74,144,226,0.1);color:#4a90e2;">🖌️ 文房四宝</span>
    <h4>工具选择指南 · 初学者必看</h4>
    ${TOOLS_HTML}
  `;
  grid.appendChild(toolsCard);

  // 执笔与坐姿指南
  const postureCard = document.createElement('div');
  postureCard.className = 'learn-card';
  postureCard.style.gridColumn = '1 / -1';
  postureCard.innerHTML = `
    <span class="label" style="background:rgba(92,184,92,0.1);color:var(--bamboo);">🧘 执笔与坐姿</span>
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:16px;margin-top:12px;">
      <div>
        <h4 style="margin:0 0 8px;">坐姿五要</h4>
        <ol style="font-size:13px;line-height:2;padding-left:18px;margin:0;">
          <li><strong>头正</strong>：头部端正，不可歪斜</li>
          <li><strong>身直</strong>：上身挺直，稍向前倾</li>
          <li><strong>臂开</strong>：两臂自然撑开，不夹腋</li>
          <li><strong>足安</strong>：双脚平踏地面，与肩同宽</li>
          <li><strong>胸舒</strong>：胸口离桌沿一拳距离</li>
        </ol>
      </div>
      <div>
        <h4 style="margin:0 0 8px;">五指执笔法</h4>
        <ul style="font-size:13px;line-height:2;padding-left:18px;margin:0;">
          <li><strong>擫</strong>（yè）：拇指抵住笔管内侧</li>
          <li><strong>押</strong>：食指压住笔管外侧</li>
          <li><strong>钩</strong>：中指钩住笔管</li>
          <li><strong>格</strong>：无名指指甲根部抵住笔管</li>
          <li><strong>抵</strong>：小指紧贴无名指辅助</li>
        </ul>
        <p style="font-size:12px;color:#888;margin-top:6px;">口诀：指实掌虚，腕平掌竖。握笔松紧要适度，太紧则僵，太松则懈。</p>
      </div>
    </div>
    <p style="font-size:13px;color:#6b6b6b;margin-top:8px;padding:8px;background:rgba(244,230,200,0.3);border-radius:6px;">💡 <strong>小贴士</strong>：写大字（楷隶）宜悬腕，写小字（行草）可枕腕。站立书大字时，身体微前倾以全身之力运笔。</p>
  `;
  grid.appendChild(postureCard);

  // 各书体学习卡
  SCRIPTS_DATA.forEach(item => {
    if (state.currentScript !== 'all' && item.script !== state.currentScript) return;
    const card = document.createElement('div');
    card.className = 'learn-card';

    let sectionsHtml = '';
    if (item.sections) {
      sectionsHtml = item.sections.map(s => `
        <div style="margin-bottom:14px;">
          <h5 style="margin:0 0 6px;font-size:13px;color:var(--ink-gray);border-left:3px solid var(--bamboo);padding-left:8px;">${s.heading}</h5>
          <div style="font-size:13px;line-height:1.8;">${s.content}</div>
        </div>
      `).join('');
    }

    card.innerHTML = `
      <span class="label">${item.script}</span>
      <h4>${item.title}</h4>
      <p style="color:#6b6b6b;">${item.desc}</p>
      ${sectionsHtml}
    `;
    grid.appendChild(card);
  });

  // 各书体专属技法卡片
  addScriptTechniqueCards(grid);
}

// ---------- 文房四宝指南 ----------
function getToolsGuideHTML() {
  return `
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:14px;margin-top:12px;">
      <div style="padding:12px;background:white;border-radius:8px;border:1px solid rgba(0,0,0,0.04);">
        <strong>🖊️ 毛笔</strong>
        <ul style="font-size:12px;line-height:1.8;padding-left:16px;margin:6px 0 0;">
          <li><strong>初学者最推荐</strong>：中号兼毫笔（羊毫+狼毫），出锋3.5-4cm，软硬适中易控笔</li>
          <li><strong>羊毫</strong>：软，蓄墨好，适合写楷隶大字的行笔变化</li>
          <li><strong>狼毫</strong>：硬，弹性好，适合行草书的转折连带</li>
          <li><strong>选笔四德</strong>：尖、齐、圆、健。笔尖要尖锐，铺开后平齐，笔肚圆饱满，按压后回弹好</li>
          <li style="color:#c23a2b;">⚠ 新手别买几块的尼龙笔，15-40元兼毫笔足矣</li>
        </ul>
      </div>
      <div style="padding:12px;background:white;border-radius:8px;border:1px solid rgba(0,0,0,0.04);">
        <strong>🖤 墨</strong>
        <ul style="font-size:12px;line-height:1.8;padding-left:16px;margin:6px 0 0;">
          <li><strong>练习墨</strong>：一得阁、红星墨汁，10-20元/500ml性价比高</li>
          <li>创作推荐日本玄宗墨，层次分明</li>
          <li>墨汁兑水比例不超过1:3，水多易洇纸</li>
          <li>好墨应无沉淀、书写流畅、墨色均匀、气味清香</li>
          <li>有异味的墨汁已变质，切勿使用损伤毛笔</li>
        </ul>
      </div>
      <div style="padding:12px;background:white;border-radius:8px;border:1px solid rgba(0,0,0,0.04);">
        <strong>📄 纸</strong>
        <ul style="font-size:12px;line-height:1.8;padding-left:16px;margin:6px 0 0;">
          <li><strong>新手练习</strong>：毛边纸（毛面向上摩擦力大易控笔）或元书纸</li>
          <li><strong>日常创作</strong>：半生熟宣纸，吸墨适中不洇不滞</li>
          <li><strong>行草书</strong>：生宣效果好，墨色变化丰富</li>
          <li><strong>小楷</strong>：熟宣或蝉翼宣</li>
          <li>印有米字格的毛边纸对初学者最适合</li>
        </ul>
      </div>
      <div style="padding:12px;background:white;border-radius:8px;border:1px solid rgba(0,0,0,0.04);">
        <strong>🪨 砚 &amp; 其他</strong>
        <ul style="font-size:12px;line-height:1.8;padding-left:16px;margin:6px 0 0;">
          <li>初学者用普通陶瓷墨碟即可，带隔层易清洗</li>
          <li><strong>必备配件</strong>：笔洗（洗笔用）、笔搁（搁笔用）、毛毡（垫纸吸墨防洇）</li>
          <li>每次写完务必洗净毛笔，悬挂晾干</li>
          <li>毛笔切忌长时间泡水，笔根积墨伤害永久</li>
        </ul>
      </div>
    </div>
    <p style="font-size:12px;color:#888;margin-top:10px;text-align:center;">🎒 新手一套预算约 40-80 元（兼毫笔20元+练习墨12元+毛边纸10元+毛毡8元+墨碟5元+笔搁5元）</p>
  `;
}

// ---------- 各书体技法卡片 ----------
function addScriptTechniqueCards(grid) {
  // 行书技法
  if (state.currentScript === 'all' || state.currentScript === '行书') {
    const xingCard = document.createElement('div');
    xingCard.className = 'learn-card';
    xingCard.innerHTML = `
      <span class="label" style="background:rgba(92,184,92,0.08);color:var(--bamboo);">📝 行书技法</span>
      <p style="margin-top:8px;"><strong>王羲之《兰亭序》20个"之"字</strong>无一雷同，堪称绝妙。布白雄健浓纤、纵意驰骋。</p>
      <p style="font-size:13px;"><strong>行书三忌</strong>：一忌连绵不绝无节奏，二忌大小雷同无变化，三忌行气平直无摆动。</p>
      <p style="font-size:13px;"><strong>推荐临帖顺序</strong>：王羲之《兰亭序》→ 颜真卿《祭侄文稿》→ 苏轼《寒食帖》→ 米芾《苕溪诗帖》</p>
    `;
    grid.appendChild(xingCard);
  }

  // 草书技法
  if (state.currentScript === 'all' || state.currentScript === '草书') {
    const caoCard = document.createElement('div');
    caoCard.className = 'learn-card';
    caoCard.innerHTML = `
      <span class="label" style="background:rgba(194,58,43,0.08);color:#c23a2b;">🔥 草书技法</span>
      <h4>草书学习五阶路线</h4>
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:10px;margin-top:10px;">
        ${CAOSHU_PATH.map(p => `
          <div style="padding:10px;background:rgba(244,230,200,0.25);border-radius:8px;border-left:3px solid var(--gold);">
            <strong style="font-size:12px;color:var(--ink-gray);">${p.stage}</strong>
            <p style="font-size:12px;line-height:1.6;margin:4px 0 0;">${p.content}</p>
          </div>
        `).join('')}
      </div>
      <p style="font-size:12px;color:#888;margin-top:8px;">💡 核心：草书不连而草，凝重而又飞动。先小（草）后大（草），由平正入险绝。</p>
    `;
    grid.appendChild(caoCard);
  }

  // 隶书技法
  if (state.currentScript === 'all' || state.currentScript === '隶书') {
    const liCard = document.createElement('div');
    liCard.className = 'learn-card';
    liCard.innerHTML = `
      <span class="label" style="background:rgba(74,144,226,0.08);color:#4a90e2;">🏛️ 隶书技法</span>
      <h4>隶书练习核心要点</h4>
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:10px;margin-top:10px;">
        ${LISHU_TIPS.map(t => `
          <div style="padding:10px;background:rgba(74,144,226,0.04);border-radius:8px;">
            <strong style="font-size:12px;color:var(--ink-gray);">${t.title}</strong>
            <p style="font-size:12px;line-height:1.6;margin:4px 0 0;color:#555;">${t.content}</p>
          </div>
        `).join('')}
      </div>
      <p style="font-size:12px;color:#888;margin-top:8px;">📖 <strong>推荐入门碑帖</strong>：《曹全碑》（秀美飘逸）→《礼器碑》（瘦劲精到）→《张迁碑》（方劲古朴）。先临《曹全碑》掌握蚕头燕尾基础笔法。</p>
    `;
    grid.appendChild(liCard);
  }

  // 篆书技法
  if (state.currentScript === 'all' || state.currentScript === '篆书') {
    const zhuanCard = document.createElement('div');
    zhuanCard.className = 'learn-card';
    zhuanCard.innerHTML = `
      <span class="label" style="background:rgba(255,159,67,0.08);color:#ff9f43;">🔤 篆书技法</span>
      <h4>小篆核心笔法</h4>
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:10px;margin-top:10px;">
        ${ZHUANSHU_TIPS.map(t => `
          <div style="padding:10px;background:rgba(255,159,67,0.04);border-radius:8px;">
            <strong style="font-size:12px;color:var(--ink-gray);">${t.title}</strong>
            <p style="font-size:12px;line-height:1.6;margin:4px 0 0;color:#555;">${t.content}</p>
          </div>
        `).join('')}
      </div>
      <p style="font-size:12px;color:#888;margin-top:8px;">📖 <strong>推荐入门</strong>：李斯《峄山刻石》→ 李阳冰《三坟记》→ 吴让之《宋武帝与臧焘敕》</p>
    `;
    grid.appendChild(zhuanCard);
  }
}

// ---------- 作品集渲染 ----------
function renderGallery() {
  const grid = document.getElementById('galleryGrid');
  const empty = document.getElementById('emptyGallery');

  if (state.works.length === 0) {
    grid.innerHTML = '';
    grid.appendChild(empty);
    empty.style.display = 'block';
    return;
  }

  empty.style.display = 'none';
  grid.innerHTML = '';

  state.works.forEach((work, index) => {
    const avgRating = work.comments && work.comments.length > 0
      ? (work.comments.reduce((s, c) => s + c.rating, 0) / work.comments.length)
      : 0;

    const card = document.createElement('div');
    card.className = 'work-card';
    card.innerHTML = `
      <img class="work-image" src="${work.image}" alt="${work.title}" loading="lazy">
      <div class="work-info">
        <h4>${work.title}</h4>
        <div class="work-meta">
          <span class="work-script">${work.script}</span>
          <span class="work-date">${work.date || ''}</span>
        </div>
        ${work.note ? `<p class="work-note">${work.note}</p>` : ''}
        <div class="work-rating">
          ${renderStars(avgRating)}
          <span class="count">${work.comments ? work.comments.length : 0} 条点评</span>
        </div>
        <div class="work-actions">
          <button class="btn btn-small btn-primary" onclick="openDetail(${index})">查看</button>
          <button class="btn btn-small btn-danger" onclick="deleteWork(${index})">删除</button>
        </div>
      </div>
    `;
    grid.appendChild(card);
  });
}

function renderStars(rating) {
  const full = Math.round(rating);
  let html = '';
  for (let i = 1; i <= 5; i++) {
    html += `<span class="star ${i <= full ? '' : 'empty'}">★</span>`;
  }
  return html;
}

// ---------- 作品操作 ----------
let editingIndex = -1;

function openAddWork() {
  editingIndex = -1;
  document.getElementById('modalTitle').textContent = '上传新作品';
  document.getElementById('workForm').reset();
  document.getElementById('editId').value = '';
  document.getElementById('imagePreview').classList.add('hidden');
  document.getElementById('uploadPlaceholder').style.display = 'block';
  document.getElementById('workDate').value = new Date().toISOString().slice(0, 10);
  document.getElementById('workModal').classList.add('open');
}

function openEditWork(index) {
  const work = state.works[index];
  editingIndex = index;
  document.getElementById('modalTitle').textContent = '编辑作品';
  document.getElementById('workTitle').value = work.title;
  document.getElementById('workScript').value = work.script;
  document.getElementById('workDate').value = work.date || '';
  document.getElementById('workNote').value = work.note || '';
  document.getElementById('editId').value = index;

  const preview = document.getElementById('imagePreview');
  preview.src = work.image;
  preview.classList.remove('hidden');
  document.getElementById('uploadPlaceholder').style.display = 'none';
  document.getElementById('workModal').classList.add('open');
}

function deleteWork(index) {
  if (!confirm('确定删除这幅作品吗？')) return;
  state.works.splice(index, 1);
  saveData();
  renderGallery();
}

function openDetail(index) {
  const work = state.works[index];
  const container = document.getElementById('detailContent');
  const avgRating = work.comments && work.comments.length > 0
    ? (work.comments.reduce((s, c) => s + c.rating, 0) / work.comments.length)
    : 0;

  container.innerHTML = `
    <img class="detail-image" src="${work.image}" alt="${work.title}">
    <div class="detail-info">
      <h3>${work.title}</h3>
      <div class="detail-meta">
        <span class="detail-script">${work.script}</span>
        <span class="detail-date">${work.date || '日期未填'}</span>
      </div>
      <div class="work-rating" style="margin-bottom:12px;">
        ${renderStars(avgRating)}
        <span class="count">(${work.comments ? work.comments.length : 0} 条点评)</span>
      </div>
      ${work.note ? `<div class="detail-note">${work.note}</div>` : ''}

      <div style="border-top:1px solid rgba(0,0,0,0.06);padding-top:16px;">
        <h4 style="margin-bottom:12px;">💬 点评</h4>
        <div style="margin-bottom:16px;">
          <input type="text" id="detailCommentName" placeholder="您的称呼" class="form-input" style="margin-bottom:8px;">
          <textarea id="detailCommentContent" placeholder="写下点评..." class="form-textarea" rows="2" style="margin-bottom:8px;"></textarea>
          <div class="comment-stars">
            <span>评分：</span>
            <div class="star-rating" id="detailStarRating">
              ${[1,2,3,4,5].map(v => `<span class="star" data-value="${v}">☆</span>`).join('')}
            </div>
            <span class="rating-text" id="detailRatingText">请评分</span>
          </div>
          <button class="btn btn-primary btn-small" onclick="addDetailComment(${index})">发表点评</button>
        </div>
        <div id="detailCommentList">
          ${work.comments && work.comments.length > 0
            ? work.comments.map(c => `
              <div class="comment-item">
                <div class="comment-header">
                  <span class="comment-name">${c.name}</span>
                  <span class="comment-time">${c.time}</span>
                </div>
                <div class="comment-stars-display">
                  ${[1,2,3,4,5].map(v => `<span class="star ${v <= c.rating ? '' : 'empty'}">★</span>`).join('')}
                </div>
                <div class="comment-body">${c.content}</div>
              </div>
            `).join('')
            : '<div class="empty-state-sm">暂无点评</div>'
          }
        </div>
      </div>
    </div>
  `;

  document.getElementById('detailModal').classList.add('open');

  // 绑定详情页评价
  setTimeout(() => {
    const stars = document.querySelectorAll('#detailStarRating .star');
    const text = document.getElementById('detailRatingText');
    let selected = 0;
    stars.forEach(s => {
      s.addEventListener('click', () => {
        selected = parseInt(s.dataset.value);
        stars.forEach(st => st.classList.toggle('active', parseInt(st.dataset.value) <= selected));
        text.textContent = ['', '1分 - 还需努力', '2分 - 有进步', '3分 - 不错', '4分 - 很好', '5分 - 杰作'][selected];
      });
      s.addEventListener('mouseenter', () => {
        const val = parseInt(s.dataset.value);
        stars.forEach(st => st.classList.toggle('active', parseInt(st.dataset.value) <= val));
      });
      s.addEventListener('mouseleave', () => {
        stars.forEach(st => st.classList.toggle('active', parseInt(st.dataset.value) <= selected));
      });
    });
    window._detailRating = () => selected;
    window._detailIndex = index;
  }, 50);
}

function addDetailComment(index) {
  const name = document.getElementById('detailCommentName').value.trim() || '匿名书友';
  const content = document.getElementById('detailCommentContent').value.trim();
  const rating = typeof window._detailRating === 'function' ? window._detailRating() : 0;

  if (!content) { alert('请输入点评内容'); return; }
  if (!rating) { alert('请给作品评分'); return; }

  if (!state.works[index].comments) state.works[index].comments = [];
  state.works[index].comments.push({
    name, content, rating,
    time: new Date().toLocaleDateString('zh-CN')
  });
  saveData();
  openDetail(index);
}

// ---------- 留言区 ----------
function renderComments() {
  const list = document.getElementById('commentList');

  if (state.comments.length === 0) {
    list.innerHTML = '<div class="empty-state-sm">暂无留言，快来写第一条吧～</div>';
    return;
  }

  list.innerHTML = state.comments.map(c => `
    <div class="comment-item">
      <div class="comment-header">
        <span class="comment-name">${c.name}</span>
        <span class="comment-time">${c.time}</span>
      </div>
      <div class="comment-stars-display">
        ${[1,2,3,4,5].map(v => `<span class="star ${v <= c.rating ? '' : 'empty'}">★</span>`).join('')}
      </div>
      <div class="comment-body">${c.content}</div>
    </div>
  `).join('');
}

// ---------- 文件上传 ----------
function handleImageUpload(file) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const preview = document.getElementById('imagePreview');
      preview.src = e.target.result;
      preview.classList.remove('hidden');
      document.getElementById('uploadPlaceholder').style.display = 'none';
      resolve(e.target.result);
    };
    reader.readAsDataURL(file);
  });
}

// ---------- 初始化 ----------
function init() {
  loadData();

  // 导航点击
  document.querySelectorAll('.nav-link, [data-nav]').forEach(el => {
    el.addEventListener('click', (e) => {
      e.preventDefault();
      const page = el.dataset.page || el.dataset.nav;
      if (page) navigateTo(page);
    });
  });

  // 汉堡菜单
  const hamburger = document.getElementById('hamburger');
  hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('open');
    document.getElementById('sidebar').classList.toggle('open');
  });

  // 书体标签切换
  document.querySelectorAll('#scriptTabs .tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('#scriptTabs .tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      state.currentScript = tab.dataset.script;
      renderLearn();
    });
  });

  // 上传作品按钮
  document.getElementById('addWorkBtn').addEventListener('click', openAddWork);

  // 上传区域
  const uploadArea = document.getElementById('uploadArea');
  const imageInput = document.getElementById('imageInput');
  uploadArea.addEventListener('click', () => imageInput.click());
  imageInput.addEventListener('change', async (e) => {
    if (e.target.files && e.target.files[0]) {
      await handleImageUpload(e.target.files[0]);
    }
  });
  // 拖拽上传
  uploadArea.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadArea.style.borderColor = 'var(--vermillion)';
    uploadArea.style.background = 'rgba(194,58,43,0.03)';
  });
  uploadArea.addEventListener('dragleave', () => {
    uploadArea.style.borderColor = 'rgba(0,0,0,0.15)';
    uploadArea.style.background = '';
  });
  uploadArea.addEventListener('drop', async (e) => {
    e.preventDefault();
    uploadArea.style.borderColor = 'rgba(0,0,0,0.15)';
    uploadArea.style.background = '';
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      await handleImageUpload(e.dataTransfer.files[0]);
    }
  });

  // 作品表单提交
  document.getElementById('workForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const preview = document.getElementById('imagePreview');
    const image = preview.classList.contains('hidden') ? '' : preview.src;
    const title = document.getElementById('workTitle').value.trim();
    const script = document.getElementById('workScript').value;
    const date = document.getElementById('workDate').value;
    const note = document.getElementById('workNote').value.trim();
    const editId = document.getElementById('editId').value;

    if (!image && editId === '') { alert('请上传作品照片'); return; }
    if (!title) { alert('请填写作品名称'); return; }

    const workData = { image, title, script, date, note, comments: [] };

    if (editId !== '') {
      const idx = parseInt(editId);
      workData.comments = state.works[idx].comments || [];
      if (!image) workData.image = state.works[idx].image;
      state.works[idx] = workData;
    } else {
      state.works.push(workData);
    }

    saveData();
    document.getElementById('workModal').classList.remove('open');
    renderGallery();
    if (state.currentPage === 'gallery') navigateTo('gallery');
  });

  // 弹窗关闭
  document.getElementById('modalClose').addEventListener('click', () => {
    document.getElementById('workModal').classList.remove('open');
  });
  document.getElementById('detailClose').addEventListener('click', () => {
    document.getElementById('detailModal').classList.remove('open');
  });
  document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) overlay.classList.remove('open');
    });
  });

  // 首页星级评价
  const ratingStars = document.querySelectorAll('#starRating .star');
  ratingStars.forEach(s => {
    s.addEventListener('click', () => {
      state.selectedRating = parseInt(s.dataset.value);
      ratingStars.forEach(st => st.classList.toggle('active', parseInt(st.dataset.value) <= state.selectedRating));
      document.getElementById('ratingText').textContent =
        ['', '1分', '2分', '3分', '4分', '5分'][state.selectedRating];
    });
    s.addEventListener('mouseenter', () => {
      const val = parseInt(s.dataset.value);
      ratingStars.forEach(st => st.classList.toggle('active', parseInt(st.dataset.value) <= val));
    });
    s.addEventListener('mouseleave', () => {
      ratingStars.forEach(st => st.classList.toggle('active', parseInt(st.dataset.value) <= state.selectedRating));
    });
  });

  // 提交留言
  document.getElementById('submitComment').addEventListener('click', () => {
    const name = document.getElementById('commentName').value.trim() || '匿名书友';
    const content = document.getElementById('commentContent').value.trim();
    const rating = state.selectedRating;

    if (!content) { alert('请输入留言内容'); return; }

    state.comments.push({
      name, content, rating,
      time: new Date().toLocaleDateString('zh-CN')
    });
    state.selectedRating = 0;
    document.getElementById('commentName').value = '';
    document.getElementById('commentContent').value = '';
    document.querySelectorAll('#starRating .star').forEach(st => st.classList.remove('active'));
    document.getElementById('ratingText').textContent = '请评分';
    saveData();
    renderComments();
  });

  // 保存个人简介
  document.getElementById('aboutBio').addEventListener('blur', saveData);

  // 初始渲染
  renderLearn();
  renderGallery();
  renderComments();
}

// ---------- 启动 ----------
document.addEventListener('DOMContentLoaded', init);
