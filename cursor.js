/* Custom cursor (green flower, spins on click) + blur-in page opening (after rachelchen.tech).
   Load in <head>:  <script src="cursor.js"></script>
   Labels: links to case studies say "View project", outside links "Open link".
   Override on any element with data-cursor-text="..." */
(function(){
  var root = document.documentElement;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fine = window.matchMedia('(pointer: fine) and (min-width: 769px)').matches;

  var css =
    /* opening: page settles from blurred to sharp */
    'html.intro body{opacity:0;filter:blur(6px)}' +
    'html.intro-go body{opacity:1;filter:blur(0);transition:opacity .3s ease-out,filter .3s ease-out}' +
    /* cursor */
    'html.cc, html.cc *{cursor:none!important}' +
    '.cc-dot{position:fixed;left:0;top:0;z-index:9999;pointer-events:none;display:flex;align-items:center;gap:10px;' +
      'transform-origin:left center;transition:opacity .2s ease-out;opacity:0}' +
    '.cc-dot.on{opacity:1}' +
    /* four-petal flower; turns into a caret over text */
    '.cc-sq{flex:none;display:block;width:22px;height:22px;transition:width .15s ease-out,height .15s ease-out}' +
    '.cc-sq svg{display:block;width:100%;height:100%;transform:rotate(45deg);transition:transform .35s cubic-bezier(.2,.8,.2,1)}' +
    '.cc-dot.link .cc-sq{width:14px;height:14px}' +
    '.cc-lab{white-space:nowrap;font-size:15px;line-height:1.15;padding:2px 0;color:#4A7C59}' +
    '.cc-in{display:flex;align-items:center;gap:10px}';
  var st = document.createElement('style'); st.textContent = css;
  (document.head || root).appendChild(st);

  if (!reduce) root.classList.add('intro');

  function ready(){
    /* opening */
    if (!reduce) {
      requestAnimationFrame(function(){ requestAnimationFrame(function(){
        root.classList.add('intro-go'); root.classList.remove('intro');
        /* a filter on <body> breaks position:sticky/fixed, so drop it once done */
        setTimeout(function(){ root.classList.remove('intro-go'); }, 400);
      }); });
    }
    if (fine) cursor();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', ready);
  else ready();

  function cursor(){
    var cs = getComputedStyle(root);
    var col = (cs.getPropertyValue('--accent') || cs.getPropertyValue('--ink') || '').trim() || '#1a1815';
    var el = document.createElement('div'); el.className = 'cc-dot';
    el.innerHTML = '<div class="cc-in"><span class="cc-sq"><svg viewBox="0 0 20 20" aria-hidden="true">' +
      '<g fill="#4A7C59">' +
      '<circle cx="10" cy="5.6" r="4.4"/><circle cx="10" cy="14.4" r="4.4"/><circle cx="5.6" cy="10" r="4.4"/><circle cx="14.4" cy="10" r="4.4"/>' +
      '</g></svg></span><span class="cc-lab"></span></div>';
    el.style.setProperty('--cc', col);
    el.style.fontFamily = getComputedStyle(document.body).fontFamily;  /* sits outside <body>, so borrow its font */
    root.appendChild(el);   /* outside <body> so the opening blur doesn't touch it */
    root.classList.add('cc');
    var sq = el.querySelector('.cc-sq'), lab = el.querySelector('.cc-lab');

    var CLICK = 'a[href], button, [role="button"], summary, label[for], select, input[type=submit], input[type=button], input[type=checkbox], input[type=radio], [data-cursor-text]';

    function labelFor(t){
      var o = t.closest('[data-cursor-text]');
      if (o) return o.getAttribute('data-cursor-text');
      var a = t.closest('a[href]');
      if (!a) return '';
      var href = a.getAttribute('href') || '';
      if (href.indexOf('mailto:') === 0) return 'Send email';
      if (href.charAt(0) === '#') return '';
      try {
        var u = new URL(a.href, location.href);
        if (u.host && u.host !== location.host) return 'Open link';
        if (/\.html$/.test(u.pathname) && !/index\.html$/.test(u.pathname)) return 'View project';
      } catch(e){}
      return '';
    }

    /* label types itself in and out, like the reference */
    var shown = '', target = '', raf = 0;
    function ease(x){ return 1 - Math.pow(1 - x, 3); }
    function dur(s){ return Math.min(40 + 12 * s.length, 160); }
    function setLabel(next){
      if (next === target) return;
      target = next; cancelAnimationFrame(raf);
      var t0 = performance.now();
      if (next) {
        var d = dur(next);
        (function step(now){
          var p = Math.min(1, (now - t0) / d);
          shown = next.slice(0, Math.round(ease(p) * next.length)); lab.textContent = shown;
          if (p < 1) raf = requestAnimationFrame(step);
        })(t0);
      } else {
        var from = shown, d2 = dur(from);
        (function back(now){
          var p = Math.min(1, (now - t0) / d2);
          shown = from.slice(0, Math.round((1 - ease(p)) * from.length)); lab.textContent = shown;
          if (p < 1) raf = requestAnimationFrame(back);
        })(t0);
      }
    }

    document.addEventListener('pointermove', function(e){
      if (e.pointerType === 'touch') return;
      var x = e.clientX, y = e.clientY, t = e.target;
      requestAnimationFrame(function(){
        el.classList.add('on');
        if (!t || !t.closest) { place(x, y, false); return; }
        var link = !!t.closest(CLICK);
        el.classList.toggle('link', link);
        place(x, y, link);
        setLabel(labelFor(t));
      });
    }, {passive: true});
    /* centre the square (or caret) on the pointer */
    function place(x, y, link){
      var w = link ? 14 : 22, h = w;
      el.style.transform = 'translate(' + (x - w / 2) + 'px,' + (y - h / 2) + 'px)';
    }
    /* each click spins the flower one full turn, fast */
    var svg = el.querySelector('svg'), turn = 45;  /* petals on the diagonals, like the reference */
    document.addEventListener('mousedown', function(){ turn += 360; svg.style.transform = 'rotate(' + turn + 'deg)'; });
    document.addEventListener('mouseleave', function(){ el.classList.remove('on'); });
    document.addEventListener('mouseenter', function(){ el.classList.add('on'); });
    window.addEventListener('blur', function(){ el.classList.remove('on'); });
  }
})();
