# AGENTS.md

## Objetivo

Este documento define regras operacionais para agentes, LLMs e assistentes de código atuando neste repositório.

Ele deve ser tratado como uma instrução prática de implementação.

Para orientação humana de contribuição, consulte:

```txt
CONTRIBUTING.md
```

---

## Prioridades

Ao criar ou modificar código, siga esta ordem de prioridade:

1. Preservar os limites arquiteturais do projeto.
2. Manter páginas, layouts e rotas o mais finos possível.
3. Manter regras de domínio dentro da feature correspondente.
4. Não editar arquivos em `src/shadcn/*`.
5. Preferir mudanças pequenas, claras e fáceis de revisar.
6. Seguir padrões existentes quando eles não conflitarem com este documento.
7. Evitar abstrações prematuras.

---

## Estrutura principal

A estrutura base esperada é:

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

---

## Responsabilidades das pastas

### `src/app`

Camada de rotas e composição do Next.js.

Use para:

- páginas;
- layouts;
- route handlers;
- arquivos `loading.tsx`;
- arquivos `error.tsx`;
- arquivos `not-found.tsx`;
- metadados e composição de rota.

Regras:

- arquivos em `app` devem ser finos;
- não colocar regra de negócio complexa diretamente em páginas;
- compor telas a partir de `features`;
- delegar componentes reutilizáveis para `ui`;
- delegar infraestrutura compartilhada para `core`.

---

### `src/features`

Camada de produto e domínio.

Cada feature deve viver em:

```txt
src/features/<nome-da-feature>/
```

Exemplos:

```txt
src/features/auth/
src/features/dashboard/
src/features/user-profile/
```

Uma feature pode conter:

```txt
api/
components/
constants/
contexts/
dto/
enums/
hooks/
models/
server/
stores/
utils/
```

Regras:

- criar apenas as pastas necessárias;
- não criar estrutura vazia preventivamente;
- manter lógica específica da feature dentro da própria feature;
- evitar importação direta entre features.

---

### `src/core`

Camada técnica compartilhada.

Use para código realmente transversal, como:

- infraestrutura de API;
- clientes configurados;
- adapters;
- providers globais;
- hooks genéricos;
- constantes globais;
- utilitários realmente compartilhados.

Sugestão de estrutura:

```txt
src/core/
  api/
  constants/
  hooks/
  lib/
  providers/
  utils/
```

Regras:

- `core` não deve importar `app`;
- `core` não deve importar `features`;
- `core` não deve depender de regras de produto;
- não mover código para `core` apenas porque ele “parece genérico”.

---

### `src/ui`

Camada de componentes visuais reutilizáveis.

Use para:

- componentes visuais compartilhados;
- wrappers de componentes `shadcn`;
- componentes de design system interno;
- composição visual sem regra de negócio específica.

Regras:

- `ui` não deve importar `features`;
- componentes em `ui` não devem conhecer regras de produto;
- se o componente for específico de uma feature, mantenha em `src/features/<feature>/components`.

---

### `src/shadcn`

Camada de componentes-base do `shadcn/ui`.

Regra obrigatória:

```txt
Nunca editar arquivos em src/shadcn/*
```

Quando precisar adaptar um componente:

1. tente composição no ponto de uso;
2. crie um wrapper em `src/ui`;
3. crie um novo componente em `src/ui`, se wrapper não for suficiente.

Quando a decisão não for óbvia, documente o racional:

```ts
/**
 * Rationale: <necessidade do produto>, <limitação do shadcn>, <decisão tomada>.
 */
```

---

### `src/assets`

Use para assets estáticos:

- imagens;
- ícones;
- fontes;
- mocks visuais;
- arquivos estáticos usados pela interface.

---

### `src/styles`

Use para estilos globais:

- CSS global;
- tokens;
- variáveis CSS;
- temas;
- configurações globais de estilo.

---

## Limites de dependência

Fluxo permitido:

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

Regras obrigatórias:

- `core` não importa `app`;
- `core` não importa `features`;
- `ui` não importa `features`;
- uma feature não deve importar outra feature diretamente;
- Client Components não devem importar código server-only;
- `src/shadcn/*` não deve ser editado.

Quando duas features precisarem compartilhar comportamento, prefira:

- compor as duas no nível de `app`;
- extrair utilitário realmente genérico para `core`;
- extrair componente visual realmente genérico para `ui`;
- manter duplicação temporária se a abstração ainda não estiver clara.

---

## Convenções de arquivos

- Use TypeScript.
- Use `.ts` para arquivos sem JSX.
- Use `.tsx` para componentes React ou arquivos com JSX.
- Use `kebab-case` para arquivos e pastas.
- Use nomes claros e descritivos.
- Evite abreviações ambíguas.
- Use named exports por padrão.
- Use default exports apenas quando exigido pelo framework ou biblioteca.

Exemplos:

```txt
user-profile-card.tsx
use-user-profile.ts
get-user-profile.ts
user-profile.dto.ts
```

---

## Organização de uma feature

Exemplo:

```txt
src/features/user-profile/
  api/
    get-user-profile.ts
    update-user-profile.ts
  components/
    user-profile-card.tsx
    user-profile-form.tsx
    user-profile-screen.tsx
  dto/
    user-profile.dto.ts
  hooks/
    use-user-profile.ts
    use-update-user-profile.ts
  models/
    user-profile.ts
  server/
    get-user-session.ts
  utils/
    format-user-display-name.ts
```

### `api`

Chamadas de API específicas da feature.

Regras:

- manter foco em transporte de dados;
- evitar regra de negócio complexa;
- retornar dados tipados;
- usar DTOs quando aplicável.

### `components`

Componentes específicos da feature.

Regras:

- podem conhecer o domínio da feature;
- não devem ser usados diretamente por outras features;
- se ficarem genéricos, mover para `src/ui`.

### `hooks`

Hooks específicos da feature.

Use para:

- queries;
- mutations;
- composição de estado;
- comportamento específico de UI;
- integração entre API e componentes da feature.

### `dto`

Contratos de dados externos.

Use para:

- payloads de API;
- formulários;
- parâmetros externos;
- integrações;
- webhooks.

Preferência:

```txt
zod
```

### `models`

Tipos internos da feature.

Use para representar dados no formato usado pela aplicação.

### `server`

Código exclusivo de servidor.

Use para:

- server actions;
- route handlers específicos;
- acesso a secrets;
- variáveis de ambiente privadas;
- cookies e headers server-side;
- SDKs server-only.

Regra:

```txt
Nada em server pode ser importado diretamente por Client Components.
```

### `stores`

Estado compartilhado específico da feature.

Use apenas quando estado local, props, contextos ou query cache não forem suficientes.

Preferência:

```txt
Nano Stores
```

### `utils`

Funções auxiliares específicas da feature.

Se um utilitário passar a ser usado por múltiplas features e não carregar domínio específico, avalie mover para `src/core/utils`.

---

## Organização de `core`

### `core/api`

Infraestrutura compartilhada de API.

Exemplos:

```txt
src/core/api/http-client.ts
src/core/api/api-error.ts
```

### `core/lib`

Adapters, clientes configurados e integrações técnicas.

Exemplos:

```txt
src/core/lib/query-client.ts
src/core/lib/supabase-client.ts
src/core/lib/date-adapter.ts
```

### `core/utils`

Funções pequenas, puras e genéricas.

Exemplos:

```txt
src/core/utils/format-currency.ts
src/core/utils/slugify.ts
src/core/utils/clamp.ts
```

### `core/hooks`

Hooks realmente compartilhados e sem domínio de produto.

Exemplos:

```txt
src/core/hooks/use-media-query.ts
src/core/hooks/use-mounted.ts
```

### `core/providers`

Providers globais.

Exemplos:

```txt
src/core/providers/query-provider.tsx
src/core/providers/theme-provider.tsx
```

---

## Matriz de decisão

| Caso | Local recomendado |
|---|---|
| Página ou rota Next.js | `src/app` |
| Layout de rota | `src/app` |
| Componente visual genérico | `src/ui` |
| Wrapper de `shadcn` | `src/ui` |
| Componente específico de feature | `src/features/<feature>/components` |
| Hook específico de feature | `src/features/<feature>/hooks` |
| Hook genérico compartilhado | `src/core/hooks` |
| Chamada de API da feature | `src/features/<feature>/api` |
| Cliente HTTP global | `src/core/api` ou `src/core/lib` |
| Schema de payload externo | `src/features/<feature>/dto` |
| Tipo interno da feature | `src/features/<feature>/models` |
| Utilitário específico | `src/features/<feature>/utils` |
| Utilitário compartilhado | `src/core/utils` |
| Código server-only da feature | `src/features/<feature>/server` |
| Provider global | `src/core/providers` |
| Asset estático | `src/assets` |
| Estilo global | `src/styles` |

---

## Regras de implementação

- Evite componentes grandes com muitas responsabilidades.
- Prefira composição.
- Evite lógica de negócio diretamente em componentes visuais.
- Evite duplicação quando o reuso for claro.
- Evite abstrações prematuras.
- Evite acoplamento direto entre features.
- Evite modificar código-base de bibliotecas ou componentes gerados.
- Prefira contratos explícitos entre módulos.
- Prefira código simples, legível e fácil de revisar.
- Use comentários para explicar racional, exceções e decisões não óbvias.
- Não adicione JSDoc mecânico em código autoexplicativo.

---

## Exceções arquiteturais

Evite exceções às regras deste documento.

Quando uma exceção for realmente necessária:

- documente o motivo;
- limite o escopo;
- prefira uma solução reversível;
- registre o racional no PR ou em documentação técnica;
- evite transformar a exceção em padrão.

---

## Enforcement

Modo atual: pragmático e preventivo.

Em código novo:

- não violar limites entre camadas;
- não importar uma feature dentro de outra;
- não importar código server-only em Client Components;
- não editar `src/shadcn/*`;
- não mover código para `core` sem necessidade real;
- não criar abstrações sem uso concreto;
- não criar estrutura de pastas vazia por antecipação.

Violações claras em código novo devem ser bloqueadas.

Exceções só devem ser aceitas quando:

- forem necessárias para concluir a tarefa;
- tiverem escopo pequeno;
- forem justificadas de forma objetiva;
- forem documentadas no código, PR ou documentação técnica;
- não criarem um padrão indesejado para novas implementações.

Quando houver conflito entre conveniência imediata e arquitetura-alvo, priorize a arquitetura-alvo ou documente claramente a exceção.

---

## Validação

Não execute comandos amplos de lint, teste ou build automaticamente sem necessidade.

Prefira validações focadas:

```txt
pnpm typecheck
pnpm lint
pnpm test
```

Quando possível, valide apenas o escopo alterado.

Se uma validação relevante não for feita, informe isso ao finalizar.

---

## Antes de implementar

Verifique:

- Onde este código deve viver?
- Este código pertence a uma feature?
- Este código é realmente compartilhado?
- Há dependência proibida entre camadas?
- Há risco de importar código server-only no client?
- É necessário criar uma nova abstração?
- Existe padrão semelhante no projeto?
- A necessidade exige wrapper em `ui` ou componente específico da feature?

---

## Antes de finalizar

Verifique:

- A página em `app` ficou fina?
- O domínio ficou encapsulado em `features/<feature>`?
- Código compartilhado foi para `core` apenas quando necessário?
- Componentes reutilizáveis foram para `ui`?
- Componentes específicos permaneceram dentro da feature?
- `src/shadcn/*` permaneceu intocado?
- Nenhuma feature importou outra feature diretamente?
- Nenhum código server-only vazou para Client Components?
- Exceções foram documentadas?
- Validações relevantes foram feitas ou mencionadas?
