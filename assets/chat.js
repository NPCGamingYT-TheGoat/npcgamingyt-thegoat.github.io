/*
 * Ask-Vick chat widget.
 * Usage: <script src="assets/chat.js" data-api="https://YOUR-SERVICE/api/chat" defer></script>
 * Talks to the Go portfolio-chat service, which streams Server-Sent Events:
 *   {type:"text",text} … {type:"sources",sources:[{title,url}]} {type:"done"} | {type:"error",message}
 */
(function () {
  var script = document.currentScript;
  var API = script && script.getAttribute('data-api');
  if (!API || API.indexOf('YOUR-') !== -1) { console.warn('[chat] data-api not set; widget disabled'); return; }
  var EMAIL = (script && script.getAttribute('data-email')) || 'roninprogrammer@gmail.com';
  var MAX = 1000, STORE = 'ask-vick-v1';
  var GREETING = "Hi! I'm Vick's AI assistant. Ask me about his experience, projects, GitHub or how to work with him.";
  var SUGGESTIONS = ['What does Vick do at AFED Digital?', 'Tell me about his Maxis work', 'What is on his GitHub?', 'Is he open to new roles?'];

  var css = `
.av-launch{position:fixed;right:max(20px,env(safe-area-inset-right));bottom:max(20px,env(safe-area-inset-bottom));z-index:60;display:inline-flex;align-items:center;gap:.6rem;height:48px;padding:0 1.1rem 0 .95rem;border-radius:999px;border:1px solid hsl(var(--primary)/.5);background:hsl(var(--primary));color:hsl(var(--primary-foreground));font:500 .9rem/1 Geist,system-ui,sans-serif;cursor:pointer;box-shadow:0 10px 30px -10px hsl(var(--primary)/.6);transition:transform .2s,box-shadow .2s}
.av-launch:hover{transform:translateY(-2px);box-shadow:0 14px 34px -10px hsl(var(--primary)/.7)}
.av-launch:focus-visible,.av-panel button:focus-visible,.av-panel a:focus-visible,.av-panel textarea:focus-visible{outline:2px solid hsl(var(--ring));outline-offset:2px}
.av-launch svg{width:18px;height:18px}
.av-dot{position:relative;width:8px;height:8px}.av-dot::before,.av-dot::after{content:"";position:absolute;inset:0;border-radius:50%;background:#34d399}.av-dot::before{animation:av-ping 1.6s cubic-bezier(0,0,.2,1) infinite;opacity:.7}
@keyframes av-ping{75%,100%{transform:scale(2.2);opacity:0}}
.av-panel{position:fixed;right:max(20px,env(safe-area-inset-right));bottom:max(20px,env(safe-area-inset-bottom));z-index:61;width:min(400px,calc(100vw - 40px));height:min(620px,calc(100vh - 40px));display:flex;flex-direction:column;background:hsl(var(--card));color:hsl(var(--foreground));border:1px solid hsl(var(--border));border-radius:16px;box-shadow:0 30px 80px -30px hsl(220 30% 5%/.45),var(--shadow-card);overflow:hidden;font-family:Geist,system-ui,sans-serif;animation:av-in .22s ease-out}
@keyframes av-in{from{opacity:0;transform:translateY(12px) scale(.98)}to{opacity:1;transform:none}}
.av-panel[hidden],.av-launch[hidden]{display:none!important}
.av-bar{display:flex;align-items:center;justify-content:space-between;gap:.75rem;padding:.6rem .75rem .6rem 1rem;border-bottom:1px solid hsl(var(--border));background:hsl(var(--muted)/.5)}
.av-dots{display:flex;gap:6px}.av-dots i{width:10px;height:10px;border-radius:50%;display:block}
.av-mono{font-family:"JetBrains Mono",ui-monospace,monospace;font-size:.68rem;letter-spacing:.12em;text-transform:uppercase;color:hsl(var(--muted-foreground))}
.av-x{display:grid;place-items:center;width:32px;height:32px;border:0;border-radius:8px;background:transparent;color:hsl(var(--muted-foreground));cursor:pointer}.av-x:hover{background:hsl(var(--accent));color:hsl(var(--foreground))}
.av-head{padding:.9rem 1rem .75rem;border-bottom:1px solid hsl(var(--border))}
.av-head b{display:block;font:600 1.05rem/1.2 Archivo,system-ui,sans-serif;letter-spacing:-.01em}
.av-head span{display:block;margin-top:.25rem;font-size:.8rem;color:hsl(var(--muted-foreground))}
.av-log{flex:1;overflow-y:auto;padding:1rem;display:flex;flex-direction:column;gap:.85rem;overscroll-behavior:contain}
.av-msg{max-width:88%;font-size:.9rem;line-height:1.55;overflow-wrap:anywhere}
.av-msg.u{align-self:flex-end;background:hsl(var(--primary));color:hsl(var(--primary-foreground));padding:.6rem .85rem;border-radius:14px 14px 4px 14px;white-space:pre-wrap}
.av-msg.a{align-self:flex-start;background:hsl(var(--background));border:1px solid hsl(var(--border));padding:.7rem .9rem;border-radius:14px 14px 14px 4px}
.av-msg.a p{margin:0}.av-msg.a p+p,.av-msg.a ul,.av-msg.a ol{margin:.5rem 0 0}.av-msg.a ul,.av-msg.a ol{padding-left:1.15rem}.av-msg.a ul{list-style:disc}.av-msg.a ol{list-style:decimal}.av-msg.a li::marker{color:hsl(var(--primary))}.av-msg.a ul+p,.av-msg.a ol+p{margin-top:.5rem}.av-msg.a li+li{margin-top:.2rem}
.av-msg.a a{color:hsl(var(--primary));text-decoration:underline;text-underline-offset:3px}
.av-msg.a code{font-family:"JetBrains Mono",monospace;font-size:.8em;background:hsl(var(--muted));padding:.1em .35em;border-radius:4px}
.av-msg.err{border-color:hsl(var(--destructive)/.5)}
.av-src{display:flex;flex-wrap:wrap;gap:.35rem;margin-top:.6rem;padding-top:.55rem;border-top:1px dashed hsl(var(--border))}
.av-src a,.av-src span{font-family:"JetBrains Mono",monospace;font-size:.66rem;padding:.2rem .5rem;border:1px solid hsl(var(--border));border-radius:999px;color:hsl(var(--muted-foreground));text-decoration:none!important;max-width:100%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.av-src a:hover{border-color:hsl(var(--primary));color:hsl(var(--primary))}
.av-typing{display:inline-flex;gap:4px;padding:.2rem 0}.av-typing i{width:6px;height:6px;border-radius:50%;background:hsl(var(--muted-foreground));animation:av-b 1s infinite}.av-typing i:nth-child(2){animation-delay:.15s}.av-typing i:nth-child(3){animation-delay:.3s}
@keyframes av-b{0%,80%,100%{opacity:.25;transform:translateY(0)}40%{opacity:1;transform:translateY(-3px)}}
.av-sugg{display:flex;flex-wrap:wrap;gap:.4rem}
.av-sugg button{font:inherit;font-size:.8rem;padding:.4rem .7rem;border-radius:999px;border:1px solid hsl(var(--primary)/.35);background:transparent;color:hsl(var(--foreground));cursor:pointer;text-align:left}
.av-sugg button:hover{background:hsl(var(--primary)/.08);border-color:hsl(var(--primary))}
.av-form{border-top:1px solid hsl(var(--border));padding:.7rem .75rem calc(.55rem + env(safe-area-inset-bottom,0px));background:hsl(var(--card))}
.av-row{display:flex;align-items:flex-end;gap:.5rem}
.av-form textarea{flex:1;min-width:0;resize:none;max-height:120px;min-height:42px;padding:.65rem .8rem;border:1px solid hsl(var(--border));border-radius:10px;background:hsl(var(--background));color:hsl(var(--foreground));font:inherit;font-size:.9rem;line-height:1.4}
.av-form textarea:focus{border-color:hsl(var(--primary));outline:none}
.av-send{display:grid;place-items:center;width:42px;height:42px;flex:none;border:0;border-radius:10px;background:hsl(var(--primary));color:hsl(var(--primary-foreground));cursor:pointer}.av-send:disabled{opacity:.45;cursor:default}
.av-note{display:flex;justify-content:space-between;gap:.5rem;margin-top:.4rem;font-size:.68rem;color:hsl(var(--muted-foreground))}
.av-note button{font:inherit;border:0;background:none;color:inherit;text-decoration:underline;cursor:pointer;padding:0}
@media (max-width:640px){.av-panel{inset:0;width:100%;height:100%;border-radius:0;border:0;padding-top:env(safe-area-inset-top,0px)}.av-launch{height:46px}}
@media (prefers-reduced-motion:reduce){.av-panel,.av-launch,.av-dot::before,.av-typing i{animation:none!important;transition:none!important}}
`;
  var style = document.createElement('style'); style.textContent = css; document.head.appendChild(style);

  var ICON_CHAT = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>';
  var ICON_X = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M18 6 6 18M6 6l12 12"/></svg>';
  var ICON_SEND = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M22 2 11 13M22 2l-7 20-4-9-9-4z"/></svg>';

  var launch = document.createElement('button');
  launch.type = 'button'; launch.className = 'av-launch'; launch.setAttribute('aria-haspopup', 'dialog');
  launch.innerHTML = '<span class="av-dot" aria-hidden="true"></span>' + ICON_CHAT + '<span>Ask my AI</span>';

  var panel = document.createElement('section');
  panel.className = 'av-panel'; panel.hidden = true;
  panel.setAttribute('role', 'dialog'); panel.setAttribute('aria-label', "Chat with Vick's AI assistant");
  panel.innerHTML =
    '<div class="av-bar"><div class="av-dots" aria-hidden="true"><i style="background:hsl(var(--destructive)/.5)"></i><i style="background:hsl(var(--amber)/.6)"></i><i style="background:hsl(var(--primary)/.6)"></i></div>' +
    '<span class="av-mono" style="text-transform:none;letter-spacing:.02em">~/ask-vick</span><button type="button" class="av-x" aria-label="Close chat">' + ICON_X + '</button></div>' +
    '<div class="av-head"><b>Ask about Vick</b><span>AI assistant · answers from his CV and GitHub</span></div>' +
    '<div class="av-log" aria-live="polite"></div>' +
    '<form class="av-form"><div class="av-row"><label for="av-input" class="sr-only">Your question</label>' +
    '<textarea id="av-input" rows="1" maxlength="' + MAX + '" placeholder="Ask about experience, projects, stack…"></textarea>' +
    '<button type="submit" class="av-send" aria-label="Send">' + ICON_SEND + '</button></div>' +
    '<div class="av-note"><span>AI can make mistakes. For anything important, email ' + EMAIL + '.</span><button type="button" class="av-clear">Clear</button></div></form>';
  document.body.appendChild(launch); document.body.appendChild(panel);

  var log = panel.querySelector('.av-log'), form = panel.querySelector('form'), input = panel.querySelector('textarea'), send = panel.querySelector('.av-send');
  var history = [], busy = false;
  try { history = JSON.parse(sessionStorage.getItem(STORE) || '[]') || []; } catch (e) { history = []; }
  function save() { try { sessionStorage.setItem(STORE, JSON.stringify(history.slice(-20))); } catch (e) {} }

  function esc(s) { return s.replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function inline(s) {
    s = esc(s);
    s = s.replace(/`([^`]+)`/g, '<code>$1</code>');
    s = s.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    s = s.replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');
    s = s.replace(/(^|[\s(])(https?:\/\/[^\s<)]+[^\s<).,;:])/g, '$1<a href="$2" target="_blank" rel="noopener noreferrer">$2</a>');
    s = s.replace(/(^|[\s(])([\w.+-]+@[\w-]+\.[\w.]+[\w])/g, '$1<strong>$2</strong>');
    return s;
  }
  function md(text) {
    var out = [], list = null;
    text.split('\n').forEach(function (line) {
      var m = line.match(/^\s*(?:[-*•]|(\d+)[.)])\s+(.*)$/);
      if (m) {
        var tag = m[1] ? 'ol' : 'ul';
        if (!list || list.tag !== tag) { if (list) out.push('</' + list.tag + '>'); list = { tag: tag }; out.push('<' + tag + '>'); }
        out.push('<li>' + inline(m[2]) + '</li>');
        return;
      }
      if (list) { out.push('</' + list.tag + '>'); list = null; }
      line = line.replace(/^#{1,6}\s+/, '');
      if (line.trim()) out.push('<p>' + inline(line) + '</p>');
    });
    if (list) out.push('</' + list.tag + '>');
    return out.join('');
  }

  function bubble(role, text, sources, isErr) {
    var el = document.createElement('div');
    el.className = 'av-msg ' + (role === 'user' ? 'u' : 'a') + (isErr ? ' err' : '');
    if (role === 'user') el.textContent = text; else el.innerHTML = md(text);
    if (sources && sources.length) addSources(el, sources);
    log.appendChild(el); log.scrollTop = log.scrollHeight;
    return el;
  }
  function addSources(el, sources) {
    var box = document.createElement('div'); box.className = 'av-src';
    sources.forEach(function (s) {
      var a = document.createElement(s.url ? 'a' : 'span');
      a.textContent = s.title;
      if (s.url) { a.href = s.url; a.target = '_blank'; a.rel = 'noopener noreferrer'; }
      box.appendChild(a);
    });
    el.appendChild(box);
  }
  function renderSuggestions() {
    var box = document.createElement('div'); box.className = 'av-sugg';
    SUGGESTIONS.forEach(function (q) {
      var b = document.createElement('button'); b.type = 'button'; b.textContent = q;
      b.addEventListener('click', function () { box.remove(); ask(q); });
      box.appendChild(b);
    });
    log.appendChild(box);
  }
  function renderAll() {
    log.innerHTML = '';
    bubble('assistant', GREETING);
    history.forEach(function (m) { bubble(m.role, m.content, m.sources, m.error); });
    if (!history.length) renderSuggestions();
  }

  function setBusy(b) { busy = b; send.disabled = b; input.setAttribute('aria-busy', String(b)); }

  function ask(q) {
    q = q.trim();
    if (!q || busy) return;
    if (q.length > MAX) q = q.slice(0, MAX);
    var sugg = log.querySelector('.av-sugg'); if (sugg) sugg.remove();
    history.push({ role: 'user', content: q }); save();
    bubble('user', q);
    var el = bubble('assistant', ''); el.innerHTML = '<span class="av-typing" aria-label="Thinking"><i></i><i></i><i></i></span>';
    setBusy(true);
    var text = '', sources = [], failed = null;
    var payload = { messages: history.filter(function (m) { return !m.error; }).slice(-10).map(function (m) { return { role: m.role, content: m.content }; }) };

    fetch(API, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
      .then(function (res) {
        if (!res.ok || !res.body) {
          return res.json().catch(function () { return {}; }).then(function (j) { throw new Error(j.error || ('The assistant is unavailable (' + res.status + ').')); });
        }
        var reader = res.body.getReader(), dec = new TextDecoder(), buf = '';
        function pump() {
          return reader.read().then(function (r) {
            if (r.done) return;
            buf += dec.decode(r.value, { stream: true });
            var parts = buf.split('\n\n'); buf = parts.pop();
            parts.forEach(function (part) {
              var line = part.split('\n').filter(function (l) { return l.indexOf('data:') === 0; }).map(function (l) { return l.slice(5).trim(); }).join('');
              if (!line) return;
              var ev; try { ev = JSON.parse(line); } catch (e) { return; }
              if (ev.type === 'text') { text += ev.text; el.innerHTML = md(text); log.scrollTop = log.scrollHeight; }
              else if (ev.type === 'sources') sources = ev.sources || [];
              else if (ev.type === 'error') failed = ev.message;
            });
            return pump();
          });
        }
        return pump();
      })
      .catch(function (e) { failed = (e && e.message && e.message.indexOf('Failed to fetch') === -1) ? e.message : "Couldn't reach the assistant. Check your connection, or email " + EMAIL + '.'; })
      .then(function () {
        if (failed && !text) {
          el.classList.add('err'); el.innerHTML = md(failed);
          history.pop(); history.push({ role: 'user', content: q }); history.push({ role: 'assistant', content: failed, error: true });
        } else {
          if (failed) text += '\n\n' + failed;
          el.innerHTML = md(text || "I don't have an answer for that. Try emailing " + EMAIL + '.');
          if (sources.length) addSources(el, sources);
          history.push({ role: 'assistant', content: text, sources: sources });
        }
        save(); setBusy(false); log.scrollTop = log.scrollHeight;
        if (!matchMedia('(max-width: 640px)').matches) input.focus();
      });
  }

  function open() { panel.hidden = false; launch.hidden = true; if (!log.childElementCount) renderAll(); setTimeout(function () { input.focus(); }, 30); }
  function close() { panel.hidden = true; launch.hidden = false; launch.focus(); }
  launch.addEventListener('click', open);
  panel.querySelector('.av-x').addEventListener('click', close);
  panel.addEventListener('keydown', function (e) { if (e.key === 'Escape') close(); });
  panel.querySelector('.av-clear').addEventListener('click', function () { if (busy) return; history = []; save(); renderAll(); input.focus(); });
  form.addEventListener('submit', function (e) { e.preventDefault(); var q = input.value; input.value = ''; input.style.height = ''; ask(q); });
  input.addEventListener('keydown', function (e) { if (e.key === 'Enter' && !e.shiftKey && !e.isComposing) { e.preventDefault(); form.requestSubmit(); } });
  input.addEventListener('input', function () { input.style.height = 'auto'; input.style.height = Math.min(input.scrollHeight, 120) + 'px'; });
  document.querySelectorAll('[data-open-chat]').forEach(function (b) { b.addEventListener('click', function (e) { e.preventDefault(); open(); }); });
})();
