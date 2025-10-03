# MilhasRod — Buscador de passagens por milhas

Aplicação React com Vite e Tailwind pronta para publicar no Lovable ou Vercel. Ela consome o backend disponível em `https://milhasrod.vercel.app` (ou outro domínio configurado via variável de ambiente) e integra a autenticação com Supabase.

## Configuração

Crie um arquivo `.env` (ou configure as variáveis na plataforma de hospedagem) com:

```
VITE_API_BASE_URL=https://milhasrod.vercel.app
VITE_SUPABASE_URL=https://SEU-PROJETO.supabase.co
VITE_SUPABASE_ANON_KEY=SEU_ANON_KEY
VITE_SUPABASE_REDIRECT_URL=https://SEU-DOMINIO/auth/callback
```

> O `VITE_API_BASE_URL` é opcional — se não for definido, o frontend usa `https://milhasrod.vercel.app` por padrão.

## Scripts

```bash
pnpm install
pnpm dev       # ambiente local
pnpm build     # gera os arquivos para deploy
pnpm preview   # pré-visualiza o build
```

## Principais recursos

- Busca por origem/destino com autocomplete (debounce de 300 ms).
- Ajuste de data inicial, intervalo de dias e seleção de cabines.
- Seleção múltipla de programas de fidelidade (chips) e atalhos para aeroportos populares.
- Grid de resultados por dia com destaque para o menor custo do período e filtro rápido para Business/First.
- Página de detalhes com lista de trips/segmentos carregados a partir do `availability_id`.
- Opção de login (email/senha ou Google) usando Supabase, com recuperação de créditos do backend.
- Toasts de feedback para erros e estados vazios amigáveis.

## Integração com o backend

Endpoints utilizados:

- `GET /api/search?origin=...&destination=...&start_date=...&days_to_search=...&sources=...&cabins=...`
- `GET /api/trips?id=<availability_id>`
- `GET /api/airports?q=<termo>`
- (autenticado) `GET /api/credits`

Para as rotas autenticadas, o token do Supabase é enviado automaticamente no header `Authorization`.

## Deploy no Lovable / Vercel

1. Configure as variáveis de ambiente listadas acima.
2. Faça o deploy via `pnpm build` ou utilize o modo estático do Lovable apontando para a pasta `dist` gerada pelo Vite.
3. Garanta que o redirect do Supabase (`Authentication → URL Configuration`) aponte para `VITE_SUPABASE_REDIRECT_URL`.

Pronto! A interface estará disponível com todas as funcionalidades descritas na especificação.
