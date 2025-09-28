/* global window, document, fetch */
// Uses window.APP_CONFIG and window.supabase (UMD bundle)
const CFG = window.APP_CONFIG || {};
const API_BASE = CFG.API_BASE || '';
const supabase = window.supabase.createClient(CFG.SUPABASE_URL, CFG.SUPABASE_ANON_KEY);

// --- Helpers --- //
async function getSession() {
  const { data } = await supabase.auth.getSession();
  return data.session || null;
}
async function getAccessToken() {
  const s = await getSession();
  return s?.access_token || null;
}
function $(sel){ return document.querySelector(sel); }
function $all(sel){ return Array.from(document.querySelectorAll(sel)); }
function fmt(n){ return typeof n==='number' ? n.toLocaleString('pt-BR') : n; }
function toast(msg){ console.log(msg); const el=$('#toast'); if(!el) return; el.textContent=msg; el.classList.add('show'); setTimeout(()=>el.classList.remove('show'), 2000); }

// --- Auth UI wiring --- //
async function updateAuthUI() {
  const s = await getSession();
  const logged = !!s;
  $all('[data-when="in"]').forEach(el => el.style.display = logged ? '' : 'none');
  $all('[data-when="out"]').forEach(el => el.style.display = logged ? 'none' : '');
  if (logged) { await refreshBalance(); }
  else { setBalance('—'); }
}

async function loginWithEmail(e){
  e?.preventDefault();
  const email = $('#email').value.trim();
  if(!email){ toast('Digite seu email'); return; }
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: { emailRedirectTo: window.location.origin + '/auth/callback.html' }
  });
  if(error){ toast('Erro: '+error.message); return; }
  toast('Enviamos um link para seu email 👍');
}

async function loginWithGoogle(){
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: window.location.origin + '/' }
  });
  if(error){ toast('Erro: '+error.message); }
}

async function logout(){
  await supabase.auth.signOut();
  await updateAuthUI();
  toast('Você saiu.');
}

// --- Credits --- //
function setBalance(b){ const el=$('#balance'); if(el) el.textContent = b===null||b===undefined?'—':fmt(b); }

async function refreshBalance(){
  const token = await getAccessToken();
  if(!token){ setBalance('—'); return; }
  const r = await fetch(API_BASE + '/api/credits', {
    headers: { Authorization: 'Bearer ' + token }
  });
  const j = await r.json().catch(()=>({}));
  setBalance(j.balance ?? '—');
}

// --- Spend (used by search demo) --- //
let lastSearchRef = null;
async function spendOneForSearch(){
  const token = await getAccessToken();
  if(!token){ toast('Entre para pesquisar'); return false; }
  lastSearchRef = 'search_' + Date.now();
  const body = { amount: 1, ref: lastSearchRef, reason: 'search' };
  const r = await fetch(API_BASE + '/api/credits/spend', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: 'Bearer '+token },
    body: JSON.stringify(body)
  });
  const j = await r.json();
  if(!j.success){
    if(j.message==='insufficient_balance'){
      toast('Sem créditos suficientes.'); return false;
    }
    toast('Não foi possível reservar 1 crédito: ' + j.message);
    return false;
  }
  await refreshBalance();
  return true;
}

// --- Search demo (replace doYourSearch with your real search) --- //
async function doYourSearch(q){
  // Placeholder: simulate 1-3 results after 900ms
  await new Promise(r=>setTimeout(r,900));
  return [
    {title: `Oferta para ${q.dest || 'qualquer lugar'}`, price: Math.floor(20+Math.random()*20)},
    {title: 'Outra opção interessante', price: Math.floor(22+Math.random()*22)},
    {title: 'Flexível e barato', price: Math.floor(18+Math.random()*25)},
  ];
}

async function onSearch(e){
  e?.preventDefault();
  const ok = await spendOneForSearch();
  if(!ok) return;
  const q = {
    origin: $('#origin').value.trim(),
    dest: $('#dest').value.trim(),
    when: $('#when').value.trim(),
    pax: $('#pax').value
  };
  try {
    const results = await doYourSearch(q);
    const list = $('#results');
    if(list){ list.innerHTML=''; results.forEach(r=>{
      const li = document.createElement('li');
      li.className='card';
      li.innerHTML = `<div class="row"><div>${r.title}</div><strong>${fmt(r.price)} créditos</strong></div>`;
      list.appendChild(li);
    }); }
    toast('Busca finalizada!');
  } catch (err) {
    // Try refund if failed
    const token = await getAccessToken();
    if(token && lastSearchRef){
      await fetch(API_BASE + '/api/credits/refund', {
        method:'POST',
        headers:{ 'Content-Type':'application/json', Authorization:'Bearer '+token },
        body: JSON.stringify({ ref: lastSearchRef, reason:'search_failed' })
      });
      await refreshBalance();
      toast('Erro na busca. Crédito devolvido.');
    }
  }
}

// --- Buy credits --- //
async function startCheckout(plan){
  const token = await getAccessToken();
  if(!token){ toast('Entre para comprar créditos'); return; }
  const r = await fetch(API_BASE + '/api/stripe/create-checkout-session', {
    method:'POST',
    headers:{ 'Content-Type':'application/json', Authorization:'Bearer '+token },
    body: JSON.stringify({ plan, quantity: 1 })
  });
  const j = await r.json();
  if(j.url){ window.location.href = j.url; }
  else { toast(j.error || 'Falha ao iniciar checkout'); }
}

// --- History --- //
async function loadHistory(){
  const token = await getAccessToken();
  if(!token) return;
  const r = await fetch(API_BASE + '/api/credits/history?limit=30', {
    headers:{ Authorization:'Bearer '+token }
  });
  const j = await r.json();
  const list = $('#history');
  if(list && Array.isArray(j.items)){
    list.innerHTML = '';
    j.items.forEach(it=>{
      const li = document.createElement('li');
      const delta = Number(it.delta);
      const sign = delta >= 0 ? '+' : '−';
      const val = Math.abs(delta);
      const reason = it.reason || '';
      const when = new Date(it.created_at).toLocaleString('pt-BR');
      li.className = 'card';
      li.innerHTML = `<div class="row">
        <div><strong>${reason}</strong><br><small>${when}</small></div>
        <div class="${delta>=0?'green':'red'}">${sign}${fmt(val)}</div>
      </div>`;
      list.appendChild(li);
    });
  }
}

// --- Init on pages --- //
window.Front = {
  updateAuthUI, loginWithEmail, loginWithGoogle, logout,
  refreshBalance, onSearch, startCheckout, loadHistory
};

document.addEventListener('DOMContentLoaded', () => {
  // wire events if elements exist
  $('#login-email-btn')?.addEventListener('click', loginWithEmail);
  $('#login-google-btn')?.addEventListener('click', loginWithGoogle);
  $('#logout-btn')?.addEventListener('click', logout);
  $('#search-form')?.addEventListener('submit', onSearch);
  $all('[data-plan]')?.forEach(btn => btn.addEventListener('click', () => startCheckout(btn.dataset.plan)));
  updateAuthUI();
  if($('#history')) loadHistory();
});
