function copyToClipboard(text, btn) {
  navigator.clipboard.writeText(text).then(() => {
    btn.innerHTML = '<i class="fas fa-check"></i> Copied!';
    btn.classList.add('copied');
    setTimeout(() => {
      btn.innerHTML = '<i class="fas fa-copy"></i> Copy';
      btn.classList.remove('copied');
    }, 2000);
  }).catch(err => console.error('Failed to copy:', err));
}

/* ── County autocomplete (global so HTML onclick can reach it) ── */
const KENYA_COUNTIES = [
  "Baringo","Bomet","Bungoma","Busia","Elgeyo-Marakwet","Embu","Garissa",
  "Homa Bay","Isiolo","Kajiado","Kakamega","Kericho","Kiambu","Kilifi",
  "Kirinyaga","Kisii","Kisumu","Kitui","Kwale","Laikipia","Lamu","Machakos",
  "Makueni","Mandera","Marsabit","Meru","Migori","Mombasa","Murang'a",
  "Nairobi","Nakuru","Nandi","Narok","Nyamira","Nyandarua","Nyeri",
  "Samburu","Siaya","Taita-Taveta","Tana River","Tharaka-Nithi","Trans Nzoia",
  "Turkana","Uasin Gishu","Vihiga","Wajir","West Pokot"
];

let selectedCounty = '';

function filterCounties(query) {
  const dropdown = document.getElementById('countyDropdown');
  if (!dropdown) return;
  dropdown.innerHTML = '';
  selectedCounty = '';

  const q = query.trim().toLowerCase();
  if (!q) {
    dropdown.style.display = 'none';
    return;
  }

  const matches = KENYA_COUNTIES.filter(c => c.toLowerCase().includes(q));

  if (!matches.length) {
    dropdown.innerHTML = '<li class="county-no-result">No county found</li>';
    dropdown.style.display = 'block';
    return;
  }

  matches.forEach(county => {
    const li = document.createElement('li');
    const regex = new RegExp(`(${q})`, 'gi');
    li.innerHTML = county.replace(regex, '<strong>$1</strong>');
    li.addEventListener('mousedown', function (e) {
      e.preventDefault(); // prevent blur firing before click
      document.getElementById('bk-delivery').value = county;
      selectedCounty = county;
      dropdown.style.display = 'none';
    });
    dropdown.appendChild(li);
  });

  dropdown.style.display = 'block';
}

document.addEventListener('click', function (e) {
  if (!e.target.closest('.county-autocomplete')) {
    const dropdown = document.getElementById('countyDropdown');
    if (dropdown) dropdown.style.display = 'none';
  }
});

/* ── Main IIFE ── */
(function () {
  'use strict';

  const navbar = document.getElementById('navbar');

  function handleNavbarScroll() {
    if (window.scrollY > 20) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  }

  window.addEventListener('scroll', handleNavbarScroll, { passive: true });

  const navToggle = document.getElementById('navToggle');
  const navLinks = document.getElementById('navLinks');

  if (navToggle && navLinks) {
    navToggle.addEventListener('click', function () {
      const isOpen = navLinks.classList.toggle('open');
      navToggle.classList.toggle('open', isOpen);
      navToggle.setAttribute('aria-expanded', isOpen);
    });

    navLinks.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        navLinks.classList.remove('open');
        navToggle.classList.remove('open');
        navToggle.setAttribute('aria-expanded', false);
      });
    });

    document.addEventListener('click', function (e) {
      if (!navbar.contains(e.target)) {
        navLinks.classList.remove('open');
        navToggle.classList.remove('open');
        navToggle.setAttribute('aria-expanded', false);
      }
    });
  }

  const sections = document.querySelectorAll('section[id], div[id]');
  const navLinkItems = document.querySelectorAll('.nav-links a[href^="#"]');

  function highlightActiveNav() {
    let current = '';
    sections.forEach(function (section) {
      const sectionTop = section.offsetTop - 120;
      if (window.scrollY >= sectionTop) {
        current = section.getAttribute('id');
      }
    });

    navLinkItems.forEach(function (link) {
      link.classList.remove('active');
      if (link.getAttribute('href') === '#' + current) {
        link.classList.add('active');
      }
    });
  }

  window.addEventListener('scroll', highlightActiveNav, { passive: true });

  function addFadeUpTargets() {
    const targets = [
      '.service-card',
      '.partner-card',
      '.benefit-card',
      '.centre-card',
      '.mv-card',
      '.principle-item',
      '.contact-item',
      '.stat',
    ];

    targets.forEach(function (selector) {
      document.querySelectorAll(selector).forEach(function (el) {
        el.classList.add('fade-up');
      });
    });
  }

  function observeFadeUps() {
    const observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            const siblings = entry.target.parentElement
              ? Array.from(entry.target.parentElement.children)
              : [];
            const index = siblings.indexOf(entry.target);
            entry.target.style.transitionDelay = index * 60 + 'ms';
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 }
    );

    document.querySelectorAll('.fade-up').forEach(function (el) {
      observer.observe(el);
    });
  }

  addFadeUpTargets();
  observeFadeUps();

  function animateCounter(el, target, duration) {
    const suffix = el.dataset.suffix || '';
    let start = 0;
    const step = target / (duration / 16);
    const isDecimal = target % 1 !== 0;

    function tick() {
      start += step;
      if (start >= target) {
        el.textContent = isDecimal
          ? target.toFixed(1) + suffix
          : formatNumber(target) + suffix;
        return;
      }
      el.textContent = isDecimal
        ? start.toFixed(1) + suffix
        : formatNumber(Math.floor(start)) + suffix;
      requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  function formatNumber(n) {
    if (n >= 1000000) return (n / 1000000).toFixed(0) + 'M+';
    if (n >= 1000) return (n / 1000).toFixed(0) + 'K';
    return n.toString();
  }

  const heroStats = document.querySelectorAll('.stat-number[data-count]');
  if (heroStats.length) {
    const statObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          const target = parseFloat(entry.target.dataset.count);
          animateCounter(entry.target, target, 1200);
          statObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });

    heroStats.forEach(function (el) {
      statObserver.observe(el);
    });
  }

  const formSubmit = document.getElementById('formSubmit');
  const formFeedback = document.getElementById('formFeedback');

  if (formSubmit) {
    formSubmit.addEventListener('click', function (e) {
      e.preventDefault();

      const name = document.getElementById('fname');
      const email = document.getElementById('femail');
      const type = document.getElementById('ftype');
      const duration = document.getElementById('fduration');

      const errors = [];
      if (!name.value.trim()) errors.push('Full name is required.');
      if (!email.value.trim()) errors.push('Email address is required.');
      if (!isValidEmail(email.value)) errors.push('Please enter a valid email address.');
      if (!type.value) errors.push('Please select a partner type.');
      if (!duration.value) errors.push('Please select a partnership duration.');

      if (errors.length) {
        showFeedback(errors.join(' '), 'error');
        return;
      }

      formSubmit.disabled = true;
      formSubmit.textContent = 'Submitting…';

      const payload = JSON.stringify({
        access_key: '3eaa0222-9a88-4412-8d9d-73aa354212ec',
        subject: 'New ISM Partnership Application',
        from_name: 'ISM Kenya Website',
        name: name.value.trim(),
        email: email.value.trim(),
        phone: document.getElementById('fphone')?.value.trim() || '',
        country: document.getElementById('fcountry')?.value.trim() || '',
        partner_type: type.value,
        duration: duration.value,
        message: document.getElementById('fmessage')?.value.trim() || ''
      });

      fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: payload
      })
      .then(async (response) => {
        if (response.status === 200) {
          showFeedback('✓ Thank you, ' + name.value.split(' ')[0] + '! We\'ll be in touch shortly.', 'success');
          document.getElementById('partnerForm')
            .querySelectorAll('input, select, textarea')
            .forEach(field => { field.value = ''; });
        } else {
          showFeedback('Submission failed. Please try again.', 'error');
        }
      })
      .catch(() => {
        showFeedback('Something went wrong. Please try again.', 'error');
      })
      .finally(() => {
        formSubmit.textContent = 'Submit Partnership Application →';
        formSubmit.disabled = false;
      });
    });
  }

  function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  function showFeedback(message, type) {
    if (!formFeedback) return;
    formFeedback.textContent = message;
    formFeedback.className = 'form-feedback ' + type;
    setTimeout(function () {
      formFeedback.textContent = '';
      formFeedback.className = 'form-feedback';
    }, 5000);
  }

  const paybillImg = document.querySelector('.paybill-img');
  if (paybillImg) {
    paybillImg.addEventListener('load', function () {
      const wrap = paybillImg.closest('.paybill-img-wrap');
      if (wrap) {
        const ratio = paybillImg.naturalWidth / paybillImg.naturalHeight;
        if (ratio < 1) {
          wrap.style.maxWidth = '200px';
        } else {
          paybillImg.style.transform = 'none';
        }
      }
    });
  }

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && navLinks && navLinks.classList.contains('open')) {
      navLinks.classList.remove('open');
      navToggle.classList.remove('open');
      navToggle.setAttribute('aria-expanded', false);
      navToggle.focus();
    }
  });

  document.querySelectorAll('.principle-item').forEach(function (item) {
    item.addEventListener('mouseenter', function () {
      item.style.paddingLeft = '1.5rem';
    });
    item.addEventListener('mouseleave', function () {
      item.style.paddingLeft = '1.25rem';
    });
  });

  (function () {
    let currentBook = '';

    window.openBookModal = function (bookTitle, genre) {
      currentBook = bookTitle;
      document.getElementById('modalBookName').textContent = bookTitle + ' — ' + genre;
      document.getElementById('bk-qty').value = '1';
      document.getElementById('bk-delivery').value = '';
      selectedCounty = '';
      updateModalTotal();
      const feedback = document.getElementById('bookModalFeedback');
      feedback.className = 'books-modal-feedback';
      feedback.textContent = '';
      document.getElementById('bookSubmitBtn').disabled = false;
      document.getElementById('bookSubmitBtn').textContent = 'Submit Order →';
      document.getElementById('bookOrderModal').classList.add('open');
      document.body.style.overflow = 'hidden';
    };

    window.closeBookModal = function () {
      document.getElementById('bookOrderModal').classList.remove('open');
      document.body.style.overflow = '';
    };

    window.updateModalTotal = function () {
      const qty = parseInt(document.getElementById('bk-qty').value, 10) || 1;
      const total = qty * 1000;
      document.getElementById('modalQtyDisplay').textContent = qty;
      document.getElementById('modalTotalDisplay').textContent = 'KES ' + total.toLocaleString();
    };

    window.submitBookOrder = function () {
      const name = document.getElementById('bk-name').value.trim();
      const phone = document.getElementById('bk-phone').value.trim();
      const email = document.getElementById('bk-email').value.trim();
      const qty = document.getElementById('bk-qty').value;
      const delivery = document.getElementById('bk-delivery').value.trim();
      const feedback = document.getElementById('bookModalFeedback');
      const btn = document.getElementById('bookSubmitBtn');

      if (!name || !phone || !email) {
        feedback.textContent = 'Please fill in your name, phone, and email to continue.';
        feedback.className = 'books-modal-feedback error';
        return;
      }

      if (!KENYA_COUNTIES.includes(delivery)) {
        feedback.textContent = 'Please select a valid delivery county from the list.';
        feedback.className = 'books-modal-feedback error';
        document.getElementById('bk-delivery').focus();
        return;
      }

      btn.disabled = true;
      btn.textContent = 'Sending…';

      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 10000); 

      const payload = JSON.stringify({
        access_key: '3eaa0222-9a88-4412-8d9d-73aa354212ec',
        subject: `Book Order: ${currentBook}`,
        name,
        email,
        phone,
        message: `Book: ${currentBook} | Copies: ${qty} | Delivery County: ${delivery} | Notes: ${document.getElementById('bk-notes').value.trim()}`
      });

      fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: payload,
        signal: controller.signal,
      })
      .then(r => r.json())
      .then(data => {
        clearTimeout(timeout);
        if (data.success) {
          feedback.scrollIntoView({ behavior: 'smooth' });
          feedback.innerHTML = '✅ Order received! Please pay <strong>KES ' + (parseInt(qty) * 1000).toLocaleString() + '</strong> to Paybill <strong>23189</strong>, Account <strong>ISM#</strong>. We\'ll confirm delivery within 24 hours.';
          feedback.className = 'books-modal-feedback success';
          btn.textContent = 'Order Sent ✓';
        } else {
          throw new Error(data.message);
        }
      })
      .catch(err => {
        clearTimeout(timeout);
        if (err.name === 'AbortError') {
          feedback.innerHTML = '⚠️ Request timed out. Your order may still have been received — please call <strong>0738 633 000</strong> to confirm.';
        } else {
          feedback.innerHTML = '❌ Something went wrong. Please call <strong>0738 633 000</strong>.';
        }
        feedback.className = 'books-modal-feedback error';
        btn.disabled = false;
        btn.textContent = 'Submit Order →';
      });
    };
  })();

})();