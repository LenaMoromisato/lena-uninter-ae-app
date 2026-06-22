# TechSisters

**Plataforma web de mentoria em tecnologia para mulheres.**

Projeto desenvolvido no âmbito da disciplina **Atividade Extensionista II — Tecnologia Aplicada à Inclusão Digital (Projeto)**, do curso **CST em Análise e Desenvolvimento de Sistemas (UNINTER)**.

| | |
|---|---|
| **Aluna** | Lena Moromisato |
| **RU** | 4754860 |
| **Repositório** | [`LenaMoromisato/lena-uninter-ae-app`](https://github.com/LenaMoromisato/lena-uninter-ae-app) |

> Este repositório contém o **MVP acadêmico** da plataforma TechSisters: cadastro, perfis, busca de mentoras, solicitação de mentoria, conversas assíncronas, notificações, eventos e área administrativa (RBAC).

---

## Sobre o projeto

O **TechSisters** conecta mentoras e mentoradas na área de tecnologia em um ambiente online seguro. O fluxo principal do MVP:

1. Cadastro e login
2. Perfil com área de atuação e linguagens
3. Busca de mentoras (`/app/descobrir`)
4. Solicitação de mentoria
5. Aceite ou recusa pela mentora
6. Conversas assíncronas após aceite

A gestão do desenvolvimento seguiu o método **Shape Up**, em dois ciclos de quatro semanas, com escopo flexível e apetite fixo.

---

## Stack

| Camada | Tecnologia |
|--------|------------|
| Front-end e API | Next.js 16, React 19, TypeScript |
| Estilo | Tailwind CSS 4, shadcn/ui |
| Autenticação | Supabase Auth (JWT) |
| Banco de dados | PostgreSQL + Prisma |
| Validação | Zod |
| Documentação da API | Swagger UI em [`/api/docs`](/api/docs) |
| Testes E2E | Playwright |

---

## Pré-requisitos

- Node.js 20+
- [pnpm](https://pnpm.io/)
- PostgreSQL acessível (local ou remoto)
- Projeto [Supabase](https://supabase.com/) com Auth habilitado

---

## Configuração local

### 1. Instalar dependências

```bash
pnpm install
```

### 2. Variáveis de ambiente

Crie um arquivo `.env` na raiz do projeto:

```env
DATABASE_URL="postgresql://..."
NEXT_PUBLIC_SUPABASE_URL="https://....supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="..."
SUPABASE_SERVICE_ROLE_KEY="..."

# Opcional — credenciais da super admin criada no seed
SEED_SUPER_ADMIN_EMAIL="admin@example.com"
SEED_SUPER_ADMIN_PASSWORD="..."

# Opcional — prefixo de sessão no localStorage (padrão: techsisters)
NEXT_PUBLIC_COOKIE_PREFIX="techsisters"
```

### 3. Banco de dados e seed

```bash
pnpm db:push    # aplica o schema
pnpm db:seed    # catálogo RBAC + super admin
```

### 4. Subir o servidor

```bash
pnpm dev
```

Acesse [http://localhost:3000](http://localhost:3000).

---

## Comandos úteis

| Comando | Descrição |
|---------|-----------|
| `pnpm dev` | Servidor de desenvolvimento |
| `pnpm build` | Build de produção |
| `pnpm typecheck` | Verificação de tipos TypeScript |
| `pnpm lint` | ESLint |
| `pnpm db:generate` | Gera Prisma Client |
| `pnpm db:push` | Aplica schema ao banco |
| `pnpm db:seed` | Seed RBAC e super admin |
| `pnpm e2e:install` | Instala Chromium (Playwright) |
| `pnpm e2e` | Suite E2E completa |
| `pnpm e2e:screenshots` | Captura prints de todas as telas |
| `pnpm e2e:demo` | Grava vídeo da jornada MVP |

Detalhes dos testes E2E: [`e2e/README.md`](e2e/README.md).

---

## Estrutura do código

```txt
src/
  app/          # rotas Next.js (páginas finas)
  features/     # domínio por feature (auth, mentorship, etc.)
  core/         # infraestrutura compartilhada
  ui/           # componentes visuais reutilizáveis
  shadcn/       # componentes-base (não editar)
```

Regras de arquitetura: [`AGENTS.md`](AGENTS.md) · [`CONTRIBUTING.md`](CONTRIBUTING.md)

---

## API REST

- **Swagger UI:** `/api/docs`
- **OpenAPI JSON:** `/api/v1/openapi.json`

---

## Escopo e limitações

Este é um **MVP acadêmico**, não um produto em produção. Funcionalidades como agendamento de mentorias, videoconferência e piloto com usuárias reais ficam como evolução futura.

---

## Licença

ISC · _&copy; 2026 Lena Moromisato_
