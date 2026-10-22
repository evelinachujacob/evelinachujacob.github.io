/* Highlights the rail link for the section in view (pairs with rail.css). */
(function(){
  var links = Array.prototype.slice.call(document.querySelectorAll('.rail a'));
  var targets = links.map(function(a){ return document.querySelector(a.getAttribute('href')); });
  if (!links.length) return;
  var ticking = false;
  function spy(){
    ticking = false;
    var cur = 0;
    for (var i = 0; i < targets.length; i++) {
      if (targets[i] && targets[i].getBoundingClientRect().top <= 140) cur = i;
    }
    /* at the very bottom, light the last link even if its section is short */
    if (innerHeight + scrollY >= document.documentElement.scrollHeight - 4) cur = links.length - 1;
    links.forEach(function(l, i){ l.classList.toggle('on', i === cur); });
  }
  addEventListener('scroll', function(){ if (!ticking) { ticking = true; requestAnimationFrame(spy); } }, {passive: true});
  addEventListener('resize', spy);
  spy();
})();
