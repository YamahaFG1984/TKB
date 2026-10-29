/* ================================================================
   Kubernetes 教程 · 共享脚本：侧边栏、目录、代码高亮、主题
   ================================================================ */
// 保持经典 <script> 而不是 type="module"：模块脚本在 file:// 下会被浏览器拦截，
// 而这些页面经常是直接双击打开的。
(() => {
  'use strict';

  const CHAPTERS = [
    { n: 1,  t: 'Kubernetes 入门',        d: '编排、容器、云原生、微服务这些词到底什么意思', part: '第一部分 · 打好基础' },
    { n: 2,  t: 'Kubernetes 工作原理',    d: '控制平面、工作节点、声明式模型与期望状态' },
    { n: 3,  t: '搭建 Kubernetes 环境',   d: 'Docker Desktop、云上集群与 kubectl' },
    { n: 4,  t: 'Pod',                    d: '最小调度单位、多容器 Pod、init 与 sidecar', part: '第二部分 · 核心对象' },
    { n: 5,  t: 'Namespace',              d: '用命名空间把一个集群切成多个虚拟集群' },
    { n: 6,  t: 'Deployment',             d: '扩缩容、滚动更新与回滚' },
    { n: 7,  t: 'Service',                d: '为一组会变的 Pod 提供不变的网络入口' },
    { n: 8,  t: 'Gateway API',            d: '把外部流量路由进集群的新标准', part: '第三部分 · 网络' },
    { n: 9,  t: '服务发现深入',           d: 'DNS、服务注册表与跨命名空间访问' },
    { n: 10, t: '存储',                   d: 'CSI、PV、PVC 与 StorageClass', part: '第四部分 · 存储与配置' },
    { n: 11, t: 'ConfigMap 与 Secret',    d: '把配置和密码从镜像里拿出来' },
    { n: 12, t: 'StatefulSet',            d: '给有状态应用稳定的名字和存储' },
    { n: 13, t: 'API 安全与 RBAC',        d: '认证、授权与准入控制', part: '第五部分 · API 与安全' },
    { n: 14, t: 'Kubernetes API',         d: 'API 服务器、资源、分组与 CRD' },
    { n: 15, t: '威胁建模',               d: '用 STRIDE 模型审视集群的薄弱点' },
    { n: 16, t: '真实世界的安全实践',     d: '供应链、工作负载隔离、身份与审计' },
    { n: 17, t: '术语表与下一步',         d: '常用术语速查和继续学习的路线', part: '附录' }
  ];

  const pad = (n) => String(n).padStart(2, '0');
  const href = (n) => `ch${pad(n)}.html`;

  const cur = Number.parseInt(document.body.dataset.chapter || '0', 10);

  /* ---------- 侧边栏 ---------- */
  const side = document.getElementById('sidebar');
  if (side) {
    const brand = '<a class="brand" href="index.html"><span class="flame">&#9096;</span>' +
      '<span>Kubernetes 入门实战<small>The Kubernetes Book 2026 学习版</small></span></a>';
    const links = CHAPTERS.map(({ n, t, part }) =>
      (part ? `<div class="part">${part}</div>` : '') +
      `<a class="ch${n === cur ? ' active' : ''}" href="${href(n)}"><span class="n">${n}</span><span>${t}</span></a>`
    );
    side.innerHTML = brand + links.join('');
    const active = side.querySelector('a.ch.active');
    if (active) setTimeout(() => active.scrollIntoView({ block: 'center' }), 0);
  }

  /* ---------- 移动端菜单 ---------- */
  const btn = Object.assign(document.createElement('button'), {
    id: 'menu-btn',
    type: 'button',
    innerHTML: '&#9776;',
    onclick: () => document.body.classList.toggle('nav-open')
  });
  btn.setAttribute('aria-label', '目录');
  document.body.appendChild(btn);
  document.addEventListener('click', (e) => {
    if (document.body.classList.contains('nav-open') &&
        side && !side.contains(e.target) && e.target !== btn) {
      document.body.classList.remove('nav-open');
    }
  });

  /* ---------- 主题切换 ---------- */
  const THEME_KEY = 'tkb-doc-theme';
  const tbtn = Object.assign(document.createElement('button'), {
    id: 'theme-btn',
    type: 'button',
    innerHTML: '&#9789;',
    onclick: () => {
      const root = document.documentElement;
      const now = root.getAttribute('data-theme');
      const dark = now ? now === 'dark'
        : window.matchMedia('(prefers-color-scheme: dark)').matches;
      const next = dark ? 'light' : 'dark';
      root.setAttribute('data-theme', next);
      try { localStorage.setItem(THEME_KEY, next); } catch {}
    }
  });
  tbtn.setAttribute('aria-label', '切换深浅色');
  document.body.appendChild(tbtn);
  try {
    const saved = localStorage.getItem(THEME_KEY);
    if (saved) document.documentElement.setAttribute('data-theme', saved);
  } catch {}

  /* ---------- 箭头 marker（全局一次） ---------- */
  const defs = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  defs.setAttribute('width', '0');
  defs.setAttribute('height', '0');
  defs.setAttribute('style', 'position:absolute');
  // 注意：SVG marker 的内容不会从引用它的元素继承 color，
  // 所以这里直接用 CSS 变量填色，而不是 currentColor。
  const marker = (id, fill) =>
    `<marker id="${id}" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">` +
    `<path d="M0,0 L10,5 L0,10 z" fill="${fill}"/></marker>`;
  defs.innerHTML = `<defs>${marker('ar', 'var(--fg-faint)')}${marker('ar-a', 'var(--accent)')}` +
    `${marker('ar-b', 'var(--blue)')}${marker('ar-g', 'var(--green)')}${marker('ar-r', 'var(--red)')}</defs>`;
  document.body.appendChild(defs);

  /* ---------- 章节内目录 ---------- */
  const main = document.querySelector('main');
  const slot = document.getElementById('chapter-toc');
  if (slot && main) {
    const hs = [...main.querySelectorAll('h2')];
    if (hs.length > 2) {
      const items = hs.map((h, i) => {
        if (!h.id) h.id = `sec-${i + 1}`;
        return `<li><a href="#${h.id}">${h.textContent}</a></li>`;
      });
      slot.className = 'toc';
      slot.innerHTML = `<div class="h">本章目录</div><ol>${items.join('')}</ol>`;
    }
  }

  /* ---------- 代码块：语言标签 + 复制 + 高亮 ---------- */
  const KW = ('const|let|var|function|return|if|else|await|async|import|from|export|default|new|class|' +
    'for|while|of|in|try|catch|throw|package|func|type|struct|go|defer|range|' +
    'null|undefined|nil|true|false|this').split('|');

  // 每一段用正则字面量写，取 .source 拼起来，省掉字符串里的双重转义
  const RE_JS = new RegExp([
    /(\/\*[\s\S]*?\*\/|\/\/[^\n]*)/.source,                                           // 1 注释
    /(`(?:\\[\s\S]|[^\\`])*`|'(?:\\[\s\S]|[^\\'])*'|"(?:\\[\s\S]|[^\\"])*")/.source,    // 2 字符串
    String.raw`\b(${KW.join('|')})\b`,                                                // 3 关键字
    /\b([A-Z][A-Za-z0-9_]*)\b/.source,                                                // 4 类型/构造器
    /\b(\d+(?:\.\d+)?)\b/.source,                                                     // 5 数字
    /\b([a-zA-Z_$][\w$]*)(?=\()/.source                                               // 6 函数调用
  ].join('|'), 'g');

  // YAML：注释只认行首或空白之后的 #，避免把 URL 里的 # 当注释
  const RE_YAML = new RegExp([
    /((?<=^|\s)#[^\n]*)/.source,                                                      // 1 注释
    /('(?:[^'])*'|"(?:\\[\s\S]|[^\\"])*")/.source,                                    // 2 字符串
    /((?<=^[ \t]*(?:-[ \t]+)?)[\w./-]+(?=:(?:[ \t]|$)))/.source,                      // 3 键
    /\b(true|false|null|\d+(?:\.\d+)?)\b/.source                                      // 4 布尔/数字
  ].join('|'), 'gm');

  const RE_SH = /((?<=^|\s)#[^\n]*)|('(?:\\[\s\S]|[^\\'])*'|"(?:\\[\s\S]|[^\\"])*")|\b(kubectl|docker|git|cd|curl|helm|linode-cli|gcloud|export|cat|echo|ls|watch|sudo|brew|apt|openssl|base64|nslookup|dig|wget|exit|mv|mkdir|rm|grep|sleep|for|do|done|while)\b/g;

  const SH_CLASSES = ['tk-cm', 'tk-st', 'tk-kw'];
  const JS_CLASSES = ['tk-cm', 'tk-st', 'tk-kw', 'tk-tp', 'tk-nm', 'tk-fn'];
  const YAML_CLASSES = ['tk-cm', 'tk-st', 'tk-ky', 'tk-nm'];
  // 这些语言没有专门的规则，借用 shell 的注释 / 字符串规则就够了
  const SH_LIKE = new Set(['bash', 'sh', 'shell', 'text', 'toml', 'http', 'dockerfile', 'pug', 'json']);
  const YAML_LIKE = new Set(['yaml', 'yml']);

  const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

  function paint(src, re, classes) {
    let out = '';
    let last = 0;
    // 所有分支都至少匹配一个字符，matchAll 不会卡在零宽匹配上
    for (const m of src.matchAll(re)) {
      out += esc(src.slice(last, m.index));
      const g = m.findIndex((v, i) => i > 0 && v !== undefined);
      out += `<span class="${classes[g - 1]}">${esc(m[g])}</span>`;
      last = m.index + m[0].length;
    }
    return out + esc(src.slice(last));
  }

  // 终端会话：以 "$ " 开头的是命令（反斜杠续行也算），其余是输出。
  // 命令高亮，输出调暗；复制时只复制命令本身。
  function paintSession(code) {
    const html = [];
    const cmds = [];
    let cont = false;
    for (const line of code.split('\n')) {
      if (line.startsWith('$ ') || cont) {
        const cmd = cont ? line : line.slice(2);
        html.push((cont ? '' : '<span class="tk-pr">$ </span>') + paint(cmd, RE_SH, SH_CLASSES));
        cmds.push(cmd);
        cont = /\\\s*$/.test(line);
      } else {
        html.push(`<span class="tk-cm" style="font-style:normal">${esc(line)}</span>`);
      }
    }
    return { html: html.join('\n'), copy: cmds.join('\n') };
  }

  document.querySelectorAll('.code').forEach((box) => {
    const pre = box.querySelector('pre');
    if (!pre) return;
    const { lang = '', file = '' } = box.dataset;

    const code = pre.textContent.replace(/^\n/, '').replace(/\s+$/, '');
    let copyText = code;

    if (SH_LIKE.has(lang) && /^\$ /m.test(code)) {
      const s = paintSession(code);
      pre.innerHTML = s.html;
      copyText = s.copy;
    } else if (YAML_LIKE.has(lang)) {
      pre.innerHTML = paint(code, RE_YAML, YAML_CLASSES);
    } else if (SH_LIKE.has(lang)) {
      pre.innerHTML = paint(code, RE_SH, SH_CLASSES);
    } else {
      pre.innerHTML = paint(code, RE_JS, JS_CLASSES);
    }

    const bar = document.createElement('div');
    bar.className = 'bar';
    bar.innerHTML = `<span class="tag">${esc(file || lang || 'code')}</span>`;
    const cp = Object.assign(document.createElement('button'), {
      className: 'copy',
      type: 'button',
      textContent: '复制'
    });
    cp.onclick = () => {
      navigator.clipboard?.writeText(copyText);
      cp.textContent = '已复制';
      setTimeout(() => { cp.textContent = '复制'; }, 1400);
    };
    bar.appendChild(cp);
    box.insertBefore(bar, pre);
  });

  /* ---------- 上一章 / 下一章 ---------- */
  const pager = document.getElementById('pager');
  if (pager && cur) {
    const prev = CHAPTERS.find((c) => c.n === cur - 1);
    const next = CHAPTERS.find((c) => c.n === cur + 1);
    const prevLink = prev
      ? `<a class="prev" href="${href(prev.n)}"><span>&larr; 上一章</span>第 ${prev.n} 章 · ${prev.t}</a>`
      : '<a class="prev" href="index.html"><span>&larr; 返回</span>课程首页</a>';
    const nextLink = next
      ? `<a class="next" href="${href(next.n)}"><span>下一章 &rarr;</span>第 ${next.n} 章 · ${next.t}</a>`
      : '<a class="next ph" href="#">.</a>';
    pager.className = 'pager';
    pager.innerHTML = prevLink + nextLink;
  }

  /* ---------- 首页目录 ---------- */
  const grid = document.getElementById('toc-grid');
  if (grid) {
    grid.className = 'toc-grid';
    grid.innerHTML = CHAPTERS.map(({ n, t, d }) =>
      `<a class="toc-card" href="${href(n)}">` +
      `<div class="n">第 ${n} 章</div>` +
      `<div class="t">${t}</div>` +
      `<div class="d">${d}</div></a>`
    ).join('');
  }
})();
