# E2E — TechSisters (Playwright)

Suite de testes end-to-end para seed, validação funcional (RF01–RF08), screenshots de todas as telas, vídeo da jornada MVP e Swagger.

## Pré-requisitos

1. `.env` na raiz com `DATABASE_URL`, `NEXT_PUBLIC_SUPABASE_*`, `SUPABASE_SERVICE_ROLE_KEY`, `NEXT_PUBLIC_COOKIE_PREFIX`
2. RBAC seedado: `pnpm db:push && pnpm db:seed`
3. Chromium: `pnpm e2e:install`

Opcional: copie `e2e/.env.example` para `e2e/.env` e ajuste credenciais E2E.

## Comandos

| Comando | Descrição |
|---------|-----------|
| `pnpm e2e:seed` | Cria usuários e dados E2E (`e2e/.seed-state.json`) |
| `pnpm e2e:clean` | Remove relatórios/traces/vídeos corrompidos de execuções anteriores |
| `pnpm e2e` | Suite completa (headless) |
| `pnpm e2e:ui` | Playwright UI — debug (`setup` + `chromium` apenas) |
| `pnpm e2e:ui:all` | UI mode com todos os projetos (vídeo + screenshots) |
| `pnpm e2e:screenshots` | Captura PNG de todas as telas (headless, sem Playwright UI) |
| `pnpm e2e:demo` | Vídeo da jornada funcional RF01–RF08 (cadastro → mentoria → chat → Swagger) |
| `pnpm e2e:video` | Vídeo único percorrendo **todas** as telas (público, app, admin, API) |
| `pnpm e2e:video:headed` | Igual ao anterior, com browser visível durante a gravação |
| `pnpm e2e:report` | Abre relatório HTML |

O projeto **`setup`** roda o seed e grava `e2e/.auth/*.json` via API (sem browser — evita erros de stream no UI mode).

## Modo UI (`pnpm e2e:ui`)

O script `e2e:ui` **limpa artefatos antigos** e define `PLAYWRIGHT_TRACING_NO_WEBSOCKET_FRAMES=1` (workaround oficial para ZIP/trace truncado no UI mode).

Fluxo recomendado:

```bash
pnpm db:seed
pnpm e2e:install
pnpm dev:e2e            # terminal 1 — use dev:e2e, NÃO pnpm dev (Turbopack quebra Swagger)
E2E_USE_EXTERNAL_SERVER=1 pnpm e2e:ui   # terminal 2
```

Se **não** subir o dev manualmente, o Playwright inicia `pnpm dev:e2e` automaticamente (Webpack).

**Importante:** se `pnpm dev` (Turbopack) estiver na porta 3000, pare-o e use `pnpm dev:e2e` — respostas truncadas do Turbopack também causam `file data stream has unexpected number of bytes` no UI.

No UI mode:

- Rode primeiro o projeto **`setup`** (aparece na lista) ou use **Run all** — garante `e2e/.seed-state.json`.
- Use **`chromium`** para specs funcionais (auth, app, admin, swagger).
- Use **`demo-video`** para depurar a jornada RF01–RF08 (grava vídeo).
- Use **`screenshots`** só para regenerar PNGs.
- Se você já tem `pnpm dev` (Turbopack) na porta 3000, pare-o ou use `pnpm dev:e2e` — caso contrário o Swagger falha no browser e o UI mostra erros em `/api/docs`.
- Evite `E2E_SKIP_SEED=1` sem ter rodado `pnpm e2e:seed` antes.
- Se login redirecionar para `/entrar`, confira `NEXT_PUBLIC_COOKIE_PREFIX` no `.env` (chave: `{prefix}.techsisters.session`).

### Erro `apiRequestContext` / ZIP truncado no UI mode

Sintomas:

- `file data stream has unexpected number of bytes`
- `End of central directory record signature not found`

Causas comuns:

1. Traces/ZIPs de execução anterior interrompida (Ctrl+C no UI)
2. Bug do Playwright UI ao serializar traces ao vivo (Node 24+)
3. `pnpm dev` (Turbopack) na porta 3000 em vez de `pnpm dev:e2e`

Correção:

1. Feche o Playwright UI completamente
2. Rode `pnpm e2e:clean` (ou só `pnpm e2e:ui`, que já limpa antes de abrir)
3. Suba **`pnpm dev:e2e`** no terminal 1
4. Abra de novo: `E2E_USE_EXTERNAL_SERVER=1 pnpm e2e:ui`

O script `e2e:ui` já aplica `PLAYWRIGHT_TRACING_NO_WEBSOCKET_FRAMES=1` e desliga reporter HTML/trace no UI mode.

Evite parar testes no meio; use **Stop** no UI e aguarde finalizar antes de reexecutar.

### Erro `Router action dispatched before initialization`

Erro do **Next.js App Router** quando a navegação ocorre antes da hidratação (comum no UI mode com navegação rápida). Correções no projeto:

- Guards (`SessionGuard`, `PermissionGuard`) adiam `router.replace`
- E2E aguarda rota estabilizar após `goto` em `/app` e `/admin`
- Use **`pnpm dev:e2e`** (Webpack), não `pnpm dev` (Turbopack)

## Artefatos gerados

| Caminho | Conteúdo |
|---------|----------|
| `e2e/output/screenshots/` | PNG 1920×1080 (viewport) por rota |
| `e2e/output/videos/` | Vídeo consolidado do tour (`platform-tour.webm`) |
| `e2e/output/test-results/` | Vídeos brutos do Playwright (projeto `demo-video`) |
| `e2e/output/report/` | Relatório HTML |
| `e2e/.seed-state.json` | IDs dinâmicos (userId, conversationId, etc.) |
| `e2e/output/rastreabilidade-rf-rnf.md` | Matriz spec → RF/RNF (gerado após `pnpm e2e`) |

## Rastreabilidade RF / RNF

Matriz de cobertura dos requisitos funcionais (RF01–RF08) e não funcionais (RNF) pelos testes E2E.

| Spec | RF | RNF |
|------|----|-----|
| `public-pages.spec.ts` | — | RNF03, RNF05 |
| `auth-ui.spec.ts` | RF01, RF02 | RNF03, RNF04 |
| `app-pages.spec.ts` | RF03–RF08 | RNF03, RNF05, RNF08 |
| `admin-pages.spec.ts` | extensão RBAC | RNF01, RNF06 |
| `swagger.spec.ts` | — | RNF07 |
| `mvp-journey.spec.ts` | RF01–RF08 | RNF01–RNF08 |
| `capture-all-screenshots.spec.ts` | evidência visual | RNF03–RNF07 |

## Credenciais padrão (seed)

| Papel | E-mail | Senha |
|-------|--------|-------|
| STUDENT | `e2e-student@test.local` | `E2eStudent123!` |
| MENTOR | `e2e-mentor@test.local` | `E2eMentor123!` |
| SUPER_ADMIN | `e2e-admin@test.local` | `E2eAdmin123!` |

## Fluxo recomendado para evidências do TCC

```bash
pnpm db:seed
pnpm e2e:install
pnpm e2e:screenshots   # headless — PNGs em e2e/output/screenshots/
pnpm e2e:video         # tour completo → e2e/output/videos/platform-tour.webm
pnpm e2e:demo          # jornada RF01–RF08 → e2e/output/test-results/.../video.webm
```

### Vídeos — qual comando usar?

| Objetivo | Comando | Saída |
|----------|---------|-------|
| **Todas as telas** em um único vídeo (público, estudante, mentora, admin, Swagger) | `pnpm e2e:video` | `e2e/output/videos/platform-tour.webm` |
| **Fluxo funcional** RF01–RF08 (cadastro, mentoria, conversa) | `pnpm e2e:demo` | `e2e/output/test-results/.../video.webm` |
| Ver o browser enquanto grava o tour | `pnpm e2e:video:headed` | idem `e2e:video` |

Resolução do vídeo: **1280×720**. Duração típica do tour completo: ~3–5 min.

O badge **Open Next.js Dev Tools** fica oculto nas capturas: `dev:e2e` define `E2E_DEV=1` (desliga `devIndicators`) e o helper de screenshot remove overlays residuais antes do PNG.

Selecione 3–4 prints principais para o PDF (Swagger, Descobrir, Mentorias, Conversas).
