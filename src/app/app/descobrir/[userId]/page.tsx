import { UserProfileScreen } from '@features/mentorship/components/mentorship-screen';

type UserProfilePageProps = {
  params: Promise<{ userId: string }>;
};

export default async function UserProfilePage({ params }: UserProfilePageProps) {
  const { userId } = await params;
  return <UserProfileScreen userId={userId} />;
}
