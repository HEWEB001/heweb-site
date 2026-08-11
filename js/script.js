/**
 * HEWEB — JavaScript do site público
 */

(function () {
  'use strict';

  const PLANS = [
    {
      name: 'heweb Start',
      price: 39.90,
      audience: 'Pequenos negócios que precisam apenas de presença online.',
      featured: false,
      clients: 'Barbeiros, autónomos, pequenos restaurantes e prestadores de serviço.',
      features: [
        'Site de 1 página (Landing Page)',
        'Design profissional',
        'Versão para celular',
        'Informações da empresa',
        'Botão WhatsApp',
        'Formulário de contato',
        'Hospedagem',
        'Manutenção básica',
        'Atualizações simples de texto/imagens'
      ]
    },
    {
      name: 'heweb Pro',
      price: 69.90,
      audience: 'Empresas que querem um site mais completo.',
      featured: true,
      features: [
        'Tudo do Start +',
        'Site até 5 páginas (Home, Sobre, Serviços, Galeria, Contato)',
        'SEO básico',
        'Google Maps',
        'Catálogo de produtos/serviços',
        'Depoimentos',
        'Criação de banners simples',
        'Relatórios básicos de acesso'
      ]
    },
    {
      name: 'heweb Premium',
      price: 99.90,
      audience: 'Presença digital avançada com suporte prioritário.',
      featured: false,
      features: [
        'Tudo do Pro +',
        'Site personalizado completo',
        'Blog/notícias',
        'SEO avançado',
        'Integração com redes sociais',
        'Chat ou atendimento automático com IA',
        'Criação de conteúdos mensais',
        'Campanhas básicas de marketing',
        'Mais alterações mensais',
        'Suporte prioritário'
      ]
    },
    {
      name: 'heweb Business',
      price: 199.90,
      audience: 'Soluções completas para negócios em expansão.',
      featured: false,
      features: [
        'Site totalmente personalizado',
        'Loja virtual',
        'Sistema de pedidos',
        'Integrações externas',
        'Automações com IA',
        'Gestão de conteúdo',
        'Estratégia digital',
        'Análise de concorrentes',
        'Suporte prioritário'
      ]
    }
  ];

  const EXTRAS = [
    { icon: '🌐', name: 'Domínio personalizado', price: '€10-20/mês' },
    { icon: '🎨', name: 'Criação de logo', price: '€100-300' },
    { icon: '📱', name: 'Gestão Instagram', price: '€150-500/mês' },
    { icon: '📍', name: 'Google Meu Negócio', price: '€50-150' },
    { icon: '📊', name: 'Gestão de anúncios', price: 'Preço personalizado' }
  ];

  const euro = value =>
    new Intl.NumberFormat('pt-PT', { style: 'currency', currency: 'EUR' }).format(value);

  let revealObserver;

  function showRevealElements(elements) {
    elements.forEach(el => el.classList.add('visible'));
  }

  function observeReveal(elements) {
    if (!elements.length) return;

    if (!revealObserver) {
      revealObserver = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            revealObserver.unobserve(entry.target);
          }
        });
      }, { threshold: 0.05, rootMargin: '0px 0px 0px 0px' });
    }

    elements.forEach(el => {
      const rect = el.getBoundingClientRect();
      const inView = rect.top < window.innerHeight && rect.bottom > 0;
      if (inView) {
        el.classList.add('visible');
      } else {
        revealObserver.observe(el);
      }
    });
  }

  function initRevealFallback() {
    setTimeout(() => {
      document.querySelectorAll('.reveal:not(.visible)').forEach(el => {
        el.classList.add('visible');
      });
    }, 1500);
  }

  function renderPlans() {
    const grid = document.getElementById('plansGrid');
    if (!grid) return;

    grid.innerHTML = PLANS.map(plan => `
      <article class="plan-card ${plan.featured ? 'featured' : ''} reveal">
        ${plan.featured ? '<span class="plan-badge">Mais Popular</span>' : ''}
        <h3 class="plan-name">${plan.name}</h3>
        <p class="plan-audience">${plan.audience}</p>
        <p class="plan-price">${euro(plan.price)} <small>/mês</small></p>
        <p class="plan-includes-label">Inclui</p>
        <ul class="plan-features">
          ${plan.features.map(f => `<li>${f}</li>`).join('')}
        </ul>
        ${plan.clients ? `
          <div class="plan-clients">
            <p class="plan-clients-label">Ideal para</p>
            <p>${plan.clients}</p>
          </div>
        ` : ''}
        <button type="button" class="plan-btn" data-plan="${plan.name}">Solicitar Orçamento</button>
      </article>
    `).join('');

    grid.querySelectorAll('.plan-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const contact = document.getElementById('contacto');
        const message = document.getElementById('message');
        const planName = btn.dataset.plan;

        contact?.scrollIntoView({ behavior: 'smooth' });

        if (message && planName) {
          setTimeout(() => {
            message.value = `Olá! Tenho interesse no plano ${planName}. `;
            message.focus();
          }, 600);
        }
      });
    });

    observeReveal(grid.querySelectorAll('.reveal'));
  }

  function renderExtras() {
    const grid = document.getElementById('extrasGrid');
    if (!grid) return;

    grid.innerHTML = EXTRAS.map(item => `
      <article class="extra-card reveal">
        <div class="extra-icon">${item.icon}</div>
        <h4 class="extra-name">${item.name}</h4>
        <p class="extra-price">${item.price}</p>
      </article>
    `).join('');

    observeReveal(grid.querySelectorAll('.reveal'));
  }

  function initReveal() {
    showRevealElements(document.querySelectorAll('.hero .reveal'));
    observeReveal(document.querySelectorAll('.reveal:not(.visible)'));
    initRevealFallback();
  }

  function initNav() {
    const header = document.getElementById('header');
    const toggle = document.getElementById('menuToggle');
    const nav = document.getElementById('nav');
    const overlay = document.getElementById('navOverlay');
    const links = document.querySelectorAll('.nav-link, .nav-cta');

    const close = () => {
      toggle?.classList.remove('active');
      toggle?.setAttribute('aria-expanded', 'false');
      nav?.classList.remove('open');
      overlay?.classList.remove('show');
      document.body.style.overflow = '';
    };

    const open = () => {
      toggle?.classList.add('active');
      toggle?.setAttribute('aria-expanded', 'true');
      nav?.classList.add('open');
      overlay?.classList.add('show');
      document.body.style.overflow = 'hidden';
    };

    toggle?.addEventListener('click', () => {
      nav?.classList.contains('open') ? close() : open();
    });

    overlay?.addEventListener('click', close);
    links.forEach(link => link.addEventListener('click', close));

    window.addEventListener('scroll', () => {
      header?.classList.toggle('scrolled', window.scrollY > 40);
      updateActiveLink();
    }, { passive: true });

    window.addEventListener('resize', () => {
      if (window.innerWidth > 768) close();
    });
  }

  function updateActiveLink() {
    const sections = document.querySelectorAll('section[id]');
    const links = document.querySelectorAll('.nav-link');
    let current = '';

    sections.forEach(section => {
      const top = section.offsetTop - 120;
      if (window.scrollY >= top) {
        current = section.id;
      }
    });

    links.forEach(link => {
      link.classList.toggle('active', link.getAttribute('href') === `#${current}`);
    });
  }

  function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', e => {
        const id = anchor.getAttribute('href');
        if (!id || id === '#') return;
        const target = document.querySelector(id);
        if (!target) return;
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth' });
      });
    });
  }

  function initForm() {
    const form = document.getElementById('contactForm');
    const success = document.getElementById('formSuccess');
    const submitBtn = form?.querySelector('[type="submit"]');

    form?.addEventListener('submit', async e => {
      e.preventDefault();

      const fields = form.querySelectorAll('input[required], textarea[required]');
      let valid = true;

      fields.forEach(field => {
        const isValid = field.value.trim() !== '';
        field.classList.toggle('error', !isValid);
        if (!isValid) valid = false;
      });

      const emailField = form.querySelector('#email');
      if (emailField && emailField.value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailField.value)) {
        emailField.classList.add('error');
        valid = false;
      }

      if (!valid) return;

      const payload = {
        name: form.querySelector('#name')?.value || '',
        company: form.querySelector('#company')?.value || '',
        email: form.querySelector('#email')?.value || '',
        message: form.querySelector('#message')?.value || ''
      };

      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'A enviar...';
      }

      try {
        await HEWEBMessages.add(payload);
        success?.classList.add('show');
        form.reset();
        fields.forEach(field => field.classList.remove('error'));
        setTimeout(() => success?.classList.remove('show'), 5000);
      } catch {
        success.textContent = 'Erro ao enviar. Tente novamente.';
        success?.classList.add('show');
        setTimeout(() => {
          success?.classList.remove('show');
          success.textContent = 'Mensagem enviada com sucesso! Entraremos em contacto em breve.';
        }, 5000);
      } finally {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = 'Enviar Mensagem';
        }
      }
    });

    form?.querySelectorAll('input, textarea').forEach(field => {
      field.addEventListener('input', () => field.classList.remove('error'));
    });
  }

  function init() {
    initNav();
    initSmoothScroll();
    renderPlans();
    renderExtras();
    initReveal();
    initForm();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
