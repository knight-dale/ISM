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
        showFeedback(errors, 'error');
        return;
      }

      formSubmit.disabled = true;
      formSubmit.textContent = 'Submitting…';

      setTimeout(function () {
        showFeedback(
          '✓ Thank you, ' + name.value.split(' ') + '! We\'ll be in touch shortly.',
          'success'
        );
        formSubmit.textContent = 'Submit Partnership Application →';
        formSubmit.disabled = false;
        document.getElementById('partnerForm').querySelectorAll('input, select, textarea')
          .forEach(function (field) { field.value = ''; });
      }, 1200);
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

  function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        const el = event.currentTarget.querySelector('i');
        const originalClass = el.className;
        el.className = 'fas fa-check';
        setTimeout(() => { el.className = originalClass; }, 2000);
    }).catch(err => console.error('Failed to copy: ', err));
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

})();