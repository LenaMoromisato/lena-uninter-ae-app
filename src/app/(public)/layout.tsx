import { APP_NAME, APP_TAGLINE } from '@core/constants/app';
import { Button } from '@shadcn/ui/button';
import { NavLink } from '@ui/nav-link';

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <NavLink href="/" className="text-lg font-semibold">
            {APP_NAME}
          </NavLink>
          <div className="flex items-center gap-2">
            <Button variant="ghost" asChild>
              <NavLink href="/entrar">Entrar</NavLink>
            </Button>
            <Button asChild>
              <NavLink href="/cadastro">Cadastrar</NavLink>
            </Button>
          </div>
        </div>
      </header>
      {children}
      <footer className="border-t py-8 text-center text-sm text-muted-foreground">
        {APP_TAGLINE} · Sao Paulo, SP
      </footer>
    </div>
  );
}
