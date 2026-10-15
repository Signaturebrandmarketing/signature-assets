/* Agent OS overview funnel counter (GoatCounter: https://signaturebm.goatcounter.com).
   Counts: /overview, video-started, video-finished, /desk-demo, book-demo-clicked.
   A link tagged ?ref=agency-name adds "/agency-name" to every count for that visit.
   Open the overview with #me once on a device to stop counting yourself there; #count undoes it. */
(function(){
  var SKIP = 'aos-skip-count', REFK = 'aos-ref';
  var skip = false, ref = '', q = null;
  try {
    if (location.hash === '#me') localStorage.setItem(SKIP, '1');
    if (location.hash === '#count') localStorage.removeItem(SKIP);
    skip = localStorage.getItem(SKIP) === '1';
  } catch(e){}
  try { q = new URLSearchParams(location.search).get('ref'); } catch(e){}
  try {
    if (q) sessionStorage.setItem(REFK, q);
    ref = sessionStorage.getItem(REFK) || '';
  } catch(e){ ref = q || ''; }
  ref = ref.toLowerCase().replace(/[^a-z0-9-]/g, '').slice(0, 40);

  var queue = [], ready = false;
  function send(v){ try { window.goatcounter.count(v); } catch(e){} }

  // aosCount('/overview') counts a page; aosCount('video-finished', true) counts an event.
  window.aosCount = function(name, isEvent){
    if (skip) return;
    var v = { path: name + (ref ? '/' + ref : ''), title: name, event: !!isEvent };
    if (ready) send(v); else queue.push(v);
  };
  if (skip) return;

  window.goatcounter = { no_onload: true, endpoint: 'https://signaturebm.goatcounter.com/count' };
  var s = document.createElement('script');
  s.async = true;
  s.src = 'https://gc.zgo.at/count.js';
  s.setAttribute('data-goatcounter', 'https://signaturebm.goatcounter.com/count');
  s.onload = function(){ ready = true; queue.splice(0).forEach(send); };
  document.head.appendChild(s);
})();
