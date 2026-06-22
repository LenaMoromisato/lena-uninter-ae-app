'use client';

import { ApiClientError } from '@core/api/api-client';
import { loginSchema, type LoginInput } from '@features/auth/dto/auth.dto';
import { useSession } from '@features/auth/contexts/session-provider';
import { Button } from '@shadcn/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@shadcn/ui/card';
import { Input } from '@shadcn/ui/input';
import { Label } from '@shadcn/ui/label';
import { zodResolver } from '@hookform/resolvers/zod';
import { deferredRouterPush } from '@features/auth/utils/deferred-router-navigation';
import { NavLink } from '@ui/nav-link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

export function LoginForm() {
  const router = useRouter();
  const { login } = useSession();
  const [submitting, setSubmitting] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = handleSubmit(async (values) => {
    setSubmitting(true);
    try {
      await login(values);
      toast.success('Login realizado com sucesso.');
      deferredRouterPush(router, '/app');
    } catch (error) {
      const message =
        error instanceof ApiClientError ? error.message : 'Nao foi possivel entrar.';
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  });

  return (
    <Card className="mx-auto w-full max-w-md">
      <CardHeader>
        <CardTitle>Entrar</CardTitle>
        <CardDescription>Acesse sua conta na plataforma de mentoria.</CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-4" onSubmit={onSubmit}>
          <div className="space-y-2">
            <Label htmlFor="email">E-mail</Label>
            <Input id="email" type="email" autoComplete="email" {...register('email')} />
            {errors.email ? (
              <p className="text-sm text-destructive">{errors.email.message}</p>
            ) : null}
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Senha</Label>
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              {...register('password')}
            />
            {errors.password ? (
              <p className="text-sm text-destructive">{errors.password.message}</p>
            ) : null}
          </div>
          <Button type="submit" className="w-full" disabled={submitting}>
            {submitting ? 'Entrando...' : 'Entrar'}
          </Button>
          <p className="text-center text-sm text-muted-foreground">
            Ainda nao tem conta?{' '}
            <NavLink href="/cadastro" className="text-primary underline-offset-4 hover:underline">
              Cadastre-se
            </NavLink>
          </p>
        </form>
      </CardContent>
    </Card>
  );
}
