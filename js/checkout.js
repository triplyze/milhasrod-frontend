// /js/checkout.js
(function () {
  const C = window.APP_CONFIG || {};
  const API_BASE = C.API_BASE || '';               // https://milhasrod.vercel.app
  const FRONTEND_URL = C.FRONTEND_URL || location.origin;

  // Reaproveita a instância criada no auth.js; se não existir, cria.
  const sb = window.sb || supabase.createClient(C.SUPABASE_URL, C.SUPABASE_ANON_KEY);

  function log(...args) { console.log('[checkout]', ...args); }
  function toast(msg) {
    const el = document.getElementById('toast');
    if (!el) { alert(msg); return; }
    el.textContent = msg; el.classList.add('show'); setTimeout(()=>el.classList.remove('show'), 2500);
  }

  async function getToken() {
    const { data, error } = await sb.auth.getSession();
    if (error) { log('getSession error', error); return null; }
    return data?.session?.access_token || null;
  }

  async function gotoCheckout(priceId) {
    log('click', priceId);

    if (!API_BASE) {
      log('ERRO: API_BASE vazio'); toast('Configuração inválida (API_BASE).');
      return;
    }

    const token = await getToken();
    if (!token) {
      toast('Você precisa estar logado para comprar créditos.');
      return;
    }

    const url = `${API_BASE}/api/stripe/create-checkout-session`;
    const payload = { price_id: priceId, success_url: `${FRONTEND_URL}/success.html`, cancel_url: `${FRONTEND_URL}/cancel.html` };

    log('POST', url, payload);

    try {
      const resp = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload),
      });

      log('resp status', resp.status);
      if (!resp.ok) {
        const txt = await resp.text().catch(()=> '');
        log('resp not ok', txt);
        toast('Erro ao criar checkout.');
        return;
      }

      const data = await resp.json();
      log('resp json', data);

      if (data?.url) {
        window.location.href = data.url; // redireciona para o Stripe
      } else {
        toast('Resposta inválida do servidor.');
      }
    } catch (e) {
      log('fetch error', e);
      toast('Falha de rede ao iniciar checkout.');
    }
  }

  function wireButtons() {
    const btns = document.querySelectorAll('button[data-plan]');
    btns.forEach(btn => {
      btn.addEventListener('click', () => gotoCheckout(btn.dataset.plan));
    });
    log('ligados', btns.length, 'botões');
  }

  document.addEventListener('DOMContentLoaded', wireButtons);
})();
