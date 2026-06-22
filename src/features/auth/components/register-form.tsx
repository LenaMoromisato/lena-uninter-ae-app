'use client';

import { ApiClientError } from '@core/api/api-client';
import { registerSchema, type RegisterInput } from '@features/auth/dto/auth.dto';
import { useSession } from '@features/auth/contexts/session-provider';
import { Button } from '@shadcn/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@shadcn/ui/card';
import { Input } from '@shadcn/ui/input';
import { Label } from '@shadcn/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@shadcn/ui/select';
import { deferredRouterPush } from '@features/auth/utils/deferred-router-navigation';
import { NavLink } from '@ui/nav-link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';

export function RegisterForm() {
  const router = useRouter();
  const { register: registerUser } = useSession();
  const [submitting, setSubmitting] = useState(false);
  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterInput>({
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      roleCode: 'STUDENT',
      profile: { programmingLanguages: [], workArea: '' },
    },
  });

  const onSubmit = handleSubmit(async (values: RegisterInput) => {
    setSubmitting(true);
    try {
      const langsInput = (document.getElementById('languages') as HTMLInputElement | null)?.value;
      const programmingLanguages = langsInput
        ? langsInput.split(',').map((s) => s.trim()).filter(Boolean)
        : values.profile?.programmingLanguages;

      const payload = registerSchema.parse({
        ...values,
        profile:
          values.profile?.workArea || programmingLanguages?.length
            ? {
                workArea: values.profile?.workArea || undefined,
                programmingLanguages,
              }
            : undefined,
      });
      await registerUser(payload);
      toast.success('Conta criada com sucesso.');
      deferredRouterPush(router, '/app');
    } catch (error) {
      const message =
        error instanceof ApiClientError ? error.message : 'Nao foi possivel cadastrar.';
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  });

  return (
    <Card className="mx-auto w-full max-w-lg">
      <CardHeader>
        <CardTitle>Criar conta</CardTitle>
        <CardDescription>Junte-se a comunidade de mentoria em tecnologia.</CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-4" onSubmit={onSubmit}>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="firstName">Nome</Label>
              <Input id="firstName" {...register('firstName')} />
              {errors.firstName ? (
                <p className="text-sm text-destructive">{errors.firstName.message}</p>
              ) : null}
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Sobrenome</Label>
              <Input id="lastName" {...register('lastName')} />
              {errors.lastName ? (
                <p className="text-sm text-destructive">{errors.lastName.message}</p>
              ) : null}
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">E-mail</Label>
            <Input id="email" type="email" autoComplete="email" {...register('email')} />
            {errors.email ? (
              <p className="text-sm text-destructive">{errors.email.message}</p>
            ) : null}
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Senha</Label>
            <Input id="password" type="password" autoComplete="new-password" {...register('password')} />
            {errors.password ? (
              <p className="text-sm text-destructive">{errors.password.message}</p>
            ) : null}
          </div>
          <div className="space-y-2">
            <Label>Tipo de conta</Label>
            <Controller
              control={control}
              name="roleCode"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="STUDENT">Aluna</SelectItem>
                    <SelectItem value="MENTOR">Mentora</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="workArea">Area de atuacao (opcional)</Label>
            <Input id="workArea" {...register('profile.workArea')} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="languages">Linguagens (opcional, separadas por virgula)</Label>
            <Input id="languages" placeholder="TypeScript, Python" />
          </div>
          <Button type="submit" className="w-full" disabled={submitting}>
            {submitting ? 'Criando conta...' : 'Criar conta'}
          </Button>
          <p className="text-center text-sm text-muted-foreground">
            Ja tem conta?{' '}
            <NavLink href="/entrar" className="text-primary underline-offset-4 hover:underline">
              Entrar
            </NavLink>
          </p>
        </form>
      </CardContent>
    </Card>
  );
}
