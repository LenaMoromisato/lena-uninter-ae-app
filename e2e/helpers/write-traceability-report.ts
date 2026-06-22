import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const e2eDir = path.dirname(fileURLToPath(import.meta.url));

const content = `# Rastreabilidade E2E — RF / RNF

Gerado automaticamente após \`pnpm e2e\`.

## Specs × Requisitos

| Spec | RF | RNF |
|------|----|-----|
| public-pages.spec.ts | — | RNF03, RNF05 |
| auth-ui.spec.ts | RF01, RF02 | RNF03, RNF04 |
| app-pages.spec.ts | RF03–RF08 | RNF03, RNF05, RNF08 |
| admin-pages.spec.ts | extensão RBAC | RNF01, RNF06 |
| swagger.spec.ts | — | RNF07 |
| mvp-journey.spec.ts | RF01–RF08 | RNF01–RNF08 |
| capture-all-screenshots.spec.ts | evidência visual | RNF03–RNF07 |

## RF01–RF08 (mvp-journey)

| ID | Coberto em mvp-journey |
|----|------------------------|
| RF01 | Tela /cadastro + registerViaApi |
| RF02 | Login UI /entrar |
| RF03 | /app/perfil — Salvar perfil |
| RF04 | /app/descobrir — perfil da mentora |
| RF05 | Filtro busca por nome |
| RF06 | Enviar solicitacao de mentoria |
| RF07 | Mentora aceita em /app/mentorias |
| RF08 | Mensagens + reload persistente |

## RNF01–RNF08

| ID | Evidência E2E |
|----|---------------|
| RNF01 | Login JWT; admin RBAC specs |
| RNF02 | Fluxo completo sem erro de validação |
| RNF03 | Navegação /app, formulários |
| RNF04 | Labels #email, toasts de sucesso |
| RNF05 | Viewport 1920×1080 screenshots |
| RNF06 | Admin + API documentada |
| RNF07 | swagger.spec.ts + /api/docs no demo |
| RNF08 | mvp-journey persistência após reload |
`;

export function writeTraceabilityReport() {
  const outDir = path.join(e2eDir, 'output');
  mkdirSync(outDir, { recursive: true });
  writeFileSync(path.join(outDir, 'rastreabilidade-rf-rnf.md'), content, 'utf8');
}
