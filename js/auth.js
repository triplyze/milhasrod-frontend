// js/auth.js
(() => {
  const { SUPABASE_URL, SUPABASE_ANON_KEY } = window.APP_CONFIG;
  const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

  // Exibe/atualiza saldo e estado do usuário no header
  async function refreshHeader() {
    const { data: { session } } = await supabase.auth.getSession();
    const emailInput = document.querySelector('#email-input');
    const loginBtn   = document.querySelector('#btn-magiclink');
    const googleBtn  = document.querySelector('#btn-google');
    const logoutBtn  = document.querySelector('#btn-logout');
    const saldoEl    = document.querySelector('#saldo-badge');

    if (session) {
      // logged in
      if (emailInput) emailInput.value = session.user.email || '';
      if (loginBtn)  loginBtn.style.display  = 'none';
      if (googleBtn) googleBtn.style.display = 'none';
      if (logoutBtn) logoutBtn.style.display = 'inline-flex';
      if (saldoEl)    saldoEl.textContent = '…';

      // pega saldo
      try {
        const res = await fetch(`${window.APP_CONFIG.API_BASE}/api/credits`, {
          headers: { Authorization: `Bearer ${session.access_token}` }
        });
        const json = await res.json();
        if (saldoEl) saldoEl.textContent = json?.balance ?? 0;
      } catch(_) {
        if (saldoEl) saldoEl.textContent = '0';
      }
    } else {
      // logged out
      if (loginBtn)  loginBtn.style.display  = 'inline-flex';
      if (googleBtn) googleBtn.style.display = 'inline-flex';
      if (logoutBtn) logoutBtn.style.display = 'none';
      if (saldoEl)    saldoEl.textContent = '—';
    }
  }

  // Magic Link
  async function sendMagicLink() {
    const email = (document.querySelector('#email-input')?.value || '').trim();
    if (!email) return alert('Digite seu e-mail.');
    const redirectTo = `${location.origin}/auth/callback.html`;
    const { error } = await supabase.auth.signInWithOtp({ email, options: { emailRedirectTo: redirectTo }});
    if (error) return alert('Erro: ' + error.message);
    alert('Prontinho! Olhe seu e-mail e clique no link.');
  }

  // Google OAuth
  async function loginWithGoogle() {
    const redirectTo = `${location.origin}/auth/callback.html`;
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo }
    });
    if (error) alert('Erro: ' + error.message);
  }

  // Logout
  async function doLogout() {
    await supabase.auth.signOut();
    location.reload();
  }

  // Callback (abre em /auth/callback.html)
  async function handleCallbackIfNeeded() {
    // Se o Supabase te trouxe com ?code=... (OAuth) ou hash do magiclink, trocamos por sessão
    const hasCode = new URLSearchParams(location.search).get('code');
    if (hasCode || location.hash.includes('access_token')) {
      try {
        await supabase.auth.exchangeCodeForSession(location.href);
      } catch (_) {
        // ignorar
      }
      // volta para home (ou a página que quiser)
      location.replace('/');
    }
  }

  // Eventos da UI
  document.addEventListener('click', (ev) => {
    const t = ev.target;
    if (t.matches('#btn-magiclink')) { ev.preventDefault(); sendMagicLink(); }
    if (t.matches('#btn-google'))    { ev.preventDefault(); loginWithGoogle(); }
    if (t.matches('#btn-logout'))    { ev.preventDefault(); doLogout(); }
  });

  // Expor helpers se precisar em outros scripts
  window.__auth = { supabase, refreshHeader };

  // Inicializa
  handleCallbackIfNeeded();
  refreshHeader();
})();
