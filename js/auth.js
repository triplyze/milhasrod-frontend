// js/auth.js
(() => {
  const { SUPABASE_URL, SUPABASE_ANON_KEY } = window.APP_CONFIG;
  const supa = window.supa = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: { persistSession: true, detectSessionInUrl: true }
  });

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  // Helpers para achar botões mesmo sem id fixo
  function buttonByText(text) {
    return $$('button, a, input[type=button], input[type=submit]')
      .find(el => (el.textContent || el.value || '').trim().toLowerCase() === text.toLowerCase());
  }

  async function updateAuthUI() {
    const { data: { session } } = await supa.auth.getSession();
    window.__session = session || null;
    console.log('[auth] session?', !!session);

    const saldoEl = $('[data-balance], #saldo, .saldo-badge, [data-role="saldo"]');
    if (saldoEl) saldoEl.textContent = '—';
    document.dispatchEvent(new CustomEvent('auth:ready', { detail: { session } }));
  }

  async function sendMagicLink(email) {
    if (!email) { alert('Informe seu e-mail 🙂'); return; }
    const redirectTo = `${window.FRONTEND_URL}/`;
    const { error } = await supa.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: redirectTo }
    });
    if (error) {
      console.error('[auth] magic link error', error);
      alert('Falhou enviar o link. Verifique o e-mail.');
      return;
    }
    alert('Link enviado! Confira sua caixa de entrada. 📬');
  }

  async function loginWithGoogle() {
    const redirectTo = `${window.FRONTEND_URL}/`;
    const { error } = await supa.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo }
    });
    if (error) {
      console.error('[auth] google error', error);
      alert('Falhou o login com Google.');
    }
  }

  async function signOut() {
    await supa.auth.signOut();
    location.reload();
  }

  // Wire automático por texto/ids comuns
  document.addEventListener('DOMContentLoaded', () => {
    // Receber link
    const magicBtn = $('#btn-magic') || buttonByText('Receber link');
    const emailInput = $('#email, input[type=email]');

    if (magicBtn) {
      magicBtn.addEventListener('click', (e) => {
        e.preventDefault();
        const email = (emailInput && emailInput.value.trim()) || '';
        console.log('[auth] magic click', email);
        sendMagicLink(email);
      });
    }

    // Google
    const googleBtn = $('#btn-google') || buttonByText('Entrar com Google');
    if (googleBtn) {
      googleBtn.addEventListener('click', (e) => {
        e.preventDefault();
        console.log('[auth] google click');
        loginWithGoogle();
      });
    }

    // Sair
    const sairBtn = $('#btn-signout') || buttonByText('Sair');
    if (sairBtn) {
      sairBtn.addEventListener('click', (e) => {
        e.preventDefault();
        signOut();
      });
    }

    updateAuthUI();
  });

  // Exponho o supa pra outros arquivos
  window.getSession = async () => (await supa.auth.getSession()).data.session || null;
})();
