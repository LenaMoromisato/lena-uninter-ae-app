import { ProfileForm } from '@features/users/components/profile-form';
import { PageHeader } from '@ui/page-header';

export default function ProfilePage() {
  return (
    <div>
      <PageHeader title="Perfil" description="Mantenha seus dados atualizados para melhorar as conexoes." />
      <ProfileForm />
    </div>
  );
}
