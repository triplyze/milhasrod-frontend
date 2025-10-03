/* global supabase */
// /js/app.js
(function () {
  const C = window.APP_CONFIG || {};
  const API_BASE = C.API_BASE || '';
  const sb = window.sb || supabase.createClient(C.SUPABASE_URL, C.SUPABASE_ANON_KEY);

  function log(...args) { console.log('[app]', ...args); }
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

  // Atualiza balance (usa a view user_balance que você criou)
  async function refreshBalance() {
    try {
      const { data, error } = await sb
        .from('user_balance')
        .select('balance')
        .single();
      if (error) { log('balance error', error); return; }
      const b = document.getElementById('balance');
      if (b) b.textContent = (data?.balance ?? 0);
    } catch (e) { log('balance exc', e); }
  }

  // Pesquisa (aqui debitamos 1 crédito e você depois chama sua API real de busca)
  async function onSearch() {
    const token = await getToken();
    if (!token) { toast('Entre para pesquisar.'); return; }
    if (!API_BASE) { toast('Configuração inválida (API_BASE).'); return; }

    const ref = `search_${Date.now()}`;

    const body = { amount: 1, ref, reason: 'search' };
    const url  = `${API_BASE}/api/credits/spend`;

    log('POST', url, body);

    try {
      const resp = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(body),
      });

      log('resp status', resp.status);
      const json = await resp.json().catch(()=> ({}));
      log('resp json', json);

      if (!resp.ok || json?.success === false) {
        toast(json?.message || 'Erro ao debitar crédito.');
        return;
      }

      toast('Pesquisa iniciada! (crédito debitado)');
      refreshBalance();

      // TODO: aqui você chama sua API de busca de voos e exibe resultados
      // ex.: fetch(`${API_BASE}/api/search?from=...&to=...`)
    } catch (e) {
      log('search error', e);
      toast('Falha de rede na pesquisa.');
    }
  }

  function wireSearch() {
    const btn = document.getElementById('search-btn');
    if (btn) btn.addEventListener('click', onSearch);
  }

  // Mostra/oculta elementos conforme login
  async function syncUI() {
    const { data } = await sb.auth.getSession();
    const logged = !!data?.session;

    document.querySelectorAll('[data-when="in"]').forEach(el => el.style.display = logged ? '' : 'none');
    document.querySelectorAll('[data-when="out"]').forEach(el => el.style.display = logged ? 'none' : '');

    if (logged) refreshBalance();
  }

  document.addEventListener('DOMContentLoaded', () => {
    wireSearch();
    syncUI();
    log('ready');
  });
})();
