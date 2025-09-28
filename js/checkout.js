// js/checkout.js
(() => {
  const { API_BASE } = window.APP_CONFIG;
  const supabase = window.__auth?.supabase;

  async function currentToken() {
    const { data: { session } } = await supabase.auth.getSession();
    return session?.access_token || '';
    }

  async function goCheckout(plan) {
    const token = await currentToken();
    if (!token) {
      alert('Você precisa entrar antes de comprar. Use o e-mail ou Google.');
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/api/stripe/create-checkout-session?plan=${encodeURIComponent(plan)}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ quantity: 1 })
      });

      const json = await res.json();
      if (!res.ok || !json?.url) {
        throw new Error(json?.error || 'Não foi possível iniciar o checkout.');
      }
      // vai para o Stripe
      location.href = json.url;
    } catch (err) {
      alert('Erro no checkout: ' + err.message);
    }
  }

  function wireButtons() {
    document.querySelectorAll('[data-plan]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const plan = btn.getAttribute('data-plan');
        if (plan) goCheckout(plan);
      });
    });
  }

  document.addEventListener('DOMContentLoaded', wireButtons);
})();
