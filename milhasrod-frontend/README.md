# Milhas do Rod — Frontend (estático)

Pronto para subir no Lovable / Vercel e integrar com seu backend existente.

## 1) Configure

Edite `js/config.js`:

```js
window.APP_CONFIG = {
  API_BASE: '', // '' se o frontend estiver no MESMO domínio do backend
  // ou coloque a URL do backend: 'https://milhasrod.vercel.app'
  SUPABASE_URL: 'https://SEU_PROJETO.supabase.co',
  SUPABASE_ANON_KEY: 'SUA_ANON_KEY'
};
```

Se o backend estiver em outro domínio, também ajuste no backend `success_url` / `cancel_url` do Stripe para apontar para `https://SEU_FRONT/success.html` e `cancel.html`.

## 2) Publicar

- Faça upload desta pasta no Lovable / Vercel.
- Não precisa de build; são arquivos estáticos.

## 3) O que já faz

- Entrar com **Google** ou **link por e-mail** (Supabase).
- Mostrar **saldo** atual.
- **Comprar créditos** (chama `/api/stripe/create-checkout-session`).
- **Gastar 1 crédito** numa busca (demo).
- Mostrar **Extrato** (lista do ledger).

## 4) Páginas

- `index.html` — home + buscar (usa 1 crédito; se sua busca real existir, substitua `doYourSearch` em `js/app.js`).
- `credits.html` — escolher plano e abrir checkout (planos `PRICE_5`, `PRICE_20`, `PRICE_100`, `PRICE_UNLIMITED`).
- `history.html` — extrato do usuário.
- `success.html` / `cancel.html` — pós-checkout.
- `auth/callback.html` — página de retorno do login por e-mail / OAuth.

## 5) Endpoints esperados no backend

- `GET /api/credits` → `{ balance }`
- `POST /api/credits/spend` → body `{ amount, ref, reason }`
- `POST /api/stripe/create-checkout-session` → body `{ plan, quantity }` → `{ url }`
- `GET /api/credits/history?limit=30` → `{ items: [...] }`
- (opcional) `POST /api/credits/refund`

Tudo com `Authorization: Bearer <access_token>` do Supabase.
