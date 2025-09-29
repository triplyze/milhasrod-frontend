// js/app.js
(() => {
  const CFG = window.APP_CONFIG || {};
  const API = CFG.API_BASE || "";              // "" = mesmo domínio do Vercel
  const SUPA_URL = CFG.SUPABASE_URL;
  const SUPA_KEY = CFG.SUPABASE_ANON_KEY;

  // supabase já está no projeto (login/magic link estão ok)
  const supabase = window.supabase.createClient(SUPA_URL, SUPA_KEY);

  // ---------------- SALDO (top bar)
  const saldoEl = document.querySelector("[data-saldo]"); // <span data-saldo>—</span>

  async function getToken() {
    const { data: { session } } = await supabase.auth.getSession();
    return session?.access_token || null;
  }

  async function updateBalance() {
    try {
      const token = await getToken();
      if (!token || !saldoEl) return;
      const r = await fetch(`${API}/api/credits`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!r.ok) throw new Error(await r.text());
      const j = await r.json();
      saldoEl.textContent = (j?.balance ?? "—");
    } catch (e) {
      console.warn("saldo:", e.message);
    }
  }
  supabase.auth.onAuthStateChange(() => updateBalance());
  updateBalance();

  // ---------------- PESQUISA
  const form = document.getElementById("searchForm");
  if (form) {
    form.addEventListener("submit", async (ev) => {
      ev.preventDefault();

      const origin = form.origin.value.trim();
      const dest   = form.dest.value.trim();
      const date   = form.date.value.trim();
      const pax    = form.pax?.value || 1;

      const token = await getToken();
      if (!token) {
        alert("Faça login para pesquisar.");
        return;
      }

      try {
        // ajuste os nomes dos parâmetros se seu endpoint esperar outros
        const url = `${API}/api/search?from=${encodeURIComponent(origin)}&to=${encodeURIComponent(dest)}&date=${encodeURIComponent(date)}&adults=${encodeURIComponent(pax)}`;

        const res = await fetch(url, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (res.status === 402) {            // código que usamos p/ saldo insuficiente
          alert("Créditos insuficientes.");
          return;
        }
        if (!res.ok) {
          const txt = await res.text();
          throw new Error(txt || `HTTP ${res.status}`);
        }

        const data = await res.json();

        // salva e vai para uma página simples de resultados (opcional)
        localStorage.setItem("lastResults", JSON.stringify(data));
        window.location.href = "results.html";
      } catch (err) {
        console.error(err);
        alert("Erro na pesquisa. Veja o console/network p/ detalhes.");
      }
    });
  }

  // ---------------- results.html (opcional)
  const resPre = document.getElementById("results");
  if (resPre) {
    const raw = localStorage.getItem("lastResults");
    if (raw) resPre.textContent = JSON.stringify(JSON.parse(raw), null, 2);
  }
})();
