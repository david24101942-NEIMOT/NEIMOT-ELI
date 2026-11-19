/* TIAMO – הוספה למסך הבית. קובץ עצמאי: מוסיף manifest ואייקונים, רושם Service Worker,
   ובטלפון מציג פעם אחת הודעה "הוסיפו למסך הבית" (בכניסה, או כשמתחילים לנגן שיר). */
(function () {
  'use strict';
  var head = document.head;
  function link(rel, href, type) {
    if (head.querySelector('link[rel="' + rel + '"]')) return;
    var l = document.createElement('link'); l.rel = rel; l.href = href; if (type) l.type = type; head.appendChild(l);
  }
  link('manifest', '/manifest.webmanifest');
  link('apple-touch-icon', '/icons/apple-touch-icon.png');
  link('icon', '/icons/favicon-48.png', 'image/png');
  if ('serviceWorker' in navigator) window.addEventListener('load', function () { navigator.serviceWorker.register('/sw.js').catch(function () {}); });

  var KEY = 'tiamo_neimot_install';
  function get() { try { return JSON.parse(localStorage.getItem(KEY) || '{}'); } catch (e) { return {}; } }
  function set(v) { try { var o = get(); for (var k in v) o[k] = v[k]; localStorage.setItem(KEY, JSON.stringify(o)); } catch (e) {} }
  function standalone() { return window.matchMedia('(display-mode: standalone)').matches || navigator.standalone === true; }
  function mobile() { return window.matchMedia('(pointer: coarse)').matches && Math.min(screen.width, screen.height) < 900; }
  var ios = /iphone|ipad|ipod/i.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  var deferred = null, shown = false, box = null;

  var css = document.createElement('style');
  css.textContent = '#tiamo-install{position:fixed;left:12px;right:12px;bottom:max(12px,env(safe-area-inset-bottom));z-index:99999;display:flex;align-items:center;gap:12px;max-width:520px;margin:0 auto;padding:12px 14px;border-radius:18px;border:1.5px solid #d4af37;background:rgba(14,12,10,.97);box-shadow:0 10px 30px rgba(0,0,0,.55);color:#fff;font-family:system-ui,sans-serif;direction:rtl;animation:tiIn .35s ease-out}' +
    '@keyframes tiIn{from{transform:translateY(30px);opacity:0}to{transform:none;opacity:1}}' +
    '#tiamo-install img{width:48px;height:48px;flex:none}' +
    '#tiamo-install .t{flex:1;min-width:0;display:grid;gap:2px;font-size:.92rem;line-height:1.35}' +
    '#tiamo-install b{color:#f6dc95}' +
    '#tiamo-install .go{flex:none;padding:9px 16px;border-radius:999px;border:0;background:#d4af37;color:#111;font:inherit;font-weight:800;cursor:pointer}' +
    '#tiamo-install .x{flex:none;background:none;border:0;color:#fff;opacity:.7;font-size:1.1rem;cursor:pointer;padding:6px}';
  head.appendChild(css);

  function hide() { if (box) { box.remove(); box = null; } }
  function show() {
    if (shown || standalone() || !mobile()) return;
    var st = get();
    if (st.installed) return;
    if (st.dismissed && Date.now() - st.dismissed < 14 * 864e5) return;
    if (!ios && !deferred) return;
    shown = true;
    box = document.createElement('div'); box.id = 'tiamo-install'; box.setAttribute('role', 'dialog');
    box.innerHTML = '<img src="/icons/icon-192.png" alt=""><div class="t"><b>הוסיפו את TIAMO למסך הבית</b><span></span></div>';
    box.querySelector('span').textContent = ios ? 'לחצו על כפתור השיתוף ⬆️ בתחתית Safari, ואז "הוספה למסך הבית"' : 'כניסה מהירה לנעימות בלחיצה אחת';
    if (!ios) {
      var go = document.createElement('button'); go.className = 'go'; go.type = 'button'; go.textContent = 'הוספה';
      go.onclick = function () {
        if (!deferred) return;
        deferred.prompt();
        deferred.userChoice.then(function (r) { set(r.outcome === 'accepted' ? { installed: true } : { dismissed: Date.now() }); }).catch(function () {});
        deferred = null; hide();
      };
      box.appendChild(go);
    }
    var x = document.createElement('button'); x.className = 'x'; x.type = 'button'; x.textContent = '✕'; x.setAttribute('aria-label', 'לא עכשיו');
    x.onclick = function () { set({ dismissed: Date.now() }); hide(); };
    box.appendChild(x);
    document.body.appendChild(box);
  }
  window.addEventListener('beforeinstallprompt', function (e) { e.preventDefault(); deferred = e; show(); });
  window.addEventListener('appinstalled', function () { set({ installed: true }); hide(); });
  window.addEventListener('load', function () { if (ios) setTimeout(show, 2500); });
  // הפעלה ראשונה של שיר: כל נגן אודיו בעמוד
  document.addEventListener('play', function () { setTimeout(show, 1500); }, true);
})();
