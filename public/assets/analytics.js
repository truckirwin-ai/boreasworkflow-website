/*
 * Boreas first-party funnel beacon.
 * No cookies, no IP logging, no third-party trackers, no fingerprinting.
 * Respects Do Not Track / Global Privacy Control. sid is a random per-visit
 * id in sessionStorage; it dies with the tab session.
 */
(function () {
  'use strict';

  if (navigator.doNotTrack === '1' || window.globalPrivacyControl) return;

  var API = 'https://api.boreasclinical.com/api/events';

  function sid() {
    try {
      var s = sessionStorage.getItem('b_sid');
      if (!s) {
        s = Math.random().toString(36).slice(2) + Date.now().toString(36);
        sessionStorage.setItem('b_sid', s);
      }
      return s;
    } catch (e) {
      return null;
    }
  }

  function track() {
    var meta = document.querySelector('meta[name="boreas-track"]');
    if (meta && meta.content) return meta.content;
    var p = location.pathname;
    if (p.indexOf('forensic') !== -1 || p.indexOf('templates/competency') !== -1) return 'forensic';
    if (p.indexOf('clinical') !== -1) return 'clinical';
    return 'general';
  }

  function refHost() {
    try {
      if (!document.referrer) return null;
      var h = new URL(document.referrer).host;
      return h === location.host ? null : h;
    } catch (e) {
      return null;
    }
  }

  function send(event, meta) {
    try {
      var payload = JSON.stringify({
        event: event,
        page: location.pathname,
        track: track(),
        ref: refHost(),
        sid: sid(),
        meta: meta || undefined
      });
      if (navigator.sendBeacon) {
        navigator.sendBeacon(API, new Blob([payload], { type: 'text/plain' }));
      } else {
        fetch(API, { method: 'POST', body: payload, keepalive: true });
      }
    } catch (e) { /* never break the page */ }
  }

  window.boreasEvent = send;

  // Page view
  send('page_view');

  // Delegated clicks: any element with data-evt fires that event.
  document.addEventListener('click', function (e) {
    var el = e.target && e.target.closest ? e.target.closest('[data-evt], a[href]') : null;
    if (!el) return;
    var evt = el.getAttribute && el.getAttribute('data-evt');
    if (evt) {
      send(evt, { label: el.getAttribute('data-evt-label') || undefined });
      return;
    }
    var href = el.getAttribute('href') || '';
    if (href.indexOf('/download/') !== -1) {
      send('download_click', { href: href.split('?')[0] });
    } else if (href.indexOf('pricing-datasheet') !== -1) {
      send('datasheet_download');
    }
  }, true);

  // Trial form
  var trialForm = document.getElementById('trial-form');
  if (trialForm) {
    trialForm.addEventListener('submit', function () { send('trial_submit'); });
  }

  // Pricing table scrolled into view (once)
  var pricing = document.querySelector('stripe-pricing-table');
  if (pricing && 'IntersectionObserver' in window) {
    var seen = false;
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting && !seen) {
          seen = true;
          send('pricing_view');
          io.disconnect();
        }
      });
    }, { threshold: 0.3 });
    io.observe(pricing);
  }

  // Demo video play (once)
  var video = document.querySelector('video');
  if (video) {
    var played = false;
    video.addEventListener('play', function () {
      if (!played) { played = true; send('demo_play'); }
    });
  }

  // Founder counter hydration: any element with data-founder-remaining.
  var counters = document.querySelectorAll('[data-founder-remaining]');
  if (counters.length) {
    fetch('https://api.boreasclinical.com/api/founder/remaining')
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (d) {
        if (!d || typeof d.remaining !== 'number') return;
        counters.forEach(function (el) { el.textContent = String(d.remaining); });
      })
      .catch(function () { /* leave fallback text */ });
  }
})();
