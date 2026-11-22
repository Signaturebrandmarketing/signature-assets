/* LiveLoop overview watch page counter (GoatCounter: https://signaturebm.goatcounter.com), added 11/22.
   Counts the page (/liveloop-overview) and these events:
     ll-overview-started, ll-overview-finished (90% of the 3:33 overview)
     ll-full-started, ll-full-half, ll-full-finished (the 16-minute walkthrough)
     ll-plans-clicked, ll-assessment-clicked, ll-ambassador-clicked
   A link tagged ?ref=linkedin (or a LinkedIn tracker code like ?ref=li-7k3p) adds "/<ref>" to every count for
   that visit and carries the source into the plan, assessment and ambassador buttons (utm_source / utm_content).
   Tracker codes are random: never put a person's name in the link.
   Shares the Agent OS "#me" switch (same site): open the page with #me once on a device to stop counting
   yourself there; #count undoes it. */
(function(){
  var SKIP = 'aos-skip-count', REFK = 'll-ref';
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
  ref = String(ref).toLowerCase().replace(/[^a-z0-9-]/g, '').slice(0, 40);
  var fromLinkedIn = ref === 'linkedin' || ref.indexOf('li-') === 0;

  // Carry the source into the buttons so a LinkedIn visit doesn't show up as the email (utm_source=ghl).
  if (ref) {
    document.querySelectorAll('a.btn').forEach(function(a){
      try {
        var u = new URL(a.href);
        u.searchParams.set('utm_source', fromLinkedIn ? 'linkedin' : ref);
        if (fromLinkedIn) u.searchParams.set('utm_campaign', 'liveloop-linkedin-2026-11');
        u.searchParams.set('utm_content', ref);
        a.href = u.toString();
      } catch(e){}
    });
  }

  var queue = [], ready = false, done = {};
  function send(v){ try { window.goatcounter.count(v); } catch(e){} }
  function count(name, isEvent){
    if (skip) return;
    var v = { path: name + (ref ? '/' + ref : ''), title: name, event: !!isEvent };
    if (ready) send(v); else queue.push(v);
  }
  function once(name){ if (done[name]) return; done[name] = 1; count(name, true); }
  function watch(v, key, half){
    v.addEventListener('play', function(){ once(key + '-started'); });
    v.addEventListener('timeupdate', function(){
      if (!v.duration) return;
      var p = v.currentTime / v.duration;
      if (half && p >= 0.5) once(key + '-half');
      if (p >= 0.9) once(key + '-finished');
    });
    v.addEventListener('ended', function(){ once(key + '-finished'); });
  }

  count('/liveloop-overview', false);
  document.querySelectorAll('#overview video').forEach(function(v){ watch(v, 'll-overview', false); });
  var full = document.getElementById('fullv');
  if (full) watch(full, 'll-full', true);
  document.querySelectorAll('a.btn').forEach(function(a){
    a.addEventListener('click', function(){
      var h = a.getAttribute('href') || '';
      once(h.indexOf('brand-assessment') > -1 ? 'll-assessment-clicked'
         : h.indexOf('ambassador') > -1 ? 'll-ambassador-clicked' : 'll-plans-clicked');
    });
  });

  if (skip) return;
  window.goatcounter = { no_onload: true, endpoint: 'https://signaturebm.goatcounter.com/count' };
  var s = document.createElement('script');
  s.async = true;
  s.src = 'https://gc.zgo.at/count.js';
  s.setAttribute('data-goatcounter', 'https://signaturebm.goatcounter.com/count');
  s.onload = function(){ ready = true; queue.splice(0).forEach(send); };
  document.head.appendChild(s);
})();
