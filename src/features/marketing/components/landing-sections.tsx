import { APP_NAME, APP_TAGLINE } from '@core/constants/app';
import { Button } from '@shadcn/ui/button';
import { NavLink } from '@ui/nav-link';

export function LandingHero() {
  return (
    <section className="mx-auto flex max-w-5xl flex-col items-center gap-6 px-4 py-16 text-center md:py-24">
      <p className="rounded-full border px-3 py-1 text-xs text-muted-foreground">
        {APP_NAME} · {APP_TAGLINE}
      </p>
      <h1 className="max-w-3xl text-4xl font-bold tracking-tight md:text-5xl">
        Conecte-se com mentoras e acelere sua carreira em tech
      </h1>
      <p className="max-w-2xl text-lg text-muted-foreground">
        Plataforma online para alunas encontrarem mentoras, solicitar mentoria e conversar em um
        ambiente acolhedor.
      </p>
      <div className="flex flex-wrap justify-center gap-3">
        <Button asChild size="lg">
          <NavLink href="/cadastro">Comecar agora</NavLink>
        </Button>
        <Button asChild variant="outline" size="lg">
          <NavLink href="/entrar">Ja tenho conta</NavLink>
        </Button>
      </div>
    </section>
  );
}

export function LandingHowItWorks() {
  const steps = [
    { title: 'Crie seu perfil', description: 'Cadastre-se como aluna ou mentora e conte sua trajetoria.' },
    { title: 'Descubra mentoras', description: 'Busque por area, linguagens e experiencia.' },
    { title: 'Solicite mentoria', description: 'Envie uma mensagem e aguarde a resposta da mentora.' },
    { title: 'Converse e evolua', description: 'Troque mensagens e participe de eventos da comunidade.' },
  ];

  return (
    <section className="border-t bg-muted/30 py-16">
      <div className="mx-auto max-w-5xl px-4">
        <h2 className="mb-8 text-center text-2xl font-semibold">Como funciona</h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, index) => (
            <div key={step.title} className="rounded-xl border bg-background p-5">
              <p className="mb-2 text-sm font-medium text-primary">Passo {index + 1}</p>
              <h3 className="font-semibold">{step.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
