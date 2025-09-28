// js/checkout.js
(() => {
  const API = window.APP_CONFIG.API_BASE;

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  const PLAN_MAP = {
    '5 créditos': 'PRICE_5',
    '20 créditos': 'PRICE_20',
    '100 créditos': 'PRICE_100',
    'ilimitado': 'PRICE_UNLIMITED'
  };

  function guessPlanFromCard(btn) {
    // Sobe até encontrar o card e lê o título
    let card = btn.closest('section, article, div');
    if (!card) return null;
    // procura um título
    const title = $('h1,h2,h3,h4', card);
    const t = (title && title.textContent || '').trim().toLowerCase();
    for (const key of Object.keys(PLAN_MAP)) {
      if (t.includes(key.split(' ')[0]) && t.includes(key.split(' ')[1] || '')) {
        return PLAN_MAP[key];
      }
    }
    // Fallback: checa o texto inteiro do card
    const whole = card.textContent.trim().toLowerCase();
    for (const key of Object.keys(PLAN_MAP)) {
      if (whole.includes(key.toLowerCase())) return PLAN_MAP[key];
    }
    return null;
  }

  async function startCheckout(plan) {
    try {
      const session = await window.getSession();
      if (!session) {
        alert('Entre com seu e-mail ou Google primeiro 🙂');
        return;
      }
      const user_id = session.user.id;
      console.log('[checkout] creating session', { plan, user_id });

      const r = await fetch(`${API}/api/stripe/create-checkout-session`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        mode: 'cors',
        body: JSON.stringify({ plan, user_id, quantity: 1 })
      });
      const data = await r.json().catch(() => ({}));

      if (!r.ok) {
        console.error('[checkout] backend error', data);
        alert(`Falhou criar sessão: ${data.error || r.statusText}`);
        return;
      }
      if (!data.url) {
        console.error('[checkout] no url returned', data);
        alert('Resposta sem URL de checkout.');
        return;
      }
      window.location.href = data.url;
    } catch (err) {
      console.error('[checkout] exception', err);
      alert('Erro inesperado ao iniciar o checkout.');
    }
  }

  function wireCreditsPage() {
    const buttons = $$('button, a').filter(b => {
      const txt = (b.textContent || b.value || '').trim().toLowerCase();
      return txt === 'selecionar';
    });

    if (buttons.length === 0) {
      console.warn('[checkout] nenhum botão "Selecionar" achado');
      return;
    }

    buttons.forEach(btn => {
      // 1) preferir data-plan
      let plan = btn.dataset.plan;
      // 2) se não tiver, deduz do card
      if (!plan) plan = guessPlanFromCard(btn);
      if (!plan) {
        console.warn('[checkout] não consegui deduzir plano para um botão', btn);
        return;
      }

      btn.addEventListener('click', (e) => {
        e.preventDefault();
        console.log('[checkout] click', plan);
        startCheckout(plan);
      });

      // marca visualmente (debug)
      btn.dataset.wired = '1';
    });

    console.log(`[checkout] ligados ${buttons.filter(b => b.dataset.wired === '1').length} botões`);
  }

  document.addEventListener('DOMContentLoaded', wireCreditsPage);
})();
