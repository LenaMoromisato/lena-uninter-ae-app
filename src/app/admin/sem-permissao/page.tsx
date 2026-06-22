import { Button } from '@shadcn/ui/button';
import { NavLink } from '@ui/nav-link';

export default function AdminUnauthorizedPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-6 text-center">
      <h1 className="text-2xl font-semibold">Acesso restrito</h1>
      <p className="max-w-md text-sm text-muted-foreground">
        Sua conta nao possui permissoes administrativas. Entre em contato com uma
        administradora se acredita que isso e um erro.
      </p>
      <Button asChild>
        <NavLink href="/app">Voltar ao app</NavLink>
      </Button>
    </div>
  );
}
