// js/app.js
(() => {
  const API = window.APP_CONFIG.API_BASE;
  const $ = (s, r=document) => r.querySelector(s);
  const $$ = (s, r=document) => Array.from(r.querySelectorAll(s));

  // Atualiza saldo no topo (se existir)
  async function refreshBalance() {
    try {
      const session = await window.getSession();
      const saldoEl = $('[data-balance], #saldo, .saldo-badge, [data-role="saldo"]');
      if (!saldoEl) return;

      if (!session) { saldoEl.textContent = '—'; return; }
      const r = await fetch(`${API}/api/credits?user_id=${encodeURIComponent(session.user.id)}`, { mode: 'cors' });
      const data = await r.json();
      saldoEl.textContent = (data && (data.balance ?? data[0]?.balance)) ?? '0';
    } catch (e) {
      console.warn('[app] saldo erro', e);
    }
  }

  function wireSearch() {
    const searchBtn = $$('button, input[type=submit], a').find(el => {
      const t = (el.textContent || el.value || '').trim().toLowerCase();
      return t === 'pesquisar';
    });
    if (!searchBtn) return;

    searchBtn.addEventListener('click', async (e) => {
      e.preventDefault();
      const session = await window.getSession();
      if (!session) { alert('Faça login para pesquisar 🙂'); return; }

      // Exemplo: gastar 1 crédito antes de pesquisar (ajuste pro seu endpoint real)
      try {
        const r = await fetch(`${API}/api/credits/spend`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          mode: 'cors',
          body: JSON.stringify({ user_id: session.user.id, amount: 1, reason: 'search', ref: 'search_ui' })
        });
        const j = await r.json().catch(()=> ({}));
        if (!r.ok || j.success === false) {
          alert('Sem créditos suficientes ou erro ao debitar.');
          return;
        }
        alert('OK! (Aqui você chamaria sua rota de pesquisa de voos)');
        refreshBalance();
      } catch (err) {
        console.error('[search] erro', err);
        alert('Erro ao processar a pesquisa.');
      }
    });
  }

  document.addEventListener('auth:ready', refreshBalance);
  document.addEventListener('DOMContentLoaded', () => {
    wireSearch();
    refreshBalance();
  });
})();
