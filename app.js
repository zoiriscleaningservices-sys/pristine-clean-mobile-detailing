document.addEventListener('DOMContentLoaded', function () {
  var navBtn = document.querySelector('[data-nav-toggle]');
  var navMenu = document.querySelector('[data-nav-menu]');
  if (navBtn && navMenu) {
    navBtn.addEventListener('click', function () {
      var open = navMenu.classList.toggle('open');
      navBtn.setAttribute('aria-expanded', String(open));
    });
  }

  var estForm = document.querySelector('[data-estimator-form]');
  var estOut = document.querySelector('[data-estimator-output]');
  if (estForm && estOut) {
    estForm.addEventListener('change', function () {
      var svc = estForm.querySelector('[name="service"]');
      var tier = estForm.querySelector('[name="tier"]');
      var urg = estForm.querySelector('[name="urgency"]');
      var svcText = svc && svc.options[svc.selectedIndex] ? svc.options[svc.selectedIndex].text : 'Service';
      var tierText = tier && tier.options[tier.selectedIndex] ? tier.options[tier.selectedIndex].text : 'Signature Package';
      var urgVal = urg ? urg.value : 'standard';
      var windowText = urgVal === 'emergency' ? 'Same-day urgent dispatch window' : urgVal === 'priority' ? 'Priority 24–48h window' : 'Standard 3–5 day scheduling window';
      estOut.innerHTML = '<strong>Selected Scope:</strong> ' + svcText + ' (' + tierText + ') · <em>' + windowText + '</em>. Written quote provided on-site.';
    });
  }

  var faqButtons = document.querySelectorAll('[data-faq-toggle]');
  faqButtons.forEach(function (btn) {
    btn.addEventListener('click', function () {
      var expanded = btn.getAttribute('aria-expanded') === 'true';
      btn.setAttribute('aria-expanded', String(!expanded));
      var ans = btn.nextElementSibling;
      if (ans) ans.style.display = expanded ? 'none' : 'block';
    });
  });

  var contactForm = document.getElementById('contact-form');
  var statusEl = document.getElementById('contact-status');
  if (contactForm && statusEl) {
    contactForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var fd = new FormData(contactForm);
      var payload = {
        name: String(fd.get('name') || ''),
        email: String(fd.get('email') || ''),
        service: String(fd.get('service') || ''),
        notes: String(fd.get('notes') || '')
      };
      statusEl.textContent = 'Submitting inquiry to local development server…';
      fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
        .then(function (r) {
          if (r.status === 404 || r.status === 405) {
            return {
              status: r.status,
              data: {
                ok: false,
                error: 'Static preview host detected: connect an authorized GoHighLevel CRM webhook or production form endpoint before accepting live customer submissions.'
              }
            };
          }
          return r.json().then(function (d) { return { status: r.status, data: d }; });
        })
        .then(function (res) {
          if (res.status === 200 && res.data.ok) {
            statusEl.style.color = '#10b981';
            statusEl.textContent = 'Reference ' + res.data.referenceId + ': ' + res.data.message;
            contactForm.reset();
          } else {
            statusEl.style.color = '#ef4444';
            statusEl.textContent = res.data.error || 'Validation failed.';
          }
        })
        .catch(function (err) {
          statusEl.style.color = '#ef4444';
          statusEl.textContent = 'Could not reach local development endpoint: ' + err.message;
        });
    });
  }
});
