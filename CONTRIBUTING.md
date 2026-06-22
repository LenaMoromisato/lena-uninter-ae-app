# CONTRIBUTING.md

## Objetivo

Este documento orienta pessoas contribuindo neste projeto.

Ele explica onde colocar código novo, quais convenções seguir e quais cuidados tomar antes de abrir ou revisar uma contribuição.

Para regras operacionais de agentes e LLMs e arquitetura do projeto, consulte:

```txt
AGENTS.md
```

---

## Princípios de contribuição

Ao contribuir, priorize:

1. clareza;
2. simplicidade;
3. consistência arquitetural;
4. baixo acoplamento;
5. facilidade de revisão;
6. mudanças pequenas e seguras;
7. previsibilidade para manutenção futura.

Evite aproveitar uma tarefa pequena para fazer refactors amplos ou criar abstrações que ainda não são necessárias.

---

## Estrutura principal

A estrutura base do projeto é:

```txt
src/
  app/
  assets/
  core/
  features/
  shadcn/
  styles/
  ui/
```

Resumo:

| Pasta | Responsabilidade |
|---|---|
| `src/app` | Rotas, layouts e composição do Next.js |
| `src/features` | Domínios e funcionalidades do produto |
| `src/core` | Infraestrutura e código realmente compartilhado |
| `src/ui` | Componentes visuais reutilizáveis |
| `src/shadcn` | Componentes-base do `shadcn/ui`, não editáveis diretamente |
| `src/assets` | Assets estáticos |
| `src/styles` | Estilos globais |

---

## Onde colocar código novo?

### Nova página ou rota

Use:

```txt
src/app
```

A página deve ser fina e delegar a tela para uma feature.

Exemplo:

```tsx
import { DashboardScreen } from '@/features/dashboard/components/dashboard-screen';

export default function DashboardPage() {
  return <DashboardScreen />;
}
```

---

### Nova funcionalidade de produto

Use:

```txt
src/features/<nome-da-feature>
```

Exemplo:

```txt
src/features/notifications/
  api/
  components/
  dto/
  hooks/
  models/
```

Crie apenas as pastas necessárias para a implementação atual.

---

### Novo componente visual reutilizável

Use:

```txt
src/ui
```

Exemplos:

```txt
src/ui/button.tsx
src/ui/empty-state.tsx
src/ui/page-container.tsx
src/ui/confirm-dialog.tsx
```

Componentes em `ui` não devem depender de uma feature específica.

---

### Novo componente específico de uma feature

Use:

```txt
src/features/<nome-da-feature>/components
```

Exemplo:

```txt
src/features/courses/components/course-card.tsx
```

---

### Nova chamada de API específica de uma feature

Use:

```txt
src/features/<nome-da-feature>/api
```

Exemplo:

```txt
src/features/user-profile/api/get-user-profile.ts
```

---

### Novo contrato externo de dados

Use:

```txt
src/features/<nome-da-feature>/dto
```

Preferencialmente com `zod`.

---

### Novo tipo interno de domínio

Use:

```txt
src/features/<nome-da-feature>/models
```

---

### Novo helper específico de uma feature

Use:

```txt
src/features/<nome-da-feature>/utils
```

---

### Novo helper realmente compartilhado

Use:

```txt
src/core/utils
```

Antes de mover algo para `core`, confirme que o código é realmente transversal e não pertence a uma feature específica.

---

### Nova integração técnica compartilhada

Use:

```txt
src/core/lib
```

Exemplos:

```txt
src/core/lib/query-client.ts
src/core/lib/supabase-client.ts
```

---

### Novo provider global

Use:

```txt
src/core/providers
```

Exemplo:

```txt
src/core/providers/query-provider.tsx
```

---

## Convenções de código

- Use TypeScript.
- Use `.ts` para arquivos sem JSX.
- Use `.tsx` para componentes React ou arquivos com JSX.
- Use `kebab-case` em arquivos e pastas.
- Use nomes claros e descritivos.
- Evite abreviações ambíguas.
- Use named exports por padrão.
- Use default exports apenas quando o framework ou biblioteca exigir.

Exemplos:

```txt
user-profile-card.tsx
use-user-profile.ts
get-user-profile.ts
user-profile.dto.ts
```

---

## Limites de dependência

Fluxo esperado:

```txt
app
 ├─ features
 ├─ ui
 └─ core

features
 ├─ ui
 └─ core

ui
 └─ core

core
```

Regras:

- `core` não importa `features`.
- `core` não importa `app`.
- `ui` não importa `features`.
- Uma feature não deve importar outra feature diretamente.
- Código server-only não deve ser importado em Client Components.
- `src/shadcn/*` não deve ser editado diretamente.

---

## Política para `shadcn`

A pasta `src/shadcn` é considerada base imutável.

Não altere diretamente:

```txt
src/shadcn/*
```

Quando precisar customizar:

1. tente composição no ponto de uso;
2. crie um wrapper em `src/ui`;
3. crie um componente novo em `src/ui`, se necessário;
4. documente o racional quando a decisão não for óbvia.

Exemplo de comentário:

```ts
/**
 * Rationale: precisamos de um comportamento específico de produto,
 * o componente base do shadcn não cobre esse caso com composição simples,
 * então criamos um wrapper em ui para preservar a base.
 */
```

---

## Server e client

Código que usa secrets, variáveis privadas, cookies server-side, headers server-side ou SDKs server-only deve ficar em local server-only.

Exemplos:

```txt
src/features/<nome-da-feature>/server
src/app/api/.../route.ts
```

Nunca importe esse código diretamente em Client Components.

Quando o client precisar acessar dados processados no servidor, use uma fronteira segura:

- route handler;
- server action;
- API;
- DTO validado;
- função pública sem acesso a secrets.

---

## Estado

Prefira esta ordem:

1. estado local;
2. props;
3. query/cache para dados remotos;
4. contextos com escopo claro;
5. store quando houver necessidade real de estado compartilhado.

Use stores com moderação.

Quando necessário, a preferência é:

```txt
Nano Stores
```

---

## DTOs e models

Use `dto` para formatos externos.

Exemplos:

- payload de API;
- payload de formulário;
- resposta de integração;
- parâmetros externos.

Use `models` para representações internas da aplicação.

Essa separação permite adaptar dados externos para um formato mais adequado ao domínio e à UI.

---

## Exceções arquiteturais

Exceções devem ser raras.

Quando uma exceção for necessária:

- registre o motivo;
- limite o escopo;
- explique o impacto;
- prefira uma solução reversível;
- não transforme a exceção em padrão sem discussão.

---

## Enforcement arquitetural

Este projeto usa enforcement pragmático e preventivo.

Durante revisão, violações claras em código novo devem ser bloqueadas, especialmente:

- importação direta entre features;
- código server-only usado no client;
- alteração direta de `src/shadcn/*`;
- lógica de domínio em páginas de `app`;
- componentes genéricos dependendo de features;
- código movido para `core` sem necessidade real;
- abstrações criadas sem uso concreto;
- estruturas de pastas criadas preventivamente sem necessidade atual.

Exceções devem ser raras, justificadas, localizadas e documentadas.

Quando houver conflito entre conveniência imediata e arquitetura-alvo, a arquitetura-alvo deve prevalecer, salvo exceção objetiva e registrada.

---

## Documentação

Decisões de arquitetura, limites entre camadas e convenções de código estão descritas em `AGENTS.md` e neste arquivo. O `README.md` na raiz cobre setup, stack e comandos do projeto.

---

## Checklist antes de abrir PR

Antes de abrir um PR, verifique:

- A mudança é pequena o bastante para revisar?
- O código está na pasta correta?
- A página em `app` ficou fina?
- A lógica de domínio ficou em `features/<feature>`?
- Código compartilhado foi para `core` apenas quando realmente necessário?
- Componentes reutilizáveis foram para `ui`?
- `src/shadcn/*` permaneceu intocado?
- Não há importação direta entre features?
- Código server-only não foi importado por client?
- Exceções foram documentadas?
- Validações relevantes foram executadas?

---

## Validação

Use validações proporcionais à mudança.

Exemplos:

```txt
pnpm typecheck
pnpm lint
pnpm test
```

Quando possível, prefira validações focadas em vez de comandos amplos.

Se uma validação importante não foi executada, informe isso no PR.

---

## Critérios de revisão

Ao revisar código, observe:

- clareza;
- simplicidade;
- localização correta dos arquivos;
- limites entre camadas;
- acoplamento entre features;
- uso correto de `ui`, `core` e `features`;
- ausência de alterações diretas em `src/shadcn`;
- riscos de server-only no client;
- duplicações desnecessárias;
- abstrações prematuras;
- impacto em manutenção.

---

## Resumo prático

- `app` compõe.
- `features` concentram domínio.
- `ui` concentra componentes visuais reutilizáveis.
- `core` concentra infraestrutura e utilidades realmente compartilhadas.
- `shadcn` não é editado diretamente.
- `docs` guarda documentação datada no padrão `[yyyymmdd]-[nome-do-documento].md`.
- Mudanças devem ser pequenas, claras e fáceis de revisar.
