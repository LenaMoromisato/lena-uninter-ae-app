import { RoleFormScreen } from '@features/rbac/components/role-form-screen';

type PageProps = {
  params: Promise<{ roleId: string }>;
};

export default async function AdminRoleDetailPage({ params }: PageProps) {
  const { roleId } = await params;
  return <RoleFormScreen roleId={roleId} />;
}
