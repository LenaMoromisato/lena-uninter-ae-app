'use client';

import { ApiClientError } from '@core/api/api-client';
import { updateProfileSchema, type UpdateProfileInput } from '@features/users/dto/user.dto';
import { updateMe } from '@features/users/api/users';
import { useSession } from '@features/auth/contexts/session-provider';
import { Button } from '@shadcn/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@shadcn/ui/card';
import { Input } from '@shadcn/ui/input';
import { Label } from '@shadcn/ui/label';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

export function ProfileForm() {
  const { session, setSession } = useSession();
  const [submitting, setSubmitting] = useState(false);
  const user = session?.user;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<UpdateProfileInput>({
    resolver: zodResolver(updateProfileSchema),
    values: {
      firstName: user?.firstName ?? '',
      lastName: user?.lastName ?? '',
      linkedinUrl: user?.linkedinUrl ?? '',
      profile: {
        workArea: user?.profile?.workArea ?? '',
        experienceYears: user?.profile?.experienceYears ?? undefined,
        programmingLanguages: user?.profile?.programmingLanguages ?? [],
      },
    },
  });

  const onSubmit = handleSubmit(async (values) => {
    if (!session) return;
    setSubmitting(true);
    try {
      const langsInput = (document.getElementById('languages') as HTMLInputElement | null)?.value;
      const programmingLanguages = langsInput
        ? langsInput.split(',').map((s) => s.trim()).filter(Boolean)
        : values.profile?.programmingLanguages;

      const updated = await updateMe(session.accessToken, {
        ...values,
        profile: {
          ...values.profile,
          programmingLanguages,
        },
      });
      setSession({ ...session, user: updated });
      toast.success('Perfil atualizado.');
    } catch (error) {
      const message =
        error instanceof ApiClientError ? error.message : 'Nao foi possivel salvar o perfil.';
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Meu perfil</CardTitle>
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
            <Label htmlFor="linkedinUrl">LinkedIn</Label>
            <Input id="linkedinUrl" {...register('linkedinUrl')} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="workArea">Area de atuacao</Label>
            <Input id="workArea" {...register('profile.workArea')} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="experienceYears">Anos de experiencia</Label>
            <Input
              id="experienceYears"
              type="number"
              min={0}
              {...register('profile.experienceYears', { valueAsNumber: true })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="languages">Linguagens (separadas por virgula)</Label>
            <Input
              id="languages"
              defaultValue={user?.profile?.programmingLanguages?.join(', ') ?? ''}
            />
          </div>
          <Button type="submit" disabled={submitting}>
            {submitting ? 'Salvando...' : 'Salvar perfil'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
